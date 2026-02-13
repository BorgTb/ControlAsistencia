import express from 'express';
import RolesController from '../controllers/roles.controller.js';
import AuthMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Rutas para gestión de roles del sistema
 * Todas las rutas requieren autenticación
 */

// Obtener todos los roles disponibles
router.get('/roles', AuthMiddleware.verifyToken, RolesController.getAllRoles);

// Obtener roles de un usuario-empresa específico
router.get('/users/:usuarioEmpresaId/roles', AuthMiddleware.verifyToken, RolesController.getUserRoles);

// Asignar un rol a un usuario-empresa
router.post('/users/:usuarioEmpresaId/roles', AuthMiddleware.verifyToken, RolesController.assignRole);

// Reemplazar todos los roles de un usuario-empresa
router.put('/users/:usuarioEmpresaId/roles', AuthMiddleware.verifyToken, RolesController.replaceUserRoles);

// Revocar un rol específico de un usuario-empresa
router.delete('/users/:usuarioEmpresaId/roles/:rolId', AuthMiddleware.verifyToken, RolesController.revokeRole);

// Obtener usuarios por rol en una empresa
router.get('/empresas/:empresaId/roles/:rolSlug/users', AuthMiddleware.verifyToken, RolesController.getUsersByRole);

// Obtener estadísticas de roles en una empresa
router.get('/empresas/:empresaId/roles/stats', AuthMiddleware.verifyToken, RolesController.getRoleStats);

export default router;
