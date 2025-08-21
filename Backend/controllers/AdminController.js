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
        const { enrolados } = req.query; // Obtener el parámetro desde query parameters
        
        const trabajadores = await TelegestorService.getCompanyWorkers(rut);

        // para cada trabajador verificar si existe un usuario
        for (const trabajador of trabajadores) {
            const usuario = await UserModel.findByRut(trabajador.prov_rut);
            if (!usuario) {
                // si no existe decir que no tiene cuenta creada en el sistema
                trabajador.cuenta_creada = false;
            } else {
                // si existe, marcar que sí tiene cuenta creada y agregar la data del usuario
                trabajador.cuenta_creada = true;
                trabajador.usuario_data = usuario; // Agregar la data del usuario
            }
        }

        // Filtrar según el parámetro enrolados si se proporciona
        let trabajadoresFiltrados = trabajadores;
        if (enrolados === 'true') {
            trabajadoresFiltrados = trabajadores.filter(trabajador => trabajador.cuenta_creada === true);
        }
        res.status(200).json({ success: true, data: trabajadoresFiltrados });
    } catch (error) {
        console.error("Error fetching trabajadores:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
const obtenerTurnos = async (req, res) => {
    try {
        const { rut } = req.params;
        console.log("Obteniendo turnos para RUT:", rut);

        // Obtener los trabajadores de la compañía
        const trabajadores = await TelegestorService.getCompanyWorkers(rut);

        // Obtener los IDs de los trabajadores desde el UserModel
        const trabajadoresIds = [];
        for (const trabajador of trabajadores) {
            const usuario = await UserModel.findByRut(trabajador.prov_rut);
            if (usuario) {
                trabajadoresIds.push(usuario.id);
            }
        }


        if (trabajadoresIds.length === 0) {
            console.log("No se encontraron trabajadores para el RUT:", rut);
            return res.status(404).json({ success: false, message: "No se encontraron trabajadores" });
        }

        // Obtener los turnos que correspondan a los IDs de los trabajadores
        const turnos = await TurnosModel.getTurnosByUsuarioId(trabajadoresIds);

        // Para cada turno, agregar un atributo que sea trabajador_iniciales basado en el nombre del usuario en UserModel
        for (const turno of turnos) {
            const usuario = await UserModel.findById(turno.usuario_id);
            if (usuario) {
            const nombres = usuario.nombre.split(" ");
            const iniciales = nombres.map(nombre => nombre.charAt(0).toUpperCase()).join("");
            turno.trabajador_iniciales = iniciales;
            } else {
            turno.trabajador_iniciales = "N/A"; // Si no se encuentra el usuario, asignar "N/A"
            }
        }

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
        const newUser = await AuthService.registerUser(email, password, nombre, rol, rut);
        
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