import db from '../config/dbconfig.js';


class EstAsignacionesModel {
    
    // Obtener todas las asignaciones
    static async getAll() {
        const query = `
            SELECT id, est_id, usuaria_id, usuario_empresa_id, fecha_inicio, fecha_fin 
            FROM est_asignaciones 
            ORDER BY fecha_inicio DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Obtener asignación por ID
    static async getById(id) {
        const query = `
            SELECT id, est_id, usuaria_id, usuario_empresa_id, fecha_inicio, fecha_fin 
            FROM est_asignaciones 
            WHERE id = ?
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    // Obtener asignaciones por empresa usuaria
    static async getByUsuariaId(usuariaId) {
        const query = `
            SELECT id, est_id, usuaria_id, usuario_empresa_id, fecha_inicio, fecha_fin 
            FROM est_asignaciones 
            WHERE usuaria_id = ? 
            ORDER BY fecha_inicio DESC
        `;
        const [rows] = await db.execute(query, [usuariaId]);
        return rows;
    }

    static async getTrabajadoresByUsuariaId(usuariaId) {
        const query = `
            SELECT ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                u.estado as usuario_estado FROM est_asignaciones INNER JOIN usuarios_empresas as ue ON ue.id = est_asignaciones.usuario_empresa_id INNER JOIN usuarios as u ON u.id = ue.usuario_id
                WHERE est_asignaciones.usuaria_id = ? AND ue.rol_en_empresa = 'trabajador'`;
        const [rows] = await db.execute(query, [usuariaId]);
        return rows;
    }

    static async getEstInfoByUsuariaRut(usuariaRut) {
        const query = `SELECT * FROM empresa WHERE empresa_id in (SELECT ea.est_id FROM est_asignaciones as ea INNER JOIN empresa as e WHERE ea.usuaria_id = e.empresa_id AND e.emp_rut = ? AND (ea.fecha_fin IS NULL OR ea.fecha_fin >= CURDATE()))`;
        const [rows] = await db.execute(query, [usuariaRut]);
        return rows;
    }

    // Obtener asignaciones activas (sin fecha_fin)
    static async getActive() {
        const query = `
            SELECT id, est_id, usuaria_id, usuario_empresa_id, fecha_inicio, fecha_fin 
            FROM est_asignaciones 
            WHERE fecha_fin IS NULL 
            ORDER BY fecha_inicio DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Crear nueva asignación
    static async create(data) {
        const query = `
            INSERT INTO est_asignaciones (est_id, usuaria_id, usuario_empresa_id, fecha_inicio, fecha_fin) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            data.est_id,
            data.usuaria_id,
            data.usuario_empresa_id,
            data.fecha_inicio,
            data.fecha_fin || null
        ]);
        return result.insertId;
    }

    // Actualizar asignación
    static async update(id, data) {
        const query = `
            UPDATE est_asignaciones 
            SET est_id = ?, usuaria_id = ?, usuario_empresa_id = ?, fecha_inicio = ?, fecha_fin = ? 
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [
            data.est_id,
            data.usuaria_id,
            data.usuario_empresa_id,
            data.fecha_inicio,
            data.fecha_fin || null,
            id
        ]);
        return result.affectedRows > 0;
    }

    // Cerrar asignación (establecer fecha_fin)
    static async close(id, fechaFin) {
        const query = `
            UPDATE est_asignaciones 
            SET fecha_fin = ? 
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [fechaFin, id]);
        return result.affectedRows > 0;
    }

    // Eliminar asignación
    static async delete(id) {
        const query = `DELETE FROM est_asignaciones WHERE id = ?`;
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Obtener asignaciones por usuario_empresa_id
    static async getByUsuarioEmpresaId(usuarioEmpresaId) {
        const query = `
            SELECT id, est_id, usuaria_id, usuario_empresa_id, fecha_inicio, fecha_fin 
            FROM est_asignaciones 
            WHERE usuario_empresa_id = ? 
            ORDER BY fecha_inicio DESC
        `;
        const [rows] = await db.execute(query, [usuarioEmpresaId]);
        return rows;
    }

   // Obtener asignaciones activas por usuario_empresa_id
    static async getActiveByUsuarioEmpresaId(usuarioEmpresaId) {
        const query = `
            SELECT id, est_id, usuaria_id, usuario_empresa_id, fecha_inicio, fecha_fin 
            FROM est_asignaciones 
            WHERE usuario_empresa_id = ? 
            AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())  -- Solo asignaciones activas
            ORDER BY fecha_inicio DESC
        `;
        const [rows] = await db.execute(query, [usuarioEmpresaId]);
        return rows[0] || null;
    }
    // Obtener asignaciones con información detallada de usuario y empresa
    static async getAllWithDetails() {
        const query = `
            SELECT 
                ea.id,
                ea.est_id,
                ea.usuaria_id,
                ea.usuario_empresa_id,
                ea.fecha_inicio,
                ea.fecha_fin,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut,
                ue.rol_en_empresa
            FROM est_asignaciones ea
            LEFT JOIN usuarios_empresas ue ON ea.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            ORDER BY ea.fecha_inicio DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async getByEstId(estId) {
        const query = `
            SELECT id, est_id, usuaria_id, usuario_empresa_id, fecha_inicio, fecha_fin
            FROM est_asignaciones
            WHERE est_id = ?
            ORDER BY fecha_inicio DESC
        `;
        const [rows] = await db.execute(query, [estId]);
        return rows;
    }   
}

export default EstAsignacionesModel;