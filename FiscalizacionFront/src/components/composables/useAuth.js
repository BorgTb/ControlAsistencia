import { computed } from 'vue'
import { useAuthStore } from '../../store/auth-store.js'
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

  // Función para verificar si el token sigue siendo válido
  const verifyToken = async () => {
    if (!token.value) return false
    
    try {
      const result = await AuthService.verificarToken()
      if (!result.success) {
        // Emitir evento de sesión expirada en lugar de clearAuth directo
        window.dispatchEvent(new CustomEvent('session-expired', {
          detail: {
            motivo: 'token_invalido',
            detalles: [
              'Verificación periódica de token falló',
              'El token ya no es válido en el servidor',
              `Verificado a las: ${new Date().toLocaleTimeString()}`
            ]
          }
        }))
        return false
      }
      return true
    } catch (error) {
      console.warn('Error verificando token:', error)
      window.dispatchEvent(new CustomEvent('session-expired', {
        detail: {
          motivo: 'error_servidor',
          detalles: [
            'Error al verificar token con el servidor',
            `Error: ${error.message}`,
            'Verifique su conexión a internet',
            `Hora: ${new Date().toLocaleTimeString()}`
          ]
        }
      }))
      return false
    }
  }

  // Función para manejar actividad del usuario
  const handleUserActivity = () => {
    if (isAuthenticated.value) {
      verifyToken()
    }
  }

  // Escuchar eventos de actividad del usuario (solo en el navegador)
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleUserActivity)
    window.addEventListener('click', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)
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
    verifyToken,
    
    // Utilidades
    hasRole,
    hasPermission,
    clearAuth
  }
}