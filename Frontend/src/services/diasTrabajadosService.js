import axios from 'axios'
import { useAuthStore } from '../stores/authStore.js'

// Configuración de la URL base de la API
const API_BASE_URL = (() => {
  // Verificar si estamos en un entorno Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }
  // Fallback para otros entornos
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
})()

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.getToken
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    
    // Detectar errores de red
    if (!navigator.onLine || error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      error.isNetworkError = true
    }
    
    // Si recibimos un 401, limpiamos la autenticación
    if (error.response?.status === 401) {
      authStore.clearAuth()
    }
    
    return Promise.reject(error)
  }
)

class DiasTrabajadosService {
  /**
   * Obtiene el calendario de días trabajados de un usuario para un mes específico
   * @param {number} userId - ID del usuario
   * @param {number} mes - Mes (1-12)
   * @param {number} anio - Año
   * @returns {Promise<Object>} - Datos del calendario
   */
  async getCalendarioMensual(userId, mes, anio) {
    try {
      const response = await apiClient.get(`/marcaciones/calendario/${userId}`, {
        params: { mes, anio }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener calendario mensual:', error)
      throw error
    }
  }

  /**
   * Obtiene los días trabajados de un usuario para un mes específico
   * @param {number} userId - ID del usuario
   * @param {number} mes - Mes (0-11, formato JavaScript)
   * @param {number} anio - Año
   * @returns {Promise<Array>} - Array de días trabajados
   */
  async getDiasTrabajados(userId, mes, anio) {
    try {
      // Convertir mes de JavaScript (0-11) a mes normal (1-12)
      const mesBackend = mes + 1
      const response = await this.getCalendarioMensual(userId, mesBackend, anio)
      
      // Retornar solo el array de días
      return response.data?.dias || []
    } catch (error) {
      console.error('Error al obtener días trabajados:', error)
      throw error
    }
  }

  /**
   * Obtiene el resumen de asistencia del mes
   * @param {number} userId - ID del usuario
   * @param {number} mes - Mes (1-12)
   * @param {number} anio - Año
   * @returns {Promise<Object>} - Resumen de asistencia
   */
  async getResumenAsistencia(userId, mes, anio) {
    try {
      const response = await this.getCalendarioMensual(userId, mes, anio)
      return response.data?.estadisticas || {}
    } catch (error) {
      console.error('Error al obtener resumen de asistencia:', error)
      throw error
    }
  }

  /**
   * Obtiene los detalles de un día específico
   * @param {number} userId - ID del usuario
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Object>} - Detalles del día
   */
  async getDetalleDia(userId, fecha) {
    try {
      const [anio, mes] = fecha.split('-').map(Number)
      const response = await this.getCalendarioMensual(userId, mes, anio)
      const dias = response.data?.dias || []
      
      return dias.find(d => d.fecha === fecha) || null
    } catch (error) {
      console.error('Error al obtener detalle del día:', error)
      throw error
    }
  }

  /**
   * Obtiene las estadísticas de asistencia de un periodo
   * @param {number} userId - ID del usuario
   * @param {string} fechaInicio - Fecha inicio en formato YYYY-MM-DD
   * @param {string} fechaFin - Fecha fin en formato YYYY-MM-DD
   * @returns {Promise<Object>} - Estadísticas del periodo
   */
  async getEstadisticasPeriodo(userId, fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get(`/marcaciones/estadisticas/${userId}`, {
        params: { fechaInicio, fechaFin }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas del periodo:', error)
      throw error
    }
  }
}

// Exportar instancia única del servicio
const diasTrabajadosService = new DiasTrabajadosService()
export default diasTrabajadosService

// Exportar también las funciones individuales para compatibilidad
export const getDiasTrabajados = (userId, mes, anio) => 
  diasTrabajadosService.getDiasTrabajados(userId, mes, anio)

export const getResumenAsistencia = (userId, mes, anio) => 
  diasTrabajadosService.getResumenAsistencia(userId, mes + 1, anio)

export const getDetalleDia = (userId, fecha) => 
  diasTrabajadosService.getDetalleDia(userId, fecha)
