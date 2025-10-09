import express from 'express';
import AdminController from '../controllers/AdminController.js';
import AuthService from '../middleware/AuthMiddleWare.js';

const router = express.Router();



router.post('/trabajador',AuthService.verifyToken, AdminController.createTrabajador);
router.get('/trabajador/:rut',AuthService.verifyToken, AdminController.obtenerTrabajadores);
router.post('/enrolar-trabajador',AuthService.verifyToken, AdminController.enrolarTrabajador);
router.post('/turnos',AuthService.verifyToken, AdminController.createTurno);
router.delete('/turnos/:id',AuthService.verifyToken, AdminController.deleteTurno); // nueva ruta para eliminar
router.get('/turnos/:rut',AuthService.verifyToken, AdminController.obtenerTurnos);







export default router;