import { ref, computed } from 'vue'
import { useDataStore } from '../../store/dataStorage.js'
import ReporteService from '../../services/reporteService.js'

export function useReportes() {
  const dataStore = useDataStore()
  
  // State
  const isLoading = ref(false)
  const error = ref('')

  // Getters
  const empresaSeleccionada = computed(() => dataStore.getEmpresaSeleccionada)
  const hasEmpresaSeleccionada = computed(() => dataStore.hasEmpresaSeleccionada)

  // Método genérico para obtener reportes
  const obtenerReporte = async (tipoReporte, filtros = {}) => {
    if (!hasEmpresaSeleccionada.value) {
      return {
        success: false,
        error: 'Debe seleccionar una empresa primero'
      }
    }

    isLoading.value = true
    error.value = ''

    try {
      let response
      switch (tipoReporte) {
        case 'asistencia':
          response = await ReporteService.obtenerReporteAsistencia(filtros)
          break
        case 'jornada-diaria':
          response = await ReporteService.obtenerReporteJornadaDiaria(filtros)
          break
        case 'domingos-festivos':
          response = await ReporteService.obtenerReporteDomingosFestivos(filtros)
          break
        case 'modificaciones-turnos':
          response = await ReporteService.obtenerReporteModificacionesTurnos(filtros)
          break
        case 'marcaciones-diarias':
          response = await ReporteService.obtenerReporteMarcacionesDiarias(filtros)
          break
        case 'incidentes-tecnicos':
          response = await ReporteService.obtenerReporteIncidentesTecnicos(filtros)
          break
        default:
          throw new Error('Tipo de reporte no válido')
      }

      if (!response.success) {
        error.value = response.error
      }

      return response
    } catch (e) {
      error.value = 'Error de conexión. Por favor, intenta de nuevo.'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  // Métodos específicos para cada reporte
  const obtenerReporteAsistencia = (filtros = {}) => obtenerReporte('asistencia', filtros)
  const obtenerReporteJornadaDiaria = (filtros = {}) => obtenerReporte('jornada-diaria', filtros)
  const obtenerReporteDomingosFestivos = (filtros = {}) => obtenerReporte('domingos-festivos', filtros)
  const obtenerReporteModificacionesTurnos = (filtros = {}) => obtenerReporte('modificaciones-turnos', filtros)
  const obtenerReporteMarcacionesDiarias = (filtros = {}) => obtenerReporte('marcaciones-diarias', filtros)
  const obtenerReporteIncidentesTecnicos = (filtros = {}) => obtenerReporte('incidentes-tecnicos', filtros)

  // Método para exportar reportes
  const exportarReporte = async (tipoReporte, formato = 'pdf', filtros = {}) => {
    if (!hasEmpresaSeleccionada.value) {
      return {
        success: false,
        error: 'Debe seleccionar una empresa primero'
      }
    }

    isLoading.value = true
    error.value = ''

    try {
      const response = await ReporteService.exportarReporte(tipoReporte, formato, filtros)
      
      if (response.success) {
        // Crear un blob y descargar el archivo
        const blob = new Blob([response.data], { 
          type: formato === 'pdf' ? 'application/pdf' : 
                formato === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = response.filename || `reporte_${tipoReporte}.${formato}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        error.value = response.error
      }

      return response
    } catch (e) {
      error.value = 'Error al exportar reporte. Por favor, intenta de nuevo.'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  // Utilidades
  const limpiarError = () => {
    error.value = ''
  }

  return {
    // Estado
    isLoading,
    error,
    empresaSeleccionada,
    hasEmpresaSeleccionada,
    
    // Métodos de reportes
    obtenerReporteAsistencia,
    obtenerReporteJornadaDiaria,
    obtenerReporteDomingosFestivos,
    obtenerReporteModificacionesTurnos,
    obtenerReporteMarcacionesDiarias,
    obtenerReporteIncidentesTecnicos,
    
    // Método de exportación
    exportarReporte,
    
    // Utilidades
    limpiarError
  }
}
