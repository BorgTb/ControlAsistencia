import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Servicio para manejar solicitudes de modificación de marcaciones
 */
class SolicitudesService {
  /**
   * Obtener detalles de una solicitud mediante token
   * @param {string} token - Token de la solicitud
   * @returns {Promise} Datos de la solicitud
   */
  async obtenerSolicitudPorToken(token) {
    try {
      const response = await axios.get(`${API_URL}/solicitudes/modificacion`, {
        params: { token }
      });
      return response.data;
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
      const response = await axios.post(`${API_URL}/solicitudes/modificacion/aceptar`, {
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
  async rechazarSolicitud(token, motivo) {
    try {
      const response = await axios.post(`${API_URL}/solicitudes/modificacion/rechazar`, {
        token,
        motivo
      });
      return response.data;
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      throw new Error(error.response?.data?.message || 'Error al rechazar la solicitud');
    }
  }
}

export default new SolicitudesService();
