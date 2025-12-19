import TrabajadoresService from "../services/trabajadoresService.js";
import MarcacionesServices from "../../services/MarcacionesServices.js";
import AsistenciaService from "../services/asistenciaService.js";
import AsignacionTurnosModel from "../../model/AsignacionTurnosModel.js";
import EmpresaModel from '../../model/EmpresaModel.js';
import { DateTime } from 'luxon';
import ExcelJS from 'exceljs';



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

    async validarDiasIncompletos(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const user = req.user;

            console.log('Validando días incompletos para usuario:', user);

            const empresa = await EmpresaModel.getEmpresaById(user.empresa_id);

            if (!empresa) {
                return res.status(404).json({ message: 'Empresa no encontrada' });
            }

            // Obtener trabajadores y marcaciones
            const [trabajadoresActivos, marcaciones] = await Promise.all([
                trabajadoresService.fetchTrabajadoresActivos(empresa.emp_rut),
                MarcacionesServices.obtenerMarcacionesPorRangoFechaEmpresaRut(fechaInicio, fechaFin, empresa.emp_rut)
            ]);

            // Si no hay marcaciones, retornar respuesta indicándolo
            if (!marcaciones || !marcaciones.data || Object.keys(marcaciones.data).length === 0) {
                return res.status(200).json({
                    success: true,
                    diasIncompletos: [],
                    totalDiasIncompletos: 0,
                    mensaje: 'No se encontraron marcaciones para el período seleccionado'
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

                        // Procesar marcaciones del día
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

                        console.log(`Resumen del día ${dia} para trabajador RUT: ${key}`, resumenDia);
                        // Validar si tiene datos incompletos
                        const problemas = [];
                        const advertencias = [];
                        
                        // Validar entrada (OBLIGATORIO)
                        if (!resumenDia.hora_entrada && !resumenDia.horario_inicio) {
                            problemas.push('Sin hora de entrada registrada ni horario asignado');
                        } else if (!resumenDia.hora_entrada && resumenDia.horario_inicio) {
                            problemas.push('Sin marcación de entrada');
                        }

                        // Validar salida (OBLIGATORIO)
                        if (!resumenDia.hora_salida && !resumenDia.horario_fin) {
                            problemas.push('Sin hora de salida registrada ni horario asignado');
                        } else if (!resumenDia.hora_salida && resumenDia.horario_fin) {
                            problemas.push('Sin marcación de salida');
                        }

                        // Validar colación (OPCIONAL - solo advertencia)
                        if (resumenDia.horario_colacion_inicio && resumenDia.horario_colacion_fin) {
                            // Si tiene horario de colación asignado, verificar marcaciones
                            if (!resumenDia.hora_inicio_colacion || !resumenDia.hora_fin_colacion) {
                                advertencias.push('Sin marcación de colación');
                            }
                        }

                        // Si hay problemas CRÍTICOS (entrada/salida), agregar a la lista de días incompletos
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
                        console.error(`Error procesando día ${dia} del trabajador ${key}:`, innerError.message);
                    }
                }
            }

            console.log(`Validación completada: ${diasIncompletos.length} día(s) incompleto(s) encontrado(s)`);

            res.status(200).json({
                success: true,
                diasIncompletos: diasIncompletos,
                totalDiasIncompletos: diasIncompletos.length,
                mensaje: diasIncompletos.length === 0 
                    ? 'Todos los turnos están completos' 
                    : `Se encontraron ${diasIncompletos.length} día(s) con turnos incompletos`
            });

        } catch (error) {
            console.error('Error completo:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error al validar días incompletos', 
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
                                detalle.horario_colacion_inicio = turno.colacion_inicio;
                                detalle.horario_colacion_fin = turno.colacion_fin;
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
                    const colacionInicioTeorica = detalles[0]?.horario_colacion_inicio || null;
                    const colacionFinTeorica = detalles[0]?.horario_colacion_fin || null;
                    
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
                        horario_colacion_inicio: colacionInicioTeorica,
                        colacion_fin: colacionFinTeorica,
                        colacion_inicio_real: horaInicioColacion || colacionInicioTeorica,
                        colacion_fin_real: horaFinColacion || colacionFinTeorica,
                        total_marcaciones: detalles.length
                    };
                    
                    // Acumular registros para inserción posterior
                    const horaEntradaFinal = resumenDia.hora_entrada || resumenDia.horario_inicio;
                    const horaSalidaFinal = resumenDia.hora_salida || resumenDia.horario_fin;
                    
                    // Si hay colación, insertar DOS registros: antes y después de colación
                    if (resumenDia.colacion_inicio_real && resumenDia.colacion_fin_real) {
                        // Primer registro: desde entrada hasta inicio de colación
                        registrosParaInsertar.push({
                            con_hor_trab_idn: currentIDN++,
                            prov_emp_idn: dataTrabajadorTelegestor.prov_emp_idn,
                            con_hor_trab_hora_desde_a_cumplir: formatoSQL(dia, resumenDia.horario_inicio),
                            con_hor_trab_hora_hasta_a_cumplir: formatoSQL(dia, resumenDia.horario_colacion_inicio),
                            con_hor_trab_desde: formatoSQL(dia, horaEntradaFinal),
                            con_hor_trab_hasta: formatoSQL(dia, resumenDia.colacion_inicio_real)
                        });
                        
                        // Segundo registro: desde fin de colación hasta salida
                        registrosParaInsertar.push({
                            con_hor_trab_idn: currentIDN++,
                            prov_emp_idn: dataTrabajadorTelegestor.prov_emp_idn,
                            con_hor_trab_hora_desde_a_cumplir: formatoSQL(dia, resumenDia.horario_colacion_inicio),
                            con_hor_trab_hora_hasta_a_cumplir: formatoSQL(dia, resumenDia.horario_fin),
                            con_hor_trab_desde: formatoSQL(dia, resumenDia.colacion_fin_real),
                            con_hor_trab_hasta: formatoSQL(dia, horaSalidaFinal)
                        });
                    } else {
                        // Sin colación: un solo registro completo
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
                return res.status(404).json({ message: 'No se encontraron marcaciones para el período seleccionado' });
            }

            const turnosCache = new Map();
            const registros = [];

            // Procesar datos igual que en getAsistencia
            for (const [key, value] of Object.entries(marcaciones.data)) {
                const trabajadorData = trabajadoresActivos[key];
                if (!trabajadorData || !trabajadorData[0]) continue;

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

                        registros.push({
                            fecha: dia,
                            rut: key,
                            nombre: dataTrabajador.trab_nombre || 'N/A',
                            hora_entrada: marcacionEntrada?.hora || '',
                            hora_salida: marcacionesSalida[marcacionesSalida.length - 1]?.hora || '',
                            colacion_inicio: marcacionesColacion[0]?.hora || '',
                            colacion_fin: marcacionesColacion[marcacionesColacion.length - 1]?.hora || '',
                            horario_inicio: detalles[0]?.horario_inicio || '',
                            horario_fin: detalles[0]?.horario_fin || '',
                            total_marcaciones: detalles.length
                        });

                    } catch (error) {
                        console.error(`Error procesando día ${dia}:`, error);
                    }
                }
            }

            // Generar CSV
            const headers = ['Fecha', 'RUT', 'Nombre', 'Entrada', 'Salida', 'Colación Inicio', 'Colación Fin', 'Horario Inicio', 'Horario Fin', 'Total Marcaciones'];
            let csv = headers.join(',') + '\n';

            registros.forEach(registro => {
                csv += [
                    registro.fecha,
                    registro.rut,
                    `"${registro.nombre}"`,
                    registro.hora_entrada,
                    registro.hora_salida,
                    registro.colacion_inicio,
                    registro.colacion_fin,
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
                return res.status(404).json({ message: 'No se encontraron marcaciones para el período seleccionado' });
            }

            const turnosCache = new Map();
            const registros = [];

            // Procesar datos
            for (const [key, value] of Object.entries(marcaciones.data)) {
                const trabajadorData = trabajadoresActivos[key];
                if (!trabajadorData || !trabajadorData[0]) continue;

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

                        registros.push({
                            fecha: dia,
                            rut: key,
                            nombre: dataTrabajador.trab_nombre || 'N/A',
                            hora_entrada: marcacionEntrada?.hora || '',
                            hora_salida: marcacionesSalida[marcacionesSalida.length - 1]?.hora || '',
                            colacion_inicio: marcacionesColacion[0]?.hora || '',
                            colacion_fin: marcacionesColacion[marcacionesColacion.length - 1]?.hora || '',
                            horario_inicio: detalles[0]?.horario_inicio || '',
                            horario_fin: detalles[0]?.horario_fin || '',
                            total_marcaciones: detalles.length
                        });

                    } catch (error) {
                        console.error(`Error procesando día ${dia}:`, error);
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
                { header: 'Salida', key: 'hora_salida', width: 10 },
                { header: 'Colación Inicio', key: 'colacion_inicio', width: 15 },
                { header: 'Colación Fin', key: 'colacion_fin', width: 15 },
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

}

export default AsistenciaController;