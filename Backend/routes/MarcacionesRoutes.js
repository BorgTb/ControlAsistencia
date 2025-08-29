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


// Rutas para administración de marcaciones
router.get('/admin/todas', AuthService.verifyToken, MarcacionesController.obtenerTodasLasMarcaciones);
router.get('/admin/empresa/:rutEmpresa/fecha/:fecha', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorFecha );
router.get('/admin/empresa/:rutEmpresa', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorEmpresa);


export default router;
