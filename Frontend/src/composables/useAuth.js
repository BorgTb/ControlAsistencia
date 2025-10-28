import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import AuthService from '../services/Authservices.js'

export function useAuth() {
  const authStore = useAuthStore()

  // Estado computado
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.getUser)
  const token = computed(() => authStore.getToken)
  const isLoading = computed(() => authStore.isLoading)
  const esEst = computed(() => authStore.esEst)

  // Métodos de autenticación
  const login = async (credentials) => {
    return await AuthService.login(credentials)
  }

  const logout = async () => {
    return await AuthService.logout()
  }

  const register = async (userData) => {
    return await AuthService.register(userData)
  }

  const verifyToken = async () => {
    return await AuthService.verifyToken()
  }

  const forgotPassword = async (email) => {
    return await AuthService.forgotPassword(email)
  }

  const resetPassword = async (resetData) => {
    return await AuthService.resetPassword(resetData)
  }

  // Utilidades
  const hasRole = (role) => {
     // Support both 'roles' (array) and 'rol' (string or array) fields returned by backend
     const rolesField = user.value?.roles ?? user.value?.rol
     if (!rolesField) return false
     if (Array.isArray(rolesField)) return rolesField.includes(role) || rolesField.includes(role.toLowerCase())
     if (typeof rolesField === 'string') return rolesField === role || rolesField === role.toLowerCase()
     return false
  }



  const hasPermission = (permission) => {
    return user.value?.permissions?.includes(permission) || false
  }

  return {
    // Estado
    isAuthenticated,
    user,
    token,
    isLoading,
    esEst,
    
    // Métodos
    login,
    logout,
    register,
    verifyToken,
    forgotPassword,
    resetPassword,
    
    // Utilidades
    hasRole,
      // convenience
      esAdmin: computed(() => hasRole('admin')),
    hasPermission
  }
}
