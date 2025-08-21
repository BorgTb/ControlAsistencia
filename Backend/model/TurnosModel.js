import pool from '../config/dbconfig.js'
import { DateTime } from 'luxon';


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

    static async getTurnosByUsuarioId(usuario_id) {
        const query = 'SELECT * FROM turnos WHERE usuario_id = ?';
        const [rows] = await pool.query(query, [usuario_id]);
        return rows;
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

    static async obtenerTurnoPorUsuarioYFecha(usuario_id, fecha) {
        // Convertir la fecha a día de la semana en español usando luxon
        const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        const fechaObj = DateTime.fromISO(fecha);
        const diaSemana = diasSemana[fechaObj.weekday - 1]; // Luxon weekday: 1 (lunes) to 7 (domingo)
        console.log(`Obteniendo turno para usuario_id: ${usuario_id}, día: ${diaSemana}`);  
        const query = `
            SELECT * FROM turnos 
            WHERE usuario_id = ? AND LOWER(dia) = LOWER(?)
            ORDER BY id DESC
            LIMIT 1
        `;
        const [rows] = await pool.query(query, [usuario_id, diaSemana]);
        return rows[0];
    }
}


export default TurnosModel;