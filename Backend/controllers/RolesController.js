import UsuariosRolesAsignadosModel from '../model/UsuariosRolesAsignadosModel.js';
import RolesSistemaModel from '../model/RolesSistemaModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';

/**
 * Controlador para gestión de roles del sistema
 */
class RolesController {
    /**
     * Obtener todos los roles disponibles en el sistema
     * GET /api/roles
     */
    static async getAllRoles(req, res) {
        try {
            const roles = await RolesSistemaModel.findAll();

            res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            console.error('❌ Error al obtener roles:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener roles del sistema',
                error: error.message
            });
        }
    }

    /**
     * Obtener roles asignados a un usuario en una empresa
     * GET /api/users/:usuarioEmpresaId/roles
     */
    static async getUserRoles(req, res) {
        try {
            const { usuarioEmpresaId } = req.params;

            const roles = await UsuariosRolesAsignadosModel.getUserRoles(usuarioEmpresaId);

            res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            console.error('❌ Error al obtener roles del usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener roles del usuario',
                error: error.message
            });
        }
    }

    /**
     * Asignar un rol a un usuario
     * POST /api/users/:usuarioEmpresaId/roles
     * Body: { rol_slug: 'empleador' } o { rol_sistema_id: 2 }
     */
    static async assignRole(req, res) {
        try {
            const { usuarioEmpresaId } = req.params;
            const { rol_slug, rol_sistema_id } = req.body;

            // Validar que se proporcione al menos uno
            if (!rol_slug && !rol_sistema_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe proporcionar rol_slug o rol_sistema_id'
                });
            }

            // Si se proporciona slug, obtener el ID del rol
            let rolId = rol_sistema_id;
            if (rol_slug) {
                const rol = await RolesSistemaModel.findBySlug(rol_slug);
                if (!rol) {
                    return res.status(404).json({
                        success: false,
                        message: `Rol '${rol_slug}' no encontrado`
                    });
                }
                rolId = rol.id;
            }

            // Verificar que el usuario-empresa existe
            const usuarioEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(usuarioEmpresaId);
            if (!usuarioEmpresa) {
                return res.status(404).json({
                    success: false,
                    message: 'Relación usuario-empresa no encontrada'
                });
            }

            // Asignar el rol
            const result = await UsuariosRolesAsignadosModel.assignRole(usuarioEmpresaId, rolId);

            res.status(201).json({
                success: true,
                message: 'Rol asignado exitosamente',
                data: result
            });
        } catch (error) {
            console.error('❌ Error al asignar rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error al asignar rol',
                error: error.message
            });
        }
    }

    /**
     * Revocar un rol de un usuario
     * DELETE /api/users/:usuarioEmpresaId/roles/:rolId
     */
    static async revokeRole(req, res) {
        try {
            const { usuarioEmpresaId, rolId } = req.params;

            const revoked = await UsuariosRolesAsignadosModel.revokeRole(usuarioEmpresaId, rolId);

            if (!revoked) {
                return res.status(404).json({
                    success: false,
                    message: 'Asignación de rol no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Rol revocado exitosamente'
            });
        } catch (error) {
            console.error('❌ Error al revocar rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error al revocar rol',
                error: error.message
            });
        }
    }

    /**
     * Obtener usuarios por rol en una empresa
     * GET /api/empresas/:empresaId/roles/:rolSlug/users
     */
    static async getUsersByRole(req, res) {
        try {
            const { empresaId, rolSlug } = req.params;

            const users = await UsuariosRolesAsignadosModel.getUsersByRole(empresaId, rolSlug);

            res.status(200).json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('❌ Error al obtener usuarios por rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios por rol',
                error: error.message
            });
        }
    }

    /**
     * Reemplazar todos los roles de un usuario
     * PUT /api/users/:usuarioEmpresaId/roles
     * Body: { roles: ['empleador', 'trabajador'] } (array de slugs)
     */
    static async replaceUserRoles(req, res) {
        try {
            const { usuarioEmpresaId } = req.params;
            const { roles } = req.body;

            if (!Array.isArray(roles)) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo roles debe ser un array'
                });
            }

            // Convertir slugs a IDs
            const rolesData = await RolesSistemaModel.findBySlugs(roles);
            const rolIds = rolesData.map(r => r.id);

            if (rolIds.length !== roles.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Algunos roles no fueron encontrados'
                });
            }

            // Reemplazar roles
            const result = await UsuariosRolesAsignadosModel.replaceUserRoles(usuarioEmpresaId, rolIds);

            res.status(200).json({
                success: true,
                message: 'Roles actualizados exitosamente',
                data: result
            });
        } catch (error) {
            console.error('❌ Error al reemplazar roles:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar roles',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de roles en una empresa
     * GET /api/empresas/:empresaId/roles/stats
     */
    static async getRoleStats(req, res) {
        try {
            const { empresaId } = req.params;

            const stats = await UsuariosRolesAsignadosModel.getRoleStatsForCompany(empresaId);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('❌ Error al obtener estadísticas de roles:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }
}

export default RolesController;
