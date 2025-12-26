import db from '../config/dbconfig.js';

class DispositivoZKModel {
    
    /**
     * Crear un nuevo dispositivo ZK
     * @param {Object} dispositivoData - Datos del dispositivo
     * @returns {Object} Dispositivo creado
     */
    static async createDispositivo(dispositivoData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                INSERT INTO dispositivos_zk (
                    serial, 
                    nombre, 
                    ubicacion, 
                    empresa_id, 
                    ip_address, 
                    puerto, 
                    activo, 
                    auto_detectado,
                    ultimo_estado,
                    configuracion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const [result] = await connection.execute(query, [
                dispositivoData.serial,
                dispositivoData.nombre,
                dispositivoData.ubicacion || null,
                dispositivoData.empresa_id,
                dispositivoData.ip_address || null,
                dispositivoData.puerto || 4370,
                dispositivoData.activo !== undefined ? dispositivoData.activo : true,
                dispositivoData.auto_detectado || false,
                dispositivoData.ultimo_estado || 'unknown',
                dispositivoData.configuracion ? JSON.stringify(dispositivoData.configuracion) : null
            ]);
            
            const dispositivoId = result.insertId;
            await connection.commit();
            
            // Devolver el dispositivo creado
            const [createdRows] = await connection.execute(
                'SELECT * FROM dispositivos_zk WHERE id = ?',
                [dispositivoId]
            );
            
            return createdRows[0] || null;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    /**
     * Obtener todos los dispositivos
     * @returns {Array} Lista de dispositivos
     */
    static async getAllDispositivos() {
        const query = `
            SELECT 
                d.*,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM dispositivos_zk d
            LEFT JOIN empresa e ON d.empresa_id = e.empresa_id
            ORDER BY d.nombre ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
    
    /**
     * Obtener dispositivos por empresa
     * @param {number} empresa_id - ID de la empresa
     * @returns {Array} Lista de dispositivos de la empresa
     */
    static async getDispositivosByEmpresa(empresa_id) {
        const query = `
            SELECT * FROM dispositivos_zk 
            WHERE empresa_id = ?
            ORDER BY nombre ASC
        `;
        const [rows] = await db.execute(query, [empresa_id]);
        return rows;
    }
    
    /**
     * Obtener dispositivos activos por empresa
     * @param {number} empresa_id - ID de la empresa
     * @returns {Array} Lista de dispositivos activos
     */
    static async getDispositivosActivosByEmpresa(empresa_id) {
        const query = `
            SELECT * FROM dispositivos_zk 
            WHERE empresa_id = ? AND activo = TRUE
            ORDER BY nombre ASC
        `;
        const [rows] = await db.execute(query, [empresa_id]);
        return rows;
    }
    
    /**
     * Obtener dispositivo por ID
     * @param {number} id - ID del dispositivo
     * @returns {Object|null} Dispositivo encontrado o null
     */
    static async getDispositivoById(id) {
        const query = `
            SELECT 
                d.*,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM dispositivos_zk d
            LEFT JOIN empresa e ON d.empresa_id = e.empresa_id
            WHERE d.id = ?
        `;
        const [rows] = await db.execute(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Obtener dispositivo por serial
     * @param {string} serial - Número de serie del dispositivo
     * @returns {Object|null} Dispositivo encontrado o null
     */
    static async getDispositivoBySerial(serial) {
        const query = `
            SELECT 
                d.*,
                e.emp_nombre as empresa_nombre,
                e.emp_rut as empresa_rut
            FROM dispositivos_zk d
            LEFT JOIN empresa e ON d.empresa_id = e.empresa_id
            WHERE d.serial = ?
        `;
        const [rows] = await db.execute(query, [serial]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Actualizar dispositivo
     * @param {number} id - ID del dispositivo
     * @param {Object} dispositivoData - Datos a actualizar
     * @returns {Object|null} Dispositivo actualizado o null
     */
    static async updateDispositivo(id, dispositivoData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                UPDATE dispositivos_zk 
                SET 
                    nombre = ?,
                    ubicacion = ?,
                    empresa_id = ?,
                    ip_address = ?,
                    puerto = ?,
                    activo = ?,
                    configuracion = ?
                WHERE id = ?
            `;
            
            await connection.execute(query, [
                dispositivoData.nombre,
                dispositivoData.ubicacion || null,
                dispositivoData.empresa_id,
                dispositivoData.ip_address || null,
                dispositivoData.puerto || 4370,
                dispositivoData.activo !== undefined ? dispositivoData.activo : true,
                dispositivoData.configuracion ? JSON.stringify(dispositivoData.configuracion) : null,
                id
            ]);
            
            await connection.commit();
            
            // Devolver el dispositivo actualizado
            const [updatedRows] = await connection.execute(
                'SELECT * FROM dispositivos_zk WHERE id = ?',
                [id]
            );
            
            return updatedRows[0] || null;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    /**
     * Actualizar estado del dispositivo
     * @param {string} serial - Serial del dispositivo
     * @param {string} estado - Estado ('online', 'offline', 'unknown')
     * @returns {boolean} true si se actualizó correctamente
     */
    static async updateEstado(serial, estado) {
        const query = `
            UPDATE dispositivos_zk 
            SET 
                ultimo_estado = ?,
                ultima_conexion = CASE 
                    WHEN ? = 'online' THEN CURRENT_TIMESTAMP 
                    ELSE ultima_conexion 
                END
            WHERE serial = ?
        `;
        const [result] = await db.execute(query, [estado, estado, serial]);
        return result.affectedRows > 0;
    }
    
    /**
     * Activar/Desactivar dispositivo
     * @param {number} id - ID del dispositivo
     * @param {boolean} activo - true para activar, false para desactivar
     * @returns {boolean} true si se actualizó correctamente
     */
    static async toggleActivo(id, activo) {
        const query = `
            UPDATE dispositivos_zk 
            SET activo = ?
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [activo, id]);
        return result.affectedRows > 0;
    }
    
    /**
     * Eliminar dispositivo
     * @param {number} id - ID del dispositivo
     * @returns {Object} Dispositivo eliminado
     */
    static async deleteDispositivo(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Obtener el dispositivo antes de eliminar
            const [rowsBefore] = await connection.execute(
                'SELECT * FROM dispositivos_zk WHERE id = ?',
                [id]
            );
            
            if (rowsBefore.length === 0) {
                throw new Error('Dispositivo no encontrado');
            }
            
            const rowBefore = rowsBefore[0];
            
            // Eliminar dispositivo
            await connection.execute('DELETE FROM dispositivos_zk WHERE id = ?', [id]);
            
            await connection.commit();
            return rowBefore;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    /**
     * Verificar si un serial ya existe
     * @param {string} serial - Número de serie
     * @param {number} excludeId - ID a excluir de la búsqueda (para updates)
     * @returns {boolean} true si existe
     */
    static async serialExists(serial, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM dispositivos_zk WHERE serial = ?';
        const params = [serial];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await db.execute(query, params);
        return rows[0].count > 0;
    }
    
    /**
     * Contar dispositivos totales y activos
     * @returns {Object} {total, activos}
     */
    static async contarDispositivos() {
        try {
            const [activosResult] = await db.execute(
                'SELECT COUNT(*) as total FROM dispositivos_zk WHERE activo = TRUE'
            );
            const activos = activosResult[0].total;

            const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM dispositivos_zk');
            const total = totalResult[0].total;

            return { total, activos };
        } catch (error) {
            console.error('Error al contar dispositivos:', error);
            return { total: 0, activos: 0 };
        }
    }
    
    /**
     * Obtener dispositivos online
     * @returns {Array} Lista de dispositivos online
     */
    static async getDispositivosOnline() {
        const query = `
            SELECT * FROM dispositivos_zk 
            WHERE ultimo_estado = 'online' AND activo = TRUE
            ORDER BY nombre ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
}

export default DispositivoZKModel;
