import { ref, computed } from 'vue'
import ReportesService from '../services/ReportesService.js'

// Estado global de reportes
const reportes = ref([])
const isLoading = ref(false)
const error = ref('')

// Estado del modal
const showReporteModal = ref(false)
const marcacionSeleccionada = ref(null)

// Estadísticas
const estadisticas = ref({
  total: 0,
  pendientes: 0,
  procesados: 0,
  resueltos: 0
})

export function useReportes() {
  
  // Computed properties
  const reportesPendientes = computed(() => {
    return reportes.value.filter(reporte => reporte.estado === 'pendiente')
  })
  
  const reportesProcesados = computed(() => {
    return reportes.value.filter(reporte => reporte.estado === 'procesado')
  })
  
  const reportesResueltos = computed(() => {
    return reportes.value.filter(reporte => reporte.estado === 'resuelto')
  })

  // Métodos principales
  
  /**
   * Abre el modal de reporte para una marcación específica
   * @param {Object} marcacion - Marcación a reportar
   */
  const abrirModalReporte = (marcacion) => {
    marcacionSeleccionada.value = marcacion
    showReporteModal.value = true
  }

  /**
   * Cierra el modal de reporte
   */
  const cerrarModalReporte = () => {
    showReporteModal.value = false
    marcacionSeleccionada.value = null
  }

  /**
   * Envía un reporte de marcación
   * @param {Object} reporteData - Datos del reporte
   * @returns {Promise<boolean>} true si se envió correctamente
   */
  const enviarReporte = async (reporteData) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const result = await ReportesService.enviarReporte(reporteData)
      
      if (result.success) {
        // Agregar el nuevo reporte a la lista local
        if (result.data) {
          reportes.value.unshift({
            ...result.data,
            fecha_creacion: new Date().toISOString(),
            estado: 'pendiente'
          })
        }
        
        // Actualizar estadísticas
        await cargarEstadisticas()
        
        // Cerrar modal
        cerrarModalReporte()
        
        return {
          success: true,
          message: result.message || 'Reporte enviado correctamente'
        }
      } else {
        error.value = result.error || 'Error al enviar reporte'
        return {
          success: false,
          error: error.value
        }
      }
    } catch (err) {
      console.error('Error enviando reporte:', err)
      error.value = 'Error inesperado al enviar reporte'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carga la lista de reportes del usuario
   * @param {Object} filtros - Filtros opcionales
   */
  const cargarReportes = async (filtros = {}) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const result = await ReportesService.obtenerReportes(filtros)
      
      if (result.success) {
        reportes.value = result.data || []
      } else {
        error.value = result.error || 'Error al cargar reportes'
        console.error('Error cargando reportes:', result.error)
      }
    } catch (err) {
      console.error('Error cargando reportes:', err)
      error.value = 'Error inesperado al cargar reportes'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carga las estadísticas de reportes
   */
  const cargarEstadisticas = async () => {
    try {
      const result = await ReportesService.obtenerEstadisticasReportes()
      
      if (result.success) {
        estadisticas.value = result.data
      } else {
        console.error('Error cargando estadísticas:', result.error)
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  /**
   * Obtiene un reporte específico por ID
   * @param {number} reporteId - ID del reporte
   */
  const obtenerReporte = async (reporteId) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const result = await ReportesService.obtenerReporte(reporteId)
      
      if (result.success) {
        return result.data
      } else {
        error.value = result.error || 'Error al obtener reporte'
        return null
      }
    } catch (err) {
      console.error('Error obteniendo reporte:', err)
      error.value = 'Error inesperado al obtener reporte'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualiza un reporte existente
   * @param {number} reporteId - ID del reporte
   * @param {Object} datosActualizacion - Nuevos datos
   */
  const actualizarReporte = async (reporteId, datosActualizacion) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const result = await ReportesService.actualizarReporte(reporteId, datosActualizacion)
      
      if (result.success) {
        // Actualizar en la lista local
        const index = reportes.value.findIndex(r => r.id === reporteId)
        if (index !== -1) {
          reportes.value[index] = { ...reportes.value[index], ...result.data }
        }
        
        return {
          success: true,
          message: result.message || 'Reporte actualizado correctamente'
        }
      } else {
        error.value = result.error || 'Error al actualizar reporte'
        return {
          success: false,
          error: error.value
        }
      }
    } catch (err) {
      console.error('Error actualizando reporte:', err)
      error.value = 'Error inesperado al actualizar reporte'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cancela un reporte pendiente
   * @param {number} reporteId - ID del reporte
   */
  const cancelarReporte = async (reporteId) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const result = await ReportesService.cancelarReporte(reporteId)
      
      if (result.success) {
        // Actualizar estado en la lista local
        const index = reportes.value.findIndex(r => r.id === reporteId)
        if (index !== -1) {
          reportes.value[index].estado = 'cancelado'
        }
        
        // Actualizar estadísticas
        await cargarEstadisticas()
        
        return {
          success: true,
          message: result.message || 'Reporte cancelado correctamente'
        }
      } else {
        error.value = result.error || 'Error al cancelar reporte'
        return {
          success: false,
          error: error.value
        }
      }
    } catch (err) {
      console.error('Error cancelando reporte:', err)
      error.value = 'Error inesperado al cancelar reporte'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
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
    reportes.value = []
    isLoading.value = false
    error.value = ''
    showReporteModal.value = false
    marcacionSeleccionada.value = null
    estadisticas.value = {
      total: 0,
      pendientes: 0,
      procesados: 0,
      resueltos: 0
    }
  }

  // Funciones auxiliares para formateo y utilidades
  
  /**
   * Obtiene el color del badge según el estado del reporte
   * @param {string} estado - Estado del reporte
   */
  const getColorByEstado = (estado) => {
    const colors = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'procesado': 'bg-blue-100 text-blue-800',
      'resuelto': 'bg-green-100 text-green-800',
      'cancelado': 'bg-gray-100 text-gray-800',
      'rechazado': 'bg-red-100 text-red-800'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Obtiene la etiqueta del estado del reporte
   * @param {string} estado - Estado del reporte
   */
  const getEstadoLabel = (estado) => {
    const labels = {
      'pendiente': 'Pendiente',
      'procesado': 'Procesado',
      'resuelto': 'Resuelto',
      'cancelado': 'Cancelado',
      'rechazado': 'Rechazado'
    }
    return labels[estado] || estado
  }

  /**
   * Obtiene el ícono del tipo de problema
   * @param {string} tipoProblema - Tipo de problema
   */
  const getIconoTipoProblema = (tipoProblema) => {
    const iconos = {
      'hora_incorrecta': '⏰',
      'tipo_incorrecto': '🔄',
      'ubicacion_incorrecta': '📍',
      'marcacion_duplicada': '📋',
      'marcacion_faltante': '❌',
      'error_sistema': '⚠️',
      'otro': '❓'
    }
    return iconos[tipoProblema] || '📝'
  }

  // Retornar el API público del composable
  return {
    // Estado reactivo
    reportes: computed(() => reportes.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    showReporteModal: computed(() => showReporteModal.value),
    marcacionSeleccionada: computed(() => marcacionSeleccionada.value),
    estadisticas: computed(() => estadisticas.value),
    
    // Computed properties
    reportesPendientes,
    reportesProcesados,
    reportesResueltos,
    
    // Métodos principales
    abrirModalReporte,
    cerrarModalReporte,
    enviarReporte,
    cargarReportes,
    cargarEstadisticas,
    obtenerReporte,
    actualizarReporte,
    cancelarReporte,
    
    // Utilidades
    limpiarError,
    reiniciarEstado,
    getColorByEstado,
    getEstadoLabel,
    getIconoTipoProblema
  }
}
