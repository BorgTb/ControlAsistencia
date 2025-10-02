

import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import UserController from '../controllers/UserController.js';

const router = express.Router();

// Endpoint para actualizar el rol de un usuario por id
// Permite modificar el campo 'rol' desde el frontend de forma segura y controlada
router.put('/usuarios/:id/rol', AuthService.verifyToken, AuthService.isAdmin, UserController.updateRol);

// Endpoint para actualizar el estado de un usuario por id
router.put('/usuarios/:id/estado', AuthService.verifyToken, AuthService.isAdmin, UserController.updateEstado);

// Rutas de usuario estándar
router.put('/email', AuthService.verifyToken, UserController.updateEmail);
router.put('/password', AuthService.verifyToken, UserController.updatePassword);
router.post('/reportes/', AuthService.verifyToken, UserController.createReporte);

// Endpoint protegido para listar todos los usuarios (solo admin)
router.get('/usuarios', AuthService.verifyToken, AuthService.isAdmin, UserController.listAllUsers);

/**
 * Rutas exclusivas para administradores
 * Protegidas con el middleware isAdmin para asegurar que solo usuarios con rol 'admin' accedan.
 */
router.post('/admin', AuthService.verifyToken, AuthService.isAdmin, UserController.createAdmin); // Crear admin
router.get('/admins', AuthService.verifyToken, AuthService.isAdmin, UserController.listAdmins);   // Listar admins

// Nuevas rutas para gestión completa de usuarios (solo admins)
router.post('/usuarios', AuthService.verifyToken, AuthService.isAdmin, UserController.createUser);   // Crear usuario
router.delete('/usuarios/:id', AuthService.verifyToken, AuthService.isAdmin, UserController.deleteUser); // Eliminar usuario

// Rutas para gestión de relaciones usuario-empresa
// Permite obtener todas las empresas disponibles para asignar a trabajadores
router.get('/empresas', AuthService.verifyToken, AuthService.isAdmin, UserController.getAllEmpresas);

// Permite obtener todas las relaciones usuario-empresa existentes
// Utilizado para determinar qué usuarios ya tienen empresa asignada
router.get('/usuarios-empresas', AuthService.verifyToken, AuthService.isAdmin, UserController.getUsuariosEmpresas);

// Permite crear una nueva relación usuario-empresa
// Se usa cuando se une un trabajador a una empresa desde el frontend
router.post('/usuarios-empresas', AuthService.verifyToken, AuthService.isAdmin, UserController.createUsuarioEmpresa);

export default router;
