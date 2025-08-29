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





const registrarEntrada = async (req, res) => {
    try {
        const { geo_lat, geo_lon, location_quality, ip_cliente } = req.body;
        const usuario_id = req.user?.id;
        
        if (!usuario_id || !geo_lat || !geo_lon || !location_quality || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para registrar la entrada.'
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
        console.log('Turno obtenido:', turno);

        if (!turno){
            return res.status(404).json({
                success: false,
                message: 'No se encontró un turno asociado al usuario.'
            });
        }

        

        //verificamos si la hora actual es mayor a la hora de salida
        const horaActual = DateTime.now().setZone('America/Santiago').toFormat('HH:mm:ss');
        if (horaActual > turno.fin) {
            return res.status(400).json({
                success: false,
                message: 'No se puede registrar la entrada fuera del horario del turno.'
            });
        }

        const result = await MarcacionesService.registrarMarcacion(
            usuarioEmpresa.id, 'entrada', geo_lat, geo_lon, ip_cliente
        ); 
        const marcacion = await MarcacionesService.obtenerMarcacionPorId(result.data.id);
        

        
        // comparar turno.inicio con marcacion.hora ambos en formato str hh:mm:ss y ver la diferencia de tiempo
        const diferencia = calcularDiferenciaHoras(turno.inicio, marcacion.data.hora);

        if (!result.success) {
            return res.status(500).json(result);
        }
        
        
        // Procesar notificación de forma asíncrona (no bloquea la respuesta)
        NotificacionService.procesarNotificacionMarcacion(usuario_id, result.data.id)
            .catch(error => console.error('Error en notificación:', error));



        if (!diferencia.esNegativo && diferencia.totalSegundos > 0) {
            result.tarde = true;
            result.diferencia = diferencia.formato;
        }


        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Error en registrarEntrada:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const registrarSalida = async (req, res) => {
    try {
        const { geo_lat, geo_lon, location_quality, ip_cliente } = req.body;
        const usuario_id = req.user?.id;

        if (!usuario_id || !geo_lat || !geo_lon || !location_quality || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para registrar la salida.'
            });
        }
        
        console.log('Datos recibidos para registrar salida:', {
            usuario_id,
            geo_lat,
            geo_lon,
            location_quality,
            ip_cliente
        });

        const usuarioEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id);
        if (!usuarioEmpresa) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la información de la empresa del usuario.'
            });
        }

        const result = await MarcacionesService.registrarMarcacion(
            usuarioEmpresa.id, 
            'salida', 
            geo_lat, 
            geo_lon, 
            ip_cliente
        );


        const fechaHoy = DateTime.now().setZone('America/Santiago').toISODate();
        const turno = await TurnosModel.obtenerTurnoPorUsuarioYFecha(usuarioEmpresa.id, fechaHoy);

        if (!turno){
            return res.status(404).json({
                success: false,
                message: 'No se encontró un turno asociado al usuario.'
            });
        }

        const marcacion = await MarcacionesService.obtenerMarcacionPorId(result.data.id);
        // comparar turno.inicio con marcacion.hora ambos en formato str hh:mm:ss y ver la diferencia de tiempo
        const diferencia = calcularDiferenciaHoras(turno.inicio, marcacion.data.hora);

        if (!diferencia.esNegativo && diferencia.totalSegundos > 0) {
            result.tarde = true;
            result.diferencia = diferencia.formato;
        }

        if (!marcacion) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la marcación registrada.'
            });
        }

        

        if (!result.success) {
            return res.status(500).json(result);
        }

        // Procesar notificación de salida de forma asíncrona (no bloquea la respuesta)
        NotificacionService.procesarNotificacionMarcacion(usuario_id, result.data.id)
            .catch(error => console.error('Error en notificación de salida:', error));

        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Error en registrarSalida:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const registrarColacion = async (req, res) => {
    try {
        const { geo_lat, geo_lon, ip_cliente } = req.body;
        const usuario_id = req.user?.id;
        console.log(req)
        if (!usuario_id || !geo_lat || !geo_lon || !ip_cliente) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para registrar la colación.'
            });
        }
        console.log('Datos recibidos para registrar colación:', {
            usuario_id, geo_lat, geo_lon, ip_cliente
        });


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
        
        console.log('Datos recibidos para terminar colación:', {
            usuario_id, geo_lat, geo_lon, ip_cliente
        });
        

        

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
        const fechaActual = new Date();
        const fecha = req.query.fecha || fechaActual.toISOString().split('T')[0];
        console.log('Fecha consultada:', fecha);

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
        
        const result = await MarcacionesService.obtenerMarcacionesPorEmpresa(rutEmpresa);
        
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