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
  timeout: 30000 // 30 segundos para permitir uploads de archivos
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
    
    // Si recibimos un 401, limpiamos la autenticación
    if (error.response?.status === 401) {
      authStore.clearAuth()
    }
    
    return Promise.reject(error)
  }
)

class ReportesService {
  /**
   * Envía un reporte de marcación
   * @param {Object} reporteData - Datos del reporte
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async enviarReporte(reporteData) {
    try {
      // Si hay archivos, usar FormData para multipart
      if (reporteData.archivos && reporteData.archivos.length > 0) {
        const formData = new FormData()
        
        // Agregar datos del reporte
        formData.append('marcacion_id', reporteData.marcacion_id)
        formData.append('tipo_problema', reporteData.tipo_problema)
        formData.append('descripcion', reporteData.descripcion)
        
        if (reporteData.fecha_correcta) {
          formData.append('fecha_correcta', reporteData.fecha_correcta)
        }
        
        if (reporteData.hora_correcta) {
          formData.append('hora_correcta', reporteData.hora_correcta)
        }
        
        // Agregar archivos
        reporteData.archivos.forEach((archivo, index) => {
          formData.append(`archivo_${index}`, archivo)
        })
        
        // Cambiar el content-type para multipart
        const response = await apiClient.post('/user/reportes/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Reporte enviado correctamente'
        }
      } else {
        // Sin archivos, usar JSON normal
        const response = await apiClient.post('/user/reportes/', {
          marcacion_id: reporteData.marcacion_id,
          tipo_problema: reporteData.tipo_problema,
          descripcion: reporteData.descripcion,
          fecha_correcta: reporteData.fecha_correcta || null,
          hora_correcta: reporteData.hora_correcta || null
        })
        
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Reporte enviado correctamente'
        }
      }
    } catch (error) {
      console.error('Error enviando reporte:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al enviar reporte',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene los reportes del usuario actual
   * @param {Object} filtros - Filtros opcionales
   * @returns {Promise<Object>} Lista de reportes
   */
  async obtenerReportes(filtros = {}) {
    try {
      const params = {}
      
      if (filtros.fechaDesde) {
        params.fecha_desde = filtros.fechaDesde
      }
      
      if (filtros.fechaHasta) {
        params.fecha_hasta = filtros.fechaHasta
      }
      
      if (filtros.estado) {
        params.estado = filtros.estado
      }
      
      if (filtros.tipo_problema) {
        params.tipo_problema = filtros.tipo_problema
      }
      
      // TODO: Cambiar este endpoint según la estructura de tu API
      // Actualmente apunta a /user/reportes/ - ajusta según sea necesario
      const response = await apiClient.get('/user/reportes/', { params })
      
      return {
        success: true,
        data: response.data.reportes || response.data || [],
        message: response.data.message || 'Reportes obtenidos correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo reportes:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reportes',
        status: error.response?.status,
        data: []
      }
    }
  }

  /**
   * Obtiene un reporte específico por ID
   * @param {number} reporteId - ID del reporte
   * @returns {Promise<Object>} Datos del reporte
   */
  async obtenerReporte(reporteId) {
    try {
      // TODO: Cambiar este endpoint según la estructura de tu API
      // Actualmente apunta a /user/reportes/:id - ajusta según sea necesario
      const response = await apiClient.get(`/user/reportes/${reporteId}`)
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Reporte obtenido correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo reporte:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte',
        status: error.response?.status
      }
    }
  }

  /**
   * Actualiza un reporte existente
   * @param {number} reporteId - ID del reporte
   * @param {Object} datosActualizacion - Nuevos datos del reporte
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async actualizarReporte(reporteId, datosActualizacion) {
    try {
      // TODO: Cambiar este endpoint según la estructura de tu API
      // Actualmente apunta a /user/reportes/:id - ajusta según sea necesario
      const response = await apiClient.put(`/user/reportes/${reporteId}`, datosActualizacion)
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Reporte actualizado correctamente'
      }
    } catch (error) {
      console.error('Error actualizando reporte:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar reporte',
        status: error.response?.status
      }
    }
  }

  /**
   * Cancela un reporte pendiente
   * @param {number} reporteId - ID del reporte
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async cancelarReporte(reporteId) {
    try {
      // TODO: Cambiar este endpoint según la estructura de tu API
      // Actualmente apunta a /user/reportes/:id/cancelar - ajusta según sea necesario
      const response = await apiClient.post(`/user/reportes/${reporteId}/cancelar`)
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Reporte cancelado correctamente'
      }
    } catch (error) {
      console.error('Error cancelando reporte:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar reporte',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene estadísticas de reportes del usuario
   * @returns {Promise<Object>} Estadísticas de reportes
   */
  async obtenerEstadisticasReportes() {
    try {
      // TODO: Cambiar este endpoint según la estructura de tu API
      // Actualmente apunta a /user/reportes/estadisticas - ajusta según sea necesario
      const response = await apiClient.get('/user/reportes/estadisticas')
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Estadísticas obtenidas correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de reportes:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas',
        status: error.response?.status,
        data: {
          total: 0,
          pendientes: 0,
          procesados: 0,
          resueltos: 0
        }
      }
    }
  }
}

// Exportar una instancia del servicio
export default new ReportesService()
