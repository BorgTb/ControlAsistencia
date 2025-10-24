import db from '../config/dbconfig.js';

class HorasExtrasModel {
    
    // Crear un nuevo registro de horas extras
    static async createHoraExtra(horaExtraData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                INSERT INTO horas_extras (
                    usuario_empresa_id, 
                    asignacion_turno_id, 
                    marcacion_id, 
                    fecha, 
                    hora_inicio, 
                    hora_fin, 
                    estado, 
                    motivo, 
                    aprobado_por, 
                    fecha_aprobacion,
                    created_at, 
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            
            const [result] = await connection.execute(query, [
                horaExtraData.usuario_empresa_id,
                horaExtraData.asignacion_turno_id || null,
                horaExtraData.marcacion_id || null,
                horaExtraData.fecha,
                horaExtraData.hora_inicio,
                horaExtraData.hora_fin,
                horaExtraData.estado || 'PENDIENTE',
                horaExtraData.motivo || null,
                horaExtraData.aprobado_por || null,
                horaExtraData.fecha_aprobacion || null
            ]);
            
            const horaExtraId = result.insertId;
            await connection.commit();
            
            // Devolver la fila creada
            const [createdRows] = await connection.execute(
                'SELECT * FROM horas_extras WHERE id = ?',
                [horaExtraId]
            );
            return createdRows[0] || null;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Obtener todas las horas extras con información relacionada
    static async getAllHorasExtras() {
        const query = `
            SELECT 
                he.id,
                he.usuario_empresa_id,
                he.asignacion_turno_id,
                he.marcacion_id,
                he.fecha,
                he.hora_inicio,
                he.hora_fin,
                he.total_horas,
                he.estado,
                he.motivo,
                he.aprobado_por,
                he.fecha_aprobacion,
                he.created_at,
                he.updated_at,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                e.emp_nombre as empresa_nombre,
                ap.nombre as aprobado_por_nombre,
                ap.apellido as aprobado_por_apellido
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            LEFT JOIN usuarios ap ON he.aprobado_por = ap.id
            ORDER BY he.created_at DESC
        `;
        
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Obtener hora extra por ID
    static async getHoraExtraById(id) {
        const query = `
            SELECT 
                he.*,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                e.emp_nombre as empresa_nombre,
                ap.nombre as aprobado_por_nombre,
                ap.apellido as aprobado_por_apellido
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            LEFT JOIN usuarios ap ON he.aprobado_por = ap.id
            WHERE he.id = ?
        `;
        
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    
    // Obtener horas extras por usuario empresa
    static async getHorasExtrasByUsuarioEmpresa(usuario_empresa_id) {
        const query = `
            SELECT 
                he.*,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                e.emp_nombre as empresa_nombre
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE he.usuario_empresa_id = ?
            ORDER BY he.fecha DESC, he.hora_inicio DESC
        `;
        
        const [rows] = await db.execute(query, [usuario_empresa_id]);
        return rows;
    }
    
    // Obtener horas extras por empresa
    static async getHorasExtrasByEmpresa(empresa_id) {
        const query = `
            SELECT 
                he.*,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                e.emp_nombre as empresa_nombre
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE ue.empresa_id = ?
            ORDER BY he.fecha DESC, he.hora_inicio DESC
        `;
        
        const [rows] = await db.execute(query, [empresa_id]);
        return rows;
    }
    
    // Obtener horas extras por estado
    static async getHorasExtrasByEstado(estado) {
        const query = `
            SELECT 
                he.*,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                e.emp_nombre as empresa_nombre
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE he.estado = ?
            ORDER BY he.fecha DESC, he.hora_inicio DESC
        `;
        
        const [rows] = await db.execute(query, [estado]);
        return rows;
    }
    
    // Obtener horas extras por rango de fechas
    static async getHorasExtrasByRangoFechas(fecha_inicio, fecha_fin, empresa_id = null) {
        let query = `
            SELECT 
                he.*,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                e.emp_nombre as empresa_nombre
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE he.fecha BETWEEN ? AND ?
        `;
        
        const params = [fecha_inicio, fecha_fin];
        
        if (empresa_id) {
            query += ' AND ue.empresa_id = ?';
            params.push(empresa_id);
        }
        
        query += ' ORDER BY he.fecha DESC, he.hora_inicio DESC';
        
        const [rows] = await db.execute(query, params);
        return rows;
    }
    
    // Actualizar hora extra
    static async updateHoraExtra(id, horaExtraData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                UPDATE horas_extras 
                SET 
                    usuario_empresa_id = ?, 
                    asignacion_turno_id = ?, 
                    marcacion_id = ?, 
                    fecha = ?, 
                    hora_inicio = ?, 
                    hora_fin = ?, 
                    estado = ?, 
                    motivo = ?, 
                    aprobado_por = ?, 
                    fecha_aprobacion = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            await connection.execute(query, [
                horaExtraData.usuario_empresa_id,
                horaExtraData.asignacion_turno_id || null,
                horaExtraData.marcacion_id || null,
                horaExtraData.fecha,
                horaExtraData.hora_inicio,
                horaExtraData.hora_fin,
                horaExtraData.estado,
                horaExtraData.motivo || null,
                horaExtraData.aprobado_por || null,
                horaExtraData.fecha_aprobacion || null,
                id
            ]);
            
            await connection.commit();
            
            // Recuperar y devolver la fila actualizada
            const [updatedRows] = await connection.execute(
                'SELECT * FROM horas_extras WHERE id = ?', 
                [id]
            );
            return updatedRows[0] || null;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Aprobar hora extra
    static async aprobarHoraExtra(id, aprobado_por) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                UPDATE horas_extras 
                SET 
                    estado = 'APROBADA',
                    aprobado_por = ?,
                    fecha_aprobacion = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            const [result] = await connection.execute(query, [aprobado_por, id]);
            await connection.commit();
            
            if (result.affectedRows > 0) {
                const [updatedRows] = await connection.execute(
                    'SELECT * FROM horas_extras WHERE id = ?', 
                    [id]
                );
                return updatedRows[0] || null;
            }
            return null;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Rechazar hora extra
    static async rechazarHoraExtra(id, aprobado_por, motivo_rechazo = null) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            let query = `
                UPDATE horas_extras 
                SET 
                    estado = 'RECHAZADA',
                    aprobado_por = ?,
                    fecha_aprobacion = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
            `;
            
            const params = [aprobado_por];
            
            if (motivo_rechazo) {
                query += ', motivo = ?';
                params.push(motivo_rechazo);
            }
            
            query += ' WHERE id = ?';
            params.push(id);
            
            const [result] = await connection.execute(query, params);
            await connection.commit();
            
            if (result.affectedRows > 0) {
                const [updatedRows] = await connection.execute(
                    'SELECT * FROM horas_extras WHERE id = ?', 
                    [id]
                );
                return updatedRows[0] || null;
            }
            return null;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Eliminar hora extra
    static async deleteHoraExtra(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Obtener la fila antes de eliminar
            const [rowsBefore] = await connection.execute(
                'SELECT * FROM horas_extras WHERE id = ?', 
                [id]
            );
            
            if (rowsBefore.length === 0) {
                throw new Error('Hora extra no encontrada');
            }
            
            const rowBefore = rowsBefore[0];
            
            // Eliminar hora extra
            await connection.execute('DELETE FROM horas_extras WHERE id = ?', [id]);
            await connection.commit();
            
            return rowBefore;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Obtener resumen de horas extras por usuario y período
    static async getResumenHorasExtrasPorUsuario(usuario_empresa_id, fecha_inicio, fecha_fin) {
        const query = `
            SELECT 
                COUNT(*) as total_registros,
                SUM(CASE WHEN estado = 'APROBADA' THEN total_horas ELSE 0 END) as horas_aprobadas,
                SUM(CASE WHEN estado = 'PENDIENTE' THEN total_horas ELSE 0 END) as horas_pendientes,
                SUM(CASE WHEN estado = 'RECHAZADA' THEN total_horas ELSE 0 END) as horas_rechazadas,
                SUM(total_horas) as total_horas_solicitadas
            FROM horas_extras
            WHERE usuario_empresa_id = ?
            AND fecha BETWEEN ? AND ?
        `;
        
        const [rows] = await db.execute(query, [usuario_empresa_id, fecha_inicio, fecha_fin]);
        return rows[0] || {
            total_registros: 0,
            horas_aprobadas: 0,
            horas_pendientes: 0,
            horas_rechazadas: 0,
            total_horas_solicitadas: 0
        };
    }
    
    // Obtener resumen de horas extras por empresa y período
    static async getResumenHorasExtrasPorEmpresa(empresa_id, fecha_inicio, fecha_fin) {
        const query = `
            SELECT 
                COUNT(*) as total_registros,
                COUNT(DISTINCT he.usuario_empresa_id) as usuarios_con_horas_extras,
                SUM(CASE WHEN he.estado = 'APROBADA' THEN he.total_horas ELSE 0 END) as horas_aprobadas,
                SUM(CASE WHEN he.estado = 'PENDIENTE' THEN he.total_horas ELSE 0 END) as horas_pendientes,
                SUM(CASE WHEN he.estado = 'RECHAZADA' THEN he.total_horas ELSE 0 END) as horas_rechazadas,
                SUM(he.total_horas) as total_horas_solicitadas
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            WHERE ue.empresa_id = ?
            AND he.fecha BETWEEN ? AND ?
        `;
        
        const [rows] = await db.execute(query, [empresa_id, fecha_inicio, fecha_fin]);
        return rows[0] || {
            total_registros: 0,
            usuarios_con_horas_extras: 0,
            horas_aprobadas: 0,
            horas_pendientes: 0,
            horas_rechazadas: 0,
            total_horas_solicitadas: 0
        };
    }
    
    // Validar si ya existe una hora extra en el mismo período para un usuario
    static async validarSolapamiento(usuario_empresa_id, fecha, hora_inicio, hora_fin, excluir_id = null) {
        let query = `
            SELECT id, hora_inicio, hora_fin
            FROM horas_extras
            WHERE usuario_empresa_id = ? 
            AND fecha = ?
            AND estado != 'RECHAZADA'
            AND (
                (hora_inicio <= ? AND hora_fin > ?) OR
                (hora_inicio < ? AND hora_fin >= ?) OR
                (hora_inicio >= ? AND hora_fin <= ?)
            )
        `;
        
        const params = [
            usuario_empresa_id, 
            fecha, 
            hora_inicio, hora_inicio,
            hora_fin, hora_fin,
            hora_inicio, hora_fin
        ];
        
        if (excluir_id) {
            query += ' AND id != ?';
            params.push(excluir_id);
        }
        
        const [rows] = await db.execute(query, params);
        return rows;
    }
}

export default HorasExtrasModel;
