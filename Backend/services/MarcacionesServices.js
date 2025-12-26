import { Console } from 'console';
import MarcacionesModel from '../model/MarcacionesModel.js';
import crypto from 'crypto';
import UserModel from '../model/UserModel.js';
import EstAsignacionesModel from '../model/EstAsignacionesModel.js';
import NotificacionService from './NotificacionService.js';
import { DateTime } from 'luxon';
import TurnosModel from '../model/TurnosModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import ConfigToleranciaModel from '../model/ConfigTolerancias.js';
import HorasExtrasModel from '../model/HorasExtrasModel.js';
import PreferenciasCompensacionModel from '../model/PreferenciasCompensacionModel.js';
import ReporteMarcionesModel from '../model/ReportesModel.js';

class MarcacionesService {
    // Función auxiliar para normalizar valores undefined/null
    normalizeValue(value, parseAsFloat = false) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        if (parseAsFloat) {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
        }

        return value;
    }

    /**
     * Calcula la diferencia entre dos horas
     * @param {string} hora1 - Primera hora en formato HH:mm:ss
     * @param {string} hora2 - Segunda hora en formato HH:mm:ss
     * @returns {Object} - Objeto con la diferencia formateada y metadata
     */
    calcularDiferenciaHoras(hora1, hora2) {
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

    /**
     * Calcula las horas extras en base a la hora de salida y la configuración de tolerancias
     * @param {string} horaSalida - Hora de salida real (HH:mm:ss)
     * @param {string} horaFinTurno - Hora de fin del turno (HH:mm:ss)
     * @param {number} toleranciaSalida - Tolerancia en minutos para la salida
     * @returns {Object|null} - Objeto con hora_inicio y hora_fin de las horas extras o null si no hay
     */
    calcularHorasExtras(horaSalida, horaFinTurno, toleranciaSalida = 0) {
        // Función auxiliar para convertir hh:mm:ss a minutos totales
        function horaAMinutos(horaStr) {
            const [horas, minutos, segundos = 0] = horaStr.split(':').map(Number);
            return horas * 60 + minutos + Math.floor(segundos / 60);
        }

        // Función auxiliar para convertir minutos a formato hh:mm:ss
        function minutosAHora(minutosTotales) {
            const horas = Math.floor(minutosTotales / 60);
            const minutos = minutosTotales % 60;
            return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
        }

        try {
            const salidaEnMinutos = horaAMinutos(horaSalida);
            const finTurnoEnMinutos = horaAMinutos(horaFinTurno);

            // Calcular el fin del turno con tolerancia
            const finTurnoConTolerancia = finTurnoEnMinutos + toleranciaSalida;

            // Si la salida es después del fin del turno + tolerancia, hay horas extras
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

    /**
     * Inserta una marcación manual con toda la lógica de negocio
     * @param {number} usuario_empresa_id - ID del usuario_empresa
     * @param {string} tipo - Tipo de marcación
     * @param {string} fecha - Fecha de la marcación
     * @param {string} hora - Hora de la marcación
     * @param {string} motivo - Motivo de la marcación manual (opcional)
     * @param {number} usuario_id - ID del usuario (para reportes y notificaciones)
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async insertarMarcacionManual(usuario_empresa_id, tipo, fecha, hora, motivo = null, usuario_id = null) {
        try {
            // validar si el usuario que marca esta ligado a una est si es asi agregar mandante_id en la marcacion 
            const asignaciones = await EstAsignacionesModel.getActiveByUsuarioEmpresaId(usuario_empresa_id);
            console.log('Asignaciones encontradas para el usuario:', asignaciones);

            // Validar y normalizar datos
            const marcacionData = {
                usuario_empresa_id: usuario_empresa_id,
                mandante_id: asignaciones > 0 && asignaciones.length > 0 ? asignaciones[0].mandante_id : null,
                fecha: fecha,
                hora: hora,
                tipo: tipo,
                hash: crypto.createHash('sha256').
                    update(`${usuario_empresa_id}-${tipo}-${Math.random()}-${Date.now()}`).
                    digest('hex'),
            };

            // Crear la marcación usando el modelo
            const result = await MarcacionesModel.insertarMarcacionManual(marcacionData);

            const responseData = {
                success: true,
                message: `Marcación ${tipo} insertada correctamente`,
                data: {
                    id: result.insertId,
                    tipo: tipo,
                    hash: marcacionData.hash,
                }
            };

            // Si se proporciona motivo y usuario_id, crear reporte y enviar notificación
            if (usuario_id) {
                try {
                    // Crear el reporte
                    const reporteId = await ReporteMarcionesModel.createPorConfirmar({
                        marcacion_id: result.insertId,
                        usuario_id: usuario_id,
                        tipo: 'agregar',
                        fecha_correcta: fecha,
                        hora_correcta: hora,
                        descripcion: motivo,
                        tipo_problema: "Adición de Marcación",
                        tipo_marcacion_correcta: tipo
                    });

                    responseData.reporte_id = reporteId;

                    // Obtener datos para la notificación
                    const reporte = await ReporteMarcionesModel.findById(reporteId);
                    const usuario = await UsuarioEmpresaModel.obtenerUsuarioByID(reporte.usuario_id);

                    // Enviar notificación
                    const res = await NotificacionService.enviarNotificacionConfirmacionNuevaMarcacion(
                        reporte,
                        {
                            tipo: 'agregar',
                            fechaNueva: fecha,
                            horaNueva: hora,
                            tipoNueva: tipo,
                            usuario: usuario
                        }
                    );
                    console.log(res);   
                    console.log('✅ Reporte creado y notificación enviada para marcación manual');
                } catch (error) {
                    console.error('Error creando reporte o enviando notificación:', error);
                    // No interrumpir el flujo principal
                }
            }

            return responseData;
        } catch (error) {
            console.error('Error al insertar marcación manual:', error);
            return {
                success: false,
                message: 'Error interno del servidor al insertar la marcación',
                error: error.message
            };
        }
    }





    /**
     * Registra una marcación con toda la lógica de negocio incluida
     * @param {number} usuario_id - ID del usuario_empresa
     * @param {string} tipo - Tipo de marcación (entrada, salida, colacion)
     * @param {number} geo_lat - Latitud geográfica
     * @param {number} geo_lon - Longitud geográfica
     * @param {string} ip_origen - IP de origen
     * @param {Object} turno - Objeto con información del turno
     * @param {Object} usuarioEmpresa - Objeto con información del usuario empresa
     * @param {string} domicilio_prestacion - Domicilio de prestación (opcional)
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async registrarMarcacion(usuario_id, tipo, geo_lat, geo_lon, ip_origen, turno = null, usuarioEmpresa = null, domicilio_prestacion = null) {
        try {
            // Generar hash único para la marcación
            const hashData = `${usuario_id}-${tipo}-${Math.random()}-${Date.now()}`;
            const hash = crypto.createHash('sha256').update(hashData).digest('hex');
            /* usuario_id es de la tabla usuario_empresa*/

            // Preparar datos para insertar (sin fecha y hora, la BD las manejará)
            // Usar función auxiliar para normalizar valores
            const marcacionData = {
                usuario_id,
                fecha: null, // La BD asignará CURRENT_DATE
                hora: null,  // La BD asignará CURRENT_TIME
                tipo,
                hash,
                ip_origen: this.normalizeValue(ip_origen),
                geo_lat: this.normalizeValue(geo_lat, true),
                geo_lon: this.normalizeValue(geo_lon, true)
            };

            // validar si el usuario que marca esta ligado a una est si es asi agregar mandante_id en la marcacion 
            const asignaciones = await EstAsignacionesModel.getActiveByUsuarioEmpresaId(usuario_id);
            console.log('Asignaciones encontradas para el usuario:', asignaciones);

            if (asignaciones && asignaciones.length > 0) {
                marcacionData.mandante_id = asignaciones[0].usuaria_id; // Asumimos que tomamos el primero
            }

            // Crear la marcación usando el modelo
            const result = await MarcacionesModel.createMarcacion(marcacionData);

            const responseData = {
                success: true,
                message: `${tipo} registrada correctamente`,
                data: {
                    id: result.insertId,
                    tipo,
                    hash,
                }
            };

            // Obtener la marcación recién creada para tener la fecha y hora exactas
            const marcacion = await this.obtenerMarcacionPorId(result.insertId);
            if (!marcacion || !marcacion.success) {
                return responseData; // Retornar sin procesamiento adicional si no se puede obtener
            }

            // ===== PROCESAMIENTO ESPECÍFICO POR TIPO =====

            // Calcular diferencia de tiempo con respecto al turno (solo para entrada/salida)
            if (turno && ['entrada', 'salida'].includes(tipo)) {
                const horaReferencia = tipo === 'entrada' ? turno.hora_inicio : turno.hora_fin;
                const diferencia = this.calcularDiferenciaHoras(horaReferencia, marcacion.data.hora);

                if (!diferencia.esNegativo && diferencia.totalSegundos > 0) {
                    responseData.tarde = true;
                    responseData.diferencia = diferencia.formato;
                }
            }

            // Lógica específica para ENTRADA (lugar y domicilio)
            let lugar = null;
            if (tipo === 'entrada' && usuarioEmpresa) {
                lugar = await UsuarioEmpresaModel.obtenerEmpresaLugarAproximado(result.insertId, usuarioEmpresa.empresa_id);

                if (domicilio_prestacion) {
                    await this.agregarDomicilioPrestacion(result.insertId, domicilio_prestacion);
                    lugar = null; // si se agrega un domicilio de prestación, no es necesario enviar el lugar aproximado
                } else if (lugar && lugar.lugar_id) {
                    await this.agregarLugarMarcacion(result.insertId, lugar.lugar_id);
                }

                // Enviar notificación de entrada
                try {
                    await NotificacionService.procesarNotificacionMarcacion(
                        usuarioEmpresa.usuario_id,
                        result.insertId,
                        usuarioEmpresa,
                        lugar,
                        domicilio_prestacion
                    );
                } catch (error) {
                    console.error('Error en notificación de entrada:', error);
                }
            }

            // Lógica específica para SALIDA (calcular horas extras)
            if (tipo === 'salida' && turno && usuarioEmpresa) {
                try {
                    const fechaHoy = DateTime.now().setZone('America/Santiago').toISODate();

                    // Obtener configuración de tolerancias de la empresa
                    const configTolerancia = await ConfigToleranciaModel.findByEmpresaId(usuarioEmpresa.empresa_id);
                    const toleranciaSalida = configTolerancia ? configTolerancia.tolerancia_salida : 0;

                    // Calcular si hay horas extras
                    const horasExtras = this.calcularHorasExtras(marcacion.data.hora, turno.hora_fin, toleranciaSalida);

                    if (horasExtras) {
                        console.log('🕐 Detectadas horas extras:', horasExtras);

                        // Obtener la preferencia de compensación activa del trabajador
                        const preferencia = await PreferenciasCompensacionModel.obtenerPorTrabajador(usuario_id);

                        // Crear registro de horas extras
                        const horaExtraData = {
                            usuario_empresa_id: usuario_id,
                            marcacion_id: result.insertId,
                            fecha: fechaHoy,
                            hora_inicio: horasExtras.hora_inicio,
                            hora_fin: horasExtras.hora_fin,
                            estado: 'PENDIENTE',
                            motivo: `Horas extras por salida tardía. Exceso de ${horasExtras.minutos_extras} minutos sobre la tolerancia de ${toleranciaSalida} minutos.`,
                            id_preferencia: preferencia ? preferencia.id_preferencia : null
                        };

                        // Crear la hora extra
                        const horaExtraCreada = await HorasExtrasModel.createHoraExtra(horaExtraData);

                        if (horaExtraCreada) {
                            console.log('✅ Hora extra creada exitosamente:', horaExtraCreada.id);
                            responseData.horas_extras_detectadas = {
                                id: horaExtraCreada.id,
                                minutos: horasExtras.minutos_extras,
                                hora_inicio: horasExtras.hora_inicio,
                                hora_fin: horasExtras.hora_fin,
                                estado: 'PENDIENTE'
                            };
                        }
                    }

                    // Enviar notificación de salida
                    await NotificacionService.procesarNotificacionMarcacion(
                        usuarioEmpresa.usuario_id,
                        result.insertId,
                        usuarioEmpresa
                    );
                } catch (error) {
                    console.error('Error procesando horas extras o notificación de salida:', error);
                    // No interrumpir el flujo principal si hay error en horas extras
                }
            }

            // Lógica para COLACION
            if (tipo === 'colacion' && usuarioEmpresa) {
                try {
                    // Enviar notificación de colación
                    await NotificacionService.procesarNotificacionMarcacion(
                        usuarioEmpresa.usuario_id,
                        result.insertId,
                        usuarioEmpresa
                    );
                } catch (error) {
                    console.error('Error en notificación de colación:', error);
                }
            }

            return responseData;

        } catch (error) {
            console.error('Error al registrar marcación:', error);
            return {
                success: false,
                message: 'Error interno del servidor al registrar la marcación',
                error: error.message
            };
        }
    }

    async obtenerMarcacionesPorUsuario(usuario_id, fechaInicio = null, fechaFin = null) {
        try {
            const marcaciones = await MarcacionesModel.getMarcacionesByUsuario(usuario_id, fechaInicio, fechaFin);

            // Si no hay marcaciones, devolver estructura vacía
            if (!marcaciones || marcaciones.length === 0) {
                return {
                    success: true,
                    fecha: fechaFin || new Date().toISOString().split('T')[0],
                    marcaciones: []
                };
            }

            // Si no se especificó fecha, agrupar todas las marcaciones por fecha
            const marcacionesAgrupadas = {};

            marcaciones.forEach(marcacion => {
                const fechaMarcacion = new Date(marcacion.fecha);
                const fechaKey = fechaMarcacion.toISOString().split('T')[0];

                if (!marcacionesAgrupadas[fechaKey]) {
                    marcacionesAgrupadas[fechaKey] = [];
                }

                marcacionesAgrupadas[fechaKey].push({
                    id: marcacion.id,
                    usuario_empresa_id: marcacion.usuario_empresa_id,
                    lugar_id: marcacion.lugar_id,
                    mandante_id: marcacion.mandante_id,
                    fecha: marcacion.fecha,
                    hora: marcacion.hora,
                    tipo: marcacion.tipo,
                    hash: marcacion.hash,
                    ip_origen: marcacion.ip_origen,
                    geo_lat: marcacion.geo_lat,
                    geo_lon: marcacion.geo_lon,
                    created_at: marcacion.created_at
                });
            });

            return {
                success: true,
                marcaciones: marcacionesAgrupadas
            };

        } catch (error) {
            console.error('Error al obtener marcaciones:', error);
            return {
                success: false,
                message: 'Error al obtener las marcaciones',
                error: error.message
            };
        }
    }

    async obtenerEntradaPorUsuario(usuario_id, fecha = null) {
        try {
            const marcaciones = await MarcacionesModel.obtenerEntradaPorUsuario(usuario_id, fecha);

            if (!marcaciones || marcaciones.length === 0) {
                return {
                    success: true,
                    message: 'No se encontraron entradas para el usuario en la fecha especificada',
                    data: []
                };
            }

            return {
                success: true,
                data: marcaciones
            };
        } catch (error) {
            console.error('Error al obtener entrada por usuario:', error);
            return {
                success: false,
                message: 'Error al obtener la entrada del usuario',
                error: error.message
            };
        }
    }

    async obtenerSalidaPorUsuario(usuario_id, fecha = null) {
        try {
            const marcaciones = await MarcacionesModel.obtenerSalidaPorUsuario(usuario_id, fecha);

            if (!marcaciones || marcaciones.length === 0) {
                return {
                    success: true,
                    message: 'No se encontraron salidas para el usuario en la fecha especificada',
                    data: []
                };
            }

            return {
                success: true,
                data: marcaciones
            };
        } catch (error) {
            console.error('Error al obtener salida por usuario:', error);
            return {
                success: false,
                message: 'Error al obtener la salida del usuario',
                error: error.message
            };
        }
    }

    async eliminarMarcacion(id) {
        try {
            const result = await MarcacionesModel.deleteMarcacion(id);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Marcación no encontrada'
                };
            }

            return {
                success: true,
                message: 'Marcación eliminada correctamente'
            };
        } catch (error) {
            console.error('Error al eliminar marcación:', error);
            return {
                success: false,
                message: 'Error al eliminar la marcación',
                error: error.message
            };
        }
    }
    async obtenerMarcacionPorId(id) {
        try {
            const marcacion = await MarcacionesModel.getMarcacionById(id);

            if (!marcacion) {
                return {
                    success: false,
                    message: 'Marcación no encontrada'
                };
            }

            return {
                success: true,
                data: marcacion
            };
        } catch (error) {
            console.error('Error al obtener marcación por ID:', error);
            return {
                success: false,
                message: 'Error al obtener la marcación',
                error: error.message
            };
        }
    }

    async verificarColacionActiva(usuario_id) {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            const marcaciones = await MarcacionesModel.getMarcacionesByUsuario(usuario_id, hoy);

            // Filtrar solo las colaciones
            const colaciones = marcaciones.filter(m => m.tipo === 'colacion');

            // Si hay un número impar de colaciones, significa que hay una activa
            // (1ª colación = inicio, 2ª colación = fin, 3ª colación = inicio, etc.)
            return colaciones.length % 2 === 1;

        } catch (error) {
            console.error('Error verificando colación activa:', error);
            return false;
        }
    }

    async obtenerTodasLasMarcaciones() {
        try {
            const marcaciones = await MarcacionesModel.obtenerTodasLasMarcaciones();
            return {
                success: true,
                data: marcaciones
            };
        } catch (error) {
            console.error('Error al obtener todas las marcaciones:', error);
            return {
                success: false,
                message: 'Error al obtener las marcaciones',
                error: error.message
            };
        }
    }

    async obtenerMarcacionesPorFechaYEmpresa(fecha, rutEmpresa) {

        const marcaciones = await MarcacionesModel.obtenerMarcacionesPorEmpresaRut(fecha, rutEmpresa);

        try {
            return {
                success: true,
                data: marcaciones
            };
        } catch (error) {
            console.error('Error al obtener marcaciones por fecha y empresa:', error);
            return {
                success: false,
                message: 'Error al obtener las marcaciones por fecha y empresa',
                error: error.message
            };
        }
    }

    async obtenerMarcacionesPorEmpresa(id_empresa) {
        try {

            const marcaciones = await MarcacionesModel.obtenerMarcacionesPorEmpresaId(id_empresa);
            // agrupar por usuario_id
            const marcacionesAgrupadas = marcaciones.reduce((acc, marcacion) => {
                const usuarioId = marcacion.usuario_id;
                if (!acc[usuarioId]) {
                    acc[usuarioId] = [];
                }
                acc[usuarioId].push(marcacion);
                return acc;
            }, {});
            return {
                success: true,
                data: marcacionesAgrupadas
            };
        } catch (error) {
            console.error('Error al obtener marcaciones por empresa:', error);
            return {
                success: false,
                message: 'Error al obtener las marcaciones por empresa',
                error: error.message
            };
        }
    }

    async agregarDomicilioPrestacion(marcacion_id, domicilio_prestacion) {
        try {
            const result = await MarcacionesModel.agregarDomicilioPrestacion(marcacion_id, domicilio_prestacion);
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Marcación no encontrada o no se pudo actualizar'
                };
            }
            return {
                success: true,
                message: 'Domicilio de prestación agregado correctamente'
            };
        } catch (error) {
            console.error('Error al agregar domicilio de prestación:', error);
            return {
                success: false,
                message: 'Error al agregar domicilio de prestación',
                error: error.message
            };
        }
    }
    async agregarLugarMarcacion(marcacion_id, lugar_id) {
        try {
            const result = await MarcacionesModel.agregarLugarMarcacion(marcacion_id, lugar_id);
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Marcación no encontrada o no se pudo actualizar'
                };
            }
            return {
                success: true,
                message: 'Lugar de marcación agregado correctamente'
            };
        } catch (error) {
            console.error('Error al agregar lugar de marcación:', error);
            return {
                success: false,
                message: 'Error al agregar lugar de marcación',
                error: error.message
            };
        }
    }
    async updateHoraMarcacion(marcacion_id, nueva_hora) {
        try {
            const result = await MarcacionesModel.updateHoraMarcacion(marcacion_id, nueva_hora);
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Marcación no encontrada o no se pudo actualizar'
                };
            }
            return {
                success: true,
                message: 'Hora de marcación actualizada correctamente'
            };
        } catch (error) {
            console.error('Error al actualizar hora de marcación:', error);
            return {
                success: false,
                message: 'Error al actualizar hora de marcación',
                error: error.message
            };
        }
    }

    async updateFechaMarcacion(marcacion_id, nueva_fecha) {
        try {
            const result = await MarcacionesModel.updateFechaMarcacion(marcacion_id, nueva_fecha);
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Marcación no encontrada o no se pudo actualizar'
                };
            }
            return {
                success: true,
                message: 'Fecha de marcación actualizada correctamente'
            };
        } catch (error) {
            console.error('Error al actualizar fecha de marcación:', error);
            return {
                success: false,
                message: 'Error al actualizar fecha de marcación',
                error: error.message
            };
        }
    }

    /**
     * Calcula las horas trabajadas en la semana actual para un usuario específico
     * @param {number} usuario_empresa_id - ID del usuario en la tabla usuario_empresa
     * @returns {Object} - Objeto con las horas calculadas y detalles
     */
    async calcularHorasSemanales(usuario_empresa_id) {
        try {
            // Obtener fecha de inicio y fin de la semana actual (lunes a domingo)
            const hoy = new Date();
            const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.
            const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1; // Ajustar para que lunes sea día 0

            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - diasHastaLunes);
            inicioSemana.setHours(0, 0, 0, 0);

            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);

            console.log(`📅 Calculando horas para usuario ${usuario_empresa_id} del ${inicioSemana.toISOString().split('T')[0]} al ${finSemana.toISOString().split('T')[0]}`);

            // Obtener todas las marcaciones de la semana
            const marcaciones = await MarcacionesModel.obtenerMarcacionesPorUsuarioYRangoFecha(
                usuario_empresa_id,
                inicioSemana.toISOString().split('T')[0],
                finSemana.toISOString().split('T')[0]
            );

            console.log(`📊 Marcaciones encontradas: ${marcaciones.length}`);

            // Agrupar marcaciones por día
            const marcacionesPorDia = {};
            marcaciones.forEach(marcacion => {
                const fecha = marcacion.fecha;
                if (!marcacionesPorDia[fecha]) {
                    marcacionesPorDia[fecha] = [];
                }
                marcacionesPorDia[fecha].push(marcacion);
            });

            let totalHorasSemanales = 0;
            const detallesPorDia = [];

            // Calcular horas por cada día
            for (const [fecha, marcacionesDia] of Object.entries(marcacionesPorDia)) {
                const entradas = marcacionesDia.filter(m => m.tipo === 'entrada').sort((a, b) => a.hora.localeCompare(b.hora));
                const salidas = marcacionesDia.filter(m => m.tipo === 'salida').sort((a, b) => a.hora.localeCompare(b.hora));

                let horasDia = 0;
                const sesiones = [];

                // Emparejar entradas con salidas
                for (let i = 0; i < Math.min(entradas.length, salidas.length); i++) {
                    const entrada = entradas[i];
                    const salida = salidas[i];

                    if (entrada && salida) {
                        const horasCalculadas = this.calcularDiferenciaHorasDecimal(entrada.hora, salida.hora);
                        horasDia += horasCalculadas;

                        sesiones.push({
                            entrada: entrada.hora,
                            salida: salida.hora,
                            horas: horasCalculadas
                        });
                    }
                }

                totalHorasSemanales += horasDia;
                detallesPorDia.push({
                    fecha,
                    horasDia: Math.round(horasDia * 100) / 100, // Redondear a 2 decimales
                    sesiones
                });
            }

            return {
                success: true,
                usuario_empresa_id,
                semana: {
                    inicio: inicioSemana.toISOString().split('T')[0],
                    fin: finSemana.toISOString().split('T')[0]
                },
                totalHorasSemanales: Math.round(totalHorasSemanales * 100) / 100,
                detallesPorDia,
                totalMarcaciones: marcaciones.length
            };

        } catch (error) {
            console.error('Error al calcular horas semanales:', error);
            return {
                success: false,
                message: 'Error al calcular horas semanales',
                error: error.message,
                totalHorasSemanales: 0
            };
        }
    }

    /**
     * Función auxiliar para calcular diferencia de horas en formato decimal
     * @param {string} horaInicio - Formato HH:MM:SS
     * @param {string} horaFin - Formato HH:MM:SS
     * @returns {number} - Horas en formato decimal
     */
    calcularDiferenciaHorasDecimal(horaInicio, horaFin) {
        try {
            const [hInicio, mInicio, sInicio] = horaInicio.split(':').map(Number);
            const [hFin, mFin, sFin] = horaFin.split(':').map(Number);

            const inicioEnMinutos = hInicio * 60 + mInicio + sInicio / 60;
            const finEnMinutos = hFin * 60 + mFin + sFin / 60;

            let diferencia = finEnMinutos - inicioEnMinutos;

            // Si la hora de fin es menor, asumimos que cruzó medianoche
            if (diferencia < 0) {
                diferencia += 24 * 60; // Agregar 24 horas
            }

            return diferencia / 60; // Convertir a horas decimales
        } catch (error) {
            console.error('Error al calcular diferencia de horas:', error);
            return 0;
        }
    }

    /**
     * Obtener marcaciones por usuario en un rango de fechas
     * @param {number} usuarioEmpresaId - ID del usuario-empresa
     * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
     * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
     * @returns {Promise<Object>} - Marcaciones del usuario en el rango
     */
    async obtenerMarcacionesPorUsuarioYRango(usuarioEmpresaId, fechaInicio, fechaFin) {
        try {
            const marcaciones = await MarcacionesModel.obtenerMarcacionesPorUsuarioYRangoFecha(
                usuarioEmpresaId,
                fechaInicio,
                fechaFin
            );

            return {
                success: true,
                data: marcaciones
            };
        } catch (error) {
            console.error('Error al obtener marcaciones por usuario y rango:', error);
            throw error;
        }
    }

    async obtenerMarcacionesPorRangoFechaEmpresaRut(fechaInicio, fechaFin, rutEmpresa) {
        try {
            const marcaciones = await MarcacionesModel.obtenerMarcacionesPorRangoFechaEmpresaRut(
                fechaInicio,
                fechaFin,
                rutEmpresa
            );
            // agrupar las marcaciones por rut del usuario (solo primeros 8 dígitos, sin puntos ni guion)
            const marcacionesAgrupadas = marcaciones.reduce((acc, marcacion) => {
                // Eliminar puntos y guion, y tomar solo los primeros 8 dígitos
                const rutUsuario = marcacion.rut ? marcacion.rut.replace(/[.\-]/g, '').substring(0, 8) : '';
                if (!acc[rutUsuario]) {
                    acc[rutUsuario] = [];
                }
                acc[rutUsuario].push(marcacion);
                return acc;
            }, {});



            // ahora dentro de cada rut, agrupar por fecha
            for (const rut in marcacionesAgrupadas) {
                const marcacionesPorRut = marcacionesAgrupadas[rut];
                const agrupadasPorFecha = marcacionesPorRut.reduce((acc, marcacion) => {
                    const fechaMarcacion = new Date(marcacion.fecha);
                    const fechaKey = fechaMarcacion.toISOString().split('T')[0];
                    if (!acc[fechaKey]) {
                        acc[fechaKey] = [];
                    }
                    acc[fechaKey].push(marcacion);
                    return acc;
                }, {});
                marcacionesAgrupadas[rut] = agrupadasPorFecha;
            }




            return {
                success: true,
                data: marcacionesAgrupadas
            };
        } catch (error) {
            console.error('Error al obtener marcaciones por rango de fecha y empresa:', error);
            throw error;
        }
    }

}

export default new MarcacionesService();