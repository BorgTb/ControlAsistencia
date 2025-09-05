import AuthService from '../services/authservice.js';

// Simulación de base de datos de usuarios (reemplaza con tu DB real)
const users = [];

// Función para obtener usuario por email
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
        
        const loginResult = await AuthService.loginUser(email, password);
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: loginResult.token,
            user: loginResult.user
        });

    } catch (error) {
        if (error.message === 'User not found' || error.message === 'Invalid password' || error.message === 'Worker is not valid') {
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
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // Verify and decode the token to get user info
        const decoded = AuthService.verifyToken(token);
        
        // Optional: You could add token to a blacklist here
        // await TokenBlacklistModel.addToBlacklist(token);
        

        res.status(200).json({ 
            success: true, 
            message: 'Logout successful' 
        });

    } catch (error) {
        // Even if token verification fails, we still consider logout successful
        // This prevents issues if token is already expired or invalid
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

const LoginController = {
    register,
    login,
    logout,
    verifyToken
};

export default LoginController;