import AuthService from '../services/authservice.js';
import NotificacionService from '../services/NotificacionService.js';
import LoginCodigoModel from '../model/LoginCodigoModel.js';
import TipoTurnosModel from '../model/TipoTurnosModel.js';
import EmpresaLugarModel from '../model/EmpresaLugarModel.js';
import EmpresaModel from '../model/EmpresaModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import EstAsignacionesModel from '../model/EstAsignacionesModel.js';
import MarcacionesServices from '../services/MarcacionesServices.js';
import ConfigToleranciaModel from '../model/ConfigTolerancias.js';
import {DateTime} from 'luxon';
import AuditoriaModel from '../model/AuditoriaModel.js';
import pool from '../config/dbconfig.js';
import AsignacionTurnosModel from '../model/AsignacionTurnosModel.js';

const solicitarAcceso = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'El campo email es obligatorio' });
        }

        /*
        // verificar que el correo tenga dominio @dt.gob.cl
        const dominioPermitido = '@dt.gob.cl';
        if (!email.endsWith(dominioPermitido)) {
            return res.status(400).json({ message: `El correo debe pertenecer al dominio ${dominioPermitido}` });
        }
        */

        // Invalidar códigos anteriores del usuario
        await LoginCodigoModel.invalidateUserCodes(email);

        // Generate temporary access code
        const codeInfo = await AuthService.generateTemporaryCode(email);

        // Save the code in the database
        const newCode = await LoginCodigoModel.createCodigoTemporal({
            email: email,
            codigo: codeInfo.code,
            expires_at: codeInfo.expiresAt,
        });

        // Send code via email
        const result = await NotificacionService.enviarCodigoTemporal(email, codeInfo.code);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Error al enviar el código temporal',
                error: result.message
            });
        }

        // If everything is successful
        res.status(200).json({
            success: true,
            message: "Código temporal enviado exitosamente",
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const validarCodigo = async (req, res) => {
    try {
        const { email, codigo } = req.body;
        if (!email || !codigo) {
            return res.status(400).json({ message: 'Email y código son obligatorios' });
        }

        // Check if the code is valid
        const validCode = await LoginCodigoModel.findValidCodeByCode(codigo);

        if (!validCode) {
            return res.status(400).json({ message: 'Código inválido o expirado' });
        }

        // Verify that the code belongs to the provided email
        if (validCode.email !== email) {
            return res.status(400).json({ message: 'El código no corresponde al email proporcionado' });
        }

        // Mark the code as verified
        const isVerified = await LoginCodigoModel.markAsVerified(validCode.id);
        if (!isVerified) {
            return res.status(500).json({ message: 'Error al verificar el código' });
        }



        // Generate JWT token
        const token = AuthService.generateTokenForFiscalizador(email);

        // If everything is successful
        res.status(200).json({
            success: true,
            message: "Código verificado exitosamente",
            token: token,
            user: {
                email: email
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const cerrarSesion = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify and decode the token
        const decoded = AuthService.verifyToken(token);

        // Optional: Invalidate all active codes for this user
        if (decoded.email) {
            await LoginCodigoModel.invalidateUserCodes(decoded.email);
        }


        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });

    } catch (error) {
        // Even if token verification fails, we still consider logout successful
        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    }
}



const obtenerDatosEmpresa = async (req, res) => {
    // esta funcion permite obtener los datos de la empresa seleccionada para poder utilizar los filtros del reporte
    // datos que necesitamos:
    const empresaId = req.params.empresa_id; // ID de la empresa (en un caso real, esto vendría del token o de la sesión)



    const tiposJornada = await TipoTurnosModel.getTiposJornada();
    const lugaresTrabajo = await EmpresaLugarModel.getLugaresByEmpresaId(empresaId);
    const turnos = await TipoTurnosModel.getAllWithDiasByEmpresaId(empresaId);
    const roles = await UsuarioEmpresaModel.obtenerRolesDisponiblesByEmpresaId(empresaId);
    const estAsignaciones = await EstAsignacionesModel.getTrabajadoresByUsuariaId(empresaId);
    const trabajadoresEmpresa = await UsuarioEmpresaModel.getUsuariosByEmpresaId(empresaId);
    const trabajadores = [
        ...estAsignaciones.map(est => ({ ...est, es_est: true })),
        ...trabajadoresEmpresa.map(trabajador => ({ ...trabajador, es_est: false }))
    ].filter(trabajador => trabajador.usuario_rol_global !== 'empleador');
    // departamentos (si aplica) por implementar
    const regiones = lugaresTrabajo.map(lugar => lugar.region).filter((value, index, self) => self.indexOf(value) === index);
    const comunas = lugaresTrabajo.map(lugar => lugar.comuna).filter((value, index, self) => self.indexOf(value) === index);

    const empresaEst = await EstAsignacionesModel.getEmpresaEstByUsuariaId(empresaId);

    

    res.status(200).json({
        success: true,
        tiposJornada: tiposJornada,
        lugaresTrabajo: lugaresTrabajo,
        turnos: turnos,
        roles: roles,
        regiones: regiones,
        comunas: comunas,
        trabajadores: trabajadores,
        empresaEst: empresaEst
    });
}

const obtenerAsistencias = async (req, res) => {
    const empresaId = req.params.empresa_id;

    
    const fechaInicioParam = req.query.fecha_inicio;
    const fechaFinParam = req.query.fecha_fin;

    const estAsignaciones = await EstAsignacionesModel.getTrabajadoresByUsuariaId(empresaId);
    const trabajadoresEmpresa = await UsuarioEmpresaModel.getUsuariosByEmpresaId(empresaId);
    const trabajadores = [
        ...estAsignaciones.map(est => ({ ...est, es_est: true })),
        ...trabajadoresEmpresa.map(trabajador => ({ ...trabajador, es_est: false }))
    ].filter(trabajador => trabajador.usuario_rol_global !== 'empleador');
   
    // Obtener configuración de tolerancias de la empresa
    const configuracionTolerancia = await ConfigToleranciaModel.findByEmpresaId(empresaId);
    const toleranciaEntradaMinutos = configuracionTolerancia?.tolerancia_entrada || 0;
    
    // Configurar fechas: usar parámetros o fecha actual por defecto
    const fechaActualChile = DateTime.now().setZone('America/Santiago').toISODate();
    const fechaInicio = fechaInicioParam || fechaActualChile;
    const fechaFin = fechaFinParam || fechaInicio; // Si no se especifica fecha_fin, usar fecha_inicio
    
    // Para turnos nocturnos: si se busca un solo día, extender búsqueda al siguiente día
    // para capturar salidas que ocurren al día siguiente
    let fechaFinExtendida = fechaFin;
    if (fechaInicio === fechaFin) {
        fechaFinExtendida = DateTime.fromISO(fechaFin).plus({ days: 1 }).toISODate();
    }
    
    const marcacionesAgrupadasPorUsuario = {};
    
    /**
     * Calcula si una marcación de entrada está atrasada
     * @param {string} horaEntradaMarcacion - Hora de la marcación (HH:mm:ss)
     * @param {string} horaInicioTurno - Hora de inicio del turno (HH:mm:ss)
     * @param {number} toleranciaMinutos - Tolerancia en minutos
     * @returns {object} - { atrasado: boolean, minutos_atraso: number, dentro_tolerancia: boolean }
     */
    const calcularAtraso = (horaEntradaMarcacion, horaInicioTurno, toleranciaMinutos) => {
        // Convertir horas a minutos desde medianoche
        const [horaM, minM, segM] = horaEntradaMarcacion.split(':').map(Number);
        const [horaT, minT, segT] = horaInicioTurno.split(':').map(Number);
        
        const minutosMarcacion = horaM * 60 + minM;
        const minutosTurno = horaT * 60 + minT;
        
        const diferenciaMinutos = minutosMarcacion - minutosTurno;
        
        // Si la diferencia es positiva, llegó tarde
        const atrasado = diferenciaMinutos > 0;
        const minutos_atraso = Math.max(0, diferenciaMinutos);
        const dentro_tolerancia = diferenciaMinutos <= toleranciaMinutos;
        
        return {
            atrasado,
            minutos_atraso,
            dentro_tolerancia,
            llego_antes: diferenciaMinutos < 0,
            minutos_anticipacion: Math.max(0, -diferenciaMinutos)
        };
    };
    
    /**
     * Calcula si una marcación de salida fue anticipada
     * @param {string} horaSalidaMarcacion - Hora de la marcación de salida (HH:mm:ss)
     * @param {string} horaFinTurno - Hora de fin del turno (HH:mm:ss)
     * @param {string} horaEntradaMarcacion - Hora real de entrada del trabajador (HH:mm:ss)
     * @param {string} horaInicioTurno - Hora de inicio del turno (HH:mm:ss)
     * @param {number} toleranciaMinutos - Tolerancia en minutos
     * @returns {object} - { salida_anticipada: boolean, minutos_anticipados: number, hora_salida_esperada: string }
     */
    const calcularSalidaAnticipada = (horaSalidaMarcacion, horaFinTurno, horaEntradaMarcacion, horaInicioTurno, toleranciaMinutos) => {
        // Convertir horas a minutos desde medianoche
        const [horaSM, minSM] = horaSalidaMarcacion.split(':').map(Number);
        const [horaFT, minFT] = horaFinTurno.split(':').map(Number);
        const [horaEM, minEM] = horaEntradaMarcacion.split(':').map(Number);
        const [horaIT, minIT] = horaInicioTurno.split(':').map(Number);
        
        const minutosSalidaMarcacion = horaSM * 60 + minSM;
        const minutosFinTurno = horaFT * 60 + minFT;
        const minutosEntradaMarcacion = horaEM * 60 + minEM;
        const minutosInicioTurno = horaIT * 60 + minIT;
        
        // Calcular el atraso en la entrada
        const atrasoEntrada = minutosEntradaMarcacion - minutosInicioTurno;
        
        // Si el trabajador entró tarde fuera de la tolerancia, debe compensar ese tiempo
        let horaFinAjustada = minutosFinTurno;
        if (atrasoEntrada > toleranciaMinutos) {
            // Debe compensar el tiempo que llegó tarde (fuera de tolerancia)
            horaFinAjustada = minutosFinTurno + (atrasoEntrada - toleranciaMinutos);
        } else if (atrasoEntrada > 0 && atrasoEntrada <= toleranciaMinutos) {
            // Llegó tarde pero dentro de tolerancia, debe salir a su hora normal
            horaFinAjustada = minutosFinTurno;
        }
        
        // Calcular diferencia entre la salida real y la salida esperada
        const diferenciaMinutos = horaFinAjustada - minutosSalidaMarcacion;
        
        // Si la diferencia es positiva, salió antes de lo que debía
        const salida_anticipada = diferenciaMinutos > 0;
        const minutos_anticipados = Math.max(0, diferenciaMinutos);
        
        // Calcular la hora de salida esperada en formato HH:mm
        const horaEsperada = Math.floor(horaFinAjustada / 60);
        const minutosEsperados = horaFinAjustada % 60;
        const hora_salida_esperada = `${String(horaEsperada).padStart(2, '0')}:${String(minutosEsperados).padStart(2, '0')}:00`;
        
        return {
            salida_anticipada,
            minutos_anticipados,
            hora_salida_esperada,
            hora_salida_real: horaSalidaMarcacion,
            compensacion_requerida: atrasoEntrada > toleranciaMinutos,
            minutos_compensacion: Math.max(0, atrasoEntrada - toleranciaMinutos)
        };
    };
    
    for (const trabajador of trabajadores) {    
        const marcaciones = await MarcacionesServices.obtenerMarcacionesPorUsuario(trabajador.id, fechaInicio, fechaFinExtendida);
        console.log('Marcaciones obtenidas para trabajador', trabajador.id, ':', marcaciones, 'Fechas:', fechaInicio, 'a', fechaFinExtendida);
        // Obtener el turno activo del trabajador para la fecha
        const TurnosModel = (await import('../model/TurnosModel.js')).default;
        const turnoActivo = await TurnosModel.obtenerTurnoPorUsuarioYFecha(trabajador.id, fechaInicio);
        
        // Validar asistencia por cada fecha en el rango
        const marcacionesConEstado = {};
        //console.log('marcaciones recibidas:', marcaciones);
        if (marcaciones.success && marcaciones.marcaciones) {
            // Validar estado de asistencia para cada fecha
            
            for (const [fecha, marcacionesDia] of Object.entries(marcaciones.marcaciones)) {
             
                const turnoFecha = await TurnosModel.obtenerTurnoPorUsuarioYFecha(trabajador.id, fecha);
           
                if (turnoFecha) {
                    // Hay turno asignado para este día
                    
                    // Para turnos nocturnos, buscar entrada en día actual y salida en día siguiente
                    let marcacionEntrada = marcacionesDia.find(m => m.tipo === 'entrada');
                    let marcacionSalida = null;
                    let fechaSalidaSiguiente = null;
                    
                    if (turnoFecha.tipo_jornada_nombre === 'Nocturna') {
                        // Para turnos nocturnos: SIEMPRE buscar salida en el día siguiente
                        // porque la salida pertenece al próximo día (ej: entrada 17:00 del 06/11, salida 08:00 del 07/11)
                        const fechaSiguiente = DateTime.fromISO(fecha).plus({ days: 1 }).toISODate();
                        if (marcaciones.marcaciones && marcaciones.marcaciones[fechaSiguiente]) {
                            const marcacionesSiguiente = marcaciones.marcaciones[fechaSiguiente];
                            const posibleSalida = marcacionesSiguiente.find(m => m.tipo === 'salida');
                            if (posibleSalida) {
                                marcacionSalida = posibleSalida;
                                fechaSalidaSiguiente = fechaSiguiente;
                            }
                        }
                    } else {
                        // Para turnos diurnos, la salida está en el mismo día
                        marcacionSalida = marcacionesDia.find(m => m.tipo === 'salida');
                    }
                    
                    const tieneEntrada = !!marcacionEntrada;
                    const tieneSalida = !!marcacionSalida;
                    
                    // Calcular atraso si hay marcación de entrada
                    let infoAtraso = null;
                    let infoSalida = null;
                    let estadoAsistencia = 'NO_ASISTE';
                    
                    if (tieneEntrada) {
                        infoAtraso = calcularAtraso(
                            marcacionEntrada.hora, 
                            turnoFecha.hora_inicio, 
                            toleranciaEntradaMinutos
                        );
                        
                        // Calcular salida anticipada si hay marcación de salida
                        if (tieneSalida) {
                            infoSalida = calcularSalidaAnticipada(
                                marcacionSalida.hora,
                                turnoFecha.hora_fin,
                                marcacionEntrada.hora,
                                turnoFecha.hora_inicio,
                                toleranciaEntradaMinutos
                            );
                        }
                        
                        // Determinar estado de asistencia
                        if (infoAtraso.atrasado && !infoAtraso.dentro_tolerancia) {
                            estadoAsistencia = 'TARDANZA'; // Llegó tarde y fuera de tolerancia
                        } else {
                            estadoAsistencia = 'PRESENTE'; // Llegó a tiempo o dentro de tolerancia
                        }
                    }
                    
                    // Agregar metadata de asistencia
                    marcacionesConEstado[fecha] = {
                        marcaciones: marcacionesDia,
                        turno: {
                            id: turnoFecha.id,
                            nombre: turnoFecha.tipo_turno_nombre,
                            hora_inicio: turnoFecha.hora_inicio,
                            hora_fin: turnoFecha.hora_fin,
                            dia_semana: turnoFecha.dia_semana,
                            tipo_jornada: turnoFecha.tipo_jornada_nombre,
                            es_nocturno: turnoFecha.tipo_jornada_nombre === 'Nocturna'
                        },
                        estado_asistencia: estadoAsistencia,
                        tiene_entrada: tieneEntrada,
                        tiene_salida: tieneSalida,
                        atraso: infoAtraso ? {
                            atrasado: infoAtraso.atrasado,
                            minutos_atraso: infoAtraso.minutos_atraso,
                            dentro_tolerancia: infoAtraso.dentro_tolerancia,
                            tolerancia_minutos: toleranciaEntradaMinutos,
                            llego_antes: infoAtraso.llego_antes,
                            minutos_anticipacion: infoAtraso.minutos_anticipacion,
                            hora_marcacion: marcacionEntrada.hora,
                            hora_turno: turnoFecha.hora_inicio
                        } : null,
                        salida: infoSalida ? {
                            salida_anticipada: infoSalida.salida_anticipada,
                            minutos_anticipados: infoSalida.minutos_anticipados,
                            hora_salida_esperada: infoSalida.hora_salida_esperada,
                            hora_salida_real: infoSalida.hora_salida_real,
                            compensacion_requerida: infoSalida.compensacion_requerida,
                            minutos_compensacion: infoSalida.minutos_compensacion,
                            hora_turno_fin: turnoFecha.hora_fin,
                            es_salida_dia_siguiente: turnoFecha.tipo_jornada_nombre === 'Nocturna' && fechaSalidaSiguiente !== null,
                            fecha_salida_dia_siguiente: fechaSalidaSiguiente
                        } : null
                    }
                } else {
                    // No hay turno asignado para este día (día libre/descanso)
                    
                    marcacionesConEstado[fecha] = {
                        marcaciones: marcacionesDia,
                        turno: null,
                        estado_asistencia: 'DIA_LIBRE',
                        tiene_entrada: false,
                        tiene_salida: false,
                        atraso: null
                    };
                }
            }
            
            // Verificar si hay turno para el día actual pero no hay marcaciones
            if (turnoActivo && !marcaciones.marcaciones[fechaInicio]) {
                marcacionesConEstado[fechaInicio] = {
                    marcaciones: [],
                    turno: {
                        id: turnoActivo.id,
                        nombre: turnoActivo.tipo_turno_nombre,
                        hora_inicio: turnoActivo.hora_inicio,
                        hora_fin: turnoActivo.hora_fin,
                        dia_semana: turnoActivo.dia_semana,
                        tipo_jornada: turnoActivo.tipo_jornada_nombre,
                        es_nocturno: turnoActivo.tipo_jornada_nombre === 'Nocturna'
                    },
                    estado_asistencia: 'NO_ASISTE',
                    tiene_entrada: false,
                    tiene_salida: false,
                    atraso: null
                };
            }
        } else {
            // No hay marcaciones, verificar si hay turno asignado
            if (turnoActivo) {
                marcacionesConEstado[fechaInicio] = {
                    marcaciones: [],
                    turno: {
                        id: turnoActivo.id,
                        nombre: turnoActivo.tipo_turno_nombre,
                        hora_inicio: turnoActivo.hora_inicio,
                        hora_fin: turnoActivo.hora_fin,
                        dia_semana: turnoActivo.dia_semana,
                        tipo_jornada: turnoActivo.tipo_jornada_nombre,
                        es_nocturno: turnoActivo.tipo_jornada_nombre === 'Nocturna'
                    },
                    estado_asistencia: 'NO_ASISTE',
                    tiene_entrada: false,
                    tiene_salida: false,
                    atraso: null
                };
            } else {
                // No hay turno ni marcaciones (día libre)
                marcacionesConEstado[fechaInicio] = {
                    marcaciones: [],
                    turno: null,
                    estado_asistencia: 'DIA_LIBRE',
                    tiene_entrada: false,
                    tiene_salida: false,
                    atraso: null
                };
            }
        }
        
        marcacionesAgrupadasPorUsuario[trabajador.id] = {
            trabajador: trabajador,
            marcaciones: marcacionesConEstado
        };
    }

    res.status(200).json({
        success: true,
        trabajadores: trabajadores,
        marcacionesAgrupadasPorUsuario: marcacionesAgrupadasPorUsuario,
        configuracion: {
            tolerancia_entrada_minutos: toleranciaEntradaMinutos
        }
    });

}

const obtenerAsistenciasDomingos = async (req, res) => {
    const empresaId = req.params.empresa_id;

    const fechaInicioParam = req.query.fecha_inicio;
    const fechaFinParam = req.query.fecha_fin;

    const estAsignaciones = await EstAsignacionesModel.getTrabajadoresByUsuariaId(empresaId);
    const trabajadoresEmpresa = await UsuarioEmpresaModel.getUsuariosByEmpresaId(empresaId);
    const trabajadores = [
        ...estAsignaciones.map(est => ({ ...est, es_est: true })),
        ...trabajadoresEmpresa.map(trabajador => ({ ...trabajador, es_est: false }))
    ].filter(trabajador => trabajador.usuario_rol_global !== 'empleador');
   
    // Obtener configuración de tolerancias de la empresa
    const configuracionTolerancia = await ConfigToleranciaModel.findByEmpresaId(empresaId);
    const toleranciaEntradaMinutos = configuracionTolerancia?.tolerancia_entrada || 0;
    
    // Configurar fechas: usar parámetros o fecha actual por defecto
    const fechaActualChile = DateTime.now().setZone('America/Santiago').toISODate();
    const fechaInicio = fechaInicioParam || fechaActualChile;
    const fechaFin = fechaFinParam || fechaInicio;
    
    const marcacionesAgrupadasPorUsuario = {};
    
    /**
     * Calcula si una marcación de entrada está atrasada
     */
    const calcularAtraso = (horaEntradaMarcacion, horaInicioTurno, toleranciaMinutos) => {
        const [horaM, minM, segM] = horaEntradaMarcacion.split(':').map(Number);
        const [horaT, minT, segT] = horaInicioTurno.split(':').map(Number);
        
        const minutosMarcacion = horaM * 60 + minM;
        const minutosTurno = horaT * 60 + minT;
        
        const diferenciaMinutos = minutosMarcacion - minutosTurno;
        
        const atrasado = diferenciaMinutos > 0;
        const minutos_atraso = Math.max(0, diferenciaMinutos);
        const dentro_tolerancia = diferenciaMinutos <= toleranciaMinutos;
        
        return {
            atrasado,
            minutos_atraso,
            dentro_tolerancia,
            llego_antes: diferenciaMinutos < 0,
            minutos_anticipacion: Math.max(0, -diferenciaMinutos)
        };
    };
    
    /**
     * Calcula si una marcación de salida fue anticipada
     */
    const calcularSalidaAnticipada = (horaSalidaMarcacion, horaFinTurno, horaEntradaMarcacion, horaInicioTurno, toleranciaMinutos) => {
        const [horaSM, minSM] = horaSalidaMarcacion.split(':').map(Number);
        const [horaFT, minFT] = horaFinTurno.split(':').map(Number);
        const [horaEM, minEM] = horaEntradaMarcacion.split(':').map(Number);
        const [horaIT, minIT] = horaInicioTurno.split(':').map(Number);
        
        const minutosSalidaMarcacion = horaSM * 60 + minSM;
        const minutosFinTurno = horaFT * 60 + minFT;
        const minutosEntradaMarcacion = horaEM * 60 + minEM;
        const minutosInicioTurno = horaIT * 60 + minIT;
        
        const atrasoEntrada = minutosEntradaMarcacion - minutosInicioTurno;
        
        let horaFinAjustada = minutosFinTurno;
        if (atrasoEntrada > toleranciaMinutos) {
            horaFinAjustada = minutosFinTurno + (atrasoEntrada - toleranciaMinutos);
        } else if (atrasoEntrada > 0 && atrasoEntrada <= toleranciaMinutos) {
            horaFinAjustada = minutosFinTurno;
        }
        
        const diferenciaMinutos = horaFinAjustada - minutosSalidaMarcacion;
        
        const salida_anticipada = diferenciaMinutos > 0;
        const minutos_anticipados = Math.max(0, diferenciaMinutos);
        
        const horaEsperada = Math.floor(horaFinAjustada / 60);
        const minutosEsperados = horaFinAjustada % 60;
        const hora_salida_esperada = `${String(horaEsperada).padStart(2, '0')}:${String(minutosEsperados).padStart(2, '0')}:00`;
        
        return {
            salida_anticipada,
            minutos_anticipados,
            hora_salida_esperada,
            hora_salida_real: horaSalidaMarcacion,
            compensacion_requerida: atrasoEntrada > toleranciaMinutos,
            minutos_compensacion: Math.max(0, atrasoEntrada - toleranciaMinutos)
        };
    };
    
    // Generar array con todas las fechas domingos en el rango
    const fechasInicio = DateTime.fromISO(fechaInicio);
    const fechasFin = DateTime.fromISO(fechaFin);
    const fechasDomingos = [];
    
    let fechaActual = fechasInicio;
    while (fechaActual <= fechasFin) {
        if (fechaActual.weekday === 7) { // domingo
            fechasDomingos.push(fechaActual.toISODate());
        }
        fechaActual = fechaActual.plus({ days: 1 });
    }
    
    // Para turnos nocturnos: extender búsqueda al siguiente día
    // para capturar salidas que ocurren al día siguiente
    let fechaFinExtendida = fechaFin;
    if (fechasDomingos.length > 0) {
        // Si hay domingos, extender hasta el siguiente día del último domingo
        const ultimoDomingo = fechasDomingos[fechasDomingos.length - 1];
        fechaFinExtendida = DateTime.fromISO(ultimoDomingo).plus({ days: 1 }).toISODate();
    }
    
    for (const trabajador of trabajadores) {    
        const marcaciones = await MarcacionesServices.obtenerMarcacionesPorUsuario(trabajador.id, fechaInicio, fechaFin);
        
        const TurnosModel = (await import('../model/TurnosModel.js')).default;
        
        const marcacionesConEstado = {};
        
        // Verificar cada domingo en el rango de fechas
        for (const fechaDomingo of fechasDomingos) {
            const turnoFecha = await TurnosModel.obtenerTurnoPorUsuarioYFecha(trabajador.id, fechaDomingo);
            
            // Solo procesar si tiene turno asignado para el domingo
            if (turnoFecha) {
                const marcacionesDia = marcaciones.success && marcaciones.marcaciones 
                    ? marcaciones.marcaciones[fechaDomingo] || []
                    : [];
                
                // Para turnos nocturnos, buscar entrada en día actual y salida en día siguiente
                let marcacionEntrada = marcacionesDia.find(m => m.tipo === 'entrada');
                let marcacionSalida = null;
                let fechaSalidaSiguiente = null;
                
                if (turnoFecha.tipo_jornada_nombre === 'Nocturna') {
                    // Para turnos nocturnos: SIEMPRE buscar salida en el día siguiente
                    // porque la salida pertenece al próximo día (ej: entrada 17:00 del domingo, salida 08:00 del lunes)
                    const fechaSiguiente = DateTime.fromISO(fechaDomingo).plus({ days: 1 }).toISODate();
                    if (marcaciones.marcaciones && marcaciones.marcaciones[fechaSiguiente]) {
                        const marcacionesSiguiente = marcaciones.marcaciones[fechaSiguiente];
                        const posibleSalida = marcacionesSiguiente.find(m => m.tipo === 'salida');
                        if (posibleSalida) {
                            marcacionSalida = posibleSalida;
                            fechaSalidaSiguiente = fechaSiguiente;
                        }
                    }
                } else {
                    // Para turnos diurnos, la salida está en el mismo día
                    marcacionSalida = marcacionesDia.find(m => m.tipo === 'salida');
                }
                
                const tieneEntrada = !!marcacionEntrada;
                const tieneSalida = !!marcacionSalida;
                
                let infoAtraso = null;
                let infoSalida = null;
                let estadoAsistencia = 'NO_ASISTE';
                
                if (tieneEntrada) {
                    infoAtraso = calcularAtraso(
                        marcacionEntrada.hora, 
                        turnoFecha.hora_inicio, 
                        toleranciaEntradaMinutos
                    );
                    
                    if (tieneSalida) {
                        infoSalida = calcularSalidaAnticipada(
                            marcacionSalida.hora,
                            turnoFecha.hora_fin,
                            marcacionEntrada.hora,
                            turnoFecha.hora_inicio,
                            toleranciaEntradaMinutos
                        );
                    }
                    
                    if (infoAtraso.atrasado && !infoAtraso.dentro_tolerancia) {
                        estadoAsistencia = 'TARDANZA';
                    } else {
                        estadoAsistencia = 'PRESENTE';
                    }
                }
                
                marcacionesConEstado[fechaDomingo] = {
                    marcaciones: marcacionesDia,
                    turno: {
                        id: turnoFecha.id,
                        nombre: turnoFecha.tipo_turno_nombre,
                        hora_inicio: turnoFecha.hora_inicio,
                        hora_fin: turnoFecha.hora_fin,
                        dia_semana: turnoFecha.dia_semana,
                        tipo_jornada: turnoFecha.tipo_jornada_nombre,
                        es_nocturno: turnoFecha.tipo_jornada_nombre === 'Nocturna'
                    },
                    estado_asistencia: estadoAsistencia,
                    tiene_entrada: tieneEntrada,
                    tiene_salida: tieneSalida,
                    es_domingo: true,
                    atraso: infoAtraso ? {
                        atrasado: infoAtraso.atrasado,
                        minutos_atraso: infoAtraso.minutos_atraso,
                        dentro_tolerancia: infoAtraso.dentro_tolerancia,
                        tolerancia_minutos: toleranciaEntradaMinutos,
                        llego_antes: infoAtraso.llego_antes,
                        minutos_anticipacion: infoAtraso.minutos_anticipacion,
                        hora_marcacion: marcacionEntrada.hora,
                        hora_turno: turnoFecha.hora_inicio
                    } : null,
                    salida: infoSalida ? {
                        salida_anticipada: infoSalida.salida_anticipada,
                        minutos_anticipados: infoSalida.minutos_anticipados,
                        hora_salida_esperada: infoSalida.hora_salida_esperada,
                        hora_salida_real: infoSalida.hora_salida_real,
                        compensacion_requerida: infoSalida.compensacion_requerida,
                        minutos_compensacion: infoSalida.minutos_compensacion,
                        hora_turno_fin: turnoFecha.hora_fin,
                        es_salida_dia_siguiente: turnoFecha.tipo_jornada_nombre === 'Nocturna' && fechaSalidaSiguiente !== null,
                        fecha_salida_dia_siguiente: fechaSalidaSiguiente
                    } : null
                }
            }
        }
        
        // Solo agregar trabajadores que tienen turnos de domingos (con o sin marcaciones)
        if (Object.keys(marcacionesConEstado).length > 0) {
            marcacionesAgrupadasPorUsuario[trabajador.id] = {
                trabajador: trabajador,
                marcaciones: marcacionesConEstado
            };
        }
    }

    res.status(200).json({
        success: true,
        trabajadores: trabajadores.filter(t => marcacionesAgrupadasPorUsuario[t.id]),
        marcacionesAgrupadasPorUsuario: marcacionesAgrupadasPorUsuario,
        configuracion: {
            tolerancia_entrada_minutos: toleranciaEntradaMinutos
        },
        filtro: 'solo_domingos'
    });
}

const enviarCorreoEmpleador = async (req, res) => {
    try {
        const { empresa_id } = req.params;
        
        const primerEmpleadorActivo = await UsuarioEmpresaModel.getPrimerEmpleadorActivoByEmpresaId(empresa_id);
        const correo = primerEmpleadorActivo ? primerEmpleadorActivo.usuario_email : null;
        console.log('Empleador activo encontrado:', correo);
        if (!primerEmpleadorActivo) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró un empleador activo para la empresa proporcionada'
            });
        }

        const resultadoEnvio = await NotificacionService.enviarCorreoNotificacionEmpleador(correo);
        if (!resultadoEnvio.success) {
            return res.status(500).json({
                success: false,
                message: 'Error al enviar el correo al empleador',
                error: resultadoEnvio.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Correo enviado exitosamente al empleador'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}


const obtenerReporteModificaciones = async (req, res) => {
    try {
        const empresaId = req.params.empresa_id;
        const empleadores = await UsuarioEmpresaModel.getUsuariosByRolEnEmpresa(empresaId, 'empleador');
        // Obtener información de la empresa
        const empresa = await EmpresaModel.getEmpresaById(empresaId);
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }
    
        // Obtener modificaciones de marcaciones para la empresa
        const todasLasModificaciones = [];
        
        for (const empleador of empleadores) {
            const modificaciones = await AuditoriaModel.obtenerCambiosPorUsuarioYAccion(empleador.usuario_id, 'modificar_turno_trabajador', empresaId);
            
            // Procesar cada modificación para extraer solo los datos necesarios
            for (const modificacion of modificaciones) {



                
                // agregar created_at de la tabla asignacion de turnos para ambos turnos el nuevo y el anterior
                const asignacionAnterior = await AsignacionTurnosModel.getById(modificacion.datos_anteriores.id);
                const asignacionNueva = await AsignacionTurnosModel.getById(modificacion.datos_nuevos.id);

               
                // agregar los dias en que trabaja en ese turno

                const detalleDiasTurnoAnterior = await TipoTurnosModel.getDetalleDiasPorTipoTurnoId(modificacion.datos_anteriores.tipo_turno_id);
                const detalleDiasTurnoNuevo = await TipoTurnosModel.getDetalleDiasPorTipoTurnoId(modificacion.datos_nuevos.tipo_turno_id);


                console.log('Detalle dias turno anterior:', detalleDiasTurnoAnterior);
                console.log('Detalle dias turno nuevo:', detalleDiasTurnoNuevo);

                const modificacionProcesada = {
                    id: modificacion.id,
                    usuario_id: modificacion.usuario_id,
                    accion: modificacion.accion,
                    tabla_afectada: modificacion.tabla_afectada,
                    registro_id: modificacion.registro_id,
                    descripcion: modificacion.descripcion,
                    fecha_cambio: modificacion.fecha_cambio,
                    ip_address: modificacion.ip_address,
                    solicitante: 'empleador',
                    empleador: {
                    nombre: modificacion.nombre,
                    apellido_pat: modificacion.apellido_pat,
                    apellido_mat: modificacion.apellido_mat,
                    email: modificacion.email,
                    rol: modificacion.rol,
                    },
                    datos_anteriores: {
                    fecha_inicio: modificacion.datos_anteriores.fecha_inicio,
                    tipo_turno_id: modificacion.datos_anteriores.tipo_turno_id,
                    usuario_empresa_id: modificacion.datos_anteriores.usuario_empresa_id,
                    tipo_turno_nombre: modificacion.datos_anteriores.tipo_turno_nombre,
                    fecha_asignacion: asignacionAnterior.created_at,
                    hora_inicio: asignacionAnterior.hora_inicio,
                    hora_fin: asignacionAnterior.hora_fin,
                    colacion_inicio: asignacionAnterior.colacion_inicio,
                    colacion_fin: asignacionAnterior.colacion_fin,
                    detalle_dias_turno: detalleDiasTurnoAnterior
                    },
                    datos_nuevos: {
                    fecha_inicio: modificacion.datos_nuevos.fecha_inicio,
                    tipo_turno_id: modificacion.datos_nuevos.tipo_turno_id,
                    usuario_empresa_id: modificacion.datos_nuevos.usuario_empresa_id,
                    tipo_turno_nombre: modificacion.datos_nuevos.tipo_turno_nombre,
                    fecha_asignacion: asignacionNueva.created_at,
                    hora_inicio: asignacionNueva.hora_inicio,
                    hora_fin: asignacionNueva.hora_fin,
                    colacion_inicio: asignacionNueva.colacion_inicio,
                    colacion_fin: asignacionNueva.colacion_fin    ,
                    detalle_dias_turno: detalleDiasTurnoNuevo,
                    },
            };


            
            todasLasModificaciones.push(modificacionProcesada);
            }
        }
        
        for (const modificacion of todasLasModificaciones) {
            // agregar datos de trabajador en base a datos_anteriores.usuario_empresa_id
            const trabajador = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(modificacion.datos_anteriores.usuario_empresa_id);
            modificacion.trabajador = {
                nombre: trabajador.usuario_nombre,
                apellido_pat: trabajador.usuario_apellido_pat,
                apellido_mat: trabajador.usuario_apellido_mat,
                email: trabajador.usuario_email,
                rut: trabajador.usuario_rut
            };


        }

        console.log('Modificaciones procesadas:', todasLasModificaciones);
        
        // Calcular estadísticas
        const stats = {
            total: todasLasModificaciones.length,
            porEmpleador: todasLasModificaciones.filter(m => m.empleador?.rol === 'empleador').length,
            porTrabajador: todasLasModificaciones.filter(m => m.empleador?.rol === 'trabajador').length,
            modificaciones: todasLasModificaciones.length
        };

        res.status(200).json({
            success: true,
            message: 'Reporte de modificaciones obtenido exitosamente',
            empresa: {
                id: empresa.empresa_id,
                razonSocial: empresa.emp_nombre,
                rut: empresa.emp_rut
            },
            modificaciones: todasLasModificaciones,
            stats: stats
        });
    } catch (error) {
        console.error('Error al obtener reporte de modificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte de modificaciones',
            error: error.message
        });
    }
};

        
        

const FiscalizadorController = {
  solicitarAcceso,
  validarCodigo,
  cerrarSesion,
  obtenerDatosEmpresa,
    obtenerAsistencias,
    obtenerAsistenciasDomingos  ,
    enviarCorreoEmpleador,
    obtenerReporteModificaciones
}


export default FiscalizadorController;