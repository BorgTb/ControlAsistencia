import axios from 'axios'
import { useDataStore } from '../store/dataStorage.js'
import { useAuthStore } from '../store/authStore.js'
import { useRouter } from 'vue-router'


const router = useRouter()


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
  timeout: 30000
})

// Interceptor para agregar el token y empresa seleccionada
apiClient.interceptors.request.use((config) => {
  // Agregar token de autenticación
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const authData = JSON.parse(token)
      if (authData.token) {
        config.headers.Authorization = `Bearer ${authData.token}`
      }
    } catch (e) {
      console.warn('Error parsing auth token:', e)
    }
  }

  // Agregar empresa seleccionada como parámetro
  const dataStore = useDataStore()
  const empresaSeleccionada = dataStore.getEmpresaSeleccionada
  if (empresaSeleccionada?.id) {
    config.params = { ...config.params, empresaId: empresaSeleccionada.id }
  }

  return config
})

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    const dataStore = useDataStore()

    // Si recibimos un 401 o 403, el token no es válido
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Token expirado o inválido, cerrando sesión...')
      authStore.clearAuth()
      dataStore.clearData()
      
      // Emitir evento personalizado para mostrar modal
      window.dispatchEvent(new CustomEvent('session-expired', {
        detail: {
          motivo: error.response?.status === 401 ? 'token_expirado' : 'acceso_no_autorizado',
          detalles: [
            'Error detectado en servicio de reportes',
            `Status: ${error.response?.status}`,
            `URL: ${error.config?.url || 'No disponible'}`,
            `Hora: ${new Date().toLocaleTimeString()}`
          ]
        }
      }))
    }       

    return Promise.reject(error)
  }
)



class ReporteService {
  /**
   * Obtiene la lista de empresas disponibles
   * @returns {Promise<Object>} Lista de empresas
   */
  async obtenerEmpresas() {
    try {
      const response = await apiClient.get('/empresas')
      console.log("Empresas obtenidas:", response)
      return {
        success: true,
        data: response.data.data,
        message: 'Empresas obtenidas correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener empresas',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene el reporte de asistencia
   * @param {Object} filtros - Filtros para el reporte
   * @returns {Promise<Object>} Reporte de asistencia
   */
  async obtenerReporteAsistencia(filtros = {}) {
    try {
      const response = await apiClient.get('/reportes/asistencia', { params: filtros })
      
      return {
        success: true,
        data: response.data,
        message: 'Reporte de asistencia obtenido correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte de asistencia',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene el reporte de jornada diaria
   * @param {Object} filtros - Filtros para el reporte
   * @returns {Promise<Object>} Reporte de jornada diaria
   */
  async obtenerReporteJornadaDiaria(filtros = {}) {
    try {
      const response = await apiClient.get('/reportes/jornada-diaria', { params: filtros })
      return {
        success: true,
        data: response.data,
        message: 'Reporte de jornada diaria obtenido correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte de jornada diaria',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene el reporte de domingos y festivos
   * @param {Object} filtros - Filtros para el reporte
   * @returns {Promise<Object>} Reporte de domingos y festivos
   */
  async obtenerReporteDomingosFestivos(filtros = {}) {
    try {
      const response = await apiClient.get('/reportes/domingos-festivos', { params: filtros })
      return {
        success: true,
        data: response.data,
        message: 'Reporte de domingos y festivos obtenido correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte de domingos y festivos',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene el reporte de modificaciones de turnos
   * @param {Object} filtros - Filtros para el reporte
   * @returns {Promise<Object>} Reporte de modificaciones de turnos
   */
  async obtenerReporteModificacionesTurnos(filtros = {}) {
    try {
      const response = await apiClient.get('/reportes/modificaciones-turnos', { params: filtros })
      return {
        success: true,
        data: response.data,
        message: 'Reporte de modificaciones de turnos obtenido correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte de modificaciones de turnos',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene el reporte de marcaciones diarias
   * @param {Object} filtros - Filtros para el reporte
   * @returns {Promise<Object>} Reporte de marcaciones diarias
   */
  async obtenerReporteMarcacionesDiarias(filtros = {}) {
    try {
      const response = await apiClient.get('/reportes/marcaciones-diarias', { params: filtros })
      return {
        success: true,
        data: response.data,
        message: 'Reporte de marcaciones diarias obtenido correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte de marcaciones diarias',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene el reporte de incidentes técnicos
   * @param {Object} filtros - Filtros para el reporte
   * @returns {Promise<Object>} Reporte de incidentes técnicos
   */
  async obtenerReporteIncidentesTecnicos(filtros = {}) {
    try {
      const response = await apiClient.get('/reportes/incidentes-tecnicos', { params: filtros })
      return {
        success: true,
        data: response.data,
        message: 'Reporte de incidentes técnicos obtenido correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte de incidentes técnicos',
        status: error.response?.status
      }
    }
  }

  /**
   * Exporta un reporte en el formato especificado
   * @param {string} tipoReporte - Tipo de reporte a exportar
   * @param {string} formato - Formato de exportación (pdf, excel, word)
   * @param {Object} filtros - Filtros para el reporte
   * @returns {Promise<Object>} Archivo exportado
   */
  async exportarReporte(tipoReporte, formato = 'pdf', filtros = {}) {
    try {
      const response = await apiClient.get(`/reportes/${tipoReporte}/exportar`, {
        params: { ...filtros, formato },
        responseType: 'blob'
      })
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `reporte.${formato}`,
        message: 'Reporte exportado correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al exportar reporte',
        status: error.response?.status
      }
    }
  }
}

export default new ReporteService()
