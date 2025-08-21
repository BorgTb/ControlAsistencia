import AuthService from "../services/authservice.js";
import TelegestorService from "../services/TelegestorService.js";
import UserModel from "../model/UserModel.js";
import TurnosModel from "../model/TurnosModel.js";





const createTrabajador = async (req, res) => {
    try {
        const userData = req.body;
        console.log("Creating trabajador with data:", userData);
        const newUser = await AuthService.registerUser(userData.email, userData.password, userData.nombre, userData.rol, userData.rut, userData.estado);
        
        res.status(201).json({ success: true, message: "Trabajador creado exitosamente" });
    } catch (error) {
        console.error("Error creating trabajador:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const createTurno = async (req, res) => {
    try {
        const turnoData = req.body;
        console.log("Creating turno with data:", turnoData);
        const newTurno = await TurnosModel.createTurno(turnoData);
        res.status(201).json({ success: true, message: "Turno creado exitosamente" });
    } catch (error) {
        console.error("Error creating turno:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const obtenerTrabajadores = async (req, res) => {
    try {
        const { rut } = req.params;
        const trabajadores = await TelegestorService.getCompanyWorkers(rut);

        // para cada trabajador verificar si existe un usuario
        for (const trabajador of trabajadores) {
            const usuario = await UserModel.findByRut(trabajador.prov_rut);
            if (!usuario){
                // si no existe decir que no tiene cuenta creada en el sistema
                trabajador.cuenta_creada = false;
            } else {
                // si existe, marcar que sí tiene cuenta creada
                trabajador.cuenta_creada = true;
            }
        }

        console.log("Trabajadores obtenidos:", trabajadores);
        res.status(200).json({ success: true, data: trabajadores });
    } catch (error) {
        console.error("Error fetching trabajadores:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const obtenerTurnos = async (req, res) => {
    try {
        const turnos = await TurnosModel.getAllTurnos();

        // para cada turno agregar un atributo que sea trabajador_iniciales, que toma las iniciales de trabajador_nombre y las deja en mayuscula ej: Agustin: AG
        turnos.forEach(turno => {
            const nombres = turno.trabajador_nombre.split(" ");
            const iniciales = nombres.map(nombre => nombre.charAt(0).toUpperCase()).join("");
            turno.trabajador_iniciales = iniciales;
        });
        console.log("Turnos obtenidos:", turnos);

        res.status(200).json({ success: true, data: turnos });
    } catch (error) {
        console.error("Error fetching turnos:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const enrolarTrabajador = async (req, res) => {
    try {
        const { rut, email, password, rol, nombre } = req.body;
        console.log("Enrolando trabajador:", { rut, email, rol, nombre });
        
        // Verificar si ya existe un usuario con este RUT
        const existingUser = await UserModel.findByRut(rut);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Ya existe una cuenta para este trabajador" 
            });
        }

        // Crear el usuario
        const newUser = await AuthService.registerUser(email, password, nombre, rol, rut, 'activo');
        
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

const AdminController = {
    createTrabajador,
    obtenerTrabajadores,
    enrolarTrabajador,
    createTurno,
    obtenerTurnos
};



export default AdminController;