import TrabajadoresService from "../services/trabajadores.service.js";
import MarcacionesServices from "../../services/marcaciones.service.js";
import AsistenciaService from "../services/asistencia.service.js";
import AsignacionTurnosModel from "../../model/asignacion-turnos.model.js";
import EmpresaModel from '../../model/empresa.model.js';
import UsuarioEmpresaModel from '../../model/usuario-empresa.model.js';
import { DateTime } from 'luxon';
import ExcelJS from 'exceljs';



const trabajadoresService = new TrabajadoresService();
const asistenciaService = new AsistenciaService();

// 56540 fue el ultimo id de la tabla de control horario para que despues las borres

const diasDict = {
    1: 'Lunes',
    2: 'Martes',
    3: 'MiÃƒÂ©rcoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'SÃƒÂ¡bado',
    7: 'Domingo'
};


class AsistenciaController {

    async validarDiasIncompletos(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const user = req.user;

            console.log('Validando dÃƒÂ­as incompletos para usuario:', user);

            const empresa = await EmpresaModel.getEmpresaById(user.empresa_id);

            if (!empresa) {
                return res.status(404).json({ message: 'Empresa no encontrada' });
            }

            // Obtener trabajadores y marcaciones
            const [trabajadoresActivos, marcaciones] = await Promise.all([
                trabajadoresService.fetchTrabajadoresActivos(empresa.emp_rut),
                MarcacionesServices.obtenerMarcacionesPorRangoFechaEmpresaRut(fechaInicio, fechaFin, empresa.emp_rut)
            ]);

            // Si no hay marcaciones, retornar respuesta indicÃƒÂ¡ndolo
            if (!marcaciones || !marcaciones.data || Object.keys(marcaciones.data).length === 0) {
                return res.status(200).json({
                    success: true,
                    diasIncompletos: [],
                    totalDiasIncompletos: 0,
                    mensaje: 'No se encontraron marcaciones para el perÃƒÂ­odo seleccionado'
                });
            }

            const turnosCache = new Map();
            const diasIncompletos = [];

            for (const [key, value] of Object.entries(marcaciones.data)) {
                const trabajadorData = trabajadoresActivos[key];
                if (!trabajadorData || !trabajadorData[0]) {
                    console.warn(`Trabajador no encontrado para RUT: ${key}`);
                    continue;
                }

                const dataTrabajadorTelegestor = trabajadorData[0];

                for (const [dia, detalles] of Object.entries(value)) {
                    try {
                        // Obtener turnos
                        const usuariosEmpresasUnicos = [...new Set(detalles.map(d => d.usuario_empresa_id))];
                        
                        await Promise.all(usuariosEmpresasUnicos.map(async (usuarioEmpresaId) => {
                            if (!turnosCache.has(usuarioEmpresaId)) {
                                const turno = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(usuarioEmpresaId);
                                turnosCache.set(usuarioEmpresaId, turno);
                            }
                        }));

                        // Enriquecer detalles con datos del turno
                        detalles.forEach(detalle => {
                            const turno = turnosCache.get(detalle.usuario_empresa_id);
                            if (turno && turno.trabaja) {
                                detalle.horario_inicio = turno.hora_inicio;
                                detalle.horario_fin = turno.hora_fin;
                                detalle.horario_colacion_inicio = turno.colacion_inicio;
                                detalle.horario_colacion_fin = turno.colacion_fin;
                            }
                        });

                        // Procesar marcaciones del dÃƒÂ­a
                        const marcacionEntrada = detalles.find(d => d.tipo === 'entrada');
                        const marcacionesSalida = detalles.filter(d => d.tipo === 'salida');
                        const marcacionesColacion = detalles.filter(d => d.tipo === 'colacion');
                        
                        marcacionesColacion.sort((a, b) => a.hora.localeCompare(b.hora));
                        
                        const horaInicioColacion = marcacionesColacion[0]?.hora || null;
                        const horaFinColacion = marcacionesColacion[marcacionesColacion.length - 1]?.hora || null;
                        const colacionInicioTeorica = detalles[0]?.horario_colacion_inicio || null;
                        const colacionFinTeorica = detalles[0]?.horario_colacion_fin || null;

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
                            horario_colacion_inicio: colacionInicioTeorica,
                            horario_colacion_fin: colacionFinTeorica,
                            total_marcaciones: detalles.length
                        };

                        console.log(`Resumen del dÃƒÂ­a ${dia} para trabajador RUT: ${key}`, resumenDia);
                        // Validar si tiene datos incompletos
                        const problemas = [];
                        const advertencias = [];
                        
                        // Validar entrada (OBLIGATORIO)
                        if (!resumenDia.hora_entrada && !resumenDia.horario_inicio) {
                            problemas.push('Sin hora de entrada registrada ni horario asignado');
                        } else if (!resumenDia.hora_entrada && resumenDia.horario_inicio) {
                            problemas.push('Sin marcaciÃƒÂ³n de entrada');
                        }

                        // Validar salida (OBLIGATORIO)
                        if (!resumenDia.hora_salida && !resumenDia.horario_fin) {
                            problemas.push('Sin hora de salida registrada ni horario asignado');
                        } else if (!resumenDia.hora_salida && resumenDia.horario_fin) {
                            problemas.push('Sin marcaciÃƒÂ³n de salida');
                        }

                        // Validar colaciÃƒÂ³n (OPCIONAL - solo advertencia)
                        if (resumenDia.horario_colacion_inicio && resumenDia.horario_colacion_fin) {
                            // Si tiene horario de colaciÃƒÂ³n asignado, verificar marcaciones
                            if (!resumenDia.hora_inicio_colacion || !resumenDia.hora_fin_colacion) {
                                advertencias.push('Sin marcaciÃƒÂ³n de colaciÃƒÂ³n');
                            }
                        }

                        // Si hay problemas CRÃƒÂTICOS (entrada/salida), agregar a la lista de dÃƒÂ­as incompletos
                        if (problemas.length > 0) {
                            diasIncompletos.push({
                                fecha: dia,
                                empleado: `${dataTrabajadorTelegestor.trab_nombre || 'Desconocido'} (RUT: ${key})`,
                                rut: key,
                                tipo: 'TURNO INCOMPLETO',
                                motivo: problemas.join(', '),
                                advertencias: advertencias.length > 0 ? advertencias.join(', ') : null,
                                turnoEsperado: resumenDia.horario_inicio && resumenDia.horario_fin 
                                    ? `${resumenDia.horario_inicio} - ${resumenDia.horario_fin}`
                                    : 'Sin turno asignado',
                                detalles: resumenDia
                            });
                        }

                    } catch (innerError) {
                        console.error(`Error procesando dÃƒÂ­a ${dia} del trabajador ${key}:`, innerError.message);
                    }
                }
            }

            console.log(`ValidaciÃƒÂ³n completada: ${diasIncompletos.length} dÃƒÂ­a(s) incompleto(s) encontrado(s)`);

            res.status(200).json({
                success: true,
                diasIncompletos: diasIncompletos,
                totalDiasIncompletos: diasIncompletos.length,
                mensaje: diasIncompletos.length === 0 
                    ? 'Todos los turnos estÃƒÂ¡n completos' 
                    : `Se encontraron ${diasIncompletos.length} dÃƒÂ­a(s) con turnos incompletos`
            });

        } catch (error) {
            console.error('Error completo:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error al validar dÃƒÂ­as incompletos', 
                error: error.message 
            });
        }
    }

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
            
            // Acumular registros para inserciÃƒÂ³n
            const registrosParaInsertar = [];
            // Para uso futuro: guardar dÃƒÂ­as omitidos por incompletos
            // const diasIncompletosOmitidos = [];

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
                        // Obtener IDs ÃƒÂºnicos de usuario_empresa para evitar consultas duplicadas
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
                                detalle.horario_colacion_inicio = turno.colacion_inicio;
                                detalle.horario_colacion_fin = turno.colacion_fin;
                            }
                        });

                    // Procesar marcaciones del dÃƒÂ­a
                    const marcacionEntrada = detalles.find(d => d.tipo === 'entrada');
                    const marcacionesSalida = detalles.filter(d => d.tipo === 'salida');
                    const marcacionesColacion = detalles.filter(d => d.tipo === 'colacion');
                    
                    // Ordenar colaciones por hora para obtener inicio y fin
                    marcacionesColacion.sort((a, b) => a.hora.localeCompare(b.hora));
                    
                    const horaInicioColacion = marcacionesColacion[0]?.hora || null;
                    const horaFinColacion = marcacionesColacion[marcacionesColacion.length - 1]?.hora || null;
                    const colacionInicioTeorica = detalles[0]?.horario_colacion_inicio || null;
                    const colacionFinTeorica = detalles[0]?.horario_colacion_fin || null;
                    
                    // FunciÃƒÂ³n para convertir fecha + hora a formato SQL
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
                        horario_colacion_inicio: colacionInicioTeorica,
                        colacion_fin: colacionFinTeorica,
                        colacion_inicio_real: horaInicioColacion || colacionInicioTeorica,
                        colacion_fin_real: horaFinColacion || colacionFinTeorica,
                        total_marcaciones: detalles.length
                    };

                    // Omitir dÃƒÂ­as incompletos (sin entrada o sin salida real marcada)
                    const diaIncompleto = !resumenDia.hora_entrada || !resumenDia.hora_salida;
                    if (diaIncompleto) {
                        // diasIncompletosOmitidos.push({
                        //     fecha: dia,
                        //     rut: key,
                        //     motivo: !resumenDia.hora_entrada && !resumenDia.hora_salida
                        //         ? 'Sin entrada y sin salida'
                        //         : (!resumenDia.hora_entrada ? 'Sin entrada' : 'Sin salida')
                        // });
                        continue;
                    }
                    
                    // Acumular registros para inserciÃƒÂ³n posterior
                    const horaEntradaFinal = resumenDia.hora_entrada || resumenDia.horario_inicio;
                    const horaSalidaFinal = resumenDia.hora_salida || resumenDia.horario_fin;
                    
                    // Si hay colaciÃƒÂ³n, insertar DOS registros: antes y despuÃƒÂ©s de colaciÃƒÂ³n
                    if (resumenDia.colacion_inicio_real && resumenDia.colacion_fin_real) {
                        // Primer registro: desde entrada hasta inicio de colaciÃƒÂ³n
                        registrosParaInsertar.push({
                            con_hor_trab_idn: currentIDN++,
                            prov_emp_idn: dataTrabajadorTelegestor.prov_emp_idn,
                            con_hor_trab_hora_desde_a_cumplir: formatoSQL(dia, resumenDia.horario_inicio),
                            con_hor_trab_hora_hasta_a_cumplir: formatoSQL(dia, resumenDia.horario_colacion_inicio),
                            con_hor_trab_desde: formatoSQL(dia, horaEntradaFinal),
                            con_hor_trab_hasta: formatoSQL(dia, resumenDia.colacion_inicio_real)
                        });
                        
                        // Segundo registro: desde fin de colaciÃƒÂ³n hasta salida
                        registrosParaInsertar.push({
                            con_hor_trab_idn: currentIDN++,
                            prov_emp_idn: dataTrabajadorTelegestor.prov_emp_idn,
                            con_hor_trab_hora_desde_a_cumplir: formatoSQL(dia, resumenDia.horario_colacion_inicio),
                            con_hor_trab_hora_hasta_a_cumplir: formatoSQL(dia, resumenDia.horario_fin),
                            con_hor_trab_desde: formatoSQL(dia, resumenDia.colacion_fin_real),
                            con_hor_trab_hasta: formatoSQL(dia, horaSalidaFinal)
                        });
                    } else {
                        // Sin colaciÃƒÂ³n: un solo registro completo
                        registrosParaInsertar.push({
                            con_hor_trab_idn: currentIDN++,
                            prov_emp_idn: dataTrabajadorTelegestor.prov_emp_idn,
                            con_hor_trab_hora_desde_a_cumplir: formatoSQL(dia, resumenDia.horario_inicio),
                            con_hor_trab_hora_hasta_a_cumplir: formatoSQL(dia, resumenDia.horario_fin),
                            con_hor_trab_desde: formatoSQL(dia, horaEntradaFinal),
                            con_hor_trab_hasta: formatoSQL(dia, horaSalidaFinal)
                        });
                    }

                    //console.log(resumenDia);
                    } catch (innerError) {
                        console.error(`Error procesando dÃƒÂ­a ${dia} del trabajador ${key}:`, innerError.message);
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

    async exportarCSV(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const user = req.user;

            const empresa = await EmpresaModel.getEmpresaById(user.empresa_id);

            if (!empresa) {
                return res.status(404).json({ message: 'Empresa no encontrada' });
            }

            // Obtener trabajadores y marcaciones
            const [trabajadoresActivos, marcaciones] = await Promise.all([
                trabajadoresService.fetchTrabajadoresActivos(empresa.emp_rut),
                MarcacionesServices.obtenerMarcacionesPorRangoFechaEmpresaRut(fechaInicio, fechaFin, empresa.emp_rut)
            ]);

            if (!marcaciones || !marcaciones.data || Object.keys(marcaciones.data).length === 0) {
                return res.status(404).json({ message: 'No se encontraron marcaciones para el perÃƒÂ­odo seleccionado' });
            }

            const turnosCache = new Map();
            const registros = [];

            // Procesar datos igual que en getAsistencia
            for (const [key, value] of Object.entries(marcaciones.data)) {
                const trabajadorData = trabajadoresActivos[key];
                if (!trabajadorData || !trabajadorData[0]){
                    console.warn(`Trabajador no encontrado para RUT: ${key}`);
                    const data = await procesarTrabajadorSinTelegestor(key, value);
                    registros.push(...data);
                    continue;
                };

                const dataTrabajador = trabajadorData[0];

                for (const [dia, detalles] of Object.entries(value)) {
                    try {
                        const usuariosEmpresasUnicos = [...new Set(detalles.map(d => d.usuario_empresa_id))];
                        
                        await Promise.all(usuariosEmpresasUnicos.map(async (usuarioEmpresaId) => {
                            if (!turnosCache.has(usuarioEmpresaId)) {
                                const turno = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(usuarioEmpresaId);
                                turnosCache.set(usuarioEmpresaId, turno);
                            }
                        }));

                        detalles.forEach(detalle => {
                            const turno = turnosCache.get(detalle.usuario_empresa_id);
                            if (turno && turno.trabaja) {
                                detalle.horario_inicio = turno.hora_inicio;
                                detalle.horario_fin = turno.hora_fin;
                                detalle.horario_colacion_inicio = turno.colacion_inicio;
                                detalle.horario_colacion_fin = turno.colacion_fin;
                            }
                        });

                        const marcacionEntrada = detalles.find(d => d.tipo === 'entrada');
                        const marcacionesSalida = detalles.filter(d => d.tipo === 'salida');
                        const marcacionesColacion = detalles.filter(d => d.tipo === 'colacion');
                        
                        marcacionesColacion.sort((a, b) => a.hora.localeCompare(b.hora));

                        const horarioInicio = detalles[0]?.horario_inicio || '';
                        const horarioFin = detalles[0]?.horario_fin || '';
                        const horarioColacionInicio = detalles[0]?.horario_colacion_inicio || '';
                        const horarioColacionFin = detalles[0]?.horario_colacion_fin || '';
                        
                        // Marcaciones reales (sin valores por defecto)
                        const horaEntradaReal = marcacionEntrada?.hora || '';
                        const horaSalidaReal = marcacionesSalida[marcacionesSalida.length - 1]?.hora || '';
                        const colacionInicioReal = marcacionesColacion[0]?.hora || '';
                        const colacionFinReal = marcacionesColacion[marcacionesColacion.length - 1]?.hora || '';
                        
                        // Valores con fallback para cÃƒÂ¡lculo de corregidas
                        const horaEntrada = horaEntradaReal || horarioInicio;
                        const horaSalida = horaSalidaReal || horarioFin;
                        const colacionInicio = colacionInicioReal || horarioColacionInicio;
                        const colacionFin = colacionFinReal || horarioColacionFin;

                        // Calcular horas corregidas
                        const entradaCorregida = calcularHoraCorregida(horaEntrada, horarioInicio, 'entrada');
                        const salidaCorregida = calcularHoraCorregida(horaSalida, horarioFin, 'salida');
                        const colacionInicioCorregida = calcularHoraCorregida(colacionInicio, horarioColacionInicio, 'entrada');
                        const colacionFinCorregida = calcularHoraCorregida(colacionFin, horarioColacionFin, 'salida');

                        // Calcular horas trabajadas
                        const horasTrabajadas = calcularHorasTrabajadas(horaEntrada, horaSalida, colacionInicio, colacionFin, horarioColacionFin);

                        registros.push({
                            fecha: dia,
                            rut: key,
                            nombre: dataTrabajador.trab_nombre || 'N/A',
                            hora_entrada: horaEntradaReal,
                            hora_salida: horaSalidaReal,
                            colacion_inicio: colacionInicioReal,
                            colacion_fin: colacionFinReal,
                            entrada_corregida: entradaCorregida,
                            salida_corregida: salidaCorregida,
                            colacion_inicio_corregida: colacionInicioCorregida,
                            colacion_fin_corregida: colacionFinCorregida,
                            horas_trabajadas: horasTrabajadas,
                            horario_inicio: horarioInicio,
                            horario_fin: horarioFin,
                            total_marcaciones: detalles.length
                        });

                    } catch (error) {
                        console.error(`Error procesando dÃƒÂ­a ${dia}:`, error);
                    }
                }
            }

            // Generar CSV
            const headers = ['Fecha', 'RUT', 'Nombre', 'Entrada', 'Entrada Corregida', 'Salida', 'Salida Corregida', 'ColaciÃƒÂ³n Inicio', 'ColaciÃƒÂ³n Inicio Corregida', 'ColaciÃƒÂ³n Fin', 'ColaciÃƒÂ³n Fin Corregida', 'Horas Trabajadas', 'Horario Inicio', 'Horario Fin', 'Total Marcaciones'];
            let csv = headers.join(',') + '\n';

            registros.forEach(registro => {
                csv += [
                    registro.fecha,
                    registro.rut,
                    `"${registro.nombre}"`,
                    registro.hora_entrada,
                    registro.entrada_corregida,
                    registro.hora_salida,
                    registro.salida_corregida,
                    registro.colacion_inicio,
                    registro.colacion_inicio_corregida,
                    registro.colacion_fin,
                    registro.colacion_fin_corregida,
                    registro.horas_trabajadas,
                    registro.horario_inicio,
                    registro.horario_fin,
                    registro.total_marcaciones
                ].join(',') + '\n';
            });

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="asistencia_${fechaInicio}_${fechaFin}.csv"`);
            res.send('\uFEFF' + csv); // BOM para UTF-8

        } catch (error) {
            console.error('Error al exportar CSV:', error);
            res.status(500).json({ message: 'Error al exportar CSV', error: error.message });
        }
    }

    async exportarExcel(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const user = req.user;

            const empresa = await EmpresaModel.getEmpresaById(user.empresa_id);

            if (!empresa) {
                return res.status(404).json({ message: 'Empresa no encontrada' });
            }

            // Obtener trabajadores y marcaciones
            const [trabajadoresActivos, marcaciones] = await Promise.all([
                trabajadoresService.fetchTrabajadoresActivos(empresa.emp_rut),
                MarcacionesServices.obtenerMarcacionesPorRangoFechaEmpresaRut(fechaInicio, fechaFin, empresa.emp_rut)
            ]);

            if (!marcaciones || !marcaciones.data || Object.keys(marcaciones.data).length === 0) {
                return res.status(404).json({ message: 'No se encontraron marcaciones para el perÃƒÂ­odo seleccionado' });
            }

            const turnosCache = new Map();
            const registros = [];

            // Procesar datos
            for (const [key, value] of Object.entries(marcaciones.data)) {

                const trabajadorData = trabajadoresActivos[key];


                if ((!trabajadorData || !trabajadorData[0])){
                    console.warn(`Trabajador no encontrado para RUT: ${key}`);

                    const data = await procesarTrabajadorSinTelegestor(key, value);
                    registros.push(...data);
                    continue;
                }
                    
                    

                const dataTrabajador = trabajadorData[0];

                for (const [dia, detalles] of Object.entries(value)) {
                    try {
                        const usuariosEmpresasUnicos = [...new Set(detalles.map(d => d.usuario_empresa_id))];
                        
                        await Promise.all(usuariosEmpresasUnicos.map(async (usuarioEmpresaId) => {
                            if (!turnosCache.has(usuarioEmpresaId)) {
                                const turno = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(usuarioEmpresaId);
                                turnosCache.set(usuarioEmpresaId, turno);
                            }
                        }));

                        detalles.forEach(detalle => {
                            const turno = turnosCache.get(detalle.usuario_empresa_id);
                            if (turno && turno.trabaja) {
                                detalle.horario_inicio = turno.hora_inicio;
                                detalle.horario_fin = turno.hora_fin;
                                detalle.horario_colacion_inicio = turno.colacion_inicio;
                                detalle.horario_colacion_fin = turno.colacion_fin;
                            }
                        });

                        const marcacionEntrada = detalles.find(d => d.tipo === 'entrada');
                        const marcacionesSalida = detalles.filter(d => d.tipo === 'salida');
                        const marcacionesColacion = detalles.filter(d => d.tipo === 'colacion');
                        
                        marcacionesColacion.sort((a, b) => a.hora.localeCompare(b.hora));

                        const horarioInicio = detalles[0]?.horario_inicio || '';
                        const horarioFin = detalles[0]?.horario_fin || '';
                        const horarioColacionInicio = detalles[0]?.horario_colacion_inicio || '';
                        const horarioColacionFin = detalles[0]?.horario_colacion_fin || '';
                        
                        // Marcaciones reales (sin valores por defecto)
                        const horaEntradaReal = marcacionEntrada?.hora || '';
                        const horaSalidaReal = marcacionesSalida[marcacionesSalida.length - 1]?.hora || '';
                        const colacionInicioReal = marcacionesColacion[0]?.hora || '';
                        const colacionFinReal = marcacionesColacion[marcacionesColacion.length - 1]?.hora || '';
                        
                        // Valores con fallback para cÃƒÂ¡lculo de corregidas
                        const horaEntrada = horaEntradaReal || horarioInicio;
                        const horaSalida = horaSalidaReal || horarioFin;
                        const colacionInicio = colacionInicioReal || horarioColacionInicio;
                        const colacionFin = colacionFinReal || horarioColacionFin;

                        // Calcular horas corregidas
                        const entradaCorregida = calcularHoraCorregida(horaEntrada, horarioInicio, 'entrada');
                        const salidaCorregida = calcularHoraCorregida(horaSalida, horarioFin, 'salida');
                        const colacionInicioCorregida = calcularHoraCorregida(colacionInicio, horarioColacionInicio, 'entrada_colacion');
                        const colacionFinCorregida = calcularHoraCorregida(colacionFin, horarioColacionFin, 'salida');
                        
                        // Calcular horas trabajadas
                        const horasTrabajadas = calcularHorasTrabajadas(horaEntrada, horaSalida, colacionInicio, colacionFin, horarioColacionFin);
                        
                        registros.push({
                            fecha: dia,
                            rut: key,
                            nombre: dataTrabajador.trab_nombre || 'N/A',
                            hora_entrada: horaEntradaReal,
                            hora_salida: horaSalidaReal,
                            colacion_inicio: colacionInicioReal,
                            colacion_fin: colacionFinReal,
                            entrada_corregida: entradaCorregida,
                            salida_corregida: salidaCorregida,
                            colacion_inicio_corregida: colacionInicioCorregida,
                            colacion_fin_corregida: colacionFinCorregida,
                            horas_trabajadas: horasTrabajadas,
                            horario_inicio: horarioInicio,
                            horario_fin: horarioFin,
                            total_marcaciones: detalles.length
                        });

                    } catch (error) {
                        console.error(`Error procesando dÃƒÂ­a ${dia}:`, error);
                    }
                }
            }

            // Crear libro de Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Asistencia');

            // Definir columnas
            worksheet.columns = [
                { header: 'Fecha', key: 'fecha', width: 12 },
                { header: 'RUT', key: 'rut', width: 12 },
                { header: 'Nombre', key: 'nombre', width: 30 },
                { header: 'Entrada', key: 'hora_entrada', width: 10 },
                { header: 'ColaciÃƒÂ³n Inicio', key: 'colacion_inicio', width: 15 },
                { header: 'ColaciÃƒÂ³n Fin', key: 'colacion_fin', width: 15 },
                { header: 'Salida', key: 'hora_salida', width: 10 },
                { header: 'Entrada Corregida', key: 'entrada_corregida', width: 16 },
                { header: 'ColaciÃƒÂ³n Inicio Corregida', key: 'colacion_inicio_corregida', width: 22 },
                { header: 'ColaciÃƒÂ³n Fin Corregida', key: 'colacion_fin_corregida', width: 22 },
                { header: 'Salida Corregida', key: 'salida_corregida', width: 16 },
                { header: 'Horas Trabajadas', key: 'horas_trabajadas', width: 16 },
                { header: 'Horario Inicio', key: 'horario_inicio', width: 15 },
                { header: 'Horario Fin', key: 'horario_fin', width: 15 },
                { header: 'Total Marcaciones', key: 'total_marcaciones', width: 18 }
            ];

            // Estilo del encabezado
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

            // Agregar datos
            registros.forEach(registro => {
                worksheet.addRow(registro);
            });

            // Generar buffer
            const buffer = await workbook.xlsx.writeBuffer();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="asistencia_${fechaInicio}_${fechaFin}.xlsx"`);
            res.send(buffer);

        } catch (error) {
            console.error('Error al exportar Excel:', error);
            res.status(500).json({ message: 'Error al exportar Excel', error: error.message });
        }
    }

    async exportarCSVTrabajador(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const user = req.user;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ message: 'fechaInicio y fechaFin son obligatorias' });
            }

            if (fechaInicio > fechaFin) {
                return res.status(400).json({ message: 'fechaInicio no puede ser mayor a fechaFin' });
            }

            const empresa = await EmpresaModel.getEmpresaById(user.empresa_id);

            if (!empresa) {
                return res.status(404).json({ message: 'Empresa no encontrada' });
            }

            const usuarioEmpresaId = await UsuarioEmpresaModel.getIdByUsuarioIdAndEmpresaId(user.id, user.empresa_id);

            if (!usuarioEmpresaId) {
                return res.status(404).json({ message: 'No se encontró relación activa del trabajador con la empresa' });
            }

            const usuarioEmpresaRows = await UsuarioEmpresaModel.getUsuarioEmpresaById(user.id, user.empresa_id);
            const usuarioEmpresaInfo = usuarioEmpresaRows && usuarioEmpresaRows[0] ? usuarioEmpresaRows[0] : null;

            const marcaciones = await MarcacionesServices.obtenerMarcacionesPorUsuarioYRango(
                usuarioEmpresaId,
                fechaInicio,
                fechaFin
            );

            if (!marcaciones || !marcaciones.data || marcaciones.data.length === 0) {
                return res.status(404).json({ message: 'No se encontraron marcaciones para el período seleccionado' });
            }

            const marcacionesPorFecha = agruparMarcacionesPorFecha(marcaciones.data);
            const registros = await construirRegistrosTrabajador(marcacionesPorFecha, {
                rut: usuarioEmpresaInfo?.usuario_rut || '',
                nombre: construirNombreCompleto(usuarioEmpresaInfo),
                tipoColacionInicioCorregida: 'entrada'
            });

            if (registros.length === 0) {
                return res.status(404).json({ message: 'No se encontraron marcaciones para el período seleccionado' });
            }

            const headers = ['Fecha', 'RUT', 'Nombre', 'Entrada', 'Entrada Corregida', 'Salida', 'Salida Corregida', 'Colación Inicio', 'Colación Inicio Corregida', 'Colación Fin', 'Colación Fin Corregida', 'Horas Trabajadas', 'Horario Inicio', 'Horario Fin', 'Total Marcaciones'];
            let csv = headers.join(',') + '\n';

            registros.forEach(registro => {
                csv += [
                    registro.fecha,
                    registro.rut,
                    `"${registro.nombre}"`,
                    registro.hora_entrada,
                    registro.entrada_corregida,
                    registro.hora_salida,
                    registro.salida_corregida,
                    registro.colacion_inicio,
                    registro.colacion_inicio_corregida,
                    registro.colacion_fin,
                    registro.colacion_fin_corregida,
                    registro.horas_trabajadas,
                    registro.horario_inicio,
                    registro.horario_fin,
                    registro.total_marcaciones
                ].join(',') + '\n';
            });

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="asistencia_${fechaInicio}_${fechaFin}.csv"`);
            res.send('\uFEFF' + csv);

        } catch (error) {
            console.error('Error al exportar CSV del trabajador:', error);
            res.status(500).json({ message: 'Error al exportar CSV del trabajador', error: error.message });
        }
    }

    async exportarExcelTrabajador(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const user = req.user;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ message: 'fechaInicio y fechaFin son obligatorias' });
            }

            if (fechaInicio > fechaFin) {
                return res.status(400).json({ message: 'fechaInicio no puede ser mayor a fechaFin' });
            }

            const empresa = await EmpresaModel.getEmpresaById(user.empresa_id);

            if (!empresa) {
                return res.status(404).json({ message: 'Empresa no encontrada' });
            }

            const usuarioEmpresaId = await UsuarioEmpresaModel.getIdByUsuarioIdAndEmpresaId(user.id, user.empresa_id);

            if (!usuarioEmpresaId) {
                return res.status(404).json({ message: 'No se encontró relación activa del trabajador con la empresa' });
            }

            const usuarioEmpresaRows = await UsuarioEmpresaModel.getUsuarioEmpresaById(user.id, user.empresa_id);
            const usuarioEmpresaInfo = usuarioEmpresaRows && usuarioEmpresaRows[0] ? usuarioEmpresaRows[0] : null;

            const marcaciones = await MarcacionesServices.obtenerMarcacionesPorUsuarioYRango(
                usuarioEmpresaId,
                fechaInicio,
                fechaFin
            );

            if (!marcaciones || !marcaciones.data || marcaciones.data.length === 0) {
                return res.status(404).json({ message: 'No se encontraron marcaciones para el período seleccionado' });
            }

            const marcacionesPorFecha = agruparMarcacionesPorFecha(marcaciones.data);
            const registros = await construirRegistrosTrabajador(marcacionesPorFecha, {
                rut: usuarioEmpresaInfo?.usuario_rut || '',
                nombre: construirNombreCompleto(usuarioEmpresaInfo),
                tipoColacionInicioCorregida: 'entrada_colacion'
            });

            if (registros.length === 0) {
                return res.status(404).json({ message: 'No se encontraron marcaciones para el período seleccionado' });
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Asistencia');

            worksheet.columns = [
                { header: 'Fecha', key: 'fecha', width: 12 },
                { header: 'RUT', key: 'rut', width: 12 },
                { header: 'Nombre', key: 'nombre', width: 30 },
                { header: 'Entrada', key: 'hora_entrada', width: 10 },
                { header: 'Colación Inicio', key: 'colacion_inicio', width: 15 },
                { header: 'Colación Fin', key: 'colacion_fin', width: 15 },
                { header: 'Salida', key: 'hora_salida', width: 10 },
                { header: 'Entrada Corregida', key: 'entrada_corregida', width: 16 },
                { header: 'Colación Inicio Corregida', key: 'colacion_inicio_corregida', width: 22 },
                { header: 'Colación Fin Corregida', key: 'colacion_fin_corregida', width: 22 },
                { header: 'Salida Corregida', key: 'salida_corregida', width: 16 },
                { header: 'Horas Trabajadas', key: 'horas_trabajadas', width: 16 },
                { header: 'Horario Inicio', key: 'horario_inicio', width: 15 },
                { header: 'Horario Fin', key: 'horario_fin', width: 15 },
                { header: 'Total Marcaciones', key: 'total_marcaciones', width: 18 }
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

            registros.forEach(registro => {
                worksheet.addRow(registro);
            });

            const buffer = await workbook.xlsx.writeBuffer();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="asistencia_${fechaInicio}_${fechaFin}.xlsx"`);
            res.send(buffer);

        } catch (error) {
            console.error('Error al exportar Excel del trabajador:', error);
            res.status(500).json({ message: 'Error al exportar Excel del trabajador', error: error.message });
        }
    }

}

function construirNombreCompleto(usuarioEmpresaInfo) {
    if (!usuarioEmpresaInfo) {
        return 'N/A';
    }

    const partes = [
        usuarioEmpresaInfo.usuario_nombre,
        usuarioEmpresaInfo.usuario_apellido_pat,
        usuarioEmpresaInfo.usuario_apellido_mat
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(' ') : 'N/A';
}

function agruparMarcacionesPorFecha(marcaciones) {
    return marcaciones.reduce((acc, marcacion) => {
        const fechaValor = marcacion.fecha instanceof Date
            ? marcacion.fecha.toISOString().split('T')[0]
            : String(marcacion.fecha).split('T')[0];

        if (!acc[fechaValor]) {
            acc[fechaValor] = [];
        }

        acc[fechaValor].push(marcacion);
        return acc;
    }, {});
}

async function construirRegistrosTrabajador(marcacionesPorFecha, trabajadorConfig = {}) {
    const turnosCache = new Map();
    const registros = [];
    const tipoColacionInicioCorregida = trabajadorConfig.tipoColacionInicioCorregida || 'entrada';

    for (const [dia, detalles] of Object.entries(marcacionesPorFecha)) {
        try {
            const usuariosEmpresasUnicos = [...new Set(detalles.map(d => d.usuario_empresa_id))];

            await Promise.all(usuariosEmpresasUnicos.map(async (usuarioEmpresaId) => {
                if (!turnosCache.has(usuarioEmpresaId)) {
                    const turno = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(usuarioEmpresaId);
                    turnosCache.set(usuarioEmpresaId, turno);
                }
            }));

            detalles.forEach(detalle => {
                const turno = turnosCache.get(detalle.usuario_empresa_id);
                if (turno && turno.trabaja) {
                    detalle.horario_inicio = turno.hora_inicio;
                    detalle.horario_fin = turno.hora_fin;
                    detalle.horario_colacion_inicio = turno.colacion_inicio;
                    detalle.horario_colacion_fin = turno.colacion_fin;
                }
            });

            const marcacionEntrada = detalles.find(d => d.tipo === 'entrada');
            const marcacionesSalida = detalles.filter(d => d.tipo === 'salida');
            const marcacionesColacion = detalles.filter(d => d.tipo === 'colacion');

            marcacionesColacion.sort((a, b) => a.hora.localeCompare(b.hora));

            const horarioInicio = detalles[0]?.horario_inicio || '';
            const horarioFin = detalles[0]?.horario_fin || '';
            const horarioColacionInicio = detalles[0]?.horario_colacion_inicio || '';
            const horarioColacionFin = detalles[0]?.horario_colacion_fin || '';

            const horaEntradaReal = marcacionEntrada?.hora || '';
            const horaSalidaReal = marcacionesSalida[marcacionesSalida.length - 1]?.hora || '';
            const colacionInicioReal = marcacionesColacion[0]?.hora || '';
            const colacionFinReal = marcacionesColacion[marcacionesColacion.length - 1]?.hora || '';

            const horaEntrada = horaEntradaReal || horarioInicio;
            const horaSalida = horaSalidaReal || horarioFin;
            const colacionInicio = colacionInicioReal || horarioColacionInicio;
            const colacionFin = colacionFinReal || horarioColacionFin;

            const entradaCorregida = calcularHoraCorregida(horaEntrada, horarioInicio, 'entrada');
            const salidaCorregida = calcularHoraCorregida(horaSalida, horarioFin, 'salida');
            const colacionInicioCorregida = calcularHoraCorregida(colacionInicio, horarioColacionInicio, tipoColacionInicioCorregida);
            const colacionFinCorregida = calcularHoraCorregida(colacionFin, horarioColacionFin, 'salida');

            const horasTrabajadas = calcularHorasTrabajadas(horaEntrada, horaSalida, colacionInicio, colacionFin, horarioColacionFin);

            registros.push({
                fecha: dia,
                rut: trabajadorConfig.rut || '',
                nombre: trabajadorConfig.nombre || 'N/A',
                hora_entrada: horaEntradaReal,
                hora_salida: horaSalidaReal,
                colacion_inicio: colacionInicioReal,
                colacion_fin: colacionFinReal,
                entrada_corregida: entradaCorregida,
                salida_corregida: salidaCorregida,
                colacion_inicio_corregida: colacionInicioCorregida,
                colacion_fin_corregida: colacionFinCorregida,
                horas_trabajadas: horasTrabajadas,
                horario_inicio: horarioInicio,
                horario_fin: horarioFin,
                total_marcaciones: detalles.length
            });

        } catch (error) {
            console.error(`Error procesando día ${dia} para exportación trabajador:`, error);
        }
    }

    return registros;
}

/**
 * Calcula la hora corregida basÃƒÂ¡ndose en el horario teÃƒÂ³rico
 * @param {string} horaMarcada - Hora real de marcaciÃƒÂ³n (formato HH:MM:SS)
 * @param {string} horarioTeorico - Hora teÃƒÂ³rica del turno (formato HH:MM:SS)
 * @param {string} tipo - 'entrada' o 'salida'
 * @returns {string} Hora corregida
 */
function calcularHoraCorregida(horaMarcada, horarioTeorico, tipo) {
    if (!horaMarcada || !horarioTeorico) {
        return horaMarcada || '';
    }

    // Convertir horas a segundos totales para comparar con precisiÃƒÂ³n
    const convertirASegundos = (hora) => {
        const [h, m, s] = hora.split(':').map(Number);
        return h * 3600 + m * 60 + (s || 0);
    };

    const segundosMarcada = convertirASegundos(horaMarcada);
    const segundosTeorico = convertirASegundos(horarioTeorico);

    if (tipo === 'entrada') {
        // Si marca antes del horario de inicio, usar el horario teÃƒÂ³rico
        // Si marca despuÃƒÂ©s, usar la hora marcada
        return segundosMarcada < segundosTeorico ?  horarioTeorico : horaMarcada;


    } else if (tipo === 'entrada_colacion') {
        return segundosMarcada < segundosTeorico ?   horaMarcada : horarioTeorico ;
    } 
    else if (tipo === 'salida') {
        // Si marca despuÃƒÂ©s del horario de fin, usar el horario teÃƒÂ³rico
        // Si marca antes, usar la hora marcada
        return segundosMarcada > segundosTeorico ? horarioTeorico : horaMarcada;
    }

    return horaMarcada;
}

/**
 * Calcula las horas trabajadas totales
 * @param {string} horaEntrada - Hora de entrada
 * @param {string} horaSalida - Hora de salida
 * @param {string} colacionInicio - Hora de inicio de colaciÃƒÂ³n
 * @param {string} colacionFin - Hora de fin de colaciÃƒÂ³n
 * @param {string} horarioColacionFin - Hora teÃƒÂ³rica de fin de colaciÃƒÂ³n
 * @returns {string} Horas trabajadas en formato HH:MM:SS
 */
function calcularHorasTrabajadas(horaEntrada, horaSalida, colacionInicio, colacionFin, horarioColacionFin) {
    if (!horaEntrada || !horaSalida) {
        return '';
    }

    const convertirASegundos = (hora) => {
        if (!hora) return 0;
        const [h, m, s] = hora.split(':').map(Number);
        return h * 3600 + m * 60 + (s || 0);
    };

    const convertirAHora = (segundos) => {
        const h = Math.floor(segundos / 3600);
        const m = Math.floor((segundos % 3600) / 60);
        const s = segundos % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    let segundosEntrada = convertirASegundos(horaEntrada);
    let segundosSalida = convertirASegundos(horaSalida);
    
    // Calcular diferencia total
    let diferenciaTotal = segundosSalida - segundosEntrada;
    
    // Solo restar colaciÃƒÂ³n si se completÃƒÂ³ el tiempo de descanso
    if (colacionInicio && colacionFin && horarioColacionFin) {
        const segundosColacionFin = convertirASegundos(colacionFin);
        const segundosColacionFinTeorico = convertirASegundos(horarioColacionFin);
        
        // Solo restar si terminÃƒÂ³ la colaciÃƒÂ³n en o despuÃƒÂ©s de la hora teÃƒÂ³rica
        if (segundosColacionFin >= segundosColacionFinTeorico) {
            const segundosColacionInicio = convertirASegundos(colacionInicio);
            const tiempoColacion = segundosColacionFin - segundosColacionInicio;
            diferenciaTotal -= tiempoColacion;
        }
    }
    
    return diferenciaTotal > 0 ? convertirAHora(diferenciaTotal) : '';
}

async function procesarTrabajadorSinTelegestor(key,value) {
    // LÃƒÂ³gica para procesar trabajadores sin Telegestor
    const turnosCache = new Map();
    const registros = [];

    for (const [dia, detalles] of Object.entries(value)) {
        try {
            const usuarioEmpresasUnicos = [...new Set(detalles.map(d => d.usuario_empresa_id))];

            await Promise.all(usuarioEmpresasUnicos.map(async (usuarioEmpresaId) => {
                if (!turnosCache.has(usuarioEmpresaId)) {
                    const turno = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(usuarioEmpresaId);
                    turnosCache.set(usuarioEmpresaId, turno);
                }
            }));

            detalles.forEach(detalle => {
                const turno = turnosCache.get(detalle.usuario_empresa_id);
                if (turno && turno.trabaja) {
                    detalle.horario_inicio = turno.hora_inicio;
                    detalle.horario_fin = turno.hora_fin;
                    detalle.horario_colacion_inicio = turno.colacion_inicio;
                    detalle.horario_colacion_fin = turno.colacion_fin;
                }
            });

            const marcacionEntrada = detalles.find(d => d.tipo === 'entrada');
            const marcacionesSalida = detalles.filter(d => d.tipo === 'salida');
            const marcacionesColacion = detalles.filter(d => d.tipo === 'colacion');
            marcacionesColacion.sort((a, b) => a.hora.localeCompare(b.hora));

            const horarioInicio = detalles[0]?.horario_inicio || '';
            const horarioFin = detalles[0]?.horario_fin || '';
            const horarioColacionInicio = detalles[0]?.horario_colacion_inicio || '';
            const horarioColacionFin = detalles[0]?.horario_colacion_fin || '';
            
            // Marcaciones reales (sin valores por defecto)
            const horaEntradaReal = marcacionEntrada?.hora || '';
            const horaSalidaReal = marcacionesSalida[marcacionesSalida.length - 1]?.hora || '';
            const colacionInicioReal = marcacionesColacion[0]?.hora || '';
            const colacionFinReal = marcacionesColacion[marcacionesColacion.length - 1]?.hora || '';
            
            // Valores con fallback para cÃƒÂ¡lculo de corregidas
            const horaEntrada = horaEntradaReal || horarioInicio;
            const horaSalida = horaSalidaReal || horarioFin;
            const colacionInicio = colacionInicioReal || horarioColacionInicio;
            const colacionFin = colacionFinReal || horarioColacionFin;

            // Calcular horas corregidas
            const entradaCorregida = calcularHoraCorregida(horaEntrada, horarioInicio, 'entrada');
            const salidaCorregida = calcularHoraCorregida(horaSalida, horarioFin, 'salida');
            const colacionInicioCorregida = calcularHoraCorregida(colacionInicio, horarioColacionInicio, 'entrada');
            const colacionFinCorregida = calcularHoraCorregida(colacionFin, horarioColacionFin, 'salida');

            // Calcular horas trabajadas
            const horasTrabajadas = calcularHorasTrabajadas(horaEntrada, horaSalida, colacionInicio, colacionFin, horarioColacionFin);

            registros.push({
                fecha: dia,
                rut: key,
                nombre: detalles[0]?.nombre + ' ' + detalles[0]?.apellido_pat + ' ' + detalles[0]?.apellido_mat || 'N/A',
                hora_entrada: horaEntradaReal,
                hora_salida: horaSalidaReal,
                colacion_inicio: colacionInicioReal,
                colacion_fin: colacionFinReal,
                entrada_corregida: entradaCorregida,
                salida_corregida: salidaCorregida,
                colacion_inicio_corregida: colacionInicioCorregida,
                colacion_fin_corregida: colacionFinCorregida,
                horas_trabajadas: horasTrabajadas,
                horario_inicio: horarioInicio,
                horario_fin: horarioFin,
                total_marcaciones: detalles.length
            });
        } catch (error) {
            console.error(`Error procesando dÃƒÂ­a ${dia} del trabajador sin Telegestor ${key}:`, error);
        }
    }
    return registros;

}


export default AsistenciaController;