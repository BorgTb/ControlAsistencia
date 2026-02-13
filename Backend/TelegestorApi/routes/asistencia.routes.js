import express from 'express';
import AsistenciaController from '../controllers/asistencia.controller.js';
import AuthService from '../../middleware/auth.middleware.js';


const router = express.Router();
const asistenciaController = new AsistenciaController();

router.post('/', AuthService.verifyToken, asistenciaController.getAsistencia);
router.post('/validar', AuthService.verifyToken, asistenciaController.validarDiasIncompletos);
router.post('/export/csv', AuthService.verifyToken, asistenciaController.exportarCSV);
router.post('/export/excel', AuthService.verifyToken, asistenciaController.exportarExcel);



export default router;