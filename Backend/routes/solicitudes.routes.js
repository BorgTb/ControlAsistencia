import express from 'express';
import SolicitudesController from '../controllers/solicitudes.controller.js';
import AuthMiddleware from '../middleware/auth.middleware.js';


const router = express.Router();

/**
 * Ruta pública para obtener información de una solicitud por token
 * GET /api/solicitudes/invitacion/:token
 */
router.get('/invitacion/:token', SolicitudesController.obtenerSolicitudPorToken);

/**
 * Rutas protegidas (requieren autenticación)
 */

/**
 * Aceptar una solicitud de agregar empresa
 * POST /api/solicitudes/invitacion/:token/aceptar
 */
router.post(
  '/invitacion/:token/aceptar',
  AuthMiddleware.verifyToken,
  SolicitudesController.aceptarSolicitudEmpresa
);

/**
 * Rechazar una solicitud de agregar empresa
 * POST /api/solicitudes/invitacion/:token/rechazar
 */
router.post(
  '/invitacion/:token/rechazar',
  AuthMiddleware.verifyToken,
  SolicitudesController.rechazarSolicitudEmpresa
);

/**
 * Obtener solicitudes pendientes del usuario autenticado
 * GET /api/solicitudes/pendientes
 */
router.get(
  '/pendientes',
  AuthMiddleware.verifyToken,
  SolicitudesController.obtenerSolicitudesPendientes
);



export default router;