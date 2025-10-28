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
          hora_correcta: reporteData.hora_correcta || null,
          tipo: reporteData.tipo || null
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
   * Envía una solicitud de marcación
   * @param {Object} solicitudData - Datos de la solicitud de marcación
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async enviarSolicitudMarcacion(solicitudData) {
    try {
      

      const response = await apiClient.post('/user/reportes/solicitud', {
        tipo: solicitudData.tipo,
        fecha: solicitudData.fecha,
        hora: solicitudData.hora,
        motivo: solicitudData.motivo,
        descripcion: solicitudData.descripcion,
        geo_lat: solicitudData.geo_lat,
        geo_lon: solicitudData.geo_lon,
        estado: solicitudData.estado || 'pendiente',
        fecha_solicitud: solicitudData.fecha_solicitud || new Date().toISOString(),
        tipo: solicitudData.tipo || null,
        tipo_marcacion_correcta: solicitudData.tipo_marcacion_correcta || null
      })
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Solicitud de marcación enviada correctamente'
      }
    } catch (error) {
      console.error('Error enviando solicitud de marcación:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al enviar solicitud de marcación',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene el reporte de domingos y festivos para una empresa
   * @param {number|string} empresaId
   * @param {Object} filtros - Opcional: fechaDesde, fechaHasta, trabajador, tipo
   * @returns {Promise<Object>}
   */
  async obtenerReporteDomingosFestivos(empresaId, filtros = {}) {
    try {
      const params = { ...filtros };
      const response = await apiClient.get(`/fiscalizador/asistencia-domingos/${empresaId}`, { params });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Reporte de domingos y festivos obtenido correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo reporte domingos/festivos:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte de domingos y festivos',
        status: error.response?.status
      }
    }
  }
}

// Exportar una instancia del servicio
export default new ReportesService()
