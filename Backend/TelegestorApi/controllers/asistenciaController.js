import TrabajadoresService from "../services/trabajadoresService.js";
import MarcacionesServices from "../../services/MarcacionesServices.js";
import AsistenciaService from "../services/asistenciaService.js";
import {DateTime} from 'luxon';



const trabajadoresService = new TrabajadoresService();
const asistenciaService = new AsistenciaService();



class AsistenciaController {
    async getAsistencia(req, res) {
        try {
            // Lógica para obtener datos de asistencia
            const trabajadoresActivos = await trabajadoresService.fetchTrabajadoresActivos(76011662);
            const horarioTrabajador = await trabajadoresService.fetchHorarioTrabajador(8239);
            const marcaciones = await MarcacionesServices.obtenerMarcacionesPorRangoFechaEmpresaRut('2025-12-01', '2025-12-31', '76011629');


            for (const [key, value] of Object.entries(marcaciones.data)) {
                console.log('RUT Trabajador:', key);
                for (const [dia, detalles] of Object.entries(value)) {
                    console.log('  Día:', dia);
                    const dataMarcacion = [];
                    for (const detalle of detalles) {
                        // obtener la entrada y salida para el dia
                        dataMarcacion.push({
                            tipo: detalle.tipo,
                            fecha: detalle.fecha,
                            hora: detalle.hora
                        });
                    }

                    const ultimoID = await asistenciaService.obtenerUltimoIDNAsistencia();
                    console.log('  Último ID de Asistencia:', ultimoID.ultimo_idn);

                    

                    
                    const fechaActual = DateTime.now().toISODate(); // Fecha actual en formato 'YYYY-MM-DD'
                    const horaActual = DateTime.now().toFormat('HH:mm:ss'); // Hora actual en formato 'HH:mm:ss'

                    await asistenciaService.insertarAsistencia({
                        con_hor_trab_idn: ultimoID.ultimo_idn + 1,
                        prov_emp_idn: trabajadoresActivos[key][0].prov_emp_idn,
                        con_hor_trab_hora_desde_a_cumplir: DateTime.fromISO('08:00:00').toFormat('HH:mm:ss'),
                        con_hor_trab_hora_hasta_a_cumplir: DateTime.fromISO('17:00:00').toFormat('HH:mm:ss'),
                        con_hor_trab_desde: dataMarcacion.find(m => m.tipo === 'ENTRADA') ? dataMarcacion.find(m => m.tipo === 'ENTRADA').hora : null,
                        con_hor_trab_hasta: dataMarcacion.find(m => m.tipo === 'SALIDA') ? dataMarcacion.find(m => m.tipo === 'SALIDA').hora : null,
                        fecha_actual: fechaActual,
                        hora_actual: horaActual
                    });
                    console.log('  Detalles de Marcaciones:', dataMarcacion);
                    
                }
            }



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