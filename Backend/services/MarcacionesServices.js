import MarcacionesModel from '../model/MarcacionesModel.js';
import crypto from 'crypto';

class MarcacionesService {
    async registrarMarcacion(usuario_id, tipo, geo_lat, geo_lon, ip_origen) {
        try {
            // Generar hash único para la marcación
            const hashData = `${usuario_id}-${tipo}-${Math.random()}-${Date.now()}`;
            const hash = crypto.createHash('sha256').update(hashData).digest('hex');
            
            // Preparar datos para insertar (sin fecha y hora, la BD las manejará)
            const marcacionData = {
                usuario_id,
                fecha: null, // La BD asignará CURRENT_DATE
                hora: null,  // La BD asignará CURRENT_TIME
                tipo,
                hash,
                ip_origen,
                geo_lat: parseFloat(geo_lat),
                geo_lon: parseFloat(geo_lon)
            };
            
            

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
    
    async obtenerMarcacionesPorUsuario(usuario_id, fecha = null) {
        try {
            const marcaciones = await MarcacionesModel.getMarcacionesByUsuario(usuario_id, fecha);
            
            // Si no hay marcaciones, devolver estructura vacía
            if (!marcaciones || marcaciones.length === 0) {
                const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
                return {
                    success: true,
                    fecha: fechaConsulta,
                    marcaciones: []
                };
            }
            
            // Agrupar marcaciones por fecha
            const marcacionesAgrupadas = marcaciones.reduce((acc, marcacion) => {
                const fechaMarcacion = marcacion.fecha;
                if (!acc[fechaMarcacion]) {
                    acc[fechaMarcacion] = [];
                }
                acc[fechaMarcacion].push(marcacion);
                return acc;
            }, {});
            
            // Si se especificó una fecha, devolver solo esa fecha
            if (fecha) {
                return {
                    success: true,
                    fecha: fecha,
                    marcaciones: marcacionesAgrupadas[fecha] || []
                };
            }
            
            // Si no se especificó fecha, devolver la fecha más reciente
            const fechas = Object.keys(marcacionesAgrupadas).sort().reverse();
            const fechaMasReciente = fechas[0];
            
            return {
                success: true,
                fecha: fechaMasReciente,
                marcaciones: marcacionesAgrupadas[fechaMasReciente]
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
}

export default new MarcacionesService();