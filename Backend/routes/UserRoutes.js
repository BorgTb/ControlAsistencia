import express from 'express';
import AuthService from '../middleware/AuthMiddleWare.js';
import UserController from '../controllers/UserController.js';



const router = express.Router();

router.put('/email', AuthService.verifyToken, UserController.updateEmail);
router.put('/password', AuthService.verifyToken, UserController.updatePassword);


export default router;
