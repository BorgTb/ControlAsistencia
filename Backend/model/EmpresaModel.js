import db from '../config/dbconfig.js';

class EmpresaModel {
    
    // Crear una nueva empresa SOLO en la tabla empresa
    static async createEmpresa(empresaData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const empresaQuery = `
                INSERT INTO empresa (emp_nombre, emp_rut, emp_telefono, emp_descripcion, estado, grup_emp_idn, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            const [empresaResult] = await connection.execute(empresaQuery, [
                empresaData.emp_nombre,
                empresaData.emp_rut,
                empresaData.emp_telefono || '',
                empresaData.emp_descripcion || '',
                empresaData.estado || 1,
                null // grup_emp_idn por defecto null
            ]);
            const empresaId = empresaResult.insertId;
            await connection.commit();
            // Devolver la fila creada
            const [createdRows] = await connection.execute(
                'SELECT * FROM empresa WHERE empresa_id = ?',
                [empresaId]
            );
            return createdRows[0] || null;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Obtener todas las empresas SOLO de la tabla empresa
    static async getAllEmpresas() {
        const query = `
            SELECT empresa_id as id, emp_nombre as nombre, emp_rut as rut, emp_telefono as telefono, emp_descripcion as descripcion, estado as activa, grup_emp_idn, created_at, updated_at
            FROM empresa
            ORDER BY emp_nombre ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Obtener empresa por ID SOLO de la tabla empresa
    static async getEmpresaById(empresa_id) {
        const query = `
            SELECT * FROM empresa WHERE empresa_id = ?
        `;
        const [rows] = await db.execute(query, [empresa_id]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    
    // Obtener empresa por RUT SOLO de la tabla empresa
    static async getEmpresaByRut(emp_rut) {
        const query = `SELECT * FROM empresa WHERE emp_rut = ?`;
        const [rows] = await db.execute(query, [emp_rut]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    
    // Obtener empresas activas SOLO de la tabla empresa
    static async getEmpresasActivas() {
        const query = `
            SELECT * FROM empresa WHERE estado = 1 ORDER BY emp_nombre ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Buscar empresas por nombre SOLO en la tabla empresa
    static async buscarEmpresasPorNombre(nombre) {
        const query = `SELECT * FROM empresa WHERE emp_nombre LIKE ? ORDER BY emp_nombre ASC`;
        const searchTerm = `%${nombre}%`;
        const [rows] = await db.execute(query, [searchTerm]);
        return rows;
    }
    
    // Actualizar empresa SOLO en la tabla empresa
    static async updateEmpresa(empresa_id, empresaData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const empresaQuery = `
                UPDATE empresa 
                SET emp_nombre = ?, emp_rut = ?, emp_telefono = ?, emp_descripcion = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
                WHERE empresa_id = ?
            `;
            await connection.execute(empresaQuery, [
                empresaData.emp_nombre,
                empresaData.emp_rut,
                empresaData.emp_telefono || '',
                empresaData.emp_descripcion || '',
                empresaData.estado,
                empresa_id
            ]);
            await connection.commit();
            // Recuperar y devolver la fila actualizada
            const [updatedRows] = await connection.execute('SELECT * FROM empresa WHERE empresa_id = ?', [empresa_id]);
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
    
    // Eliminar empresa permanentemente SOLO de la tabla empresa
    static async deleteEmpresa(empresa_id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // Obtener la fila antes de eliminar
            const [rowsBefore] = await connection.execute('SELECT * FROM empresa WHERE empresa_id = ?', [empresa_id]);
            if (rowsBefore.length === 0) {
                throw new Error('Empresa no encontrada');
            }
            const rowBefore = rowsBefore[0];
            // Eliminar empresa
            await connection.execute('DELETE FROM empresa WHERE empresa_id = ?', [empresa_id]);
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
    static async contarEmpresas() {
        try {
            // Contar empresas activas (estado = 1)
            const [activasResult] = await db.execute('SELECT COUNT(*) as total FROM empresa WHERE estado = 1');
            const activas = activasResult[0].total;

            // Contar total de empresas
            const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM empresa');
            const total = totalResult[0].total;

            // Estimación del mes anterior (para el cálculo de cambio)
            const mesAnterior = Math.max(0, total - Math.floor(total * 0.05));

            return {
                total: total,
                activas: activas,
                mesAnterior: mesAnterior
            };
        } catch (error) {
            console.error('Error al contar empresas:', error);
            return { total: 0, activas: 0, mesAnterior: 0 };
        }
    }
}

export default EmpresaModel;
