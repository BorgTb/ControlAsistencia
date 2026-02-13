import express from 'express';
import DocumentoController from '../controllers/documento.controller.js';
import AuthService from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Rutas para gestión de documentos
 * 
 * Todos los endpoints requieren autenticación (AuthService.verifyToken)
 */

/**
 * @route   GET /api/documentos/descargar/:tipo/:nombreDocumento
 * @desc    Descarga un documento específico
 * @access  Private
 * @params  tipo: Tipo de documento (justificacion, solicitud, etc)
 *          nombreDocumento: Nombre del archivo a descargar
 */
router.get('/:tipo/:nombreDocumento', AuthService.verifyToken, (req, res) => {
  DocumentoController.descargarDocumento(req, res);
});

/**
 * @route   GET /api/documentos/metadatos/:tipo/:nombreDocumento
 * @desc    Obtiene metadatos de un documento
 * @access  Private
 * @params  tipo: Tipo de documento
 *          nombreDocumento: Nombre del archivo
 */
router.get('/metadatos/:tipo/:nombreDocumento', AuthService.verifyToken, (req, res) => {
  DocumentoController.obtenerMetadatos(req, res);
});

/**
 * @route   GET /api/documentos/lista/:tipo
 * @desc    Lista todos los documentos de un tipo
 * @access  Private
 * @params  tipo: Tipo de documento
 */
router.get('/lista/:tipo', AuthService.verifyToken, (req, res) => {
  DocumentoController.listarDocumentos(req, res);
});

/**
 * @route   DELETE /api/documentos/:tipo/:nombreDocumento
 * @desc    Elimina un documento
 * @access  Private
 * @params  tipo: Tipo de documento
 *          nombreDocumento: Nombre del archivo
 */
router.delete('/:tipo/:nombreDocumento', AuthService.verifyToken, (req, res) => {
  DocumentoController.eliminarDocumento(req, res);
});

export default router;
