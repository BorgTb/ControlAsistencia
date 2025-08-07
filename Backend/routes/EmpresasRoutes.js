import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import EmpresaController from '../controllers/EmpresasController.js';



const router = express.Router();

router.get('/', AuthService.verifyToken, EmpresaController.getAllEmpresas);
router.get('/activas', AuthService.verifyToken, EmpresaController.getEmpresasActivas);
router.get('/:id', AuthService.verifyToken, EmpresaController.getEmpresaById);
router.get('/buscar', AuthService.verifyToken, EmpresaController.buscarEmpresasPorNombre);


export default router;
