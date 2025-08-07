import express from 'express';
import AdminController from '../controllers/AdminController.js';

const router = express.Router();



router.post('/trabajador', AdminController.createTrabajador);





export default router;