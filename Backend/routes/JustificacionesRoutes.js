import express from 'express';
import JustificacionesController from '../controllers/JustificacionesController.js';
import FileUploadService from '../services/FileUploadService.js';
import AuthService from '../middleware/AuthMiddleWare.js';

const router = express.Router();

// Crear instancia de multer para justificaciones
const uploadJustificaciones = FileUploadService.createUpload('justificaciones');

// Rutas protegidas - requieren autenticación
router.use(AuthService.verifyToken);

/**
 * @route POST /api/justificaciones
 * @desc Crear una nueva justificación
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
 * @query {number} anio - Filtrar por año
 */
router.get(
    '/',
    JustificacionesController.obtenerJustificaciones
);

/**
 * @route GET /api/justificaciones/estadisticas
 * @desc Obtener estadísticas de justificaciones
 * @access Usuario autenticado
 * @query {number} mes - Mes (1-12)
 * @query {number} anio - Año
 */
router.get(
    '/estadisticas',
    JustificacionesController.obtenerEstadisticas
);

/**
 * @route GET /api/justificaciones/pendientes
 * @desc Obtener justificaciones pendientes de aprobación (o todas si se especifica)
 * @access Admin o Fiscalizador
 * @query {number} limit - Límite de resultados (default: 50)
 * @query {string} todas - Si es 'true', obtiene todas las justificaciones, no solo pendientes
 */
router.get(
    '/pendientes',
    JustificacionesController.obtenerJustificacionesPendientes
);

/**
 * @route GET /api/justificaciones/verificar/:fecha
 * @desc Verificar si un día específico está justificado
 * @access Usuario autenticado
 * @param {string} fecha - Fecha a verificar (YYYY-MM-DD)
 */
router.get(
    '/verificar/:fecha',
    JustificacionesController.verificarDiaJustificado
);

/**
 * @route GET /api/justificaciones/dias-justificados
 * @desc Obtener días justificados de un usuario en un rango de fechas
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
 * @desc Obtener una justificación específica
 * @access Usuario autenticado (solo sus justificaciones) o Admin/Fiscalizador
 */
router.get(
    '/:id',
    JustificacionesController.obtenerJustificacionPorId
);

/**
 * @route PATCH /api/justificaciones/:id
 * @desc Actualizar estado de una justificación
 * @access Admin o Fiscalizador
 */
router.patch(
    '/:id',
    JustificacionesController.actualizarEstadoJustificacion
);

/**
 * @route DELETE /api/justificaciones/:id
 * @desc Eliminar una justificación (solo si está pendiente)
 * @access Usuario autenticado (solo sus justificaciones)
 */
router.delete(
    '/:id',
    JustificacionesController.eliminarJustificacion
);

export default router;
