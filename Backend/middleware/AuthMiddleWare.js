import AuthService from '../services/authservice.js';
import RefreshTokenModel from '../model/RefreshTokenModel.js';

// Middleware para verificar JWT y validar sesión
const verifyToken = async (req, res, next) => {
    try {
        // 1. OBTENER ACCESS TOKEN
        let token = req.cookies?.accessToken;
        
        // Fallback: verificar header Authorization
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader) {
                token = authHeader.split(' ')[1];
            }
        }
        
        if (!token) {
            console.log('❌ No access token - Path:', req.path);
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.',
                requiresRefresh: false
            });
        }

        // 2. VERIFICAR JWT (firma, estructura, expiración)
        const decoded = AuthService.verifyToken(token);
        
        // 3. VERIFICAR QUE SEA ACCESS TOKEN
        if (decoded.type && decoded.type !== 'access') {
            console.log('❌ Invalid token type:', decoded.type);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token type.',
                requiresRefresh: false
            });
        }
        
        // 4. TOKEN VÁLIDO - Continuar
        req.user = decoded;
        console.log('✅ Token OK - User:', decoded.id, 'Path:', req.path);
        next();
        
    } catch (error) {
        // MANEJO DE ERRORES
        
        if (error.name === 'TokenExpiredError') {
            console.log('⏰ Access token EXPIRED - Path:', req.path);
            
            // VALIDAR REFRESH TOKEN EN BD solo cuando access token expira
            const refreshToken = req.cookies?.refreshToken;
            
            if (!refreshToken) {
                console.log('❌ No refresh token disponible');
                return res.status(401).json({ 
                    success: false,
                    message: 'Session expired. Please login again.',
                    requiresRefresh: false,
                    requiresLogin: true
                });
            }
            
            try {
                // Verificar refresh token en base de datos
                const tokenRecord = await RefreshTokenModel.findValidToken(refreshToken);
                
                if (tokenRecord) {
                    console.log('✅ Refresh token VÁLIDO en BD - User:', tokenRecord.user_id);
                    return res.status(401).json({ 
                        success: false,
                        message: 'Access token expired.',
                        requiresRefresh: true // ✅ Puede renovar
                    });
                } else {
                    console.log('❌ Refresh token INVÁLIDO/REVOCADO en BD');
                    return res.status(401).json({ 
                        success: false,
                        message: 'Session expired. Please login again.',
                        requiresRefresh: false,
                        requiresLogin: true // ❌ Debe hacer login
                    });
                }
            } catch (dbError) {
                console.error('❌ Error consultando BD para refresh token:', dbError.message);
                // En caso de error de BD, permitir intentar refresh (fail-safe)
                return res.status(401).json({ 
                    success: false,
                    message: 'Access token expired.',
                    requiresRefresh: true
                });
            }
        }
        
        if (error.name === 'JsonWebTokenError') {
            console.log('❌ Invalid JWT:', error.message);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token.',
                requiresRefresh: false,
                requiresLogin: true
            });
        }
        
        console.error('❌ Token verification error:', error.message);
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