import express from 'express';
import MarcacionesController from '../controllers/MarcacionesController.js';
import AuthService from '../middleware/AuthMiddleWare.js';



const router = express.Router();

router.post('/entrada', AuthService.verifyToken, MarcacionesController.registrarEntrada);
router.post('/salida', AuthService.verifyToken, MarcacionesController.registrarSalida);
router.get('/hoy', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorUsuario);


export default router;
