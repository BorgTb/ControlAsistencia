import TelegestorService from "../services/TelegestorService.js";



const obtenerHorariosPorRut = async (req, res) => {
    try {
        const { rut } = req.params;
        const horarios = await TelegestorService.getHorariosEmpresa(rut);
        res.status(200).json({
            success: true,
            data: horarios,
            message: "Horarios obtenidos exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los horarios",
            error: error.message
        });
    }
};






const UserEmpresaController = {
  obtenerHorariosPorRut
};




export default UserEmpresaController;