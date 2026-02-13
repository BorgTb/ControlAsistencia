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
                    id_preferencia,
                    dias_descanso_equivalentes,
                    created_at, 
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
                horaExtraData.fecha_aprobacion || null,
                horaExtraData.id_preferencia || null,
                horaExtraData.dias_descanso_equivalentes || 0
            ]);
            
            const horaExtraId = result.insertId;
            await connection.commit();
            
            // Devolver la fila creada
            const [createdRows] = await connection.execute(
                'SELECT * FROM horas_extras WHERE id = ?',
                [horaExtraId]
            );

            // Comentado: Auto-aprobación puede causar problemas si no hay aprobado_por
            // await this.aprobarHoraExtra(result.insertId, horaExtraData.aprobado_por);

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
                he.id_preferencia,
                he.created_at,
                he.updated_at,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                e.emp_nombre as empresa_nombre,
                ap.nombre as aprobado_por_nombre,
                ap.apellido_pat as aprobado_por_apellido_pat,
                ap.apellido_mat as aprobado_por_apellido_mat,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            LEFT JOIN usuarios ap ON he.aprobado_por = ap.id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
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
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                e.emp_nombre as empresa_nombre,
                ap.nombre as aprobado_por_nombre,
                ap.apellido_pat as aprobado_por_apellido_pat,
                ap.apellido_mat as aprobado_por_apellido_mat,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            LEFT JOIN usuarios ap ON he.aprobado_por = ap.id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
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
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                e.emp_nombre as empresa_nombre,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
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
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                e.emp_nombre as empresa_nombre,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
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
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                e.emp_nombre as empresa_nombre,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
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
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                e.emp_nombre as empresa_nombre,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
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
            
            // Construir la consulta dinámicamente solo con los campos que se van a actualizar
            const updateFields = [];
            const updateValues = [];
            
            if (horaExtraData.usuario_empresa_id !== undefined) {
                updateFields.push('usuario_empresa_id = ?');
                updateValues.push(horaExtraData.usuario_empresa_id);
            }
            
            if (horaExtraData.asignacion_turno_id !== undefined) {
                updateFields.push('asignacion_turno_id = ?');
                updateValues.push(horaExtraData.asignacion_turno_id);
            }
            
            if (horaExtraData.marcacion_id !== undefined) {
                updateFields.push('marcacion_id = ?');
                updateValues.push(horaExtraData.marcacion_id);
            }
            
            if (horaExtraData.fecha !== undefined) {
                updateFields.push('fecha = ?');
                updateValues.push(horaExtraData.fecha);
            }
            
            if (horaExtraData.hora_inicio !== undefined) {
                updateFields.push('hora_inicio = ?');
                updateValues.push(horaExtraData.hora_inicio);
            }
            
            if (horaExtraData.hora_fin !== undefined) {
                updateFields.push('hora_fin = ?');
                updateValues.push(horaExtraData.hora_fin);
            }
            
            if (horaExtraData.estado !== undefined) {
                updateFields.push('estado = ?');
                updateValues.push(horaExtraData.estado);
            }
            
            if (horaExtraData.motivo !== undefined) {
                updateFields.push('motivo = ?');
                updateValues.push(horaExtraData.motivo);
            }
            
            if (horaExtraData.aprobado_por !== undefined) {
                updateFields.push('aprobado_por = ?');
                updateValues.push(horaExtraData.aprobado_por);
            }
            
            if (horaExtraData.fecha_aprobacion !== undefined) {
                updateFields.push('fecha_aprobacion = ?');
                updateValues.push(horaExtraData.fecha_aprobacion);
            }
            
            if (horaExtraData.id_preferencia !== undefined) {
                updateFields.push('id_preferencia = ?');
                updateValues.push(horaExtraData.id_preferencia);
            }
            
            if (horaExtraData.dias_descanso_equivalentes !== undefined) {
                updateFields.push('dias_descanso_equivalentes = ?');
                updateValues.push(horaExtraData.dias_descanso_equivalentes);
            }
            
            // Siempre actualizar updated_at
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            
            // Si no hay campos para actualizar, retornar null
            if (updateFields.length === 1) { // Solo updated_at
                await connection.rollback();
                return null;
            }
            
            const query = `UPDATE horas_extras SET ${updateFields.join(', ')} WHERE id = ?`;
            updateValues.push(id);
            
            const [result] = await connection.execute(query, updateValues);
            await connection.commit();
            
            if (result.affectedRows > 0) {
                // Recuperar y devolver la fila actualizada
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

    // Obtener hora extra por marcacion_id
    static async getHoraExtraByMarcacionId(marcacion_id) {
        const query = `
            SELECT 
                he.*,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                ap.nombre as aprobado_por_nombre,
                ap.apellido_pat as aprobado_por_apellido_pat,
                ap.apellido_mat as aprobado_por_apellido_mat,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN usuarios ap ON he.aprobado_por = ap.id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
            WHERE he.marcacion_id = ?
        `;
        
        const [rows] = await db.execute(query, [marcacion_id]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Obtener horas extras por múltiples marcaciones
    static async getHorasExtrasByMarcacionIds(marcacion_ids) {
        if (!marcacion_ids || marcacion_ids.length === 0) {
            return [];
        }
        
        const placeholders = marcacion_ids.map(() => '?').join(',');
        const query = `
            SELECT 
                he.*,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                ap.nombre as aprobado_por_nombre,
                ap.apellido_pat as aprobado_por_apellido_pat,
                ap.apellido_mat as aprobado_por_apellido_mat,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN usuarios ap ON he.aprobado_por = ap.id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
            WHERE he.marcacion_id IN (${placeholders})
        `;
        
        const [rows] = await db.execute(query, marcacion_ids);
        return rows;
    }

    // Obtener horas extras por usuario y rango de fechas con marcaciones
    static async getHorasExtrasByUsuarioYFechas(usuario_empresa_id, fecha_inicio, fecha_fin) {
        const query = `
            SELECT 
                he.*,
                u.nombre as usuario_nombre,
                u.apellido_pat as usuario_apellido_pat,
                u.apellido_mat as usuario_apellido_mat,
                ap.nombre as aprobado_por_nombre,
                ap.apellido_pat as aprobado_por_apellido_pat,
                ap.apellido_mat as aprobado_por_apellido_mat,
                pc.tipo_compensacion as preferencia_tipo_compensacion
            FROM horas_extras he
            INNER JOIN usuarios_empresas ue ON he.usuario_empresa_id = ue.id
            INNER JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN usuarios ap ON he.aprobado_por = ap.id
            LEFT JOIN preferencias_compensacion pc ON he.id_preferencia = pc.id_preferencia
            WHERE he.usuario_empresa_id = ?
            AND he.fecha BETWEEN ? AND ?
            ORDER BY he.fecha DESC, he.hora_inicio DESC
        `;
        
        const [rows] = await db.execute(query, [usuario_empresa_id, fecha_inicio, fecha_fin]);
        return rows;
    }



}

export default HorasExtrasModel;
