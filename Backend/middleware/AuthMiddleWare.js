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


/**
 * Middleware para proteger rutas exclusivas de administradores.
 * Verifica que el usuario autenticado tenga el campo rol igual a 'admin'.
 * Útil para restringir acceso a endpoints sensibles o de gestión.
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Acceso solo para administradores.' });
};

const auth = {
    verifyToken,
    isAdmin, // Middleware para proteger rutas de admin
};

export default auth;