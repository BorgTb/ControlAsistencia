import pool from '../config/dbconfig.js';

class Usuario {
    constructor(id, nombre, email, password, rol, rut, estado, created_at) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.rut = rut;
        this.estado = estado;
        this.created_at = created_at;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        return rows.length ? new Usuario(...Object.values(rows[0])) : null;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows.length ? new Usuario(...Object.values(rows[0])) : null;
    }

    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        return rows.map(row => new Usuario(...Object.values(row)));
    }

    static async findAllWorkers() {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE rol = "trabajador"');
        return rows.map(row => new Usuario(...Object.values(row)));
    }

    static async create(data) {
        const { nombre, email, password, rol, rut, estado } = data;
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol, rut, estado) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, password, rol, rut, estado]
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

export default Usuario;