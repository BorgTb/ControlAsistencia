/**
 * Composable para gestión de roles de usuario
 * Proporciona funciones helper para verificar roles en componentes Vue
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth-store.js'

export function useRoles() {
    const authStore = useAuthStore()

    /**
     * Verifica si el usuario tiene un rol específico
     * @param {string} roleSlug - Slug del rol a verificar
     * @returns {boolean}
     */
    const hasRole = (roleSlug) => {
        return authStore.hasRole(roleSlug)
    }

    /**
     * Verifica si el usuario tiene al menos uno de los roles especificados
     * @param {Array<string>} roleSlugs - Array de slugs de roles
     * @returns {boolean}
     */
    const hasAnyRole = (roleSlugs) => {
        return authStore.hasAnyRole(roleSlugs)
    }

    /**
     * Verifica si el usuario tiene todos los roles especificados
     * @param {Array<string>} roleSlugs - Array de slugs de roles
     * @returns {boolean}
     */
    const hasAllRoles = (roleSlugs) => {
        return authStore.hasAllRoles(roleSlugs)
    }

    /**
   * Obtiene todos los roles del usuario
   * @returns {Array<string>}
   */
    const userRoles = computed(() => authStore.userRoles)

    /**
     * Verifica si el usuario tiene múltiples roles
     * @returns {boolean}
     */
    const hasMultipleRoles = computed(() => authStore.hasMultipleRoles)

    /**
     * Getters de roles específicos
     */
    const isAdmin = computed(() => authStore.esAdmin)
    const isEmpleador = computed(() => authStore.esEmpleador)
    const isTrabajador = computed(() => authStore.esTrabajador)
    const isFiscalizador = computed(() => authStore.esFiscalizador)

    return {
        // Funciones de verificación
        hasRole,
        hasAnyRole,
        hasAllRoles,

        // Datos de roles
        userRoles,
        hasMultipleRoles,

        // Getters específicos
        isAdmin,
        isEmpleador,
        isTrabajador,
        isFiscalizador
    }
}
