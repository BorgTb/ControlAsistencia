import db from '../config/dbconfig.js';

class SolicitudesUsuariosModel {
    /**
     * Crear una nueva solicitud o notificación
     * @param {Object} data - Datos de la solicitud
     * @returns {Promise} Resultado de la inserción
     */
    static async crear(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                INSERT INTO solicitudes_usuarios (
                    id_usuario_empresa,
                    tipo,
                    subtipo,
                    titulo,
                    descripcion,
                    fecha_inicio,
                    fecha_fin,
                    fecha_emision,
                    estado,
                    requiere_firma,
                    metodo_firma,
                    documento_adjunto,
                    observaciones,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;

            const values = [
                data.id_usuario_empresa,
                data.tipo || 'solicitud',
                data.subtipo,
                data.titulo,
                data.descripcion || null,
                data.fecha_inicio || null,
                data.fecha_fin || null,
                data.fecha_emision || new Date(),
                data.estado || 'pendiente',
                data.requiere_firma !== undefined ? data.requiere_firma : 1,
                data.metodo_firma || 'login',
                data.documento_adjunto || null,
                data.observaciones || null
            ];

            const [result] = await connection.execute(query, values);
            const solicitudId = result.insertId;
            
            await connection.commit();
            
            // Devolver la fila creada
            const [createdRows] = await connection.execute(
                'SELECT * FROM solicitudes_usuarios WHERE id_solicitud = ?',
                [solicitudId]
            );

            return createdRows[0] || null;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener solicitud por ID
     * @param {number} id - ID de la solicitud
     * @returns {Promise} Datos de la solicitud
     */
    static async obtenerPorId(id) {
        const query = `
            SELECT 
                s.*,
                ue.usuario_id,
                ue.empresa_id,
                u.nombre as usuario_nombre,
                u.apellido_pat,
                u.apellido_mat,
                e.emp_nombre as empresa_nombre
            FROM solicitudes_usuarios s
            LEFT JOIN usuarios_empresas ue ON s.id_usuario_empresa = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE s.id_solicitud = ?
        `;

        const [rows] = await db.execute(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Obtener solicitudes de un usuario empresa
     * @param {number} idUsuarioEmpresa - ID del usuario empresa
     * @param {Object} filtros - Filtros opcionales (tipo, subtipo, estado)
     * @returns {Promise} Lista de solicitudes
     */
    static async obtenerPorUsuarioEmpresa(idUsuarioEmpresa, filtros = {}) {
        let query = `
            SELECT 
                s.*,
                ue.usuario_id,
                ue.empresa_id,
                u.nombre as usuario_nombre,
                u.apellido_pat,
                u.apellido_mat,
                e.emp_nombre as empresa_nombre
            FROM solicitudes_usuarios s
            LEFT JOIN usuarios_empresas ue ON s.id_usuario_empresa = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE s.id_usuario_empresa = ?
        `;

        const values = [idUsuarioEmpresa];

        // Aplicar filtros
        if (filtros.tipo) {
            query += ` AND s.tipo = ?`;
            values.push(filtros.tipo);
        }

        if (filtros.subtipo) {
            query += ` AND s.subtipo = ?`;
            values.push(filtros.subtipo);
        }

        if (filtros.estado) {
            query += ` AND s.estado = ?`;
            values.push(filtros.estado);
        }

        if (filtros.fecha_inicio && filtros.fecha_fin) {
            query += ` AND DATE(s.fecha_emision) BETWEEN ? AND ?`;
            values.push(filtros.fecha_inicio, filtros.fecha_fin);
        }

        query += ` ORDER BY s.fecha_emision DESC`;

        const [rows] = await db.execute(query, values);
        return rows || [];
    }

    /**
     * Obtener solicitudes pendientes de una empresa
     * @param {number} empresaId - ID de la empresa
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise} Lista de solicitudes pendientes
     */
    static async obtenerPendientesPorEmpresa(empresaId, filtros = {}) {
        let query = `
            SELECT 
                s.*,
                ue.usuario_id,
                u.nombre as usuario_nombre,
                u.apellido_pat,
                u.apellido_mat,
                e.emp_nombre as empresa_nombre
            FROM solicitudes_usuarios s
            LEFT JOIN usuarios_empresas ue ON s.id_usuario_empresa = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE ue.empresa_id = ? AND s.estado = 'pendiente'
        `;

        const values = [empresaId];

        // Aplicar filtros
        if (filtros.subtipo) {
            query += ` AND s.subtipo = ?`;
            values.push(filtros.subtipo);
        }

        if (filtros.fecha_inicio && filtros.fecha_fin) {
            query += ` AND DATE(s.fecha_emision) BETWEEN ? AND ?`;
            values.push(filtros.fecha_inicio, filtros.fecha_fin);
        }

        query += ` ORDER BY s.fecha_emision ASC`;

        const [rows] = await db.execute(query, values);
        return rows || [];
    }

    /**
     * Actualizar estado de una solicitud
     * @param {number} id - ID de la solicitud
     * @param {string} nuevoEstado - Nuevo estado (pendiente, aceptada, rechazada, cancelada)
     * @param {Object} datosAdicionales - Datos adicionales (observaciones, fecha_respuesta, etc.)
     * @returns {Promise} Resultado de la actualización
     */
    static async actualizarEstado(id, nuevoEstado, datosAdicionales = {}) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const updateFields = [];
            const updateValues = [];
            
            // Estado siempre se actualiza
            updateFields.push('estado = ?');
            updateValues.push(nuevoEstado);
            
            // Siempre actualizar fecha_respuesta
            updateFields.push('fecha_respuesta = NOW()');

            // Agregar campos adicionales si existen
            if (datosAdicionales.observaciones) {
                updateFields.push('observaciones = ?');
                updateValues.push(datosAdicionales.observaciones);
            }

            if (datosAdicionales.firma_trabajador) {
                updateFields.push('firma_trabajador = ?');
                updateValues.push(datosAdicionales.firma_trabajador);
            }

            if (datosAdicionales.firma_empleador) {
                updateFields.push('firma_empleador = ?');
                updateValues.push(datosAdicionales.firma_empleador);
            }
            
            // Siempre actualizar updated_at
            updateFields.push('updated_at = CURRENT_TIMESTAMP');

            const query = `UPDATE solicitudes_usuarios SET ${updateFields.join(', ')} WHERE id_solicitud = ?`;
            updateValues.push(id);

            const [result] = await connection.execute(query, updateValues);
            await connection.commit();
            
            if (result.affectedRows > 0) {
                const [updatedRows] = await connection.execute(
                    'SELECT * FROM solicitudes_usuarios WHERE id_solicitud = ?',
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

    /**
     * Agregar firmas a una solicitud
     * @param {number} id - ID de la solicitud
     * @param {string} tipoFirma - Tipo de firma (trabajador, empleador)
     * @param {string} firma - Datos de la firma
     * @returns {Promise} Resultado de la actualización
     */
    static async agregarFirma(id, tipoFirma, firma) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const campo = tipoFirma === 'trabajador' ? 'firma_trabajador' : 'firma_empleador';
            
            const query = `
                UPDATE solicitudes_usuarios 
                SET ${campo} = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id_solicitud = ?
            `;

            const [result] = await connection.execute(query, [firma, id]);
            await connection.commit();
            
            if (result.affectedRows > 0) {
                const [updatedRows] = await connection.execute(
                    'SELECT * FROM solicitudes_usuarios WHERE id_solicitud = ?',
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

    /**
     * Actualizar documento adjunto
     * @param {number} id - ID de la solicitud
     * @param {string} documentoUrl - URL del documento
     * @returns {Promise} Resultado de la actualización
     */
    static async actualizarDocumento(id, documentoUrl) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                UPDATE solicitudes_usuarios 
                SET documento_adjunto = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id_solicitud = ?
            `;

            const [result] = await connection.execute(query, [documentoUrl, id]);
            await connection.commit();
            
            if (result.affectedRows > 0) {
                const [updatedRows] = await connection.execute(
                    'SELECT * FROM solicitudes_usuarios WHERE id_solicitud = ?',
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

    /**
     * Eliminar solicitud
     * @param {number} id - ID de la solicitud
     * @returns {Promise} Resultado de la eliminación
     */
    static async eliminar(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Obtener la fila antes de eliminar
            const [rowsBefore] = await connection.execute(
                'SELECT * FROM solicitudes_usuarios WHERE id_solicitud = ?',
                [id]
            );
            
            if (rowsBefore.length === 0) {
                throw new Error('Solicitud no encontrada');
            }
            
            const rowBefore = rowsBefore[0];
            
            // Eliminar solicitud
            await connection.execute('DELETE FROM solicitudes_usuarios WHERE id_solicitud = ?', [id]);
            await connection.commit();
            
            return rowBefore;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener estadísticas de solicitudes
     * @param {number} empresaId - ID de la empresa (opcional)
     * @returns {Promise} Estadísticas de solicitudes
     */
    static async obtenerEstadisticas(empresaId = null) {
        let query = `
            SELECT 
                s.estado,
                s.subtipo,
                COUNT(*) as cantidad
            FROM solicitudes_usuarios s
            LEFT JOIN usuarios_empresas ue ON s.id_usuario_empresa = ue.id
        `;

        const values = [];

        if (empresaId) {
            query += ` WHERE ue.empresa_id = ?`;
            values.push(empresaId);
        }

        query += ` GROUP BY s.estado, s.subtipo`;

        const [rows] = await db.execute(query, values);
        return rows || [];
    }

    /**
     * Contar solicitudes pendientes de una empresa
     * @param {number} empresaId - ID de la empresa
     * @returns {Promise} Cantidad de solicitudes pendientes
     */
    static async contarPendientes(empresaId) {
        const query = `
            SELECT COUNT(*) as cantidad
            FROM solicitudes_usuarios s
            LEFT JOIN usuarios_empresas ue ON s.id_usuario_empresa = ue.id
            WHERE ue.empresa_id = ? AND s.estado = 'pendiente'
        `;

        const [rows] = await db.execute(query, [empresaId]);
        return rows[0]?.cantidad || 0;
    }

    /**
     * Obtener todas las solicitudes con filtros avanzados
     * @param {Object} filtros - Filtros (estado, subtipo, empresa_id, etc.)
     * @param {number} limit - Límite de resultados
     * @param {number} offset - Desplazamiento
     * @returns {Promise} Lista de solicitudes
     */
    static async obtenerTodas(filtros = {}, limit = 50, offset = 0) {
        let query = `
            SELECT 
                s.*,
                ue.usuario_id,
                ue.empresa_id,
                u.nombre as usuario_nombre,
                u.apellido_pat,
                u.apellido_mat,
                e.emp_nombre as empresa_nombre
            FROM solicitudes_usuarios s
            LEFT JOIN usuarios_empresas ue ON s.id_usuario_empresa = ue.id
            LEFT JOIN usuarios u ON ue.usuario_id = u.id
            LEFT JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE 1=1
        `;

        const values = [];

        // Aplicar filtros
        if (filtros.estado) {
            query += ` AND s.estado = ?`;
            values.push(filtros.estado);
        }

        if (filtros.subtipo) {
            query += ` AND s.subtipo = ?`;
            values.push(filtros.subtipo);
        }

        if (filtros.tipo) {
            query += ` AND s.tipo = ?`;
            values.push(filtros.tipo);
        }

        if (filtros.empresa_id) {
            query += ` AND ue.empresa_id = ?`;
            values.push(filtros.empresa_id);
        }

        if (filtros.usuario_id) {
            query += ` AND ue.usuario_id = ?`;
            values.push(filtros.usuario_id);
        }

        if (filtros.fecha_inicio && filtros.fecha_fin) {
            query += ` AND DATE(s.fecha_emision) BETWEEN ? AND ?`;
            values.push(filtros.fecha_inicio, filtros.fecha_fin);
        }

        query += ` ORDER BY s.fecha_emision DESC LIMIT ? OFFSET ?`;
        values.push(limit, offset);

        const [rows] = await db.execute(query, values);
        return rows || [];
    }

    /**
     * Actualizar observaciones de una solicitud
     * @param {number} id - ID de la solicitud
     * @param {string} observaciones - Nuevas observaciones
     * @returns {Promise} Resultado de la actualización
     */
    static async actualizarObservaciones(id, observaciones) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const query = `
                UPDATE solicitudes_usuarios 
                SET observaciones = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id_solicitud = ?
            `;

            const [result] = await connection.execute(query, [observaciones, id]);
            await connection.commit();
            
            if (result.affectedRows > 0) {
                const [updatedRows] = await connection.execute(
                    'SELECT * FROM solicitudes_usuarios WHERE id_solicitud = ?',
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
}


export default SolicitudesUsuariosModel;