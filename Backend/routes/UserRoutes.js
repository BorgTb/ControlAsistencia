import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import UserController from '../controllers/UserController.js';



const router = express.Router();

router.put('/email', AuthService.verifyToken, UserController.updateEmail);
router.put('/password', AuthService.verifyToken, UserController.updatePassword);
router.post('/reportes/', AuthService.verifyToken, UserController.createReporte);


export default router;
