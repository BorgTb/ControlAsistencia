import MarcacionesService from '../services/MarcacionesServices.js';
import NotificacionService from '../services/NotificacionService.js';
import TurnosModel from '../model/TurnosModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import {DateTime} from 'luxon'
import AuthService from '../services/authservice.js';
import ReporteMarcionesModel from '../model/ReportesModel.js';
import ConfigToleranciaModel from '../model/ConfigTolerancias.js';




function calcularDiferenciaHoras(hora1, hora2) {
    // Función auxiliar para convertir hh:mm:ss a segundos totales
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
            throw new Error('Hora inválida');
        }
        
        return horas * 3600 + minutos * 60 + segundos;
    }
    
    // Función auxiliar para convertir segundos a formato hh:mm:ss
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





// Función genérica para registrar marcaciones (entrada/salida/colacion)
const registrarMarcacion = async (req, res) => {
    try {
        const { geo_lat, geo_lon, location_quality, ip_cliente, domicilio_prestacion, tipo } = req.body;
        const usuario_id = req.user?.id;
        
        // Validar tipo de marcación
        if (!['entrada', 'salida', 'colacion'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de marcación no válido. Debe ser "entrada", "salida" o "colacion".'
            });
        }

        if (!usuario_id || !geo_lat || !geo_lon || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: `Faltan datos requeridos para registrar la ${tipo}.`
            });
        }

        // location_quality es requerido solo para entrada y salida
        if (['entrada', 'salida'].includes(tipo) && !location_quality) {
            return res.status(400).json({
                success: false,
                message: `El parámetro location_quality es requerido para registrar la ${tipo}.`
            });
        }

        const usuarioEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id);
        if (!usuarioEmpresa) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la información de la empresa del usuario.'
            });
        }

        const fechaHoy = DateTime.now().setZone('America/Santiago').toISODate();
        const turno = await TurnosModel.obtenerTurnoPorUsuarioYFecha(usuarioEmpresa.id, fechaHoy);

        if (!turno) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró un turno asociado al usuario.'
            });
        }
        
        const horaActual = DateTime.now().setZone('America/Santiago').toFormat('HH:mm:ss');
        
        // Validación de horario solo para entrada
        if (tipo === 'entrada') {    
            // verifica si turno.hora_fin es menor que turno.hora_inicio, si es asi significa que el turno termina al dia siguiente
            if (turno.hora_fin < turno.hora_inicio) {
                // Si es así, la hora actual debe ser mayor que turno.hora_inicio
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
        
        // Validación específica para colación
        if (tipo === 'colacion') {
            const tieneColacionActiva = await MarcacionesService.verificarColacionActiva(usuarioEmpresa.id);
            
            // Si no tiene colación activa, está iniciando colación
            if (!tieneColacionActiva) {
                // Validar que esté dentro del horario de colación del turno
                if (turno.colacion_inicio && turno.colacion_fin) {
                    // TODO: Agregar validación de horario de colación
                    console.log('Iniciando colación dentro del horario permitido');
                }
            } else {
                // Si tiene colación activa, está terminando colación
                console.log('Terminando colación');
            }
        }
        
        // Validar tolerancia 
        if (['entrada'].includes(tipo)) {
            console.log("Validando tolerancia para tipo:", tipo);
            const horaReferencia = tipo === 'entrada' ? turno.hora_inicio : turno.hora_fin;
            const diferencia = calcularDiferenciaHoras(horaReferencia, horaActual);
            if (diferencia.totalSegundos > 0) {
                const minutosDiferencia = Math.floor(diferencia.totalSegundos / 60);
                const toleranciaResult = await ConfigToleranciaModel.validarTolerancia(usuarioEmpresa.empresa_id, tipo, minutosDiferencia);
                if (!toleranciaResult.valido) {
                    return res.status(400).json({
                        success: false,
                        message: `No se puede registrar la ${tipo} fuera de la tolerancia permitida. ${toleranciaResult.mensaje}`
                    });
                }
                console.log(`Marcación de ${tipo} dentro de tolerancia:`, toleranciaResult);
            } else {
                console.log(`Marcación de ${tipo} a tiempo o anticipada. Diferencia:`, diferencia.formato);
            }  
        }

        const result = await MarcacionesService.registrarMarcacion(
            usuarioEmpresa.id, tipo, geo_lat, geo_lon, ip_cliente
        );

        if (!result.success) {
            return res.status(500).json(result);
        }

        const marcacion = await MarcacionesService.obtenerMarcacionPorId(result.data.id);
        if (!marcacion) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la marcación registrada.'
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

        // Lógica específica para entrada (lugar y domicilio)
        let lugar = null;
        if (tipo === 'entrada') {
            lugar = await UsuarioEmpresaModel.obtenerEmpresaLugarAproximado(result.data.id, usuarioEmpresa.empresa_id);

            if (domicilio_prestacion) {
                await MarcacionesService.agregarDomicilioPrestacion(result.data.id, domicilio_prestacion);
                lugar = null; // si se agrega un domicilio de prestación, no es necesario enviar el lugar aproximado
            } else if (lugar && lugar.lugar_id) {
                MarcacionesService.agregarLugarMarcacion(result.data.id, lugar.lugar_id);
            }
        }

        // Procesar notificación de forma asíncrona (no bloquea la respuesta)
        const notificationArgs = tipo === 'entrada' 
            ? [usuario_id, result.data.id, usuarioEmpresa, lugar, domicilio_prestacion]
            : [usuario_id, result.data.id, usuarioEmpresa];
            
        NotificacionService.procesarNotificacionMarcacion(...notificationArgs)
            .catch(error => console.error(`Error en notificación de ${tipo}:`, error));

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
        const fechaActual = DateTime.now().setZone('America/Santiago');
        const fecha = req.query.fecha || fechaActual.toISODate();

        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no identificado'
            });
        }
        const userEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id);
        const result = await MarcacionesService.obtenerMarcacionesPorUsuario(userEmpresa.id, fecha);
        // si tiene entrada y salida, devolver que 

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
        const usuarioEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id);
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
        console.log("Turno encontrado", turno);
        if (!turno) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No hay horario asignado para hoy'
            });
        }
        console.log(turno);
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
                dias_descanso: turno.dias_descanso
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

        const userEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(id);
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

        console.log('🔄 Iniciando modificación de marcación:', {
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

        // Obtener la marcación original antes de modificarla
        const marcacionOriginal = await MarcacionesService.obtenerMarcacionPorId(id);
        if (!marcacionOriginal || !marcacionOriginal.success) {
            return res.status(404).json({
                success: false,
                message: 'Marcación no encontrada'
            });
        }

        console.log('📋 Marcación original encontrada:', marcacionOriginal.data);

        // Obtener información del usuario empresas (trabajador)
        const usuarioEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(usuario_id);
        if (!usuarioEmpresa) {
            return res.status(404).json({
                success: false,
                message: 'Usuario empresa no encontrado'
            });
        }

        console.log('👤 Usuario empresa encontrado:', usuarioEmpresa);

        // Verificar que el usuario solicitante tiene permisos para modificar marcaciones de este trabajador
        const [empresaSolicitante] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        if (!empresaSolicitante || empresaSolicitante.empresa_id !== usuarioEmpresa.empresa_id) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para modificar marcaciones de este trabajador'
            });
        }

        // Crear reporte de solicitud de modificación
        const newReporteId = await ReporteMarcionesModel.createPorConfirmar({
            marcacion_id: marcacionOriginal.data.id,
            usuario_id: usuarioEmpresa.id,
            tipo: 'modificar',
            tipo_problema: "Modificación de Marcación",
            descripcion: motivo,
            fecha_correcta: fecha,
            hora_correcta: hora,
            tipo_marcacion_correcta: tipo
        });

        console.log('📝 Reporte de modificación creado con ID:', newReporteId);

        // Enviar notificación por correo de forma asíncrona
        NotificacionService.procesarNotificacionModificacionMarcacion(
            usuarioEmpresa, marcacionOriginal.data, req.body, newReporteId
        ).catch(error => console.error('Error en notificación de modificación de marcación:', error));

        console.log('✅ Solicitud de modificación procesada exitosamente');

        return res.status(200).json({
            success: true,
            message: 'Solicitud de modificación enviada correctamente. Será revisada por un supervisor.',
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
        console.error('❌ Error en modificarMarcacionPorId:', error);
        console.error('📋 Stack trace:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}


const obtenerReporteMarcacionId = async (req,res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'El token es requerido'
            });
        }

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
            


        const infoData = {
            reporte_id: reporte.id,
            tipo_problema : reporte.tipo_problema,
            fecha_correcta : reporte.fecha_correcta ? reporte.fecha_correcta : null,
            hora_correcta : reporte.hora_correcta ? reporte.hora_correcta : null,
            tipo : reporte.tipo,
            user_nombre : userSolicitante.usuario_nombre,
            user_apellido_pat: userSolicitante.usuario_apellido_pat,
            user_apellido_mat: userSolicitante.usuario_apellido_mat,
            user_email : userSolicitante.usuario_nombre,
            user_rut : userSolicitante.usuario_rut,
            user_empresa : userSolicitante.empresa_nombre,
            user_empresa_rut : userSolicitante.empresa_rut,
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
    }catch (error) {
        console.error('Error en obtenerReporteMarcacionId:', error);
        throw new Error('Error interno del servidor');
    }
}

const aceptarModificacionMarcacion = async (req, res) => {
    try {
        const { token } = req.body;
        
       const { id } = AuthService.verifyToken(token);

        const reporte = await ReporteMarcionesModel.findById(id);
        console.log("aceptarModificacionMarcacion id:", id);

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }



        if (reporte.tipo === 'agregar') {
            // Lógica para aceptar adición de marcación
            await MarcacionesService.insertarMarcacionManual(reporte.usuario_id,reporte.tipo_marcacion_correcta,reporte.fecha_correcta,reporte.hora_correcta);
        } else if (reporte.tipo === 'modificar') {
            // Lógica para aceptar modificación de marcación
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
        

        res.status(501).json({
            success: true,
            message: 'En desarrollo',
        });


        // Obtener la marcación original antes de modificarla
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

         const { id } = AuthService.verifyToken(token);

         await ReporteMarcionesModel.rechazar(id);


         // opcional se podria enviar un correo notificando el rechazo al usuario

        return res.status(501).json({
            success: true,
            message: 'En desarrollo',
        });
        // Obtener la marcación original antes de modificarla
    } catch (error) {
        console.error('Error en rechazarModificacionMarcacion:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

const agregarMarcacionManual = async (req, res) => {
    try {
        const { usuario_id, tipo, fecha, hora, motivo } = req.body;
        // Validar datos requeridos
        if (!usuario_id || !tipo || !fecha || !hora || !motivo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos: usuario_id, tipo, fecha, hora y motivo son obligatorios'
            });
        }

        console.log(usuario_id);


        // Se genera una solicitud en la base de datos y se envia un correo para que el trabajador la acepte
       const id = await ReporteMarcionesModel.createPorConfirmar({
            marcacion_id: null,
            usuario_id: usuario_id,
            tipo: 'agregar',
            fecha_correcta: fecha,
            hora_correcta: hora,
            descripcion: motivo,
            tipo_problema: "Adición de Marcación",
            tipo_marcacion_correcta: tipo
        });


        const reporte = await ReporteMarcionesModel.findById(id);
        const usuario = await UsuarioEmpresaModel.obtenerUsuarioByID(reporte.usuario_id);
        await NotificacionService.enviarNotificacionConfirmacionNuevaMarcacion(reporte, {tipo: 'agregar', fechaNueva: fecha, horaNueva: hora, tipoNueva: tipo, usuario: usuario});
        
        return res.status(501).json({
            success: true,
            message: 'En desarrollo',
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

        console.log(`🕒 Calculando horas semanales para usuario_empresa_id: ${usuario_empresa_id}`);
        
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
    obtenerHorasSemanales
}

export default MarcacionesController;