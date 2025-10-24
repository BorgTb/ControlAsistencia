import pool from '../config/dbconfig.js';
import { DateTime } from 'luxon';

class JustificacionesModel {
    /**
     * Crear una nueva justificación con rango de fechas
     */
    async crearJustificacion(data) {
        const query = `
            INSERT INTO justificaciones_ausencias (
                usuario_empresa_id,
                fecha_inicio,
                fecha_fin,
                tipo_justificacion,
                motivo,
                archivo_url,
                archivo_nombre,
                estado,
                fecha_solicitud
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', NOW())
        `;
        
        const values = [
            data.usuario_empresa_id,
            data.fecha_inicio,
            data.fecha_fin,
            data.tipo_justificacion,
            data.motivo || null,
            data.archivo_url || null,
            data.archivo_nombre || null
        ];
        
        const [result] = await pool.execute(query, values);
        return result;
    }

    /**
     * Generar días individuales de una justificación aprobada
     */
    async generarDiasJustificacion(justificacion_id, usuario_empresa_id, fecha_inicio, fecha_fin) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Generar lista de fechas del rango (solo días laborales o todos según configuración)
            const fechas = this.generarRangoFechas(fecha_inicio, fecha_fin);
            
            // Insertar cada día en justificaciones_dias
            const insertQuery = `
                INSERT IGNORE INTO justificaciones_dias (
                    justificacion_id,
                    usuario_empresa_id,
                    fecha
                ) VALUES (?, ?, ?)
            `;

            for (const fecha of fechas) {
                await connection.execute(insertQuery, [
                    justificacion_id,
                    usuario_empresa_id,
                    fecha
                ]);
            }

            await connection.commit();
            return fechas.length;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Generar array de fechas entre dos fechas (inclusivo)
     */
    generarRangoFechas(fecha_inicio, fecha_fin) {
        const fechas = [];
        let current = DateTime.fromISO(fecha_inicio, { zone: 'America/Santiago' });
        const end = DateTime.fromISO(fecha_fin, { zone: 'America/Santiago' });

        while (current <= end) {
            fechas.push(current.toISODate());
            current = current.plus({ days: 1 });
        }

        return fechas;
    }

    /**
     * Eliminar días de una justificación (al rechazar o eliminar)
     */
    async eliminarDiasJustificacion(justificacion_id) {
        const query = `DELETE FROM justificaciones_dias WHERE justificacion_id = ?`;
        const [result] = await pool.execute(query, [justificacion_id]);
        return result;
    }

    /**
     * Obtener justificaciones de un usuario
     */
    async obtenerJustificacionesUsuario(usuario_empresa_id, params = {}) {
        let query = `
            SELECT 
                j.*,
                CONCAT(u.nombre, ' ', u.apellido_pat, ' ', COALESCE(u.apellido_mat, '')) as usuario_nombre,
                CONCAT(u_aprobo.nombre, ' ', u_aprobo.apellido_pat, ' ', COALESCE(u_aprobo.apellido_mat, '')) as aprobado_por_nombre,
                DATEDIFF(j.fecha_fin, j.fecha_inicio) + 1 as dias_totales,
                (SELECT COUNT(*) FROM justificaciones_dias jd 
                 WHERE jd.justificacion_id = j.id) as dias_generados
            FROM justificaciones_ausencias j
            INNER JOIN usuarios_empresas ue ON j.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN usuarios u_aprobo ON j.aprobado_por = u_aprobo.id
            WHERE j.usuario_empresa_id = ?
        `;
        
        const values = [usuario_empresa_id];

        // Filtros opcionales
        if (params.estado) {
            query += ` AND j.estado = ?`;
            values.push(params.estado);
        }

        if (params.tipo_justificacion) {
            query += ` AND j.tipo_justificacion = ?`;
            values.push(params.tipo_justificacion);
        }

        // Filtrar por fecha específica exacta
        if (params.fecha) {
            query += ` AND ? BETWEEN j.fecha_inicio AND j.fecha_fin`;
            values.push(params.fecha);
        }

        if (params.mes && params.anio) {
            // Buscar justificaciones que incluyan días del mes especificado
            query += ` AND (
                (YEAR(j.fecha_inicio) = ? AND MONTH(j.fecha_inicio) = ?) OR
                (YEAR(j.fecha_fin) = ? AND MONTH(j.fecha_fin) = ?) OR
                (j.fecha_inicio <= LAST_DAY(CONCAT(?, '-', LPAD(?, 2, '0'), '-01')) 
                 AND j.fecha_fin >= CONCAT(?, '-', LPAD(?, 2, '0'), '-01'))
            )`;
            values.push(params.anio, params.mes, params.anio, params.mes, 
                       params.anio, params.mes, params.anio, params.mes);
        }

        // Filtrar por rango de fechas específico
        if (params.fecha_inicio && params.fecha_fin) {
            query += ` AND j.fecha_inicio <= ? AND j.fecha_fin >= ?`;
            values.push(params.fecha_fin, params.fecha_inicio);
        }

        query += ` ORDER BY j.fecha_inicio DESC, j.fecha_solicitud DESC`;

        const [rows] = await pool.execute(query, values);
        return rows;
    }

    /**
     * Obtener justificación por ID
     */
    async obtenerJustificacionPorId(id) {
        const query = `
            SELECT 
                j.*,
                CONCAT(u.nombre, ' ', u.apellido_pat, ' ', COALESCE(u.apellido_mat, '')) as usuario_nombre,
                u.rut as usuario_rut,
                CONCAT(u_aprobo.nombre, ' ', u_aprobo.apellido_pat, ' ', COALESCE(u_aprobo.apellido_mat, '')) as aprobado_por_nombre,
                DATEDIFF(j.fecha_fin, j.fecha_inicio) + 1 as dias_totales
            FROM justificaciones_ausencias j
            INNER JOIN usuarios_empresas ue ON j.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN usuarios u_aprobo ON j.aprobado_por = u_aprobo.id
            WHERE j.id = ?
        `;
        
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    /**
     * Verificar si existe justificación que solape con un rango de fechas
     */
    async existeJustificacionEnRango(usuario_empresa_id, fecha_inicio, fecha_fin, excluir_id = null) {
        let query = `
            SELECT COUNT(*) as total 
            FROM justificaciones_ausencias 
            WHERE usuario_empresa_id = ? 
            AND estado != 'RECHAZADA'
            AND (
                (fecha_inicio <= ? AND fecha_fin >= ?) OR
                (fecha_inicio <= ? AND fecha_fin >= ?) OR
                (fecha_inicio >= ? AND fecha_fin <= ?)
            )
        `;
        
        const values = [
            usuario_empresa_id,
            fecha_fin, fecha_inicio,
            fecha_inicio, fecha_inicio,
            fecha_inicio, fecha_fin
        ];

        if (excluir_id) {
            query += ` AND id != ?`;
            values.push(excluir_id);
        }
        
        const [rows] = await pool.execute(query, values);
        return rows[0].total > 0;
    }

    /**
     * Verificar si un día específico está justificado
     */
    async diaEstaJustificado(usuario_empresa_id, fecha) {
        const query = `
            SELECT jd.*, ja.tipo_justificacion, ja.estado
            FROM justificaciones_dias jd
            INNER JOIN justificaciones_ausencias ja ON jd.justificacion_id = ja.id
            WHERE jd.usuario_empresa_id = ? 
            AND jd.fecha = ?
            AND ja.estado = 'APROBADA'
        `;
        
        const [rows] = await pool.execute(query, [usuario_empresa_id, fecha]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Obtener días justificados en un rango
     */
    async obtenerDiasJustificadosEnRango(usuario_empresa_id, fecha_inicio, fecha_fin) {
        const query = `
            SELECT jd.fecha, ja.tipo_justificacion, ja.motivo
            FROM justificaciones_dias jd
            INNER JOIN justificaciones_ausencias ja ON jd.justificacion_id = ja.id
            WHERE jd.usuario_empresa_id = ? 
            AND jd.fecha BETWEEN ? AND ?
            AND ja.estado = 'APROBADA'
            ORDER BY jd.fecha
        `;
        
        const [rows] = await pool.execute(query, [usuario_empresa_id, fecha_inicio, fecha_fin]);
        return rows;
    }

    /**
     * Actualizar estado de justificación y generar/eliminar días según corresponda
     */
    async actualizarEstadoJustificacion(id, estado, aprobado_por, observaciones = null) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Obtener datos de la justificación
            const [justificacion] = await connection.execute(
                `SELECT * FROM justificaciones_ausencias WHERE id = ?`,
                [id]
            );

            if (justificacion.length === 0) {
                throw new Error('Justificación no encontrada');
            }

            const justi = justificacion[0];

            // Actualizar estado
            await connection.execute(
                `UPDATE justificaciones_ausencias 
                 SET estado = ?, 
                     aprobado_por = ?, 
                     fecha_aprobacion = NOW(),
                     observaciones = ?
                 WHERE id = ?`,
                [estado, aprobado_por, observaciones, id]
            );

            // Si se aprueba, generar días
            if (estado === 'APROBADA') {
                const fechas = this.generarRangoFechas(justi.fecha_inicio, justi.fecha_fin);
                
                const insertQuery = `
                    INSERT IGNORE INTO justificaciones_dias (
                        justificacion_id,
                        usuario_empresa_id,
                        fecha
                    ) VALUES (?, ?, ?)
                `;

                for (const fecha of fechas) {
                    await connection.execute(insertQuery, [
                        id,
                        justi.usuario_empresa_id,
                        fecha
                    ]);
                }
            } else if (estado === 'RECHAZADA') {
                // Si se rechaza, eliminar días si existieran
                await connection.execute(
                    `DELETE FROM justificaciones_dias WHERE justificacion_id = ?`,
                    [id]
                );
            }

            await connection.commit();
            return { affectedRows: 1 };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar justificación
     */
    async eliminarJustificacion(id) {
        // El CASCADE en la FK eliminará automáticamente los días asociados
        const query = `DELETE FROM justificaciones_ausencias WHERE id = ?`;
        const [result] = await pool.execute(query, [id]);
        return result;
    }

    /**
     * Obtener justificaciones pendientes de una empresa
     */
    async obtenerJustificacionesPendientes(mandante_id, limit = 50, soloEPendientes = true) {
        const limitValue = parseInt(limit, 10);
        let whereClause = `WHERE ue.empresa_id = ?`;
        
        if (soloEPendientes) {
            whereClause += ` AND j.estado = 'PENDIENTE'`;
        }
        
        const query = `
            SELECT 
                j.*,
                CONCAT(u.nombre, ' ', u.apellido_pat, ' ', COALESCE(u.apellido_mat, '')) as usuario_nombre,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                DATEDIFF(j.fecha_fin, j.fecha_inicio) + 1 as dias_totales
            FROM justificaciones_ausencias j
            INNER JOIN usuarios_empresas ue ON j.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            ${whereClause}
            ORDER BY j.fecha_solicitud DESC
            LIMIT ${limitValue}
        `;
        
        const [rows] = await pool.execute(query, [mandante_id]);
        return rows;
    }

    /**
     * Obtener estadísticas de justificaciones
     */
    async obtenerEstadisticas(usuario_empresa_id, mes, anio) {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'APROBADA' THEN 1 ELSE 0 END) as aprobadas,
                SUM(CASE WHEN estado = 'RECHAZADA' THEN 1 ELSE 0 END) as rechazadas,
                SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'APROBADA' 
                    THEN DATEDIFF(fecha_fin, fecha_inicio) + 1 
                    ELSE 0 END) as dias_aprobados
            FROM justificaciones_ausencias
            WHERE usuario_empresa_id = ?
            AND (
                (YEAR(fecha_inicio) = ? AND MONTH(fecha_inicio) = ?) OR
                (YEAR(fecha_fin) = ? AND MONTH(fecha_fin) = ?) OR
                (fecha_inicio <= LAST_DAY(CONCAT(?, '-', LPAD(?, 2, '0'), '-01')) 
                 AND fecha_fin >= CONCAT(?, '-', LPAD(?, 2, '0'), '-01'))
            )
        `;
        
        const [rows] = await pool.execute(query, [
            usuario_empresa_id,
            anio, mes, anio, mes,
            anio, mes, anio, mes
        ]);
        return rows[0];
    }

    /**
     * Obtener todas las justificaciones que afectan a un mes específico
     */
    async obtenerJustificacionesMes(usuario_empresa_id, mes, anio) {
        const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`;
        const ultimoDia = DateTime.fromObject({ year: anio, month: mes, day: 1 })
            .endOf('month')
            .toISODate();

        const query = `
            SELECT 
                j.*,
                DATEDIFF(j.fecha_fin, j.fecha_inicio) + 1 as dias_totales
            FROM justificaciones_ausencias j
            WHERE j.usuario_empresa_id = ?
            AND j.estado = 'APROBADA'
            AND j.fecha_inicio <= ?
            AND j.fecha_fin >= ?
            ORDER BY j.fecha_inicio
        `;
        
        const [rows] = await pool.execute(query, [usuario_empresa_id, ultimoDia, primerDia]);
        return rows;
    }
}

export default new JustificacionesModel();
