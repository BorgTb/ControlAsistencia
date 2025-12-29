import pool from '../config/dbconfig.js';

/**
 * Modelo para gestionar los roles del sistema
 * Tabla: roles_sistema
 */
class RolesSistemaModel {
    /**
     * Obtener todos los roles del sistema
     * @returns {Array} Lista de roles disponibles
     */
    static async findAll() {
        const query = `
            SELECT id, nombre, slug, descripcion
            FROM roles_sistema
            ORDER BY nombre ASC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Buscar un rol por su slug
     * @param {string} slug - Identificador único del rol (admin, empleador, fiscalizador, trabajador)
     * @returns {Object|null} Rol encontrado o null
     */
    static async findBySlug(slug) {
        const query = `
            SELECT id, nombre, slug, descripcion
            FROM roles_sistema
            WHERE slug = ?
        `;
        const [rows] = await pool.query(query, [slug]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Buscar un rol por su ID
     * @param {number} id - ID del rol
     * @returns {Object|null} Rol encontrado o null
     */
    static async findById(id) {
        const query = `
            SELECT id, nombre, slug, descripcion
            FROM roles_sistema
            WHERE id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Obtener roles por múltiples slugs
     * @param {Array<string>} slugs - Array de slugs de roles
     * @returns {Array} Lista de roles encontrados
     */
    static async findBySlugs(slugs) {
        if (!slugs || slugs.length === 0) {
            return [];
        }

        const placeholders = slugs.map(() => '?').join(',');
        const query = `
            SELECT id, nombre, slug, descripcion
            FROM roles_sistema
            WHERE slug IN (${placeholders})
        `;
        const [rows] = await pool.query(query, slugs);
        return rows;
    }

    /**
     * Verificar si existe un rol con el slug dado
     * @param {string} slug - Slug del rol
     * @returns {boolean} true si existe, false si no
     */
    static async exists(slug) {
        const query = `
            SELECT COUNT(*) as count
            FROM roles_sistema
            WHERE slug = ?
        `;
        const [rows] = await pool.query(query, [slug]);
        return rows[0].count > 0;
    }
}

export default RolesSistemaModel;
