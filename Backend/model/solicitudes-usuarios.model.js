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
                data.estado || 'PENDIENTE',
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
            WHERE ue.empresa_id = ?
        `;

        const values = [empresaId];

        // Si se especifica estado en filtros, usarlo, sino traer todas
        if (filtros.estado) {
            query += ` AND s.estado = ?`;
            values.push(filtros.estado);
        }

        // Aplicar filtros
        if (filtros.subtipo) {
            query += ` AND s.subtipo = ?`;
            values.push(filtros.subtipo);
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
            WHERE ue.empresa_id = ? AND s.estado = 'PENDIENTE'
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

    /**
     * Crear solicitud de agregar empresa con token de invitación
     * @param {Object} data - Datos de la solicitud
     * @returns {Promise} ID de la solicitud creada
     */
    static async crearSolicitudAgregarEmpresa({
        usuario_id,
        empresa_id,
        usuario_solicitante_id,
        token_aceptacion,
        fecha_expiracion,
        userData = null
    }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const query = `
                INSERT INTO solicitudes_usuarios (
                    id_usuario_empresa,
                    usuario_invitado_id,
                    tipo,
                    subtipo,
                    titulo,
                    descripcion,
                    fecha_emision,
                    estado,
                    requiere_firma,
                    empresa_solicitante_id,
                    usuario_solicitante_id,
                    token_aceptacion,
                    fecha_expiracion,
                    created_at,
                    updated_at
                ) VALUES (NULL, ?, 'solicitud', 'agregar_empresa', ?, ?, CURRENT_TIMESTAMP, 'pendiente', 0, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;

            // Obtener nombre del usuario
            const [usuario] = await connection.execute(
                'SELECT nombre, apellido_pat, apellido_mat FROM usuarios WHERE id = ?',
                [usuario_id]
            );
            const nombreCompleto = usuario[0] ? 
                `${usuario[0].nombre} ${usuario[0].apellido_pat} ${usuario[0].apellido_mat || ''}`.trim() : 
                'Usuario';

            // Obtener nombre de la empresa
            const [empresa] = await connection.execute(
                'SELECT emp_nombre FROM empresa WHERE empresa_id = ?',
                [empresa_id]
            );
            const nombreEmpresa = empresa[0] ? empresa[0].emp_nombre : 'Empresa';

            // Crear descripción con userData embebido como JSON si está disponible
            let descripcion = `Ha sido invitado a unirse a ${nombreEmpresa}. Por favor, acepte o rechace esta invitación.`;
            if (userData) {
                descripcion = JSON.stringify({
                    mensaje: descripcion,
                    userData: userData
                });
            }

            const values = [
                usuario_id, // usuario_invitado_id (tabla usuarios)
                `Invitación para ${nombreCompleto}`,
                descripcion,
                empresa_id,
                usuario_solicitante_id,
                token_aceptacion,
                fecha_expiracion
            ];

            const [result] = await connection.execute(query, values);
            
            await connection.commit();
            
            return result.insertId;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener solicitud por token de aceptación
     * @param {string} token - Token de aceptación
     * @returns {Promise} Datos de la solicitud con información del usuario y empresa
     */
    static async obtenerPorToken(token) {
        const query = `
            SELECT 
                s.*,
                e.emp_nombre as nombre_empresa,
                e.emp_rut as rut_empresa,
                u_invitado.id as usuario_id,
                u_invitado.nombre as nombre_usuario,
                u_invitado.apellido_pat as apellidos_usuario,
                u_invitado.rut as rut_usuario
            FROM solicitudes_usuarios s
            LEFT JOIN empresa e ON s.empresa_solicitante_id = e.empresa_id
            LEFT JOIN usuarios u_invitado ON s.usuario_invitado_id = u_invitado.id
            WHERE s.token_aceptacion = ?
            LIMIT 1
        `;

        const [rows] = await db.execute(query, [token]);
        
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Validar token y su expiración
     * @param {string} token - Token a validar
     * @returns {Promise<Object>} {valido: boolean, mensaje: string}
     */
    static async validarToken(token) {
        const solicitud = await this.obtenerPorToken(token);
        
        if (!solicitud) {
            return { valido: false, mensaje: 'Solicitud no encontrada' };
        }
        
        if (solicitud.estado !== 'pendiente') {
            return { valido: false, mensaje: `Esta solicitud ya fue ${solicitud.estado}` };
        }
        
        const ahora = new Date();
        const expiracion = new Date(solicitud.fecha_expiracion);
        
        if (ahora > expiracion) {
            return { valido: false, mensaje: 'El token ha expirado' };
        }
        
        return { valido: true, mensaje: 'Token válido' };
    }

    /**
     * Obtener solicitudes pendientes de un usuario
     * @param {number} usuario_id - ID del usuario
     * @returns {Promise<Array>} Lista de solicitudes pendientes
     */
    static async obtenerSolicitudesPendientesUsuario(usuario_id) {
        const query = `
            SELECT 
                s.*,
                e.emp_nombre as nombre_empresa
            FROM solicitudes_usuarios s
            LEFT JOIN empresa e ON s.empresa_solicitante_id = e.empresa_id
            WHERE s.estado = 'pendiente'
            AND s.subtipo = 'agregar_empresa'
            AND s.fecha_expiracion > NOW()
            ORDER BY s.fecha_emision DESC
        `;
        
        const [rows] = await db.execute(query, [usuario_id]);
        return rows;
    }

    /**
     * Invalidar solicitudes anteriores del mismo usuario para la misma empresa
     * @param {number} usuario_id - ID del usuario
     * @param {number} empresa_id - ID de la empresa
     * @returns {Promise} Resultado de la actualización
     */
    static async invalidarSolicitudesAnteriores(usuario_id, empresa_id) {
        const query = `
            UPDATE solicitudes_usuarios
            SET estado = 'cancelada',
                observaciones = CONCAT(IFNULL(observaciones, ''), ' - Cancelada por nueva solicitud'),
                updated_at = CURRENT_TIMESTAMP
            WHERE empresa_solicitante_id = ?
            AND estado = 'pendiente'
            AND subtipo = 'agregar_empresa'
        `;
        
        const [result] = await db.execute(query, [empresa_id]);
        return result;
    }

    /**
     * Actualizar id_usuario_empresa después de que el usuario acepta la invitación
     * @param {number} id_solicitud - ID de la solicitud
     * @param {number} id_usuario_empresa - ID del registro en usuarios_empresas
     * @returns {Promise} Resultado de la actualización
     */
    static async actualizarIdUsuarioEmpresa(id_solicitud, id_usuario_empresa) {
        const query = `
            UPDATE solicitudes_usuarios 
            SET id_usuario_empresa = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_solicitud = ?
        `;
        
        const [result] = await db.execute(query, [id_usuario_empresa, id_solicitud]);
        return result;
    }
}


export default SolicitudesUsuariosModel;