import pool from '../config/dbconfig.js';

class Marcaciones {
    async createMarcacion(data) {
        const query = `
            INSERT INTO marcaciones (
                usuario_id, fecha, hora, tipo, hash, ip_origen, geo_lat, geo_lon
            ) VALUES (?, CURRENT_DATE(), CURRENT_TIME(), ?, ?, ?, ?, ?)
        `;
        const values = [
            data.usuario_id,
            data.tipo,
            data.hash,
            data.ip_origen,
            data.geo_lat,
            data.geo_lon
        ];
        const [result] = await pool.execute(query, values);
        return result;
    }

    async getMarcacionesByUsuario(usuario_id, fecha = null) {
        let query = `
            SELECT * FROM marcaciones
            WHERE usuario_id = ?
        `;
        let params = [usuario_id];
        
        if (fecha) {
            query += ` AND DATE(fecha) = ?`;
            params.push(fecha);
        }
        
        query += ` ORDER BY fecha DESC, hora DESC`;
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    async getMarcacionById(id) {
        const query = `
            SELECT * FROM marcaciones
            WHERE id = ?
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    async deleteMarcacion(id) {
        const query = `
            DELETE FROM marcaciones
            WHERE id = ?
        `;
        const [result] = await pool.execute(query, [id]);
        return result;
    }
    async obtenerEntradaPorUsuario(usuario_id, fecha) {
        console.log(usuario_id);
        console.log(fecha);
        const query = `
            SELECT * FROM marcaciones
            WHERE usuario_id = ? AND tipo = 'entrada' AND DATE(fecha) = ?
        `;
        const [rows] = await pool.execute(query, [usuario_id, fecha]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    async obtenerSalidaPorUsuario(usuario_id, fecha) {
        console.log(usuario_id);
        console.log(fecha);
        const query = `
            SELECT * FROM marcaciones
            WHERE usuario_id = ? AND tipo = 'salida' AND DATE(fecha) = ?
        `;
        const [rows] = await pool.execute(query, [usuario_id, fecha]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    async obtenerTodasLasMarcaciones() {
        const query = `
            SELECT * FROM marcaciones
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }
}

export default new Marcaciones();
