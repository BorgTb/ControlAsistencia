import jwt from 'jsonwebtoken';
import bcrypt, { hash } from 'bcrypt';
import dotenv from 'dotenv';
import UserModel from '../model/UserModel.js'; // Import your user model
import EmpresaModel from '../model/EmpresaModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import EmpresaEstModel from '../model/EmpresaEstModel.js';
import AuditoriaModel from '../model/AuditoriaModel.js';
import UsuariosRolesAsignadosModel from '../model/UsuariosRolesAsignadosModel.js';
import RolesSistemaModel from '../model/RolesSistemaModel.js';


dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || '';

// Function to generate JWT (mantiene compatibilidad)
// Se agrega el campo 'rol' al payload del JWT para que el middleware de admin
// pueda verificar si el usuario autenticado tiene permisos de administrador.
// Esto es fundamental para proteger rutas sensibles y de gestión.
const generateToken = (user, empresa_id) => {
    const payload = {
        id: user.id,
        email: user.email,
        empresa_id: empresa_id,
        rol: user.rol // El rol permite al backend saber si el usuario es admin
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
};

// Generar Access Token (corta duración para seguridad)
// NOTA: Cambiado de 5s a 15m para permitir operaciones largas como descargas
// Para testing rápido usar: '2m' (2 minutos)
// Para producción usar: '15m' (15 minutos)
// MULTI-ROL: Solo usa array de roles
const generateAccessToken = (user, empresa_id, roles = []) => {
    const payload = {
        id: user.id,
        email: user.email,
        empresa_id: empresa_id,
        roles: roles, // Array de roles del sistema multi-rol
        type: 'access'
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' }); // 15 minutos (era 5s)
};

// Generar Refresh Token (larga duración para sesiones persistentes)
// SESIÓN PERSISTENTE: El refresh token dura 5 años
// NO se rota, el mismo token se usa durante toda la sesión
// Solo se revoca cuando el usuario hace logout
const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        type: 'refresh'
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '5y' }); // 5 años
};

// Funtion to generate JWT for fiscalizador so only email is needed
const generateTokenForFiscalizador = (email) => {
    const payload = {
        email: email
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
};

// Function to verify JWT token
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded;
    } catch (error) {
        throw error;
    }
};

// Verificar y decodificar Refresh Token
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        throw error;
    }
};

const verificarEst = async (empresa_id) => {
    const empresaEst = await EmpresaEstModel.findByEmpresaId(empresa_id);
    return empresaEst ? true : false;
};

const generarTokenAceptacionCambios = (id) => {
    const payload = { id: id };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '48h' });
};


// Function to register a user (hash password)
// NOTA: El parámetro 'rol' se mantiene solo para compatibilidad con código existente
// pero ya NO se guarda en la BD. Los roles se asignan en usuarios_roles_asignados
const registerUser = async (email, password, nombre, apellido_pat, apellido_mat, rol = 'trabajador', rut, estado = 1) => {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data object (sin campo rol)
    const userData = {
        nombre,
        apellido_pat,
        apellido_mat,
        email,
        password: hashedPassword,
        rut,
        estado
    };

    // Save user to database using UserModel
    const userId = await UserModel.create(userData);

    // Return user without password
    return {
        id: userId,
        nombre,
        apellido_pat,
        apellido_mat,
        email,
        rut,
        estado
    };
};

// Function to login a user - now uses UserModel directly
const loginUser = async (email, password, ip_address = null) => {
    // Use UserModel to find user

    const user = await UserModel.findByEmail(email);



    if (!user) {
        throw new Error('User not found');
    }

    console.log('User found:', user);
    const isPasswordValid = await bcrypt.compare(password, user.password);

   


    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    /**
     * VALIDACIÓN DEL ESTADO DEL USUARIO
     * 
     * Esta validación es fundamental para la seguridad del sistema, ya que verifica
     * que solo usuarios con estado "activo" (estado = 1) puedan iniciar sesión.
     * 
     * ¿Por qué es importante?
     * - Los administradores pueden desactivar usuarios desde /RolAdministracion
     * - Usuarios inactivos (estado = 0) no deben poder acceder al sistema
     * - Esto permite suspender cuentas sin eliminar los datos del usuario
     * 
     * ¿Qué hace?
     * - Si user.estado !== 1 (no es activo), lanza un error
     * - El error se captura en LoginController.js y devuelve "Invalid credentials"
     * - Esto previene que usuarios inactivos accedan al sistema
     * 
     * Valores del campo estado:
     * - 1 = Usuario activo (puede hacer login)
     * - 0 = Usuario inactivo (login bloqueado)
     */
    if (user.estado !== 1) {
        throw new Error('User account is inactive');
    }

    // MULTI-EMPRESA: Obtener todas las empresas del usuario
    const usuarioEmpresas = await UsuarioEmpresaModel.getEmpresasByUsuarioId(user.id);
    console.log('🏢 Empresas del usuario:', usuarioEmpresas);

    // Verificar si el usuario es admin (puede no tener empresas)
    if (user.nombre === 'admin') {
        // Admin no requiere empresa
        const rolesSlugs = ['admin'];
        const token = generateToken(user, null);

        return {
            token,
            empresa_id: null,
            roles: rolesSlugs,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido_pat: user.apellido_pat,
                apellido_mat: user.apellido_mat,
                email: user.email,
                roles: rolesSlugs,
                rut: user.rut,
                estado: user.estado,
                est: false,
                empresa_nombre: null,
                empresa_rut: null,
            }
        };
    }

    // USUARIOS SIN EMPRESA: Permitir login para que puedan ver/aceptar invitaciones
    if (!usuarioEmpresas || usuarioEmpresas.length === 0) {
        console.log('👤 Usuario sin empresas - puede tener invitaciones pendientes');
        
        // Registrar inicio de sesión en auditoría
        try {
            await AuditoriaModel.registrarInicioSesion(user.id, ip_address, 'sin-empresa');
        } catch (auditoriaError) {
            console.error('❌ Error al registrar auditoría:', auditoriaError);
        }

        // Generar token sin empresa_id
        const token = generateToken(user, null);

        return {
            token,
            empresa_id: null,
            roles: ['invitado'], // Rol temporal para usuarios sin empresa
            requiresPendingInvitations: true, // Flag para que el frontend sepa que debe mostrar invitaciones
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido_pat: user.apellido_pat,
                apellido_mat: user.apellido_mat,
                email: user.email,
                roles: ['invitado'],
                rut: user.rut,
                estado: user.estado,
                est: false,
                empresa_nombre: null,
                empresa_rut: null,
            }
        };
    }

    // MULTI-EMPRESA: Si tiene múltiples empresas, retornar lista para selección
    if (usuarioEmpresas.length > 1) {
        console.log('👥 Usuario con múltiples empresas, requiere selección');

        // Registrar inicio de sesión en auditoría (sin empresa específica)
        try {
            await AuditoriaModel.registrarInicioSesion(user.id, ip_address, 'multi-empresa');
        } catch (auditoriaError) {
            console.error('❌ Error al registrar auditoría:', auditoriaError);
        }

        // Retornar lista de empresas para que el usuario seleccione
        return {
            requiresCompanySelection: true,
            companies: usuarioEmpresas.map(ue => ({
                id: ue.empresa_id,
                nombre: ue.empresa_nombre,
                rut: ue.empresa_rut,
                usuario_empresa_id: ue.id
            })),
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido_pat: user.apellido_pat,
                apellido_mat: user.apellido_mat,
                email: user.email,
                rut: user.rut,
                estado: user.estado
            }
        };
    }

    // Usuario con una sola empresa - flujo normal
    const empresaData = usuarioEmpresas[0];
    const empresaId = empresaData.empresa_id;
    const empresaRut = empresaData.empresa_rut;
    const usuarioEmpresaId = empresaData.id;

    console.log('🏢 Usuario con empresa única:', empresaData);

    // MULTI-ROL: Obtener roles asignados del usuario en esta empresa
    let rolesSlugs = [];

    try {
        const rolesAsignados = await UsuariosRolesAsignadosModel.getUserRolesInCompany(user.id, empresaId);
        rolesSlugs = rolesAsignados.map(r => r.rol_slug);
        console.log(`✅ Roles obtenidos de usuarios_roles_asignados:`, rolesSlugs);
    } catch (roleError) {
        console.error('❌ Error al obtener roles del usuario:', roleError);
        // Si no hay roles asignados, usar trabajador por defecto
        rolesSlugs = ['trabajador'];
        console.warn('⚠️ No se encontraron roles, usando trabajador por defecto');
    }


    // Generate token
    const token = generateToken(user, empresaId);



    let est = false;

    // si es empleador verificar si su empresa es est
    if (rolesSlugs.includes('empleador')) {
        est = await verificarEst(empresaId);
    }

    // Obtener información de la empresa
    let empresaInfo = null;
    try {
        console.log('🔍 Empresa RUT para buscar:', empresaRut);
        if (empresaRut) {
            empresaInfo = await EmpresaModel.getEmpresaByRut(empresaRut);
            console.log('🏢 Información de empresa encontrada:', empresaInfo);
        }
    } catch (empresaError) {
        console.error('❌ Error al obtener información de empresa:', empresaError);
        // No bloqueamos el login por errores de empresa
    }

    // Registrar inicio de sesión en auditoría con información completa
    try {
        console.log('📝 Registrando inicio de sesión en auditoría:', {
            usuario_id: user.id,
            usuario_nombre: user.nombre,
            roles_asignados: rolesSlugs,
            ip_address: ip_address,
            fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })
        });

        // Usar el primer rol del array para auditoría (compatibilidad)
        const rolParaAuditoria = rolesSlugs.length > 0 ? rolesSlugs[0] : 'trabajador';
        await AuditoriaModel.registrarInicioSesion(user.id, ip_address, rolParaAuditoria);
        console.log('✅ Auditoría de inicio de sesión registrada exitosamente');
    } catch (auditoriaError) {
        console.error('❌ Error al registrar auditoría de inicio de sesión:', auditoriaError);
        // No bloqueamos el login por errores de auditoría
    }

    // Limpiar RUT de espacios (trim)
    const rutLimpio = empresaRut ? empresaRut.trim() : null;

    // Return both token and user info (without password)
    const responseUser = {
        id: user.id,
        nombre: user.nombre,
        apellido_pat: user.apellido_pat,
        apellido_mat: user.apellido_mat,
        email: user.email,
        roles: rolesSlugs, // Array de roles asignados
        rut: rutLimpio,
        estado: user.estado,
        est: est,
        empresa_nombre: empresaInfo ? empresaInfo.emp_nombre : null,
        empresa_rut: rutLimpio
    };

    console.log('👤 Usuario final que se enviará al frontend:', responseUser);

    return {
        token,
        empresa_id: empresaId, // ← IMPORTANTE: Agregar empresa_id para el access token
        roles: rolesSlugs, // Pasar roles para el access token
        user: {
            id: user.id,
            nombre: user.nombre,
            apellido_pat: user.apellido_pat,
            apellido_mat: user.apellido_mat,
            email: user.email,
            roles: rolesSlugs, // Array de roles asignados
            rut: rutLimpio,
            estado: user.estado,
            est: est,
            empresa_nombre: empresaInfo ? empresaInfo.emp_nombre : null,
            empresa_rut: rutLimpio,
        }
    }
};

// Function to handle company selection for multi-company users
const selectCompany = async (userId, empresaId, ip_address = null) => {
    try {
        // Obtener información del usuario
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verificar que el usuario pertenece a la empresa seleccionada
        const perteneceEmpresa = await UsuarioEmpresaModel.usuarioPerteneceEmpresa(userId, empresaId);
        if (!perteneceEmpresa) {
            throw new Error('Usuario no pertenece a la empresa seleccionada');
        }

        // Obtener información de la relación usuario-empresa
        const usuarioEmpresaId = await UsuarioEmpresaModel.getIdByUsuarioIdAndEmpresaId(userId, empresaId);

        // Obtener información de la empresa
        const empresas = await UsuarioEmpresaModel.getEmpresasByUsuarioId(userId);
        const empresaData = empresas.find(e => e.empresa_id === empresaId);

        if (!empresaData) {
            throw new Error('Empresa no encontrada');
        }

        const empresaRut = empresaData.empresa_rut;

        // Obtener roles del usuario en esta empresa
        let rolesSlugs = [];
        try {
            const rolesAsignados = await UsuariosRolesAsignadosModel.getUserRolesInCompany(userId, empresaId);
            rolesSlugs = rolesAsignados.map(r => r.rol_slug);
            console.log(`✅ Roles en empresa seleccionada:`, rolesSlugs);
        } catch (roleError) {
            console.error('❌ Error al obtener roles:', roleError);
            rolesSlugs = ['trabajador'];
        }

        // Generar token con empresa_id
        const token = generateToken(user, empresaId);

        // Verificar si es EST
        let est = false;
        if (rolesSlugs.includes('empleador')) {
            est = await verificarEst(empresaId);
        }

        // Obtener información completa de la empresa
        let empresaInfo = null;
        try {
            if (empresaRut) {
                empresaInfo = await EmpresaModel.getEmpresaByRut(empresaRut);
            }
        } catch (empresaError) {
            console.error('❌ Error al obtener información de empresa:', empresaError);
        }

        // Registrar selección de empresa en auditoría
        try {
            const rolParaAuditoria = rolesSlugs.length > 0 ? rolesSlugs[0] : 'trabajador';
            await AuditoriaModel.registrarInicioSesion(userId, ip_address, rolParaAuditoria);
            console.log('✅ Auditoría de selección de empresa registrada');
        } catch (auditoriaError) {
            console.error('❌ Error al registrar auditoría:', auditoriaError);
        }

        const rutLimpio = empresaRut ? empresaRut.trim() : null;

        return {
            token,
            empresa_id: empresaId,
            roles: rolesSlugs,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido_pat: user.apellido_pat,
                apellido_mat: user.apellido_mat,
                email: user.email,
                roles: rolesSlugs,
                rut: user.rut,
                estado: user.estado,
                est: est,
                empresa_nombre: empresaInfo ? empresaInfo.emp_nombre : null,
                empresa_rut: rutLimpio,
            }
        };
    } catch (error) {
        console.error('❌ Error en selectCompany:', error);
        throw error;
    }
};

// Function to get user by ID
const getUserById = async (id) => {
    const user = await UserModel.findById(id);
    if (!user) {
        throw new Error('User not found');
    }

    // Return user without password
    return {
        id: user.id,
        nombre: user.nombre,
        apellido_pat: user.apellido_pat,
        apellido_mat: user.apellido_mat,
        email: user.email,
        rol: user.rol,
        rut: user.rut,
        estado: user.estado
    };
};

// Function to get user by email
const getUserByEmail = async (email) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    // Return user without password
    return {
        id: user.id,
        nombre: user.nombre,
        apellido_pat: user.apellido_pat,
        apellido_mat: user.apellido_mat,
        email: user.email,
        rol: user.rol,
        rut: user.rut,
        estado: user.estado
    };
};

// Function to check if the passsword is correct
const isPasswordCorrect = async (userId, password) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return await bcrypt.compare(password, user.password);
};

// Function to update user password
const updateUserPassword = async (userId, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.update(userId, { password: hashedPassword });
}

// Function to generate a random access code
const generateAccessCode = (length = 6) => {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Function to generate temporary access code for user
const generateTemporaryCode = async (email) => {
    // Generate new code
    const code = generateAccessCode();
    const expirationTime = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 días en milisegundos

    return {
        code: code,
        email: email,
        expiresAt: expirationTime,
    };
};

// Función para configurar cookie de autenticación (legacy - mantiene compatibilidad)
const setAuthCookie = (res, token) => {
    res.cookie('authToken', token, {
        httpOnly: true,  // No accesible desde JavaScript del cliente
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'strict', // Protección contra CSRF
        maxAge: 3600000 // 1 hora en milisegundos
    });
};

// Función para limpiar cookie de autenticación (legacy)
const clearAuthCookie = (res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};

// Configurar ambas cookies (access + refresh tokens)
// SESIÓN PERSISTENTE: Refresh token cookie dura 5 años
const setAuthCookies = (res, accessToken, refreshToken) => {
    // Access Token - corta duración, HttpOnly
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutos
    });

    // Refresh Token - larga duración, HttpOnly
    // NO se rota, mismo token durante toda la sesión (hasta logout)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 365 * 24 * 60 * 60 * 1000 // 5 años
    });
};

// Limpiar ambas cookies
const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};

const AuthService = {
    generateToken,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
    registerUser,
    loginUser,
    selectCompany,
    getUserById,
    getUserByEmail,
    isPasswordCorrect,
    updateUserPassword,
    generateAccessCode,
    generateTemporaryCode,
    generateTokenForFiscalizador,
    verificarEst,
    generarTokenAceptacionCambios,
    setAuthCookie,
    clearAuthCookie,
    setAuthCookies,
    clearAuthCookies
};

// Export an object containing the functions
export default AuthService;


