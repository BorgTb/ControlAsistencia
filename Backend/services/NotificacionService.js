import MailService from './MailService.js';
import UserModel from '../model/UserModel.js';
import MarcacionesService from './MarcacionesServices.js';
import ResolucionModel from '../model/usuarios_empresas_resoluciones.js';
import {DateTime} from 'luxon';

class NotificacionService {
    async procesarNotificacionMarcacion(usuario_id, marcacion_id, usuario_empresa_id = null) {
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
            const [resolucion] = await ResolucionModel.findByUsuarioEmpresaId(usuario_empresa_id);
            console.log('Resolución para usuario_empresa_id', usuario_empresa_id, ':', resolucion);
            if (resolucion) {
                //agregar datos de resolucion a la marcacion
                console.log('Resolución encontrada para usuario_empresa_id:', usuario_empresa_id, resolucion);
                marcacion.data.resolucion = resolucion;
            }

            // Verificar conexión de correo
            const conexionValida = await MailService.verificarConexion();
            if (!conexionValida.success) {
                console.error('Error de conexión con el servicio de correo');
                return {
                    success: false,
                    message: 'Error de conexión con el servicio de correo'
                };
            }
            console.log('Usuario para notificación:', usuario);
            console.log('Marcación para notificación:', marcacion);
            // Enviar notificación
            const estado = await MailService.enviarNotificacionMarcacion(
                usuario,
                marcacion
            );

            console.log('Estado de envío de correo:', estado);
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

}

export default new NotificacionService();