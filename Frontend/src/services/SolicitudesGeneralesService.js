import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.js'




const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/';

// Crear instancia de axios con interceptores para autenticación
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Aumentado para uploads de archivos
  withCredentials: true // Enviar cookies automáticamente
});

// Interceptor simplificado - las cookies se envían automáticamente
apiClient.interceptors.request.use(
  (config) => {
    // Las cookies se envían automáticamente con withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      //localStorage.removeItem('token');
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicio para manejar todas las solicitudes generales del trabajador
 */
class SolicitudesGeneralesService {
  
  /**
   * Crear una nueva solicitud
   * @param {FormData} formData - Datos de la solicitud incluyendo archivos
   * @returns {Promise} Respuesta de la creación
   */
  async crearSolicitud(formData) {
    try {
      const response = await apiClient.post('/user/solicitudes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      throw new Error(error.response?.data?.message || 'Error al crear la solicitud');
    }
  }

  /**
   * Obtener todas las solicitudes del usuario autenticado
   * @param {Object} filtros - Filtros opcionales (estado, tipo, fechas)
   * @returns {Promise} Lista de solicitudes
   */
  async obtenerSolicitudes(filtros = {}) {
    try {
      const response = await apiClient.get('/user/solicitudes', {
        params: filtros
      });
      console.log('Respuesta de obtenerSolicitudes:', response);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar las solicitudes');
    }
  }

  /**
   * Obtener una solicitud específica por ID
   * @param {number} id - ID de la solicitud
   * @returns {Promise} Datos de la solicitud
   */
  async obtenerSolicitudPorId(id) {
    try {
      const response = await apiClient.get(`/solicitudes/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener solicitud:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar la solicitud');
    }
  }

  /**
   * Cancelar una solicitud pendiente
   * @param {number} id - ID de la solicitud
   * @returns {Promise} Respuesta de la cancelación
   */
  async cancelarSolicitud(id) {
    try {
      const response = await apiClient.patch(`/solicitudes/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error('Error al cancelar solicitud:', error);
      throw new Error(error.response?.data?.message || 'Error al cancelar la solicitud');
    }
  }

  /**
   * Obtener horas extras aprobadas disponibles para compensación
   * @returns {Promise} Lista de horas extras
   */
  async obtenerHorasExtrasDisponibles() {
    try {
      const response = await apiClient.get('/user/horas-extras');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener horas extras:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar horas extras disponibles');
    }
  }

  /**
   * Obtener usuarios de la misma empresa para intercambio de turnos
   * @returns {Promise} Lista de usuarios
   */
  async obtenerUsuariosParaIntercambio() {
    try {
      const response = await apiClient.get('/solicitudes/usuarios-intercambio');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar usuarios para intercambio');
    }
  }

  /**
   * Obtener turnos disponibles para una fecha específica
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise} Lista de turnos disponibles
   */
  async obtenerTurnosDisponibles(fecha) {
    try {
      const response = await apiClient.get('/solicitudes/turnos-disponibles', {
        params: { fecha }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener turnos:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar turnos disponibles');
    }
  }

  /**
   * Validar disponibilidad de días de feriado
   * @param {string} fechaInicio - Fecha de inicio
   * @param {string} fechaFin - Fecha de fin
   * @returns {Promise} Resultado de la validación
   */
  async validarDiasFeriado(fechaInicio, fechaFin) {
    try {
      const response = await apiClient.post('/solicitudes/validar-feriado', {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      });
      return response.data;
    } catch (error) {
      console.error('Error al validar feriado:', error);
      throw new Error(error.response?.data?.message || 'Error al validar días de feriado');
    }
  }

  /**
   * Descargar documento adjunto de una solicitud
   * @param {number} solicitudId - ID de la solicitud
   * @param {number} documentoId - ID del documento
   * @returns {Promise} Blob del archivo
   */
  async descargarDocumento(solicitudId, documentoId) {
    try {
      const response = await apiClient.get(`/solicitudes/${solicitudId}/documento/${documentoId}`, {
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Obtener nombre del archivo del header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'documento';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Crear elemento para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error al descargar documento:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar el documento');
    }
  }

  /**
   * Obtener estadísticas de solicitudes del usuario
   * @param {string} periodo - Período para las estadísticas (mes, trimestre, año)
   * @returns {Promise} Estadísticas
   */
  async obtenerEstadisticas(periodo = 'mes') {
    try {
      const response = await apiClient.get('/solicitudes/estadisticas', {
        params: { periodo }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar estadísticas');
    }
  }

  /**
   * Obtener historial de cambios de una solicitud
   * @param {number} id - ID de la solicitud
   * @returns {Promise} Historial de cambios
   */
  async obtenerHistorialSolicitud(id) {
    try {
      const response = await apiClient.get(`/solicitudes/${id}/historial`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar el historial');
    }
  }

  /**
   * Obtener plantillas de documentos para diferentes tipos de solicitudes
   * @param {string} tipo - Tipo de solicitud
   * @returns {Promise} Plantilla de documento
   */
  async obtenerPlantillaDocumento(tipo) {
    try {
      const response = await apiClient.get(`/solicitudes/plantilla/${tipo}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla_${tipo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error al obtener plantilla:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar la plantilla');
    }
  }
}

export default new SolicitudesGeneralesService();