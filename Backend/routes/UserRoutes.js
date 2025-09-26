import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import UserController from '../controllers/UserController.js';




const router = express.Router();

// Rutas de usuario estándar
router.put('/email', AuthService.verifyToken, UserController.updateEmail);
router.put('/password', AuthService.verifyToken, UserController.updatePassword);
router.post('/reportes/', AuthService.verifyToken, UserController.createReporte);
router.post('/reportes/solicitud', AuthService.verifyToken, UserController.createSolicitudMarcacion);

/**
 * Rutas exclusivas para administradores
 * Protegidas con el middleware isAdmin para asegurar que solo usuarios con rol 'admin' accedan.
 */
router.post('/admin', AuthService.verifyToken, AuthService.isAdmin, UserController.createAdmin); // Crear admin
router.get('/admins', AuthService.verifyToken, AuthService.isAdmin, UserController.listAdmins);   // Listar admins

export default router;
