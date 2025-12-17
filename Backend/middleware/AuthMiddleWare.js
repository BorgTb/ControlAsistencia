import AuthService from '../services/authservice.js';

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
    try {
        // Intentar obtener access token de cookie primero (método recomendado)
        let token = req.cookies?.accessToken;
        
        // Fallback: verificar header Authorization (para compatibilidad con apps móviles/APIs externas)
        if (!token) {
            const authHeader = req.headers.authorization;
            console.log('No cookie found, trying Authorization header:', authHeader);
            if (authHeader) {
                token = authHeader.split(' ')[1];
            }
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        // Verificar el token usando el AuthService
        const decoded = AuthService.verifyToken(token);
        
        // Verificar que sea un access token (no refresh token)
        if (decoded.type && decoded.type !== 'access') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token type.' 
            });
        }

        // Debug: Log información del usuario decodificado
        console.log('🔍 Usuario decodificado del token:', {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol,
            hasId: !!decoded.id
        });
        
        // Agregar la información del usuario al objeto request
        req.user = decoded;
        
        // Continuar con el siguiente middleware o ruta
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired. Please login again.',
                requiresRefresh: true // Señal para el frontend de intentar refresh
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