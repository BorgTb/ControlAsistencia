import pool from '../config/dbconfig.js'


class TurnosModel {
    static async getAllTurnos() {
        const query = `SELECT turnos.*,usuarios.nombre as trabajador_nombre
FROM turnos INNER JOIN usuarios
ON turnos.usuario_id = usuarios.id
;`;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async getTurnoById(id) {
        const query = 'SELECT * FROM turnos WHERE id = ?';
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    static async createTurno(turnoData) {
        const query = `
            INSERT INTO turnos (usuario_id, tipo, inicio, fin, motivo_modificacion, modificado_por, fecha_modificacion, colacion_inicio, colacion_fin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            turnoData.usuario_id,
            turnoData.tipo,
            turnoData.inicio,
            turnoData.fin,
            turnoData.motivo_modificacion,
            turnoData.modificado_por,
            turnoData.fecha_modificacion,
            turnoData.colacion_inicio,
            turnoData.colacion_fin,
        ];
        const [result] = await pool.query(query, values);
        return result.insertId;
    }

    static async updateTurno(id, turnoData) {
        const query = `
            UPDATE turnos
            SET usuario_id = ?, tipo = ?, inicio = ?, fin = ?, motivo_modificacion = ?, modificado_por = ?, fecha_modificacion = ?, colacion_inicio = ?, colacion_fin = ?
            WHERE id = ?
        `;
        const values = [
            turnoData.usuario_id,
            turnoData.tipo,
            turnoData.inicio,
            turnoData.fin,
            turnoData.motivo_modificacion,
            turnoData.modificado_por,
            turnoData.fecha_modificacion,
            turnoData.colacion_inicio,
            turnoData.colacion_fin,
            id,
        ];
        const [result] = await pool.query(query, values);
        return result.affectedRows;
    }

    static async deleteTurno(id) {
        const query = 'DELETE FROM turnos WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows;
    }
}

export default TurnosModel;