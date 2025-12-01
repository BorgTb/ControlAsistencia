import { ref, computed } from 'vue'
import ReportesService from '@/services/ReportesService.js'

// Estados reactivos
const isLoading = ref(false)
const error = ref('')

// Estado del modal
const showReporteModal = ref(false)
const marcacionSeleccionada = ref(null)

export function useReportes() {

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
    
    reporteData.tipo = 'modificar';

    // Mostrar los datos que se van a enviar
    console.log('=== DATOS DEL REPORTE A ENVIAR ===')
    console.log('Marcación seleccionada:', marcacionSeleccionada.value)
    console.log('Datos del reporte:', reporteData)
    console.log('=====================================')
    
    try {
      const result = await ReportesService.enviarReporte(reporteData)
      
      if (result.success) {
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
    showReporteModal.value = false
    marcacionSeleccionada.value = null
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
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    showReporteModal: computed(() => showReporteModal.value),
    marcacionSeleccionada: computed(() => marcacionSeleccionada.value),
    
    // Métodos principales
    abrirModalReporte,
    cerrarModalReporte,
    enviarReporte,
    
    // Utilidades
    limpiarError,
    reiniciarEstado,
    getColorByEstado,
    getEstadoLabel,
    getIconoTipoProblema
  }
}
