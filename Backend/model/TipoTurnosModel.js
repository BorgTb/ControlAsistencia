import pool from '../config/dbconfig.js';

class TipoTurnosModel {
    static async getAll() {
        const query = `
            SELECT * FROM tipo_turnos 
            WHERE estado = 1 
            ORDER BY nombre
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async getById(id) {
        const query = `SELECT * FROM tipo_turnos WHERE id = ?`;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    // Alias para compatibilidad
    static async findById(id) {
        return this.getById(id);
    }

    static async getByIdWithDias(id) {
        const query = `
            SELECT tt.*, 
                   GROUP_CONCAT(
                       CONCAT(dd.dia_semana, ':', dd.trabaja, ':', 
                              COALESCE(dd.hora_inicio, ''), ':', 
                              COALESCE(dd.hora_fin, ''))
                   ) as dias_detalle
            FROM tipo_turnos tt
            LEFT JOIN detalle_dias_turno dd ON tt.id = dd.tipo_turno_id
            WHERE tt.id = ?
            GROUP BY tt.id
        `;
        const [rows] = await pool.query(query, [id]);
        
        if (rows[0] && rows[0].dias_detalle) {
            const dias = rows[0].dias_detalle.split(',').map(dia => {
                const [dia_semana, trabaja, hora_inicio, hora_fin] = dia.split(':');
                return {
                    dia_semana,
                    trabaja: trabaja === '1',
                    hora_inicio: hora_inicio || null,
                    hora_fin: hora_fin || null
                };
            });
            rows[0].dias = dias;
            delete rows[0].dias_detalle;
        }
        
        return rows[0];
    }

    static async create(data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                INSERT INTO tipo_turnos (
                    empresa_id, nombre, descripcion, tipo_jornada_id, hora_inicio, hora_fin, 
                    colacion_inicio, colacion_fin, dias_trabajo, dias_descanso, estado
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await connection.query(query, [
                data.empresa_id,
                data.nombre,
                data.descripcion || null,
                data.tipo_jornada_id || data.tipo_jornada || null,
                data.hora_inicio,
                data.hora_fin,
                data.colacion_inicio || null,
                data.colacion_fin || null,
                data.dias_trabajo || 5,
                data.dias_descanso || 2,
                data.estado || 1
            ]);
            
            const tipoTurnoId = result.insertId;
            
            // Insertar días del turno si se proporcionan
            if (data.dias && Array.isArray(data.dias)) {
                for (const dia of data.dias) {
                    await connection.query(
                        `INSERT INTO detalle_dias_turno (
                            tipo_turno_id, dia_semana, trabaja, hora_inicio, hora_fin
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [
                            tipoTurnoId,
                            dia.dia_semana,
                            dia.trabaja !== false,
                            dia.hora_inicio || null,
                            dia.hora_fin || null
                        ]
                    );
                }
            }
            
            await connection.commit();
            return tipoTurnoId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                UPDATE tipo_turnos 
                SET empresa_id = ?, nombre = ?, descripcion = ?, tipo_jornada_id = ?, 
                    hora_inicio = ?, hora_fin = ?, colacion_inicio = ?, colacion_fin = ?, 
                    dias_trabajo = ?, dias_descanso = ?, estado = ?
                WHERE id = ?
            `;
            await connection.query(query, [
                data.empresa_id,
                data.nombre,
                data.descripcion || null,
                data.tipo_jornada_id || data.tipo_jornada || null,
                data.hora_inicio,
                data.hora_fin,
                data.colacion_inicio || null,
                data.colacion_fin || null,
                data.dias_trabajo || 5,
                data.dias_descanso || 2,
                data.estado !== undefined ? data.estado : 1,
                id
            ]);
            
            // Actualizar días del turno
            if (data.dias && Array.isArray(data.dias)) {
                // Eliminar días existentes
                await connection.query(
                    `DELETE FROM detalle_dias_turno WHERE tipo_turno_id = ?`,
                    [id]
                );
                
                // Insertar nuevos días
                for (const dia of data.dias) {
                    await connection.query(
                        `INSERT INTO detalle_dias_turno (
                            tipo_turno_id, dia_semana, trabaja, hora_inicio, hora_fin
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [
                            id,
                            dia.dia_semana,
                            dia.trabaja !== false,
                            dia.hora_inicio || null,
                            dia.hora_fin || null
                        ]
                    );
                }
            }
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        const query = `UPDATE tipo_turnos SET estado = 0 WHERE id = ?`;
        const [result] = await pool.query(query, [id]);
        return result.affectedRows;
    }

    static async getAllWithDias() {
        const query = `
            SELECT tt.id, tt.empresa_id, tt.nombre, tt.descripcion, 
                   tt.tipo_jornada_id,
                   tt.hora_inicio, tt.hora_fin, 
                   tt.colacion_inicio, tt.colacion_fin,
                   tt.dias_trabajo, tt.dias_descanso,
                   dd.dia_semana, dd.trabaja, 
                   dd.hora_inicio as dia_hora_inicio, 
                   dd.hora_fin as dia_hora_fin
            FROM tipo_turnos tt
            LEFT JOIN detalle_dias_turno dd ON tt.id = dd.tipo_turno_id
            WHERE tt.estado = 1
            ORDER BY tt.nombre, 
                     FIELD(dd.dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
        `;
        const [rows] = await pool.query(query);
        
        // Agrupar por tipo de turno
        const tiposTurnos = {};
        rows.forEach(row => {
            if (!tiposTurnos[row.id]) {
                tiposTurnos[row.id] = {
                    id: row.id,
                    empresa_id: row.empresa_id,
                    nombre: row.nombre,
                    descripcion: row.descripcion,
                    tipo_jornada_id: row.tipo_jornada_id,
                    hora_inicio: row.hora_inicio,
                    hora_fin: row.hora_fin,
                    colacion_inicio: row.colacion_inicio,
                    colacion_fin: row.colacion_fin,
                    dias_trabajo: row.dias_trabajo,
                    dias_descanso: row.dias_descanso,
                    dias: []
                };
            }
            
            if (row.dia_semana) {
                tiposTurnos[row.id].dias.push({
                    dia_semana: row.dia_semana,
                    trabaja: row.trabaja,
                    hora_inicio: row.dia_hora_inicio,
                    hora_fin: row.dia_hora_fin
                });
            }
        });
        
        return Object.values(tiposTurnos);
    }

    static async getAllWithDiasByEmpresaId(empresaId) {
        const query = `
            SELECT tt.id, tt.empresa_id, tt.nombre, tt.descripcion, 
                   tt.tipo_jornada_id,
                   tt.hora_inicio, tt.hora_fin, 
                   tt.colacion_inicio, tt.colacion_fin,
                   tt.dias_trabajo, tt.dias_descanso,
                   tj.id as tipo_jornada_id,
                   dd.dia_semana, dd.trabaja, 
                   dd.hora_inicio as dia_hora_inicio, 
                   dd.hora_fin as dia_hora_fin
            FROM tipo_turnos tt
            LEFT JOIN detalle_dias_turno dd ON tt.id = dd.tipo_turno_id
            LEFT JOIN tipo_jornada as tj ON tt.tipo_jornada_id = tj.id
            WHERE tt.estado = 1
            AND tt.empresa_id = ?
            ORDER BY tt.nombre, 
                     FIELD(dd.dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
        `;
        const [rows] = await pool.query(query, [empresaId]);
        
        // Agrupar por tipo de turno
        const tiposTurnos = {};
        rows.forEach(row => {
            if (!tiposTurnos[row.id]) {
                tiposTurnos[row.id] = {
                    id: row.id,
                    empresa_id: row.empresa_id,
                    nombre: row.nombre,
                    descripcion: row.descripcion,
                    tipo_jornada_id: row.tipo_jornada_id,
                    hora_inicio: row.hora_inicio,
                    hora_fin: row.hora_fin,
                    colacion_inicio: row.colacion_inicio,
                    colacion_fin: row.colacion_fin,
                    dias_trabajo: row.dias_trabajo,
                    dias_descanso: row.dias_descanso,
                    dias: []
                };
            }
            
            if (row.dia_semana) {
                tiposTurnos[row.id].dias.push({
                    dia_semana: row.dia_semana,
                    trabaja: row.trabaja,
                    hora_inicio: row.dia_hora_inicio,
                    hora_fin: row.dia_hora_fin
                });
            }
        });
        
        return Object.values(tiposTurnos);
    }

    static async getByEmpresaId(empresaId) {
        const query = `
            SELECT * FROM tipo_turnos 
            WHERE empresa_id = ? AND estado = 1 
            ORDER BY nombre
        `;
        const [rows] = await pool.query(query, [empresaId]);
        return rows;
    }

    static async getTiposJornada() {
        const query = `
            SELECT * 
            FROM tipo_jornada
        `;
        const [rows] = await pool.query(query);
        return rows;
        return rows;
    }


    static async getDetalleDiasPorTipoTurnoId(tipo_turno_id) {
        const query = `
            SELECT *
            FROM detalle_dias_turno
            WHERE tipo_turno_id = ?
            ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')
        `;
        const [rows] = await pool.query(query, [tipo_turno_id]);
        return rows;
    }
    
}

export default TipoTurnosModel;
