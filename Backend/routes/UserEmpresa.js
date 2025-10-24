import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import UserEmpresaController from '../controllers/UserEmpresaController.js';
import EstController from '../controllers/EstController.js';
import LugarController from '../controllers/LugarController.js';
// Importar el controlador de amonestaciones
import AmonestacionesController from '../controllers/AmonestacionesController.js';

const router = express.Router();


router.post('/trabajador',AuthService.verifyToken, UserEmpresaController.createTrabajador);
router.get('/trabajadores',AuthService.verifyToken, UserEmpresaController.obtenerTrabajadores);
router.get('/trabajador/:rut',AuthService.verifyToken, UserEmpresaController.obtenerTrabajadores);
router.put('/trabajadores/:id',AuthService.verifyToken, UserEmpresaController.actualizarTrabajador);
router.get('/trabajador/:id/turnos',AuthService.verifyToken, UserEmpresaController.obtenerTurnosTrabajador);
router.get('/trabajador/:id/marcaciones',AuthService.verifyToken, UserEmpresaController.obtenerMarcacionesTrabajador);
router.put('/trabajador/:id/horas-laborales',AuthService.verifyToken, UserEmpresaController.actualizarHorasLaborales);
router.post('/enrolar-trabajador',AuthService.verifyToken, UserEmpresaController.enrolarTrabajador);

// Rutas para tipos de turno
router.get('/tipos-turnos', AuthService.verifyToken, UserEmpresaController.obtenerTiposTurnos);
router.post('/tipos-turnos', AuthService.verifyToken, UserEmpresaController.crearTipoTurno);
router.delete('/tipos-turnos/:id', AuthService.verifyToken, UserEmpresaController.eliminarTipoTurno);

// Rutas para asignaciones de turnos
router.post('/turnos',AuthService.verifyToken, UserEmpresaController.createTurno);
router.delete('/turnos/:id',AuthService.verifyToken, UserEmpresaController.deleteTurno);
router.get('/turnos/:rut',AuthService.verifyToken, UserEmpresaController.obtenerTurnos);

router.get('/reportes/:rut',AuthService.verifyToken, UserEmpresaController.obtenerReportesMarcaciones);
router.post('/reportes/aprobar/:reporteId',AuthService.verifyToken, UserEmpresaController.aprobarCambioMarcacion);
router.post('/reportes/rechazar/:reporteId',AuthService.verifyToken, UserEmpresaController.rechazarCambioMarcacion);

// Ruta para reporte de jornada diaria (nueva, no modifica las existentes)
router.get('/reporte-jornada/:rutEmpresa', AuthService.verifyToken, UserEmpresaController.obtenerReporteJornadaDiariaEmpresa);

// Rutas para configuración del sistema empresarial
router.post('/configuracion/marcaciones',AuthService.verifyToken, UserEmpresaController.configurarToleranciaHorarias); // Guardar configuración
router.get('/configuracion',AuthService.verifyToken, UserEmpresaController.obtenerConfiguracion); // Obtener configuración
router.get('/configuracion/marcaciones',AuthService.verifyToken, UserEmpresaController.obtenerConfiguracionTolerancias);

router.post('/est/asociar',AuthService.verifyToken, EstController.asociarTrabajadorEmpresa);
router.get('/est/asociaciones',AuthService.verifyToken, EstController.obtenerAsociacionesUsuarioEmpresa);


router.get('/historial-solicitudes',AuthService.verifyToken, UserEmpresaController.historialSolicitudes);

// Rutas para gestión de lugares
router.post('/lugares', AuthService.verifyToken, LugarController.createLugar);
router.get('/lugares', AuthService.verifyToken, LugarController.getAllLugares);
router.get('/lugares/empresa/:empresaId', AuthService.verifyToken, LugarController.getLugaresByEmpresa);
router.get('/lugares/empresa/:empresaId/activos', AuthService.verifyToken, LugarController.getLugaresActivosByEmpresa);
router.get('/lugares/buscar/nombre', AuthService.verifyToken, LugarController.buscarLugaresPorNombre);
router.get('/lugares/:id', AuthService.verifyToken, LugarController.getLugarById);
router.put('/lugares/:id', AuthService.verifyToken, LugarController.updateLugar);
router.patch('/lugares/:id/desactivar', AuthService.verifyToken, LugarController.desactivarLugar);
router.patch('/lugares/:id/activar', AuthService.verifyToken, LugarController.activarLugar);
router.delete('/lugares/:id', AuthService.verifyToken, LugarController.deleteLugar);

// Rutas para gestión de amonestaciones
router.post('/amonestaciones', AuthService.verifyToken, AmonestacionesController.crear);
router.get('/amonestaciones', AuthService.verifyToken, AmonestacionesController.obtenerTodas);
router.get('/amonestaciones/trabajador/:trabajadorId', AuthService.verifyToken, AmonestacionesController.obtenerPorTrabajador);
router.get('/amonestaciones/empresa/:rutEmpresa', AuthService.verifyToken, AmonestacionesController.obtenerPorEmpresa);
router.get('/amonestaciones/estadisticas', AuthService.verifyToken, AmonestacionesController.obtenerEstadisticas);
router.get('/amonestaciones/buscar', AuthService.verifyToken, AmonestacionesController.buscar);
router.get('/amonestaciones/:id', AuthService.verifyToken, AmonestacionesController.obtenerPorId);
router.put('/amonestaciones/:id', AuthService.verifyToken, AmonestacionesController.actualizar);
router.delete('/amonestaciones/:id', AuthService.verifyToken, AmonestacionesController.eliminar);
router.patch('/amonestaciones/:id/descargos', AuthService.verifyToken, AmonestacionesController.actualizarDescargos);
router.patch('/amonestaciones/:id/estado', AuthService.verifyToken, AmonestacionesController.cambiarEstado);

export default router;
