import pool from '../config/dbconfig.js';

class UserModel {
    /**
     * Obtiene todos los usuarios cuyo rol es 'admin'.
     * Útil para paneles de gestión y auditoría de administradores.
     */
    static async findAllAdmins() {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE rol = "admin"');
        return rows;
    }
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows.length ? rows[0] : null;
    }
    
    static async findByRut(rut) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE rut = ?', [rut]);
        return rows.length ? rows[0] : null;
    }

    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        return rows;
    }

    static async getAllUsers() {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        return rows;
    }

    static async findAllWorkers() {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE rol = "trabajador"');
        return rows;
    }

    static async create(data) {
        const { nombre, apellido_pat, apellido_mat, email, password, rol, rut, estado } = data;
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, apellido_pat, apellido_mat, email, password, rol, rut, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido_pat || null, apellido_mat || null, email, password, rol, rut, estado]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        await pool.query(`UPDATE usuarios SET ${fields} WHERE id = ?`, values);
    }

    static async delete(id) {
        await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    }
}

export default UserModel;