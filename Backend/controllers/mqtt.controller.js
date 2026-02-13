import mqttService from '../services/mqtt.service.js';

/**
 * Publicar mensaje MQTT desde API REST
 */
export const publishMessage = async (req, res) => {
    try {
        const { topic, message, options } = req.body;

        if (!topic || !message) {
            return res.status(400).json({
                success: false,
                message: 'Topic y mensaje son requeridos'
            });
        }

        if (!mqttService.isConnected()) {
            return res.status(503).json({
                success: false,
                message: 'Servicio MQTT no disponible'
            });
        }

        mqttService.publish(topic, message, options || {});

        res.status(200).json({
            success: true,
            message: 'Mensaje publicado exitosamente',
            data: { topic, message }
        });
    } catch (error) {
        console.error('Error publicando mensaje MQTT:', error);
        res.status(500).json({
            success: false,
            message: 'Error al publicar mensaje',
            error: error.message
        });
    }
};

/**
 * Obtener estado de conexiÃ³n MQTT
 */
export const getConnectionStatus = (req, res) => {
    try {
        const isConnected = mqttService.isConnected();
        
        res.status(200).json({
            success: true,
            connected: isConnected,
            message: isConnected ? 'MQTT conectado' : 'MQTT desconectado'
        });
    } catch (error) {
        console.error('Error obteniendo estado MQTT:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estado',
            error: error.message
        });
    }
};

/**
 * Suscribirse a un topic dinÃ¡micamente
 */
export const subscribeToTopic = async (req, res) => {
    try {
        const { topic, qos } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: 'Topic es requerido'
            });
        }

        if (!mqttService.isConnected()) {
            return res.status(503).json({
                success: false,
                message: 'Servicio MQTT no disponible'
            });
        }

        // Callback para el topic
        const callback = (receivedTopic, message) => {
            console.log(`[API Subscribe] ${receivedTopic}: ${message}`);
        };

        mqttService.subscribe(topic, callback, { qos: qos || 0 });

        res.status(200).json({
            success: true,
            message: 'SuscripciÃ³n exitosa',
            data: { topic, qos: qos || 0 }
        });
    } catch (error) {
        console.error('Error suscribiÃ©ndose al topic:', error);
        res.status(500).json({
            success: false,
            message: 'Error al suscribirse',
            error: error.message
        });
    }
};

/**
 * Desuscribirse de un topic
 */
export const unsubscribeFromTopic = async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: 'Topic es requerido'
            });
        }

        mqttService.unsubscribe(topic);

        res.status(200).json({
            success: true,
            message: 'DesuscripciÃ³n exitosa',
            data: { topic }
        });
    } catch (error) {
        console.error('Error desuscribiÃ©ndose del topic:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desuscribirse',
            error: error.message
        });
    }
};
