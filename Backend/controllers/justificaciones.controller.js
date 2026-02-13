import JustificacionesModel from '../model/justificaciones.model.js';
import UsuarioEmpresaModel from '../model/usuario-empresa.model.js';
import FileUploadService from '../services/file-upload.service.js';

class JustificacionesController {
    /**
     * Crear una nueva justificaciÃƒÂ³n con rango de fechas
     */
    async crearJustificacion(req, res) {
        try {
            const { fecha_inicio, fecha_fin, motivo, tipo_justificacion } = req.body;
            const usuario_empresa_id = await UsuarioEmpresaModel.getUsuarioEmpresaById(req.user.id);

            // Validaciones
            if (!fecha_inicio || !fecha_fin || !tipo_justificacion) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios (fecha_inicio, fecha_fin, tipo_justificacion)'
                });
            }

            // Validar que las fechas no sean futuras
            const inicio = new Date(fecha_inicio);
            const fin = new Date(fecha_fin);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            if (inicio > hoy || fin > hoy) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pueden justificar fechas futuras'
                });
            }

            // Validar que fecha_inicio <= fecha_fin
            if (inicio > fin) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de inicio debe ser menor o igual a la fecha de fin'
                });
            }

            // Verificar si ya existe una justificaciÃƒÂ³n que solape con este rango
            const existeJustificacion = await JustificacionesModel.existeJustificacionEnRango(
                usuario_empresa_id.id,
                fecha_inicio,
                fecha_fin
            );

            if (existeJustificacion) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una justificaciÃƒÂ³n que solapa con estas fechas'
                });
            }

            // Preparar datos
            const data = {
                usuario_empresa_id: usuario_empresa_id.id,
                fecha_inicio,
                fecha_fin,
                motivo: motivo || null,
                tipo_justificacion
            };

            // Si hay archivo adjunto - Usar FileUploadService
            if (req.file) {
                const fileInfo = FileUploadService.getFileInfo(req.file, 'justificaciones');
                data.archivo_url = fileInfo.url;
                data.archivo_nombre = fileInfo.nombre;
            }

            // Crear justificaciÃƒÂ³n
            const result = await JustificacionesModel.crearJustificacion(data);

            return res.status(201).json({
                success: true,
                message: 'JustificaciÃƒÂ³n creada exitosamente. SerÃƒÂ¡ revisada por un administrador.',
                data: {
                    id: result.insertId,
                    ...data,
                    estado: 'PENDIENTE'
                }
            });

        } catch (error) {
            console.error('Error al crear justificaciÃƒÂ³n:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear justificaciÃƒÂ³n',
                error: error.message
            });
        }
    }

    /**
     * Obtener justificaciones del usuario autenticado
     */
    async obtenerJustificaciones(req, res) {
        try {
            console.log('Obteniendo justificaciones para usuario:', req.user);

            const usuario_empresa_id = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(req.user.id);
            const { estado, tipo_justificacion, mes, anio, fecha_inicio, fecha_fin, fecha} = req.query;
            const params = {};

            if (estado) params.estado = estado.toUpperCase();
            if (tipo_justificacion) params.tipo_justificacion = tipo_justificacion;
            if (fecha) {
                // BÃƒÂºsqueda por fecha especÃƒÂ­fica
                params.fecha = fecha;
            } else if (mes && anio) {
                params.mes = parseInt(mes);
                params.anio = parseInt(anio);
            } else if (fecha_inicio && fecha_fin) {
                params.fecha_inicio = fecha_inicio;
                params.fecha_fin = fecha_fin;
            }

            const justificaciones = await JustificacionesModel.obtenerJustificacionesUsuario(
                usuario_empresa_id.id,
                params
            );
            console.log(justificaciones);

            return res.status(200).json({
                success: true,
                data: justificaciones
            });

        } catch (error) {
            console.error('Error al obtener justificaciones:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener justificaciones',
                error: error.message
            });
        }
    }

    /**
     * Obtener una justificaciÃƒÂ³n por ID
     */
    async obtenerJustificacionPorId(req, res) {
        try {
            const { id } = req.params;
            const justificacion = await JustificacionesModel.obtenerJustificacionPorId(id);

            if (!justificacion) {
                return res.status(404).json({
                    success: false,
                    message: 'JustificaciÃƒÂ³n no encontrada'
                });
            }

            // Verificar que la justificaciÃƒÂ³n pertenece al usuario
            if (justificacion.usuario_empresa_id !== req.user.usuario_empresa_id && 
                req.user.rol !== 'admin' && 
                req.user.rol !== 'fiscalizador') {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permiso para ver esta justificaciÃƒÂ³n'
                });
            }

            return res.status(200).json({
                success: true,
                data: justificacion
            });

        } catch (error) {
            console.error('Error al obtener justificaciÃƒÂ³n:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener justificaciÃƒÂ³n',
                error: error.message
            });
        }
    }

    /**
     * Actualizar estado de una justificaciÃƒÂ³n (solo admin/fiscalizador)
     * Genera automÃƒÂ¡ticamente los dÃƒÂ­as justificados si se aprueba
     */
    async actualizarEstadoJustificacion(req, res) {
        try {
            const { id } = req.params;
            const { estado, observaciones } = req.body;
            const aprobado_por = req.user.id;

            // Validar estado
            const estadosValidos = ['APROBADA', 'RECHAZADA'];
            const estadoUpper = estado ? estado.toUpperCase() : '';
            
            if (!estadosValidos.includes(estadoUpper)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado invÃƒÂ¡lido. Debe ser "APROBADA" o "RECHAZADA"'
                });
            }

            // Verificar que la justificaciÃƒÂ³n existe
            const justificacion = await JustificacionesModel.obtenerJustificacionPorId(id);
            
            if (!justificacion) {
                return res.status(404).json({
                    success: false,
                    message: 'JustificaciÃƒÂ³n no encontrada'
                });
            }

            if (justificacion.estado !== 'PENDIENTE') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se pueden aprobar/rechazar justificaciones pendientes'
                });
            }

            // Actualizar estado (esto generarÃƒÂ¡ automÃƒÂ¡ticamente los dÃƒÂ­as si se aprueba)
            await JustificacionesModel.actualizarEstadoJustificacion(
                id,
                estadoUpper,
                aprobado_por,
                observaciones
            );

            const mensaje = estadoUpper === 'APROBADA' 
                ? 'JustificaciÃƒÂ³n aprobada y dÃƒÂ­as generados exitosamente'
                : 'JustificaciÃƒÂ³n rechazada';

            return res.status(200).json({
                success: true,
                message: mensaje
            });

        } catch (error) {
            console.error('Error al actualizar justificaciÃƒÂ³n:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar justificaciÃƒÂ³n',
                error: error.message
            });
        }
    }

    /**
     * Eliminar justificaciÃƒÂ³n (solo si estÃƒÂ¡ pendiente)
     */
    async eliminarJustificacion(req, res) {
        try {
            const { id } = req.params;
            const usuario_empresa_id = req.user.usuario_empresa_id;

            // Verificar que la justificaciÃƒÂ³n existe y pertenece al usuario
            const justificacion = await JustificacionesModel.obtenerJustificacionPorId(id);
            
            if (!justificacion) {
                return res.status(404).json({
                    success: false,
                    message: 'JustificaciÃƒÂ³n no encontrada'
                });
            }

            if (justificacion.usuario_empresa_id !== usuario_empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permiso para eliminar esta justificaciÃƒÂ³n'
                });
            }

            if (justificacion.estado !== 'PENDIENTE') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se pueden eliminar justificaciones pendientes'
                });
            }

            // Eliminar archivo si existe - Usar FileUploadService
            if (justificacion.archivo_url) {
                FileUploadService.deleteFile(justificacion.archivo_url);
            }

            // Eliminar justificaciÃƒÂ³n (CASCADE eliminarÃƒÂ¡ los dÃƒÂ­as automÃƒÂ¡ticamente)
            await JustificacionesModel.eliminarJustificacion(id);

            return res.status(200).json({
                success: true,
                message: 'JustificaciÃƒÂ³n eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar justificaciÃƒÂ³n:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar justificaciÃƒÂ³n',
                error: error.message
            });
        }
    }

    /**
     * Obtener justificaciones pendientes (admin/fiscalizador)
     */
    async obtenerJustificacionesPendientes(req, res) {
        try {

            const mandante_id = req.user.empresa_id;
            const limit = parseInt(req.query.limit) || 50;
            const todas = req.query.todas === 'true'; // Nuevo parÃƒÂ¡metro para obtener todas
            
            const justificaciones = await JustificacionesModel.obtenerJustificacionesPendientes(
                mandante_id,
                limit,
                !todas // Si todas=true, entonces soloEPendientes=false
            );
            console.log(justificaciones);
            return res.status(200).json({
                success: true,
                data: justificaciones
            });

        } catch (error) {
            console.error('Error al obtener justificaciones pendientes:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener justificaciones pendientes',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadÃƒÂ­sticas de justificaciones
     */
    async obtenerEstadisticas(req, res) {
        try {
            const usuario_empresa_id = req.user.usuario_empresa_id;
            const { mes, anio } = req.query;

            if (!mes || !anio) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere mes y aÃƒÂ±o'
                });
            }

            const estadisticas = await JustificacionesModel.obtenerEstadisticas(
                usuario_empresa_id,
                parseInt(mes),
                parseInt(anio)
            );

            return res.status(200).json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error al obtener estadÃƒÂ­sticas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener estadÃƒÂ­sticas',
                error: error.message
            });
        }
    }

    /**
     * Verificar si un dÃƒÂ­a estÃƒÂ¡ justificado
     */
    async verificarDiaJustificado(req, res) {
        try {
            const usuario_empresa_id = req.user.usuario_empresa_id;
            const { fecha } = req.query;

            if (!fecha) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere la fecha'
                });
            }

            const justificacion = await JustificacionesModel.diaEstaJustificado(
                usuario_empresa_id,
                fecha
            );

            return res.status(200).json({
                success: true,
                data: {
                    justificado: !!justificacion,
                    detalles: justificacion
                }
            });

        } catch (error) {
            console.error('Error al verificar dÃƒÂ­a justificado:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar dÃƒÂ­a justificado',
                error: error.message
            });
        }
    }

    /**
     * Obtener dÃƒÂ­as justificados de un usuario en un rango de fechas
     */
    async obtenerDiasJustificados(req, res) {
        try {
            const { usuario_empresa_id, fecha_inicio, fecha_fin } = req.query;
            
            // Validaciones
            if (!usuario_empresa_id || !fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren usuario_empresa_id, fecha_inicio y fecha_fin'
                });
            }

         
            const diasJustificados = await JustificacionesModel.obtenerDiasJustificadosEnRango(
                usuario_empresa_id,
                fecha_inicio,
                fecha_fin
            );



            return res.status(200).json({
                success: true,
                data: diasJustificados
            });

        } catch (error) {
            console.error('Error al obtener dÃƒÂ­as justificados:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener dÃƒÂ­as justificados',
                error: error.message
            });
        }
    }
}

export default new JustificacionesController();
