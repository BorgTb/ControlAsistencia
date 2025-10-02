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

    // Métodos para estadísticas
    static async contarUsuarios() {
        try {
            // Contar usuarios activos (estado = 1)
            const [activosResult] = await pool.query('SELECT COUNT(*) as total FROM usuarios WHERE estado = 1');
            const activos = activosResult[0].total;

            // Contar total de usuarios
            const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
            const total = totalResult[0].total;

            // Estimación del mes anterior (para el cálculo de cambio)
            const mesAnterior = Math.max(0, total - Math.floor(total * 0.1));

            return {
                total: total,
                activos: activos,
                mesAnterior: mesAnterior
            };
        } catch (error) {
            console.error('Error al contar usuarios:', error);
            return { total: 0, activos: 0, mesAnterior: 0 };
        }
    }

    static async obtenerDistribucionPorRol() {
        try {
            const [rows] = await pool.query(`
                SELECT rol, COUNT(*) as cantidad 
                FROM usuarios 
                WHERE estado = 1 
                GROUP BY rol
            `);
            
            const distribucion = {};
            rows.forEach(row => {
                distribucion[row.rol] = row.cantidad;
            });
            
            // Asegurar que todos los roles estén representados
            const rolesBase = ['admin', 'empleador', 'fiscalizador', 'trabajador'];
            rolesBase.forEach(rol => {
                if (!distribucion[rol]) {
                    distribucion[rol] = 0;
                }
            });
            
            return distribucion;
        } catch (error) {
            console.error('Error al obtener distribución por rol:', error);
            return { admin: 0, empleador: 0, fiscalizador: 0, trabajador: 0 };
        }
    }

    static async obtenerUsuariosRecientes(dias = 7) {
        try {
            // Obtener usuarios creados hoy
            const [hoyResult] = await pool.query(`
                SELECT COUNT(*) as total 
                FROM usuarios 
                WHERE DATE(created_at) = CURDATE()
            `);
            
            // Obtener usuarios creados hace 2 días
            const [dosDiasResult] = await pool.query(`
                SELECT COUNT(*) as total 
                FROM usuarios 
                WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 2 DAY)
            `);
            
            // Obtener usuarios creados en los últimos 7 días
            const [semanaResult] = await pool.query(`
                SELECT COUNT(*) as total 
                FROM usuarios 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            `, [dias]);
            
            return {
                hoy: hoyResult[0].total || 0,
                dosDias: dosDiasResult[0].total || 0,
                semana: semanaResult[0].total || 0
            };
        } catch (error) {
            console.error('Error al obtener usuarios recientes:', error);
            return { hoy: 0, dosDias: 0, semana: 0 };
        }
    }
}

export default UserModel;