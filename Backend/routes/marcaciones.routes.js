import express from 'express';
import MarcacionesController from '../controllers/marcaciones.controller.js';
import AuthService from '../middleware/auth.middleware.js';



const router = express.Router();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// IMPORTANTE: Estas deben ir ANTES de las rutas con autenticación
// ============================================

router.get('/calendario/', AuthService.verifyToken, MarcacionesController.obtenerDiasTrabajadosPorMes);

// Ruta protegida para obtener solicitud de modificación por token (requiere autenticación)
router.get('/solicitud-modificar', AuthService.verifyToken, MarcacionesController.obtenerReporteMarcacionId);

// Rutas protegidas para aceptar/rechazar modificaciones (requieren autenticación)
router.post('/modificar/aceptar', AuthService.verifyToken, MarcacionesController.aceptarModificacionMarcacion);
router.post('/modificar/rechazar', AuthService.verifyToken, MarcacionesController.rechazarModificacionMarcacion);

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
router.delete('/userEmpresa/eliminar-duplicada/:id', AuthService.verifyToken, MarcacionesController.eliminarMarcacionDuplicada);

// Ruta para obtener horas semanales de un trabajador
router.get('/horas-semanales/:usuario_empresa_id', AuthService.verifyToken, MarcacionesController.obtenerHorasSemanales);

// Esta ruta debe estar al final para evitar conflictos con otras rutas
router.get('/:id', AuthService.verifyToken, MarcacionesController.obtenerMarcacionPorUserId);


export default router;
