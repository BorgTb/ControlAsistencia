import MailService from './mail.service.js';
import UserModel from '../model/user.model.js';
import MarcacionesService from './marcaciones.service.js';
import ResolucionModel from '../model/usuarios-empresas-resoluciones.model.js';
import EmpresaModel from '../model/empresa.model.js';
import EstAsignacionesModel from '../model/est-asignaciones.model.js';
import UsuarioEmpresaModel from '../model/usuario-empresa.model.js';
import PDFService from '../services/pdf.service.js';

import { DateTime } from 'luxon';

class NotificacionService {
    async procesarNotificacionMarcacion(usuario_id, marcacion_id, usuario_empresa = null, lugar = null, domicilio_prestacion = null) {
        try {

            // Obtener datos del usuario
            const usuario = await UserModel.findById(usuario_id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            // Obtener datos de la marcaciÃƒÂ³n
            const marcacion = await MarcacionesService.obtenerMarcacionPorId(marcacion_id);
            if (!marcacion.success) {
                throw new Error('MarcaciÃƒÂ³n no encontrada');
            }

            // Ver si el usuario se encuentra afecto a un sistema excepcional
            const resoluciones = await ResolucionModel.findByUsuarioEmpresaId(usuario_empresa.id);
            if (resoluciones && resoluciones.length > 0) {
                //agregar datos de resolucion a la marcacion
                marcacion.data.resolucion = resoluciones[0];
            }


            console.log('Usuario para notificaciÃƒÂ³n:', usuario);
            console.log('MarcaciÃƒÂ³n para notificaciÃƒÂ³n:', marcacion);
            console.log('Usuario Empresa para notificaciÃƒÂ³n:', usuario_empresa);
            
            // agregar datos de la empresa
            const empresa = await EmpresaModel.getEmpresaById(usuario_empresa.empresa_id);



            // Verificar si el usuario estÃƒÂ¡ afecto a una EST
            const estAsignacion = await EstAsignacionesModel.getActiveByUsuarioEmpresaId(usuario_empresa.id);
            let empresa_est = null;
            if (estAsignacion && estAsignacion.fecha_fin === null) {
                empresa_est = await EmpresaModel.getEmpresaById(estAsignacion.usuaria_id);
                console.log(estAsignacion);
                const empleador_est = await UsuarioEmpresaModel.getPrimerEmpleadorActivoByEmpresaId(estAsignacion.est_id);
                console.log('Empleador EST:', empleador_est);

                await MailService.enviarNotificacionMarcacionEmpresa(usuario, marcacion, empresa, lugar, domicilio_prestacion, empresa_est, empleador_est.usuario_email);
            }


            console.log('est asignacion:', estAsignacion);
            console.log('empresa est:', empresa_est);





            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }

            console.log('Lugar aproximado de la marcaciÃƒÂ³n:', lugar);

            // Enviar notificaciÃƒÂ³n
            const estado = await MailService.enviarNotificacionMarcacion(
                usuario,
                marcacion,
                empresa,
                lugar,
                domicilio_prestacion,
                empresa_est
            );

            return estado;

        } catch (error) {
            console.error('Error al procesar notificaciÃƒÂ³n:', error);
            return {
                success: false,
                message: 'Error al procesar notificaciÃƒÂ³n',
                error: error.message
            };
        }
    }

    async enviarCodigoTemporal(email, codigo) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }
            // Enviar cÃƒÂ³digo temporal
            const estado = await MailService.enviarNotificacionCodigoAcceso(email, codigo);
            return estado;
        } catch (error) {
            console.error('Error al enviar cÃƒÂ³digo temporal:', error);
            return {
                success: false,
                message: 'Error al enviar cÃƒÂ³digo temporal',
                error: error.message
            };
        }
    }

    async enviarNotificacionConfirmacionModificacionMarcacion(reporte, data) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }

            // Enviar notificaciÃƒÂ³n
            const estado = await MailService.enviarNotificacionConfirmacionModificacionMarcacion(reporte, data);
        } catch (error) {
            console.error('Error al enviar notificaciÃƒÂ³n de confirmaciÃƒÂ³n de modificaciÃƒÂ³n de marcaciÃƒÂ³n:', error);
            return {
                success: false,
                message: 'Error al enviar notificaciÃƒÂ³n de confirmaciÃƒÂ³n de modificaciÃƒÂ³n de marcaciÃƒÂ³n',
                error: error.message
            };
        }
    }

    async enviarNotificacionConfirmacionNuevaMarcacion(reporte, data) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }

            // Enviar notificaciÃƒÂ³n
            console.log("Enviando notificacion de nueva marcacion:", reporte, data);
            const estado = await MailService.enviarNotificacionConfirmacionNuevaMarcacion(reporte, data);
        } catch (error) {
            console.error('Error al enviar notificaciÃƒÂ³n de confirmaciÃƒÂ³n de nueva marcaciÃƒÂ³n:', error);
            return {
                success: false,
                message: 'Error al enviar notificaciÃƒÂ³n de confirmaciÃƒÂ³n de nueva marcaciÃƒÂ³n',
                error: error.message
            };
        }
    }

    async procesarNotificacionModificacionMarcacion(usuario, marcacionOriginal, datosModificados, nuevoReporteId) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }
            // Enviar notificaciÃƒÂ³n
            const estado = await MailService.enviarNotificacionModificacionMarcacion(
                usuario,
                marcacionOriginal,
                datosModificados,
                nuevoReporteId
            );
            return estado;
        } catch (error) {
            console.error('Error al procesar notificaciÃƒÂ³n de modificaciÃƒÂ³n de marcaciÃƒÂ³n:', error);
            return {
                success: false,
                message: 'Error al procesar notificaciÃƒÂ³n de modificaciÃƒÂ³n de marcaciÃƒÂ³n',
                error: error.message
            };
        }
    }

    async enviarCorreoNotificacionEmpleador(emailEmpleador) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }
            // Enviar notificaciÃƒÂ³n
            const estado = await MailService.enviarCorreoNotificacionEmpleador(emailEmpleador);
            return estado;
        } catch (error) {

            console.error('Error al enviar notificaciÃƒÂ³n al empleador:', error);
            return {
                success: false,
                message: 'Error al enviar notificaciÃƒÂ³n al empleador',
                error: error.message
            };
        }


    }

    async enviarNotificacionAmonestacion(trabajador, amonestacion, empresa, pdfPath) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }

            // Enviar notificaciÃƒÂ³n con PDF adjunto
            const estado = await MailService.enviarNotificacionAmonestacion(
                trabajador,
                amonestacion,
                empresa,
                pdfPath
            );

            return estado;
        } catch (error) {
            console.error('Error al enviar notificaciÃƒÂ³n de amonestaciÃƒÂ³n:', error);
            return {
                success: false,
                message: 'Error al enviar notificaciÃƒÂ³n de amonestaciÃƒÂ³n',
                error: error.message
            };
        }
    }

    async enviarNotificacionCambioTurno(trabajador, tipoTurnoAnterior, nuevoTipoTurno) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }

            const pdfBuffer = await PDFService.generarPdfCambioTurno(trabajador, tipoTurnoAnterior, nuevoTipoTurno);
            const fechaActual = DateTime.now().toFormat('yyyyMMdd_HHmmss');
            const pdfPath = await PDFService.guardarPDFTemporal(pdfBuffer, `Cambio_Turno_${trabajador.id}_${fechaActual}.pdf`);


            // Enviar notificaciÃƒÂ³n de cambio de turno
            const estado = await MailService.enviarNotificacionCambioTurno(
                trabajador,
                tipoTurnoAnterior,
                nuevoTipoTurno,
                pdfPath
            );
            return estado;
        } catch (error) {
            console.error('Error al enviar notificaciÃƒÂ³n de cambio de turno:', error);
            return {
                success: false,
                message: 'Error al enviar notificaciÃƒÂ³n de cambio de turno',
                error: error.message
            };
        }
    }

    async enviarNotificacionAprobacionSolicitud(solicitud, usuario_que_aprueba, observaciones = null) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }

            // Obtener datos del usuario que solicita
            const usuarioSolicitante = await UserModel.findById(solicitud.usuario_id);
            if (!usuarioSolicitante) {
                throw new Error('Usuario solicitante no encontrado');
            }

            // Obtener datos de la empresa
            const empresa = await EmpresaModel.getEmpresaById(solicitud.empresa_id);

            // Enviar notificaciÃƒÂ³n de aprobaciÃƒÂ³n
            const estado = await MailService.enviarNotificacionAprobacionSolicitud(
                usuarioSolicitante,
                solicitud,
                usuario_que_aprueba,
                empresa,
                observaciones
            );

            //enviar copia al empleador
            const copia = MailService.enviarNotificacionAprobacionSolicitudCopiaEmpleador(
                usuarioSolicitante,
                solicitud,
                usuario_que_aprueba,
                empresa,
                observaciones
            );


            return estado;
        } catch (error) {
            console.error('Error al enviar notificaciÃƒÂ³n de aprobaciÃƒÂ³n de solicitud:', error);
            return {
                success: false,
                message: 'Error al enviar notificaciÃƒÂ³n de aprobaciÃƒÂ³n',
                error: error.message
            };
        }
    }

    async enviarNotificacionRechazosolicitud(solicitud, usuario_que_rechaza, datosRechazo = {}) {
        try {
            // Verificar conexiÃƒÂ³n de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexiÃƒÂ³n con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexiÃƒÂ³n con el servicio de correo'
                };
            }

            // Obtener datos del usuario que solicita
            const usuarioSolicitante = await UserModel.findById(solicitud.usuario_id);
            if (!usuarioSolicitante) {
                throw new Error('Usuario solicitante no encontrado');
            }

            // Obtener datos de la empresa
            const empresa = await EmpresaModel.getEmpresaById(solicitud.empresa_id);

            // Enviar notificaciÃƒÂ³n de rechazo con todos los detalles
            const estado = await MailService.enviarNotificacionRechazosolicitud(
                usuarioSolicitante,
                solicitud,
                usuario_que_rechaza,
                empresa,
                datosRechazo
            );

            return estado;
        } catch (error) {
            console.error('Error al enviar notificaciÃƒÂ³n de rechazo de solicitud:', error);
            return {
                success: false,
                message: 'Error al enviar notificaciÃƒÂ³n de rechazo',
                error: error.message
            };
        }
    }

}

export default new NotificacionService();