import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Estado - YA NO almacenamos token (está en cookie HTTP-only)
  const user = ref(null)
  const isLoading = ref(false)
  const pendingCompanySelection = ref(null) // Para usuarios multi-empresa

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
    pendingCompanySelection.value = null
  }

  function clearAuth() {
    logout()
  }

  // MULTI-EMPRESA: Métodos para manejar selección de empresa
  function setPendingCompanySelection(data) {
    pendingCompanySelection.value = data
    console.log('🏢 Datos de selección de empresa guardados:', data)
  }

  function getPendingCompanySelection() {
    return pendingCompanySelection.value
  }

  function clearCompanySelection() {
    pendingCompanySelection.value = null
    console.log('🧹 Datos de selección de empresa limpiados')
  }

  // MULTI-EMPRESA: Estado de empresas disponibles para cambio post-login
  const availableCompanies = ref([])

  // MULTI-EMPRESA: Obtener empresas del usuario autenticado
  async function loadUserCompanies() {
    try {
      const AuthService = (await import('@/services/auth-services.js')).default
      const result = await AuthService.getUserCompanies()
      
      if (result.success && result.data.empresas) {
        availableCompanies.value = result.data.empresas
        console.log('🏢 Empresas cargadas en store:', availableCompanies.value.length)
        return availableCompanies.value
      } else {
        console.error('❌ Error al cargar empresas:', result.error)
        availableCompanies.value = []
        return []
      }
    } catch (error) {
      console.error('❌ Error al cargar empresas del usuario:', error)
      availableCompanies.value = []
      return []
    }
  }

  // MULTI-EMPRESA: Cambiar de empresa post-login
  async function switchCompany(empresaId) {
    try {
      const AuthService = (await import('@/services/auth-services.js')).default
      const result = await AuthService.switchCompany(empresaId)
      
      if (result.success && result.data.user) {
        setUser(result.data.user)
        console.log('✅ Empresa cambiada en store')
        return { success: true, user: result.data.user }
      } else {
        console.error('❌ Error al cambiar empresa:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ Error al cambiar de empresa:', error)
      return { success: false, error: error.message }
    }
  }


  return {
    // Estado
    user,
    isLoading,
    availableCompanies,

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
    clearAuth,

    // MULTI-EMPRESA: Métodos de selección de empresa
    setPendingCompanySelection,
    getPendingCompanySelection,
    clearCompanySelection,

    // MULTI-EMPRESA: Métodos de cambio de empresa post-login
    loadUserCompanies,
    switchCompany
  }
}, {
  persist: {
    key: 'auth-storage',
    storage: localStorage,
    paths: ['user', 'pendingCompanySelection'] // Persistir usuario y datos de selección
  }
})
