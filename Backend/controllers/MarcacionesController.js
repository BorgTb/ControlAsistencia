import MarcacionesService from '../services/MarcacionesServices.js';
import NotificacionService from '../services/NotificacionService.js';

const registrarEntrada = async (req, res) => {
    try {
        const { geo_lat, geo_lon, location_quality, ip_cliente } = req.body;
        const usuario_id = req.user?.id;
        
        if (!usuario_id || !geo_lat || !geo_lon || !location_quality || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para registrar la entrada.'
            });
        }

        console.log('Datos recibidos para registrar entrada:', {
            usuario_id, geo_lat, geo_lon, location_quality, ip_cliente
        });

        const result = await MarcacionesService.registrarMarcacion(
            usuario_id, 'entrada', geo_lat, geo_lon, ip_cliente
        );

        if (!result.success) {
            return res.status(500).json(result);
        }

        // Procesar notificación de forma asíncrona (no bloquea la respuesta)
        NotificacionService.procesarNotificacionMarcacion(usuario_id, result.data.id)
            .catch(error => console.error('Error en notificación:', error));

        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Error en registrarEntrada:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const registrarSalida = async (req, res) => {
    try {
        const { geo_lat, geo_lon, location_quality, ip_cliente } = req.body;
        const usuario_id = req.user?.id;

        if (!usuario_id || !geo_lat || !geo_lon || !location_quality || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para registrar la salida.'
            });
        }
        
        console.log('Datos recibidos para registrar salida:', {
            usuario_id,
            geo_lat,
            geo_lon,
            location_quality,
            ip_cliente
        });

        const result = await MarcacionesService.registrarMarcacion(
            usuario_id, 
            'salida', 
            geo_lat, 
            geo_lon, 
            ip_cliente
        );

        if (!result.success) {
            return res.status(500).json(result);
        }

        // Procesar notificación de salida de forma asíncrona (no bloquea la respuesta)
        NotificacionService.procesarNotificacionMarcacion(usuario_id, result.data.id)
            .catch(error => console.error('Error en notificación de salida:', error));

        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Error en registrarSalida:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const obtenerMarcacionesPorUsuario = async (req, res) => {
    try {
        const usuario_id = req.user?.id;
        const { fecha } = req.query; // Obtener fecha de query params (opcional)

        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no identificado'
            });
        }

        const result = await MarcacionesService.obtenerMarcacionesPorUsuario(usuario_id, fecha);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
        
    } catch (error) {
        console.error('Error en obtenerMarcacionesPorUsuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const MarcacionesController = {
    registrarEntrada,
    registrarSalida,
    obtenerMarcacionesPorUsuario
}

export default MarcacionesController;