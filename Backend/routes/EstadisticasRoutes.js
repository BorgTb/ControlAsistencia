import express from 'express';
import EstadisticasController from '../controllers/EstadisticasController.js';
import auth from '../middleware/AuthMiddleWare.js';

const router = express.Router();

// Middleware de logging para debugging
router.use((req, res, next) => {
    console.log(`📈 Ruta de estadísticas: ${req.method} ${req.path}`);
    console.log('📋 Headers:', req.headers);
    next();
});

// Middleware de autenticación para todas las rutas protegidas
router.use(auth.verifyToken);

// Ruta para obtener estadísticas generales del sistema
// GET /api/estadisticas/general
router.get('/general', EstadisticasController.obtenerEstadisticasGenerales);

export default router;