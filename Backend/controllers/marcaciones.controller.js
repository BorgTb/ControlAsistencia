import MarcacionesService from '../services/marcaciones.service.js';
import NotificacionService from '../services/notificacion.service.js';
import TurnosModel from '../model/turnos.model.js';
import UsuarioEmpresaModel from '../model/usuario-empresa.model.js';
import { DateTime } from 'luxon'
import AuthService from '../services/auth.service.js';
import ReporteMarcionesModel from '../model/reportes.model.js';
import ConfigToleranciaModel from '../model/config-tolerancias.model.js';
import EstAsignacionesModel from '../model/est-asignaciones.model.js';
import AsignacionTurnosModel from '../model/asignacion-turnos.model.js';
import TipoTurnosModel from '../model/tipo-turnos.model.js';
import JustificacionesModel from '../model/justificaciones.model.js';
import HorasExtrasModel from '../model/horas-extras.model.js';
import PreferenciasCompensacionModel from '../model/preferencias-compensacion.model.js';




function calcularDiferenciaHoras(hora1, hora2) {
    // FunciÃƒÂ³n auxiliar para convertir hh:mm:ss a segundos totales
    function horaASegundos(horaStr) {
        // Validar formato hh:mm:ss
        const regex = /^(\d{2}):(\d{2}):(\d{2})$/;
        const match = horaStr.match(regex);

        if (!match) {
            throw new Error('El formato debe ser hh:mm:ss');
        }

        const horas = parseInt(match[1]);
        const minutos = parseInt(match[2]);
        const segundos = parseInt(match[3]);

        // Validar rangos
        if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59 || segundos < 0 || segundos > 59) {
            throw new Error('Hora invÃƒÂ¡lida');
        }

        return horas * 3600 + minutos * 60 + segundos;
    }

    // FunciÃƒÂ³n auxiliar para convertir segundos a formato hh:mm:ss
    function segundosAHora(segundosTotales) {
        const horas = Math.floor(Math.abs(segundosTotales) / 3600);
        const minutos = Math.floor((Math.abs(segundosTotales) % 3600) / 60);
        const segundos = Math.abs(segundosTotales) % 60;

        const signo = segundosTotales < 0 ? '-' : '';

        return {
            formato: signo + String(horas).padStart(2, '0') + ':' +
                String(minutos).padStart(2, '0') + ':' +
                String(segundos).padStart(2, '0'),
            horas: horas,
            minutos: minutos,
            segundos: segundos,
            totalSegundos: segundosTotales,
            esNegativo: segundosTotales < 0
        };
    }

    try {
        const segundos1 = horaASegundos(hora1);
        const segundos2 = horaASegundos(hora2);
        const diferencia = segundos2 - segundos1;

        return segundosAHora(diferencia);
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Calcula las horas extras en base a la hora de salida y la configuraciÃƒÂ³n de tolerancias
 * @param {string} horaSalida - Hora de salida real (HH:mm:ss)
 * @param {string} horaFinTurno - Hora de fin del turno (HH:mm:ss)
 * @param {number} toleranciaSalida - Tolerancia en minutos para la salida
 * @returns {Object|null} - Objeto con hora_inicio y hora_fin de las horas extras o null si no hay
 */
function calcularHorasExtras(horaSalida, horaFinTurno, toleranciaSalida = 0) {
    // FunciÃƒÂ³n auxiliar para convertir hh:mm:ss a minutos totales
    function horaAMinutos(horaStr) {
        const [horas, minutos, segundos = 0] = horaStr.split(':').map(Number);
        return horas * 60 + minutos + Math.floor(segundos / 60);
    }

    // FunciÃƒÂ³n auxiliar para convertir minutos a formato hh:mm:ss
    function minutosAHora(minutosTotales) {
        const horas = Math.floor(minutosTotales / 60);
        const minutos = minutosTotales % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
    }

    try {
        const salidaEnMinutos = horaAMinutos(horaSalida);
        const finTurnoEnMinutos = horaAMinutos(horaFinTurno);

        // Calcular el fin del turno con tolerancia
        const finTurnoConTolerancia = finTurnoEnMinutos + toleranciaSalida; //esto se debe acmbiar revisar logica proximanete

        // Si la salida es despuÃƒÂ©s del fin del turno + tolerancia, hay horas extras
        if (salidaEnMinutos > finTurnoConTolerancia) {
            const horaInicioExtras = minutosAHora(finTurnoConTolerancia);
            const horaFinExtras = horaSalida;

            return {
                hora_inicio: horaInicioExtras,
                hora_fin: horaFinExtras,
                minutos_extras: salidaEnMinutos - finTurnoConTolerancia
            };
        }

        return null;
    } catch (error) {
        console.error('Error calculando horas extras:', error);
        return null;
    }
}





// FunciÃƒÂ³n genÃƒÂ©rica para registrar marcaciones (entrada/salida/colacion)
const registrarMarcacion = async (req, res) => {
    try {
        const { geo_lat, geo_lon, location_quality, ip_cliente, domicilio_prestacion, tipo } = req.body;
        const usuario_id = req.user?.id;

        // Validar tipo de marcaciÃƒÂ³n
        if (!['entrada', 'salida', 'colacion'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de marcaciÃƒÂ³n no vÃƒÂ¡lido. Debe ser "entrada", "salida" o "colacion".'
            });
        }

        if (!usuario_id || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: `Faltan datos requeridos para registrar la ${tipo}.`
            });
        }

        // location_quality es requerido solo para entrada y salida
        if (['entrada', 'salida'].includes(tipo) && !location_quality) {
            return res.status(400).json({
                success: false,
                message: `El parÃƒÂ¡metro location_quality es requerido para registrar la ${tipo}.`
            });
        }

        const [usuarioEmpresa] = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id, req.user.empresa_id);
        if (!usuarioEmpresa) {
            return res.status(404).json({
                success: false,
                message: 'No se encontrÃƒÂ³ la informaciÃƒÂ³n de la empresa del usuario.'
            });
        }

        const fechaHoy = DateTime.now().setZone('America/Santiago').toISODate();
        const turno = await TurnosModel.obtenerTurnoPorUsuarioYFecha(usuarioEmpresa.id, fechaHoy);

        if (!turno) {
            return res.status(404).json({
                success: false,
                message: 'No se encontrÃƒÂ³ un turno asociado al usuario.'
            });
        }

        const horaActual = DateTime.now().setZone('America/Santiago').toFormat('HH:mm:ss');

        // ValidaciÃƒÂ³n de horario solo para entrada
        if (tipo === 'entrada') {
            // verifica si turno.hora_fin es menor que turno.hora_inicio, si es asi significa que el turno termina al dia siguiente
            if (turno.hora_fin < turno.hora_inicio) {
                // Si es asÃƒÂ­, la hora actual debe ser mayor que turno.hora_inicio
                if (horaActual < turno.hora_inicio) {
                    return res.status(400).json({
                        success: false,
                        message: 'No se puede registrar la entrada fuera del horario del turno.'
                    });
                }
            } else if (horaActual > turno.hora_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede registrar la entrada fuera del horario del turno.'
                });
            }
        }

        // ValidaciÃƒÂ³n especÃƒÂ­fica para colaciÃƒÂ³n
        if (tipo === 'colacion') {
            const tieneColacionActiva = await MarcacionesService.verificarColacionActiva(usuarioEmpresa.id);

            // Si no tiene colaciÃƒÂ³n activa, estÃƒÂ¡ iniciando colaciÃƒÂ³n
            if (!tieneColacionActiva) {
                // Validar que estÃƒÂ© dentro del horario de colaciÃƒÂ³n del turno
                if (turno.colacion_inicio && turno.colacion_fin) {
                    // TODO: Agregar validaciÃƒÂ³n de horario de colaciÃƒÂ³n
                    console.log('Iniciando colaciÃƒÂ³n dentro del horario permitido');
                }
            } else {
                // Si tiene colaciÃƒÂ³n activa, estÃƒÂ¡ terminando colaciÃƒÂ³n
                console.log('Terminando colaciÃƒÂ³n');
            }
        }



        const result = await MarcacionesService.registrarMarcacion(
            usuarioEmpresa.id, tipo, geo_lat, geo_lon, ip_cliente
        );

        if (!result.success) {
            // Si es un duplicado, retornar cÃƒÂ³digo 409 (Conflict)
            if (result.isDuplicate) {
                return res.status(409).json(result);
            }
            // Otros errores retornan 500
            return res.status(500).json(result);
        }

        const marcacion = await MarcacionesService.obtenerMarcacionPorId(result.data.id);
        if (!marcacion) {
            return res.status(404).json({
                success: false,
                message: 'No se encontrÃƒÂ³ la marcaciÃƒÂ³n registrada.'
            });
        }

        // Calcular diferencia de tiempo con respecto al turno (solo para entrada/salida)
        if (['entrada', 'salida'].includes(tipo)) {
            const horaReferencia = tipo === 'entrada' ? turno.hora_inicio : turno.hora_fin;
            const diferencia = calcularDiferenciaHoras(horaReferencia, marcacion.data.hora);

            if (!diferencia.esNegativo && diferencia.totalSegundos > 0) {
                result.tarde = true;
                result.diferencia = diferencia.formato;
            }
        }

        // LÃƒÂ³gica especÃƒÂ­fica para entrada (lugar y domicilio)
        let lugar = null;
        if (tipo === 'entrada') {
            lugar = await UsuarioEmpresaModel.obtenerEmpresaLugarAproximado(result.data.id, usuarioEmpresa.empresa_id);

            if (domicilio_prestacion) {
                await MarcacionesService.agregarDomicilioPrestacion(result.data.id, domicilio_prestacion);
                lugar = null; // si se agrega un domicilio de prestaciÃƒÂ³n, no es necesario enviar el lugar aproximado
            } else if (lugar && lugar.lugar_id) {
                MarcacionesService.agregarLugarMarcacion(result.data.id, lugar.lugar_id);
            }
        }

        // LÃƒÂ³gica especÃƒÂ­fica para salida (calcular horas extras)
        if (tipo === 'salida') {
            try {
                // Obtener configuraciÃƒÂ³n de tolerancias de la empresa
                const configTolerancia = await ConfigToleranciaModel.findByEmpresaId(usuarioEmpresa.empresa_id);
                const toleranciaSalida = configTolerancia ? configTolerancia.tolerancia_salida : 0;

                // Calcular si hay horas extras
                const horasExtras = calcularHorasExtras(marcacion.data.hora, turno.hora_fin, toleranciaSalida);

                if (horasExtras) {
                    console.log('Ã°Å¸â€¢Â Detectadas horas extras:', horasExtras);

                    // Obtener la preferencia de compensaciÃƒÂ³n activa del trabajador
                    const preferencia = await PreferenciasCompensacionModel.obtenerPorTrabajador(usuarioEmpresa.id);

                    // Crear registro de horas extras
                    const horaExtraData = {
                        usuario_empresa_id: usuarioEmpresa.id,
                        marcacion_id: result.data.id,
                        fecha: fechaHoy,
                        hora_inicio: horasExtras.hora_inicio,
                        hora_fin: horasExtras.hora_fin,
                        estado: 'PENDIENTE',
                        motivo: `Horas extras por salida tardÃƒÂ­a. Exceso de ${horasExtras.minutos_extras} minutos sobre la tolerancia de ${toleranciaSalida} minutos.`,
                        id_preferencia: preferencia ? preferencia.id_preferencia : null
                    };

                    // Crear la hora extra de forma asÃƒÂ­ncrona para no bloquear la respuesta
                    HorasExtrasModel.createHoraExtra(horaExtraData)
                        .then(horaExtraCreada => {
                            if (horaExtraCreada) {
                                console.log('Ã¢Å“â€¦ Hora extra creada exitosamente:', horaExtraCreada.id);
                                result.horas_extras_detectadas = {
                                    id: horaExtraCreada.id,
                                    minutos: horasExtras.minutos_extras,
                                    hora_inicio: horasExtras.hora_inicio,
                                    hora_fin: horasExtras.hora_fin
                                };
                            }
                        })
                        .catch(error => {
                            console.error('Ã¢ÂÅ’ Error creando hora extra:', error);
                        });

                    // Agregar informaciÃƒÂ³n de horas extras a la respuesta
                    result.horas_extras_detectadas = {
                        minutos: horasExtras.minutos_extras,
                        hora_inicio: horasExtras.hora_inicio,
                        hora_fin: horasExtras.hora_fin,
                        estado: 'PENDIENTE'
                    };
                }
            } catch (error) {
                console.error('Error procesando horas extras:', error);
                // No interrumpir el flujo principal si hay error en horas extras
            }
        }

        // Procesar notificaciÃƒÂ³n de forma asÃƒÂ­ncrona (no bloquea la respuesta)
        const notificationArgs = tipo === 'entrada'
            ? [usuario_id, result.data.id, usuarioEmpresa, lugar, domicilio_prestacion]
            : [usuario_id, result.data.id, usuarioEmpresa];

        NotificacionService.procesarNotificacionMarcacion(...notificationArgs)
            .catch(error => console.error(`Error en notificaciÃƒÂ³n de ${tipo}:`, error));

        return res.status(200).json(result);

    } catch (error) {
        console.error(`Error en registrar${tipo.charAt(0).toUpperCase() + tipo.slice(1)}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Wrapper functions para mantener compatibilidad con las rutas existentes
const registrarEntrada = async (req, res) => {
    req.body.tipo = 'entrada';
    return await registrarMarcacion(req, res);
};

const registrarSalida = async (req, res) => {
    req.body.tipo = 'salida';
    return await registrarMarcacion(req, res);
};

const registrarColacion = async (req, res) => {
    req.body.tipo = 'colacion';
    return await registrarMarcacion(req, res);
};

const registrarTerminoColacion = async (req, res) => {
    req.body.tipo = 'colacion';
    return await registrarMarcacion(req, res);
};

const obtenerMarcacionesPorUsuario = async (req, res) => {
    try {
        const usuario_id = req.user?.id;
        console.log(req.user);
        const fechaActual = DateTime.now().setZone('America/Santiago');
        const fecha = req.query.fecha || fechaActual.toISODate();

        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no identificado'
            });
        }
        const [userEmpresa] = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id, req.user.empresa_id);
        const result = await MarcacionesService.obtenerMarcacionesPorUsuario(userEmpresa.id, fecha);
        // si tiene entrada y salida, devolver que 

        console.log(userEmpresa);

        // si tiene turno nocturno buscar las marcaciones del dia anterior 
        //fecha anterior
        const fechaAnterior = fechaActual.minus({ days: 1 }).toISODate();
        const turno = await TurnosModel.obtenerTurnoPorUsuarioYFecha(userEmpresa.id, fecha);
        console.log(fecha);
        if (turno.tipo_jornada_nombre === 'Nocturna') {
            const resultAnterior = await MarcacionesService.obtenerMarcacionesPorUsuario(userEmpresa.id, fechaAnterior);
            return res.status(200).json(resultAnterior);
        }


        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }

    } catch (error) {
        console.error('Error en obtenerMarcacionesPorUsuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const obtenerHorarioHoy = async (req, res) => {
    try {
        const { user } = req;
        const usuario_id = user.id;
        // obtener usuario-empresa
        const [usuarioEmpresa] = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id, req.user.empresa_id);
        console.log(usuarioEmpresa);    
        if (!usuarioEmpresa) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no pertenece a ninguna empresa'
            });
        }

        //Obtener fecha actual en zona horaria de Chile
        const fechaHoy = DateTime.now().setZone('America/Santiago').toISODate();


        // obtener turno asignado para el usuario en la fecha actual
        const turno = await TurnosModel.obtenerTurnoPorUsuarioYFecha(usuarioEmpresa.id, fechaHoy);

        if (!turno) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No hay horario asignado para hoy'
            });
        }

        // retornar el turno que le corresponde hoy
        console.log('Turno encontrado para hoy:', turno);

        return res.status(200).json({
            success: true,
            data: {
                tipo: turno.tipo_turno_nombre,
                inicio: turno.hora_inicio,
                fin: turno.hora_fin,
                fecha_inicio: turno.fecha_inicio,
                fecha_fin: turno.fecha_fin,
                colacion_inicio: turno.colacion_inicio,
                colacion_fin: turno.colacion_fin,
                dias_trabajo: turno.dias_trabajo,
                dias_descanso: turno.dias_descanso,
                tipo_jornada_nombre: turno.tipo_jornada_nombre
            },
            message: 'Horario obtenido correctamente'
        });

    } catch (error) {
        console.error('Error en obtenerHorarioHoy:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const obtenerTodasLasMarcaciones = async (req, res) => {
    try {
        const result = await MarcacionesService.obtenerTodasLasMarcaciones();

        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error en obtenerTodasLasMarcaciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const obtenerMarcacionesPorFecha = async (req, res) => {
    try {
        const { rutEmpresa, fecha } = req.params;

        if (!fecha) {
            return res.status(400).json({
                success: false,
                message: 'La fecha es requerida'
            });
        }

        const result = await MarcacionesService.obtenerMarcacionesPorFechaYEmpresa(rutEmpresa, fecha);

        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error en obtenerMarcacionesPorFecha:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const obtenerMarcacionesPorEmpresa = async (req, res) => {
    try {
        const { rutEmpresa } = req.params;

        if (!rutEmpresa) {
            return res.status(400).json({
                success: false,
                message: 'El RUT de la empresa es requerido'
            });
        }

        const result = await MarcacionesService.obtenerMarcacionesPorEmpresa(req.user.empresa_id);
        console.log(result);
        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error en obtenerMarcacionesPorEmpresa:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const obtenerMarcacionPorUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaInicio, fechaFin } = req.query;

        const userEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(id,req.user.empresa_id);
       


        // se podria retornar por fecha igual en caso cuando existan muchas y mejoras a futuro
        const result = await MarcacionesService.obtenerMarcacionesPorUsuario(userEmpresa.id);

    

        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error en obtenerMarcacionPorUserId:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const modificarMarcacionPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, hora, tipo, motivo, usuario_id } = req.body;
        const USR_PETICION = req.user; // usuario que genera la solicitud

        console.log('Ã°Å¸â€â€ž Iniciando modificaciÃƒÂ³n de marcaciÃƒÂ³n:', {
            marcacionId: id,
            fecha,
            hora,
            tipo,
            motivo,
            usuario_id,
            solicitadoPor: USR_PETICION.id
        });

        // Validar datos requeridos
        if (!fecha || !hora || !tipo || !motivo || !usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos: fecha, hora, tipo, motivo y usuario_id son obligatorios'
            });
        }

        // Obtener la marcaciÃƒÂ³n original antes de modificarla
        const marcacionOriginal = await MarcacionesService.obtenerMarcacionPorId(id);
        if (!marcacionOriginal || !marcacionOriginal.success) {
            return res.status(404).json({
                success: false,
                message: 'MarcaciÃƒÂ³n no encontrada'
            });
        }

        console.log('Ã°Å¸â€œâ€¹ MarcaciÃƒÂ³n original encontrada:', marcacionOriginal.data);

        // Obtener informaciÃƒÂ³n del usuario empresas (trabajador)
        const usuarioEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id);
        if (!usuarioEmpresa) {
            return res.status(404).json({
                success: false,
                message: 'Usuario empresa no encontrado'
            });
        }

        console.log('Ã°Å¸â€˜Â¤ Usuario empresa encontrado:', usuarioEmpresa);

        // Verificar que el usuario solicitante tiene permisos para modificar marcaciones de este trabajador
        const empresasSolicitante = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        if (!empresasSolicitante || empresasSolicitante.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no tiene empresas asignadas"
            });
        }
        const empresaSolicitante = empresasSolicitante[0];
        if (empresaSolicitante.empresa_id !== usuarioEmpresa.empresa_id) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para modificar marcaciones de este trabajador'
            });
        }

        // Crear reporte de solicitud de modificaciÃƒÂ³n
        const newReporteId = await ReporteMarcionesModel.createPorConfirmar({
            marcacion_id: marcacionOriginal.data.id,
            usuario_id: usuarioEmpresa.id,
            tipo: 'modificar',
            tipo_problema: "ModificaciÃƒÂ³n de MarcaciÃƒÂ³n",
            descripcion: motivo,
            fecha_correcta: fecha,
            hora_correcta: hora,
            tipo_marcacion_correcta: tipo
        });

        console.log('Ã°Å¸â€œÂ Reporte de modificaciÃƒÂ³n creado con ID:', newReporteId);

        // Enviar notificaciÃƒÂ³n por correo de forma asÃƒÂ­ncrona
        NotificacionService.procesarNotificacionModificacionMarcacion(
            usuarioEmpresa, marcacionOriginal.data, req.body, newReporteId
        ).catch(error => console.error('Error en notificaciÃƒÂ³n de modificaciÃƒÂ³n de marcaciÃƒÂ³n:', error));

        console.log('Ã¢Å“â€¦ Solicitud de modificaciÃƒÂ³n procesada exitosamente');

        return res.status(200).json({
            success: true,
            message: 'Solicitud de modificaciÃƒÂ³n enviada correctamente. SerÃƒÂ¡ revisada por un supervisor.',
            reporteId: newReporteId,
            data: {
                marcacionOriginal: marcacionOriginal.data,
                cambiosSolicitados: {
                    fecha,
                    hora,
                    tipo,
                    motivo
                }
            }
        });

    } catch (error) {
        console.error('Ã¢ÂÅ’ Error en modificarMarcacionPorId:', error);
        console.error('Ã°Å¸â€œâ€¹ Stack trace:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}


const obtenerReporteMarcacionId = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'El token es requerido'
            });
        }

        // Validar que el usuario estÃƒÂ© autenticado (desde AuthMiddleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const usuarioAutenticado = req.user;
        console.log("obtenerReporteMarcacionId token:", token);


        const { id } = AuthService.verifyToken(token);
        console.log("obtenerReporteMarcacionId id:", id);
        const reporte = await ReporteMarcionesModel.findById(id);

        const userSolicitante = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(reporte.usuario_id);

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        if (reporte.estado !== 'POR CONFIRMAR') {
            return res.status(400).json({
                success: false,
                message: 'El reporte ya ha sido procesado'
            });
        }

        // Validar que el usuario autenticado sea el trabajador dueÃƒÂ±o de la solicitud
        if (reporte.usuario_id !== userSolicitante.id) {
            return res.status(403).json({
                success: false,
                message: 'Esta solicitud no te pertenece'
            });
        }

        // Validar que el usuario autenticado coincida con el dueÃƒÂ±o de la solicitud
        // req.user.id es el ID del usuario en la tabla usuarios
        // Necesitamos verificar que corresponda al mismo usuario_empresa
        if (userSolicitante.usuario_id !== usuarioAutenticado.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver esta solicitud. Debes estar logueado como el trabajador que hizo la solicitud.'
            });
        }



        const infoData = {
            reporte_id: reporte.id,
            tipo_problema: reporte.tipo_problema,
            fecha_correcta: reporte.fecha_correcta ? reporte.fecha_correcta : null,
            hora_correcta: reporte.hora_correcta ? reporte.hora_correcta : null,
            tipo: reporte.tipo,
            user_nombre: userSolicitante.usuario_nombre,
            user_apellido_pat: userSolicitante.usuario_apellido_pat,
            user_apellido_mat: userSolicitante.usuario_apellido_mat,
            user_email: userSolicitante.usuario_nombre,
            user_rut: userSolicitante.usuario_rut,
            user_empresa: userSolicitante.empresa_nombre,
            user_empresa_rut: userSolicitante.empresa_rut,
        }

        if (reporte.tipo === 'modificar') {
            const marcacionOriginal = await MarcacionesService.obtenerMarcacionPorId(reporte.marcacion_id);
            infoData.hora_original = marcacionOriginal.data.hora;
            infoData.fecha_original = marcacionOriginal.data.fecha;
        }

        return res.status(200).json({
            success: true,
            data: infoData,
            message: 'Reporte obtenido correctamente'
        });
    } catch (error) {
        console.error('Error en obtenerReporteMarcacionId:', error);
        throw new Error('Error interno del servidor');
    }
}

const aceptarModificacionMarcacion = async (req, res) => {
    try {
        const { token } = req.body;

        // Validar que el usuario estÃƒÂ© autenticado (desde AuthMiddleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const usuarioAutenticado = req.user;

        const { id } = AuthService.verifyToken(token);

        const reporte = await ReporteMarcionesModel.findById(id);
        console.log("aceptarModificacionMarcacion id:", id);

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Validar que el reporte estÃƒÂ© en estado 'POR CONFIRMAR'
        if (reporte.estado !== 'POR CONFIRMAR') {
            return res.status(400).json({
                success: false,
                message: 'Este reporte ya ha sido procesado'
            });
        }

        // Obtener informaciÃƒÂ³n del trabajador
        const userSolicitante = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(reporte.usuario_id);

        // Validar que el usuario autenticado sea el trabajador dueÃƒÂ±o de la solicitud
        if (userSolicitante.usuario_id !== usuarioAutenticado.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para aprobar esta solicitud. Debes estar logueado como el trabajador que hizo la solicitud.'
            });
        }



        if (reporte.tipo === 'agregar') {
            // LÃƒÂ³gica para aceptar adiciÃƒÂ³n de marcaciÃƒÂ³n
            await MarcacionesService.insertarMarcacionManual(reporte.usuario_id, reporte.tipo_marcacion_correcta, reporte.fecha_correcta, reporte.hora_correcta);
        } else if (reporte.tipo === 'modificar') {
            // LÃƒÂ³gica para aceptar modificaciÃƒÂ³n de marcaciÃƒÂ³n
            // si tiene solo fecha correcta, es un caso, si tiene solo hora correcta, es otro caso, si tiene ambos, es otro caso
            if (reporte.fecha_correcta && reporte.hora_correcta) {
                await MarcacionesService.updateFechaMarcacion(reporte.marcacion_id, reporte.fecha_correcta);
                await MarcacionesService.updateHoraMarcacion(reporte.marcacion_id, reporte.hora_correcta);
            }
            else if (reporte.fecha_correcta) {
                await MarcacionesService.updateFechaMarcacion(reporte.marcacion_id, reporte.fecha_correcta);
            } else if (reporte.hora_correcta) {
                await MarcacionesService.updateHoraMarcacion(reporte.marcacion_id, reporte.hora_correcta);
            }
        }

        // Actualizar estado del reporte a 'aceptado'
        await ReporteMarcionesModel.aprobar(id);


        res.status(200).json({
            success: true,
            message: 'Solicitud aprobada exitosamente',
        });


        // Obtener la marcaciÃƒÂ³n original antes de modificarla
    } catch (error) {
        console.error('Error en aceptarModificacionMarcacion:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

const rechazarModificacionMarcacion = async (req, res) => {
    try {
        const { token } = req.body;

        // Validar que el usuario estÃƒÂ© autenticado (desde AuthMiddleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const usuarioAutenticado = req.user;

        const { id } = AuthService.verifyToken(token);

        const reporte = await ReporteMarcionesModel.findById(id);

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Validar que el reporte estÃƒÂ© en estado 'POR CONFIRMAR'
        if (reporte.estado !== 'POR CONFIRMAR') {
            return res.status(400).json({
                success: false,
                message: 'Este reporte ya ha sido procesado'
            });
        }

        // Obtener informaciÃƒÂ³n del trabajador
        const userSolicitante = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(reporte.usuario_id);

        // Validar que el usuario autenticado sea el trabajador dueÃƒÂ±o de la solicitud
        if (userSolicitante.usuario_id !== usuarioAutenticado.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para rechazar esta solicitud. Debes estar logueado como el trabajador que hizo la solicitud.'
            });
        }

        // Rechazar el reporte
        await ReporteMarcionesModel.rechazar(id);


        // opcional se podria enviar un correo notificando el rechazo al usuario

        return res.status(200).json({
            success: true,
            message: 'Solicitud rechazada exitosamente',
        });
        // Obtener la marcaciÃƒÂ³n original antes de modificarla
    } catch (error) {
        console.error('Error en rechazarModificacionMarcacion:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

import MarcacionesModel from '../model/marcaciones.model.js';
const agregarMarcacionManual = async (req, res) => {
    try {
        const { usuario_id, tipo, fecha, hora, motivo } = req.body;
        if (!usuario_id || !tipo || !fecha || !hora || !motivo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos: usuario_id, tipo, fecha, hora y motivo son obligatorios'
            });
        }

        // 1. Obtener usuario_empresa_id
        const usuarioEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(usuario_id);
        if (!usuarioEmpresa) {
            return res.status(404).json({ success: false, message: 'Usuario empresa no encontrado' });
        }

        // 2. Insertar la marcaciÃƒÂ³n manual
        const nuevaMarcacion = {
            usuario_empresa_id: usuarioEmpresa.id,
            mandante_id: null,
            fecha,
            hora,
            tipo,
            hash: null // puedes generar un hash si lo necesitas
        };
        const result = await MarcacionesService.insertarMarcacionManual(nuevaMarcacion);

        // 3. Crear el reporte y enviar notificaciÃƒÂ³n
        const id = await ReporteMarcionesModel.createPorConfirmar({
            marcacion_id: result.insertId,
            usuario_id: usuario_id,
            tipo: 'agregar',
            fecha_correcta: fecha,
            hora_correcta: hora,
            descripcion: motivo,
            tipo_problema: "AdiciÃƒÂ³n de MarcaciÃƒÂ³n",
            tipo_marcacion_correcta: tipo
        });

        const reporte = await ReporteMarcionesModel.findById(id);
        const usuario = await UsuarioEmpresaModel.obtenerUsuarioByID(reporte.usuario_id);
        await NotificacionService.enviarNotificacionConfirmacionNuevaMarcacion(reporte, { tipo: 'agregar', fechaNueva: fecha, horaNueva: hora, tipoNueva: tipo, usuario: usuario });

        return res.status(200).json({
            success: true,
            message: 'MarcaciÃƒÂ³n agregada correctamente y reporte generado',
            marcacion_id: result.insertId,
            reporte_id: id
        });

    } catch (error) {
        console.error('Error en agregarMarcacionManual:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtiene las horas trabajadas en la semana actual para un usuario
 */
const obtenerHorasSemanales = async (req, res) => {
    try {
        const { usuario_empresa_id } = req.params;

        if (!usuario_empresa_id) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario empresa es requerido'
            });
        }

        console.log(`Ã°Å¸â€¢â€™ Calculando horas semanales para usuario_empresa_id: ${usuario_empresa_id}`);

        const resultado = await MarcacionesService.calcularHorasSemanales(parseInt(usuario_empresa_id));

        if (resultado.success) {
            res.json({
                success: true,
                data: resultado
            });
        } else {
            res.status(500).json(resultado);
        }

    } catch (error) {
        console.error('Error en obtenerHorasSemanales:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}




const obtenerDiasTrabajadosPorMes = async (req, res) => {
    try {
        const { mes, anio } = req.query;

        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                message: 'Los parÃƒÂ¡metros mes y anio son requeridos'
            });
        }

        const [ueId]= await UsuarioEmpresaModel.getUsuarioEmpresaById(req.user.id, req.user.empresa_id);
        const marcaciones = await MarcacionesService.obtenerMarcacionesPorUsuario(ueId.id);

        console.log('Marcaciones obtenidas para calcular dÃƒÂ­as trabajados:', marcaciones);

        const turnos = await AsignacionTurnosModel.getByUsuarioEmpresaId(ueId.id);
        for (const turno of turnos) {
            // agregar detalle dias por tipo turno
            turno.detalle_dias = await TipoTurnosModel.getDetalleDiasPorTipoTurnoId(turno.tipo_turno_id);
        }

        console.log('Turnos obtenidos:', turnos);

        if (!marcaciones.success) {
            return res.status(500).json(marcaciones);
        }

        // Obtener dÃƒÂ­as justificados del mes
        const primerDia = `${anio}-${mes.toString().padStart(2, '0')}-01`;
        const ultimoDia = new Date(anio, mes, 0).getDate();
        const ultimoDiaStr = `${anio}-${mes.toString().padStart(2, '0')}-${ultimoDia.toString().padStart(2, '0')}`;

        const diasJustificados = await JustificacionesModel.obtenerDiasJustificadosEnRango(
            ueId.id,
            primerDia,
            ultimoDiaStr
        );



        // Procesar dÃƒÂ­as del mes
        const dias = procesarDiasMes(parseInt(mes), parseInt(anio), marcaciones.marcaciones, turnos, diasJustificados, ueId.id);

        return res.status(200).json({
            success: true,
            data: {
                mes: parseInt(mes),
                anio: parseInt(anio),
                dias: dias,
                resumen: {
                    diasTrabajados: dias.filter(d => d.estado === 'trabajado').length,
                    diasConIncidente: dias.filter(d => d.estado === 'incidente').length,
                    diasAusentes: dias.filter(d => d.estado === 'ausente').length,
                    diasLibres: dias.filter(d => d.estado === 'libre').length,
                    diasJustificados: dias.filter(d => d.estado === 'justificado').length,
                    diasSinTurno: dias.filter(d => d.estado === 'sin_turno').length
                }
            }
        });

    } catch (error) {
        console.error('Error en obtenerDiasTrabajadosPorMes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Procesa los dÃƒÂ­as del mes con sus marcaciones y turnos
 */
/**
 * Procesa todos los dÃƒÂ­as de un mes, verificando turnos, marcaciones y justificaciones
 */
const procesarDiasMes = (mes, anio, marcaciones, turnos, diasJustificados = [], usuarioEmpresaId) => {
    const diasDelMes = new Date(anio, mes, 0).getDate(); // Obtener cantidad de dÃƒÂ­as del mes
    const dias = [];

    // Mapeo de dÃƒÂ­as de la semana en espaÃƒÂ±ol
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sábado'];

    // Crear un mapa de dÃƒÂ­as justificados para bÃƒÂºsqueda rÃƒÂ¡pida

    const mapaDiasJustificados = {};
    diasJustificados.forEach(dj => {
        const fechaStr = new Date(dj.fecha).toISOString().split('T')[0];
        mapaDiasJustificados[fechaStr] = dj;
    });



    for (let dia = 1; dia <= diasDelMes; dia++) {
        const fecha = new Date(anio, mes - 1, dia);
        const fechaStr = fecha.toISOString().split('T')[0];
        const diaSemana = diasSemana[fecha.getDay()];

        // Obtener marcaciones del dÃƒÂ­a
        const marcacionesDia = marcaciones[fechaStr] || [];

        // Obtener turno aplicable para este dÃƒÂ­a
        const turnoDelDia = obtenerTurnoParaDia(fecha, turnos, diaSemana);

        // Verificar si el dÃƒÂ­a estÃƒÂ¡ justificado
        const justificacion = mapaDiasJustificados[fechaStr] || null;

        // Procesar el dÃƒÂ­a
        const diaInfo = procesarDia(fechaStr, marcacionesDia, turnoDelDia, diaSemana, justificacion);
        dias.push(diaInfo);
    }

    return dias;
};

/**
 * Obtiene el turno aplicable para una fecha especÃƒÂ­fica
 * Los dÃƒÂ­as de trabajo estÃƒÂ¡n definidos en turno.detalle_dias
 */
const obtenerTurnoParaDia = (fecha, turnos, diaSemana) => {
    if (!turnos || turnos.length === 0) return null;

    const fechaEvaluar = new Date(fecha);
    fechaEvaluar.setHours(0, 0, 0, 0);

    // Encontrar la fecha de inicio del primer turno
    let fechaPrimerTurno = null;
    for (const turno of turnos) {
        const fechaInicio = new Date(turno.fecha_inicio);
        fechaInicio.setHours(0, 0, 0, 0);

        if (!fechaPrimerTurno || fechaInicio < fechaPrimerTurno) {
            fechaPrimerTurno = fechaInicio;
        }
    }

    // Si la fecha es anterior al primer turno, retornar objeto especial
    if (fechaPrimerTurno && fechaEvaluar < fechaPrimerTurno) {
        return {
            sinTurnoAsignado: true,
            fechaPrimerTurno: fechaPrimerTurno
        };
    }

    // Buscar turno activo que aplique para esta fecha
    for (const turno of turnos) {
        const fechaInicio = new Date(turno.fecha_inicio);
        fechaInicio.setHours(0, 0, 0, 0);

        const fechaFin = turno.fecha_fin ? new Date(turno.fecha_fin) : null;
        if (fechaFin) {
            fechaFin.setHours(23, 59, 59, 999);
        }

        // Verificar si la fecha estÃƒÂ¡ en el rango del turno
        if (fechaEvaluar >= fechaInicio && (!fechaFin || fechaEvaluar <= fechaFin)) {
            // Verificar si el dÃƒÂ­a de la semana estÃƒÂ¡ en los dÃƒÂ­as laborables segÃƒÂºn detalle_dias
            if (turno.detalle_dias && turno.detalle_dias.length > 0) {
                const diaDetalle = turno.detalle_dias.find(d =>
                    d.dia_semana.toLowerCase() === diaSemana.toLowerCase() && d.trabaja === 1
                );

                if (diaDetalle) {
                    return turno;
                }
            }
        }
    }

    return null;
};

/**
 * Procesa la informaciÃƒÂ³n de un dÃƒÂ­a especÃƒÂ­fico
 */
const procesarDia = (fecha, marcacionesDia, turno, diaSemana, justificacion = null) => {
    // Si el dÃƒÂ­a es anterior a la asignaciÃƒÂ³n del turno (sin turno asignado aÃƒÂºn)
    if (turno && turno.sinTurnoAsignado) {
        return {
            fecha,
            estado: 'sin_turno',
            horaEntrada: null,
            horaSalida: null,
            horaInicioColacion: null,
            horaFinColacion: null,
            incidente: 'DÃƒÂ­a anterior a la asignaciÃƒÂ³n de turno',
            tipoIncidente: 'SIN_TURNO_ASIGNADO',
            turno: null,
            horasTrabajadas: null,
            minutosRetraso: 0,
            minutosExtra: 0,
            horasExtras: null,
            justificado: false,
            justificacion: null
        };
    }

    // Si no hay turno asignado, el dÃƒÂ­a es libre
    if (!turno) {
        return {
            fecha,
            estado: 'libre',
            horaEntrada: null,
            horaSalida: null,
            horaInicioColacion: null,
            horaFinColacion: null,
            incidente: null,
            tipoIncidente: null,
            turno: null,
            horasTrabajadas: null,
            minutosRetraso: 0,
            minutosExtra: 0,
            horasExtras: null,
            justificado: false,
            justificacion: null
        };
    }

    // Extraer marcaciones por tipo
    const entradas = marcacionesDia.filter(m => m.tipo === 'entrada');
    const salidas = marcacionesDia.filter(m => m.tipo === 'salida');
    const colaciones = marcacionesDia.filter(m => m.tipo === 'colacion');

    const entrada = entradas.length > 0 ? entradas[0] : null;
    const salida = salidas.length > 0 ? salidas[salidas.length - 1] : null; // ÃƒÅ¡ltima salida
    const inicioColacion = colaciones.length > 0 ? colaciones[0] : null;
    const finColacion = colaciones.length > 1 ? colaciones[1] : null;

    // Determinar estado e incidentes
    let estado = 'trabajado';
    let incidente = null;
    let tipoIncidente = null;

    if (!entrada && !salida) {
        // Verificar si el dÃƒÂ­a estÃƒÂ¡ justificado
        if (justificacion) {
            estado = 'justificado';
            incidente = `Justificado: ${justificacion.tipo_justificacion.replace(/_/g, ' ')}`;
            tipoIncidente = 'JUSTIFICADO';
        } else {
            estado = 'ausente';
            incidente = 'Sin marcaciones registradas';
            tipoIncidente = 'AUSENCIA_COMPLETA';
        }
    } else if (!entrada) {
        estado = 'incidente';
        incidente = 'No marcÃƒÂ³ entrada';
        tipoIncidente = 'ENTRADA_FALTANTE';
    } else if (!salida) {
        estado = 'incidente';
        incidente = 'No marcÃƒÂ³ salida';
        tipoIncidente = 'SALIDA_FALTANTE';
    }

    // Calcular horas trabajadas
    let horasTrabajadas = null;
    let minutosRetraso = 0;
    let minutosExtra = 0;
    let horasExtras = null;

    if (entrada && salida) {
        const horasTrabajadasDecimal = calcularHorasTrabajadas(
            entrada.hora,
            salida.hora,
            inicioColacion?.hora,
            finColacion?.hora
        );
        horasTrabajadas = formatearHoras(horasTrabajadasDecimal);

        // Calcular retraso
        minutosRetraso = calcularMinutosRetraso(entrada.hora, turno.hora_inicio);

        // Calcular horas extras
        const horasTurno = calcularDiferenciaHorasDecimal(turno.hora_inicio, turno.hora_fin);
        if (horasTrabajadasDecimal > horasTurno) {
            const horasExtrasDecimal = horasTrabajadasDecimal - horasTurno;
            minutosExtra = Math.round(horasExtrasDecimal * 60);
            horasExtras = formatearHoras(horasExtrasDecimal);
        }
    } else if (entrada) {
        // Calcular retraso aunque no haya salida
        minutosRetraso = calcularMinutosRetraso(entrada.hora, turno.hora_inicio);
    }

    return {
        fecha,
        estado,
        horaEntrada: entrada ? formatearHora(entrada.hora) : null,
        horaSalida: salida ? formatearHora(salida.hora) : null,
        horaInicioColacion: inicioColacion ? formatearHora(inicioColacion.hora) : null,
        horaFinColacion: finColacion ? formatearHora(finColacion.hora) : null,
        incidente,
        tipoIncidente,
        turno: {
            tipo: turno.tipo_turno_nombre,
            horaInicio: formatearHora(turno.hora_inicio),
            horaFin: formatearHora(turno.hora_fin)
        },
        horasTrabajadas,
        minutosRetraso,
        minutosExtra,
        horasExtras,
        justificado: !!justificacion,
        justificacion: justificacion ? {
            tipo: justificacion.tipo_justificacion,
            motivo: justificacion.motivo
        } : null
    };
};

/**
 * Calcula la diferencia en horas entre dos tiempos (versiÃƒÂ³n simplificada)
 */
const calcularDiferenciaHorasDecimal = (horaInicio, horaFin) => {
    const [hInicio, mInicio, sInicio = 0] = horaInicio.split(':').map(Number);
    const [hFin, mFin, sFin = 0] = horaFin.split(':').map(Number);

    const inicioEnMinutos = hInicio * 60 + mInicio + sInicio / 60;
    const finEnMinutos = hFin * 60 + mFin + sFin / 60;

    let diferencia = finEnMinutos - inicioEnMinutos;

    // Si la hora de fin es menor, asumimos que cruzÃƒÂ³ medianoche
    if (diferencia < 0) {
        diferencia += 24 * 60;
    }

    return diferencia / 60; // Retornar en horas decimales
};

/**
 * Calcula las horas trabajadas restando el tiempo de colaciÃƒÂ³n
 */
const calcularHorasTrabajadas = (horaEntrada, horaSalida, horaInicioColacion, horaFinColacion) => {
    const totalHoras = calcularDiferenciaHorasDecimal(horaEntrada, horaSalida);

    if (horaInicioColacion && horaFinColacion) {
        const horasColacion = calcularDiferenciaHorasDecimal(horaInicioColacion, horaFinColacion);
        return Math.max(0, totalHoras - horasColacion);
    }

    return totalHoras;
};

/**
 * Calcula los minutos de retraso
 */
const calcularMinutosRetraso = (horaEntrada, horaInicioTurno) => {
    const [hEntrada, mEntrada, sEntrada = 0] = horaEntrada.split(':').map(Number);
    const [hTurno, mTurno, sTurno = 0] = horaInicioTurno.split(':').map(Number);

    const entradaEnMinutos = hEntrada * 60 + mEntrada;
    const turnoEnMinutos = hTurno * 60 + mTurno;

    const retraso = entradaEnMinutos - turnoEnMinutos;

    return Math.max(0, retraso);
};

/**
 * Formatea horas decimales a formato HH:MM
 */
const formatearHoras = (horasDecimales) => {
    const horas = Math.floor(horasDecimales);
    const minutos = Math.round((horasDecimales - horas) * 60);

    return `${horas}:${minutos.toString().padStart(2, '0')}`;
};

/**
 * Formatea hora de HH:MM:SS a HH:MM
 */
const formatearHora = (hora) => {
    if (!hora) return null;
    const partes = hora.split(':');
    return `${partes[0]}:${partes[1]}`;
};



const MarcacionesController = {
    registrarEntrada,
    registrarSalida,
    obtenerMarcacionesPorUsuario,
    registrarColacion,
    registrarTerminoColacion,
    obtenerHorarioHoy,
    obtenerTodasLasMarcaciones,
    obtenerMarcacionesPorFecha,
    obtenerMarcacionesPorEmpresa,
    obtenerMarcacionPorUserId,
    modificarMarcacionPorId,
    aceptarModificacionMarcacion,
    rechazarModificacionMarcacion,
    obtenerReporteMarcacionId,
    agregarMarcacionManual,
    obtenerHorasSemanales,
    obtenerDiasTrabajadosPorMes
}

export default MarcacionesController;
