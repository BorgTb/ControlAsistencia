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
router.get('/:id', AuthService.verifyToken, MarcacionesController.obtenerMarcacionPorUserId);


// Rutas para userEmpresa de marcaciones
router.get('/userEmpresa/todas', AuthService.verifyToken, MarcacionesController.obtenerTodasLasMarcaciones);
router.get('/userEmpresa/empresa/:rutEmpresa/fecha/:fecha', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorFecha );
router.get('/userEmpresa/empresa/:rutEmpresa', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorEmpresa);
router.put('/userEmpresa/modificar/:id', AuthService.verifyToken, MarcacionesController.modificarMarcacionPorId);


export default router;
