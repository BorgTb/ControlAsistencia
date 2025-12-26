import express from 'express';
import * as ZKDeviceController from '../controllers/ZKDeviceController.js';
//import { authMiddleware } from '../middleware/AuthMiddleWare.js';

const router = express.Router();

// Proteger rutas con autenticación
// router.use(authMiddleware);

// GET /api/zk/devices - Obtener todos los dispositivos
router.get('/devices', ZKDeviceController.getAllDevices);

// GET /api/zk/devices/online - Obtener dispositivos online
router.get('/devices/online', ZKDeviceController.getOnlineDevices);

// GET /api/zk/devices/:serial - Obtener estado de un dispositivo
router.get('/devices/:serial', ZKDeviceController.getDeviceStatus);

// POST /api/zk/devices - Registrar nuevo dispositivo
router.post('/devices', ZKDeviceController.registerDevice);

// DELETE /api/zk/devices/:serial - Desregistrar dispositivo
router.delete('/devices/:serial', ZKDeviceController.unregisterDevice);

// POST /api/zk/devices/:serial/command - Enviar comando a dispositivo
router.post('/devices/:serial/command', ZKDeviceController.sendCommand);

// GET /api/zk/devices/:serial/users - Obtener usuarios del dispositivo
router.get('/devices/:serial/users', ZKDeviceController.getUsers);

// POST /api/zk/devices/:serial/sync-time - Sincronizar tiempo
router.post('/devices/:serial/sync-time', ZKDeviceController.syncTime);

// GET /api/zk/devices/:serial/attendance - Obtener asistencia
router.get('/devices/:serial/attendance', ZKDeviceController.getAttendance);

// GET /api/zk/devices/:serial/info - Obtener información del dispositivo
router.get('/devices/:serial/info', ZKDeviceController.getDeviceInfo);

// POST /api/zk/devices/:serial/restart - Reiniciar dispositivo
router.post('/devices/:serial/restart', ZKDeviceController.restartDevice);

// POST /api/zk/devices/:serial/clear-logs - Limpiar logs
router.post('/devices/:serial/clear-logs', ZKDeviceController.clearLogs);

// POST /api/zk/devices/:serial/open-door - Abrir puerta
router.post('/devices/:serial/open-door', ZKDeviceController.openDoor);

export default router;
