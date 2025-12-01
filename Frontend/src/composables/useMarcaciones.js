import { ref, computed } from 'vue'
import ReportesService from '@/services/ReportesService.js'

// Estados reactivos
const isLoading = ref(false)
const error = ref('')

// Estado del modal
const showSolicitudModal = ref(false)

export function useMarcaciones() {

  // Métodos principales
  
  /**
   * Abre el modal para solicitar nueva marcación
   */
  const abrirModalAgregarMarcacion = () => {
    showSolicitudModal.value = true
  }

  /**
   * Cierra el modal de solicitud de marcación
   */
  const cerrarModalAgregarMarcacion = () => {
    showSolicitudModal.value = false
  }

  /**
   * Envía una solicitud de marcación
   * @param {Object} solicitudData - Datos de la solicitud de marcación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const solicitarMarcacion = async (solicitudData) => {
    isLoading.value = true
    error.value = ''
    
    solicitudData.tipo = 'agregar';
    // Mostrar los datos que se van a enviar
    console.log('=== DATOS DE LA SOLICITUD DE MARCACIÓN ===')
    console.log('Datos de la solicitud:', solicitudData)
    console.log('=====================================')
    
    try {
      // Enviar solicitud al backend usando ReportesService
      const result = await ReportesService.enviarSolicitudMarcacion(solicitudData)
      
      if (result.success) {
        // Cerrar modal
        cerrarModalAgregarMarcacion()
        
        return {
          success: true,
          message: result.message || 'Solicitud de marcación enviada correctamente',
          data: result.data
        }
      } else {
        error.value = result.error || 'Error al enviar solicitud de marcación'
        return {
          success: false,
          error: error.value
        }
      }
    } catch (err) {
      console.error('Error enviando solicitud de marcación:', err)
      error.value = 'Error inesperado al enviar solicitud'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Valida los datos de la solicitud de marcación antes de enviar
   * @param {Object} solicitudData - Datos a validar
   * @returns {Object} Resultado de la validación
   */
  const validarMarcacion = (solicitudData) => {
    const errores = {}
    
    // Validar campos requeridos
    if (!solicitudData.tipo_marcacion_correcta || solicitudData.tipo_marcacion_correcta.trim() === '') {
      errores.tipo_marcacion_correcta = 'El tipo de marcación es requerido'
    }
    
    if (!solicitudData.fecha || solicitudData.fecha.trim() === '') {
      errores.fecha = 'La fecha es requerida'
    }
    
    if (!solicitudData.hora || solicitudData.hora.trim() === '') {
      errores.hora = 'La hora es requerida'
    }
    
    if (!solicitudData.motivo || solicitudData.motivo.trim() === '') {
      errores.motivo = 'El motivo de la solicitud es requerido'
    }
    
    // Validar que la fecha no sea futura (más de 1 día)
    if (solicitudData.fecha) {
      const fechaSolicitud = new Date(solicitudData.fecha)
      const fechaHoy = new Date()
      const fechaManana = new Date(fechaHoy)
      fechaManana.setDate(fechaHoy.getDate() + 1)
      fechaManana.setHours(23, 59, 59, 999)
      
      if (fechaSolicitud > fechaManana) {
        errores.fecha = 'No se pueden solicitar marcaciones con más de 1 día de anticipación'
      }
      
      // Validar que la fecha no sea muy antigua (más de 30 días)
      const fechaLimite = new Date(fechaHoy)
      fechaLimite.setDate(fechaHoy.getDate() - 30)
      
      if (fechaSolicitud < fechaLimite) {
        errores.fecha = 'No se pueden solicitar marcaciones de hace más de 30 días'
      }
    }
    
    // Validar formato de hora
    if (solicitudData.hora && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(solicitudData.hora)) {
      errores.hora = 'El formato de hora debe ser HH:MM'
    }
    
    // Validar coordenadas GPS si se proporcionan
    if (solicitudData.latitud && (isNaN(solicitudData.latitud) || solicitudData.latitud < -90 || solicitudData.latitud > 90)) {
      errores.latitud = 'La latitud debe estar entre -90 y 90'
    }
    
    if (solicitudData.longitud && (isNaN(solicitudData.longitud) || solicitudData.longitud < -180 || solicitudData.longitud > 180)) {
      errores.longitud = 'La longitud debe estar entre -180 y 180'
    }
    
    // Validar longitud mínima del motivo
    if (solicitudData.motivo && solicitudData.motivo.trim().length < 10) {
      errores.motivo = 'El motivo debe tener al menos 10 caracteres'
    }
    
    return {
      esValido: Object.keys(errores).length === 0,
      errores
    }
  }

  /**
   * Obtiene la ubicación GPS actual del usuario
   * @returns {Promise<Object>} Coordenadas GPS o error
   */
  const obtenerUbicacionGPS = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          success: false,
          error: 'Geolocalización no soportada por el navegador'
        })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy
          })
        },
        (error) => {
          let mensaje = 'Error obteniendo ubicación'
          switch(error.code) {
            case error.PERMISSION_DENIED:
              mensaje = 'Permiso de ubicación denegado'
              break
            case error.POSITION_UNAVAILABLE:
              mensaje = 'Ubicación no disponible'
              break
            case error.TIMEOUT:
              mensaje = 'Tiempo de espera agotado para obtener ubicación'
              break
          }
          resolve({
            success: false,
            error: mensaje
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      )
    })
  }

  /**
   * Limpia el estado de error
   */
  const limpiarError = () => {
    error.value = ''
  }

  /**
   * Reinicia el estado del composable
   */
  const reiniciarEstado = () => {
    isLoading.value = false
    error.value = ''
    showSolicitudModal.value = false
  }

  // Funciones auxiliares para formateo y utilidades
  
  /**
   * Obtiene las opciones disponibles de motivos de solicitud
   */
  const getMotivosSolicitud = () => {
    return [
      { value: 'olvido_marcar', label: 'Olvidé marcar', descripcion: 'No recordé marcar en el momento correcto' },
      { value: 'problema_tecnico', label: 'Problema técnico', descripcion: 'Error en el sistema o aplicación' },
      { value: 'falta_conectividad', label: 'Sin conectividad', descripcion: 'No tenía conexión a internet' },
      { value: 'urgencia_familiar', label: 'Emergencia familiar', descripcion: 'Situación familiar urgente' },
      { value: 'problema_salud', label: 'Problema de salud', descripcion: 'Motivo médico o de salud' },
      { value: 'transporte', label: 'Problema de transporte', descripcion: 'Retraso o problema de movilización' },
      { value: 'otro', label: 'Otro motivo', descripcion: 'Especificar en los comentarios' }
    ]
  }

  // Funciones auxiliares para formateo y utilidades
  
  /**
   * Obtiene las opciones disponibles de tipos de marcación
   */
  const getTiposMarcacion = () => {
    return [
      { value: 'entrada', label: 'Entrada', icon: '🟢' },
      { value: 'salida', label: 'Salida', icon: '🔴' },
      { value: 'colacion', label: 'Colación', icon: '🟠' },
      { value: 'descanso', label: 'Descanso', icon: '🔵' }
    ]
  }

  /**
   * Obtiene el color del badge según el tipo de marcación
   * @param {string} tipo - Tipo de marcación
   */
  const getColorByTipo = (tipo) => {
    const colors = {
      'entrada': 'bg-green-100 text-green-800',
      'salida': 'bg-red-100 text-red-800',
      'colacion': 'bg-orange-100 text-orange-800',
      'descanso': 'bg-blue-100 text-blue-800'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Formatea la fecha actual en formato YYYY-MM-DD
   */
  const getFechaActual = () => {
    return new Date().toISOString().split('T')[0]
  }

  /**
   * Formatea la fecha de ayer en formato YYYY-MM-DD
   */
  const getFechaAyer = () => {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    return ayer.toISOString().split('T')[0]
  }

  /**
   * Obtiene la fecha mínima permitida (30 días atrás)
   */
  const getFechaMinima = () => {
    const fechaMinima = new Date()
    fechaMinima.setDate(fechaMinima.getDate() - 30)
    return fechaMinima.toISOString().split('T')[0]
  }

  /**
   * Obtiene la fecha máxima permitida (mañana)
   */
  const getFechaMaxima = () => {
    const fechaMaxima = new Date()
    fechaMaxima.setDate(fechaMaxima.getDate() + 1)
    return fechaMaxima.toISOString().split('T')[0]
  }

  /**
   * Formatea la hora actual en formato HH:MM
   */
  const getHoraActual = () => {
    const ahora = new Date()
    const horas = ahora.getHours().toString().padStart(2, '0')
    const minutos = ahora.getMinutes().toString().padStart(2, '0')
    return `${horas}:${minutos}`
  }

  /**
   * Obtiene las opciones de estados de solicitud
   */
  const getEstadosSolicitud = () => {
    return [
      { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      { value: 'aprobada', label: 'Aprobada', color: 'bg-green-100 text-green-800', icon: '✅' },
      { value: 'rechazada', label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: '❌' },
      { value: 'en_revision', label: 'En revisión', color: 'bg-blue-100 text-blue-800', icon: '🔍' }
    ]
  }

  // Retornar el API público del composable
  return {
    // Estado reactivo
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    showAgregarModal: computed(() => showSolicitudModal.value),
    
    // Métodos principales
    abrirModalAgregarMarcacion,
    cerrarModalAgregarMarcacion,
    solicitarMarcacion,
    validarMarcacion,
    obtenerUbicacionGPS,
    
    // Utilidades
    limpiarError,
    reiniciarEstado,
    getTiposMarcacion,
    getMotivosSolicitud,
    getColorByTipo,
    getFechaActual,
    getFechaAyer,
    getFechaMinima,
    getFechaMaxima,
    getHoraActual,
    getEstadosSolicitud
  }
}