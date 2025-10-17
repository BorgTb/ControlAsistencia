import AuthService from '../services/authservice.js';
import NotificacionService from '../services/NotificacionService.js';
import LoginCodigoModel from '../model/LoginCodigoModel.js';

const solicitarAcceso = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'El campo email es obligatorio' });
        }

        // Invalidar códigos anteriores del usuario
        await LoginCodigoModel.invalidateUserCodes(email);

        // Generate temporary access code
        const codeInfo = await AuthService.generateTemporaryCode(email);

        // Save the code in the database
        const newCode = await LoginCodigoModel.createCodigoTemporal({
            email: email,
            codigo: codeInfo.code,
            expires_at: codeInfo.expiresAt,
        });

        // Send code via email
        const result = await NotificacionService.enviarCodigoTemporal(email, codeInfo.code);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Error al enviar el código temporal',
                error: result.message
            });
        }

        // If everything is successful
        res.status(200).json({
            success: true,
            message: "Código temporal enviado exitosamente",
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const validarCodigo = async (req, res) => {
    try {
        const { email, codigo } = req.body;
        if (!email || !codigo) {
            return res.status(400).json({ message: 'Email y código son obligatorios' });
        }

        // Check if the code is valid
        const validCode = await LoginCodigoModel.findValidCodeByCode(codigo);
        
        if (!validCode) {
            return res.status(400).json({ message: 'Código inválido o expirado' });
        }

        // Verify that the code belongs to the provided email
        if (validCode.email !== email) {
            return res.status(400).json({ message: 'El código no corresponde al email proporcionado' });
        }

        // Mark the code as verified
        const isVerified = await LoginCodigoModel.markAsVerified(validCode.id);
        if (!isVerified) {
            return res.status(500).json({ message: 'Error al verificar el código' });
        }

        

        // Generate JWT token
        const token = AuthService.generateTokenForFiscalizador(email);

        // If everything is successful
        res.status(200).json({
            success: true,
            message: "Código verificado exitosamente",
            token: token,
            user: {
                email: email
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const cerrarSesion = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // Verify and decode the token
        const decoded = AuthService.verifyToken(token);
        
        // Optional: Invalidate all active codes for this user
        if (decoded.email) {
            await LoginCodigoModel.invalidateUserCodes(decoded.email);
        }
        

        res.status(200).json({ 
            success: true, 
            message: 'Sesión cerrada exitosamente' 
        });

    } catch (error) {
        // Even if token verification fails, we still consider logout successful
        res.status(200).json({ 
            success: true, 
            message: 'Sesión cerrada exitosamente' 
        });
    }
}



const obtenerDatosEmpresa = async (empresa_id) => {
    // esta funcion permite obtener los datos de la empresa seleccionada para poder utilizar los filtros del reporte
    
}


const FiscalizadorController = {
  solicitarAcceso,
  validarCodigo,
  cerrarSesion,
    obtenerDatosEmpresa
}


export default FiscalizadorController;