import { Console } from 'console';
import MarcacionesModel from '../model/MarcacionesModel.js';
import crypto from 'crypto';
import UserModel from '../model/UserModel.js';
import EstAsignacionesModel from '../model/EstAsignacionesModel.js';

class MarcacionesService {
    async registrarMarcacion(usuario_id, tipo, geo_lat, geo_lon, ip_origen) {
        try {
            // Generar hash único para la marcación
            const hashData = `${usuario_id}-${tipo}-${Math.random()}-${Date.now()}`;
            const hash = crypto.createHash('sha256').update(hashData).digest('hex');
            /* usuario_id es de la tabla usuario_empresa*/

            
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
    
    async obtenerMarcacionesPorUsuario(usuario_id, fecha = null) {
        try {
            const marcaciones = await MarcacionesModel.getMarcacionesByUsuario(usuario_id, fecha);

            // Si no hay marcaciones, devolver estructura vacía
            if (!marcaciones || marcaciones.length === 0) {
                return {
                    success: true,
                    fecha: fecha || new Date().toISOString().split('T')[0],
                    marcaciones: []
                };
            }

            // Si se especificó una fecha, devolver las marcaciones directamente
            if (fecha) {
                return {
                    success: true,
                    fecha: fecha,
                    marcaciones: marcaciones
                };
            }

            // Si no se especificó fecha, devolver todas las marcaciones agrupadas por fecha
            return {
                success: true,
                marcaciones
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

    async obtenerMarcacionesPorEmpresa(rutEmpresa) {
        try {
            const marcaciones = await MarcacionesModel.obtenerMarcacionesPorEmpresaRut(rutEmpresa);
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

}

export default new MarcacionesService();