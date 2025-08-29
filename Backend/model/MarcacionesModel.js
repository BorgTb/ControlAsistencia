import pool from '../config/dbconfig.js';

class Marcaciones {
    async createMarcacion(data) {
        const query = `
            INSERT INTO marcaciones (
                usuario_empresa_id, fecha, hora, tipo, hash, ip_origen, geo_lat, geo_lon
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

    async getMarcacionesByUsuario(usuario_empresa_id, fecha = null) {
        let query = `
            SELECT * FROM marcaciones
            WHERE usuario_empresa_id = ?
        `;
        let params = [usuario_empresa_id];
        
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
            SELECT 
                m.*,
                ue.usuario_id,
                u.nombre,
                u.apellido,
                u.email 
            FROM marcaciones m
            LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            WHERE m.id = ?
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
    async obtenerEntradaPorUsuario(usuario_empresa_id, fecha) {
        console.log(usuario_empresa_id);
        console.log(fecha);
        const query = `
            SELECT * FROM marcaciones
            WHERE usuario_empresa_id = ? AND tipo = 'entrada' AND DATE(fecha) = ?
        `;
        const [rows] = await pool.execute(query, [usuario_empresa_id, fecha]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    async obtenerSalidaPorUsuario(usuario_empresa_id, fecha) {
        console.log(usuario_empresa_id);
        console.log(fecha);
        const query = `
            SELECT * FROM marcaciones
            WHERE usuario_empresa_id = ? AND tipo = 'salida' AND DATE(fecha) = ?
        `;
        const [rows] = await pool.execute(query, [usuario_empresa_id, fecha]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    async obtenerTodasLasMarcaciones() {
        const query = `
            SELECT 
                m.*,
                ue.usuario_id,
                u.nombre,
                u.apellido,
                u.rut,
                e.emp_nombre as empresa_nombre
            FROM marcaciones m
            LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            ORDER BY m.fecha DESC, m.hora DESC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    async obtenerMarcacionesPorRutYFecha(rutUsuario, fecha) {
        const query = `
            SELECT 
                m.*,
                u.nombre,
                u.apellido,
                u.rut
            FROM marcaciones m
            LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            WHERE u.rut = ? 
            AND DATE(m.fecha) = ?
            ORDER BY m.fecha DESC, m.hora DESC
        `;
        const [rows] = await pool.execute(query, [rutUsuario, fecha]);
        return rows;
    }

    async obtenerMarcacionesPorRutUsuario(rutUsuario) {
        const query = `
            SELECT 
                m.*,
                u.nombre,
                u.apellido,
                u.rut
            FROM marcaciones m
            LEFT JOIN usuarios_empresas ue ON m.usuario_empresa_id = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            WHERE u.rut = ?
            ORDER BY m.fecha DESC, m.hora DESC
        `;
        const [rows] = await pool.execute(query, [rutUsuario]);
        return rows;
    }
    async obtenerMarcacionesPorEmpresaRut(rutEmpresa) {
        const query = `SELECT marcaciones.lugar_id, marcaciones.mandante_id, marcaciones.fecha,marcaciones.hora,marcaciones.tipo,marcaciones.hash,marcaciones.ip_origen,marcaciones.geo_lat,marcaciones.geo_lon,marcaciones.created_at,
usuarios.nombre,usuarios.apellido,usuarios.rut,usuarios.id as usuario_id,
usuarios_empresas.rol_en_empresa
FROM marcaciones 
INNER JOIN usuarios_empresas ON marcaciones.usuario_empresa_id = usuarios_empresas.id
INNER JOIN empresa ON empresa.empresa_id = usuarios_empresas.empresa_id
INNER JOIN usuarios ON usuarios_empresas.usuario_id = usuarios.id
WHERE empresa.emp_rut = ?`;
        const [rows] = await pool.execute(query, [rutEmpresa]);
        return rows;
    }
}

export default new Marcaciones();
