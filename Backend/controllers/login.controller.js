import AuthService from '../services/auth.service.js';
import RefreshTokenModel from '../model/refresh-token.model.js';

// SimulaciÃ³n de base de datos de usuarios (reemplaza con tu DB real)
const users = [];

// FunciÃ³n para obtener usuario por email
const getUserByEmail = async (email) => {
    return users.find(user => user.email === email);
};

// Controller para registro
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
	console.log(email,password);	

        // Registrar usuario
        const newUser = await AuthService.registerUser(email, password);
        users.push(newUser); // Agregar a la "base de datos"

        // Generar token
        const token = AuthService.generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Controller para login - simplificado
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Obtener IP del usuario
        const ip_address = req.ip || req.connection.remoteAddress || req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
            req.headers['x-forwarded-for'] || 'unknown';

        console.log('ðŸ” Intento de login:', {
            email: email,
            ip_address: ip_address,
            user_agent: req.headers['user-agent'],
            fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })
        });

        const loginResult = await AuthService.loginUser(email, password, ip_address);

        console.log('âœ… Login exitoso para usuario:', {
            id: loginResult.user.id,
            nombre: loginResult.user.nombre,
            ip_address: ip_address
        });

        // MULTI-EMPRESA: Si requiere selecciÃ³n de empresa, retornar lista sin tokens
        if (loginResult.requiresCompanySelection) {
            console.log('ðŸ‘¥ Usuario multi-empresa, retornando lista de empresas');
            return res.status(200).json({
                success: true,
                requiresCompanySelection: true,
                companies: loginResult.companies,
                user: loginResult.user,
                message: 'Selecciona una empresa para continuar'
            });
        }

        // Usuario con empresa Ãºnica - flujo normal con tokens
        // Generar access token (15 minutos) y refresh token (180 dÃ­as)
        // MULTI-ROL: Pasar array de roles al access token
        const accessToken = AuthService.generateAccessToken(
            loginResult.user,
            loginResult.empresa_id,
            loginResult.roles // Array de roles del usuario
        );
        const refreshToken = AuthService.generateRefreshToken(loginResult.user);

        // ðŸ” LOGS DE DIAGNÃ“STICO
        console.log('\nðŸ” === TOKENS GENERADOS ===');
        console.log('ðŸ”‘ AccessToken:', accessToken.substring(0, 30) + '...');
        console.log('ðŸ”„ RefreshToken:', refreshToken.substring(0, 30) + '...');
        console.log('â° Expira en:', new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toLocaleString());

        // Guardar refresh token en base de datos
        // SESIÃ“N PERSISTENTE: 5 aÃ±os (sin rotaciÃ³n)
        const expiresAt = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 aÃ±os
        const userAgent = req.headers['user-agent'] || 'unknown';
        await RefreshTokenModel.create(loginResult.user.id, refreshToken, expiresAt, ip_address, userAgent);

        console.log('âœ… Token guardado en BD');

        // Establecer ambas cookies HTTP-only
        AuthService.setAuthCookies(res, accessToken, refreshToken);

        console.log('âœ… Cookies establecidas');

        // Devolver informaciÃ³n del usuario y tiempo de expiraciÃ³n del token
        const expiresIn = 15 * 60; // 15 minutos en segundos

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: loginResult.user, // NO se envÃ­an tokens en el body
            expiresIn: expiresIn, // Segundos hasta expiraciÃ³n
            expiresAt: Date.now() + (expiresIn * 1000) // Timestamp de expiraciÃ³n
        });

    } catch (error) {
        // Manejo de errores especÃ­ficos de autenticaciÃ³n
        // Estos errores se devuelven como "Invalid credentials" por seguridad
        // para no revelar informaciÃ³n especÃ­fica sobre la cuenta del usuario
        if (error.message === 'User not found' ||
            error.message === 'Invalid password' ||
            error.message === 'User account is inactive' ||
            error.message === 'Usuario no tiene empresas asignadas') {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


const logout = async (req, res) => {
    try {
        // Obtener refresh token de las cookies
        const refreshToken = req.cookies.refreshToken;

        console.log('ðŸšª Iniciando logout - tiene refresh token:', !!refreshToken);

        // Revocar refresh token en base de datos si existe
        if (refreshToken) {
            const revoked = await RefreshTokenModel.revoke(refreshToken);
            console.log('ðŸ“ Resultado de revocaciÃ³n:', revoked ? 'âœ… OK' : 'âš ï¸ No encontrado');
        } else {
            console.log('âš ï¸ No hay refresh token para revocar');
        }

        // Limpiar ambas cookies de autenticaciÃ³n
        AuthService.clearAuthCookies(res);
        console.log('ðŸ§¹ Cookies limpiadas');

        // Optional: registrar logout en auditorÃ­a si es necesario
        // if (req.user?.id) {
        //     await AuditoriaModel.registrarCierreSesion(req.user.id);
        // }

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

        console.log('âœ… Logout completado exitosamente');

    } catch (error) {
        console.error('âŒ Error en logout:', error);
        // Siempre retornamos Ã©xito en logout para evitar problemas
        AuthService.clearAuthCookies(res);
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    }
};

const verifyToken = (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'No token provided'
            });
        }
        const decoded = AuthService.verifyToken(token);
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

/**
 * Endpoint para renovar access token usando refresh token
 * Se llama automÃ¡ticamente desde el frontend cuando el access token expira
 */
const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token provided',
                requiresLogin: true
            });
        }

        // Verificar que el refresh token sea vÃ¡lido en JWT
        const decoded = AuthService.verifyRefreshToken(refreshToken);

        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                requiresLogin: true
            });
        }

        // Verificar que el token no estÃ© revocado en base de datos
        const tokenRecord = await RefreshTokenModel.findValidToken(refreshToken);

        if (!tokenRecord) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found or revoked',
                requiresLogin: true
            });
        }

        // Generar nuevo access token
        const user = {
            id: tokenRecord.user_id,
            email: tokenRecord.email,
            rol: tokenRecord.rol
        };

        // Obtener empresa_id del token record (ya viene del JOIN en findValidToken)
        const empresa_id = tokenRecord.empresa_id || null;
        const newAccessToken = AuthService.generateAccessToken(user, empresa_id);

        // SIN ROTACIÃ“N: Solo renovar access token
        // El refresh token permanece igual durante toda la sesiÃ³n (5 aÃ±os)
        // Solo se establece el nuevo access token cookie
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutos
        });

        // Devolver informaciÃ³n sobre la expiraciÃ³n para renovaciÃ³n proactiva
        const expiresIn = 15 * 60; // 15 minutos en segundos

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            expiresIn: expiresIn, // Segundos hasta expiraciÃ³n
            expiresAt: Date.now() + (expiresIn * 1000) // Timestamp de expiraciÃ³n
        });

    } catch (error) {
        console.error('âŒ Error en refresh token:', error);

        // Limpiar cookies en caso de error
        AuthService.clearAuthCookies(res);

        res.status(401).json({
            success: false,
            message: 'Failed to refresh token',
            requiresLogin: true
        });
    }
};

/**
 * Endpoint para seleccionar empresa (usuarios multi-empresa)
 * Se llama despuÃ©s del login cuando el usuario tiene mÃºltiples empresas
 */
const selectCompany = async (req, res) => {
    try {
        const { userId, empresaId } = req.body;

        if (!userId || !empresaId) {
            return res.status(400).json({
                success: false,
                message: 'userId y empresaId son requeridos'
            });
        }

        // Obtener IP del usuario
        const ip_address = req.ip || req.connection.remoteAddress || req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
            req.headers['x-forwarded-for'] || 'unknown';

        console.log('ðŸ¢ SelecciÃ³n de empresa:', {
            userId: userId,
            empresaId: empresaId,
            ip_address: ip_address
        });

        // CONSIDERACIÃ“N 1: Revocar todos los refresh tokens anteriores del usuario
        // Esto evita acumulaciÃ³n de tokens y mejora la seguridad
        try {
            const revoked = await RefreshTokenModel.revokeAllByUser(userId);
            console.log('ðŸ”’ Refresh tokens anteriores revocados:', revoked);
        } catch (revokeError) {
            console.warn('âš ï¸ Error al revocar tokens anteriores:', revokeError);
            // No detener el proceso por esto
        }

        // Llamar al servicio de selecciÃ³n de empresa
        const selectionResult = await AuthService.selectCompany(userId, empresaId, ip_address);

        console.log('âœ… Empresa seleccionada exitosamente');

        // Generar access token y refresh token
        const accessToken = AuthService.generateAccessToken(
            selectionResult.user,
            selectionResult.empresa_id,
            selectionResult.roles
        );
        const refreshToken = AuthService.generateRefreshToken(selectionResult.user);

        // Guardar refresh token en base de datos
        const expiresAt = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 aÃ±os
        const userAgent = req.headers['user-agent'] || 'unknown';
        await RefreshTokenModel.create(selectionResult.user.id, refreshToken, expiresAt, ip_address, userAgent);

        // CONSIDERACIÃ“N 2: Registrar cambio de empresa en auditorÃ­a
        try {
            await AuditoriaModel.registrarCambio({
                usuario_id: userId,
                accion: 'cambio_empresa',
                tabla_afectada: 'usuarios_empresas',
                registro_id: empresaId,
                descripcion: `Usuario cambiÃ³ a empresa: ${selectionResult.user.empresa_nombre}`,
                datos_nuevos: {
                    empresa_id: empresaId,
                    empresa_nombre: selectionResult.user.empresa_nombre,
                    empresa_rut: selectionResult.user.empresa_rut
                },
                ip_address: ip_address
            });
            console.log('ðŸ“ Cambio de empresa registrado en auditorÃ­a');
        } catch (auditoriaError) {
            console.warn('âš ï¸ Error al registrar en auditorÃ­a:', auditoriaError);
            // No detener el proceso por esto
        }

        // Establecer cookies
        AuthService.setAuthCookies(res, accessToken, refreshToken);

        // Devolver informaciÃ³n del usuario
        const expiresIn = 15 * 60; // 15 minutos en segundos

        res.status(200).json({
            success: true,
            message: 'Empresa seleccionada exitosamente',
            user: selectionResult.user,
            expiresIn: expiresIn,
            expiresAt: Date.now() + (expiresIn * 1000)
        });

    } catch (error) {
        console.error('âŒ Error en selecciÃ³n de empresa:', error);

        if (error.message === 'User not found' ||
            error.message === 'Usuario no pertenece a la empresa seleccionada' ||
            error.message === 'Empresa no encontrada') {
            return res.status(401).json({
                success: false,
                message: 'SelecciÃ³n de empresa invÃ¡lida'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

const LoginController = {
    register,
    login,
    logout,
    verifyToken,
    refresh,
    selectCompany
};

export default LoginController;
