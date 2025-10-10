import { ref } from 'vue';
import SolicitudesService from '../services/SolicitudesService';

/**
 * Composable para manejar la lógica de solicitudes de modificación de marcaciones
 */
export const useSolicitudes = () => {
  const loading = ref(false);
  const error = ref(null);
  const solicitud = ref(null);
  const procesando = ref(false);
  const procesado = ref(false);
  const mensajeProcesado = ref('');

  /**
   * Cargar una solicitud por token
   * @param {string} token - Token de la solicitud
   */
  const cargarSolicitud = async (token) => {
    if (!token) {
      error.value = 'Token no proporcionado';
      return false;
    }

    loading.value = true;
    error.value = null;
    solicitud.value = null;

    try {
      const data = await SolicitudesService.obtenerSolicitudPorToken(token);
      solicitud.value = data;

      

      // Verificar si ya fue procesada
      if (data.procesada) {
        procesado.value = true;
        mensajeProcesado.value = data.estadoProcesado || 'Esta solicitud ya fue procesada anteriormente.';
      }

      return true;
    } catch (err) {
      error.value = err.message || 'Error al cargar la solicitud. Por favor, verifica el token e intenta nuevamente.';
      console.error('Error en cargarSolicitud:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Aceptar una solicitud
   * @param {string} token - Token de la solicitud
   */
  const aceptarSolicitud = async (token) => {
    if (!token) {
      throw new Error('Token no proporcionado');
    }

    procesando.value = true;
    error.value = null;

    try {
      const resultado = await SolicitudesService.aceptarSolicitud(token);
      
      procesado.value = true;
      mensajeProcesado.value = resultado.message || 'La solicitud ha sido aceptada. Las marcaciones han sido actualizadas correctamente.';
      
      return {
        success: true,
        message: mensajeProcesado.value
      };
    } catch (err) {
      error.value = err.message || 'Error al procesar la solicitud';
      console.error('Error en aceptarSolicitud:', err);
      throw err;
    } finally {
      procesando.value = false;
    }
  };

  /**
   * Rechazar una solicitud
   * @param {string} token - Token de la solicitud
   * @param {string} motivo - Motivo del rechazo
   */
  const rechazarSolicitud = async (token) => {
    if (!token) {
      throw new Error('Token no proporcionado');
    }


    procesando.value = true;
    error.value = null;

    try {
      const resultado = await SolicitudesService.rechazarSolicitud(token);
      
      procesado.value = true;
      mensajeProcesado.value = resultado.message || 'La solicitud ha sido rechazada. El empleado será notificado.';
      
      return {
        success: true,
        message: mensajeProcesado.value
      };
    } catch (err) {
      error.value = err.message || 'Error al procesar la solicitud';
      console.error('Error en rechazarSolicitud:', err);
      throw err;
    } finally {
      procesando.value = false;
    }
  };

  /**
   * Resetear el estado
   */
  const resetear = () => {
    loading.value = false;
    error.value = null;
    solicitud.value = null;
    procesando.value = false;
    procesado.value = false;
    mensajeProcesado.value = '';
  };

  return {
    // Estado
    loading,
    error,
    solicitud,
    procesando,
    procesado,
    mensajeProcesado,

    // Métodos
    cargarSolicitud,
    aceptarSolicitud,
    rechazarSolicitud,
    resetear
  };
};
