import dbServices from '../services/dbService.js';


class AsistenciaModel {
    constructor() {
        this.db = dbServices;
    }
    // Métodos para interactuar con la base de datos relacionados con asistencia

    async insertarAsistencia(datosAsistencia) {
        // Lógica para insertar datos de asistencia en la base de datos
        const query = `INSERT INTO control_horario_trabajador()`
    }

    async obtenerUltimoIDNAsistencia() {
        const query = `SELECT MAX(con_hor_trab_idn) AS ultimo_idn FROM control_horario_trabajador`;
        const results = await this.db.query(query);
        return results;
    }
}
export default AsistenciaModel;
