import AuthService from "../services/authservice.js";
import UserModel from "../model/UserModel.js";
import TurnosModel from "../model/TurnosModel.js";
import UsuarioEmpresaModel from "../model/UsuarioEmpresaModel.js";
import ResolucionModel from "../model/usuarios_empresas_resoluciones.js";
import ReporteMarcacionesModel from "../model/ReportesModel.js";
import EmpresaModel from "../model/EmpresaModel.js";
import MarcacionesServices from "../services/MarcacionesServices.js";
import { DateTime } from "luxon";
import ReportesModel from "../model/ReportesModel.js";
import EstAsignacionesModel from "../model/EstAsignacionesModel.js";






const createTrabajador = async (req, res) => {
    try {
        const userData = req.body;
        const USR_PETICION = req.user; // usuario que genera la consulta
        

        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        
        // Verificar si ya existe un usuario con este RUT o email
        const existingUserByRut = await UserModel.findByRut(userData.rut);
        if (existingUserByRut) {
            return res.status(400).json({ 
                success: false, 
                message: "Ya existe una cuenta para este trabajador con el RUT proporcionado" 
            });
        }

        const existingUserByEmail = await UserModel.findByEmail(userData.email);
        if (existingUserByEmail) {
            return res.status(400).json({ 
                success: false, 
                message: "Ya existe una cuenta para este trabajador con el email proporcionado" 
            });
        }
        
        const newUser = await AuthService.registerUser(
            userData.email, 
            userData.password, 
            userData.nombre, 
            userData.apellido_pat,
            userData.apellido_mat,
            userData.rol, 
            userData.rut, 
            userData.estado
        );
        
        // si new user throw error
        if (!newUser) {
            return res.status(400).json({ success: false, message: "Error creando trabajador" });
        }
        
        const newUserEmpresa = await UsuarioEmpresaModel.createUsuarioEmpresa({
            usuario_id: newUser.id,
            empresa_id: empresa.empresa_id,
            fecha_inicio: DateTime.now().setZone("America/Santiago").toISO(),
        });



        if (userData.sistemaExcepcional && userData.sistemaExcepcional === true) {
            // crear resolucion para este usuario empresa
            ResolucionModel.create({
                usuario_empresa_id: newUserEmpresa.id,
                resolucion_numero: userData.numeroResolucion || 'EX-2024-00001',
                resolucion_fecha: userData.fechaResolucion || DateTime.now().setZone("America/Santiago").toISODate()
            });
        }  
            



        res.status(201).json({ success: true, message: "Trabajador creado exitosamente" });
    } catch (error) {
        console.error("Error creating trabajador:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const createTurno = async (req, res) => {
    try {
        const turnoData = req.body;

        // verificar si existe ya un turno 
        const existingTurno = await TurnosModel.obtenerTurnoPorUsuarioYDia(turnoData.usuario_id, turnoData.dia);
        if (existingTurno) {
            return res.status(400).json({ success: false, message: "Ya existe un turno para este trabajador en la fecha seleccionada" });
        }

        const newTurno = await TurnosModel.createTurno(turnoData);
        res.status(201).json({ success: true, message: "Turno creado exitosamente" });
    } catch (error) {
        console.error("Error creating turno:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const obtenerTrabajadores = async (req, res) => {
    try {
        const USR_PETICION = req.user; // usuario que genera la consulta

        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        const trabajadores = await UsuarioEmpresaModel.getUsuariosByRolEnEmpresa(empresa.empresa_id, 'trabajador');

        // trabajadores que son de una est
        const trabajadoresDeEst = await EstAsignacionesModel.getTrabajadoresByUsuariaId(empresa.empresa_id);

        console.log("trabajadoresDeEst:", trabajadoresDeEst);
        console.log("trabajadores:", trabajadores);

        // juntar ambos arrays  y a los trabajadores de est agregarle un campo est = true
        const trabajadoresMap = new Map();

        trabajadores.forEach(trabajador => {
            trabajadoresMap.set(trabajador.id, { ...trabajador, esDeEst: false });
        });
        trabajadoresDeEst.forEach(trabajador => {
            trabajadoresMap.set(trabajador.id, { ...trabajador, esDeEst: true });
        }
        );

        const trabajadoresUnicos = Array.from(trabajadoresMap.values());
        console.log("trabajadoresUnicos:", trabajadoresUnicos);

        res.status(200).json({ success: true, data: trabajadoresUnicos });
    } catch (error) {
        console.error("Error fetching trabajadores:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
const obtenerTurnos = async (req, res) => {
    try {
        const { rut } = req.params;

        const turnos = [];
        // obtener trabajadores
        const trabajadores = await UsuarioEmpresaModel.getUsuariosByEmpresaRut(rut);
        // para cada trabajador obtener sus turnos e incluir información del trabajador

        // agregar trabajadores est
        const trabajadoresDeEst = await EstAsignacionesModel.getTrabajadoresByUsuariaId(req.user.empresa_id);
        

        // agregar trabajadores de est al array de trabajadores si no existen ya
        for (const trabajadorEst of trabajadoresDeEst) {
            if (!trabajadores.find(t => t.id === trabajadorEst.id)) {
                trabajadores.push(trabajadorEst);
            }
        }


        for (const trabajador of trabajadores) {
            const trabajadorTurnos = await TurnosModel.getTurnosByUsuarioId(trabajador.id);
            const turnosConInfoTrabajador = trabajadorTurnos.map(turno => ({
                ...turno,
                trabajador: {
                    id: trabajador.id,
                    nombre: trabajador.usuario_nombre,
                    apellido_pat: trabajador.usuario_apellido_pat,
                    apellido_mat: trabajador.usuario_apellido_mat,
                    rut: trabajador.usuario_rut,
                    iniciales: trabajador.usuario_nombre.charAt(0) + (trabajador.usuario_apellido_pat ? trabajador.usuario_apellido_pat.charAt(0) : '')
                }
            }));
            turnos.push(...turnosConInfoTrabajador);
        }
        
        res.status(200).json({ success: true, data: turnos });
    } catch (error) {
        console.error("Error fetching turnos:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const enrolarTrabajador = async (req, res) => {
    try {
        const { rut, email, password, rol, nombre, apellido_pat, apellido_mat } = req.body;
        
        // Verificar si ya existe un usuario con este RUT o email
        const existingUserByRut = await UserModel.findByRut(rut);
        if (existingUserByRut) {
            return res.status(400).json({ 
            success: false, 
            message: "Ya existe una cuenta para este trabajador con el RUT proporcionado" 
            });
        }

        const existingUserByEmail = await UserModel.findByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({ 
            success: false, 
            message: "Ya existe una cuenta para este trabajador con el email proporcionado" 
            });
        }

        // Crear el usuario
        const newUser = await AuthService.registerUser(email, password, nombre, apellido_pat, apellido_mat, rol, rut);
        
        res.status(201).json({ 
            success: true, 
            message: "Trabajador enrolado exitosamente",
            data: newUser 
        });
    } catch (error) {
        console.error("Error enrolando trabajador:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};

const obtenerReportesMarcaciones = async (req, res) => {
    try {
        const { rut } = req.params;
        const empresa = await EmpresaModel.getEmpresaByRut(rut);
        const reportes = await ReporteMarcacionesModel.findByEmpresaId(empresa.empresa_id);
        // para cada reporte, incluir info de la marcacion
        for (let reporte of reportes) {   
            const marcacion = await MarcacionesServices.obtenerMarcacionPorId(reporte.marcacion_id);
            reporte.nombreTrabajador = marcacion.data.nombre;
            reporte.horaOriginal = marcacion.data.hora;
            reporte.tipoMarcacion = marcacion.data.tipo;
        }


    res.status(200).json({
      success: true,
      data: reportes,
      message: "Reportes de marcaciones obtenidos exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los reportes de marcaciones",
      error: error.message
    });
  }
}


const aprobarCambioMarcacion = async (req, res) => {
    try {
        const { reporteId } = req.params;
        // obtener reporte
        let reporte = await ReporteMarcacionesModel.findById(reporteId);
        if (!reporte) {
            return res.status(404).json({ success: false, message: "Reporte no encontrado" });
        }

        // actualizar marcacion
        //await ReportesModel.aprobar(reporteId);

        if (reporte.fecha_correcta){
            await MarcacionesServices.updateFechaMarcacion(reporte.marcacion_id, reporte.fecha_correcta );
        }

        if (reporte.hora_correcta){
            await MarcacionesServices.updateHoraMarcacion(reporte.marcacion_id, reporte.hora_correcta );
        }

        ReporteMarcacionesModel.aprobar(reporteId);

        const reporteActualizado = await ReportesModel.findById(reporteId);

        console.log("reportes actualizado:",reporteActualizado);


        res.status(200).json({ success: true, message: "Reporte aprobado y marcación actualizada", data: reporteActualizado });
    } catch (error) {
        console.error("Error aprobando reporte de marcación:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

const rechazarCambioMarcacion = async (req, res) => {
    try {
        const { reporteId } = req.params;
        // obtener reporte
        const reporte = await ReporteMarcacionesModel.findById(reporteId);
        if (!reporte) {
            return res.status(404).json({ success: false, message: "Reporte no encontrado" });
        }
        // rechazar reporte
        await ReportesModel.rechazar(reporteId);

        const reporteActualizado = await ReportesModel.findById(reporteId);

        res.status(200).json({ success: true, message: "Reporte rechazado", data: reporteActualizado });
    } catch (error) {
        console.error("Error rechazando reporte de marcación:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};


const AdminController = {
    createTrabajador,
    obtenerTrabajadores,
    enrolarTrabajador,
    createTurno,
    obtenerTurnos,
    obtenerReportesMarcaciones,
    aprobarCambioMarcacion,
    rechazarCambioMarcacion
};



export default AdminController;