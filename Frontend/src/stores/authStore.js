import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Estado - YA NO almacenamos token (está en cookie HTTP-only)
  const user = ref(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value) // Autenticado si hay usuario
  const getUser = computed(() => user.value)

  // MULTI-ROL: Obtener array de roles del usuario
  const userRoles = computed(() => {
    if (!user.value) return []
    // Siempre retorna el array de roles
    return user.value.roles || []
  })

  // MULTI-ROL: Verificar si el usuario tiene un rol específico
  const hasRole = (roleSlug) => {
    return userRoles.value.includes(roleSlug)
  }

  // MULTI-ROL: Verificar si tiene al menos uno de los roles
  const hasAnyRole = (roleSlugs) => {
    return roleSlugs.some(role => userRoles.value.includes(role))
  }

  // MULTI-ROL: Verificar si tiene todos los roles especificados
  const hasAllRoles = (roleSlugs) => {
    return roleSlugs.every(role => userRoles.value.includes(role))
  }

  // Detecta si el usuario tiene el rol 'admin'
  const esAdmin = computed(() => hasRole('admin'))

  // Detecta si el usuario tiene el rol 'empleador'
  const esEmpleador = computed(() => hasRole('empleador'))

  // Detecta si el usuario tiene el rol 'trabajador'
  const esTrabajador = computed(() => hasRole('trabajador'))

  // Detecta si el usuario tiene el rol 'fiscalizador'
  const esFiscalizador = computed(() => hasRole('fiscalizador'))

  // Detecta si la empresa es EST
  const esEst = computed(() => user.value?.est === true)

  // MULTI-ROL: Detecta si el usuario tiene múltiples roles
  const hasMultipleRoles = computed(() => userRoles.value.length > 1)

  // Actions
  function setUser(userData) {
    user.value = userData
    console.log('👤 Usuario establecido en store:', {
      nombre: userData?.nombre,
      roles: userData?.roles
    })
  }

  function setLoading(loading) {
    isLoading.value = loading
  }

  function logout() {
    user.value = null
  }

  function clearAuth() {
    logout()
  }

  return {
    // Estado
    user,
    isLoading,

    // Getters de roles
    userRoles,
    hasMultipleRoles,
    esAdmin,
    esEmpleador,
    esTrabajador,
    esFiscalizador,
    esEst,

    // Getters generales
    isAuthenticated,
    getUser,

    // Funciones de verificación de roles
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Actions
    setUser,
    setLoading,
    logout,
    clearAuth
  }
}, {
  persist: {
    key: 'auth-storage',
    storage: localStorage,
    paths: ['user'] // Solo persistir usuario, NO token (está en cookie HTTP-only)
  }
})
