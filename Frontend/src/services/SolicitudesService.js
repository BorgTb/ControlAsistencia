import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear una instancia separada de axios SIN interceptores para peticiones públicas
const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

/**
 * Servicio para manejar solicitudes de modificación de marcaciones
 * IMPORTANTE: Este servicio usa peticiones públicas (sin autenticación JWT)
 */
class SolicitudesService {
  /**
   * Obtener detalles de una solicitud mediante token
   * @param {string} token - Token de la solicitud
   * @returns {Promise} Datos de la solicitud
   */
  async obtenerSolicitudPorToken(token) {
    try {
      const response = await publicApiClient.get('/marcaciones/solicitud-modificar', {
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
      const response = await publicApiClient.post('/marcaciones/modificar/aceptar', {
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
      const response = await publicApiClient.post('/marcaciones/modificar/rechazar', {
        token
      });
      return response.data;
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      throw new Error(error.response?.data?.message || 'Error al rechazar la solicitud');
    }
  }
}

export default new SolicitudesService();
