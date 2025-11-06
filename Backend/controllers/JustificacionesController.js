import JustificacionesModel from '../model/JustificacionesModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import FileUploadService from '../services/FileUploadService.js';

class JustificacionesController {
    /**
     * Crear una nueva justificación con rango de fechas
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

            // Verificar si ya existe una justificación que solape con este rango
            const existeJustificacion = await JustificacionesModel.existeJustificacionEnRango(
                usuario_empresa_id.id,
                fecha_inicio,
                fecha_fin
            );

            if (existeJustificacion) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una justificación que solapa con estas fechas'
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

            // Crear justificación
            const result = await JustificacionesModel.crearJustificacion(data);

            return res.status(201).json({
                success: true,
                message: 'Justificación creada exitosamente. Será revisada por un administrador.',
                data: {
                    id: result.insertId,
                    ...data,
                    estado: 'PENDIENTE'
                }
            });

        } catch (error) {
            console.error('Error al crear justificación:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear justificación',
                error: error.message
            });
        }
    }

    /**
     * Obtener justificaciones del usuario autenticado
     */
    async obtenerJustificaciones(req, res) {
        try {
            const usuario_empresa_id = await UsuarioEmpresaModel.getUsuarioEmpresaById(req.user.id);
            const { estado, tipo_justificacion, mes, anio, fecha_inicio, fecha_fin, fecha} = req.query;
            const params = {};

            if (estado) params.estado = estado.toUpperCase();
            if (tipo_justificacion) params.tipo_justificacion = tipo_justificacion;
            if (fecha) {
                // Búsqueda por fecha específica
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
     * Obtener una justificación por ID
     */
    async obtenerJustificacionPorId(req, res) {
        try {
            const { id } = req.params;
            const justificacion = await JustificacionesModel.obtenerJustificacionPorId(id);

            if (!justificacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Justificación no encontrada'
                });
            }

            // Verificar que la justificación pertenece al usuario
            if (justificacion.usuario_empresa_id !== req.user.usuario_empresa_id && 
                req.user.rol !== 'admin' && 
                req.user.rol !== 'fiscalizador') {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permiso para ver esta justificación'
                });
            }

            return res.status(200).json({
                success: true,
                data: justificacion
            });

        } catch (error) {
            console.error('Error al obtener justificación:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener justificación',
                error: error.message
            });
        }
    }

    /**
     * Actualizar estado de una justificación (solo admin/fiscalizador)
     * Genera automáticamente los días justificados si se aprueba
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
                    message: 'Estado inválido. Debe ser "APROBADA" o "RECHAZADA"'
                });
            }

            // Verificar que la justificación existe
            const justificacion = await JustificacionesModel.obtenerJustificacionPorId(id);
            
            if (!justificacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Justificación no encontrada'
                });
            }

            if (justificacion.estado !== 'PENDIENTE') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se pueden aprobar/rechazar justificaciones pendientes'
                });
            }

            // Actualizar estado (esto generará automáticamente los días si se aprueba)
            await JustificacionesModel.actualizarEstadoJustificacion(
                id,
                estadoUpper,
                aprobado_por,
                observaciones
            );

            const mensaje = estadoUpper === 'APROBADA' 
                ? 'Justificación aprobada y días generados exitosamente'
                : 'Justificación rechazada';

            return res.status(200).json({
                success: true,
                message: mensaje
            });

        } catch (error) {
            console.error('Error al actualizar justificación:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar justificación',
                error: error.message
            });
        }
    }

    /**
     * Eliminar justificación (solo si está pendiente)
     */
    async eliminarJustificacion(req, res) {
        try {
            const { id } = req.params;
            const usuario_empresa_id = req.user.usuario_empresa_id;

            // Verificar que la justificación existe y pertenece al usuario
            const justificacion = await JustificacionesModel.obtenerJustificacionPorId(id);
            
            if (!justificacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Justificación no encontrada'
                });
            }

            if (justificacion.usuario_empresa_id !== usuario_empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permiso para eliminar esta justificación'
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

            // Eliminar justificación (CASCADE eliminará los días automáticamente)
            await JustificacionesModel.eliminarJustificacion(id);

            return res.status(200).json({
                success: true,
                message: 'Justificación eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar justificación:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar justificación',
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
            const todas = req.query.todas === 'true'; // Nuevo parámetro para obtener todas
            
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
     * Obtener estadísticas de justificaciones
     */
    async obtenerEstadisticas(req, res) {
        try {
            const usuario_empresa_id = req.user.usuario_empresa_id;
            const { mes, anio } = req.query;

            if (!mes || !anio) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere mes y año'
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
            console.error('Error al obtener estadísticas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    /**
     * Verificar si un día está justificado
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
            console.error('Error al verificar día justificado:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar día justificado',
                error: error.message
            });
        }
    }

    /**
     * Obtener días justificados de un usuario en un rango de fechas
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
            console.error('Error al obtener días justificados:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener días justificados',
                error: error.message
            });
        }
    }
}

export default new JustificacionesController();
