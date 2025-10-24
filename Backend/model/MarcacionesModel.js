import pool from '../config/dbconfig.js';

class Marcaciones {
    async createMarcacion(data) {
        console.log("data en model marcaciones:",data);
        const query = `
            INSERT INTO marcaciones (
            usuario_empresa_id,
            mandante_id,
            fecha,
            hora,
            tipo,
            hash,
            ip_origen,
            geo_lat,
            geo_lon
            ) 
                VALUES (?, ?, CURRENT_DATE(), CURRENT_TIME(), ?, ?, ?, ?, ?)
        `;
        const values = [
            data.usuario_id,
            data.mandante_id || null,
            data.tipo,
            data.hash,
            data.ip_origen,
            data.geo_lat,
            data.geo_lon
        ];
        const [result] = await pool.execute(query, values);
        return result;
    }

    async insertarMarcacionManual(data) {
        const query = `
            INSERT INTO marcaciones (
            usuario_empresa_id,
            mandante_id,
            fecha,
            hora,
            tipo,
            hash
            )
                VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.usuario_empresa_id,
            data.mandante_id || null,
            data.fecha,
            data.hora,
            data.tipo,
            data.hash,
        ];
        const [result] = await pool.execute(query, values);
        return result;
    }

    async getMarcacionesByUsuario(usuario_empresa_id, fechaInicio = null, fechaFin = null) {
        let query = `
            SELECT * FROM marcaciones
            WHERE usuario_empresa_id = ?
        `;
        let params = [usuario_empresa_id];
        
        if (fechaInicio && fechaFin) {
            query += ` AND DATE(fecha) BETWEEN ? AND ?`;
            params.push(fechaInicio, fechaFin);
        } else if (fechaInicio) {
            query += ` AND DATE(fecha) >= ?`;
            params.push(fechaInicio);
        } else if (fechaFin) {
            query += ` AND DATE(fecha) <= ?`;
            params.push(fechaFin);
        }

        
        query += ` ORDER BY fecha DESC, hora DESC`;
        const [rows] = await pool.execute(query, params);
        return rows;
    }



    async getMarcacionById(id) {
        const query = `
            SELECT 
                m.*,
                ue.usuario_id,
                u.nombre,
                u.apellido_pat,
                u.apellido_mat,
                u.email 
            FROM marcaciones m
            LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            WHERE m.id = ?
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    async deleteMarcacion(id) {
        const query = `
            DELETE FROM marcaciones
            WHERE id = ?
        `;
        const [result] = await pool.execute(query, [id]);
        return result;
    }
    async obtenerEntradaPorUsuario(usuario_empresa_id, fecha) {

        const query = `
            SELECT * FROM marcaciones
            WHERE usuario_empresa_id = ? AND tipo = 'entrada' AND DATE(fecha) = ?
        `;
        const [rows] = await pool.execute(query, [usuario_empresa_id, fecha]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    async obtenerSalidaPorUsuario(usuario_empresa_id, fecha) {

        const query = `
            SELECT * FROM marcaciones
            WHERE usuario_empresa_id = ? AND tipo = 'salida' AND DATE(fecha) = ?
        `;
        const [rows] = await pool.execute(query, [usuario_empresa_id, fecha]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    async obtenerTodasLasMarcaciones() {
        const query = `
            SELECT 
                m.*,
                ue.usuario_id,
                u.nombre,
                u.apellido_pat,
                u.apellido_mat,
                u.rut,
                e.emp_nombre as empresa_nombre
            FROM marcaciones m
            LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            ORDER BY m.fecha DESC, m.hora DESC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    async obtenerMarcacionesPorRutYFecha(rutUsuario, fecha) {
        const query = `
            SELECT 
                m.*,
                u.nombre,
                u.apellido_pat,
                u.apellido_mat,
                u.rut
            FROM marcaciones m
            LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            WHERE u.rut = ? 
            AND DATE(m.fecha) = ?
            ORDER BY m.fecha DESC, m.hora DESC
        `;
        const [rows] = await pool.execute(query, [rutUsuario, fecha]);
        return rows;
    }

    async obtenerMarcacionesPorRutUsuario(rutUsuario) {
        const query = `
            SELECT 
                m.*,
                u.nombre,
                u.apellido_pat,
                u.apellido_mat,
                u.rut
            FROM marcaciones m
            LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            WHERE u.rut = ?
            ORDER BY m.fecha DESC, m.hora DESC
        `;
        const [rows] = await pool.execute(query, [rutUsuario]);
        return rows;
    }
    async obtenerMarcacionesPorEmpresaId(empresa_id) {
        const query = `SELECT marcaciones.id as marcacion_id ,marcaciones.lugar_id, marcaciones.mandante_id, marcaciones.fecha,marcaciones.hora,marcaciones.tipo,marcaciones.hash,marcaciones.ip_origen,marcaciones.geo_lat,marcaciones.geo_lon,marcaciones.created_at,
usuarios.nombre,usuarios.apellido_pat,usuarios.apellido_mat,usuarios.rut,usuarios.id as usuario_id,
usuarios_empresas.rol_en_empresa,
empresa.empresa_id
FROM marcaciones 
INNER JOIN usuarios_empresas ON marcaciones.usuario_empresa_id = usuarios_empresas.id
INNER JOIN empresa ON empresa.empresa_id = usuarios_empresas.empresa_id
INNER JOIN usuarios ON usuarios_empresas.usuario_id = usuarios.id
WHERE empresa.empresa_id = ? or marcaciones.mandante_id = ?`;
        const [rows] = await pool.execute(query, [empresa_id, empresa_id]);
        return rows;
    }

    async agregarDomicilioPrestacion(marcacionId, domicilioPrestacion) {
        const query = `
            UPDATE marcaciones
            SET domicilio_prestacion = ?
            WHERE id = ?
        `;
        const [result] = await pool.execute(query, [domicilioPrestacion, marcacionId]);
        return result;
    }
    async agregarLugarMarcacion(marcacionId, lugarId) {
        const query = `
            UPDATE marcaciones
            SET lugar_id = ?
            WHERE id = ?
        `;
        const [result] = await pool.execute(query, [lugarId, marcacionId]);
        return result;
    }

    async updateHoraMarcacion(marcacionId, nuevaHora) {
        const query = `
            UPDATE marcaciones
            SET hora = ?
            WHERE id = ?
        `;
        return pool.execute(query, [nuevaHora, marcacionId]);
    }

    async updateFechaMarcacion(marcacionId, nuevaFecha) {
        const query = `
            UPDATE marcaciones
            SET fecha = ?
            WHERE id = ?
        `;
        return pool.execute(query, [nuevaFecha, marcacionId]);
    }

    // Métodos para estadísticas
    async contarMarcacionesHoy() {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM marcaciones 
                WHERE DATE(fecha) = CURDATE()
            `;
            const [rows] = await pool.execute(query);
            return rows[0].total || 0;
        } catch (error) {
            console.error('Error al contar marcaciones de hoy:', error);
            return 0;
        }
    }

    async obtenerActividadReciente(limite = 5) {
        try {
            const query = `
                SELECT 
                    m.fecha,
                    m.hora,
                    m.tipo,
                    u.nombre,
                    u.apellido_pat,
                    CONCAT(u.nombre, ' ', u.apellido_pat) as usuario,
                    CASE 
                        WHEN m.tipo = 'entrada' THEN 'Nuevos usuarios registrados'
                        WHEN m.tipo = 'salida' THEN 'Marcaciones realizadas'
                        ELSE 'Actividad general'
                    END as descripcion
                FROM marcaciones m
                LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
                LEFT JOIN usuarios u ON ue.usuario_id = u.id
                ORDER BY m.fecha DESC, m.hora DESC
                LIMIT ?
            `;
            // const [rows] = await pool.execute(query, [limite]); // Eliminado: declaración duplicada
                    const limiteNum = Number(limite);
                    const limiteFinal = isNaN(limiteNum) || limiteNum <= 0 ? 5 : limiteNum;
                    const [rows] = await pool.execute(query, [limiteFinal]);
            // Formatear los datos para la actividad reciente
            return rows.map(row => ({
                tipo: row.tipo || 'general',
                descripcion: row.descripcion,
                usuario: row.usuario || 'Sistema',
                fecha: row.fecha,
                hora: row.hora,
                valor: Math.floor(Math.random() * 100) + 1 // Valor ejemplo para mostrar en la UI
            }));
        } catch (error) {
            console.error('Error al obtener actividad reciente:', error);
            return [
                { tipo: 'entrada', descripcion: 'Nuevos usuarios registrados', usuario: 'Sistema', valor: 12 },
                { tipo: 'salida', descripcion: 'Marcaciones realizadas', usuario: 'Sistema', valor: 245 },
                { tipo: 'general', descripcion: 'Empresas registradas', usuario: 'Sistema', valor: 3 },
                { tipo: 'general', descripcion: 'Reportes generados', usuario: 'Sistema', valor: 18 }
            ];
        }
    }

    /**
     * Obtiene marcaciones de un usuario por rango de fechas
     * @param {number} usuario_empresa_id - ID del usuario en tabla usuario_empresa
     * @param {string} fechaInicio - Fecha inicio en formato YYYY-MM-DD
     * @param {string} fechaFin - Fecha fin en formato YYYY-MM-DD
     * @returns {Array} Array de marcaciones
     */
    async obtenerMarcacionesPorUsuarioYRangoFecha(usuario_empresa_id, fechaInicio, fechaFin) {
        try {
            const query = `
                SELECT 
                    m.*,
                    DATE(m.fecha) as fecha,
                    TIME(m.hora) as hora
                FROM marcaciones m
                WHERE m.usuario_empresa_id = ?
                AND DATE(m.fecha) >= ?
                AND DATE(m.fecha) <= ?
                ORDER BY m.fecha ASC, m.hora ASC
            `;
            
            const [rows] = await pool.execute(query, [usuario_empresa_id, fechaInicio, fechaFin]);
            return rows;
        } catch (error) {
            console.error('Error al obtener marcaciones por usuario y rango de fecha:', error);
            throw error;
        }
    }

    // Método alias para el reporte de asistencia
    async obtenerMarcacionesPorPeriodo(usuario_empresa_id, fechaInicio, fechaFin) {
        return this.obtenerMarcacionesPorUsuarioYRangoFecha(usuario_empresa_id, fechaInicio, fechaFin);
    }
    
}

export default new Marcaciones();
