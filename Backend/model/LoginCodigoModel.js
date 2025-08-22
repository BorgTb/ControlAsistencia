import pool from '../config/dbconfig.js';

class LoginCodigoModel {
    // Crear código temporal
    async createCodigoTemporal(data) {
        const query = `INSERT INTO login_codigos (email, codigo, expires_at) VALUES (?, ?, ?)`;
        const values = [data.email, data.codigo, data.expires_at];
        const [result] = await pool.execute(query, values);
        return { id: result.insertId, ...data };
    }

    // Buscar código válido por email
    async findValidCodeByEmail(email) {
        const query = `
            SELECT * FROM login_codigos 
            WHERE email = ? 
            AND verificado = FALSE 
            AND expires_at > NOW() 
            ORDER BY creado_en DESC 
            LIMIT 1
        `;
        const [rows] = await pool.execute(query, [email]);
        return rows[0] || null;
    }

    // Buscar código válido por código
    async findValidCodeByCode(codigo) {
        const query = `
            SELECT * FROM login_codigos 
            WHERE codigo = ? 
            AND expires_at > NOW()
        `;
        const [rows] = await pool.execute(query, [codigo]);
        return rows[0] || null;
    }

    // Marcar código como verificado
    async markAsVerified(id) {
        const query = `UPDATE login_codigos SET verificado = TRUE WHERE id = ?`;
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Invalidar códigos anteriores del usuario por email
    async invalidateUserCodes(email) {
        const query = `UPDATE login_codigos SET verificado = TRUE WHERE email = ? AND verificado = FALSE`;
        const [result] = await pool.execute(query, [email]);
        return result.affectedRows;
    }

    // Limpiar códigos expirados
    async cleanExpiredCodes() {
        const query = `DELETE FROM login_codigos WHERE expires_at < NOW()`;
        const [result] = await pool.execute(query);
        return result.affectedRows;
    }

    // Obtener código por ID
    async findById(id) {
        const query = `SELECT * FROM login_codigos WHERE id = ?`;
        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    }
}

export default new LoginCodigoModel();