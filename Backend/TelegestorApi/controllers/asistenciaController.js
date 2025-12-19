import TrabajadoresService from "../services/trabajadoresService.js";
import MarcacionesServices from "../../services/MarcacionesServices.js";
import AsistenciaService from "../services/asistenciaService.js";
import AsignacionTurnosModel from "../../model/AsignacionTurnosModel.js";
import EmpresaModel from '../../model/EmpresaModel.js';
import {DateTime} from 'luxon';



const trabajadoresService = new TrabajadoresService();
const asistenciaService = new AsistenciaService();

// 56540 fue el ultimo id de la tabla de control horario para que despues las borres

const diasDict = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
};


class AsistenciaController {
    async getAsistencia(req, res) {
        try {

            const {empresaId, fechaInicio, fechaFin} = req.body;

            const user = req.user; 


            console.log('Usuario autenticado:', user);

            const empresa = await EmpresaModel.getEmpresaById(user.empresa_id);

            if (!empresa) {
                return res.status(404).json({ message: 'Empresa no encontrada' });
            }

            console.log(empresa.emp_rut);
            // Paralelizar consultas iniciales
            const [trabajadoresActivos, marcaciones, ultimoIDN] = await Promise.all([
                trabajadoresService.fetchTrabajadoresActivos(empresa.emp_rut),
                MarcacionesServices.obtenerMarcacionesPorRangoFechaEmpresaRut(fechaInicio, fechaFin, empresa.emp_rut),
                asistenciaService.obtenerUltimoIDNAsistencia()
            ]);


            let currentIDN = ultimoIDN.ultimo_idn + 1;
            
            //console.log('Total de trabajadores en marcaciones:', Object.keys(marcaciones.data || {}).length);
            //console.log('Estructura de trabajadoresActivos:', trabajadoresActivos);
            //console.log('Keys de trabajadoresActivos:', Object.keys(trabajadoresActivos));
            
            // Validar que marcaciones tenga la estructura esperada
            if (!marcaciones || !marcaciones.data) {
                throw new Error('No se obtuvieron marcaciones o la estructura es incorrecta');
            }
            
            // Cache para evitar consultas duplicadas de turnos
            const turnosCache = new Map();
            
            // Acumular registros para inserción
            const registrosParaInsertar = [];

            for (const [key, value] of Object.entries(marcaciones.data)) {
                // Validar que existe el trabajador antes de desestructurar
                const trabajadorData = trabajadoresActivos[key];
                if (!trabajadorData || !trabajadorData[0]) {
                    console.warn(`Trabajador no encontrado para RUT: ${key}`);
                    continue;
                }
                
                const dataTrabajadorTelegestor = trabajadorData[0];
                console.log(`Procesando trabajador RUT: ${key}, ID: ${dataTrabajadorTelegestor.trab_idn}`);
                // a cada marcacion consultar el turno que tenia para se dia 
                // value es un objeto con las marcaciones del trabajador agrupadas por dia 
                for (const [dia, detalles] of Object.entries(value)) {
                    
                    try {
                        // Obtener IDs únicos de usuario_empresa para evitar consultas duplicadas
                        const usuariosEmpresasUnicos = [...new Set(detalles.map(d => d.usuario_empresa_id))];
                        
                        // Consultar turnos solo una vez por usuario_empresa_id
                        await Promise.all(usuariosEmpresasUnicos.map(async (usuarioEmpresaId) => {
                            if (!turnosCache.has(usuarioEmpresaId)) {
                                const turno = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(usuarioEmpresaId);
                                turnosCache.set(usuarioEmpresaId, turno);
                            }
                        }));
                        
                        // Enriquecer detalles con datos del turno desde cache
                        detalles.forEach(detalle => {
                            const turno = turnosCache.get(detalle.usuario_empresa_id);
                            if (turno && turno.trabaja) {
                                detalle.horario_inicio = turno.hora_inicio;
                                detalle.horario_fin = turno.hora_fin;
                                detalle.colacion_inicio = turno.colacion_inicio;
                                detalle.colacion_fin = turno.colacion_fin;
                            }
                        });

                    // Procesar marcaciones del día
                    const marcacionEntrada = detalles.find(d => d.tipo === 'entrada');
                    const marcacionesSalida = detalles.filter(d => d.tipo === 'salida');
                    const marcacionesColacion = detalles.filter(d => d.tipo === 'colacion');
                    
                    // Ordenar colaciones por hora para obtener inicio y fin
                    marcacionesColacion.sort((a, b) => a.hora.localeCompare(b.hora));
                    
                    const horaInicioColacion = marcacionesColacion[0]?.hora || null;
                    const horaFinColacion = marcacionesColacion[marcacionesColacion.length - 1]?.hora || null;
                    const colacionInicioTeorica = detalles[0]?.colacion_inicio || null;
                    const colacionFinTeorica = detalles[0]?.colacion_fin || null;
                    
                    // Función para convertir fecha + hora a formato SQL
                    const formatoSQL = (fecha, hora) => {
                        if (!hora) return '0000-00-00 00:00:00.000000';
                        return `${fecha} ${hora}.000000`;
                    };
                    
                    const resumenDia = {
                        fecha: dia,
                        rut: key,
                        usuario_empresa_id: detalles[0]?.usuario_empresa_id,
                        hora_entrada: marcacionEntrada?.hora || null,
                        hora_inicio_colacion: horaInicioColacion,
                        hora_fin_colacion: horaFinColacion,
                        hora_salida: marcacionesSalida[marcacionesSalida.length - 1]?.hora || null,
                        horario_inicio: detalles[0]?.horario_inicio || null,
                        horario_fin: detalles[0]?.horario_fin || null,
                        colacion_inicio: colacionInicioTeorica,
                        colacion_fin: colacionFinTeorica,
                        colacion_inicio_real: horaInicioColacion || colacionInicioTeorica,
                        colacion_fin_real: horaFinColacion || colacionFinTeorica,
                        total_marcaciones: detalles.length
                    };
                    
                    // Acumular registro para inserción posterior
                    const horaEntradaFinal = resumenDia.hora_entrada || resumenDia.horario_inicio;
                    const horaSalidaFinal = resumenDia.hora_salida || resumenDia.horario_fin;
                    
                    registrosParaInsertar.push({
                        con_hor_trab_idn: currentIDN++,
                        prov_emp_idn: dataTrabajadorTelegestor.prov_emp_idn,
                        con_hor_trab_hora_desde_a_cumplir: formatoSQL(dia, resumenDia.horario_inicio),
                        con_hor_trab_hora_hasta_a_cumplir: formatoSQL(dia, resumenDia.horario_fin),
                        con_hor_trab_desde: formatoSQL(dia, horaEntradaFinal),
                        con_hor_trab_hasta: formatoSQL(dia, horaSalidaFinal)
                    });

                    //console.log(resumenDia);
                    } catch (innerError) {
                        console.error(`Error procesando día ${dia} del trabajador ${key}:`, innerError.message);
                    }
                }
            }

            
            
            // Insertar todos los registros de asistencia
            console.log(`Insertando ${registrosParaInsertar.length} registros de asistencia...`);
            
            const resultados = await Promise.allSettled(
                registrosParaInsertar.map(registro => asistenciaService.insertarAsistencia(registro))
            );
            
            const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
            const fallidos = resultados.filter(r => r.status === 'rejected');
            
            if (fallidos.length > 0) {
                console.error(`${fallidos.length} inserciones fallaron:`, fallidos.map(f => f.reason));
            }
            
            console.log(`Insertados exitosamente: ${exitosos} de ${registrosParaInsertar.length}`);
            
            res.status(200).json({ 
                success: true, 
                message: 'Datos de asistencia procesados e insertados correctamente',
            });
        } catch (error) {
            console.error('Error completo:', error);
            res.status(500).json({ message: 'Error al obtener datos de asistencia', error: error.message, stack: error.stack });
        }
    }

}

export default AsistenciaController;