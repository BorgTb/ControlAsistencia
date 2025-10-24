import { ref } from 'vue';
import justificacionesService from '../services/justificacionesService';

export function useJustificaciones() {
  const isLoading = ref(false);
  const error = ref(null);
  const justificaciones = ref([]);
  const justificacionActual = ref(null);

  /**
   * Crear una nueva justificación
   */
  const crearJustificacion = async (data, archivo = null) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await justificacionesService.crearJustificacion(data, archivo);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Error al crear justificación');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear justificación';
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtener justificaciones con filtros
   */
  const obtenerJustificaciones = async (params = {}) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await justificacionesService.obtenerJustificaciones(params);
      
      if (response.success) {
        justificaciones.value = response.data || [];
        return justificaciones.value;
      } else {
        throw new Error(response.message || 'Error al obtener justificaciones');
      }
    } catch (err) {
      error.value = err.message || 'Error al obtener justificaciones';
      justificaciones.value = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtener justificación por fecha
   */
  const obtenerJustificacionPorFecha = async (fecha) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const justificacion = await justificacionesService.obtenerJustificacionPorFecha(fecha);
      justificacionActual.value = justificacion;
      return justificacion;
    } catch (err) {
      error.value = err.message || 'Error al obtener justificación';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtener justificaciones de un mes
   */
  const obtenerJustificacionesMes = async (mes, anio) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await justificacionesService.obtenerJustificacionesMes(mes, anio);
      
      if (response.success) {
        justificaciones.value = response.data || [];
        return justificaciones.value;
      } else {
        throw new Error(response.message || 'Error al obtener justificaciones');
      }
    } catch (err) {
      error.value = err.message || 'Error al obtener justificaciones del mes';
      justificaciones.value = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Eliminar una justificación
   */
  const eliminarJustificacion = async (id) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await justificacionesService.eliminarJustificacion(id);
      
      if (response.success) {
        // Remover de la lista local
        justificaciones.value = justificaciones.value.filter(j => j.id !== id);
        return { success: true };
      } else {
        throw new Error(response.message || 'Error al eliminar justificación');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar justificación';
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Verificar si una fecha ya tiene justificación
   */
  const tieneJustificacion = async (fecha) => {
    try {
      const justificacion = await obtenerJustificacionPorFecha(fecha);
      return !!justificacion;
    } catch (err) {
      return false;
    }
  };

  /**
   * Obtener estadísticas de justificaciones
   */
  const obtenerEstadisticas = async (mes, anio) => {
    try {
      const response = await justificacionesService.obtenerEstadisticas(mes, anio);
      return response.data || null;
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      return null;
    }
  };

  /**
   * Limpiar errores
   */
  const limpiarError = () => {
    error.value = null;
  };

  /**
   * Resetear estado
   */
  const resetear = () => {
    justificaciones.value = [];
    justificacionActual.value = null;
    error.value = null;
    isLoading.value = false;
  };

  return {
    // Estado
    isLoading,
    error,
    justificaciones,
    justificacionActual,
    
    // Métodos
    crearJustificacion,
    obtenerJustificaciones,
    obtenerJustificacionPorFecha,
    obtenerJustificacionesMes,
    eliminarJustificacion,
    tieneJustificacion,
    obtenerEstadisticas,
    limpiarError,
    resetear
  };
}
