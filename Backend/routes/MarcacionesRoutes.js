import express from 'express';
import MarcacionesController from '../controllers/MarcacionesController.js';
import AuthService from '../middleware/AuthMiddleWare.js';



const router = express.Router();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// IMPORTANTE: Estas deben ir ANTES de las rutas con autenticación
// ============================================

// Ruta pública para obtener solicitud de modificación por token
router.get('/solicitud-modificar', MarcacionesController.obtenerReporteMarcacionId);

// Rutas públicas para aceptar/rechazar modificaciones (usan token en body)
router.post('/modificar/aceptar', MarcacionesController.aceptarModificacionMarcacion);
router.post('/modificar/rechazar', MarcacionesController.rechazarModificacionMarcacion);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

router.post('/entrada', AuthService.verifyToken, MarcacionesController.registrarEntrada);
router.post('/salida', AuthService.verifyToken, MarcacionesController.registrarSalida);
router.post('/inicio-colacion', AuthService.verifyToken, MarcacionesController.registrarColacion);
router.post('/termino-colacion', AuthService.verifyToken, MarcacionesController.registrarTerminoColacion);
router.get('/hoy', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorUsuario);
router.get('/horario-hoy', AuthService.verifyToken, MarcacionesController.obtenerHorarioHoy);

// Rutas para userEmpresa de marcaciones
router.get('/userEmpresa/todas', AuthService.verifyToken, MarcacionesController.obtenerTodasLasMarcaciones);
router.get('/userEmpresa/empresa/:rutEmpresa/fecha/:fecha', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorFecha );
router.get('/userEmpresa/empresa/:rutEmpresa', AuthService.verifyToken, MarcacionesController.obtenerMarcacionesPorEmpresa);
router.put('/userEmpresa/modificar/:id', AuthService.verifyToken, MarcacionesController.modificarMarcacionPorId);
router.post('/userEmpresa/agregar', AuthService.verifyToken, MarcacionesController.agregarMarcacionManual);

// Esta ruta debe estar al final para evitar conflictos con otras rutas
router.get('/:id', AuthService.verifyToken, MarcacionesController.obtenerMarcacionPorUserId);


export default router;
