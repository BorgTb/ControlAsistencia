import MailService from './MailService.js';
import UserModel from '../model/UserModel.js';
import MarcacionesService from './MarcacionesServices.js';

class NotificacionService {
    async procesarNotificacionMarcacion(usuario_id, marcacion_id) {
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
            const estado = await MailService.enviarNotificacionMarcacion(
                usuario.email,
                usuario.nombre,
                marcacion.data.tipo,
                new Date(marcacion.data.fecha).toISOString().split('T')[0],
                marcacion.data.hora
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