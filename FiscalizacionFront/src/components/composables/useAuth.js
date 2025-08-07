import { computed } from 'vue'
import { useAuthStore } from '../../store/authStore.js'
import AuthService from '../../services/authService.js'

export function useAuth() {
  const authStore = useAuthStore()

  // Estado computado
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.getUser)
  const token = computed(() => authStore.getToken)
  const isLoading = computed(() => authStore.isLoading)

  // Métodos de autenticación específicos para tu flujo
  const solicitarAcceso = async (email) => {
    authStore.setLoading(true)
    try {
      const result = await AuthService.solicitarAcceso(email)
      return result
    } finally {
      authStore.setLoading(false)
    }
  }

  const validarCodigo = async (email, codigo) => {
    authStore.setLoading(true)
    try {
      const result = await AuthService.validarCodigo(email, codigo)
      return result
    } finally {
      authStore.setLoading(false)
    }
  }

  const logout = async () => {
    authStore.setLoading(true)
    try {
      const result = await AuthService.cerrarSesion()
      return result
    } finally {
      authStore.setLoading(false)
    }
  }

  // Método combinado para el flujo completo de login
  const loginConCodigo = async (email, codigo) => {
    return await validarCodigo(email, codigo)
  }

  // Utilidades
  const hasRole = (role) => {
    return user.value?.roles?.includes(role) || false
  }

  const hasPermission = (permission) => {
    return user.value?.permissions?.includes(permission) || false
  }

  const clearAuth = () => {
    authStore.clearAuth()
  }

  return {
    // Estado
    isAuthenticated,
    user,
    token,
    isLoading,
    
    // Métodos específicos de tu flujo de autenticación
    solicitarAcceso,
    validarCodigo,
    loginConCodigo,
    logout,
    
    // Utilidades
    hasRole,
    hasPermission,
    clearAuth
  }
}