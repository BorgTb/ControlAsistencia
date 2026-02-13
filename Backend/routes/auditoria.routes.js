import express from 'express';
import AuditoriaController from '../controllers/auditoria.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware de logging para debugging
router.use((req, res, next) => {
    console.log(`🛣️ Ruta de auditoría: ${req.method} ${req.path}`);
    console.log('📋 Headers:', req.headers);
    console.log('📦 Body:', req.body);
    next();
});

// Ruta de prueba sin autenticación para debugging (ANTES del middleware de auth)
// POST /api/auditoria/logout-test
router.post('/logout-test', (req, res, next) => {
    console.log('🧪 Endpoint de prueba sin auth llamado');
    req.user = { id: req.body.usuario_id }; // Simular usuario para prueba
    next();
}, AuditoriaController.cerrarSesionUsuario);

// Middleware de autenticación para todas las rutas protegidas
router.use(auth.verifyToken);

// Ruta para obtener todos los registros de auditoría
// GET /api/auditoria/sesiones?limite=50
router.get('/sesiones', AuditoriaController.obtenerRegistrosAuditoria);

// Ruta para obtener registros de auditoría de un usuario específico
// GET /api/auditoria/usuario/:usuario_id?limite=20
router.get('/usuario/:usuario_id', AuditoriaController.obtenerRegistrosPorUsuario);

// Ruta para obtener estadísticas de sesiones
// GET /api/auditoria/estadisticas
router.get('/estadisticas', AuditoriaController.obtenerEstadisticasSesiones);

// Ruta para registrar cierre de sesión manual
// POST /api/auditoria/cerrar-sesion
router.post('/cerrar-sesion', AuditoriaController.registrarCierreSesion);

// Ruta para cerrar sesión del usuario actual
// POST /api/auditoria/logout
router.post('/logout', AuditoriaController.cerrarSesionUsuario);

// Ruta para cerrar sesiones expiradas (mantenimiento)
// POST /api/auditoria/cerrar-expiradas
router.post('/cerrar-expiradas', AuditoriaController.cerrarSesionesExpiradas);

// Ruta para obtener cambios específicos de un usuario
// GET /api/auditoria/cambios/:usuario_id?limite=50
router.get('/cambios/:usuario_id', AuditoriaController.obtenerCambiosUsuario);

// Ruta para registrar un nuevo cambio en el sistema
// POST /api/auditoria/registrar-cambio
router.post('/registrar-cambio', AuditoriaController.registrarCambio);

export default router;