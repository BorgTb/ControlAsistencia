import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import EmpresaController from '../controllers/EmpresasController.js';



const router = express.Router();


// RUTAS RESTRINGIDAS SOLO PARA ADMINISTRADORES
// Solo admins pueden crear, editar y eliminar empresas
router.post('/', AuthService.verifyToken, AuthService.isAdmin, EmpresaController.createEmpresa);
router.delete('/:id', AuthService.verifyToken, AuthService.isAdmin, EmpresaController.deleteEmpresa);
router.put('/:id', AuthService.verifyToken, AuthService.isAdmin, EmpresaController.updateEmpresa);

// RUTAS DISPONIBLES PARA TODOS LOS USUARIOS AUTENTICADOS
// Empleadores y admins pueden ver las empresas
router.get('/activas', AuthService.verifyToken, EmpresaController.getEmpresasActivas);
router.get('/buscar', AuthService.verifyToken, EmpresaController.buscarEmpresasPorNombre);
router.get('/:id', AuthService.verifyToken, EmpresaController.getEmpresaById);
router.get('/', AuthService.verifyToken, EmpresaController.getAllEmpresas);


export default router;
