import pool from '../config/dbconfig.js';
import { DateTime } from 'luxon';

class AsignacionTurnosModel {
    static async getAll() {
        const query = `
            SELECT 
                at.*,
                tt.nombre as tipo_turno_nombre,
                tt.hora_inicio,
                tt.hora_fin,
                tt.colacion_inicio,
                tt.colacion_fin,
                tt.dias_trabajo,
                tt.dias_descanso,
                ue.usuario_id,
                u.nombre as usuario_nombre,
                u.apellido_pat,
                u.apellido_mat,
                u.rut,
                e.emp_nombre as empresa_nombre
            FROM asignacion_turnos at
            INNER JOIN tipo_turnos tt ON at.tipo_turno_id = tt.id
            INNER JOIN usuarios_empresas ue ON at.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            ORDER BY at.fecha_inicio DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async getById(id) {
        const query = `
            SELECT 
                at.*,
                tt.nombre as tipo_turno_nombre,
                tt.hora_inicio,
                tt.hora_fin,
                tt.colacion_inicio,
                tt.colacion_fin,
                tt.dias_trabajo,
                tt.dias_descanso
            FROM asignacion_turnos at
            INNER JOIN tipo_turnos tt ON at.tipo_turno_id = tt.id
            WHERE at.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    static async getByUsuarioEmpresaId(usuarioEmpresaId) {
        const query = `
            SELECT 
                at.*,
                tt.nombre as tipo_turno_nombre,
                tt.descripcion as tipo_turno_descripcion,
                tt.hora_inicio,
                tt.hora_fin,
                tt.colacion_inicio,
                tt.colacion_fin,
                tt.dias_trabajo,
                tt.dias_descanso
            FROM asignacion_turnos at
            INNER JOIN tipo_turnos tt ON at.tipo_turno_id = tt.id
            WHERE at.usuario_empresa_id = ?
            ORDER BY at.fecha_inicio DESC
        `;
        const [rows] = await pool.query(query, [usuarioEmpresaId]);
        return rows;
    }

    static async getActivoByUsuarioEmpresaId(usuarioEmpresaId, fecha = null) {
        const fechaBusqueda = fecha || DateTime.now().setZone('America/Santiago').toISODate();
        
        const query = `
            SELECT 
                at.*,
                tt.nombre as tipo_turno_nombre,
                tt.hora_inicio as turno_hora_inicio,
                tt.hora_fin as turno_hora_fin,
                tt.colacion_inicio,
                tt.colacion_fin,
                tt.dias_trabajo,
                tt.dias_descanso,
                dd.dia_semana,
                dd.trabaja,
                dd.hora_inicio as dia_hora_inicio,
                dd.hora_fin as dia_hora_fin,
                tj.nombre as tipo_jornada_nombre
            FROM asignacion_turnos at
            INNER JOIN tipo_turnos tt ON at.tipo_turno_id = tt.id
            LEFT JOIN detalle_dias_turno dd ON tt.id = dd.tipo_turno_id
            LEFT JOIN tipo_jornada tj on tt.tipo_jornada_id = tj.id
            WHERE at.usuario_empresa_id = ?
            AND at.estado = 'activo'
            AND at.fecha_inicio <= ?
            AND (at.fecha_fin IS NULL OR at.fecha_fin >= ?)
            ORDER BY at.fecha_inicio DESC
        `;
        const [rows] = await pool.query(query, [usuarioEmpresaId, fechaBusqueda, fechaBusqueda]);
    
        if (rows.length > 0) {
            // Obtener el día de la semana de la fecha
            const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const fechaObj = new Date(fechaBusqueda + 'T00:00:00');
            const diaSemana = diasSemana[fechaObj.getDay()];
            // Buscar la configuración del día en detalle_dias_turno
            const diaConfig = rows.find(r => r.dia_semana === diaSemana);
            
            // Si el día no existe en detalle_dias_turno, no es día laborable
            if (!diaConfig) {
                return null;
            }
            
            // Si el día está marcado como no laborable (trabaja = false)
            if (!diaConfig.trabaja) {
                return null;
            }
            
            // El día es laborable, retornar con horarios específicos o base
            return {
                ...rows[0],
                hora_inicio: diaConfig.dia_hora_inicio || rows[0].turno_hora_inicio,
                hora_fin: diaConfig.dia_hora_fin || rows[0].turno_hora_fin,
                dia_semana: diaSemana,
                trabaja: true
            };
        }
        
        return null;
    }

    static async create(data) {
        const query = `
            INSERT INTO asignacion_turnos (usuario_empresa_id, tipo_turno_id, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            data.usuario_empresa_id,
            data.tipo_turno_id,
            data.fecha_inicio,
            data.fecha_fin || null,
            data.estado || 'activo'
        ]);
        return result.insertId;
    }

    static async update(id, data) {
        const query = `
            UPDATE asignacion_turnos 
            SET tipo_turno_id = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [
            data.tipo_turno_id,
            data.fecha_inicio,
            data.fecha_fin || null,
            data.estado || 'activo',
            id
        ]);
        return result.affectedRows;
    }

    static async finalizar(id, fechaFin = null) {
        const fecha = fechaFin || DateTime.now().setZone('America/Santiago').toISODate();
        const query = `
            UPDATE asignacion_turnos 
            SET fecha_fin = ?, estado = 'finalizado'
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [fecha, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const fechaActual = DateTime.now().setZone('America/Santiago').toISODate();
        const query = `
            UPDATE asignacion_turnos 
            SET fecha_fin = ?, estado = 'finalizado'
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [fechaActual, id]);
        return result.affectedRows;
    }

    static async getByEmpresaRut(rutEmpresa) {
        const query = `
            SELECT 
                at.*,
                tt.nombre as tipo_turno_nombre,
                tt.hora_inicio,
                tt.hora_fin,
                tt.colacion_inicio,
                tt.colacion_fin,
                tt.dias_trabajo,
                tt.dias_descanso,
                ue.usuario_id,
                u.nombre as usuario_nombre,
                u.apellido_pat,
                u.apellido_mat,
                u.rut
            FROM asignacion_turnos at
            INNER JOIN tipo_turnos tt ON at.tipo_turno_id = tt.id
            INNER JOIN usuarios_empresas ue ON at.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE e.emp_rut = ?
            ORDER BY at.fecha_inicio DESC
        `;
        const [rows] = await pool.query(query, [rutEmpresa]);
        return rows;
    }

    static async getDiasLaborablesByTipoTurno(tipoTurnoId) {
        const query = `
            SELECT dia_semana, trabaja, hora_inicio, hora_fin
            FROM detalle_dias_turno
            WHERE tipo_turno_id = ?
            ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
        `;
        const [rows] = await pool.query(query, [tipoTurnoId]);
        return rows;
    }

    static async getTurnosByUsuarioEmpresa(usuarioEmpresaId) {
        const query = `
            SELECT 
                at.*,
                tt.nombre as tipo_turno_nombre,
                tt.hora_inicio,
                tt.hora_fin,
                tt.colacion_inicio,
                tt.colacion_fin,
                tt.dias_trabajo,
                tt.dias_descanso,
                tt.tipo_jornada_id,
                tj.nombre as tipo_jornada_nombre
            FROM asignacion_turnos at
            INNER JOIN tipo_turnos tt ON at.tipo_turno_id = tt.id
            LEFT JOIN tipo_jornada tj ON tt.tipo_jornada_id = tj.id
            WHERE at.usuario_empresa_id = ?
            AND at.estado = 'activo'
            ORDER BY at.fecha_inicio DESC
        `;
        const [rows] = await pool.query(query, [usuarioEmpresaId]);
        return rows;
    }

    /**
     * Modifica un turno existente invalidando el anterior y creando uno nuevo
     * @param {number} turnoId - ID del turno a modificar
     * @param {object} nuevosDatos - Datos del nuevo turno
     * @returns {object} - { turnoAnteriorId, nuevoTurnoId }
     */
    static async modificarTurno(turnoId, nuevosDatos) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Obtener el turno actual
            const [turnoActual] = await connection.query(
                'SELECT * FROM asignacion_turnos WHERE id = ?',
                [turnoId]
            );

            if (turnoActual.length === 0) {
                throw new Error('Turno no encontrado');
            }

            const turno = turnoActual[0];

            // Invalidar el turno actual estableciendo fecha_fin = hoy y estado = 'modificado'
            const fechaActual = DateTime.now().setZone('America/Santiago').toISODate();
            await connection.query(
                `UPDATE asignacion_turnos 
                 SET fecha_fin = ?, estado = 'modificado', updated_at = NOW()
                 WHERE id = ?`,
                [fechaActual, turnoId]
            );

            // Crear el nuevo turno con los datos actualizados
            const [result] = await connection.query(
                `INSERT INTO asignacion_turnos 
                 (usuario_empresa_id, tipo_turno_id, fecha_inicio, fecha_fin, estado)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    turno.usuario_empresa_id, // Mantener el mismo usuario
                    nuevosDatos.tipo_turno_id || turno.tipo_turno_id,
                    nuevosDatos.fecha_inicio || DateTime.now().setZone('America/Santiago').plus({ days: 1 }).toISODate(),
                    nuevosDatos.fecha_fin || null,
                    'activo'
                ]
            );

            await connection.commit();

            return {
                turnoAnteriorId: turnoId,
                nuevoTurnoId: result.insertId,
                turnoAnterior: turno
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default AsignacionTurnosModel;
