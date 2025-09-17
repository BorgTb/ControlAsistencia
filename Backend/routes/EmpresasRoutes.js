import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import EmpresaController from '../controllers/EmpresasController.js';



const router = express.Router();


// Se agrega la ruta POST para crear empresas desde el frontend (CRUD)
router.post('/', AuthService.verifyToken, EmpresaController.createEmpresa);

// Se agrega la ruta DELETE para eliminar empresas desde el frontend (CRUD)
// Esto permite que el botón de borrar en AdminEmpresas funcione correctamente
router.delete('/:id', AuthService.verifyToken, EmpresaController.deleteEmpresa);
router.get('/activas', AuthService.verifyToken, EmpresaController.getEmpresasActivas);
router.get('/buscar', AuthService.verifyToken, EmpresaController.buscarEmpresasPorNombre);
router.put('/:id', AuthService.verifyToken, EmpresaController.updateEmpresa);
router.get('/:id', AuthService.verifyToken, EmpresaController.getEmpresaById);
router.get('/', AuthService.verifyToken, EmpresaController.getAllEmpresas);


export default router;
