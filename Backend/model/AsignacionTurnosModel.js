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
                tt.hora_inicio,
                tt.hora_fin,
                tt.colacion_inicio,
                tt.colacion_fin,
                tt.dias_trabajo,
                tt.dias_descanso
            FROM asignacion_turnos at
            INNER JOIN tipo_turnos tt ON at.tipo_turno_id = tt.id
            WHERE at.usuario_empresa_id = ?
            AND at.estado = 'activo'
            AND at.fecha_inicio <= ?
            AND (at.fecha_fin IS NULL OR at.fecha_fin >= ?)
            ORDER BY at.fecha_inicio DESC
            LIMIT 1
        `;
        const [rows] = await pool.query(query, [usuarioEmpresaId, fechaBusqueda, fechaBusqueda]);
        return rows[0];
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
        const query = `DELETE FROM asignacion_turnos WHERE id = ?`;
        const [result] = await pool.query(query, [id]);
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
}

export default AsignacionTurnosModel;
