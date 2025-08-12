import express from 'express';
import AdminController from '../controllers/AdminController.js';

const router = express.Router();



router.post('/trabajador', AdminController.createTrabajador);
router.get('/trabajador/:rut', AdminController.obtenerTrabajadores);
router.post('/turnos', AdminController.createTurno);
router.get('/turnos', AdminController.obtenerTurnos);





export default router;