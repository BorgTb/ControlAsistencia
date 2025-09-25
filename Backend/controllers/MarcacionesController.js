import MarcacionesService from '../services/MarcacionesServices.js';
import NotificacionService from '../services/NotificacionService.js';
import TurnosModel from '../model/TurnosModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import {DateTime} from 'luxon'


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





// Función genérica para registrar marcaciones (entrada/salida)
const registrarMarcacion = async (req, res) => {
    try {
        const { geo_lat, geo_lon, location_quality, ip_cliente, domicilio_prestacion, tipo } = req.body;
        const usuario_id = req.user?.id;
        
        // Validar tipo de marcación
        if (!['entrada', 'salida'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de marcación no válido. Debe ser "entrada" o "salida".'
            });
        }

        if (!usuario_id || !geo_lat || !geo_lon || !location_quality || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: `Faltan datos requeridos para registrar la ${tipo}.`
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

        // Validación de horario solo para entrada
        if (tipo === 'entrada') {
            const horaActual = DateTime.now().setZone('America/Santiago').toFormat('HH:mm:ss');
            
            // verifica si turno.fin es menor que turno.inicio, si es asi significa que el turno termina al dia siguiente
            if (turno.fin < turno.inicio) {
                // Si es así, la hora actual debe ser mayor que turno.inicio
                if (horaActual < turno.inicio) {
                    return res.status(400).json({
                        success: false,
                        message: 'No se puede registrar la entrada fuera del horario del turno.'
                    });
                }
            } else if (horaActual > turno.fin) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede registrar la entrada fuera del horario del turno.'
                });
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

        // Calcular diferencia de tiempo con respecto al turno
        const horaReferencia = tipo === 'entrada' ? turno.inicio : turno.fin;
        const diferencia = calcularDiferenciaHoras(horaReferencia, marcacion.data.hora);
        
        if (!diferencia.esNegativo && diferencia.totalSegundos > 0) {
            result.tarde = true;
            result.diferencia = diferencia.formato;
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
    try {
        const { geo_lat, geo_lon, ip_cliente } = req.body;
        const usuario_id = req.user?.id;
        
        if (!usuario_id || !geo_lat || !geo_lon || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para registrar la colación.'
            });
        }
        

        const userEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id);
        if (!userEmpresa) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la información de la empresa del usuario.'
            });
        }

        const result = await MarcacionesService.registrarMarcacion(
            userEmpresa.id, 'colacion', geo_lat, geo_lon, ip_cliente
        );
        if (!result.success) {
            return res.status(500).json(result);
        }
        // Procesar notificación de colación de forma asíncrona (no bloquea la respuesta)
        NotificacionService.procesarNotificacionMarcacion(usuario_id, result.data.id)
            .catch(error => console.error('Error en notificación de colación:', error));
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en registrarColacion:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const registrarTerminoColacion = async (req, res) => {
    try {
        const { geo_lat, geo_lon, ip_cliente } = req.body;
        const usuario_id = req.user?.id;
        
        if (!usuario_id || !geo_lat || !geo_lon || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para terminar la colación.'
            });
        }
        
    const userEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id);
        if (!userEmpresa) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la información de la empresa del usuario.'
            });
        }

        // Verificar que tiene una colación activa
        const tieneColacionActiva = await MarcacionesService.verificarColacionActiva(userEmpresa.id);

        if (!tieneColacionActiva) {
            return res.status(400).json({
                success: false,
                message: 'No tienes una colación activa para terminar.'
            });
        }
        
        

        

        // Cambiar 'termino_colacion' por 'colacion'
        const result = await MarcacionesService.registrarMarcacion(
            userEmpresa.id, 'colacion', geo_lat, geo_lon, ip_cliente
        );
        
        if (!result.success) {
            return res.status(500).json(result);
        }
        
        // Procesar notificación de término de colación de forma asíncrona
        NotificacionService.procesarNotificacionMarcacion(usuario_id, result.data.id)
            .catch(error => console.error('Error en notificación de término de colación:', error));
        
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Error en registrarTerminoColacion:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
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

        if (!turno) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No hay horario asignado para hoy'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: {
                tipo: turno.tipo,
                inicio: turno.inicio,
                fin: turno.fin,
                fecha: turno.fecha,
                colacion_inicio: turno.colacion_inicio,
                colacion_fin: turno.colacion_fin
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
    obtenerMarcacionPorUserId
}

export default MarcacionesController;