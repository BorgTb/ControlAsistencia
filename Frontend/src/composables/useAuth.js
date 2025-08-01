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
    return user.value?.roles?.includes(role) || false
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
    
    // Métodos
    login,
    logout,
    register,
    verifyToken,
    forgotPassword,
    resetPassword,
    
    // Utilidades
    hasRole,
    hasPermission
  }
}
