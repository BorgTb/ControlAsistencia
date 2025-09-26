import pool from '../config/dbconfig.js';

class ReportesModel {
    
    // Crear un nuevo reporte de marcación
    static async create(data) {
        const { marcacion_id, usuario_id, tipo, tipo_problema, descripcion, fecha_correcta, hora_correcta, tipo_marcacion_correcta } = data;
        const [result] = await pool.query(
            'INSERT INTO reportes_marcaciones (marcacion_id, usuario_id, tipo, tipo_problema, descripcion, fecha_correcta, hora_correcta, tipo_marcacion_correcta, estado, fecha_reporte) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "PENDIENTE", CURRENT_TIMESTAMP)',
            [marcacion_id, usuario_id, tipo, tipo_problema, descripcion, fecha_correcta || null, hora_correcta || null, tipo_marcacion_correcta || null]
        );
        return result.insertId;
    }

    // Obtener reporte por ID
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM reportes_marcaciones WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
    }

    static async findByEmpresaId(empresa_id) {
        const [rows] = await pool.query(
            `SELECT rm.* FROM reportes_marcaciones rm
            JOIN usuarios_empresas ue ON rm.usuario_id = ue.id
            WHERE ue.empresa_id = ? ORDER BY rm.fecha_reporte DESC`,
            [empresa_id]
        );
        return rows;
    }

    // Obtener todos los reportes
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM reportes_marcaciones ORDER BY fecha_reporte DESC');
        return rows;
    }

    // Obtener reportes por usuario
    static async findByUsuarioId(usuario_id) {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE usuario_id = ? ORDER BY fecha_reporte DESC',
            [usuario_id]
        );
        return rows;
    }

    // Obtener reportes por marcación
    static async findByMarcacionId(marcacion_id) {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE marcacion_id = ? ORDER BY fecha_reporte DESC',
            [marcacion_id]
        );
        return rows;
    }

    // Obtener reportes por tipo de problema
    static async findByTipoProblema(tipo_problema) {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE tipo_problema = ? ORDER BY fecha_reporte DESC',
            [tipo_problema]
        );
        return rows;
    }

    // Obtener reportes por tipo
    static async findByTipo(tipo) {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE tipo = ? ORDER BY fecha_reporte DESC',
            [tipo]
        );
        return rows;
    }

    // Obtener reportes por tipo de marcación correcta
    static async findByTipoMarcacionCorrecta(tipo_marcacion_correcta) {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE tipo_marcacion_correcta = ? ORDER BY fecha_reporte DESC',
            [tipo_marcacion_correcta]
        );
        return rows;
    }

    // Obtener reportes por estado
    static async findByEstado(estado) {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE estado = ? ORDER BY fecha_reporte DESC',
            [estado]
        );
        return rows;
    }

    // Obtener reportes pendientes
    static async findPendientes() {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE estado = "PENDIENTE" ORDER BY fecha_reporte DESC'
        );
        return rows;
    }

    // Obtener reportes aprobados
    static async findAprobados() {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE estado = "APROBADA" ORDER BY fecha_reporte DESC'
        );
        return rows;
    }

    // Obtener reportes rechazados
    static async findRechazados() {
        const [rows] = await pool.query(
            'SELECT * FROM reportes_marcaciones WHERE estado = "RECHAZADA" ORDER BY fecha_reporte DESC'
        );
        return rows;
    }

    // Aprobar un reporte
    static async aprobar(id) {
        const [result] = await pool.query(
            'UPDATE reportes_marcaciones SET estado = "APROBADA" WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Rechazar un reporte
    static async rechazar(id) {
        const [result] = await pool.query(
            'UPDATE reportes_marcaciones SET estado = "RECHAZADA" WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Cambiar estado de un reporte
    static async cambiarEstado(id, estado) {
        // Validar que el estado sea válido
        const estadosValidos = ['APROBADA', 'PENDIENTE', 'RECHAZADA', 'POR CONFIRMAR'];
        if (!estadosValidos.includes(estado)) {
            throw new Error('Estado no válido');
        }
        
        const [result] = await pool.query(
            'UPDATE reportes_marcaciones SET estado = ? WHERE id = ?',
            [estado, id]
        );
        return result.affectedRows > 0;
    }

    // Obtener reportes con información completa (JOIN con usuarios y marcaciones)
    static async findWithFullInfo(reporteId = null) {
        let query = `
            SELECT 
                rm.id,
                rm.marcacion_id,
                rm.usuario_id,
                rm.tipo,
                rm.tipo_problema,
                rm.descripcion,
                rm.fecha_correcta,
                rm.hora_correcta,
                rm.tipo_marcacion_correcta,
                rm.estado,
                rm.fecha_reporte,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.email as usuario_email,
                u.rut as usuario_rut,
                m.fecha as marcacion_fecha,
                m.hora as marcacion_hora,
                m.tipo as marcacion_tipo,
                m.geo_lat as marcacion_lat,
                m.geo_lon as marcacion_lon,
                m.ip_origen as marcacion_ip
            FROM reportes_marcaciones rm
            LEFT JOIN usuarios u ON rm.usuario_id = u.id
            LEFT JOIN marcaciones m ON rm.marcacion_id = m.id
        `;
        
        const params = [];
        
        if (reporteId) {
            query += ' WHERE rm.id = ?';
            params.push(reporteId);
        }
        
        query += ' ORDER BY rm.fecha_reporte DESC';
        
        const [rows] = await pool.query(query, params);
        return reporteId ? (rows.length ? rows[0] : null) : rows;
    }

    // Obtener reportes por rango de fechas
    static async findByDateRange(fecha_inicio, fecha_fin) {
        const [rows] = await pool.query(
            `SELECT 
                rm.*,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.rut as usuario_rut,
                m.fecha as marcacion_fecha,
                m.hora as marcacion_hora,
                m.tipo as marcacion_tipo
            FROM reportes_marcaciones rm
            LEFT JOIN usuarios u ON rm.usuario_id = u.id
            LEFT JOIN marcaciones m ON rm.marcacion_id = m.id
            WHERE DATE(rm.fecha_reporte) BETWEEN ? AND ?
            ORDER BY rm.fecha_reporte DESC`,
            [fecha_inicio, fecha_fin]
        );
        return rows;
    }

    // Obtener reportes de un usuario por rango de fechas
    static async findByUsuarioAndDateRange(usuario_id, fecha_inicio, fecha_fin) {
        const [rows] = await pool.query(
            `SELECT 
                rm.*,
                m.fecha as marcacion_fecha,
                m.hora as marcacion_hora,
                m.tipo as marcacion_tipo
            FROM reportes_marcaciones rm
            LEFT JOIN marcaciones m ON rm.marcacion_id = m.id
            WHERE rm.usuario_id = ? 
            AND DATE(rm.fecha_reporte) BETWEEN ? AND ?
            ORDER BY rm.fecha_reporte DESC`,
            [usuario_id, fecha_inicio, fecha_fin]
        );
        return rows;
    }

    // Buscar reportes con filtros múltiples
    static async search(filtros = {}) {
        let query = `
            SELECT 
                rm.id,
                rm.marcacion_id,
                rm.usuario_id,
                rm.tipo,
                rm.tipo_problema,
                rm.descripcion,
                rm.fecha_correcta,
                rm.hora_correcta,
                rm.tipo_marcacion_correcta,
                rm.estado,
                rm.fecha_reporte,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                u.rut as usuario_rut,
                m.fecha as marcacion_fecha,
                m.hora as marcacion_hora,
                m.tipo as marcacion_tipo
            FROM reportes_marcaciones rm
            LEFT JOIN usuarios u ON rm.usuario_id = u.id
            LEFT JOIN marcaciones m ON rm.marcacion_id = m.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (filtros.usuario_id) {
            query += ' AND rm.usuario_id = ?';
            params.push(filtros.usuario_id);
        }
        
        if (filtros.tipo_problema) {
            query += ' AND rm.tipo_problema = ?';
            params.push(filtros.tipo_problema);
        }
        
        if (filtros.tipo) {
            query += ' AND rm.tipo = ?';
            params.push(filtros.tipo);
        }
        
        if (filtros.tipo_marcacion_correcta) {
            query += ' AND rm.tipo_marcacion_correcta = ?';
            params.push(filtros.tipo_marcacion_correcta);
        }
        
        if (filtros.fecha_desde) {
            query += ' AND DATE(rm.fecha_reporte) >= ?';
            params.push(filtros.fecha_desde);
        }
        
        if (filtros.fecha_hasta) {
            query += ' AND DATE(rm.fecha_reporte) <= ?';
            params.push(filtros.fecha_hasta);
        }
        
        if (filtros.usuario_rut) {
            query += ' AND u.rut = ?';
            params.push(filtros.usuario_rut);
        }
        
        if (filtros.marcacion_tipo) {
            query += ' AND m.tipo = ?';
            params.push(filtros.marcacion_tipo);
        }
        
        if (filtros.estado) {
            query += ' AND rm.estado = ?';
            params.push(filtros.estado);
        }
        
        query += ' ORDER BY rm.fecha_reporte DESC';
        
        if (filtros.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }
        
        const [rows] = await pool.query(query, params);
        return rows;
    }

    // Contar reportes por tipo de problema
    static async countByTipoProblema() {
        const [rows] = await pool.query(`
            SELECT 
                tipo_problema,
                COUNT(*) as total
            FROM reportes_marcaciones 
            GROUP BY tipo_problema
            ORDER BY total DESC
        `);
        return rows;
    }

    // Contar reportes por tipo
    static async countByTipo() {
        const [rows] = await pool.query(`
            SELECT 
                tipo,
                COUNT(*) as total
            FROM reportes_marcaciones 
            GROUP BY tipo
            ORDER BY total DESC
        `);
        return rows;
    }

    // Contar reportes por tipo de marcación correcta
    static async countByTipoMarcacionCorrecta() {
        const [rows] = await pool.query(`
            SELECT 
                tipo_marcacion_correcta,
                COUNT(*) as total
            FROM reportes_marcaciones 
            WHERE tipo_marcacion_correcta IS NOT NULL
            GROUP BY tipo_marcacion_correcta
            ORDER BY total DESC
        `);
        return rows;
    }

    // Contar reportes por estado
    static async countByEstado() {
        const [rows] = await pool.query(`
            SELECT 
                estado,
                COUNT(*) as total
            FROM reportes_marcaciones 
            GROUP BY estado
            ORDER BY total DESC
        `);
        return rows;
    }

    // Obtener estadísticas de reportes por estado y tipo
    static async getStatsCompletas() {
        const [rows] = await pool.query(`
            SELECT 
                estado,
                tipo,
                tipo_problema,
                tipo_marcacion_correcta,
                COUNT(*) as total
            FROM reportes_marcaciones 
            GROUP BY estado, tipo, tipo_problema, tipo_marcacion_correcta
            ORDER BY estado, total DESC
        `);
        return rows;
    }

    // Obtener estadísticas generales de reportes
    static async getStats() {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total_reportes,
                COUNT(DISTINCT usuario_id) as usuarios_reportantes,
                COUNT(DISTINCT marcacion_id) as marcaciones_reportadas,
                COUNT(DISTINCT tipo) as tipos_distintos,
                COUNT(DISTINCT tipo_problema) as tipos_problemas_distintos,
                COUNT(DISTINCT tipo_marcacion_correcta) as tipos_marcacion_correcta_distintos,
                SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'APROBADA' THEN 1 ELSE 0 END) as aprobadas,
                SUM(CASE WHEN estado = 'RECHAZADA' THEN 1 ELSE 0 END) as rechazadas,
                MIN(fecha_reporte) as primer_reporte,
                MAX(fecha_reporte) as ultimo_reporte
            FROM reportes_marcaciones
        `);
        return rows[0];
    }

    // Obtener estadísticas de reportes por usuario
    static async getStatsByUsuario(usuario_id) {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total_reportes,
                COUNT(DISTINCT tipo) as tipos_distintos,
                COUNT(DISTINCT tipo_problema) as tipos_problemas,
                COUNT(DISTINCT tipo_marcacion_correcta) as tipos_marcacion_correcta_distintos,
                MIN(fecha_reporte) as primer_reporte,
                MAX(fecha_reporte) as ultimo_reporte
            FROM reportes_marcaciones
            WHERE usuario_id = ?
        `, [usuario_id]);
        return rows[0];
    }

    // Verificar si existe un reporte para una marcación específica
    static async existsByMarcacionId(marcacion_id) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM reportes_marcaciones WHERE marcacion_id = ?',
            [marcacion_id]
        );
        return rows[0].count > 0;
    }

    // Actualizar un reporte
    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        const [result] = await pool.query(`UPDATE reportes_marcaciones SET ${fields} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    // Eliminar un reporte
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM reportes_marcaciones WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Eliminar todos los reportes de un usuario
    static async deleteByUsuarioId(usuario_id) {
        const [result] = await pool.query('DELETE FROM reportes_marcaciones WHERE usuario_id = ?', [usuario_id]);
        return result.affectedRows;
    }

    // Eliminar todos los reportes de una marcación
    static async deleteByMarcacionId(marcacion_id) {
        const [result] = await pool.query('DELETE FROM reportes_marcaciones WHERE marcacion_id = ?', [marcacion_id]);
        return result.affectedRows;
    }
}

export default ReportesModel;
