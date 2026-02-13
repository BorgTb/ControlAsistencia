import db from '../config/dbconfig.js';

class EmpresaLugarModel {
    
    // Crear un nuevo lugar para una empresa
    static async createLugar(lugarData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const lugarQuery = `
                INSERT INTO empresa_lugar (
                    empresa_id, nombre, calle, numero, piso, oficina, 
                    comuna, ciudad, region, lat, lon, estado, 
                    created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            const [lugarResult] = await connection.execute(lugarQuery, [
                lugarData.empresa_id,
                lugarData.nombre || '',
                lugarData.calle || '',
                lugarData.numero || '',
                lugarData.piso || '',
                lugarData.oficina || '',
                lugarData.comuna || '',
                lugarData.ciudad || '',
                lugarData.region || '',
                lugarData.lat || null,
                lugarData.lon || null,
                lugarData.estado || 1
            ]);
            const lugarId = lugarResult.insertId;
            await connection.commit();
            // Devolver la fila creada
            const [createdRows] = await connection.execute(
                'SELECT * FROM empresa_lugar WHERE lugar_id = ?',
                [lugarId]
            );
            return createdRows[0] || null;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Obtener todos los lugares
    static async getAllLugares() {
        const query = `
            SELECT 
                el.lugar_id, el.empresa_id, el.nombre, el.calle, el.numero, 
                el.piso, el.oficina, el.comuna, el.ciudad, el.region, 
                el.lat, el.lon, el.estado, el.created_at, el.updated_at,
                e.emp_nombre as empresa_nombre
            FROM empresa_lugar el
            INNER JOIN empresa e ON el.empresa_id = e.empresa_id
            ORDER BY e.emp_nombre ASC, el.nombre ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Obtener lugar por ID
    static async getLugarById(lugar_id) {
        const query = `
            SELECT 
                el.*, 
                e.emp_nombre as empresa_nombre
            FROM empresa_lugar el
            INNER JOIN empresa e ON el.empresa_id = e.empresa_id
            WHERE el.lugar_id = ?
        `;
        const [rows] = await db.execute(query, [lugar_id]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    
    // Obtener lugares por empresa_id
    static async getLugaresByEmpresaId(empresa_id) {
        const query = `
            SELECT * FROM empresa_lugar 
            WHERE empresa_id = ? 
            ORDER BY nombre ASC
        `;
        const [rows] = await db.execute(query, [empresa_id]);
        return rows;
    }
    
    // Obtener lugares activos por empresa_id
    static async getLugaresActivosByEmpresaId(empresa_id) {
        const query = `
            SELECT * FROM empresa_lugar 
            WHERE empresa_id = ? AND estado = 1 
            ORDER BY nombre ASC
        `;
        const [rows] = await db.execute(query, [empresa_id]);
        return rows;
    }
    
    // Obtener lugares activos
    static async getLugaresActivos() {
        const query = `
            SELECT 
                el.*, 
                e.emp_nombre as empresa_nombre
            FROM empresa_lugar el
            INNER JOIN empresa e ON el.empresa_id = e.empresa_id
            WHERE el.estado = 1 
            ORDER BY e.emp_nombre ASC, el.nombre ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Buscar lugares por nombre
    static async buscarLugaresPorNombre(nombre) {
        const query = `
            SELECT 
                el.*, 
                e.emp_nombre as empresa_nombre
            FROM empresa_lugar el
            INNER JOIN empresa e ON el.empresa_id = e.empresa_id
            WHERE el.nombre LIKE ? 
            ORDER BY e.emp_nombre ASC, el.nombre ASC
        `;
        const searchTerm = `%${nombre}%`;
        const [rows] = await db.execute(query, [searchTerm]);
        return rows;
    }
    
    // Buscar lugares por ciudad
    static async buscarLugaresPorCiudad(ciudad) {
        const query = `
            SELECT 
                el.*, 
                e.emp_nombre as empresa_nombre
            FROM empresa_lugar el
            INNER JOIN empresa e ON el.empresa_id = e.empresa_id
            WHERE el.ciudad LIKE ? 
            ORDER BY e.emp_nombre ASC, el.nombre ASC
        `;
        const searchTerm = `%${ciudad}%`;
        const [rows] = await db.execute(query, [searchTerm]);
        return rows;
    }
    
    // Buscar lugares por comuna
    static async buscarLugaresPorComuna(comuna) {
        const query = `
            SELECT 
                el.*, 
                e.emp_nombre as empresa_nombre
            FROM empresa_lugar el
            INNER JOIN empresa e ON el.empresa_id = e.empresa_id
            WHERE el.comuna LIKE ? 
            ORDER BY e.emp_nombre ASC, el.nombre ASC
        `;
        const searchTerm = `%${comuna}%`;
        const [rows] = await db.execute(query, [searchTerm]);
        return rows;
    }
    
    // Buscar lugares cercanos por coordenadas (radio en km)
    static async buscarLugaresCercanos(lat, lon, radioKm = 1) {
        const query = `
            SELECT 
                el.*, 
                e.emp_nombre as empresa_nombre,
                (6371 * acos(
                    cos(radians(?)) * cos(radians(el.lat)) * 
                    cos(radians(el.lon) - radians(?)) + 
                    sin(radians(?)) * sin(radians(el.lat))
                )) AS distancia_km
            FROM empresa_lugar el
            INNER JOIN empresa e ON el.empresa_id = e.empresa_id
            WHERE el.lat IS NOT NULL AND el.lon IS NOT NULL
            HAVING distancia_km <= ?
            ORDER BY distancia_km ASC
        `;
        const [rows] = await db.execute(query, [lat, lon, lat, radioKm]);
        return rows;
    }
    
    // Actualizar lugar
    static async updateLugar(lugar_id, lugarData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const lugarQuery = `
                UPDATE empresa_lugar 
                SET empresa_id = ?, nombre = ?, calle = ?, numero = ?, 
                    piso = ?, oficina = ?, comuna = ?, ciudad = ?, 
                    region = ?, lat = ?, lon = ?, estado = ?, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE lugar_id = ?
            `;
            await connection.execute(lugarQuery, [
                lugarData.empresa_id,
                lugarData.nombre || '',
                lugarData.calle || '',
                lugarData.numero || '',
                lugarData.piso || '',
                lugarData.oficina || '',
                lugarData.comuna || '',
                lugarData.ciudad || '',
                lugarData.region || '',
                lugarData.lat || null,
                lugarData.lon || null,
                lugarData.estado,
                lugar_id
            ]);
            await connection.commit();
            // Recuperar y devolver la fila actualizada
            const [updatedRows] = await connection.execute(
                'SELECT * FROM empresa_lugar WHERE lugar_id = ?', 
                [lugar_id]
            );
            return updatedRows[0] || null;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Desactivar lugar (soft delete)
    static async desactivarLugar(lugar_id) {
        const query = `
            UPDATE empresa_lugar 
            SET estado = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE lugar_id = ?
        `;
        const [result] = await db.execute(query, [lugar_id]);
        return result.affectedRows > 0;
    }
    
    // Activar lugar
    static async activarLugar(lugar_id) {
        const query = `
            UPDATE empresa_lugar 
            SET estado = 1, updated_at = CURRENT_TIMESTAMP 
            WHERE lugar_id = ?
        `;
        const [result] = await db.execute(query, [lugar_id]);
        return result.affectedRows > 0;
    }
    
    // Eliminar lugar permanentemente
    static async deleteLugar(lugar_id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // Obtener la fila antes de eliminar
            const [rowsBefore] = await connection.execute(
                'SELECT * FROM empresa_lugar WHERE lugar_id = ?', 
                [lugar_id]
            );
            if (rowsBefore.length === 0) {
                throw new Error('Lugar no encontrado');
            }
            const rowBefore = rowsBefore[0];
            // Eliminar lugar
            await connection.execute('DELETE FROM empresa_lugar WHERE lugar_id = ?', [lugar_id]);
            await connection.commit();
            return rowBefore;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Métodos para estadísticas
    static async contarLugares() {
        try {
            // Contar lugares activos (estado = 1)
            const [activosResult] = await db.execute(
                'SELECT COUNT(*) as total FROM empresa_lugar WHERE estado = 1'
            );
            const activos = activosResult[0].total;

            // Contar total de lugares
            const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM empresa_lugar');
            const total = totalResult[0].total;

            // Contar lugares por empresa
            const [porEmpresaResult] = await db.execute(`
                SELECT e.emp_nombre, COUNT(el.lugar_id) as cantidad
                FROM empresa e
                LEFT JOIN empresa_lugar el ON e.empresa_id = el.empresa_id
                GROUP BY e.empresa_id, e.emp_nombre
                ORDER BY cantidad DESC
            `);

            return {
                total: total,
                activos: activos,
                porEmpresa: porEmpresaResult
            };
        } catch (error) {
            console.error('Error al contar lugares:', error);
            return { total: 0, activos: 0, porEmpresa: [] };
        }
    }

    // Contar lugares por empresa específica
    static async contarLugaresByEmpresa(empresa_id) {
        try {
            const [result] = await db.execute(
                'SELECT COUNT(*) as total FROM empresa_lugar WHERE empresa_id = ?',
                [empresa_id]
            );
            return result[0].total;
        } catch (error) {
            console.error('Error al contar lugares por empresa:', error);
            return 0;
        }
    }
}

export default EmpresaLugarModel;
