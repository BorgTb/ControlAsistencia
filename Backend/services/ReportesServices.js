
import MarcacionesServices from './MarcacionesServices.js'

class ReporteService {
    static instance = null;
    
    constructor() {
        if (ReporteService.instance) {
            return ReporteService.instance;
        }
        ReporteService.instance = this;
    }

    async getReporteAsistentica(empresa) {
        try {
            console.log('Empresa recibida en el servicio:', empresa);
            const marcaciones = await MarcacionesServices.obtenerMarcacionesPorEmpresa(empresa);
            if (marcaciones.success) {
                return marcaciones.data;
            }
        } catch (error) {
            throw new Error('Error al obtener el reporte de asistencia');
        }
    }

}

export default ReporteService;
