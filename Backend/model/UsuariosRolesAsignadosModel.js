import pool from '../config/dbconfig.js';

/**
 * Modelo para gestionar la asignación de roles a usuarios
 * Tabla: usuarios_roles_asignados
 * Permite que un usuario tenga múltiples roles en una empresa
 */
class UsuariosRolesAsignadosModel {
    /**
     * Asignar un rol a un usuario en el contexto de una empresa
     * @param {number} usuario_empresa_id - ID de la relación usuario-empresa
     * @param {number} rol_sistema_id - ID del rol a asignar
     * @returns {Object} Resultado de la inserción
     */
    static async assignRole(usuario_empresa_id, rol_sistema_id) {
        const query = `
            INSERT INTO usuarios_roles_asignados (usuario_empresa_id, rol_sistema_id, created_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE created_at = created_at
        `;
        const [result] = await pool.query(query, [usuario_empresa_id, rol_sistema_id]);
        return {
            id: result.insertId,
            usuario_empresa_id,
            rol_sistema_id,
            success: result.affectedRows > 0
        };
    }

    /**
     * Revocar un rol de un usuario
     * @param {number} usuario_empresa_id - ID de la relación usuario-empresa
     * @param {number} rol_sistema_id - ID del rol a revocar
     * @returns {boolean} true si se revocó, false si no existía
     */
    static async revokeRole(usuario_empresa_id, rol_sistema_id) {
        const query = `
            DELETE FROM usuarios_roles_asignados
            WHERE usuario_empresa_id = ? AND rol_sistema_id = ?
        `;
        const [result] = await pool.query(query, [usuario_empresa_id, rol_sistema_id]);
        return result.affectedRows > 0;
    }

    /**
     * Obtener todos los roles asignados a un usuario-empresa
     * @param {number} usuario_empresa_id - ID de la relación usuario-empresa
     * @returns {Array} Lista de roles asignados con información completa
     */
    static async getUserRoles(usuario_empresa_id) {
        const query = `
            SELECT 
                ura.id,
                ura.usuario_empresa_id,
                ura.rol_sistema_id,
                ura.created_at,
                rs.nombre as rol_nombre,
                rs.slug as rol_slug,
                rs.descripcion as rol_descripcion
            FROM usuarios_roles_asignados ura
            INNER JOIN roles_sistema rs ON ura.rol_sistema_id = rs.id
            WHERE ura.usuario_empresa_id = ?
            ORDER BY rs.nombre ASC
        `;
        const [rows] = await pool.query(query, [usuario_empresa_id]);
        return rows;
    }

    /**
     * Verificar si un usuario tiene un rol específico
     * @param {number} usuario_empresa_id - ID de la relación usuario-empresa
     * @param {string} rol_slug - Slug del rol a verificar
     * @returns {boolean} true si tiene el rol, false si no
     */
    static async hasRole(usuario_empresa_id, rol_slug) {
        const query = `
            SELECT COUNT(*) as count
            FROM usuarios_roles_asignados ura
            INNER JOIN roles_sistema rs ON ura.rol_sistema_id = rs.id
            WHERE ura.usuario_empresa_id = ? AND rs.slug = ?
        `;
        const [rows] = await pool.query(query, [usuario_empresa_id, rol_slug]);
        return rows[0].count > 0;
    }

    /**
     * Obtener todos los usuarios que tienen un rol específico en una empresa
     * @param {number} empresa_id - ID de la empresa
     * @param {string} rol_slug - Slug del rol
     * @returns {Array} Lista de usuarios con ese rol
     */
    static async getUsersByRole(empresa_id, rol_slug) {
        const query = `
            SELECT 
                u.id as usuario_id,
                u.nombre,
                u.apellido_pat,
                u.apellido_mat,
                u.email,
                u.rut,
                ue.id as usuario_empresa_id,
                ue.fecha_inicio,
                ue.fecha_fin,
                rs.nombre as rol_nombre,
                rs.slug as rol_slug
            FROM usuarios_roles_asignados ura
            INNER JOIN roles_sistema rs ON ura.rol_sistema_id = rs.id
            INNER JOIN usuarios_empresas ue ON ura.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            WHERE ue.empresa_id = ? 
              AND rs.slug = ?
              AND (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)
              AND u.estado = 1
            ORDER BY u.nombre ASC
        `;
        const [rows] = await pool.query(query, [empresa_id, rol_slug]);
        return rows;
    }

    /**
     * Obtener los roles de un usuario en una empresa específica
     * @param {number} usuario_id - ID del usuario
     * @param {number} empresa_id - ID de la empresa
     * @returns {Array} Lista de roles del usuario en esa empresa
     */
    static async getUserRolesInCompany(usuario_id, empresa_id) {
        const query = `
            SELECT 
                ura.id,
                ura.usuario_empresa_id,
                ura.rol_sistema_id,
                ura.created_at,
                rs.nombre as rol_nombre,
                rs.slug as rol_slug,
                rs.descripcion as rol_descripcion
            FROM usuarios_roles_asignados ura
            INNER JOIN roles_sistema rs ON ura.rol_sistema_id = rs.id
            INNER JOIN usuarios_empresas ue ON ura.usuario_empresa_id = ue.id
            WHERE ue.usuario_id = ? 
              AND ue.empresa_id = ?
              AND (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)
            ORDER BY rs.nombre ASC
        `;
        const [rows] = await pool.query(query, [usuario_id, empresa_id]);
        return rows;
    }

    /**
     * Revocar todos los roles de un usuario-empresa
     * @param {number} usuario_empresa_id - ID de la relación usuario-empresa
     * @returns {boolean} true si se revocaron roles, false si no había ninguno
     */
    static async revokeAllRoles(usuario_empresa_id) {
        const query = `
            DELETE FROM usuarios_roles_asignados
            WHERE usuario_empresa_id = ?
        `;
        const [result] = await pool.query(query, [usuario_empresa_id]);
        return result.affectedRows > 0;
    }

    /**
     * Reemplazar todos los roles de un usuario por nuevos roles
     * @param {number} usuario_empresa_id - ID de la relación usuario-empresa
     * @param {Array<number>} rol_sistema_ids - Array de IDs de roles a asignar
     * @returns {Object} Resultado de la operación
     */
    static async replaceUserRoles(usuario_empresa_id, rol_sistema_ids) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Eliminar roles actuales
            await connection.query(
                'DELETE FROM usuarios_roles_asignados WHERE usuario_empresa_id = ?',
                [usuario_empresa_id]
            );

            // Insertar nuevos roles
            if (rol_sistema_ids && rol_sistema_ids.length > 0) {
                const values = rol_sistema_ids.map(rol_id => [usuario_empresa_id, rol_id]);
                await connection.query(
                    'INSERT INTO usuarios_roles_asignados (usuario_empresa_id, rol_sistema_id) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            return { success: true, roles_assigned: rol_sistema_ids.length };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener estadísticas de roles en una empresa
     * @param {number} empresa_id - ID de la empresa
     * @returns {Array} Estadísticas por rol
     */
    static async getRoleStatsForCompany(empresa_id) {
        const query = `
            SELECT 
                rs.nombre as rol_nombre,
                rs.slug as rol_slug,
                COUNT(DISTINCT ue.usuario_id) as total_usuarios
            FROM roles_sistema rs
            LEFT JOIN usuarios_roles_asignados ura ON rs.id = ura.rol_sistema_id
            LEFT JOIN usuarios_empresas ue ON ura.usuario_empresa_id = ue.id AND ue.empresa_id = ?
            WHERE ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE
            GROUP BY rs.id, rs.nombre, rs.slug
            ORDER BY total_usuarios DESC, rs.nombre ASC
        `;
        const [rows] = await pool.query(query, [empresa_id]);
        return rows;
    }
}

export default UsuariosRolesAsignadosModel;
