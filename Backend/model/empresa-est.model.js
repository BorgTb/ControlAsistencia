import db from '../config/dbconfig.js';

class EmpresaEstModel {
    // Crear un nuevo registro de empresa EST
    static async create(data) {
        const { empresa_id, est_registro_numero, est_registro_fecha, vigente = 1 } = data;
        const query = `
            INSERT INTO empresa_est (empresa_id, est_registro_numero, est_registro_fecha, vigente)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [empresa_id, est_registro_numero, est_registro_fecha, vigente]);
        return result;
    }

    // Obtener todos los registros
    static async findAll() {
        const query = `SELECT * FROM empresa_est`;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Obtener por empresa_id
    static async findByEmpresaId(empresa_id) {
        const query = `SELECT * FROM empresa_est WHERE empresa_id = ?`;
        const [rows] = await db.execute(query, [empresa_id]);
        return rows[0];
    }

    // Actualizar registro
    static async update(empresa_id, data) {
        const { est_registro_numero, est_registro_fecha, vigente } = data;
        const query = `
            UPDATE empresa_est 
            SET est_registro_numero = ?, est_registro_fecha = ?, vigente = ?
            WHERE empresa_id = ?
        `;
        const [result] = await db.execute(query, [est_registro_numero, est_registro_fecha, vigente, empresa_id]);
        return result;
    }

    // Eliminar registro
    static async delete(empresa_id) {
        const query = `DELETE FROM empresa_est WHERE empresa_id = ?`;
        const [result] = await db.execute(query, [empresa_id]);
        return result;
    }

    // Obtener registros vigentes
    static async findVigentes() {
        const query = `SELECT * FROM empresa_est WHERE vigente = 1`;
        const [rows] = await db.execute(query);
        return rows;
    }
}

export default EmpresaEstModel;