import AsistenciaModel from '../models/asistenciaModel.js';

class AsistenciaService {
    // Métodos para manejar la lógica de negocio relacionada con asistencia
    asistenciaModel = new AsistenciaModel();  
   

    async insertarAsistencia(datosAsistencia) {
        return await this.asistenciaModel.insertarAsistencia(datosAsistencia);
    }
    async obtenerUltimoIDNAsistencia() {
        return await this.asistenciaModel.obtenerUltimoIDNAsistencia();
    }
}
export default AsistenciaService;
