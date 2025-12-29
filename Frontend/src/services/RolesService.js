import { apiClient } from '@/config/axios-config.js'

/**
 * Servicio para gestión de roles de usuarios
 */
class RolesService {
    /**
     * Obtener todos los roles disponibles en el sistema
     * @returns {Promise<Object>}
     */
    async getAllRoles() {
        try {
            const response = await apiClient.get('/roles')
            return {
                success: true,
                data: response.data.data
            }
        } catch (error) {
            console.error('Error obteniendo roles:', error)
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener roles'
            }
        }
    }

    /**
     * Obtener roles asignados a un usuario-empresa
     * @param {number} usuarioEmpresaId - ID de la relación usuario-empresa
     * @returns {Promise<Object>}
     */
    async getUserRoles(usuarioEmpresaId) {
        try {
            const response = await apiClient.get(`/users/${usuarioEmpresaId}/roles`)
            return {
                success: true,
                data: response.data.data
            }
        } catch (error) {
            console.error('Error obteniendo roles del usuario:', error)
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener roles del usuario'
            }
        }
    }

    /**
     * Asignar un rol a un usuario
     * @param {number} usuarioEmpresaId - ID de la relación usuario-empresa
     * @param {string} rolSlug - Slug del rol a asignar
     * @returns {Promise<Object>}
     */
    async assignRole(usuarioEmpresaId, rolSlug) {
        try {
            const response = await apiClient.post(`/users/${usuarioEmpresaId}/roles`, {
                rol_slug: rolSlug
            })
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            console.error('Error asignando rol:', error)
            return {
                success: false,
                error: error.response?.data?.message || 'Error al asignar rol'
            }
        }
    }

    /**
     * Revocar un rol de un usuario
     * @param {number} usuarioEmpresaId - ID de la relación usuario-empresa
     * @param {number} rolId - ID del rol a revocar
     * @returns {Promise<Object>}
     */
    async revokeRole(usuarioEmpresaId, rolId) {
        try {
            const response = await apiClient.delete(`/users/${usuarioEmpresaId}/roles/${rolId}`)
            return {
                success: true,
                message: response.data.message
            }
        } catch (error) {
            console.error('Error revocando rol:', error)
            return {
                success: false,
                error: error.response?.data?.message || 'Error al revocar rol'
            }
        }
    }

    /**
     * Reemplazar todos los roles de un usuario
     * @param {number} usuarioEmpresaId - ID de la relación usuario-empresa
     * @param {Array<string>} roles - Array de slugs de roles
     * @returns {Promise<Object>}
     */
    async replaceUserRoles(usuarioEmpresaId, roles) {
        try {
            const response = await apiClient.put(`/users/${usuarioEmpresaId}/roles`, {
                roles: roles
            })
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            }
        } catch (error) {
            console.error('Error reemplazando roles:', error)
            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar roles'
            }
        }
    }

    /**
     * Obtener usuarios por rol en una empresa
     * @param {number} empresaId - ID de la empresa
     * @param {string} rolSlug - Slug del rol
     * @returns {Promise<Object>}
     */
    async getUsersByRole(empresaId, rolSlug) {
        try {
            const response = await apiClient.get(`/empresas/${empresaId}/roles/${rolSlug}/users`)
            return {
                success: true,
                data: response.data.data
            }
        } catch (error) {
            console.error('Error obteniendo usuarios por rol:', error)
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener usuarios'
            }
        }
    }

    /**
     * Obtener estadísticas de roles en una empresa
     * @param {number} empresaId - ID de la empresa
     * @returns {Promise<Object>}
     */
    async getRoleStats(empresaId) {
        try {
            const response = await apiClient.get(`/empresas/${empresaId}/roles/stats`)
            return {
                success: true,
                data: response.data.data
            }
        } catch (error) {
            console.error('Error obteniendo estadísticas de roles:', error)
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener estadísticas'
            }
        }
    }
}

export default new RolesService()
