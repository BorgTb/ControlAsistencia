import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controlador para gestión de documentos
 * Maneja descargas, listados, eliminación y obtención de metadatos
 */
class DocumentoController {
  /**
   * Mapeo de tipos de documentos a sus carpetas
   * Personaliza según tu estructura de carpetas
   */
  static getTipoPaths() {
    return {
      justificacion: path.join(__dirname, '../uploads/justificaciones'),
      solicitud: path.join(__dirname, '../uploads/solicitudes'),
      amonestacion: path.join(__dirname, '../uploads/amonestaciones'),
      reporte: path.join(__dirname, '../uploads/reportes'),
      comprobante: path.join(__dirname, '../uploads/comprobantes'),
      // Agrega más tipos según necesites
    };
  }

  /**
   * Descarga un documento
   * @param {Express.Request} req
   * @param {Express.Response} res
   */
  static async descargarDocumento(req, res) {
    try {
      const { tipo, nombreDocumento } = req.params;
      
      // Validar que el tipo exista
      const paths = this.getTipoPaths();
      if (!paths[tipo]) {
        return res.status(400).json({
          success: false,
          message: `Tipo de documento inválido: ${tipo}`
        });
      }

      // Construir ruta segura (prevenir path traversal)
      const carpeta = paths[tipo];
      const rutaArchivo = path.resolve(carpeta, nombreDocumento);

      // Verificar que el archivo esté dentro de la carpeta permitida
      if (!rutaArchivo.startsWith(carpeta)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      // Verificar que el archivo existe
      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({
          success: false,
          message: `Documento no encontrado: ${nombreDocumento}`
        });
      }

      // Obtener información del archivo
      const stats = fs.statSync(rutaArchivo);
      const ext = path.extname(rutaArchivo).toLowerCase();

      // Mapeo de tipos MIME
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      // Configurar headers para descarga
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${nombreDocumento}"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Enviar archivo
      const fileStream = fs.createReadStream(rutaArchivo);
      fileStream.pipe(res);

      // Manejo de errores en el stream
      fileStream.on('error', (error) => {
        console.error('Error en stream de archivo:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error al descargar el documento'
          });
        }
      });

      console.log(`✅ Documento descargado: ${tipo}/${nombreDocumento}`);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al descargar el documento',
        error: error.message
      });
    }
  }

  /**
   * Obtiene metadatos de un documento
   * @param {Express.Request} req
   * @param {Express.Response} res
   */
  static async obtenerMetadatos(req, res) {
    try {
      const { tipo, nombreDocumento } = req.params;

      const paths = this.getTipoPaths();
      if (!paths[tipo]) {
        return res.status(400).json({
          success: false,
          message: `Tipo de documento inválido: ${tipo}`
        });
      }

      const carpeta = paths[tipo];
      const rutaArchivo = path.resolve(carpeta, nombreDocumento);

      // Validar ruta
      if (!rutaArchivo.startsWith(carpeta)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({
          success: false,
          message: `Documento no encontrado: ${nombreDocumento}`
        });
      }

      const stats = fs.statSync(rutaArchivo);
      const ext = path.extname(rutaArchivo);

      const metadatos = {
        nombre: nombreDocumento,
        tipo: tipo,
        extension: ext,
        tamaño: stats.size,
        tamaño_kb: (stats.size / 1024).toFixed(2),
        fecha_creacion: stats.birthtime,
        fecha_modificacion: stats.mtime,
        es_archivo: stats.isFile(),
        ruta_relativa: `/${tipo}/${nombreDocumento}`
      };

      res.json({
        success: true,
        data: metadatos
      });
    } catch (error) {
      console.error('Error al obtener metadatos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener metadatos del documento',
        error: error.message
      });
    }
  }

  /**
   * Lista todos los documentos de un tipo
   * @param {Express.Request} req
   * @param {Express.Response} res
   */
  static async listarDocumentos(req, res) {
    try {
      const { tipo } = req.params;

      const paths = this.getTipoPaths();
      if (!paths[tipo]) {
        return res.status(400).json({
          success: false,
          message: `Tipo de documento inválido: ${tipo}`
        });
      }

      const carpeta = paths[tipo];

      // Crear carpeta si no existe
      if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true });
      }

      const archivos = fs.readdirSync(carpeta);

      const documentos = archivos
        .filter(archivo => {
          const stats = fs.statSync(path.join(carpeta, archivo));
          return stats.isFile();
        })
        .map(archivo => {
          const rutaCompleta = path.join(carpeta, archivo);
          const stats = fs.statSync(rutaCompleta);
          return {
            nombre: archivo,
            extension: path.extname(archivo),
            tamaño: stats.size,
            tamaño_kb: (stats.size / 1024).toFixed(2),
            fecha_creacion: stats.birthtime,
            fecha_modificacion: stats.mtime
          };
        });

      res.json({
        success: true,
        tipo: tipo,
        cantidad: documentos.length,
        data: documentos
      });
    } catch (error) {
      console.error('Error al listar documentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar documentos',
        error: error.message
      });
    }
  }

  /**
   * Elimina un documento
   * @param {Express.Request} req
   * @param {Express.Response} res
   */
  static async eliminarDocumento(req, res) {
    try {
      const { tipo, nombreDocumento } = req.params;

      const paths = this.getTipoPaths();
      if (!paths[tipo]) {
        return res.status(400).json({
          success: false,
          message: `Tipo de documento inválido: ${tipo}`
        });
      }

      const carpeta = paths[tipo];
      const rutaArchivo = path.resolve(carpeta, nombreDocumento);

      // Validar ruta
      if (!rutaArchivo.startsWith(carpeta)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({
          success: false,
          message: `Documento no encontrado: ${nombreDocumento}`
        });
      }

      // Eliminar archivo
      fs.unlinkSync(rutaArchivo);

      console.log(`✅ Documento eliminado: ${tipo}/${nombreDocumento}`);

      res.json({
        success: true,
        message: 'Documento eliminado exitosamente',
        documento: nombreDocumento
      });
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el documento',
        error: error.message
      });
    }
  }
}

export default DocumentoController;
