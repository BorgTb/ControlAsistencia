import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || '';

/**
 * Middleware para requerir un rol específico
 * Verifica que el usuario autenticado tenga el rol especificado
 * 
 * @param {string} requiredRole - Slug del rol requerido (ej: 'admin', 'empleador')
 * @returns {Function} Middleware function
 */
export const requireRole = (requiredRole) => {
    return (req, res, next) => {
        try {
            // Obtener token de cookies
            const token = req.cookies.accessToken;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No se proporcionó token de autenticación'
                });
            }

            // Verificar y decodificar token
            const decoded = jwt.verify(token, SECRET_KEY);

            // Verificar que el token tenga el array de roles
            const userRoles = decoded.roles || [decoded.rol]; // Fallback al rol único

            // Verificar si el usuario tiene el rol requerido
            if (!userRoles.includes(requiredRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Acceso denegado. Se requiere rol: ${requiredRole}`
                });
            }

            // Usuario tiene el rol requerido, continuar
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado',
                error: error.message
            });
        }
    };
};

/**
 * Middleware para requerir al menos uno de varios roles
 * Verifica que el usuario tenga al menos uno de los roles especificados
 * 
 * @param {Array<string>} allowedRoles - Array de slugs de roles permitidos
 * @returns {Function} Middleware function
 */
export const requireAnyRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const token = req.cookies.accessToken;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No se proporcionó token de autenticación'
                });
            }

            const decoded = jwt.verify(token, SECRET_KEY);
            const userRoles = decoded.roles || [decoded.rol];

            // Verificar si el usuario tiene al menos uno de los roles permitidos
            const hasRole = userRoles.some(role => allowedRoles.includes(role));

            if (!hasRole) {
                return res.status(403).json({
                    success: false,
                    message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
                });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado',
                error: error.message
            });
        }
    };
};

/**
 * Middleware para requerir todos los roles especificados
 * Verifica que el usuario tenga TODOS los roles especificados
 * 
 * @param {Array<string>} requiredRoles - Array de slugs de roles requeridos
 * @returns {Function} Middleware function
 */
export const requireAllRoles = (requiredRoles) => {
    return (req, res, next) => {
        try {
            const token = req.cookies.accessToken;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No se proporcionó token de autenticación'
                });
            }

            const decoded = jwt.verify(token, SECRET_KEY);
            const userRoles = decoded.roles || [decoded.rol];

            // Verificar si el usuario tiene TODOS los roles requeridos
            const hasAllRoles = requiredRoles.every(role => userRoles.includes(role));

            if (!hasAllRoles) {
                return res.status(403).json({
                    success: false,
                    message: `Acceso denegado. Se requieren todos los siguientes roles: ${requiredRoles.join(', ')}`
                });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado',
                error: error.message
            });
        }
    };
};

/**
 * Middleware helper para verificar si el usuario tiene un rol específico
 * Útil para lógica condicional dentro de controladores
 * 
 * @param {Object} req - Request object con usuario decodificado
 * @param {string} roleSlug - Slug del rol a verificar
 * @returns {boolean} true si el usuario tiene el rol, false si no
 */
export const userHasRole = (req, roleSlug) => {
    if (!req.user) return false;
    const userRoles = req.user.roles || [req.user.rol];
    return userRoles.includes(roleSlug);
};

export default {
    requireRole,
    requireAnyRole,
    requireAllRoles,
    userHasRole
};
