import AuditoriaModel from '../model/auditoria.model.js';

class AuditoriaController {
    
    // Obtener todos los registros de auditoría
    static async obtenerRegistrosAuditoria(req, res) {
        try {
            const limite = req.query.limite || 50;
            const registros = await AuditoriaModel.obtenerRegistrosAuditoria(parseInt(limite));
            
            res.status(200).json({
                success: true,
                message: 'Registros de auditoría obtenidos exitosamente',
                data: registros
            });
        } catch (error) {
            console.error('Error al obtener registros de auditoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener registros de auditoría de un usuario específico
    static async obtenerRegistrosPorUsuario(req, res) {
        try {
            const { usuario_id } = req.params;
            const limite = req.query.limite || 20;
            
            const registros = await AuditoriaModel.obtenerRegistrosPorUsuario(
                parseInt(usuario_id), 
                parseInt(limite)
            );
            
            res.status(200).json({
                success: true,
                message: 'Registros de auditoría del usuario obtenidos exitosamente',
                data: registros
            });
        } catch (error) {
            console.error('Error al obtener registros de auditoría por usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de sesiones
    static async obtenerEstadisticasSesiones(req, res) {
        try {
            const estadisticas = await AuditoriaModel.obtenerEstadisticasSesiones();
            
            res.status(200).json({
                success: true,
                message: 'Estadísticas de sesiones obtenidas exitosamente',
                data: estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas de sesiones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Registrar cierre de sesión manual
    static async registrarCierreSesion(req, res) {
        try {
            const { usuario_id, sesion_id, usuarioId, sesionId } = req.body;
            
            // Compatibilidad con ambos formatos de nombres
            const userId = usuario_id || usuarioId;
            const sessionId = sesion_id || sesionId;
            
            const resultado = await AuditoriaModel.registrarCierreSesion(userId, sessionId);
            
            if (resultado) {
                res.status(200).json({
                    success: true,
                    message: 'Cierre de sesión registrado exitosamente'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'No se encontró sesión activa para cerrar'
                });
            }
        } catch (error) {
            console.error('Error al registrar cierre de sesión:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Cerrar sesión del usuario actual
    static async cerrarSesionUsuario(req, res) {
        try {
            console.log('🔥 === INICIANDO CIERRE DE SESIÓN ===');
            console.log('📨 Datos recibidos en req.body:', req.body);
            console.log('👤 Datos del usuario en req.user:', req.user);
            
            const usuario_id = req.user?.id || req.body.usuario_id;
            console.log('🆔 Usuario ID extraído:', usuario_id);
            
            if (!usuario_id) {
                console.log('❌ No se encontró ID de usuario');
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario requerido'
                });
            }

            console.log('🔄 Llamando a AuditoriaModel.cerrarSesionUsuario...');
            const resultado = await AuditoriaModel.cerrarSesionUsuario(usuario_id);
            console.log('✅ Resultado del modelo:', resultado);
            
            res.status(200).json({
                success: true,
                message: `Sesión cerrada exitosamente. ${resultado.sesiones_cerradas} sesiones actualizadas`,
                data: resultado
            });
            console.log('📤 Respuesta enviada exitosamente');
        } catch (error) {
            console.error('❌ Error en cerrarSesionUsuario controller:', error);
            console.error('📍 Stack trace:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Cerrar sesiones expiradas (endpoint de mantenimiento)
    static async cerrarSesionesExpiradas(req, res) {
        try {
            const horasExpiracion = req.body.horas || 24;
            
            const sesionesActualizadas = await AuditoriaModel.cerrarSesionesExpiradas(horasExpiracion);
            
            res.status(200).json({
                success: true,
                message: `Se cerraron ${sesionesActualizadas} sesiones expiradas`,
                sesiones_cerradas: sesionesActualizadas
            });
        } catch (error) {
            console.error('Error al cerrar sesiones expiradas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener cambios específicos realizados por un usuario
    static async obtenerCambiosUsuario(req, res) {
        try {
            const { usuario_id } = req.params;
            const limite = req.query.limite || 50;
            
            console.log('📋 Obteniendo cambios para usuario:', { usuario_id, limite });
            
            // Validar que el usuario_id sea un número válido
            const usuarioIdNumero = parseInt(usuario_id);
            if (isNaN(usuarioIdNumero)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }
            
            // Obtener cambios del modelo
            const cambios = await AuditoriaModel.obtenerCambiosPorUsuario(
                usuarioIdNumero, 
                parseInt(limite)
            );
            
            res.status(200).json({
                success: true,
                message: 'Cambios del usuario obtenidos exitosamente',
                cambios: cambios,
                total: cambios.length
            });
            
        } catch (error) {
            console.error('❌ Error al obtener cambios del usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Registrar un nuevo cambio en el sistema  
    static async registrarCambio(req, res) {
        try {
            const { 
                usuario_id, 
                accion, 
                tabla_afectada, 
                registro_id, 
                descripcion, 
                datos_anteriores, 
                datos_nuevos,
                ip_address 
            } = req.body;
            
            console.log('📝 Registrando nuevo cambio:', { usuario_id, accion, tabla_afectada });
            
            // Validar campos requeridos
            if (!usuario_id || !accion || !tabla_afectada || !descripcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos requeridos: usuario_id, accion, tabla_afectada, descripcion'
                });
            }
            
            // Registrar el cambio
            const cambioId = await AuditoriaModel.registrarCambio({
                usuario_id,
                accion,
                tabla_afectada,
                registro_id,
                descripcion,
                datos_anteriores,
                datos_nuevos,
                ip_address
            });
            
            res.status(201).json({
                success: true,
                message: 'Cambio registrado exitosamente',
                cambio_id: cambioId
            });
            
        } catch (error) {
            console.error('❌ Error al registrar cambio:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default AuditoriaController;