import AuthService from "../services/authservice.js";




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





const AdminController = {
createTrabajador
};



export default AdminController;