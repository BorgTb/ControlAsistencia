import AuthService from "../services/authservice.js";
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
        const trabajadores = await UserModel.findAllWorkers();
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

const AdminController = {
    createTrabajador,
    obtenerTrabajadores,
    createTurno,
    obtenerTurnos
};



export default AdminController;