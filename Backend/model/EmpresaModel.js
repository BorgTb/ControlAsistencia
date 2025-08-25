import db from '../config/dbconfig.js';

class EmpresaModel {
    
    // Crear una nueva empresa
    static async createEmpresa(empresaData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Crear primero el lugar (dirección)
            const lugarQuery = `
                INSERT INTO lugar (nombre, calle, numero, piso, oficina, comuna, ciudad, region, lat, lon, estado, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            
            const [lugarResult] = await connection.execute(lugarQuery, [
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
            
            // Crear la empresa
            const empresaQuery = `
                INSERT INTO empresa (emp_nombre, emp_rut, estado, created_at, updated_at, grupo_emp_idn)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
            `;
            
            const [empresaResult] = await connection.execute(empresaQuery, [
                empresaData.emp_nombre,
                empresaData.emp_rut,
                empresaData.estado || 1,
                lugarId
            ]);
            
            await connection.commit();
            
            return {
                empresa_id: empresaResult.insertId,
                lugar_id: lugarId,
                ...empresaData
            };
            
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
            LEFT JOIN lugar l ON e.grupo_emp_idn = l.lugar_id
            ORDER BY e.emp_nombre ASC
        `;
        
        const [rows] = await db.execute(query);
        return rows.map(row => ({
            empresa_id: row.empresa_id,
            emp_nombre: row.emp_nombre,
            emp_rut: row.emp_rut,
            estado: row.empresa_estado,
            created_at: row.empresa_created_at,
            updated_at: row.empresa_updated_at,
            direccion: {
                lugar_id: row.lugar_id,
                nombre: row.lugar_nombre,
                calle: row.calle,
                numero: row.numero,
                piso: row.piso,
                oficina: row.oficina,
                comuna: row.comuna,
                ciudad: row.ciudad,
                region: row.region,
                lat: row.lat,
                lon: row.lon,
                estado: row.lugar_estado
            }
        }));
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
            LEFT JOIN lugar l ON e.grupo_emp_idn = l.lugar_id
            WHERE e.empresa_id = ?
        `;
        
        const [rows] = await db.execute(query, [empresa_id]);
        
        if (rows.length === 0) {
            return null;
        }
        
        const row = rows[0];
        return {
            empresa_id: row.empresa_id,
            emp_nombre: row.emp_nombre,
            emp_rut: row.emp_rut,
            estado: row.empresa_estado,
            created_at: row.empresa_created_at,
            updated_at: row.empresa_updated_at,
            direccion: {
                lugar_id: row.lugar_id,
                nombre: row.lugar_nombre,
                calle: row.calle,
                numero: row.numero,
                piso: row.piso,
                oficina: row.oficina,
                comuna: row.comuna,
                ciudad: row.ciudad,
                region: row.region,
                lat: row.lat,
                lon: row.lon,
                estado: row.lugar_estado
            }
        };
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
            LEFT JOIN lugar l ON e.grupo_emp_idn = l.lugar_id
            WHERE e.emp_rut = ?
        `;
        
        const [rows] = await db.execute(query, [emp_rut]);
        
        if (rows.length === 0) {
            return null;
        }
        
        const row = rows[0];
        return {
            empresa_id: row.empresa_id,
            emp_nombre: row.emp_nombre,
            emp_rut: row.emp_rut,
            estado: row.empresa_estado,
            created_at: row.empresa_created_at,
            updated_at: row.empresa_updated_at,
            direccion: {
                lugar_id: row.lugar_id,
                nombre: row.lugar_nombre,
                calle: row.calle,
                numero: row.numero,
                piso: row.piso,
                oficina: row.oficina,
                comuna: row.comuna,
                ciudad: row.ciudad,
                region: row.region,
                lat: row.lat,
                lon: row.lon,
                estado: row.lugar_estado
            }
        };
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
            LEFT JOIN lugar l ON e.grupo_emp_idn = l.lugar_id
            WHERE e.estado = 1
            ORDER BY e.emp_nombre ASC
        `;
        
        const [rows] = await db.execute(query);
        return rows.map(row => ({
            empresa_id: row.empresa_id,
            emp_nombre: row.emp_nombre,
            emp_rut: row.emp_rut,
            estado: row.empresa_estado,
            created_at: row.empresa_created_at,
            updated_at: row.empresa_updated_at,
            direccion: {
                lugar_id: row.lugar_id,
                nombre: row.lugar_nombre,
                calle: row.calle,
                numero: row.numero,
                piso: row.piso,
                oficina: row.oficina,
                comuna: row.comuna,
                ciudad: row.ciudad,
                region: row.region,
                lat: row.lat,
                lon: row.lon,
                estado: row.lugar_estado
            }
        }));
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
            LEFT JOIN lugar l ON e.grupo_emp_idn = l.lugar_id
            WHERE e.emp_nombre LIKE ?
            ORDER BY e.emp_nombre ASC
        `;
        
        const searchTerm = `%${nombre}%`;
        const [rows] = await db.execute(query, [searchTerm]);
        
        return rows.map(row => ({
            empresa_id: row.empresa_id,
            emp_nombre: row.emp_nombre,
            emp_rut: row.emp_rut,
            estado: row.empresa_estado,
            created_at: row.empresa_created_at,
            updated_at: row.empresa_updated_at,
            direccion: {
                lugar_id: row.lugar_id,
                nombre: row.lugar_nombre,
                calle: row.calle,
                numero: row.numero,
                piso: row.piso,
                oficina: row.oficina,
                comuna: row.comuna,
                ciudad: row.ciudad,
                region: row.region,
                lat: row.lat,
                lon: row.lon,
                estado: row.lugar_estado
            }
        }));
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
            
            // Si hay datos de dirección, actualizar lugar
            if (empresaData.direccion) {
                const lugarQuery = `
                    UPDATE lugar 
                    SET nombre = ?, calle = ?, numero = ?, piso = ?, oficina = ?, 
                        comuna = ?, ciudad = ?, region = ?, lat = ?, lon = ?, 
                        estado = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE lugar_id = (SELECT grupo_emp_idn FROM empresa WHERE empresa_id = ?)
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
            return { success: true, message: 'Empresa actualizada exitosamente' };
            
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
            
            // Obtener lugar_id antes de eliminar
            const [empresa] = await connection.execute(
                'SELECT grupo_emp_idn FROM empresa WHERE empresa_id = ?', 
                [empresa_id]
            );
            
            if (empresa.length === 0) {
                throw new Error('Empresa no encontrada');
            }
            
            const lugar_id = empresa[0].grupo_emp_idn;
            
            // Eliminar empresa
            await connection.execute('DELETE FROM empresa WHERE empresa_id = ?', [empresa_id]);
            
            // Eliminar lugar si existe
            if (lugar_id) {
                await connection.execute('DELETE FROM lugar WHERE lugar_id = ?', [lugar_id]);
            }
            
            await connection.commit();
            return { success: true, message: 'Empresa eliminada exitosamente' };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default EmpresaModel;
