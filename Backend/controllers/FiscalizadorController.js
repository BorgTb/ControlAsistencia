import AuthService from '../services/authservice.js';
import NotificacionService from '../services/NotificacionService.js';
import LoginCodigoModel from '../model/LoginCodigoModel.js';
import TipoTurnosModel from '../model/TipoTurnosModel.js';
import EmpresaLugarModel from '../model/EmpresaLugarModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import EstAsignacionesModel from '../model/EstAsignacionesModel.js';
import MarcacionesServices from '../services/MarcacionesServices.js';
import {DateTime} from 'luxon';

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



const obtenerDatosEmpresa = async (req, res) => {
    // esta funcion permite obtener los datos de la empresa seleccionada para poder utilizar los filtros del reporte
    // datos que necesitamos:
    const empresaId = req.params.empresa_id; // ID de la empresa (en un caso real, esto vendría del token o de la sesión)



    const tiposJornada = await TipoTurnosModel.getTiposJornada();
    const lugaresTrabajo = await EmpresaLugarModel.getLugaresByEmpresaId(empresaId);
    const turnos = await TipoTurnosModel.getAllWithDiasByEmpresaId(empresaId);
    const roles = await UsuarioEmpresaModel.obtenerRolesDisponiblesByEmpresaId(empresaId);
    const estAsignaciones = await EstAsignacionesModel.getTrabajadoresByUsuariaId(empresaId);
    const trabajadoresEmpresa = await UsuarioEmpresaModel.getUsuariosByEmpresaId(empresaId);
    const trabajadores = [
        ...estAsignaciones.map(est => ({ ...est, es_est: true })),
        ...trabajadoresEmpresa.map(trabajador => ({ ...trabajador, es_est: false }))
    ].filter(trabajador => trabajador.usuario_rol_global !== 'empleador');
    // departamentos (si aplica) por implementar
    const regiones = lugaresTrabajo.map(lugar => lugar.region).filter((value, index, self) => self.indexOf(value) === index);
    const comunas = lugaresTrabajo.map(lugar => lugar.comuna).filter((value, index, self) => self.indexOf(value) === index);

    const empresaEst = await EstAsignacionesModel.getEmpresaEstByUsuariaId(empresaId);

    

    res.status(200).json({
        success: true,
        tiposJornada: tiposJornada,
        lugaresTrabajo: lugaresTrabajo,
        turnos: turnos,
        roles: roles,
        regiones: regiones,
        comunas: comunas,
        trabajadores: trabajadores,
        empresaEst: empresaEst
    });
}

const obtenerAsistencias = async (req, res) => {
    const empresaId = req.params.empresa_id;

    const estAsignaciones = await EstAsignacionesModel.getTrabajadoresByUsuariaId(empresaId);
    const trabajadoresEmpresa = await UsuarioEmpresaModel.getUsuariosByEmpresaId(empresaId);
    const trabajadores = [
        ...estAsignaciones.map(est => ({ ...est, es_est: true })),
        ...trabajadoresEmpresa.map(trabajador => ({ ...trabajador, es_est: false }))
    ].filter(trabajador => trabajador.usuario_rol_global !== 'empleador');
   // para cada trabajador, obtener sus asistencias agrupadas fecha, 
   
   /*
   Ejemplo de retorno marcaciones
        Marcaciones obtenidas: {
            success: true,
            marcaciones: { '2025-10-16': [ [Object], [Object], [Object], [Object] ] }
        }
   */
  // para cada trabajador se agrupan las marcaciones
  //feccha actual chile
    const fechaInicio = DateTime.now().setZone('America/Santiago').toISODate();
    const fechaFin = fechaInicio; // mismo día por ahora
    const marcacionesAgrupadasPorUsuario = {};
    for (const trabajador of trabajadores) {    
        const marcaciones = await MarcacionesServices.obtenerMarcacionesPorUsuario(trabajador.id);
        marcacionesAgrupadasPorUsuario[trabajador.id] = {
            trabajador: trabajador,
            marcaciones: marcaciones.marcaciones
        };
    }


    console.log('Marcaciones agrupadas por usuario: ', marcacionesAgrupadasPorUsuario);

    res.status(200).json({
        success: true,
        trabajadores: trabajadores,
        marcacionesAgrupadasPorUsuario: marcacionesAgrupadasPorUsuario
    });

}
const FiscalizadorController = {
  solicitarAcceso,
  validarCodigo,
  cerrarSesion,
  obtenerDatosEmpresa,
    obtenerAsistencias
}


export default FiscalizadorController;