import dbServices from '../services/dbService.js';


class AsistenciaModel {
    constructor() {
        this.db = dbServices;
    }
    // Métodos para interactuar con la base de datos relacionados con asistencia

    async insertarAsistencia(datosAsistencia) {
        // Lógica para insertar datos de asistencia en la base de datos
        const query = `INSERT INTO control_horario_trabajador (con_hor_trab_idn, prov_emp_idn, con_hor_trab_hora_desde_a_cumplir, con_hor_trab_hora_hasta_a_cumplir, con_hor_trab_desde, con_hor_trab_hasta, con_hor_trab_desde_fuera_rango, con_hor_trab_hasta_fuera_rango, con_hor_trab_aut_desde, con_hor_trab_aut_hasta, con_hor_trab_desde_ip, con_hor_trab_hasta_ip, con_hor_trab_motivo_desde, con_hor_trab_motivo_hasta) VALUES (?, ?, ?, ?, ?, ?, '2025-12-12 14:58:16.000000', '2025-12-12 14:58:16.000000', '2025-12-12 14:58:16.000000', '2025-12-12 14:58:16.000000', '', '', '', '')`

        const results = await this.db.query(query, [
            datosAsistencia.con_hor_trab_idn,
            datosAsistencia.prov_emp_idn,
            datosAsistencia.con_hor_trab_hora_desde_a_cumplir,
            datosAsistencia.con_hor_trab_hora_hasta_a_cumplir,
            datosAsistencia.con_hor_trab_desde,
            datosAsistencia.con_hor_trab_hasta
        ]);

        console.log('Resultado de la inserción de asistencia:', results);
        return results;
    }

    async obtenerUltimoIDNAsistencia() {
        const query = `SELECT MAX(con_hor_trab_idn) AS ultimo_idn FROM control_horario_trabajador`;
        const results = await this.db.query(query);
        return results[0][0];
    }
}
export default AsistenciaModel;
