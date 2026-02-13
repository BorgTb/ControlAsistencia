import { apiClient } from '@/config/axios-config.js';

/**
 * Servicio para manejar solicitudes (modificación de marcaciones e invitaciones de empresa)
 */
class SolicitudesService {
  // ===========================
  // SOLICITUDES DE MODIFICACIÓN DE MARCACIONES (existentes)
  // ===========================
  
  /**
   * Obtener detalles de una solicitud de modificación mediante token
   * @param {string} token - Token de la solicitud
   * @returns {Promise} Datos de la solicitud
   */
  async obtenerSolicitudPorToken(token) {
    try {
      const response = await apiClient.get('/marcaciones/solicitud-modificar', {
        params: { token }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener solicitud:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar la solicitud');
    }
  }

  /**
   * Aceptar una solicitud de modificación
   * @param {string} token - Token de la solicitud
   * @returns {Promise} Respuesta de la aceptación
   */
  async aceptarSolicitud(token) {
    try {
      const response = await apiClient.post('/marcaciones/modificar/aceptar', {
        token
      });
      return response.data;
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
      throw new Error(error.response?.data?.message || 'Error al aceptar la solicitud');
    }
  }

  /**
   * Rechazar una solicitud de modificación
   * @param {string} token - Token de la solicitud
   * @param {string} motivo - Motivo del rechazo
   * @returns {Promise} Respuesta del rechazo
   */
  async rechazarSolicitud(token) {
    try {
      const response = await apiClient.post('/marcaciones/modificar/rechazar', {
        token
      });
      return response.data;
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      throw new Error(error.response?.data?.message || 'Error al rechazar la solicitud');
    }
  }

  // ===========================
  // SOLICITUDES DE INVITACIÓN A EMPRESA (nuevas)
  // ===========================
  
  /**
   * Obtener información de invitación por token (público pero envía cookies)
   * @param {string} token - Token de la invitación
   * @returns {Promise} Datos de la invitación
   */
  async obtenerInvitacionPorToken(token) {
    try {
      const response = await apiClient.get(`/solicitudes/invitacion/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener invitación:', error);
      throw error;
    }
  }

  /**
   * Aceptar invitación de empresa (requiere autenticación)
   * @param {string} token - Token de la invitación
   * @returns {Promise} Respuesta de la aceptación
   */
  async aceptarInvitacionEmpresa(token) {
    try {
      const response = await apiClient.post(`/solicitudes/invitacion/${token}/aceptar`);
      return response.data;
    } catch (error) {
      console.error('Error al aceptar invitación:', error);
      throw error;
    }
  }

  /**
   * Rechazar invitación de empresa (requiere autenticación)
   * @param {string} token - Token de la invitación
   * @param {string} motivo - Motivo del rechazo (opcional)
   * @returns {Promise} Respuesta del rechazo
   */
  async rechazarInvitacionEmpresa(token, motivo = '') {
    try {
      const response = await apiClient.post(`/solicitudes/invitacion/${token}/rechazar`, {
        motivo
      });
      return response.data;
    } catch (error) {
      console.error('Error al rechazar invitación:', error);
      throw error;
    }
  }

  /**
   * Obtener solicitudes pendientes del usuario autenticado
   * @returns {Promise} Lista de solicitudes pendientes
   */
  async obtenerSolicitudesPendientes() {
    try {
      const response = await apiClient.get('/solicitudes/pendientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      throw error;
    }
  }
}

export default new SolicitudesService();
