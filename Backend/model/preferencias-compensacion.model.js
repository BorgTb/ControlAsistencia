import pool from '../config/dbconfig.js';

class PreferenciasCompensacionModel {
    /**
     * Crear una nueva preferencia de compensación para un trabajador
     * @param {Object} data - Datos de la preferencia
     * @returns {Promise<number>} ID de la preferencia creada
     */
    static async crear(data) {
        const {
            id_trabajador,
            tipo_compensacion,
            fecha_inicio,
            fecha_fin,
            activo
        } = data;

        try {
            const [result] = await pool.query(
                `INSERT INTO preferencias_compensacion 
                (id_trabajador, tipo_compensacion, fecha_inicio, fecha_fin, activo) 
                VALUES (?, ?, ?, ?, ?)`,
                [id_trabajador, tipo_compensacion, fecha_inicio, fecha_fin || null, activo ?? true]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error al crear preferencia de compensación:', error);
            throw error;
        }
    }

    /**
     * Obtener la preferencia de compensación actual de un trabajador
     * @param {number} id_trabajador - ID del trabajador
     * @returns {Promise<Object|null>} Preferencia de compensación o null
     */
    static async obtenerPorTrabajador(id_trabajador) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM preferencias_compensacion 
                WHERE id_trabajador = ? AND activo = true 
                ORDER BY fecha_inicio DESC LIMIT 1`,
                [id_trabajador]
            );
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener preferencia de compensación:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las preferencias de compensación de un trabajador
     * @param {number} id_trabajador - ID del trabajador
     * @returns {Promise<Array>} Lista de preferencias
     */
    static async obtenerTodas(id_trabajador) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM preferencias_compensacion 
                WHERE id_trabajador = ? 
                ORDER BY fecha_inicio DESC`,
                [id_trabajador]
            );
            return rows;
        } catch (error) {
            console.error('Error al obtener preferencias de compensación:', error);
            throw error;
        }
    }

    /**
     * Obtener preferencia por ID
     * @param {number} id_preferencia - ID de la preferencia
     * @returns {Promise<Object|null>}
     */
    static async obtenerPorId(id_preferencia) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM preferencias_compensacion WHERE id_preferencia = ?`,
                [id_preferencia]
            );
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener preferencia de compensación por ID:', error);
            throw error;
        }
    }

    /**
     * Actualizar una preferencia de compensación
     * @param {number} id_preferencia - ID de la preferencia
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<boolean>} True si se actualizó
     */
    static async actualizar(id_preferencia, data) {
        try {
            const fields = [];
            const values = [];

            if (data.tipo_compensacion !== undefined) {
                fields.push('tipo_compensacion = ?');
                values.push(data.tipo_compensacion);
            }
            if (data.fecha_inicio !== undefined) {
                fields.push('fecha_inicio = ?');
                values.push(data.fecha_inicio);
            }
            if (data.fecha_fin !== undefined) {
                fields.push('fecha_fin = ?');
                values.push(data.fecha_fin);
            }
            if (data.activo !== undefined) {
                fields.push('activo = ?');
                values.push(data.activo);
            }

            if (fields.length === 0) {
                return false;
            }

            values.push(id_preferencia);

            const [result] = await pool.query(
                `UPDATE preferencias_compensacion SET ${fields.join(', ')} WHERE id_preferencia = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar preferencia de compensación:', error);
            throw error;
        }
    }

    /**
     * Desactivar una preferencia de compensación
     * @param {number} id_preferencia - ID de la preferencia
     * @returns {Promise<boolean>}
     */
    static async desactivar(id_preferencia) {
        try {
            const [result] = await pool.query(
                `UPDATE preferencias_compensacion SET activo = false WHERE id_preferencia = ?`,
                [id_preferencia]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al desactivar preferencia de compensación:', error);
            throw error;
        }
    }

    /**
     * Desactivar preferencias anteriores al crear una nueva
     * @param {number} id_trabajador - ID del trabajador
     * @returns {Promise<boolean>}
     */
    static async desactivarPreviasDelTrabajador(id_trabajador) {
        try {
            const [result] = await pool.query(
                `UPDATE preferencias_compensacion SET activo = false 
                WHERE id_trabajador = ? AND activo = true`,
                [id_trabajador]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al desactivar preferencias previas:', error);
            throw error;
        }
    }

    /**
     * Eliminar una preferencia de compensación
     * @param {number} id_preferencia - ID de la preferencia
     * @returns {Promise<boolean>}
     */
    static async eliminar(id_preferencia) {
        try {
            const [result] = await pool.query(
                `DELETE FROM preferencias_compensacion WHERE id_preferencia = ?`,
                [id_preferencia]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar preferencia de compensación:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de preferencias por empresa
     * @param {number} empresa_id - ID de la empresa
     * @returns {Promise<Object>}
     */
    static async obtenerEstadisticasPorEmpresa(empresa_id) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    tipo_compensacion,
                    COUNT(*) as cantidad
                FROM preferencias_compensacion pc
                INNER JOIN usuarios_empresas ue ON pc.id_trabajador = ue.usuario_id
                WHERE ue.empresa_id = ? AND pc.activo = true
                GROUP BY tipo_compensacion`,
                [empresa_id]
            );
            return rows;
        } catch (error) {
            console.error('Error al obtener estadísticas de preferencias:', error);
            throw error;
        }
    }
}

export default PreferenciasCompensacionModel;
