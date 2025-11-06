import db from '../config/dbconfig.js';

class SolicitudesUsuariosModel {
    /**
     * Crear una nueva solicitud o notificación
     * @param {Object} data - Datos de la solicitud
     * @returns {Promise} Resultado de la inserción
     */
    static async crear(data) {
        try {
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
                    observaciones
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

            return new Promise((resolve, reject) => {
                db.query(query, values, (error, results) => {
                    if (error) {
                        console.error('Error al crear solicitud:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.error('Error en crear solicitud:', error);
            throw error;
        }
    }

    /**
     * Obtener solicitud por ID
     * @param {number} id - ID de la solicitud
     * @returns {Promise} Datos de la solicitud
     */
    static async obtenerPorId(id) {
        try {
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
                LEFT JOIN empresas e ON ue.empresa_id = e.id
                WHERE s.id_solicitud = ?
            `;

            return new Promise((resolve, reject) => {
                db.query(query, [id], (error, results) => {
                    if (error) {
                        console.error('Error al obtener solicitud:', error);
                        reject(error);
                    } else {
                        resolve(results[0] || null);
                    }
                });
            });
        } catch (error) {
            console.error('Error en obtenerPorId:', error);
            throw error;
        }
    }

    /**
     * Obtener solicitudes de un usuario empresa
     * @param {number} idUsuarioEmpresa - ID del usuario empresa
     * @param {Object} filtros - Filtros opcionales (tipo, subtipo, estado)
     * @returns {Promise} Lista de solicitudes
     */
    static async obtenerPorUsuarioEmpresa(idUsuarioEmpresa, filtros = {}) {
        try {
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
                LEFT JOIN empresas e ON ue.empresa_id = e.id
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

            return new Promise((resolve, reject) => {
                db.query(query, values, (error, results) => {
                    if (error) {
                        console.error('Error al obtener solicitudes del usuario:', error);
                        reject(error);
                    } else {
                        resolve(results || []);
                    }
                });
            });
        } catch (error) {
            console.error('Error en obtenerPorUsuarioEmpresa:', error);
            throw error;
        }
    }

    /**
     * Obtener solicitudes pendientes de una empresa
     * @param {number} empresaId - ID de la empresa
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise} Lista de solicitudes pendientes
     */
    static async obtenerPendientesPorEmpresa(empresaId, filtros = {}) {
        try {
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
                LEFT JOIN empresas e ON ue.empresa_id = e.id
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

            return new Promise((resolve, reject) => {
                db.query(query, values, (error, results) => {
                    if (error) {
                        console.error('Error al obtener solicitudes pendientes:', error);
                        reject(error);
                    } else {
                        resolve(results || []);
                    }
                });
            });
        } catch (error) {
            console.error('Error en obtenerPendientesPorEmpresa:', error);
            throw error;
        }
    }

    /**
     * Actualizar estado de una solicitud
     * @param {number} id - ID de la solicitud
     * @param {string} nuevoEstado - Nuevo estado (pendiente, aceptada, rechazada, cancelada)
     * @param {Object} datosAdicionales - Datos adicionales (observaciones, fecha_respuesta, etc.)
     * @returns {Promise} Resultado de la actualización
     */
    static async actualizarEstado(id, nuevoEstado, datosAdicionales = {}) {
        try {
            let query = `
                UPDATE solicitudes_usuarios 
                SET estado = ?, 
                    fecha_respuesta = NOW()
            `;

            const values = [nuevoEstado];

            // Agregar campos adicionales si existen
            if (datosAdicionales.observaciones) {
                query += `, observaciones = ?`;
                values.push(datosAdicionales.observaciones);
            }

            if (datosAdicionales.firma_trabajador) {
                query += `, firma_trabajador = ?`;
                values.push(datosAdicionales.firma_trabajador);
            }

            if (datosAdicionales.firma_empleador) {
                query += `, firma_empleador = ?`;
                values.push(datosAdicionales.firma_empleador);
            }

            query += ` WHERE id_solicitud = ?`;
            values.push(id);

            return new Promise((resolve, reject) => {
                db.query(query, values, (error, results) => {
                    if (error) {
                        console.error('Error al actualizar estado:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.error('Error en actualizarEstado:', error);
            throw error;
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
        try {
            const campo = tipoFirma === 'trabajador' ? 'firma_trabajador' : 'firma_empleador';
            
            const query = `
                UPDATE solicitudes_usuarios 
                SET ${campo} = ?
                WHERE id_solicitud = ?
            `;

            return new Promise((resolve, reject) => {
                db.query(query, [firma, id], (error, results) => {
                    if (error) {
                        console.error('Error al agregar firma:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.error('Error en agregarFirma:', error);
            throw error;
        }
    }

    /**
     * Actualizar documento adjunto
     * @param {number} id - ID de la solicitud
     * @param {string} documentoUrl - URL del documento
     * @returns {Promise} Resultado de la actualización
     */
    static async actualizarDocumento(id, documentoUrl) {
        try {
            const query = `
                UPDATE solicitudes_usuarios 
                SET documento_adjunto = ?
                WHERE id_solicitud = ?
            `;

            return new Promise((resolve, reject) => {
                db.query(query, [documentoUrl, id], (error, results) => {
                    if (error) {
                        console.error('Error al actualizar documento:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.error('Error en actualizarDocumento:', error);
            throw error;
        }
    }

    /**
     * Eliminar solicitud
     * @param {number} id - ID de la solicitud
     * @returns {Promise} Resultado de la eliminación
     */
    static async eliminar(id) {
        try {
            const query = `DELETE FROM solicitudes_usuarios WHERE id_solicitud = ?`;

            return new Promise((resolve, reject) => {
                db.query(query, [id], (error, results) => {
                    if (error) {
                        console.error('Error al eliminar solicitud:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.error('Error en eliminar:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de solicitudes
     * @param {number} empresaId - ID de la empresa (opcional)
     * @returns {Promise} Estadísticas de solicitudes
     */
    static async obtenerEstadisticas(empresaId = null) {
        try {
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

            return new Promise((resolve, reject) => {
                db.query(query, values, (error, results) => {
                    if (error) {
                        console.error('Error al obtener estadísticas:', error);
                        reject(error);
                    } else {
                        resolve(results || []);
                    }
                });
            });
        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            throw error;
        }
    }

    /**
     * Contar solicitudes pendientes de una empresa
     * @param {number} empresaId - ID de la empresa
     * @returns {Promise} Cantidad de solicitudes pendientes
     */
    static async contarPendientes(empresaId) {
        try {
            const query = `
                SELECT COUNT(*) as cantidad
                FROM solicitudes_usuarios s
                LEFT JOIN usuarios_empresas ue ON s.id_usuario_empresa = ue.id
                WHERE ue.empresa_id = ? AND s.estado = 'pendiente'
            `;

            return new Promise((resolve, reject) => {
                db.query(query, [empresaId], (error, results) => {
                    if (error) {
                        console.error('Error al contar pendientes:', error);
                        reject(error);
                    } else {
                        resolve(results[0]?.cantidad || 0);
                    }
                });
            });
        } catch (error) {
            console.error('Error en contarPendientes:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las solicitudes con filtros avanzados
     * @param {Object} filtros - Filtros (estado, subtipo, empresa_id, etc.)
     * @param {number} limit - Límite de resultados
     * @param {number} offset - Desplazamiento
     * @returns {Promise} Lista de solicitudes
     */
    static async obtenerTodas(filtros = {}, limit = 50, offset = 0) {
        try {
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
                LEFT JOIN empresas e ON ue.empresa_id = e.id
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

            return new Promise((resolve, reject) => {
                db.query(query, values, (error, results) => {
                    if (error) {
                        console.error('Error al obtener solicitudes:', error);
                        reject(error);
                    } else {
                        resolve(results || []);
                    }
                });
            });
        } catch (error) {
            console.error('Error en obtenerTodas:', error);
            throw error;
        }
    }

    /**
     * Actualizar observaciones de una solicitud
     * @param {number} id - ID de la solicitud
     * @param {string} observaciones - Nuevas observaciones
     * @returns {Promise} Resultado de la actualización
     */
    static async actualizarObservaciones(id, observaciones) {
        try {
            const query = `
                UPDATE solicitudes_usuarios 
                SET observaciones = ?
                WHERE id_solicitud = ?
            `;

            return new Promise((resolve, reject) => {
                db.query(query, [observaciones, id], (error, results) => {
                    if (error) {
                        console.error('Error al actualizar observaciones:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            console.error('Error en actualizarObservaciones:', error);
            throw error;
        }
    }
}

export default SolicitudesUsuariosModel;
