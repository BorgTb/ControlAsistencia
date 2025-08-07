import express from 'express';
import LoginControlller from '../controllers/LoginController.js';
import FiscalizadorController from '../controllers/FiscalizadorController.js';
import authService from '../services/authservice.js';



const router = express.Router();

router.get('/', (req, res) => {
    res.json({ status: 'Login routes are working' });
});

router.post('/login', LoginControlller.login);
router.post('/logout', LoginControlller.logout);
router.post('/register', LoginControlller.register);
router.post('/solicitar-acceso', FiscalizadorController.solicitarAcceso);
router.post('/validar-codigo', FiscalizadorController.validarCodigo);


// Export the router
export default router;