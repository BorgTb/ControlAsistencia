import pool from '../config/dbconfig.js';

/**
 * Modelo para gestionar Refresh Tokens
 * 
 * Este modelo maneja la persistencia y validación de refresh tokens
 * para implementar sesiones persistentes tipo Gmail.
 * 
 * NOTA: Por ahora, las funciones están preparadas pero comentadas
 * hasta que se cree la tabla refresh_tokens en la base de datos.
 */

const RefreshTokenModel = {
    /**
     * Guardar un nuevo refresh token
     * @param {number} userId - ID del usuario
     * @param {string} token - Refresh token JWT
     * @param {Date} expiresAt - Fecha de expiración
     * @param {string} ipAddress - IP del usuario
     * @param {string} userAgent - User agent del navegador
     * @returns {Promise<number>} ID del token creado
     */
    async create(userId, token, expiresAt, ipAddress = null, userAgent = null) {
        try {
            const query = `
                INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await pool.query(query, [userId, token, expiresAt, ipAddress, userAgent]);
            return result.insertId;
        } catch (error) {
            console.error('❌ Error al crear refresh token:', error);
            // Por ahora retornamos null si la tabla no existe
            return null;
        }
    },

    /**
     * Verificar si el token existe y es válido
     * @param {string} token - Refresh token a verificar
     * @returns {Promise<Object|null>} Datos del token si es válido, null si no
     */
    async findValidToken(token) {
        try {
            const query = `
                SELECT rt.*, u.email, u.rol, u.estado
                FROM refresh_tokens rt
                JOIN usuarios u ON rt.user_id = u.id
                WHERE rt.token = ? 
                AND rt.revoked = FALSE
                AND rt.expires_at > NOW()
                AND u.estado = 1
            `;
            const [rows] = await pool.query(query, [token]);
            return rows[0] || null;
        } catch (error) {
            console.error('❌ Error al buscar refresh token:', error);
            // Por ahora retornamos null si la tabla no existe
            return null;
        }
    },

    /**
     * Revocar un token específico (logout)
     * @param {string} token - Token a revocar
     * @returns {Promise<boolean>} true si se revocó exitosamente
     */
    async revoke(token) {
        try {
            const query = 'UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?';
            await pool.query(query, [token]);
            return true;
        } catch (error) {
            console.error('❌ Error al revocar refresh token:', error);
            return false;
        }
    },

    /**
     * Revocar todos los tokens de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<boolean>} true si se revocaron exitosamente
     */
    async revokeAllByUser(userId) {
        try {
            const query = 'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?';
            await pool.query(query, [userId]);
            return true;
        } catch (error) {
            console.error('❌ Error al revocar todos los tokens del usuario:', error);
            return false;
        }
    },

    /**
     * Limpiar tokens expirados (ejecutar con cron job)
     * @returns {Promise<number>} Número de tokens eliminados
     */
    async deleteExpired() {
        try {
            const query = 'DELETE FROM refresh_tokens WHERE expires_at < NOW()';
            const [result] = await pool.query(query);
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Error al eliminar tokens expirados:', error);
            return 0;
        }
    },

    /**
     * Obtener tokens activos de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} Lista de sesiones activas
     */
    async getActiveTokensByUser(userId) {
        try {
            const query = `
                SELECT id, created_at, ip_address, user_agent, expires_at
                FROM refresh_tokens
                WHERE user_id = ? AND revoked = FALSE AND expires_at > NOW()
                ORDER BY created_at DESC
            `;
            const [rows] = await pool.query(query, [userId]);
            return rows;
        } catch (error) {
            console.error('❌ Error al obtener tokens activos:', error);
            return [];
        }
    }
};

export default RefreshTokenModel;
