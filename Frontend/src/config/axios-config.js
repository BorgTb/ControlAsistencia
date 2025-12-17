/**
 * CONFIGURACIÓN DE AXIOS PARA COOKIES HTTP-ONLY
 * 
 * Este archivo configura una instancia de axios que automáticamente
 * envía cookies HTTP-only en lugar de usar Authorization headers.
 * 
 * USO:
 * import { apiClient } from '@/config/axios-config'
 * 
 * const response = await apiClient.get('/endpoint')
 * const response = await apiClient.post('/endpoint', data)
 */

import axios from 'axios'
import { useAuthStore } from '@/stores/authStore.js'

// URL base de la API
const API_BASE_URL = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
})()

// Crear instancia de axios configurada
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true // IMPORTANTE: Enviar cookies automáticamente
})

// Interceptor simplificado - las cookies se envían automáticamente
apiClient.interceptors.request.use(
  (config) => {
    // Las cookies HTTP-only se envían automáticamente
    // Ya NO necesitamos agregar Authorization header
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
// Incluye lógica de auto-refresh cuando el access token expira
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config
    
    // Si recibimos un 401 con requiresRefresh, intentar renovar el token
    if (error.response?.status === 401 && 
        error.response?.data?.requiresRefresh && 
        !originalRequest._retry) {
      
      originalRequest._retry = true
      
      try {
        console.log('🔄 Access token expirado, intentando renovar...')
        
        // Llamar al endpoint de refresh
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        
        if (response.data.success) {
          console.log('✅ Token renovado exitosamente')
          // Reintentar la petición original con el nuevo access token
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        console.error('❌ Error al renovar token:', refreshError)
        // Si falla el refresh, cerrar sesión
        authStore.clearAuth()
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
        return Promise.reject(refreshError)
      }
    }
    
    // Si recibimos un 401 sin requiresRefresh o ya intentamos refresh, cerrar sesión
    if (error.response?.status === 401) {
      authStore.clearAuth()
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
