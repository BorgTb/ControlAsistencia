import express from 'express';
import JustificacionesController from '../controllers/justificaciones.controller.js';
import FileUploadService from '../services/file-upload.service.js';
import AuthService from '../middleware/auth.middleware.js';

const router = express.Router();

// Crear instancia de multer para justificaciones
const uploadJustificaciones = FileUploadService.createUpload('justificaciones');

// Rutas protegidas - requieren autenticaciÃ³n
router.use(AuthService.verifyToken);

/**
 * @route POST /api/justificaciones
 * @desc Crear una nueva justificaciÃ³n
 * @access Usuario autenticado
 */
router.post(
    '/',
    uploadJustificaciones.single('archivo'),
    JustificacionesController.crearJustificacion
);

/**
 * @route GET /api/justificaciones
 * @desc Obtener justificaciones del usuario
 * @access Usuario autenticado
 * @query {string} fecha - Filtrar por fecha (YYYY-MM-DD)
 * @query {string} estado - Filtrar por estado (pendiente, aprobada, rechazada)
 * @query {number} mes - Filtrar por mes (1-12)
 * @query {number} anio - Filtrar por aÃ±o
 */
router.get(
    '/',
    JustificacionesController.obtenerJustificaciones
);

/**
 * @route GET /api/justificaciones/estadisticas
 * @desc Obtener estadÃ­sticas de justificaciones
 * @access Usuario autenticado
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - AÃ±o
 */
router.get(
    '/estadisticas',
    JustificacionesController.obtenerEstadisticas
);

/**
 * @route GET /api/justificaciones/pendientes
 * @desc Obtener justificaciones pendientes de aprobaciÃ³n (o todas si se especifica)
 * @access Admin o Fiscalizador
 * @query {number} limit - LÃ­mite de resultados (default: 50)
 * @query {string} todas - Si es 'true', obtiene todas las justificaciones, no solo pendientes
 */
router.get(
    '/pendientes',
    JustificacionesController.obtenerJustificacionesPendientes
);

/**
 * @route GET /api/justificaciones/verificar/:fecha
 * @desc Verificar si un dÃ­a especÃ­fico estÃ¡ justificado
 * @access Usuario autenticado
 * @param {string} fecha - Fecha a verificar (YYYY-MM-DD)
 */
router.get(
    '/verificar/:fecha',
    JustificacionesController.verificarDiaJustificado
);

/**
 * @route GET /api/justificaciones/dias-justificados
 * @desc Obtener dÃ­as justificados de un usuario en un rango de fechas
 * @access Usuario autenticado (solo sus datos) o Admin/Fiscalizador
 * @query {number} usuario_empresa_id - ID del usuario empresa
 * @query {string} fecha_inicio - Fecha inicio del rango (YYYY-MM-DD)
 * @query {string} fecha_fin - Fecha fin del rango (YYYY-MM-DD)
 */
router.get(
    '/dias-justificados',
    JustificacionesController.obtenerDiasJustificados
);

/**
 * @route GET /api/justificaciones/:id
 * @desc Obtener una justificaciÃ³n especÃ­fica
 * @access Usuario autenticado (solo sus justificaciones) o Admin/Fiscalizador
 */
router.get(
    '/:id',
    JustificacionesController.obtenerJustificacionPorId
);

/**
 * @route PATCH /api/justificaciones/:id
 * @desc Actualizar estado de una justificaciÃ³n
 * @access Admin o Fiscalizador
 */
router.patch(
    '/:id',
    JustificacionesController.actualizarEstadoJustificacion
);

/**
 * @route DELETE /api/justificaciones/:id
 * @desc Eliminar una justificaciÃ³n (solo si estÃ¡ pendiente)
 * @access Usuario autenticado (solo sus justificaciones)
 */
router.delete(
    '/:id',
    JustificacionesController.eliminarJustificacion
);

export default router;
