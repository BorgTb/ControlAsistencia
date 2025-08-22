import MarcacionesModel from "../model/MarcacionesModel.js";
import UserModel from "../model/UserModel.js";
import ReporteService from "../services/ReportesServices.js";




/*
 Controlador para obtener el reporte de asistencia de una empresa
 // ✅ CAMPOS OBLIGATORIOS
                id: marcacion.usuario_id,
                nombre: usuario?.nombre || 'Usuario Desconocido',
                cedula: usuario?.rut || '00000000-0',
                iniciales: iniciales,
                departamento: 'Operaciones', // Default
                entrada: marcacion.entrada || '--:--',
                salida: marcacion.salida || '--:--',
                estado: estado,
                cargo: usuario?.rol || 'trabajador',
                fecha: marcacion.fecha,
                
                // ✅ CAMPOS OPCIONALES
                empresaTransitoria: null,
                hashChecksum: marcacion.hashChecksum,
                
                // ✅ NUEVOS CAMPOS PARA FILTROS AVANZADOS
                tipoJornada: 'Completa',
                turnoEspecifico: 'Mañana',
                lugarTrabajo: 'Oficina Central',
                region: 'Metropolitana',
                establecimiento: 'EST001'
 */
const obtenerReporteAsistencia = async (req, res) => {
    const { empresa } = req.params;
    console.log('Empresa recibida:', empresa);
    const reporteService = new ReporteService();
    try {
         const reporte = await reporteService.getReporteAsistentica(empresa);
         console.log('Reporte de asistencia obtenido:', reporte);

         // Transformar el reporte agregando los campos faltantes con valores por defecto
         const reporteTransformado = reporte.map((marcacion) => ({
              id: marcacion.usuario_id,
              nombre: marcacion.nombre || 'Usuario Desconocido',
              cedula: marcacion.rut || '00000000-0',
              iniciales: marcacion.nombre
                    ? marcacion.nombre.split(' ').map((n) => n[0]).join('').toUpperCase()
                    : 'UD',
              departamento: 'Operaciones', // Default
              entrada: marcacion.tipo === 'entrada' ? marcacion.hora : '--:--',
              salida: marcacion.tipo === 'salida' ? marcacion.hora : '--:--',
              estado: marcacion.tipo === 'entrada' ? 'Presente' : 'Ausente',
              cargo: 'trabajador', // Default
              fecha: marcacion.fecha,
              empresaTransitoria: null, // Default
              hashChecksum: marcacion.hash,
              tipoJornada: 'Completa', // Default
              turnoEspecifico: 'Mañana', // Default
              lugarTrabajo: 'Oficina Central', // Default
              region: 'Metropolitana', // Default
              establecimiento: 'EST001' // Default
         }));

         res.status(200).json(reporteTransformado);
    } catch (error) {
         console.error('Error al obtener reporte de asistencia:', error);
         res.status(500).json({
              message: 'Error interno del servidor',
              error: error.message
         });
    }
};






const ReportesController = {
obtenerReporteAsistencia
}



export default ReportesController;