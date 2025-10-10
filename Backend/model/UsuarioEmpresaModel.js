import db from '../config/dbconfig.js';

class UsuarioEmpresaModel {
    
    // Crear una nueva relación usuario-empresa
    static async createUsuarioEmpresa(usuarioEmpresaData) {
        const query = `
            INSERT INTO usuarios_empresas (usuario_id, empresa_id, rol_en_empresa, fecha_inicio, fecha_fin, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        const [result] = await db.execute(query, [
            usuarioEmpresaData.usuario_id,
            usuarioEmpresaData.empresa_id,
            usuarioEmpresaData.rol_en_empresa || 'trabajador',
            usuarioEmpresaData.fecha_inicio,
            usuarioEmpresaData.fecha_fin || null
        ]);
        
        return {
            id: result.insertId,
            ...usuarioEmpresaData
        };
    }
    
    // Obtener todas las relaciones usuario-empresa
    static async getAllUsuarioEmpresas() {
        const query = `
            SELECT 
                ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                ue.created_at,
                ue.updated_at,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut,
                e.estado as empresa_estado
            FROM usuarios_empresas ue
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            ORDER BY ue.created_at DESC
        `;
        
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Obtener relación por ID
    /*
        Falta implementar que valide o retorne la ultima empresa activa con la que esta ligado
    */
    static async getUsuarioEmpresaById(id) {
        const query = `
            SELECT 
                ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                ue.created_at,
                ue.updated_at,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut,
                e.estado as empresa_estado
            FROM usuarios_empresas ue
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE ue.usuario_id = ?
        `;
        
        const [rows] = await db.execute(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    static async getUsuarioEmpresaByUsuarioId(id) {
        const query = `
            SELECT 
                ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                ue.created_at,
                ue.updated_at,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut,
                e.estado as empresa_estado
            FROM usuarios_empresas ue
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE ue.id = ?
        `;
        
        const [rows] = await db.execute(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    // Obtener todas las empresas de un usuario
    static async getEmpresasByUsuarioId(usuario_id) {
        const query = `
            SELECT 
                ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                ue.created_at,
                ue.updated_at,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut,
                e.estado as empresa_estado
            FROM usuarios_empresas ue
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE ue.usuario_id = ?
            AND (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)
            ORDER BY ue.fecha_inicio DESC
        `;
        
        const [rows] = await db.execute(query, [usuario_id]);
        return rows;
    }
    
    // Obtener todos los usuarios de una empresa
    static async getUsuariosByEmpresaId(empresa_id) {
        const query = `
            SELECT 
                ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                ue.created_at,
                ue.updated_at,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                u.rol as usuario_rol_global,
                u.estado as usuario_estado
            FROM usuarios_empresas ue
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            WHERE ue.empresa_id = ?
            AND (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)
            ORDER BY ue.fecha_inicio DESC
        `;
        
        const [rows] = await db.execute(query, [empresa_id]);
        return rows;
    }
    
    // Obtener usuarios activos de una empresa por RUT de empresa
    static async getUsuariosByEmpresaRut(empresa_rut) {
        const query = `
            SELECT 
                ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                ue.created_at,
                ue.updated_at,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                u.rol as usuario_rol_global,
                u.estado as usuario_estado,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM usuarios_empresas ue
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE e.emp_rut = ?
            AND (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)
            AND u.estado = 1
            ORDER BY u.nombre ASC
        `;
        
        const [rows] = await db.execute(query, [empresa_rut]);
        return rows;
    }

    // Obtener usuarios activos de una empresa por RUT de empresa
    static async getUsuariosByEmpresaId(empresa_id) {
        const query = `
            SELECT 
                ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                ue.created_at,
                ue.updated_at,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                u.rol as usuario_rol_global,
                u.estado as usuario_estado,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM usuarios_empresas ue
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE e.empresa_id = ?
            AND (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)
            AND u.estado = 1
            ORDER BY u.nombre ASC
        `;
        
        const [rows] = await db.execute(query, [empresa_id]);
        return rows;
    }
    
    // Verificar si un usuario pertenece a una empresa
    static async usuarioPerteneceEmpresa(usuario_id, empresa_id) {
        const query = `
            SELECT COUNT(*) as count
            FROM usuarios_empresas 
            WHERE usuario_id = ? 
            AND empresa_id = ?
            AND (fecha_fin IS NULL OR fecha_fin > CURRENT_DATE)
        `;
        
        const [rows] = await db.execute(query, [usuario_id, empresa_id]);
        return rows[0].count > 0;
    }
    
    // Obtener el rol de un usuario en una empresa específica
    static async getRolUsuarioEnEmpresa(usuario_id, empresa_id) {
        const query = `
            SELECT rol_en_empresa
            FROM usuarios_empresas 
            WHERE usuario_id = ? 
            AND empresa_id = ?
            AND (fecha_fin IS NULL OR fecha_fin > CURRENT_DATE)
            ORDER BY fecha_inicio DESC
            LIMIT 1
        `;
        
        const [rows] = await db.execute(query, [usuario_id, empresa_id]);
        return rows.length > 0 ? rows[0].rol_en_empresa : null;
    }
    




    
    // Obtener usuarios por rol en una empresa
    static async getUsuariosByRolEnEmpresa(empresa_id, rol_en_empresa) {
        const query = `
            SELECT 
                ue.id,
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
                u.estado as usuario_estado
            FROM usuarios_empresas ue
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            WHERE ue.empresa_id = ?
            AND ue.rol_en_empresa = ?
            AND (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)
            AND u.estado = 1
            ORDER BY u.nombre ASC
        `;
        
        const [rows] = await db.execute(query, [empresa_id, rol_en_empresa]);
        return rows;
    }
    
    // Actualizar relación usuario-empresa
    static async updateUsuarioEmpresa(id, usuarioEmpresaData) {
        const query = `
            UPDATE usuarios_empresas 
            SET usuario_id = ?, empresa_id = ?, rol_en_empresa = ?, 
                fecha_inicio = ?, fecha_fin = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const [result] = await db.execute(query, [
            usuarioEmpresaData.usuario_id,
            usuarioEmpresaData.empresa_id,
            usuarioEmpresaData.rol_en_empresa,
            usuarioEmpresaData.fecha_inicio,
            usuarioEmpresaData.fecha_fin,
            id
        ]);
        
        return result.affectedRows > 0;
    }
    
    // Finalizar relación usuario-empresa (establecer fecha_fin)
    static async finalizarRelacion(id, fecha_fin = null) {
        const fechaFinalizacion = fecha_fin || new Date().toISOString().split('T')[0];
        
        const query = `
            UPDATE usuarios_empresas 
            SET fecha_fin = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const [result] = await db.execute(query, [fechaFinalizacion, id]);
        return result.affectedRows > 0;
    }
    
    // Finalizar todas las relaciones de un usuario con una empresa
    static async finalizarRelacionesUsuarioEmpresa(usuario_id, empresa_id, fecha_fin = null) {
        const fechaFinalizacion = fecha_fin || new Date().toISOString().split('T')[0];
        
        const query = `
            UPDATE usuarios_empresas 
            SET fecha_fin = ?, updated_at = CURRENT_TIMESTAMP
            WHERE usuario_id = ? 
            AND empresa_id = ?
            AND fecha_fin IS NULL
        `;
        
        const [result] = await db.execute(query, [fechaFinalizacion, usuario_id, empresa_id]);
        return result.affectedRows > 0;
    }
    
    // Eliminar relación usuario-empresa permanentemente
    static async deleteUsuarioEmpresa(id) {
        const query = `DELETE FROM usuarios_empresas WHERE id = ?`;
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }
    
    // Obtener estadísticas de una empresa
    static async getEstadisticasEmpresa(empresa_id) {
        const query = `
            SELECT 
                COUNT(*) as total_usuarios,
                COUNT(CASE WHEN ue.rol_en_empresa = 'empleador' THEN 1 END) as empleadores,
                COUNT(CASE WHEN ue.rol_en_empresa = 'trabajador' THEN 1 END) as trabajadores,
                COUNT(CASE WHEN ue.fecha_fin IS NULL THEN 1 END) as usuarios_activos,
                COUNT(CASE WHEN ue.fecha_fin IS NOT NULL THEN 1 END) as usuarios_inactivos
            FROM usuarios_empresas ue
            WHERE ue.empresa_id = ?
        `;
        
        const [rows] = await db.execute(query, [empresa_id]);
        return rows[0];
    }
    
    // Buscar relaciones por múltiples criterios
    static async buscarUsuarioEmpresas(filtros) {
        let query = `
            SELECT 
                ue.id,
                ue.usuario_id,
                ue.empresa_id,
                ue.rol_en_empresa,
                ue.fecha_inicio,
                ue.fecha_fin,
                ue.created_at,
                ue.updated_at,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM usuarios_empresas ue
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (filtros.usuario_nombre) {
            query += ` AND u.nombre LIKE ?`;
            params.push(`%${filtros.usuario_nombre}%`);
        }
        
        if (filtros.usuario_apellido_pat) {
            query += ` AND u.apellido_pat LIKE ?`;
            params.push(`%${filtros.usuario_apellido_pat}%`);
        }
        
        if (filtros.usuario_apellido_mat) {
            query += ` AND u.apellido_mat LIKE ?`;
            params.push(`%${filtros.usuario_apellido_mat}%`);
        }
        
        if (filtros.empresa_nombre) {
            query += ` AND e.emp_nombre LIKE ?`;
            params.push(`%${filtros.empresa_nombre}%`);
        }
        
        if (filtros.rol_en_empresa) {
            query += ` AND ue.rol_en_empresa = ?`;
            params.push(filtros.rol_en_empresa);
        }
        
        if (filtros.activos_solo) {
            query += ` AND (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)`;
        }
        
        query += ` ORDER BY ue.created_at DESC`;
        
        if (filtros.limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(filtros.limit));
        }
        
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async obtenerEmpresaLugarAproximado(marcacion_id, empresa_id) {
        const query = `
        SELECT 
        el.lugar_id,
        el.empresa_id,
        el.nombre,
        el.calle, el.numero, el.comuna, el.ciudad, el.region,
        ( 6371 * ACOS( 
            COS(RADIANS(m.geo_lat)) * COS(RADIANS(el.lat)) *
            COS(RADIANS(el.lon) - RADIANS(m.geo_lon)) +
            SIN(RADIANS(m.geo_lat)) * SIN(RADIANS(el.lat))
        )
        ) AS distancia_km
        FROM marcaciones m
        JOIN usuarios_empresas ue ON ue.id = m.usuario_empresa_id
        JOIN empresa_lugar el ON el.empresa_id = ue.empresa_id
        WHERE m.id = ?
        AND el.empresa_id = ?
        ORDER BY distancia_km ASC
        LIMIT 1;  
        `;
        const [rows] = await db.execute(query, [marcacion_id, empresa_id]);
        return rows.length > 0 ? rows[0] : null;
    }

    static async obtenerIdByUsuarioId(usuario_id) {
        const query = `
        SELECT 
            id
        FROM usuarios_empresas
        WHERE usuario_id = ?
        `;
        const [rows] = await db.execute(query, [usuario_id]);
        return rows.length > 0 ? rows[0].id : null;
    }
    
    static async obtenerUsuarioByID(usuario_empresa_id){
        const query = `
        SELECT
            u.id,
            u.nombre,
            u.apellido_pat,
            u.apellido_mat,
            u.email,
            u.rut,
            u.rol,
            u.estado,
            ue.rol_en_empresa
        FROM usuarios u
        JOIN usuarios_empresas ue ON ue.usuario_id = u.id
        WHERE ue.id = ?
        `;
        const [rows] = await db.execute(query, [usuario_empresa_id]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Obtiene todas las relaciones usuario-empresa de forma simplificada
     * Utilizado para determinar qué usuarios tienen empresa asignada
     * @returns {Array} Array con objetos {usuario_id, empresa_id}
     */
    static async getAllUsuariosEmpresas() {
        const query = `
            SELECT 
                usuario_id,
                empresa_id,
                rol_en_empresa,
                fecha_inicio,
                fecha_fin
            FROM usuarios_empresas
            WHERE fecha_fin IS NULL OR fecha_fin > CURDATE()
            ORDER BY usuario_id
        `;
        
        const [rows] = await db.execute(query);
        return rows;
    }

}

export default UsuarioEmpresaModel;
