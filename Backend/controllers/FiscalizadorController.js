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




const FiscalizadorController = {
  solicitarAcceso
}


export default FiscalizadorController;