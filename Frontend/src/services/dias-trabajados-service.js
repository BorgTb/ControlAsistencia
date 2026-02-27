import { apiClient } from '@/config/axios-config.js'


class DiasTrabajadosService {
  /**
   * Obtiene el calendario de días trabajados del usuario autenticado para un mes específico
   * @param {number} mes - Mes (1-12)
   * @param {number} anio - Año
   * @returns {Promise<Object>} - Datos del calendario
   */
  async getCalendarioMensual(mes, anio) {
    try {
      const response = await apiClient.get(`/marcaciones/calendario`, {
        params: { mes, anio }
      })
      console.log('Respuesta del calendario mensual:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al obtener calendario mensual:', error)
      throw error
    }
  }

  /**
   * Obtiene los días trabajados del usuario autenticado para un mes específico
   * @param {number} mes - Mes (0-11, formato JavaScript)
   * @param {number} anio - Año
   * @returns {Promise<Array>} - Array de días trabajados
   */
  async getDiasTrabajados(mes, anio) {
    try {
      // Convertir mes de JavaScript (0-11) a mes normal (1-12)
      const mesBackend = mes + 1
      const response = await this.getCalendarioMensual(mesBackend, anio)
      
      // Retornar solo el array de días
      return response.data?.dias || []
    } catch (error) {
      console.error('Error al obtener días trabajados:', error)
      throw error
    }
  }

  /**
   * Obtiene el resumen de asistencia del mes del usuario autenticado
   * @param {number} mes - Mes (1-12)
   * @param {number} anio - Año
   * @returns {Promise<Object>} - Resumen de asistencia
   */
  async getResumenAsistencia(mes, anio) {
    try {
      const response = await this.getCalendarioMensual(mes, anio)
      return response.data?.estadisticas || {}
    } catch (error) {
      console.error('Error al obtener resumen de asistencia:', error)
      throw error
    }
  }

  /**
   * Obtiene los detalles de un día específico del usuario autenticado
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Object>} - Detalles del día
   */
  async getDetalleDia(fecha) {
    try {
      const [anio, mes] = fecha.split('-').map(Number)
      const response = await this.getCalendarioMensual(mes, anio)
      const dias = response.data?.dias || []
      
      return dias.find(d => d.fecha === fecha) || null
    } catch (error) {
      console.error('Error al obtener detalle del día:', error)
      throw error
    }
  }

  /**
   * Obtiene las estadísticas de asistencia de un periodo del usuario autenticado
   * @param {string} fechaInicio - Fecha inicio en formato YYYY-MM-DD
   * @param {string} fechaFin - Fecha fin en formato YYYY-MM-DD
   * @returns {Promise<Object>} - Estadísticas del periodo
   */
  async getEstadisticasPeriodo(fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get(`/marcaciones/estadisticas`, {
        params: { fechaInicio, fechaFin }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas del periodo:', error)
      throw error
    }
  }

  /**
   * Obtiene las horas extras del usuario autenticado para un mes específico
   * @param {number} mes - Mes (1-12)
   * @param {number} anio - Año
   * @returns {Promise<Object>} - Horas extras del mes
   */
  async getHorasExtrasMes(mes, anio) {
    try {
      const response = await apiClient.get(`/user/horas-extras`, {
        params: { mes, anio }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener horas extras:', error)
      throw error
    }
  }

  /**
   * Exporta asistencia del trabajador autenticado en formato CSV
   * @param {string} fechaInicio - Fecha inicio en formato YYYY-MM-DD
   * @param {string} fechaFin - Fecha fin en formato YYYY-MM-DD
   * @returns {Promise<Blob>} - Archivo CSV
   */
  async exportarAsistenciaTrabajadorCSV(fechaInicio, fechaFin) {
    try {
      const response = await apiClient.post(
        '/telegestorapi/asistencia/export/trabajador/csv',
        { fechaInicio, fechaFin },
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      console.error('Error al exportar asistencia CSV del trabajador:', error)
      throw error
    }
  }

  /**
   * Exporta asistencia del trabajador autenticado en formato Excel
   * @param {string} fechaInicio - Fecha inicio en formato YYYY-MM-DD
   * @param {string} fechaFin - Fecha fin en formato YYYY-MM-DD
   * @returns {Promise<Blob>} - Archivo Excel
   */
  async exportarAsistenciaTrabajadorExcel(fechaInicio, fechaFin) {
    try {
      const response = await apiClient.post(
        '/telegestorapi/asistencia/export/trabajador/excel',
        { fechaInicio, fechaFin },
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      console.error('Error al exportar asistencia Excel del trabajador:', error)
      throw error
    }
  }
}

// Exportar instancia única del servicio
const diasTrabajadosService = new DiasTrabajadosService()
export default diasTrabajadosService

// Exportar también las funciones individuales para compatibilidad
export const getDiasTrabajados = (mes, anio) => 
  diasTrabajadosService.getDiasTrabajados(mes, anio)

export const getResumenAsistencia = (mes, anio) => 
  diasTrabajadosService.getResumenAsistencia(mes + 1, anio)

export const getDetalleDia = (fecha) => 
  diasTrabajadosService.getDetalleDia(fecha)
