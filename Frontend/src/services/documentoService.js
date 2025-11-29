import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.js'

// Configuración de la URL base de la API
const API_BASE_URL = (() => {
  // Verificar si estamos en un entorno Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }
  // Fallback para otros entornos
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
})()

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

// Interceptor para agregar el token y el user a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.getToken
    const user = authStore.getUser

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('⚠️ No hay token disponible')
    }

    if (user) {
      config.headers['X-User'] = user
    } else {
      console.warn('⚠️ No hay usuario disponible')
    }
    return config
  },
  (error) => {
    console.error('❌ Error en interceptor request:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    
    // Si recibimos un 401, limpiamos la autenticación
    if (error.response?.status === 401) {
      authStore.clearAuth()
    }
    
    return Promise.reject(error)
  }
)




class DocumentoService {
  /**
   * Descarga un documento desde el servidor
   * @param {string} tipo - Tipo de documento (justificacion, solicitud, amonestacion, etc)
   * @param {string} nombreDocumento - Nombre del archivo a descargar
   * @returns {Promise<Blob>} El archivo en formato Blob
   */
  async descargarDocumento(tipo, nombreDocumento) {
    try {
        console.log('Downloading document:', tipo, nombreDocumento);
      const response = await apiClient.get(
        `/documentos/${tipo}/${nombreDocumento}`,
        {
          responseType: 'blob'
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error al descargar documento:', error);
      throw new Error(
        error.response?.data?.message || 'Error al descargar el documento'
      );
    }
  }

  /**
   * Descarga un documento usando una URL completa
   * Útil para URLs relativas como /uploads/justificaciones/...
   * @param {string} urlDocumento - URL del documento (puede ser relativa o absoluta)
   * @returns {Promise<Blob>} El archivo en formato Blob
   */
  async descargarPorURL(urlDocumento) {
    try {
      const response = await apiClient.get(`/documentos/${urlDocumento}`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error al descargar documento desde URL:', error);
      throw new Error(
        error.response?.data?.message || 'Error al descargar el documento'
      );
    }
  }

  /**
   * Obtiene metadatos del documento (nombre, tamaño, tipo, etc)
   * @param {string} tipo - Tipo de documento
   * @param {string} nombreDocumento - Nombre del archivo
   * @returns {Promise<Object>} Metadatos del documento
   */
  async obtenerMetadatosDocumento(tipo, nombreDocumento) {
    try {
      const response = await apiClient.get(
        `/documentos/metadatos/${tipo}/${nombreDocumento}`
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener metadatos:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener información del documento'
      );
    }
  }

  /**
   * Lista todos los documentos de un tipo específico
   * @param {string} tipo - Tipo de documento
   * @returns {Promise<Array>} Lista de documentos
   */
  async listarDocumentos(tipo) {
    try {
      const response = await apiClient.get(
        `/documentos/lista/${tipo}`
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error al listar documentos:', error);
      throw new Error(
        error.response?.data?.message || 'Error al listar los documentos'
      );
    }
  }

  /**
   * Elimina un documento del servidor
   * @param {string} tipo - Tipo de documento
   * @param {string} nombreDocumento - Nombre del archivo
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async eliminarDocumento(tipo, nombreDocumento) {
    try {
      const response = await apiClient.delete(
        `/documentos/${tipo}/${nombreDocumento}`
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar documento:', error);
      throw new Error(
        error.response?.data?.message || 'Error al eliminar el documento'
      );
    }
  }

  /**
   * Descarga un documento y lo guarda en el dispositivo
   * @param {string} tipo - Tipo de documento
   * @param {string} nombreDocumento - Nombre del archivo
   * @param {string} nombreDescarga - Nombre con el que se guardará (opcional)
   */
  async descargarYGuardar(tipo, nombreDocumento, nombreDescarga = null) {
    try {
      const blob = await this.descargarDocumento(tipo, nombreDocumento);
      this._crearDescargaDeBlob(blob, nombreDescarga || nombreDocumento);
      return true;
    } catch (error) {
      console.error('Error en descarga y guardado:', error);
      throw error;
    }
  }

  /**
   * Descarga desde URL y guarda en el dispositivo
   * @param {string} urlDocumento - URL del documento
   * @param {string} nombreDescarga - Nombre con el que se guardará
   */
  async descargarPorURLYGuardar(urlDocumento, nombreDescarga, tipo) {
    try {
      const blob = await this.descargarDocumento(tipo,urlDocumento);
      this._crearDescargaDeBlob(blob, nombreDescarga);
      return true;
    } catch (error) {
      console.error('Error en descarga desde URL:', error);
      throw error;
    }
  }

  /**
   * Abre un documento en una nueva pestaña (para ver online)
   * @param {string} tipo - Tipo de documento
   * @param {string} nombreDocumento - Nombre del archivo
   */
  async abrirDocumento(tipo, nombreDocumento) {
    try {
      const blob = await this.descargarDocumento(tipo, nombreDocumento);
      const urlBlob = URL.createObjectURL(blob);
      window.open(urlBlob, '_blank');
      
      // Limpiar la URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(urlBlob);
      }, 10000);
      
      return true;
    } catch (error) {
      console.error('Error al abrir documento:', error);
      throw error;
    }
  }

  /**
   * Abre un documento desde una URL en una nueva pestaña
   * @param {string} urlDocumento - URL del documento
   */
  async abrirDocumentoPorURL(urlDocumento) {
    try {
      const blob = await this.descargarPorURL(urlDocumento);
      const urlBlob = URL.createObjectURL(blob);
      window.open(urlBlob, '_blank');
      
      // Limpiar la URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(urlBlob);
      }, 10000);
      
      return true;
    } catch (error) {
      console.error('Error al abrir documento:', error);
      throw error;
    }
  }

  /**
   * Método privado para crear la descarga de un Blob
   * @private
   * @param {Blob} blob - El archivo en formato Blob
   * @param {string} nombreArchivo - Nombre del archivo a descargar
   */
  _crearDescargaDeBlob(blob, nombreArchivo) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Extrae el nombre del archivo de una ruta o URL
   * @param {string} ruta - Ruta o URL del documento
   * @returns {string} Nombre del archivo
   */
  obtenerNombreArchivo(ruta) {
    if (!ruta) return 'archivo.pdf';
    const partes = ruta.split('/');
    return partes[partes.length - 1] || 'archivo.pdf';
  }

  /**
   * Obtiene la extensión de un archivo
   * @param {string} nombreArchivo - Nombre del archivo
   * @returns {string} Extensión del archivo
   */
  obtenerExtension(nombreArchivo) {
    if (!nombreArchivo) return '';
    const partes = nombreArchivo.split('.');
    return partes.length > 1 ? partes[partes.length - 1] : '';
  }

  /**
   * Valida si un archivo es un tipo válido
   * @param {string} nombreArchivo - Nombre del archivo
   * @param {Array<string>} extensionesPermitidas - Extensiones permitidas
   * @returns {boolean} True si es válido
   */
  validarTipoArchivo(nombreArchivo, extensionesPermitidas = ['pdf', 'doc', 'docx', 'jpg', 'png']) {
    const extension = this.obtenerExtension(nombreArchivo).toLowerCase();
    return extensionesPermitidas.includes(extension);
  }
}

export default new DocumentoService();
