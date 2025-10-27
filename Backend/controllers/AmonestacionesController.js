import AmonestacionesModel from '../model/AmonestacionesModel.js';
import AuditoriaModel from '../model/AuditoriaModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import EmpresaModel from '../model/EmpresaModel.js';
import UserModel from '../model/UserModel.js';
import PDFService from '../services/PDFService.js';
import NotificacionService from '../services/NotificacionService.js';

class AmonestacionesController {
    // Crear nueva amonestación
    static async crear(req, res) {
        try {
            const amonestacionData = req.body;
            const usuarioPeticion = req.user;

            console.log('📝 Creando amonestación:', amonestacionData);

            // Validar campos requeridos
            if (!amonestacionData.trabajadorId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del trabajador es requerido'
                });
            }

            if (!amonestacionData.tipoFalta) {
                return res.status(400).json({
                    success: false,
                    message: 'El tipo de falta es requerido'
                });
            }

            if (!amonestacionData.tipoSancion) {
                return res.status(400).json({
                    success: false,
                    message: 'El tipo de sanción es requerido'
                });
            }

            // Obtener IP del cliente
            const ipRegistro = req.ip || req.connection.remoteAddress;

            // Preparar datos para guardar
            const datosAmonestacion = {
                usuario_empresa_id: amonestacionData.trabajadorId,
                cargo: amonestacionData.cargo || null,
                area_departamento: amonestacionData.areaDepartamento || null,
                empresa_rut: amonestacionData.empresaEmpleadoraRut || null,
                supervisor_responsable: amonestacionData.supervisorResponsable || null,
                tipo_falta: amonestacionData.tipoFalta,
                fecha_hecho: amonestacionData.fechaHecho,
                descripcion_detallada: amonestacionData.descripcionDetallada,
                norma_infringida: amonestacionData.normaInfringida || null,
                tipo_sancion: amonestacionData.tipoSancion,
                monto_multa: amonestacionData.montoMulta || null,
                observaciones_rrhh: amonestacionData.observacionesRRHH || null,
                plazo_descargos: amonestacionData.plazoDescargos,
                archivos_json: amonestacionData.archivosAdjuntos || [],
                estado: 'PENDIENTE',
                creado_por: usuarioPeticion.id,
                ip_registro: ipRegistro
            };

            // Crear la amonestación
            const amonestacionId = await AmonestacionesModel.crear(datosAmonestacion);

            // Registrar en auditoría
            await AuditoriaModel.registrarCambio({
                usuario_id: usuarioPeticion.id,
                accion: 'CREATE_AMONESTACION',
                tabla_afectada: 'amonestaciones',
                registro_id: amonestacionId,
                datos_anteriores: null,
                datos_nuevos: JSON.stringify(datosAmonestacion),
                ip_address: ipRegistro,
                descripcion: `Creación de amonestación ID ${amonestacionId} para trabajador ID ${amonestacionData.trabajadorId}`,
            });

            console.log('✅ Amonestación creada con ID:', amonestacionId);
            console.log(amonestacionData);
            // Obtener datos completos para el PDF y notificación
            try {
                // Obtener datos del trabajador
                const usuarioEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(amonestacionData.trabajadorId);
                if (!usuarioEmpresa) {
                    console.error('⚠️ Usuario empresa no encontrado para enviar notificación');
                } else {
                    const trabajador = await UserModel.findById(usuarioEmpresa.usuario_id);
                    const empresa = await EmpresaModel.getEmpresaById(usuarioEmpresa.empresa_id);

                    if (trabajador && empresa) {
                        // Agregar el ID a los datos de amonestación para el PDF
                        const amonestacionCompleta = {
                            id: amonestacionId,
                            ...datosAmonestacion
                        };

                        // Generar PDF
                        const pdfBuffer = await PDFService.generarPDFAmonestacion(
                            amonestacionCompleta,
                            trabajador,
                            empresa
                        );

                        // Guardar PDF temporalmente
                        const filename = `Amonestacion_${amonestacionId}_${trabajador.rut}.pdf`;
                        const pdfPath = await PDFService.guardarPDFTemporal(pdfBuffer, filename);

                        // Enviar notificación con PDF adjunto
                        const resultadoNotificacion = await NotificacionService.enviarNotificacionAmonestacion(
                            trabajador,
                            amonestacionCompleta,
                            empresa,
                            pdfPath
                        );

                        // Eliminar archivo temporal
                        await PDFService.eliminarArchivoTemporal(pdfPath);

                        if (resultadoNotificacion.success) {
                            console.log('✅ Notificación de amonestación enviada exitosamente');
                        } else {
                            console.error('⚠️ Error enviando notificación:', resultadoNotificacion.message);
                        }
                    }
                }
            } catch (errorNotificacion) {
                console.error('⚠️ Error en proceso de notificación:', errorNotificacion);
                // No fallar la respuesta principal si falla la notificación
            }

            res.status(201).json({
                success: true,
                message: 'Amonestación registrada exitosamente',
                data: { id: amonestacionId }
            });
        } catch (error) {
            console.error('❌ Error creando amonestación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener todas las amonestaciones
    static async obtenerTodas(req, res) {
        try {
            const amonestaciones = await AmonestacionesModel.obtenerTodas();

            res.status(200).json({
                success: true,
                data: amonestaciones
            });
        } catch (error) {
            console.error('❌ Error obteniendo amonestaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener amonestación por ID
    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de amonestación inválido'
                });
            }

            const amonestacion = await AmonestacionesModel.obtenerPorId(id);

            if (!amonestacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Amonestación no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                data: amonestacion
            });
        } catch (error) {
            console.error('❌ Error obteniendo amonestación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener amonestaciones por trabajador
    static async obtenerPorTrabajador(req, res) {
        try {
            const { trabajadorId } = req.params;

            if (!trabajadorId || isNaN(trabajadorId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de trabajador inválido'
                });
            }

            const amonestaciones = await AmonestacionesModel.obtenerPorUsuarioEmpresa(trabajadorId);

            res.status(200).json({
                success: true,
                data: amonestaciones
            });
        } catch (error) {
            console.error('❌ Error obteniendo amonestaciones del trabajador:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener amonestaciones por empresa
    static async obtenerPorEmpresa(req, res) {
        try {
            const { rutEmpresa } = req.params;

            if (!rutEmpresa) {
                return res.status(400).json({
                    success: false,
                    message: 'RUT de empresa es requerido'
                });
            }

            // Obtener empresa por RUT
            const empresa = await UsuarioEmpresaModel.getEmpresaByRut(rutEmpresa);
            
            if (!empresa) {
                return res.status(404).json({
                    success: false,
                    message: 'Empresa no encontrada'
                });
            }

            // Buscar amonestaciones de la empresa
            const amonestaciones = await AmonestacionesModel.buscar({
                empresa_id: empresa.id
            });

            res.status(200).json({
                success: true,
                data: amonestaciones
            });
        } catch (error) {
            console.error('❌ Error obteniendo amonestaciones de la empresa:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar amonestación
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            const usuarioPeticion = req.user;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de amonestación inválido'
                });
            }

            // Verificar que la amonestación existe
            const amonestacionExistente = await AmonestacionesModel.obtenerPorId(id);
            if (!amonestacionExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Amonestación no encontrada'
                });
            }

            // Preparar datos para actualizar
            const datosParaActualizar = {};
            
            if (datosActualizados.supervisorResponsable !== undefined) {
                datosParaActualizar.supervisor_responsable = datosActualizados.supervisorResponsable;
            }
            if (datosActualizados.descripcionDetallada !== undefined) {
                datosParaActualizar.descripcion_detallada = datosActualizados.descripcionDetallada;
            }
            if (datosActualizados.normaInfringida !== undefined) {
                datosParaActualizar.norma_infringida = datosActualizados.normaInfringida;
            }
            if (datosActualizados.observacionesRRHH !== undefined) {
                datosParaActualizar.observaciones_rrhh = datosActualizados.observacionesRRHH;
            }
            if (datosActualizados.descargosTrabajador !== undefined) {
                datosParaActualizar.descargos_trabajador = datosActualizados.descargosTrabajador;
            }
            if (datosActualizados.estado !== undefined) {
                datosParaActualizar.estado = datosActualizados.estado;
            }

            // Actualizar
            const actualizado = await AmonestacionesModel.actualizar(id, datosParaActualizar);

            if (!actualizado) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar la amonestación'
                });
            }

            // Registrar en auditoría
            await AuditoriaModel.registrarCambio({
                usuario_id: usuarioPeticion.id,
                accion: 'UPDATE_AMONESTACION',
                tabla_afectada: 'amonestaciones',
                registro_id: id,
                datos_anteriores: JSON.stringify(amonestacionExistente),
                datos_nuevos: JSON.stringify(datosParaActualizar),
                ip_address: req.ip || req.connection.remoteAddress,
                descripcion: `Actualización de amonestación ID ${id}`,
            });

            res.status(200).json({
                success: true,
                message: 'Amonestación actualizada exitosamente'
            });
        } catch (error) {
            console.error('❌ Error actualizando amonestación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Eliminar amonestación
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            const usuarioPeticion = req.user;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de amonestación inválido'
                });
            }

            // Verificar que la amonestación existe
            const amonestacionExistente = await AmonestacionesModel.obtenerPorId(id);
            if (!amonestacionExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Amonestación no encontrada'
                });
            }

            // Eliminar
            const eliminado = await AmonestacionesModel.eliminar(id);

            if (!eliminado) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la amonestación'
                });
            }

            // Registrar en auditoría
            await AuditoriaModel.registrarCambio({
                usuario_id: usuarioPeticion.id,
                accion: 'DELETE_AMONESTACION',
                tabla_afectada: 'amonestaciones',
                registro_id: id,
                datos_anteriores: JSON.stringify(amonestacionExistente),
                datos_nuevos: null,
                ip_address: req.ip || req.connection.remoteAddress,
                descripcion: `Eliminación de amonestación ID ${id}`,
            });

            res.status(200).json({
                success: true,
                message: 'Amonestación eliminada exitosamente'
            });
        } catch (error) {
            console.error('❌ Error eliminando amonestación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de amonestaciones
    static async obtenerEstadisticas(req, res) {
        try {
            const { empresaId } = req.query;

            const estadisticas = await AmonestacionesModel.obtenerEstadisticas(empresaId);

            res.status(200).json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Buscar amonestaciones con filtros
    static async buscar(req, res) {
        try {
            const filtros = req.query;

            const amonestaciones = await AmonestacionesModel.buscar(filtros);

            res.status(200).json({
                success: true,
                data: amonestaciones
            });
        } catch (error) {
            console.error('❌ Error buscando amonestaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar descargos del trabajador
    static async actualizarDescargos(req, res) {
        try {
            const { id } = req.params;
            const { descargos } = req.body;
            const usuarioPeticion = req.user;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de amonestación inválido'
                });
            }

            if (!descargos) {
                return res.status(400).json({
                    success: false,
                    message: 'Los descargos son requeridos'
                });
            }

            // Verificar que la amonestación existe
            const amonestacionExistente = await AmonestacionesModel.obtenerPorId(id);
            if (!amonestacionExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Amonestación no encontrada'
                });
            }

            // Actualizar descargos
            const actualizado = await AmonestacionesModel.actualizarDescargos(id, descargos);

            if (!actualizado) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar los descargos'
                });
            }

            // Registrar en auditoría
            await AuditoriaModel.registrarCambio({
                usuario_id: usuarioPeticion.id,
                accion: 'UPDATE_DESCARGOS_AMONESTACION',
                tabla_afectada: 'amonestaciones',
                registro_id: id,
                datos_anteriores: JSON.stringify({ descargos_trabajador: amonestacionExistente.descargos_trabajador }),
                datos_nuevos: JSON.stringify({ descargos_trabajador: descargos }),
                ip_address: req.ip || req.connection.remoteAddress,
                descripcion: `Actualización de descargos de amonestación ID ${id}`
            });

            res.status(200).json({
                success: true,
                message: 'Descargos actualizados exitosamente'
            });
        } catch (error) {
            console.error('❌ Error actualizando descargos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Cambiar estado de amonestación
    static async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const usuarioPeticion = req.user;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de amonestación inválido'
                });
            }

            if (!estado) {
                return res.status(400).json({
                    success: false,
                    message: 'El estado es requerido'
                });
            }

            // Validar estados permitidos
            const estadosPermitidos = ['PENDIENTE', 'CON_DESCARGOS', 'RESUELTA', 'ANULADA'];
            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado inválido'
                });
            }

            // Verificar que la amonestación existe
            const amonestacionExistente = await AmonestacionesModel.obtenerPorId(id);
            if (!amonestacionExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Amonestación no encontrada'
                });
            }

            // Cambiar estado
            const actualizado = await AmonestacionesModel.cambiarEstado(id, estado);

            if (!actualizado) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al cambiar el estado'
                });
            }

            // Registrar en auditoría
            await AuditoriaModel.registrarCambio({
                usuario_id: usuarioPeticion.id,
                accion: 'CHANGE_ESTADO_AMONESTACION',
                tabla_afectada: 'amonestaciones',
                registro_id: id,
                datos_anteriores: JSON.stringify({ estado: amonestacionExistente.estado }),
                datos_nuevos: JSON.stringify({ estado: estado }),
                ip_address: req.ip || req.connection.remoteAddress,
                descripcion: `Cambio de estado de amonestación ID ${id} de ${amonestacionExistente.estado} a ${estado}`
            });

            res.status(200).json({
                success: true,
                message: 'Estado actualizado exitosamente'
            });
        } catch (error) {
            console.error('❌ Error cambiando estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default AmonestacionesController;
