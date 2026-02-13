import db from '../config/dbconfig.js';

class AmonestacionesModel {
    // Crear nueva amonestación
    static async crear(data) {
        const query = `
            INSERT INTO amonestaciones (
                usuario_empresa_id, cargo, area_departamento, empresa_rut, 
                supervisor_responsable, tipo_falta, fecha_hecho, descripcion_detallada, 
                norma_infringida, tipo_sancion, monto_multa, observaciones_rrhh, 
                plazo_descargos, archivos_json, estado, creado_por, ip_registro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [
            data.usuario_empresa_id, data.cargo, data.area_departamento, data.empresa_rut,
            data.supervisor_responsable, data.tipo_falta, data.fecha_hecho, data.descripcion_detallada,
            data.norma_infringida, data.tipo_sancion, data.monto_multa, data.observaciones_rrhh,
            data.plazo_descargos, JSON.stringify(data.archivos_json), data.estado || 'PENDIENTE',
            data.creado_por, data.ip_registro
        ]);
        
        return result.insertId;
    }

    // Obtener todas las amonestaciones
    static async obtenerTodas() {
        const query = `
            SELECT a.*, ue.nombres, ue.apellidos, e.razon_social as empresa_nombre,
                   u.nombres as creador_nombres, u.apellidos as creador_apellidos
            FROM amonestaciones a
            LEFT JOIN usuarios_empresas ue ON a.usuario_empresa_id = ue.id
            LEFT JOIN empresas e ON ue.empresa_id = e.id
            LEFT JOIN usuarios u ON a.creado_por = u.id
            ORDER BY a.created_at DESC
        `;
        
        const [rows] = await db.execute(query);
        return rows.map(row => ({
            ...row,
            archivos_json: row.archivos_json ? JSON.parse(row.archivos_json) : null
        }));
    }

    // Obtener amonestación por ID
    static async obtenerPorId(id) {
        const query = `
            SELECT a.*, ue.nombres, ue.apellidos, e.razon_social as empresa_nombre,
                   u.nombres as creador_nombres, u.apellidos as creador_apellidos
            FROM amonestaciones a
            LEFT JOIN usuarios_empresas ue ON a.usuario_empresa_id = ue.id
            LEFT JOIN empresas e ON ue.empresa_id = e.id
            LEFT JOIN usuarios u ON a.creado_por = u.id
            WHERE a.id = ?
        `;
        
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0) return null;
        
        return {
            ...rows[0],
            archivos_json: rows[0].archivos_json ? JSON.parse(rows[0].archivos_json) : null
        };
    }

    // Obtener amonestaciones por usuario empresa
    static async obtenerPorUsuarioEmpresa(usuarioEmpresaId) {
        const query = `
            SELECT a.*, u.nombres as creador_nombres, u.apellidos as creador_apellidos
            FROM amonestaciones a
            LEFT JOIN usuarios u ON a.creado_por = u.id
            WHERE a.usuario_empresa_id = ?
            ORDER BY a.created_at DESC
        `;
        
        const [rows] = await db.execute(query, [usuarioEmpresaId]);
        return rows.map(row => ({
            ...row,
            archivos_json: row.archivos_json ? JSON.parse(row.archivos_json) : null
        }));
    }

    // Actualizar amonestación
    static async actualizar(id, data) {
        const campos = [];
        const valores = [];

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(key === 'archivos_json' ? JSON.stringify(data[key]) : data[key]);
            }
        });

        if (campos.length === 0) return false;

        const query = `UPDATE amonestaciones SET ${campos.join(', ')} WHERE id = ?`;
        valores.push(id);

        const [result] = await db.execute(query, valores);
        return result.affectedRows > 0;
    }

    // Actualizar descargos del trabajador
    static async actualizarDescargos(id, descargos) {
        const query = `
            UPDATE amonestaciones 
            SET descargos_trabajador = ?, estado = 'CON_DESCARGOS'
            WHERE id = ?
        `;
        
        const [result] = await db.execute(query, [descargos, id]);
        return result.affectedRows > 0;
    }

    // Cambiar estado de amonestación
    static async cambiarEstado(id, estado) {
        const query = `UPDATE amonestaciones SET estado = ? WHERE id = ?`;
        const [result] = await db.execute(query, [estado, id]);
        return result.affectedRows > 0;
    }

    // Eliminar amonestación
    static async eliminar(id) {
        const query = `DELETE FROM amonestaciones WHERE id = ?`;
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Obtener estadísticas de amonestaciones
    static async obtenerEstadisticas(empresaId = null) {
        let query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN tipo_falta = 'atraso' THEN 1 ELSE 0 END) as atrasos,
                SUM(CASE WHEN tipo_falta = 'inasistencia' THEN 1 ELSE 0 END) as inasistencias,
                SUM(CASE WHEN tipo_sancion = 'multa' THEN 1 ELSE 0 END) as con_multa
            FROM amonestaciones a
        `;
        
        const valores = [];
        
        if (empresaId) {
            query += ` 
                LEFT JOIN usuarios_empresas ue ON a.usuario_empresa_id = ue.id
                WHERE ue.empresa_id = ?
            `;
            valores.push(empresaId);
        }
        
        const [rows] = await db.execute(query, valores);
        return rows[0];
    }

    // Buscar amonestaciones con filtros
    static async buscar(filtros = {}) {
        let query = `
            SELECT a.*, ue.nombres, ue.apellidos, e.razon_social as empresa_nombre
            FROM amonestaciones a
            LEFT JOIN usuarios_empresas ue ON a.usuario_empresa_id = ue.id
            LEFT JOIN empresas e ON ue.empresa_id = e.id
            WHERE 1=1
        `;
        
        const valores = [];
        
        if (filtros.empresa_id) {
            query += ` AND ue.empresa_id = ?`;
            valores.push(filtros.empresa_id);
        }
        
        if (filtros.tipo_falta) {
            query += ` AND a.tipo_falta = ?`;
            valores.push(filtros.tipo_falta);
        }
        
        if (filtros.estado) {
            query += ` AND a.estado = ?`;
            valores.push(filtros.estado);
        }
        
        if (filtros.fecha_desde) {
            query += ` AND a.fecha_hecho >= ?`;
            valores.push(filtros.fecha_desde);
        }
        
        if (filtros.fecha_hasta) {
            query += ` AND a.fecha_hecho <= ?`;
            valores.push(filtros.fecha_hasta);
        }
        
        query += ` ORDER BY a.created_at DESC`;
        
        const [rows] = await db.execute(query, valores);
        return rows.map(row => ({
            ...row,
            archivos_json: row.archivos_json ? JSON.parse(row.archivos_json) : null
        }));
    }
}
export default AmonestacionesModel;