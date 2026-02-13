import TrabajadoresModel from '../models/trabajadoresModel.js';

class TrabajadoresService {
    // Métodos para manejar la lógica de negocio relacionada con trabajadores
    trabajadoresModel = new TrabajadoresModel();  
   

    async fetchTrabajadoresActivos(emp_rut = null) {
        return await this.trabajadoresModel.fetchTrabajadoresActivos(emp_rut);
    }

    async fetchHorarioTrabajador(trab_idn = null) {
        return await this.trabajadoresModel.fetchHorarioTrabajador(trab_idn);
    }
}
export default TrabajadoresService;
