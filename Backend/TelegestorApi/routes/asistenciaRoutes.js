import express from 'express';
import AsistenciaController from '../controllers/asistenciaController.js';


const router = express.Router();
const asistenciaController = new AsistenciaController();

router.get('/', asistenciaController.getAsistencia);



export default router;