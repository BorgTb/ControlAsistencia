import express from 'express';
import MarcacionesController from '../controllers/MarcacionesController.js';
import AuthService from '../middleware/AuthMiddleWare.js';



const router = express.Router();

router.post('/entrada', AuthService.verifyToken, MarcacionesController.registrarEntrada);
router.post('/salida', AuthService.verifyToken, MarcacionesController.registrarSalida);
router.post('/inicio-colacion', AuthService.verifyToken, MarcacionesController.registrarColacion);
router.post('/termino-colacion', AuthService.verifyToken, MarcacionesController.registrarTerminoColacion);
router.get('/hoy', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorUsuario);
router.get('/horario-hoy', AuthService.verifyToken, MarcacionesController.obtenerHorarioHoy);


export default router;
