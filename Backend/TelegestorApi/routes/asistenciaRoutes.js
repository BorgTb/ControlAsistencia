import express from 'express';
import AsistenciaController from '../controllers/asistenciaController.js';
import AuthService from '../../middleware/AuthMiddleWare.js';


const router = express.Router();
const asistenciaController = new AsistenciaController();

router.post('/', AuthService.verifyToken,asistenciaController.getAsistencia);



export default router;