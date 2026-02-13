import { apiClient } from '@/config/axios-config.js'

class JustificacionesService {
  /**
   * Crear una nueva justificación con rango de fechas
   * @param {Object} data - Datos de la justificación (fecha_inicio, fecha_fin, motivo, tipo_justificacion)
   * @param {File} archivo - Archivo adjunto (opcional)
   * @returns {Promise<Object>}
   */
  async crearJustificacion(data, archivo = null) {
    try {
      const formData = new FormData();
      formData.append('fecha_inicio', data.fecha_inicio);
      formData.append('fecha_fin', data.fecha_fin);
      formData.append('motivo', data.motivo || '');
      formData.append('tipo_justificacion', data.tipo_justificacion);
      
      if (archivo) {
        formData.append('archivo', archivo);
      }

      const response = await apiClient.post('/justificaciones', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al crear justificación:', error);
      throw error;
    }
  }

  /**
   * Obtener justificaciones del usuario
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  async obtenerJustificaciones(params = {}) {
    try {
      const response = await apiClient.get('/justificaciones', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener justificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener una justificación por ID
   * @param {number} id - ID de la justificación
   * @returns {Promise<Object>}
   */
  async obtenerJustificacionPorId(id) {
    try {
      const response = await apiClient.get(`/justificaciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener justificación:', error);
      throw error;
    }
  }

  /**
   * Obtener justificaciones de un mes específico
   * @param {number} mes - Mes (1-12)
   * @param {number} anio - Año
   * @returns {Promise<Array>}
   */
  async obtenerJustificacionesMes(mes, anio) {
    try {
      const response = await apiClient.get('/justificaciones', {
        params: { mes, anio }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener justificaciones del mes:', error);
      throw error;
    }
  }

  /**
   * Obtener justificación de una fecha específica
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Object|null>}
   */
  async obtenerJustificacionPorFecha(fecha) {
    try {
      const response = await apiClient.get('/justificaciones', {
        params: { fecha }
      });
      const justificaciones = response.data?.data || [];
      return justificaciones.length > 0 ? justificaciones[0] : null;
    } catch (error) {
      console.error('Error al obtener justificación por fecha:', error);
      throw error;
    }
  }

  /**
   * Eliminar una justificación
   * @param {number} id - ID de la justificación
   * @returns {Promise<Object>}
   */
  async eliminarJustificacion(id) {
    try {
      const response = await apiClient.delete(`/justificaciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar justificación:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de justificaciones
   * @param {number} mes - Mes (1-12)
   * @param {number} anio - Año
   * @returns {Promise<Object>}
   */
  async obtenerEstadisticas(mes, anio) {
    try {
      const response = await apiClient.get('/justificaciones/estadisticas', {
        params: { mes, anio }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener justificaciones pendientes (Admin/Fiscalizador)
   * @param {number} limit - Límite de resultados
   * @param {boolean} todas - Si true, obtiene todas las justificaciones, no solo pendientes
   * @returns {Promise<Array>}
   */
  async obtenerJustificacionesPendientes(limit = 50, todas = false) {
    try {
      const response = await apiClient.get('/justificaciones/pendientes', {
        params: { 
          limit,
          todas: todas.toString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener justificaciones pendientes:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una justificación (Admin/Fiscalizador)
   * @param {number} id - ID de la justificación
   * @param {string} estado - Estado (aprobada/rechazada)
   * @param {string} observaciones - Observaciones (opcional)
   * @returns {Promise<Object>}
   */
  async actualizarEstado(id, estado, observaciones = null) {
    try {
      const response = await apiClient.patch(`/justificaciones/${id}`, {
        estado,
        observaciones
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  }

  /**
   * Obtener días justificados de un usuario en un rango de fechas
   * @param {number} usuario_empresa_id - ID del usuario empresa
   * @param {string} fecha_inicio - Fecha inicio del rango (YYYY-MM-DD)
   * @param {string} fecha_fin - Fecha fin del rango (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async obtenerDiasJustificados(usuario_empresa_id, fecha_inicio, fecha_fin) {
    try {
      const response = await apiClient.get('/justificaciones/dias-justificados', {
        params: {
          usuario_empresa_id,
          fecha_inicio,
          fecha_fin
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener días justificados:', error);
      throw error;
    }
  }
}

const justificacionesService = new JustificacionesService();
export default justificacionesService;
