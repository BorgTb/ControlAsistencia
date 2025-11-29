import axios from 'axios'
import { useAuthStore } from '@/stores/authStore.js'


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

class AsistenciaService {
  /**
   * Obtiene la IP pública del cliente
   * @returns {Promise<string>} IP del cliente
   */
  async obtenerIPCliente() {
    try {
      // Intentar obtener IP desde varios servicios
      const servicios = [
        'https://api.ipify.org?format=json',
        'https://httpbin.org/ip',
        'https://ipapi.co/json'
      ]
      
      for (const servicio of servicios) {
        try {
          const response = await fetch(servicio, { timeout: 5000 })
          const data = await response.json()
          
          // Extraer IP según el formato del servicio
          let ip = data.ip || data.origin || data.query
          if (ip) {
            // Limpiar IP si viene con puerto
            ip = ip.split(',')[0].trim() // En caso de múltiples IPs
            return ip
          }
        } catch (error) {
          console.warn(`Error obteniendo IP desde ${servicio}:`, error)
          continue
        }
      }
      
      // Fallback: intentar con WebRTC
      return await this.obtenerIPWebRTC()
    } catch (error) {
      console.warn('No se pudo obtener IP del cliente:', error)
      return null
    }
  }

  /**
   * Obtiene IP local usando WebRTC (fallback)
   * @returns {Promise<string>} IP local
   */
  async obtenerIPWebRTC() {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      
      pc.createDataChannel('')
      pc.createOffer().then(offer => pc.setLocalDescription(offer))
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
          if (ipMatch) {
            pc.close()
            resolve(ipMatch[1])
          }
        }
      }
      
      // Timeout después de 3 segundos
      setTimeout(() => {
        pc.close()
        resolve(null)
      }, 3000)
    })
  }

  /**
   * Registra una entrada del usuario (con soporte offline)
   * @param {Object} ubicacion - Coordenadas de ubicación (opcional)
   * @param {boolean} isOfflineRetry - Si es un reintento offline
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async registrarEntrada(ubicacion = null, isOfflineRetry = false) {
    // Verificar conectividad
    if (!navigator.onLine && !isOfflineRetry) {
      // Importar dinámicamente para evitar dependencias circulares
      const { useOffline } = await import('../composables/useOffline.js')
      const { addPendingAction } = useOffline()
      
      const actionId = addPendingAction({
        type: 'entrada',
        data: { ubicacion },
        userFriendlyName: 'Entrada'
      })
      
      return {
        success: true,
        offline: true,
        actionId,
        message: 'Entrada registrada offline. Se sincronizará cuando tengas conexión.',
        data: {
          tipo: 'entrada',
          fecha: new Date().toISOString(),
          offline: true
        }
      }
    }

    try {
      const payload = {
        tipo: 'entrada'
      }
      
      // Obtener IP del cliente
      try {
        const ip = await this.obtenerIPCliente()
        if (ip) {
          payload.ip_cliente = ip
        }
      } catch (error) {
        console.warn('No se pudo obtener IP:', error)
      }
      
      // Agregar ubicación si está disponible
      if (ubicacion) {
        payload.geo_lat = ubicacion.latitud
        payload.geo_lon = ubicacion.longitud
        payload.precision = ubicacion.precision

        // Si el objeto ubicacion incluye domicilio (desde modal), agregarlo
        if (ubicacion.domicilio) {
          payload.domicilio_prestacion = ubicacion.domicilio
        }
        
        // Información adicional de calidad de ubicación
        if (ubicacion.altitude !== null) {
          payload.altitude = ubicacion.altitude
        }
        if (ubicacion.altitudeAccuracy !== null) {
          payload.altitude_accuracy = ubicacion.altitudeAccuracy
        }
        if (ubicacion.heading !== null) {
          payload.heading = ubicacion.heading
        }
        if (ubicacion.speed !== null) {
          payload.speed = ubicacion.speed
        }
        payload.location_timestamp = ubicacion.timestamp
        payload.location_quality = ubicacion.precision <= 50 ? 'high' : 'low'
      }

      const response = await apiClient.post('/marcaciones/entrada', payload)
      
      return {
        success: true,
        data: response.data,
        message: 'Entrada registrada correctamente'
      }
    } catch (error) {
      console.error('Error registrando entrada:', error)
      
      // Si falla por conectividad y no es un reintento, guardar offline
      if (!isOfflineRetry && (error.isNetworkError || !navigator.onLine)) {
        return this.registrarEntrada(ubicacion, false) // Llamar versión offline
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar entrada',
        status: error.response?.status
      }
    }
  }

  /**
   * Registra una salida del usuario (con soporte offline)
   * @param {Object} ubicacion - Coordenadas de ubicación (opcional)
   * @param {boolean} isOfflineRetry - Si es un reintento offline
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async registrarSalida(ubicacion = null, isOfflineRetry = false) {
    if (!navigator.onLine && !isOfflineRetry) {
      const { useOffline } = await import('../composables/useOffline.js')
      const { addPendingAction } = useOffline()
      
      const actionId = addPendingAction({
        type: 'salida',
        data: { ubicacion },
        userFriendlyName: 'Salida'
      })
      
      return {
        success: true,
        offline: true,
        actionId,
        message: 'Salida registrada offline. Se sincronizará cuando tengas conexión.',
        data: {
          tipo: 'salida',
          fecha: new Date().toISOString(),
          offline: true
        }
      }
    }

    try {
      const payload = {
        tipo: 'salida'
      }
      
      // Obtener IP del cliente
      try {
        const ip = await this.obtenerIPCliente()
        if (ip) {
          payload.ip_cliente = ip
        }
      } catch (error) {
        console.warn('No se pudo obtener IP:', error)
      }
      
      // Agregar ubicación si está disponible
      if (ubicacion) {
        payload.geo_lat = ubicacion.latitud
        payload.geo_lon = ubicacion.longitud
        payload.precision = ubicacion.precision

        if (ubicacion.domicilio) {
          payload.domicilio_prestacion = ubicacion.domicilio
        }
        
        // Información adicional de calidad de ubicación
        if (ubicacion.altitude !== null) {
          payload.altitude = ubicacion.altitude
        }
        if (ubicacion.altitudeAccuracy !== null) {
          payload.altitude_accuracy = ubicacion.altitudeAccuracy
        }
        if (ubicacion.heading !== null) {
          payload.heading = ubicacion.heading
        }
        if (ubicacion.speed !== null) {
          payload.speed = ubicacion.speed
        }
        payload.location_timestamp = ubicacion.timestamp
        payload.location_quality = ubicacion.precision <= 50 ? 'high' : 'low'
      }
      
      const response = await apiClient.post('/marcaciones/salida', payload)
      
      return {
        success: true,
        data: response.data,
        message: 'Salida registrada correctamente'
      }
    } catch (error) {
      console.error('Error registrando salida:', error)
      
      // Si falla por conectividad y no es un reintento, guardar offline
      if (!isOfflineRetry && (error.isNetworkError || !navigator.onLine)) {
        return this.registrarSalida(ubicacion, false) // Llamar versión offline
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar salida',
        status: error.response?.status
      }
    }
  }

  /**
   * Registra una entrada o salida de colación (con soporte offline)
   * @param {Object} ubicacion - Coordenadas de ubicación (opcional)
   * @param {string} tipoColacion - 'colacion' para entrada a colación
   * @param {boolean} isOfflineRetry - Si es un reintento offline
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async registrarColacion(ubicacion = null, tipoColacion = 'colacion', isOfflineRetry = false) {
    if (!navigator.onLine && !isOfflineRetry) {
      const { useOffline } = await import('../composables/useOffline.js')
      const { addPendingAction } = useOffline()
      
      const actionId = addPendingAction({
        type: 'colacion',
        data: { ubicacion, tipoColacion },
        userFriendlyName: 'Colación'
      })
      
      return {
        success: true,
        offline: true,
        actionId,
        message: 'Colación registrada offline. Se sincronizará cuando tengas conexión.',
        data: {
          tipo: 'colacion',
          fecha: new Date().toISOString(),
          offline: true
        }
      }
    }

    try {
      const payload = {
        tipo: tipoColacion
      }
      
      // Obtener IP del cliente
      try {
        const ip = await this.obtenerIPCliente()
        if (ip) {
          payload.ip_cliente = ip
        }
      } catch (error) {
        console.warn('No se pudo obtener IP:', error)
      }
      
      // Agregar ubicación si está disponible
      if (ubicacion) {
        payload.geo_lat = ubicacion.latitud
        payload.geo_lon = ubicacion.longitud
        payload.precision = ubicacion.precision

        if (ubicacion.domicilio) {
          payload.domicilio_prestacion = ubicacion.domicilio
        }
      }
      
      const response = await apiClient.post('/marcaciones/inicio-colacion', payload)
      
      return {
        success: true,
        data: response.data,
        message: `${tipoColacion === 'colacion' ? 'Entrada a' : 'Salida de'} colación registrada`
      }
    } catch (error) {
      console.error('Error registrando colación:', error)
      
      // Si falla por conectividad y no es un reintento, guardar offline
      if (!isOfflineRetry && (error.isNetworkError || !navigator.onLine)) {
        return this.registrarColacion(ubicacion, tipoColacion, false) // Llamar versión offline
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar colación',
        status: error.response?.status
      }
    }
  }

  async registrarTerminoColacion(ubicacion = null, isOfflineRetry = false) {
    if (!navigator.onLine && !isOfflineRetry) {
      const { useOffline } = await import('../composables/useOffline.js')
      const { addPendingAction } = useOffline()
      
      const actionId = addPendingAction({
        type: 'termino_colacion',
        data: { ubicacion },
        userFriendlyName: 'Término Colación'
      })
      
      return {
        success: true,
        offline: true,
        actionId,
        message: 'Término de colación registrado offline. Se sincronizará cuando tengas conexión.',
        data: {
          tipo: 'colacion',
          fecha: new Date().toISOString(),
          offline: true
        }
      }
    }

    try {
        const payload = {
            // Mantener el tipo como colacion
            tipo: 'colacion'
        }

        // Obtener IP del cliente
        try {
            const ip = await this.obtenerIPCliente()
            if (ip) {
                payload.ip_cliente = ip
            }
        } catch (error) {
            console.warn('No se pudo obtener IP:', error)
        }

        // Agregar ubicación si está disponible
        if (ubicacion) {
            payload.geo_lat = ubicacion.latitud
            payload.geo_lon = ubicacion.longitud
            payload.precision = ubicacion.precision

            // Información adicional de calidad de ubicación
      if (ubicacion.altitude !== null) {
                payload.altitude = ubicacion.altitude
            }
            if (ubicacion.altitudeAccuracy !== null) {
                payload.altitude_accuracy = ubicacion.altitudeAccuracy
            }
            if (ubicacion.heading !== null) {
                payload.heading = ubicacion.heading
            }
            if (ubicacion.speed !== null) {
                payload.speed = ubicacion.speed
            }
            payload.location_timestamp = ubicacion.timestamp
            payload.location_quality = ubicacion.precision <= 50 ? 'high' : 'low'

            if (ubicacion.domicilio) {
              payload.domicilio_prestacion = ubicacion.domicilio
            }
        }

        const response = await apiClient.post('/marcaciones/termino-colacion', payload)

        return {
            success: true,
            data: response.data,
            message: 'Término de colación registrado correctamente'
        }
    } catch (error) {
        console.error('Error registrando término de colación:', error)

        // Si falla por conectividad y no es un reintento, guardar offline
        if (!isOfflineRetry && (error.isNetworkError || !navigator.onLine)) {
          return this.registrarTerminoColacion(ubicacion, false) // Llamar versión offline
        }

        return {
            success: false,
            error: error.response?.data?.message || 'Error al registrar término de colación',
            status: error.response?.status
        }
    }
  }


  /**
   * Registra un descanso (con soporte offline)
   * @param {Object} ubicacion - Coordenadas de ubicación (opcional)
   * @param {boolean} isOfflineRetry - Si es un reintento offline
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async registrarDescanso(ubicacion = null, isOfflineRetry = false) {
    if (!navigator.onLine && !isOfflineRetry) {
      const { useOffline } = await import('../composables/useOffline.js')
      const { addPendingAction } = useOffline()
      
      const actionId = addPendingAction({
        type: 'descanso',
        data: { ubicacion },
        userFriendlyName: 'Descanso'
      })
      
      return {
        success: true,
        offline: true,
        actionId,
        message: 'Descanso registrado offline. Se sincronizará cuando tengas conexión.',
        data: {
          tipo: 'descanso',
          fecha: new Date().toISOString(),
          offline: true
        }
      }
    }

    try {
      const payload = {
        tipo: 'descanso'
      }
      
      // Agregar ubicación si está disponible
      if (ubicacion) {
        payload.geo_lat = ubicacion.latitud
        payload.geo_lon = ubicacion.longitud
        payload.precision = ubicacion.precision

        if (ubicacion.domicilio) {
          payload.domicilio_prestacion = ubicacion.domicilio
        }
      }
      
      const response = await apiClient.post('/marcaciones/descanso', payload)
      
      return {
        success: true,
        data: response.data,
        message: 'Descanso registrado correctamente'
      }
    } catch (error) {
      console.error('Error registrando descanso:', error)
      
      // Si falla por conectividad y no es un reintento, guardar offline
      if (!isOfflineRetry && (error.isNetworkError || !navigator.onLine)) {
        return this.registrarDescanso(ubicacion, false) // Llamar versión offline
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar descanso',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene las marcaciones del día actual
   * @returns {Promise<Object>} Marcaciones del día
   */
  async obtenerMarcacionesHoy() {
    try {
      // El servidor determinará la fecha actual basada en su timezone
      const response = await apiClient.get('/marcaciones/hoy')
      return {
        success: true,
        data: response.data.marcaciones || [],
        resumen: response.data.resumen || {},
        message: 'Marcaciones obtenidas correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo marcaciones del día:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener marcaciones',
        status: error.response?.status,
        data: []
      }
    }
  }

  /**
   * Obtiene el estado actual del usuario (dentro/fuera)
   * @returns {Promise<Object>} Estado actual
   */
  async obtenerEstadoActual() {
    try {
      const response = await apiClient.get('/marcaciones/estado-actual')
      
      return {
        success: true,
        data: response.data,
        message: 'Estado obtenido correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo estado actual:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estado actual',
        status: error.response?.status,
        data: { estado: 'fuera' } // Estado por defecto
      }
    }
  }

  /**
   * Obtiene marcaciones por rango de fechas
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Marcaciones del período
   */
  async obtenerMarcacionesPorPeriodo(fechaInicio = null, fechaFin = null) {
    try {
      const authStore = useAuthStore();
      const response = await apiClient.get(`/marcaciones/${authStore.user.id}`, {
        params: {
          fechaInicio,
          fechaFin
        }
      })
      
      return {
        success: true,
        data: response.data.marcaciones || [],
        message: 'Marcaciones obtenidas correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo marcaciones por período:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener marcaciones',
        status: error.response?.status,
        data: []
      }
    }
  }

  /**
   * Obtiene estadísticas de asistencia del usuario
   * @param {string} mes - Mes en formato YYYY-MM (opcional)
   * @returns {Promise<Object>} Estadísticas de asistencia
   */
  async obtenerEstadisticas(mes = null) {
    try {
      const params = mes ? { mes } : {}
      const response = await apiClient.get('/marcaciones/estadisticas', { params })
      
      return {
        success: true,
        data: response.data,
        message: 'Estadísticas obtenidas correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas',
        status: error.response?.status,
        data: {}
      }
    }
  }

  /**
   * Corrige una marcación
   * @param {number} marcacionId - ID de la marcación a corregir
   * @param {Object} datosCorreccion - Nuevos datos de la marcación
   * @returns {Promise<Object>} Respuesta de la corrección
   */
  async corregirMarcacion(marcacionId, datosCorreccion) {
    try {
      const response = await apiClient.put(`/marcaciones/${marcacionId}`, datosCorreccion)
      
      return {
        success: true,
        data: response.data,
        message: 'Marcación corregida correctamente'
      }
    } catch (error) {
      console.error('Error corrigiendo marcación:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al corregir marcación',
        status: error.response?.status
      }
    }
  }

  /**
   * Elimina una marcación
   * @param {number} marcacionId - ID de la marcación a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  async eliminarMarcacion(marcacionId) {
    try {
      const response = await apiClient.delete(`/marcaciones/${marcacionId}`)
      
      return {
        success: true,
        data: response.data,
        message: 'Marcación eliminada correctamente'
      }
    } catch (error) {
      console.error('Error eliminando marcación:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar marcación',
        status: error.response?.status
      }
    }
  }

  /**
   * Genera un reporte de asistencia
   * @param {Object} parametros - Parámetros del reporte
   * @param {string} parametros.fechaInicio - Fecha de inicio
   * @param {string} parametros.fechaFin - Fecha de fin
   * @param {string} parametros.formato - Formato del reporte (pdf, excel, csv)
   * @returns {Promise<Object>} Reporte generado
   */
  async generarReporte(parametros) {
    try {
      const response = await apiClient.post('/marcaciones/reporte', parametros, {
        responseType: parametros.formato === 'pdf' ? 'blob' : 'json'
      })
      
      return {
        success: true,
        data: response.data,
        message: 'Reporte generado correctamente'
      }
    } catch (error) {
      console.error('Error generando reporte:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al generar reporte',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene los comprobantes de una marcación
   * @param {number} marcacionId - ID de la marcación
   * @returns {Promise<Object>} Comprobantes de la marcación
   */
  async obtenerComprobantes(marcacionId) {
    try {
      const response = await apiClient.get(`/comprobantes/marcacion/${marcacionId}`)
      
      return {
        success: true,
        data: response.data.comprobantes || [],
        message: 'Comprobantes obtenidos correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo comprobantes:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener comprobantes',
        status: error.response?.status,
        data: []
      }
    }
  }

  /**
   * Envía un comprobante por email
   * @param {number} comprobanteId - ID del comprobante
   * @returns {Promise<Object>} Respuesta del envío
   */
  async enviarComprobante(comprobanteId) {
    try {
      const response = await apiClient.post(`/comprobantes/${comprobanteId}/enviar`)
      
      return {
        success: true,
        data: response.data,
        message: 'Comprobante enviado correctamente'
      }
    } catch (error) {
      console.error('Error enviando comprobante:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al enviar comprobante',
        status: error.response?.status
      }
    }
  }

  /**
   * Obtiene el horario del usuario para el día actual
   * @returns {Promise<Object>} Horario del usuario
   */
  async obtenerHorarioHoy() {
    try {
      const response = await apiClient.get('/marcaciones/horario-hoy')
      
      return {
        success: true,
        data: response.data.data,
        message: 'Horario obtenido correctamente'
      }
    } catch (error) {
      console.error('Error obteniendo horario:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener horario',
        status: error.response?.status
      }
    }
  }

  
}

// Exportar una instancia del servicio
export default new AsistenciaService()
