import { ref } from 'vue';
import DocumentoService from '@/services/documento-service';

export function useDocumentos() {
  const cargando = ref(false);
  const error = ref(null);
  const progreso = ref(0);

  /**
   * Descarga un documento y lo guarda en el dispositivo
   * @param {string} tipo - Tipo de documento (justificacion, solicitud, amonestacion, etc)
   * @param {string} nombreDocumento - Nombre del archivo
   * @param {string} nombreDescarga - Nombre personalizado para la descarga (opcional)
   */
  const descargarDocumento = async (tipo, nombreDocumento, nombreDescarga = null) => {
    try {
      cargando.value = true;
      error.value = null;
      progreso.value = 0;

      console.log(`📥 Descargando documento: ${nombreDocumento} (tipo: ${tipo})`);

      await DocumentoService.descargarYGuardar(tipo, nombreDocumento, nombreDescarga);

      progreso.value = 100;
      console.log('✅ Documento descargado exitosamente');
      return true;
    } catch (err) {
      console.error('❌ Error descargando documento:', err);
      error.value = err.message || 'Error al descargar el documento';
      return false;
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Descarga un documento usando una URL directa
   * @param {string} urlDocumento - URL del documento (relativa o absoluta)
   * @param {string} nombreDescarga - Nombre con el que se guardará
   */
  const descargarPorURL = async (urlDocumento, nombreDescarga, tipo) => {
    try {
      cargando.value = true;
      error.value = null;
      progreso.value = 0;

      console.log(`📥 Descargando desde URL: ${urlDocumento}, {tipo: ${tipo}, nombre: ${nombreDescarga}}`);

      await DocumentoService.descargarPorURLYGuardar(urlDocumento, nombreDescarga,tipo);

      progreso.value = 100;
      console.log('✅ Documento descargado exitosamente desde URL');
      return true;
    } catch (err) {
      console.error('❌ Error descargando desde URL:', err);
      error.value = err.message || 'Error al descargar el documento';
      return false;
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Abre un documento en una nueva pestaña para verlo online
   * @param {string} tipo - Tipo de documento
   * @param {string} nombreDocumento - Nombre del archivo
   */
  const abrirDocumento = async (tipo, nombreDocumento) => {
    try {
      cargando.value = true;
      error.value = null;

      console.log(`👁️ Abriendo documento: ${nombreDocumento}`);

      await DocumentoService.abrirDocumento(tipo, nombreDocumento);

      console.log('✅ Documento abierto en nueva pestaña');
      return true;
    } catch (err) {
      console.error('❌ Error abriendo documento:', err);
      error.value = err.message || 'Error al abrir el documento';
      return false;
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Abre un documento desde una URL en una nueva pestaña
   * @param {string} urlDocumento - URL del documento
   */
  const abrirDocumentoPorURL = async (urlDocumento) => {
    try {
      cargando.value = true;
      error.value = null;

      console.log(`👁️ Abriendo documento desde URL: ${urlDocumento}`);

      await DocumentoService.abrirDocumentoPorURL(urlDocumento);

      console.log('✅ Documento abierto en nueva pestaña');
      return true;
    } catch (err) {
      console.error('❌ Error abriendo documento:', err);
      error.value = err.message || 'Error al abrir el documento';
      return false;
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Obtiene metadatos de un documento
   * @param {string} tipo - Tipo de documento
   * @param {string} nombreDocumento - Nombre del archivo
   */
  const obtenerMetadatos = async (tipo, nombreDocumento) => {
    try {
      cargando.value = true;
      error.value = null;

      const metadatos = await DocumentoService.obtenerMetadatosDocumento(tipo, nombreDocumento);
      console.log('✅ Metadatos obtenidos:', metadatos);

      return metadatos;
    } catch (err) {
      console.error('❌ Error obteniendo metadatos:', err);
      error.value = err.message || 'Error al obtener metadatos';
      return null;
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Lista los documentos de un tipo específico
   * @param {string} tipo - Tipo de documento
   */
  const listarDocumentos = async (tipo) => {
    try {
      cargando.value = true;
      error.value = null;

      const documentos = await DocumentoService.listarDocumentos(tipo);
      console.log('✅ Documentos listados:', documentos);

      return documentos;
    } catch (err) {
      console.error('❌ Error listando documentos:', err);
      error.value = err.message || 'Error al listar documentos';
      return [];
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Elimina un documento del servidor
   * @param {string} tipo - Tipo de documento
   * @param {string} nombreDocumento - Nombre del archivo
   */
  const eliminarDocumento = async (tipo, nombreDocumento) => {
    try {
      cargando.value = true;
      error.value = null;

      console.log(`🗑️ Eliminando documento: ${nombreDocumento}`);

      const resultado = await DocumentoService.eliminarDocumento(tipo, nombreDocumento);
      console.log('✅ Documento eliminado:', resultado);

      return true;
    } catch (err) {
      console.error('❌ Error eliminando documento:', err);
      error.value = err.message || 'Error al eliminar el documento';
      return false;
    } finally {
      cargando.value = false;
    }
  };

  /**
   * Obtiene el nombre del archivo desde una ruta o URL
   * @param {string} ruta - Ruta o URL del documento
   */
  const obtenerNombreArchivo = (ruta) => {
    return DocumentoService.obtenerNombreArchivo(ruta);
  };

  /**
   * Obtiene la extensión de un archivo
   * @param {string} nombreArchivo - Nombre del archivo
   */
  const obtenerExtension = (nombreArchivo) => {
    return DocumentoService.obtenerExtension(nombreArchivo);
  };

  /**
   * Valida si un archivo es de un tipo permitido
   * @param {string} nombreArchivo - Nombre del archivo
   * @param {Array<string>} extensionesPermitidas - Extensiones permitidas
   */
  const validarTipoArchivo = (nombreArchivo, extensionesPermitidas = ['pdf', 'doc', 'docx', 'jpg', 'png']) => {
    return DocumentoService.validarTipoArchivo(nombreArchivo, extensionesPermitidas);
  };

  return {
    // Estados
    cargando,
    error,
    progreso,

    // Métodos
    descargarDocumento,
    descargarPorURL,
    abrirDocumento,
    abrirDocumentoPorURL,
    obtenerMetadatos,
    listarDocumentos,
    eliminarDocumento,
    obtenerNombreArchivo,
    obtenerExtension,
    validarTipoArchivo
  };
}
