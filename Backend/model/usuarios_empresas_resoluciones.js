import pool from '../config/dbconfig.js';

class UsuariosEmpresasResolucionesModel {
    
    // Crear una nueva resolución para un usuario-empresa
    static async create(data) {
        const { usuario_empresa_id, resolucion_numero, resolucion_fecha } = data;
        const [result] = await pool.query(
            'INSERT INTO usuarios_empresas_resoluciones (usuario_empresa_id, resolucion_numero, resolucion_fecha, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [usuario_empresa_id, resolucion_numero, resolucion_fecha]
        );
        return result.insertId;
    }

    // Obtener todas las resoluciones
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM usuarios_empresas_resoluciones ORDER BY created_at DESC');
        return rows;
    }

    // Obtener resolución por ID
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM usuarios_empresas_resoluciones WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
    }

    // Obtener resoluciones por usuario_empresa_id
    static async findByUsuarioEmpresaId(usuario_empresa_id) {
        const [rows] = await pool.query(
            'SELECT * FROM usuarios_empresas_resoluciones WHERE usuario_empresa_id = ? ORDER BY created_at DESC',
            [usuario_empresa_id]
        );
        return rows;
    }

    // Obtener resoluciones con información del usuario y empresa
    static async findWithUsuarioEmpresaInfo(usuario_empresa_id = null) {
        let query = `
            SELECT 
                uer.id,
                uer.usuario_empresa_id,
                uer.resolucion_numero,
                uer.resolucion_fecha,
                uer.created_at,
                uer.updated_at,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio as relacion_fecha_inicio,
                ue.fecha_fin as relacion_fecha_fin,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM usuarios_empresas_resoluciones uer
            LEFT JOIN usuarios_empresas ue ON uer.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
        `;
        
        const params = [];
        
        if (usuario_empresa_id) {
            query += ' WHERE uer.usuario_empresa_id = ?';
            params.push(usuario_empresa_id);
        }
        
        query += ' ORDER BY uer.created_at DESC';
        
        const [rows] = await pool.query(query, params);
        return rows;
    }

    // Verificar si existe una resolución para un usuario-empresa específico
    static async existsByUsuarioEmpresaId(usuario_empresa_id) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM usuarios_empresas_resoluciones WHERE usuario_empresa_id = ?',
            [usuario_empresa_id]
        );
        return rows[0].count > 0;
    }

    // Actualizar una resolución
    static async update(id, data) {
        const { resolucion_numero, resolucion_fecha } = data;
        const [result] = await pool.query(
            'UPDATE usuarios_empresas_resoluciones SET resolucion_numero = ?, resolucion_fecha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [resolucion_numero, resolucion_fecha, id]
        );
        return result.affectedRows > 0;
    }

    // Eliminar una resolución
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM usuarios_empresas_resoluciones WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Eliminar todas las resoluciones de un usuario-empresa
    static async deleteByUsuarioEmpresaId(usuario_empresa_id) {
        const [result] = await pool.query(
            'DELETE FROM usuarios_empresas_resoluciones WHERE usuario_empresa_id = ?',
            [usuario_empresa_id]
        );
        return result.affectedRows;
    }

    // Buscar resoluciones por número de resolución
    static async findByResolucionNumero(resolucion_numero) {
        const [rows] = await pool.query(
            `SELECT 
                uer.*,
                ue.usuario_id,
                ue.empresa_id,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM usuarios_empresas_resoluciones uer
            LEFT JOIN usuarios_empresas ue ON uer.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE uer.resolucion_numero = ?`,
            [resolucion_numero]
        );
        return rows;
    }

    // Buscar resoluciones por rango de fechas
    static async findByDateRange(fecha_inicio, fecha_fin) {
        const [rows] = await pool.query(
            `SELECT 
                uer.*,
                ue.usuario_id,
                ue.empresa_id,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM usuarios_empresas_resoluciones uer
            LEFT JOIN usuarios_empresas ue ON uer.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE uer.resolucion_fecha BETWEEN ? AND ?
            ORDER BY uer.resolucion_fecha DESC`,
            [fecha_inicio, fecha_fin]
        );
        return rows;
    }

    // Obtener resoluciones de una empresa específica
    static async findByEmpresaId(empresa_id) {
        const [rows] = await pool.query(
            `SELECT 
                uer.*,
                ue.usuario_id,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM usuarios_empresas_resoluciones uer
            LEFT JOIN usuarios_empresas ue ON uer.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE ue.empresa_id = ?
            ORDER BY uer.created_at DESC`,
            [empresa_id]
        );
        return rows;
    }

    // Obtener estadísticas de resoluciones
    static async getStats() {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total_resoluciones,
                COUNT(DISTINCT uer.usuario_empresa_id) as usuarios_con_resolucion,
                COUNT(DISTINCT ue.empresa_id) as empresas_con_resoluciones,
                MIN(uer.resolucion_fecha) as fecha_resolucion_mas_antigua,
                MAX(uer.resolucion_fecha) as fecha_resolucion_mas_reciente
            FROM usuarios_empresas_resoluciones uer
            LEFT JOIN usuarios_empresas ue ON uer.usuario_empresa_id = ue.id
        `);
        return rows[0];
    }
}

export default UsuariosEmpresasResolucionesModel;
