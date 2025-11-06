import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FileUploadService {
  /**
   * Crear configuración de multer para un tipo específico de archivo
   * @param {string} uploadType - Tipo de upload: 'justificaciones', 'solicitudes', etc.
   * @param {number} maxSize - Tamaño máximo en bytes
   * @param {array} allowedTypes - Tipos MIME permitidos
   * @returns {multer} Instancia de multer configurada
   */
  createUpload(uploadType = 'justificaciones', maxSize = 5 * 1024 * 1024, allowedTypes = null) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, `../uploads/${uploadType}`);
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uploadType}-${uniqueSuffix}${ext}`);
      }
    });

    const defaultTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const typesToUse = allowedTypes || defaultTypes;

    const fileFilter = (req, file, cb) => {
      if (typesToUse.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de archivo no permitido. Tipos permitidos: ${typesToUse.join(', ')}`), false);
      }
    };

    return multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: { fileSize: maxSize }
    });
  }

  /**
   * Eliminar un archivo del servidor
   * @param {string} filePath - Ruta relativa del archivo (ej: /uploads/justificaciones/archivo.pdf)
   * @returns {boolean} True si se eliminó, false si no existe
   */
  deleteFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  }

  /**
   * Obtener información del archivo subido
   * @param {object} file - Objeto file de multer
   * @param {string} uploadType - Tipo de upload para construir la ruta
   * @returns {object} Objeto con url y nombre
   */
  getFileInfo(file, uploadType = 'justificaciones') {
    if (!file) return null;
    
    return {
      url: `/uploads/${uploadType}/${file.filename}`,
      nombre: file.originalname,
      tamaño: file.size,
      mimetype: file.mimetype
    };
  }
}

export default new FileUploadService();
