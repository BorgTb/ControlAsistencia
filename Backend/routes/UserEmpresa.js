import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import UserEmpresaController from '../controllers/UserEmpresaController.js';



const router = express.Router();


router.post('/trabajador',AuthService.verifyToken, UserEmpresaController.createTrabajador);
router.get('/trabajador/:rut',AuthService.verifyToken, UserEmpresaController.obtenerTrabajadores);
router.post('/enrolar-trabajador',AuthService.verifyToken, UserEmpresaController.enrolarTrabajador);
router.post('/turnos',AuthService.verifyToken, UserEmpresaController.createTurno);
router.get('/turnos/:rut',AuthService.verifyToken, UserEmpresaController.obtenerTurnos);


export default router;
