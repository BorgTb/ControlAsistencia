import express from 'express';
import * as ZKDeviceController from '../controllers/zk-device.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
//este archivo tiene rutas de dispositivos ZK mediante mqqt
const router = express.Router();

// Proteger rutas con autenticación
// router.use(authMiddleware);

// GET /api/zk/devices - Obtener todos los dispositivos
router.get('/devices', authMiddleware.verifyToken, ZKDeviceController.getAllDevices);

// GET /api/zk/devices/online - Obtener dispositivos online
router.get('/devices/online', authMiddleware.verifyToken, ZKDeviceController.getOnlineDevices);

// GET /api/zk/devices/:serial - Obtener estado de un dispositivo
router.get('/devices/:serial', authMiddleware.verifyToken, ZKDeviceController.getDeviceStatus);

// POST /api/zk/devices - Registrar nuevo dispositivo
router.post('/devices', authMiddleware.verifyToken, ZKDeviceController.registerDevice);

// PUT /api/zk/devices/:serial - Actualizar dispositivo
router.put('/devices/:serial', authMiddleware.verifyToken, ZKDeviceController.updateDevice);

// DELETE /api/zk/devices/:serial - Desregistrar dispositivo
router.delete('/devices/:serial', authMiddleware.verifyToken, ZKDeviceController.unregisterDevice);

// POST /api/zk/devices/:serial/command - Enviar comando a dispositivo
router.post('/devices/:serial/command', authMiddleware.verifyToken, ZKDeviceController.sendCommand);

// GET /api/zk/devices/:serial/users - Obtener usuarios del dispositivo
router.get('/devices/:serial/users', authMiddleware.verifyToken, ZKDeviceController.getUsers);

// DELETE /api/zk/devices/:serial/users - Eliminar usuario del dispositivo
router.delete('/devices/:serial/users', authMiddleware.verifyToken, ZKDeviceController.deleteUser);

// POST /api/zk/devices/:serial/sync-time - Sincronizar tiempo
router.post('/devices/:serial/sync-time', authMiddleware.verifyToken, ZKDeviceController.syncTime);

// GET /api/zk/devices/:serial/attendance - Obtener asistencia
router.get('/devices/:serial/attendance', authMiddleware.verifyToken, ZKDeviceController.getAttendance);

// GET /api/zk/devices/:serial/info - Obtener información del dispositivo
router.get('/devices/:serial/info', authMiddleware.verifyToken, ZKDeviceController.getDeviceInfo);

// POST /api/zk/devices/:serial/restart - Reiniciar dispositivo
router.post('/devices/:serial/restart', authMiddleware.verifyToken, ZKDeviceController.restartDevice);

// POST /api/zk/devices/:serial/clear-logs - Limpiar logs
router.post('/devices/:serial/clear-logs', authMiddleware.verifyToken, ZKDeviceController.clearLogs);

// POST /api/zk/devices/:serial/open-door - Abrir puerta
router.post('/devices/:serial/open-door', authMiddleware.verifyToken, ZKDeviceController.openDoor);

export default router;
