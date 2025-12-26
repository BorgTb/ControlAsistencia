import express from 'express';
import * as MQTTController from '../controllers/MQTTController.js';
//import { authMiddleware } from '../middleware/AuthMiddleWare.js';

const router = express.Router();

// Proteger rutas con autenticación si es necesario
// router.use(authMiddleware);

// POST /api/mqtt/publish - Publicar mensaje
router.post('/publish', MQTTController.publishMessage);

// GET /api/mqtt/status - Obtener estado de conexión
router.get('/status', MQTTController.getConnectionStatus);

// POST /api/mqtt/subscribe - Suscribirse a topic
router.post('/subscribe', MQTTController.subscribeToTopic);

// POST /api/mqtt/unsubscribe - Desuscribirse de topic
router.post('/unsubscribe', MQTTController.unsubscribeFromTopic);

export default router;
