import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import UserEmpresaController from '../controllers/UserEmpresaController.js';
import EstController from '../controllers/EstController.js';


const router = express.Router();


router.post('/trabajador',AuthService.verifyToken, UserEmpresaController.createTrabajador);
router.get('/trabajador/:rut',AuthService.verifyToken, UserEmpresaController.obtenerTrabajadores);
router.post('/enrolar-trabajador',AuthService.verifyToken, UserEmpresaController.enrolarTrabajador);
router.post('/turnos',AuthService.verifyToken, UserEmpresaController.createTurno);
router.delete('/turnos/:id',AuthService.verifyToken, UserEmpresaController.deleteTurno); // nueva ruta para eliminar
router.get('/turnos/:rut',AuthService.verifyToken, UserEmpresaController.obtenerTurnos);
router.get('/reportes/:rut',AuthService.verifyToken, UserEmpresaController.obtenerReportesMarcaciones);
router.post('/reportes/aprobar/:reporteId',AuthService.verifyToken, UserEmpresaController.aprobarCambioMarcacion);
router.post('/reportes/rechazar/:reporteId',AuthService.verifyToken, UserEmpresaController.rechazarCambioMarcacion);

// Rutas para configuración del sistema empresarial
router.post('/configuracion',AuthService.verifyToken, UserEmpresaController.guardarConfiguracion); // Guardar configuración
router.get('/configuracion',AuthService.verifyToken, UserEmpresaController.obtenerConfiguracion); // Obtener configuración

router.post('/est/asociar',AuthService.verifyToken, EstController.asociarTrabajadorEmpresa);
router.get('/est/asociaciones',AuthService.verifyToken, EstController.obtenerAsociacionesUsuarioEmpresa);

export default router;
