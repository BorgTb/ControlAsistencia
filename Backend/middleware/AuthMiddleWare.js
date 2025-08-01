import AuthService from '../services/authservice.js';

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;

        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        // Extraer el token (formato: "Bearer <token>")
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. Invalid token format.' 
            });
        }

        // Verificar el token usando el AuthService
        const decoded = AuthService.verifyToken(token);
        
        // Agregar la información del usuario al objeto request
        req.user = decoded;
        
        // Continuar con el siguiente middleware o ruta
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired. Please login again.' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token.' 
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: 'Server error during token verification.' 
        });
    }
};

const auth = {
    verifyToken,
};

export default auth;