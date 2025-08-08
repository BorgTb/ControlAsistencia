import express from 'express';
import ReportesController from '../controllers/ReportesController.js';
import pool from '../config/telegestordb.js'


const router = express.Router();



router.get('/asistencia', ReportesController.obtenerReporteAsistencia);


export default router;
