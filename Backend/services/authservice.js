import jwt from 'jsonwebtoken';
import bcrypt, { hash } from 'bcrypt';
import dotenv from 'dotenv';
import UserModel from '../model/UserModel.js'; // Import your user model
import EmpresaModel from '../model/EmpresaModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import EmpresaEstModel from '../model/EmpresaEstModel.js';


dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || ''; 

// Function to generate JWT
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
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

const verificarEst = async (empresa_id) => {
    const empresaEst = await EmpresaEstModel.findByEmpresaId(empresa_id);
    return empresaEst ? true : false;
};

// Function to register a user (hash password)
const registerUser = async (email, password, nombre, apellido_pat, apellido_mat, rol = 'trabajador', rut, estado = 1) => {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user data object
    const userData = {
        nombre,
        apellido_pat,
        apellido_mat,
        email,
        password: hashedPassword,
        rol,
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
        rol,
        rut,
        estado
    };
};

// Function to login a user - now uses UserModel directly
const loginUser = async (email, password) => {
    // Use UserModel to find user
    
    const user = await UserModel.findByEmail(email);
        
    

    if (!user) {
        throw new Error('User not found');
    }
    

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    
    // Generate token
    const token = generateToken(user);

    const usuarioEmpresas = await UsuarioEmpresaModel.getUsuarioEmpresaById(user.id); //empresa ala que esta relacionada





    let est = false;

    // si es empleador verificar si su empresa es est
    if(user.rol === 'empleador'){
        est = await verificarEst(usuarioEmpresas.empresa_id);
    }


    // Return both token and user info (without password)
    return {
        token,
        user: {
            id: user.id,
            nombre: user.nombre,
            apellido_pat: user.apellido_pat,
            apellido_mat: user.apellido_mat,
            email: user.email,
            rol: user.rol,
            rut: usuarioEmpresas.empresa_rut,
            estado: user.estado,
            est: est
        }
    };
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

const AuthService = {
    generateToken,
    verifyToken,
    registerUser,
    loginUser,
    getUserById,
    getUserByEmail,
    isPasswordCorrect,
    updateUserPassword,
    generateAccessCode,
    generateTemporaryCode,
    generateTokenForFiscalizador,
};

// Export an object containing the functions
export default AuthService;


