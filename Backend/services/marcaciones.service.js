import { Console } from 'console';
import MarcacionesModel from '../model/marcaciones.model.js';
import crypto from 'crypto';
import UserModel from '../model/user.model.js';
import EstAsignacionesModel from '../model/est-asignaciones.model.js';

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

    async insertarMarcacionManual(usuario_empresa_id, tipo, fecha, hora) {
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
            return {
                success: true,
                message: `Marcación ${tipo} insertada correctamente`,
                data: {
                    id: result.insertId,
                    tipo: tipo,
                    hash: marcacionData.hash,
                }
            };
        } catch (error) {
            console.error('Error al insertar marcación manual:', error);
            return {
                success: false,
                message: 'Error interno del servidor al insertar la marcación',
                error: error.message
            };
        }
    }





    async registrarMarcacion(usuario_id, tipo, geo_lat, geo_lon, ip_origen) {
        try {
            // Obtener fecha actual para verificación de duplicados
            const fechaHoy = new Date().toISOString().split('T')[0];

            // Verificar duplicados según el tipo de marcación
            if (tipo === 'entrada' || tipo === 'salida') {
                // Para entrada y salida: no permitir duplicados del mismo tipo en el día
                const marcacionExistente = await MarcacionesModel.verificarMarcacionDuplicada(
                    usuario_id,
                    fechaHoy,
                    tipo
                );

                if (marcacionExistente) {
                    console.log(`⚠️ Marcación duplicada detectada: ${tipo} ya registrada para usuario ${usuario_id} el ${fechaHoy}`);
                    return {
                        success: false,
                        isDuplicate: true,
                        message: `Ya existe una marcación de ${tipo} registrada para el día de hoy a las ${marcacionExistente.hora}`,
                        data: {
                            marcacion_existente: {
                                id: marcacionExistente.id,
                                tipo: marcacionExistente.tipo,
                                fecha: marcacionExistente.fecha,
                                hora: marcacionExistente.hora
                            }
                        }
                    };
                }
            } else if (tipo === 'colacion') {
                // Para colación: permitir pares (inicio/fin) usando la lógica existente
                const tieneColacionActiva = await this.verificarColacionActiva(usuario_id);
                
                // Si tiene colación activa impar, está registrando el fin
                // Si no tiene colación activa (par o cero), está registrando el inicio
                // No hay problema con duplicados en este caso, la lógica de pares lo maneja
                console.log(`📋 Colación: tieneColacionActiva = ${tieneColacionActiva}`);
            }

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
            return {
                success: true,
                message: `${tipo} registrada correctamente`,
                data: {
                    id: result.insertId,
                    tipo,
                    hash,
                }
            };
            
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

    async eliminarMarcacionSoloSiDuplicada(id) {
        try {
            const marcacionBase = await MarcacionesModel.obtenerMarcacionBaseParaDuplicados(id);

            if (!marcacionBase) {
                return {
                    success: false,
                    message: 'Marcación no encontrada'
                };
            }

            const totalDuplicadas = await MarcacionesModel.contarMarcacionesDuplicadas(
                marcacionBase.usuario_empresa_id,
                marcacionBase.fecha,
                marcacionBase.hora,
                marcacionBase.tipo
            );

            if (totalDuplicadas < 2) {
                return {
                    success: true,
                    deleted: false,
                    totalDuplicadas,
                    message: 'La marcación no está duplicada. No se realizaron cambios.'
                };
            }

            const result = await MarcacionesModel.deleteMarcacion(id);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'No se pudo eliminar la marcación'
                };
            }

            return {
                success: true,
                deleted: true,
                totalDuplicadas,
                message: 'Marcación duplicada eliminada correctamente'
            };
        } catch (error) {
            console.error('Error al eliminar marcación duplicada:', error);
            return {
                success: false,
                message: 'Error al eliminar marcación duplicada',
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