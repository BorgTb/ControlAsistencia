import db from '../config/dbconfig.js';

class EmpresaModel {
    
    // Crear una nueva empresa
    static async createEmpresa(empresaData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Crear la empresa primero
            const empresaQuery = `
                INSERT INTO empresa (emp_nombre, emp_rut, estado, created_at, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;

            const [empresaResult] = await connection.execute(empresaQuery, [
                empresaData.emp_nombre,
                empresaData.emp_rut,
                empresaData.estado || 1
            ]);

            const empresaId = empresaResult.insertId;

            // Crear el registro de dirección en empresa_lugar vinculado por empresa_id
            const lugarQuery = `
                INSERT INTO empresa_lugar (empresa_id, nombre, calle, numero, piso, oficina, comuna, ciudad, region, lat, lon, estado, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;

            const [lugarResult] = await connection.execute(lugarQuery, [
                empresaId,
                empresaData.direccion?.nombre || empresaData.emp_nombre,
                empresaData.direccion?.calle || '',
                empresaData.direccion?.numero || '',
                empresaData.direccion?.piso || null,
                empresaData.direccion?.oficina || null,
                empresaData.direccion?.comuna || '',
                empresaData.direccion?.ciudad || '',
                empresaData.direccion?.region || '',
                empresaData.direccion?.lat || null,
                empresaData.direccion?.lon || null,
                empresaData.direccion?.estado || 1
            ]);

            const lugarId = lugarResult.insertId;

            await connection.commit();

            // Devolver la fila creada (empresa + empresa_lugar)
            const fetchQuery = `
                SELECT 
                    e.empresa_id,
                    e.emp_nombre,
                    e.emp_rut,
                    e.estado as empresa_estado,
                    e.created_at as empresa_created_at,
                    e.updated_at as empresa_updated_at,
                    l.lugar_id,
                    l.nombre as lugar_nombre,
                    l.calle,
                    l.numero,
                    l.piso,
                    l.oficina,
                    l.comuna,
                    l.ciudad,
                    l.region,
                    l.lat,
                    l.lon,
                    l.estado as lugar_estado
                FROM empresa e
                LEFT JOIN empresa_lugar l ON e.empresa_id = l.empresa_id
                WHERE e.empresa_id = ?
            `;

            const [createdRows] = await connection.execute(fetchQuery, [empresaId]);
            return createdRows[0] || null;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Obtener todas las empresas con su información de lugar
    static async getAllEmpresas() {
        const query = `
            SELECT 
                e.empresa_id as id,
                e.emp_nombre as nombre,
                e.emp_rut as rut,
                e.estado as activa,
                e.created_at as empresa_created_at,
                e.updated_at as empresa_updated_at,
                l.lugar_id,
                l.nombre as lugar_nombre,
                l.calle,
                l.numero,
                l.piso,
                l.oficina,
                l.comuna,
                l.ciudad,
                l.region,
                l.lat,
                l.lon,
                l.estado as lugar_estado
            FROM empresa e
            LEFT JOIN empresa_lugar l ON e.empresa_id = l.empresa_id
            ORDER BY e.emp_nombre ASC
        `;
        
        const [rows] = await db.execute(query);
       return rows
    }
    
    // Obtener empresa por ID
    static async getEmpresaById(empresa_id) {
        const query = `
            SELECT 
                e.empresa_id,
                e.emp_nombre,
                e.emp_rut,
                e.estado as empresa_estado,
                e.created_at as empresa_created_at,
                e.updated_at as empresa_updated_at,
                l.lugar_id,
                l.nombre as lugar_nombre,
                l.calle,
                l.numero,
                l.piso,
                l.oficina,
                l.comuna,
                l.ciudad,
                l.region,
                l.lat,
                l.lon,
                l.estado as lugar_estado
            FROM empresa e
            LEFT JOIN empresa_lugar l ON e.empresa_id = l.empresa_id
            WHERE e.empresa_id = ?
        `;
        
        const [rows] = await db.execute(query, [empresa_id]);
        
        if (rows.length === 0) {
            return null;
        }

        // Devolver la fila tal como viene de la base de datos
        return rows[0];
    }
    
    // Obtener empresa por RUT
    static async getEmpresaByRut(emp_rut) {
        const query = `
            SELECT 
                e.empresa_id,
                e.emp_nombre,
                e.emp_rut,
                e.estado as empresa_estado,
                e.created_at as empresa_created_at,
                e.updated_at as empresa_updated_at,
                l.lugar_id,
                l.nombre as lugar_nombre,
                l.calle,
                l.numero,
                l.piso,
                l.oficina,
                l.comuna,
                l.ciudad,
                l.region,
                l.lat,
                l.lon,
                l.estado as lugar_estado
            FROM empresa e
            LEFT JOIN empresa_lugar l ON e.empresa_id = l.empresa_id
            WHERE e.emp_rut = ?
        `;
        
        const [rows] = await db.execute(query, [emp_rut]);
        
        if (rows.length === 0) {
            return null;
        }

        // Devolver la fila tal como viene de la base de datos
        return rows[0];
    }
    
    // Obtener empresas activas
    static async getEmpresasActivas() {
        const query = `
            SELECT 
                e.empresa_id,
                e.emp_nombre,
                e.emp_rut,
                e.estado as empresa_estado,
                e.created_at as empresa_created_at,
                e.updated_at as empresa_updated_at,
                l.lugar_id,
                l.nombre as lugar_nombre,
                l.calle,
                l.numero,
                l.piso,
                l.oficina,
                l.comuna,
                l.ciudad,
                l.region,
                l.lat,
                l.lon,
                l.estado as lugar_estado
            FROM empresa e
            LEFT JOIN empresa_lugar l ON e.empresa_id = l.empresa_id
            WHERE e.estado = 1
            ORDER BY e.emp_nombre ASC
        `;
    const [rows] = await db.execute(query);
    // Devolver las filas crudas tal como vienen de la BD
    return rows;
    }
    
    // Buscar empresas por nombre
    static async buscarEmpresasPorNombre(nombre) {
        const query = `
            SELECT 
                e.empresa_id,
                e.emp_nombre,
                e.emp_rut,
                e.estado as empresa_estado,
                e.created_at as empresa_created_at,
                e.updated_at as empresa_updated_at,
                l.lugar_id,
                l.nombre as lugar_nombre,
                l.calle,
                l.numero,
                l.piso,
                l.oficina,
                l.comuna,
                l.ciudad,
                l.region,
                l.lat,
                l.lon,
                l.estado as lugar_estado
            FROM empresa e
            LEFT JOIN empresa_lugar l ON e.empresa_id = l.empresa_id
            WHERE e.emp_nombre LIKE ?
            ORDER BY e.emp_nombre ASC
        `;
        
        const searchTerm = `%${nombre}%`;
    const [rows] = await db.execute(query, [searchTerm]);
    // Devolver las filas crudas tal como vienen de la BD
    return rows;
    }
    
    // Actualizar empresa
    static async updateEmpresa(empresa_id, empresaData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Actualizar empresa
            const empresaQuery = `
                UPDATE empresa 
                SET emp_nombre = ?, emp_rut = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
                WHERE empresa_id = ?
            `;
            
            await connection.execute(empresaQuery, [
                empresaData.emp_nombre,
                empresaData.emp_rut,
                empresaData.estado,
                empresa_id
            ]);
            
            // Si hay datos de dirección, actualizar empresa_lugar (por empresa_id)
            if (empresaData.direccion) {
                const lugarQuery = `
                    UPDATE empresa_lugar 
                    SET nombre = ?, calle = ?, numero = ?, piso = ?, oficina = ?, 
                        comuna = ?, ciudad = ?, region = ?, lat = ?, lon = ?, 
                        estado = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE empresa_id = ?
                `;

                await connection.execute(lugarQuery, [
                    empresaData.direccion.nombre,
                    empresaData.direccion.calle,
                    empresaData.direccion.numero,
                    empresaData.direccion.piso,
                    empresaData.direccion.oficina,
                    empresaData.direccion.comuna,
                    empresaData.direccion.ciudad,
                    empresaData.direccion.region,
                    empresaData.direccion.lat,
                    empresaData.direccion.lon,
                    empresaData.direccion.estado,
                    empresa_id
                ]);
            }
            
            await connection.commit();

            // Recuperar y devolver la fila actualizada
            const fetchQuery = `
                SELECT 
                    e.empresa_id,
                    e.emp_nombre,
                    e.emp_rut,
                    e.estado as empresa_estado,
                    e.created_at as empresa_created_at,
                    e.updated_at as empresa_updated_at,
                    l.lugar_id,
                    l.nombre as lugar_nombre,
                    l.calle,
                    l.numero,
                    l.piso,
                    l.oficina,
                    l.comuna,
                    l.ciudad,
                    l.region,
                    l.lat,
                    l.lon,
                    l.estado as lugar_estado
                FROM empresa e
                LEFT JOIN empresa_lugar l ON e.empresa_id = l.empresa_id
                WHERE e.empresa_id = ?
            `;

            const [updatedRows] = await connection.execute(fetchQuery, [empresa_id]);
            return updatedRows[0] || null;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Desactivar empresa (soft delete)
    static async desactivarEmpresa(empresa_id) {
        const query = `
            UPDATE empresa 
            SET estado = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE empresa_id = ?
        `;
        
        const [result] = await db.execute(query, [empresa_id]);
        return result.affectedRows > 0;
    }
    
    // Activar empresa
    static async activarEmpresa(empresa_id) {
        const query = `
            UPDATE empresa 
            SET estado = 1, updated_at = CURRENT_TIMESTAMP 
            WHERE empresa_id = ?
        `;
        
        const [result] = await db.execute(query, [empresa_id]);
        return result.affectedRows > 0;
    }
    
    // Eliminar empresa permanentemente
    static async deleteEmpresa(empresa_id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Obtener la fila completa antes de eliminar
            const fetchQuery = `
                SELECT 
                    e.empresa_id,
                    e.emp_nombre,
                    e.emp_rut,
                    e.estado as empresa_estado,
                    e.created_at as empresa_created_at,
                    e.updated_at as empresa_updated_at,
                    l.lugar_id,
                    l.nombre as lugar_nombre,
                    l.calle,
                    l.numero,
                    l.piso,
                    l.oficina,
                    l.comuna,
                    l.ciudad,
                    l.region,
                    l.lat,
                    l.lon,
                    l.estado as lugar_estado
                FROM empresa e
                LEFT JOIN empresa_lugar l ON e.empresa_id = l.empresa_id
                WHERE e.empresa_id = ?
            `;

            const [rowsBefore] = await connection.execute(fetchQuery, [empresa_id]);
            if (rowsBefore.length === 0) {
                throw new Error('Empresa no encontrada');
            }

            const rowBefore = rowsBefore[0];

            // Eliminar empresa
            await connection.execute('DELETE FROM empresa WHERE empresa_id = ?', [empresa_id]);

            // Eliminar registros de empresa_lugar asociados
            await connection.execute('DELETE FROM empresa_lugar WHERE empresa_id = ?', [empresa_id]);

            await connection.commit();
            // Devolver la fila que se eliminó (tal como venía de la BD)
            return rowBefore;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default EmpresaModel;
