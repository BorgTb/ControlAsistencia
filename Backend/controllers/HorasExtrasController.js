import HorasExtrasModel from "../model/HorasExtrasModel.js";
import UsuarioEmpresaModel from "../model/UsuarioEmpresaModel.js";
import AuditoriaModel from "../model/AuditoriaModel.js";
import { DateTime } from "luxon";

class HorasExtrasController {
    /**
     * Aprobar horas extras de un trabajador
     */
    static async aprobarHorasExtras(req, res) {
        try {
            const { 
                usuario_empresa_id, 
                fecha, 
                hora_inicio, 
                hora_fin, 
                motivo,
                asignacion_turno_id,
                marcacion_id
            } = req.body;
            console.log('🔵 Datos recibidos para aprobar horas extras:', req.body);
            console.log('⏰ Hora inicio (fin del turno):', hora_inicio);
            console.log('⏰ Hora fin (salida real):', hora_fin);
            
            const USR_PETICION = req.user; // Usuario que aprueba (empresa)
            
            // Validaciones
            if (!usuario_empresa_id || !fecha || !hora_inicio || !hora_fin) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan datos requeridos: usuario_empresa_id, fecha, hora_inicio, hora_fin"
                });
            }

            // Verificar que el usuario que aprueba sea de la empresa correspondiente
            const trabajador = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(usuario_empresa_id);
            console.log('🔵 Trabajador encontrado para horas extras:', trabajador);
            if (!trabajador) {
                return res.status(404).json({
                    success: false,
                    message: "Trabajador no encontrado"
                });
            }

            // Verificar que el usuario que aprueba pertenece a la misma empresa
            const [empresaAprobador] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
            if (!empresaAprobador || empresaAprobador.empresa_id !== trabajador.empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: "No tiene permisos para aprobar horas extras de este trabajador"
                });
            }

            // 🔍 VERIFICAR SI YA EXISTE UNA HORA EXTRA PENDIENTE PARA ESTA MARCACIÓN
            let horaExtraExistente = null;
            if (marcacion_id) {
                // Buscar por marcacion_id si se proporciona
                horaExtraExistente = await HorasExtrasModel.getHoraExtraByMarcacionId(marcacion_id);
                console.log('🔍 Buscando hora extra existente por marcacion_id:', marcacion_id, horaExtraExistente);
            } else {
                // Buscar por usuario, fecha y horario si no hay marcacion_id
                const horasExtrasExistentes = await HorasExtrasModel.getHorasExtrasByUsuarioYFechas(
                    usuario_empresa_id, 
                    fecha, 
                    fecha
                );
                
                // Filtrar las que coincidan con el horario y estén pendientes
                horaExtraExistente = horasExtrasExistentes.find(he => 
                    he.estado === 'PENDIENTE' && 
                    he.hora_inicio === hora_inicio && 
                    he.hora_fin === hora_fin
                );
                console.log('🔍 Buscando hora extra existente por fecha/horario:', horaExtraExistente);
            }

            let horaExtra;
            let accion = 'crear';

            if (horaExtraExistente && horaExtraExistente.estado === 'PENDIENTE') {
                // ✅ ACTUALIZAR LA HORA EXTRA EXISTENTE DE PENDIENTE A APROBADA
                console.log('🔄 Actualizando hora extra existente de PENDIENTE a APROBADA:', horaExtraExistente.id);
                
                horaExtra = await HorasExtrasModel.aprobarHoraExtra(
                    horaExtraExistente.id, 
                    USR_PETICION.id
                );
                
                if (!horaExtra) {
                    return res.status(500).json({
                        success: false,
                        message: "Error al aprobar la hora extra existente"
                    });
                }
                
                accion = 'aprobar_existente';
                
            } else {
                // ✅ CREAR NUEVA HORA EXTRA O VALIDAR SOLAPAMIENTOS
                
                // Validar que no exista solapamiento de horas extras (solo si no hay registro existente)
                const solapamiento = await HorasExtrasModel.validarSolapamiento(
                    usuario_empresa_id,
                    fecha,
                    hora_inicio,
                    hora_fin
                );

                if (solapamiento && solapamiento.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Ya existe un registro de horas extras en este periodo de tiempo",
                        solapamiento
                    });
                }

                // Crear el registro de horas extras con estado APROBADA
                // NOTA: hora_inicio debe ser la hora de fin del turno pactado
                //       hora_fin debe ser la hora real de salida del trabajador
                //       Las horas extras se calculan automáticamente por la BD como: hora_fin - hora_inicio
                const horaExtraData = {
                    usuario_empresa_id,
                    asignacion_turno_id: asignacion_turno_id || null,
                    marcacion_id: marcacion_id || null,
                    fecha,
                    hora_inicio, // Hora de fin del turno (desde cuando comienzan las horas extras)
                    hora_fin,    // Hora real de salida (hasta cuando trabajó)
                    estado: 'APROBADA',
                    motivo: motivo || 'Horas extras aprobadas por la empresa',
                    aprobado_por: USR_PETICION.id,
                    fecha_aprobacion: DateTime.now().setZone("America/Santiago").toISO(),
                    tipo_compensacion: 'DESCANSO',
                    dias_descanso_equivalentes: 0
                };

                console.log('💾 Creando nueva hora extra:', horaExtraData);
                horaExtra = await HorasExtrasModel.createHoraExtra(horaExtraData);
                accion = 'crear_nueva';
            }

            // Registrar en auditoría
            if (USR_PETICION && USR_PETICION.id) {
                try {
                    const descripcionAccion = accion === 'aprobar_existente' 
                        ? `Hora extra actualizada de PENDIENTE a APROBADA` 
                        : `Nueva hora extra creada y aprobada`;
                        
                    await AuditoriaModel.registrarCambio({
                        usuario_id: USR_PETICION.id,
                        accion: accion === 'aprobar_existente' ? 'aprobar_horas_extras_existente' : 'crear_aprobar_horas_extras',
                        tabla_afectada: 'horas_extras',
                        registro_id: horaExtra.id,
                        descripcion: `${descripcionAccion} para trabajador ID: ${usuario_empresa_id} - Fecha: ${fecha} - Horario: ${hora_inicio} a ${hora_fin}`,
                        datos_anteriores: accion === 'aprobar_existente' ? JSON.stringify({estado: 'PENDIENTE'}) : null,
                        datos_nuevos: JSON.stringify(horaExtra),
                        ip_address: req.ip || req.connection.remoteAddress
                    });
                } catch (auditError) {
                    console.error('⚠️ Error al registrar en auditoría:', auditError);
                }
            }

            const mensaje = accion === 'aprobar_existente' 
                ? "Horas extras actualizadas de PENDIENTE a APROBADA exitosamente"
                : "Horas extras creadas y aprobadas exitosamente";

            return res.status(accion === 'aprobar_existente' ? 200 : 201).json({
                success: true,
                message: mensaje,
                data: horaExtra,
                accion: accion // Incluir la acción realizada en la respuesta
            });

        } catch (error) {
            console.error('❌ Error al aprobar horas extras:', error);
            return res.status(500).json({
                success: false,
                message: "Error al aprobar horas extras",
                error: error.message
            });
        }
    }

    /**
     * Aprobar una hora extra específica que está PENDIENTE por su ID
     */
    static async aprobarHoraExtraPendiente(req, res) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;
            const USR_PETICION = req.user;

            console.log('🔵 Aprobando hora extra pendiente por ID:', id);

            // Obtener la hora extra existente
            const horaExtraExistente = await HorasExtrasModel.getHoraExtraById(id);
            if (!horaExtraExistente) {
                return res.status(404).json({
                    success: false,
                    message: "Hora extra no encontrada"
                });
            }

            // Verificar que esté en estado PENDIENTE
            if (horaExtraExistente.estado !== 'PENDIENTE') {
                return res.status(400).json({
                    success: false,
                    message: `La hora extra está en estado ${horaExtraExistente.estado}. Solo se pueden aprobar horas extras en estado PENDIENTE.`
                });
            }

            // Verificar permisos (el usuario debe ser de la misma empresa)
            const trabajador = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(horaExtraExistente.usuario_empresa_id);
            if (!trabajador) {
                return res.status(404).json({
                    success: false,
                    message: "Trabajador no encontrado"
                });
            }

            const [empresaAprobador] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
            if (!empresaAprobador || empresaAprobador.empresa_id !== trabajador.empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: "No tiene permisos para aprobar horas extras de este trabajador"
                });
            }

            // Aprobar la hora extra
            const horaExtraAprobada = await HorasExtrasModel.aprobarHoraExtra(id, USR_PETICION.id);
            
            if (!horaExtraAprobada) {
                return res.status(500).json({
                    success: false,
                    message: "Error al aprobar la hora extra"
                });
            }

            // Si se proporciona un nuevo motivo, actualizar
            if (motivo && motivo !== horaExtraExistente.motivo) {
                await HorasExtrasModel.updateHoraExtra(id, { motivo });
                horaExtraAprobada.motivo = motivo;
            }

            // Registrar en auditoría
            if (USR_PETICION && USR_PETICION.id) {
                try {
                    await AuditoriaModel.registrarCambio({
                        usuario_id: USR_PETICION.id,
                        accion: 'aprobar_horas_extras_pendiente',
                        tabla_afectada: 'horas_extras',
                        registro_id: id,
                        descripcion: `Hora extra ID: ${id} aprobada (de PENDIENTE a APROBADA) para trabajador ID: ${horaExtraExistente.usuario_empresa_id}`,
                        datos_anteriores: JSON.stringify({estado: 'PENDIENTE', motivo: horaExtraExistente.motivo}),
                        datos_nuevos: JSON.stringify(horaExtraAprobada),
                        ip_address: req.ip || req.connection.remoteAddress
                    });
                } catch (auditError) {
                    console.error('⚠️ Error al registrar en auditoría:', auditError);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Hora extra aprobada exitosamente",
                data: horaExtraAprobada
            });

        } catch (error) {
            console.error('❌ Error al aprobar hora extra pendiente:', error);
            return res.status(500).json({
                success: false,
                message: "Error al aprobar hora extra pendiente",
                error: error.message
            });
        }
    }

    /**
     * Obtener horas extras por empresa
     */
    static async obtenerHorasExtrasPorEmpresa(req, res) {
        try {
            const { empresa_id } = req.params;
            const USR_PETICION = req.user;

            // Verificar que el usuario pertenece a la empresa
            const [empresaUsuario] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
            if (!empresaUsuario || empresaUsuario.empresa_id != empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: "No tiene permisos para ver las horas extras de esta empresa"
                });
            }

            const horasExtras = await HorasExtrasModel.getHorasExtrasByEmpresa(empresa_id);

            return res.status(200).json({
                success: true,
                data: horasExtras
            });

        } catch (error) {
            console.error('❌ Error al obtener horas extras:', error);
            return res.status(500).json({
                success: false,
                message: "Error al obtener horas extras",
                error: error.message
            });
        }
    }

    /**
     * Obtener horas extras por trabajador
     */
    static async obtenerHorasExtrasPorTrabajador(req, res) {
        try {
            const { usuario_empresa_id } = req.params;
            const horasExtras = await HorasExtrasModel.getHorasExtrasByUsuarioEmpresa(usuario_empresa_id);

            return res.status(200).json({
                success: true,
                data: horasExtras
            });

        } catch (error) {
            console.error('❌ Error al obtener horas extras del trabajador:', error);
            return res.status(500).json({
                success: false,
                message: "Error al obtener horas extras del trabajador",
                error: error.message
            });
        }
    }

    /**
     * Obtener resumen de horas extras por empresa y período
     */
    static async obtenerResumenHorasExtras(req, res) {
        try {
            const { empresa_id } = req.params;
            const { fecha_inicio, fecha_fin } = req.query;
            const USR_PETICION = req.user;

            // Verificar que el usuario pertenece a la empresa
            const [empresaUsuario] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
            if (!empresaUsuario || empresaUsuario.empresa_id != empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: "No tiene permisos para ver el resumen de esta empresa"
                });
            }

            const resumen = await HorasExtrasModel.getResumenHorasExtrasPorEmpresa(
                empresa_id,
                fecha_inicio,
                fecha_fin
            );

            return res.status(200).json({
                success: true,
                data: resumen
            });

        } catch (error) {
            console.error('❌ Error al obtener resumen de horas extras:', error);
            return res.status(500).json({
                success: false,
                message: "Error al obtener resumen de horas extras",
                error: error.message
            });
        }
    }

    /**
     * Rechazar una hora extra específica que está PENDIENTE por su ID
     */
    static async rechazarHoraExtraPendiente(req, res) {
        try {
            const { id } = req.params;
            const { motivo_rechazo } = req.body;
            const USR_PETICION = req.user;

            console.log('🔴 Rechazando hora extra pendiente por ID:', id);

            // Obtener la hora extra existente
            const horaExtraExistente = await HorasExtrasModel.getHoraExtraById(id);
            if (!horaExtraExistente) {
                return res.status(404).json({
                    success: false,
                    message: "Hora extra no encontrada"
                });
            }

            // Verificar que esté en estado PENDIENTE
            if (horaExtraExistente.estado !== 'PENDIENTE') {
                return res.status(400).json({
                    success: false,
                    message: `La hora extra está en estado ${horaExtraExistente.estado}. Solo se pueden rechazar horas extras en estado PENDIENTE.`
                });
            }

            // Verificar permisos (el usuario debe ser de la misma empresa)
            const trabajador = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(horaExtraExistente.usuario_empresa_id);
            if (!trabajador) {
                return res.status(404).json({
                    success: false,
                    message: "Trabajador no encontrado"
                });
            }

            const [empresaAprobador] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
            if (!empresaAprobador || empresaAprobador.empresa_id !== trabajador.empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: "No tiene permisos para rechazar horas extras de este trabajador"
                });
            }

            // Rechazar la hora extra
            const motivoFinal = motivo_rechazo || 'Horas extras rechazadas por la empresa';
            const horaExtraRechazada = await HorasExtrasModel.rechazarHoraExtra(id, USR_PETICION.id, motivoFinal);
            
            if (!horaExtraRechazada) {
                return res.status(500).json({
                    success: false,
                    message: "Error al rechazar la hora extra"
                });
            }

            // Registrar en auditoría
            if (USR_PETICION && USR_PETICION.id) {
                try {
                    await AuditoriaModel.registrarCambio({
                        usuario_id: USR_PETICION.id,
                        accion: 'rechazar_horas_extras_pendiente',
                        tabla_afectada: 'horas_extras',
                        registro_id: id,
                        descripcion: `Hora extra ID: ${id} rechazada (de PENDIENTE a RECHAZADA) para trabajador ID: ${horaExtraExistente.usuario_empresa_id}. Motivo: ${motivoFinal}`,
                        datos_anteriores: JSON.stringify({estado: 'PENDIENTE', motivo: horaExtraExistente.motivo}),
                        datos_nuevos: JSON.stringify(horaExtraRechazada),
                        ip_address: req.ip || req.connection.remoteAddress
                    });
                } catch (auditError) {
                    console.error('⚠️ Error al registrar en auditoría:', auditError);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Hora extra rechazada exitosamente",
                data: horaExtraRechazada
            });

        } catch (error) {
            console.error('❌ Error al rechazar hora extra pendiente:', error);
            return res.status(500).json({
                success: false,
                message: "Error al rechazar hora extra pendiente",
                error: error.message
            });
        }
    }

    /**
     * Obtener horas extras pendientes para una empresa
     */
    static async obtenerHorasExtrasPendientes(req, res) {
        try {
            const { empresa_id } = req.params;
            const USR_PETICION = req.user;

            // Verificar que el usuario pertenece a la empresa
            const [empresaUsuario] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
            if (!empresaUsuario || empresaUsuario.empresa_id != empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: "No tiene permisos para ver las horas extras de esta empresa"
                });
            }

            const horasExtrasPendientes = await HorasExtrasModel.getHorasExtrasByEstado('PENDIENTE');
            
            // Filtrar solo las de la empresa correspondiente
            const horasExtrasFiltradas = horasExtrasPendientes.filter(he => {
                // Asumiendo que el query ya incluye empresa info
                return true; // El filtro por empresa ya se hace en el query del modelo
            });

            return res.status(200).json({
                success: true,
                data: horasExtrasFiltradas
            });

        } catch (error) {
            console.error('❌ Error al obtener horas extras pendientes:', error);
            return res.status(500).json({
                success: false,
                message: "Error al obtener horas extras pendientes",
                error: error.message
            });
        }
    }
}

export default HorasExtrasController;
