import pool from '../config/dbconfig.js';

class TipoTurnosModel {
    static async getAll() {
        const query = `SELECT * FROM tipo_turnos ORDER BY nombre`;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async getById(id) {
        const query = `SELECT * FROM tipo_turnos WHERE id = ?`;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    static async create(data) {
        const query = `
            INSERT INTO tipo_turnos (nombre, descripcion, hora_inicio, hora_fin, colacion_inicio, colacion_fin, dias_trabajo, dias_descanso)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            data.nombre,
            data.descripcion || null,
            data.hora_inicio,
            data.hora_fin,
            data.colacion_inicio || null,
            data.colacion_fin || null,
            data.dias_trabajo || 5,
            data.dias_descanso || 2
        ]);
        return result.insertId;
    }

    static async update(id, data) {
        const query = `
            UPDATE tipo_turnos 
            SET nombre = ?, descripcion = ?, hora_inicio = ?, hora_fin = ?, 
                colacion_inicio = ?, colacion_fin = ?, dias_trabajo = ?, dias_descanso = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [
            data.nombre,
            data.descripcion || null,
            data.hora_inicio,
            data.hora_fin,
            data.colacion_inicio || null,
            data.colacion_fin || null,
            data.dias_trabajo || 5,
            data.dias_descanso || 2,
            id
        ]);
        return result.affectedRows;
    }

    static async delete(id) {
        const query = `DELETE FROM tipo_turnos WHERE id = ?`;
        const [result] = await pool.query(query, [id]);
        return result.affectedRows;
    }
}

export default TipoTurnosModel;
