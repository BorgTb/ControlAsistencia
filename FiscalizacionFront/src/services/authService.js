import axios from 'axios'
import { useAuthStore } from '../store/authStore.js'

const API_BASE_URL = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
})()

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

class AuthService {
  /**
   * Solicita un código temporal de acceso
   * @param {string} email - Correo electrónico del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async solicitarAcceso(email) {
    try {
      const response = await apiClient.post('/auth/solicitar-acceso', { email })
      return {
        success: true,
        message: 'Código temporal enviado correctamente',
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al solicitar acceso',
        status: error.response?.status
      }
    }
  }

  /**
   * Valida el código temporal y obtiene el token
   * @param {string} email - Correo electrónico del usuario
   * @param {string} codigo - Código temporal recibido
   * @returns {Promise<Object>} Respuesta con el token
   */
  async validarCodigo(email, codigo) {
    try {
      const response = await apiClient.post('/auth/validar-codigo', { 
        email, 
        codigo 
      })

      if (response.data.token) {
        const authStore = useAuthStore()
        authStore.setUser(response.data.user)
        authStore.setToken(response.data.token)
      }

      return {
        success: true,
        data: response.data,
        message: 'Código validado correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Código inválido',
        status: error.response?.status
      }
    }
  }

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<Object>} Resultado del cierre de sesión
   */
  async cerrarSesion() {
    try {
      const authStore = useAuthStore()
      const token = authStore.getToken

      if (token) {
        await apiClient.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      authStore.clearAuth()
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cerrar sesión',
        status: error.response?.status
      }
    }
  }
}

export default new AuthService()
