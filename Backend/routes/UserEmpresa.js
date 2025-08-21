import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import UserEmpresaController from '../controllers/UserEmpresaController.js';



const router = express.Router();

router.get('/horarios/:rut', UserEmpresaController.obtenerHorariosPorRut);

export default router;
