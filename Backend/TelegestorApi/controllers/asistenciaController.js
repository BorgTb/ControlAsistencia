import TrabajadoresService from "../services/trabajadoresService.js";
import MarcacionesServices from "../../services/MarcacionesServices.js";
import {DateTime} from 'luxon';


const trabajadoresService = new TrabajadoresService();



class AsistenciaController {
    async getAsistencia(req, res) {
        try {
            // Lógica para obtener datos de asistencia
            const trabajadoresActivos = await trabajadoresService.fetchTrabajadoresActivos(76011662);
            const horarioTrabajador = await trabajadoresService.fetchHorarioTrabajador(8239);
            const marcaciones = await MarcacionesServices.obtenerMarcacionesPorRangoFechaEmpresaRut('2025-12-01', '2025-12-31', '76011629');
            /*
            for (const [key, value] of Object.entries(trabajadoresActivos)) {
                const marcacionesTrabajador = marcaciones.data[key]; // retorna un json con las marcaciones del trabajador segun su rut agrupadas por dia
                const [data] = value;
                const horario = await trabajadoresService.fetchHorarioTrabajador(data.trab_idn);
                
                if (data.trab_idn === 10410) {
                    for (const [dia, detalles] of Object.entries(marcacionesTrabajador)) {
                        console.log('Día:', dia);
                        console.log('Detalles de Marcaciones:', detalles);

                        // Obtener el día de la semana en formato numérico (1-7)
                        const fechaMarcacion = DateTime.fromISO(dia);
                        const numeroDiaSemana = fechaMarcacion.weekday; // 1 (lunes) a 7 (domingo)

                        const nombreDiaSemana = {
                            1: 'lunes',
                            2: 'martes',
                            3: 'miercoles',
                            4: 'jueves',
                            5: 'viernes',
                            6: 'sábado',
                            7: 'domingo'
                        }[numeroDiaSemana];

                        const horarioDia = horario[nombreDiaSemana] || [];
                        console.log('Horario del día:', horarioDia);

                    }
                }
                // Aquí puedes agregar la lógica para comparar las marcaciones con el horario y determinar asistencias, retrasos, etc.
            }
            */

           
            res.status(200).json( trabajadoresActivos );
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener datos de asistencia', error });
        }
    }

}

export default AsistenciaController;