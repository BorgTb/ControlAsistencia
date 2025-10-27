import MailService from './MailService.js';
import UserModel from '../model/UserModel.js';
import MarcacionesService from './MarcacionesServices.js';
import ResolucionModel from '../model/usuarios_empresas_resoluciones.js';
import EmpresaModel from '../model/EmpresaModel.js';
import EstAsignacionesModel from '../model/EstAsignacionesModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';

import {DateTime} from 'luxon';

class NotificacionService {
    async procesarNotificacionMarcacion(usuario_id, marcacion_id, usuario_empresa = null, lugar = null, domicilio_prestacion = null) {
        try {

            // Obtener datos del usuario
            const usuario = await UserModel.findById(usuario_id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            // Obtener datos de la marcación
            const marcacion = await MarcacionesService.obtenerMarcacionPorId(marcacion_id);
            if (!marcacion.success) {
                throw new Error('Marcación no encontrada');
            }

            // Ver si el usuario se encuentra afecto a un sistema excepcional
            const [resolucion] = await ResolucionModel.findByUsuarioEmpresaId(usuario_empresa.id);
            if (resolucion) {
                //agregar datos de resolucion a la marcacion
                marcacion.data.resolucion = resolucion;
            }

            // agregar datos de la empresa
            const empresa = await EmpresaModel.getEmpresaById(usuario_empresa.empresa_id);



            // Verificar si el usuario está afecto a una EST
            const estAsignacion = await EstAsignacionesModel.getActiveByUsuarioEmpresaId(usuario_empresa.id);            
            let empresa_est = null;
            if (estAsignacion && estAsignacion.fecha_fin === null) {
                empresa_est = await EmpresaModel.getEmpresaById(estAsignacion.usuaria_id);
                console.log(estAsignacion);
                const empleador_est = await UsuarioEmpresaModel.getPrimerEmpleadorActivoByEmpresaId(estAsignacion.est_id);
                console.log('Empleador EST:', empleador_est);

                await MailService.enviarNotificacionMarcacionEmpresa(usuario,marcacion,empresa,lugar,domicilio_prestacion,empresa_est,empleador_est.usuario_email);
            }


            console.log('est asignacion:', estAsignacion);
            console.log('empresa est:', empresa_est);


            


            // Verificar conexión de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexión con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexión con el servicio de correo'
                };
            }

            console.log('Lugar aproximado de la marcación:', lugar);

            // Enviar notificación
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
            console.error('Error al procesar notificación:', error);
            return {
                success: false,
                message: 'Error al procesar notificación',
                error: error.message
            };
        }
    }

    async enviarCodigoTemporal(email, codigo) {
        try {
            // Verificar conexión de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexión con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexión con el servicio de correo'
                };
            }
            // Enviar código temporal
            const estado = await MailService.enviarNotificacionCodigoAcceso(email, codigo);
            return estado;
        } catch (error) {
            console.error('Error al enviar código temporal:', error);
            return {
                success: false,
                message: 'Error al enviar código temporal',
                error: error.message
            };
        }
    }

    async enviarNotificacionConfirmacionModificacionMarcacion(reporte, data) {
        try {
            // Verificar conexión de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexión con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexión con el servicio de correo'
                };
            }

            // Enviar notificación
            const estado = await MailService.enviarNotificacionConfirmacionModificacionMarcacion(reporte, data);
        } catch (error) {
            console.error('Error al enviar notificación de confirmación de modificación de marcación:', error);
            return {
                success: false,
                message: 'Error al enviar notificación de confirmación de modificación de marcación',
                error: error.message
            };
        }
    }

    async enviarNotificacionConfirmacionNuevaMarcacion(reporte, data) {
        try {
            // Verificar conexión de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexión con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexión con el servicio de correo'
                };
            }

            // Enviar notificación
            console.log("Enviando notificacion de nueva marcacion:", reporte, data);
            const estado = await MailService.enviarNotificacionConfirmacionNuevaMarcacion(reporte, data);
        } catch (error) {
            console.error('Error al enviar notificación de confirmación de nueva marcación:', error);
            return {
                success: false,
                message: 'Error al enviar notificación de confirmación de nueva marcación',
                error: error.message
            };
        }
    }

    async procesarNotificacionModificacionMarcacion(usuario, marcacionOriginal, datosModificados, nuevoReporteId) {
        try {
            // Verificar conexión de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexión con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexión con el servicio de correo'
                };
            }
            // Enviar notificación
            const estado = await MailService.enviarNotificacionModificacionMarcacion(
                usuario,
                marcacionOriginal,
                datosModificados,
                nuevoReporteId
            );
            return estado;
        } catch (error) {
            console.error('Error al procesar notificación de modificación de marcación:', error);
            return {
                success: false,
                message: 'Error al procesar notificación de modificación de marcación',
                error: error.message
            };
        }
    }

    async enviarCorreoNotificacionEmpleador(emailEmpleador){
        try {
            // Verificar conexión de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexión con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexión con el servicio de correo'
                };
            }
            // Enviar notificación
            const estado = await MailService.enviarCorreoNotificacionEmpleador(emailEmpleador);
            return estado;
        } catch (error) {

            console.error('Error al enviar notificación al empleador:', error);
            return {
                success: false,
                message: 'Error al enviar notificación al empleador',
                error: error.message
            };
        }
        
            
    }

    async enviarNotificacionAmonestacion(trabajador, amonestacion, empresa, pdfPath) {
        try {
            // Verificar conexión de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexión con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexión con el servicio de correo'
                };
            }

            // Enviar notificación con PDF adjunto
            const estado = await MailService.enviarNotificacionAmonestacion(
                trabajador,
                amonestacion,
                empresa,
                pdfPath
            );

            return estado;
        } catch (error) {
            console.error('Error al enviar notificación de amonestación:', error);
            return {
                success: false,
                message: 'Error al enviar notificación de amonestación',
                error: error.message
            };
        }
    }



}

export default new NotificacionService();