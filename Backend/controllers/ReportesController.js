import MarcacionesModel from "../model/MarcacionesModel.js";


const obtenerReporteAsistencia = async (req, res) => {
    // Lógica para obtener el reporte de asistencia
    const marcaciones = await MarcacionesModel.obtenerTodasLasMarcaciones();

    res.json({ message: 'Reporte de asistencia obtenido exitosamente', data: marcaciones });
};






const ReportesController = {
obtenerReporteAsistencia
}



export default ReportesController;