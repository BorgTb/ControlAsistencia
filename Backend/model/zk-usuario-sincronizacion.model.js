import db from '../config/dbconfig.js';
import UsuarioEmpresaModel from './usuario-empresa.model.js';

class ZKUsuarioSincronizacionModel {

    /**
     * Crear o actualizar registro de sincronizaciÃ³n
     * @param {Object} sincronizacionData - Datos de la sincronizaciÃ³n
     * @returns {Object} Resultado de la operaciÃ³n
     */
    static async createOrUpdate(sincronizacionData) {
        const connection = await db.getConnection();
        try {
            const query = `
                INSERT INTO zk_usuario_sincronizacion (
                    usuario_empresa_id,
                    dispositivo_id,
                    estado_biometria,
                    ultima_sincronizacion
                ) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    estado_biometria = VALUES(estado_biometria),
                    ultima_sincronizacion = VALUES(ultima_sincronizacion)
            `;

            const [result] = await connection.execute(query, [
                sincronizacionData.usuario_empresa_id,
                sincronizacionData.dispositivo_id,
                sincronizacionData.estado_biometria || 'pendiente',
                sincronizacionData.ultima_sincronizacion || null
            ]);

            return {
                success: true,
                affectedRows: result.affectedRows,
                usuario_empresa_id: sincronizacionData.usuario_empresa_id,
                dispositivo_id: sincronizacionData.dispositivo_id
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener estado de sincronizaciÃ³n de un usuario en un dispositivo
     * @param {number} usuarioEmpresaId - ID del usuario empresa
     * @param {number} dispositivoId - ID del dispositivo
     * @returns {Object|null} Estado de sincronizaciÃ³n
     */
    static async getByUsuarioDispositivo(usuarioEmpresaId, dispositivoId) {
        const connection = await db.getConnection();
        try {
            const query = `
                SELECT * FROM zk_usuario_sincronizacion 
                WHERE usuario_empresa_id = ? AND dispositivo_id = ?
            `;

            const [rows] = await connection.execute(query, [usuarioEmpresaId, dispositivoId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener todos los dispositivos sincronizados de un usuario
     * @param {number} usuarioEmpresaId - ID del usuario empresa
     * @returns {Array} Lista de sincronizaciones
     */
    static async getByUsuario(usuarioEmpresaId) {
        const connection = await db.getConnection();
        try {
            const query = `
                SELECT 
                    zus.*,
                    dz.nombre as dispositivo_nombre,
                    dz.serial as dispositivo_serial,
                    dz.ubicacion as dispositivo_ubicacion
                FROM zk_usuario_sincronizacion zus
                INNER JOIN dispositivos_zk dz ON zus.dispositivo_id = dz.id
                WHERE zus.usuario_empresa_id = ?
                ORDER BY zus.ultima_sincronizacion DESC
            `;

            const [rows] = await connection.execute(query, [usuarioEmpresaId]);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener todos los usuarios sincronizados en un dispositivo
     * @param {number} dispositivoId - ID del dispositivo
     * @param {string} estadoBiometria - Filtro opcional por estado
     * @returns {Array} Lista de usuarios sincronizados
     */
    static async getByDispositivo(dispositivoId, estadoBiometria = null) {
        const connection = await db.getConnection();
        try {
            let query = `
                SELECT 
                    zus.*,
                    ue.rut,
                    ue.nombre,
                    ue.apellido,
                    ue.cargo
                FROM zk_usuario_sincronizacion zus
                INNER JOIN usuarios_empresas ue ON zus.usuario_empresa_id = ue.id
                WHERE zus.dispositivo_id = ?
            `;

            const params = [dispositivoId];

            if (estadoBiometria) {
                query += ` AND zus.estado_biometria = ?`;
                params.push(estadoBiometria);
            }

            query += ` ORDER BY zus.ultima_sincronizacion DESC`;

            const [rows] = await connection.execute(query, params);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Actualizar estado de biometrÃ­a
     * @param {number} usuarioEmpresaId - ID del usuario empresa
     * @param {number} dispositivoId - ID del dispositivo
     * @param {string} estadoBiometria - Nuevo estado
     * @returns {Object} Resultado de la operaciÃ³n
     */
    static async updateEstadoBiometria(usuarioEmpresaId, dispositivoId, estadoBiometria) {
        const connection = await db.getConnection();
        try {
            const query = `
                UPDATE zk_usuario_sincronizacion 
                SET estado_biometria = ?, ultima_sincronizacion = CURRENT_TIMESTAMP
                WHERE usuario_empresa_id = ? AND dispositivo_id = ?
            `;

            const [result] = await connection.execute(query, [
                estadoBiometria,
                usuarioEmpresaId,
                dispositivoId
            ]);

            return {
                success: result.affectedRows > 0,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar sincronizaciÃ³n
     * @param {number} usuarioEmpresaId - ID del usuario empresa
     * @param {number} dispositivoId - ID del dispositivo
     * @returns {Object} Resultado de la operaciÃ³n
     */
    static async delete(usuarioEmpresaId, dispositivoId) {
        const connection = await db.getConnection();
        try {
            const query = `
                DELETE FROM zk_usuario_sincronizacion 
                WHERE usuario_empresa_id = ? AND dispositivo_id = ?
            `;

            const [result] = await connection.execute(query, [usuarioEmpresaId, dispositivoId]);

            return {
                success: result.affectedRows > 0,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar todas las sincronizaciones de un usuario
     * @param {number} usuarioEmpresaId - ID del usuario empresa
     * @returns {Object} Resultado de la operaciÃ³n
     */
    static async deleteByUsuario(usuarioEmpresaId) {
        const connection = await db.getConnection();
        try {
            const query = `
                DELETE FROM zk_usuario_sincronizacion 
                WHERE usuario_empresa_id = ?
            `;

            const [result] = await connection.execute(query, [usuarioEmpresaId]);

            return {
                success: true,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar todas las sincronizaciones de un dispositivo
     * @param {number} dispositivoId - ID del dispositivo
     * @returns {Object} Resultado de la operaciÃ³n
     */
    static async deleteByDispositivo(dispositivoId) {
        const connection = await db.getConnection();
        try {
            const query = `
                DELETE FROM zk_usuario_sincronizacion 
                WHERE dispositivo_id = ?
            `;

            const [result] = await connection.execute(query, [dispositivoId]);

            return {
                success: true,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener estadÃ­sticas de sincronizaciÃ³n por dispositivo
     * @param {number} dispositivoId - ID del dispositivo
     * @returns {Object} EstadÃ­sticas de sincronizaciÃ³n
     */
    static async getEstadisticas(dispositivoId) {
        const connection = await db.getConnection();
        try {
            const query = `
                SELECT 
                    estado_biometria,
                    COUNT(*) as cantidad
                FROM zk_usuario_sincronizacion
                WHERE dispositivo_id = ?
                GROUP BY estado_biometria
            `;

            const [rows] = await connection.execute(query, [dispositivoId]);
            
            const estadisticas = {
                pendiente: 0,
                enrolado_huella: 0,
                enrolado_rostro: 0,
                completo: 0,
                total: 0
            };

            rows.forEach(row => {
                estadisticas[row.estado_biometria] = row.cantidad;
                estadisticas.total += row.cantidad;
            });

            return estadisticas;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Guardar o actualizar usuario sincronizado desde dispositivo
     * @param {number} dispositivoId - ID del dispositivo
     * @param {string} userId - ID del usuario en el dispositivo
     * @param {Object} userData - Datos del usuario
     * @returns {Object} Resultado de la operaciÃ³n
     */
    static async saveUsuarioDispositivo(dispositivoId, userId, userData) {
        const connection = await db.getConnection();
        try {
            // Intentar encontrar el usuario_empresa_id por el usuario_id o rut
            const query = `
                SELECT ue.id as usuario_empresa_id, ue.empresa_id
                FROM usuarios_empresas ue
                INNER JOIN usuarios u ON ue.usuario_id = u.id
                INNER JOIN dispositivos_zk dz ON dz.id = ?
                WHERE (u.id = ? OR u.rut = ?)
                AND ue.empresa_id = dz.empresa_id
                LIMIT 1
            `;
            
            const [users] = await connection.execute(query, [dispositivoId, userId, userId]);
            
            if (users.length > 0) {
                // Usuario existe en el sistema, crear/actualizar sincronizaciÃ³n
                const syncQuery = `
                    INSERT INTO zk_usuario_sincronizacion (
                        usuario_empresa_id,
                        dispositivo_id,
                        estado_biometria,
                        ultima_sincronizacion
                    ) VALUES (?, ?, 'enrolado_huella', CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE
                        ultima_sincronizacion = CURRENT_TIMESTAMP
                `;
                
                await connection.execute(syncQuery, [
                    users[0].usuario_empresa_id,
                    dispositivoId
                ]);
                
                return { success: true, in_system: true, usuario_empresa_id: users[0].usuario_empresa_id };
            }
            
            return { success: true, in_system: false };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener usuarios sincronizados de un dispositivo con datos completos
     * @param {number} dispositivoId - ID del dispositivo
     * @returns {Array} Lista de usuarios con datos completos
     */
    static async getUsuariosConDatos(dispositivoId) {
        const connection = await db.getConnection();
        try {
            const query = `
                SELECT 
                    zus.*,
                    u.id as usuario_id,
                    u.rut as usuario_rut,
                    u.nombre as usuario_nombre,
                    u.apellido_pat as usuario_apellido_pat,
                    u.apellido_mat as usuario_apellido_mat,
                    ue.rol_en_empresa,
                    ue.id as usuario_empresa_id
                FROM zk_usuario_sincronizacion zus
                INNER JOIN usuarios_empresas ue ON zus.usuario_empresa_id = ue.id
                INNER JOIN usuarios u ON ue.usuario_id = u.id
                WHERE zus.dispositivo_id = ?
                ORDER BY zus.ultima_sincronizacion DESC
            `;

            const [rows] = await connection.execute(query, [dispositivoId]);
            
            console.log(`[BD] Encontrados ${rows.length} usuarios sincronizados en dispositivo ${dispositivoId}`);
            
            // Formatear para coincidir con formato del dispositivo
            return rows.map(row => {
                // El user_id debe ser el mismo que usa el dispositivo (generalmente usuario_id numÃ©rico)
                const userId = row.usuario_id.toString();
                console.log(`[BD] Usuario: ${row.usuario_nombre} - ID: ${userId} - RUT: ${row.usuario_rut}`);
                
                return {
                    user_id: userId, // Usar ID numÃ©rico como en el dispositivo
                    name: `${row.usuario_nombre} ${row.usuario_apellido_pat || ''}`.trim(),
                    privilege: 0,
                    in_system: true,
                    rut: row.usuario_rut,
                    nombre_completo: `${row.usuario_nombre} ${row.usuario_apellido_pat || ''}`.trim(),
                    usuario_empresa_id: row.usuario_empresa_id,
                    ultima_sincronizacion: row.ultima_sincronizacion
                };
            });
        } catch (error) {
            console.error('[BD] Error obteniendo usuarios:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar sincronizaciÃ³n por user_id del dispositivo
     * @param {number} dispositivoId - ID del dispositivo
     * @param {string} userId - ID del usuario en el dispositivo
     * @returns {Object} Resultado de la operaciÃ³n
     */
    static async deleteByUserId(dispositivoId, userId) {
        const connection = await db.getConnection();
        try {
            const query = `
                DELETE zus FROM zk_usuario_sincronizacion zus
                INNER JOIN usuarios_empresas ue ON zus.usuario_empresa_id = ue.id
                INNER JOIN usuarios u ON ue.usuario_id = u.id
                WHERE zus.dispositivo_id = ?
                AND (u.id = ? OR u.rut = ?)
            `;

            const [result] = await connection.execute(query, [dispositivoId, userId, userId]);

            return {
                success: result.affectedRows > 0,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener usuarios pendientes de sincronizaciÃ³n
     * @param {number} dispositivoId - ID del dispositivo (opcional)
     * @returns {Array} Lista de usuarios pendientes
     */
    static async getPendientes(dispositivoId = null) {
        const connection = await db.getConnection();
        try {
            let query = `
                SELECT 
                    zus.*,
                    ue.rut,
                    ue.nombre,
                    ue.apellido,
                    dz.nombre as dispositivo_nombre,
                    dz.serial as dispositivo_serial
                FROM zk_usuario_sincronizacion zus
                INNER JOIN usuarios_empresas ue ON zus.usuario_empresa_id = ue.id
                INNER JOIN dispositivos_zk dz ON zus.dispositivo_id = dz.id
                WHERE zus.estado_biometria = 'pendiente'
            `;

            const params = [];

            if (dispositivoId) {
                query += ` AND zus.dispositivo_id = ?`;
                params.push(dispositivoId);
            }

            query += ` ORDER BY zus.ultima_sincronizacion ASC`;

            const [rows] = await connection.execute(query, params);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default ZKUsuarioSincronizacionModel;
