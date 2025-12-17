import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Detecta si el usuario tiene el rol 'admin'.
  // Permite proteger rutas y vistas exclusivas para administradores.
  const esAdmin = computed(() => user.value?.rol === 'admin' || user.value?.rol?.includes('admin'))
  // Estado - YA NO almacenamos token (está en cookie HTTP-only)
  const user = ref(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value) // Autenticado si hay usuario
  const getUser = computed(() => user.value)
  const esEmpleador = computed(() => user.value?.rol?.includes('empleador'))
  const esEst = computed(() => user.value?.est === true)

  // Actions
  function setUser(userData) {
    user.value = userData
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
    esEmpleador,
    esEst,
    esAdmin, // Indica si el usuario es administrador
    // Getters
    isAuthenticated,
    getUser,
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
