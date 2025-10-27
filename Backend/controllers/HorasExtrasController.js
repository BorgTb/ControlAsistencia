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







            // Validar que no exista solapamiento de horas extras
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

            console.log('💾 Guardando horas extras:', horaExtraData);
            const horaExtra = await HorasExtrasModel.createHoraExtra(horaExtraData);

            // Registrar en auditoría
            if (USR_PETICION && USR_PETICION.id) {
                try {
                    await AuditoriaModel.registrarCambio({
                        usuario_id: USR_PETICION.id,
                        accion: 'aprobar_horas_extras',
                        tabla_afectada: 'horas_extras',
                        registro_id: horaExtra.id,
                        descripcion: `Horas extras aprobadas para trabajador ID: ${usuario_empresa_id} - Fecha: ${fecha} - Horario: ${hora_inicio} a ${hora_fin}`,
                        datos_anteriores: null,
                        datos_nuevos: JSON.stringify(horaExtra),
                        ip_address: req.ip || req.connection.remoteAddress
                    });
                } catch (auditError) {
                    console.error('⚠️ Error al registrar en auditoría:', auditError);
                }
            }

            return res.status(201).json({
                success: true,
                message: "Horas extras aprobadas exitosamente",
                data: horaExtra
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
}

export default HorasExtrasController;
