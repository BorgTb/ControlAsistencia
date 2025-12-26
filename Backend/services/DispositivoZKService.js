import DispositivoZKModel from '../model/DispositivoZKModel.js';
import zkDeviceService from './ZKDeviceService.js';

/**
 * Servicio de gestión de dispositivos ZK con persistencia en base de datos
 * Integra el servicio MQTT con la base de datos para mantener sincronizado
 * el estado de los dispositivos
 */
class DispositivoZKService {
    
    /**
     * Inicializar servicio: cargar dispositivos de BD y registrarlos en MQTT
     */
    async initialize() {
        try {
            //console.log('🔄 Inicializando servicio de dispositivos ZK...');
            
            // Cargar dispositivos activos de la base de datos
            const dispositivos = await DispositivoZKModel.getAllDispositivos();
            
            // Registrar cada dispositivo en el servicio MQTT
            for (const dispositivo of dispositivos) {
                if (dispositivo.activo) {
                    zkDeviceService.registerDevice(dispositivo.serial, {
                        name: dispositivo.nombre,
                        location: dispositivo.ubicacion,
                        empresa_id: dispositivo.empresa_id,
                        ip_address: dispositivo.ip_address,
                        puerto: dispositivo.puerto,
                        dbId: dispositivo.id
                    });
                }
            }
            
            //console.log(`✅ ${dispositivos.filter(d => d.activo).length} dispositivos ZK cargados desde BD`);
            return true;
        } catch (error) {
            console.error('❌ Error inicializando servicio de dispositivos ZK:', error);
            throw error;
        }
    }
    
    /**
     * Crear un nuevo dispositivo en BD y registrarlo en MQTT
     */
    async crearDispositivo(dispositivoData) {
        try {
            // Validar que no exista el serial
            const existe = await DispositivoZKModel.serialExists(dispositivoData.serial);
            if (existe) {
                throw new Error('Ya existe un dispositivo con ese número de serie');
            }
            
            // Crear en base de datos
            const dispositivo = await DispositivoZKModel.createDispositivo(dispositivoData);
            
            // Si está activo, registrar en MQTT
            if (dispositivo.activo) {
                zkDeviceService.registerDevice(dispositivo.serial, {
                    name: dispositivo.nombre,
                    location: dispositivo.ubicacion,
                    empresa_id: dispositivo.empresa_id,
                    ip_address: dispositivo.ip_address,
                    puerto: dispositivo.puerto,
                    dbId: dispositivo.id
                });
            }
            
            return dispositivo;
        } catch (error) {
            console.error('❌ Error creando dispositivo:', error);
            throw error;
        }
    }
    
    /**
     * Actualizar dispositivo en BD y sincronizar con MQTT
     */
    async actualizarDispositivo(id, dispositivoData) {
        try {
            // Obtener dispositivo actual
            const dispositivoActual = await DispositivoZKModel.getDispositivoById(id);
            if (!dispositivoActual) {
                throw new Error('Dispositivo no encontrado');
            }
            
            // Actualizar en base de datos
            const dispositivoActualizado = await DispositivoZKModel.updateDispositivo(id, dispositivoData);
            
            // Desregistrar del servicio MQTT
            zkDeviceService.unregisterDevice(dispositivoActual.serial);
            
            // Si está activo, re-registrar en MQTT con nuevos datos
            if (dispositivoActualizado.activo) {
                zkDeviceService.registerDevice(dispositivoActualizado.serial, {
                    name: dispositivoActualizado.nombre,
                    location: dispositivoActualizado.ubicacion,
                    empresa_id: dispositivoActualizado.empresa_id,
                    ip_address: dispositivoActualizado.ip_address,
                    puerto: dispositivoActualizado.puerto,
                    dbId: dispositivoActualizado.id
                });
            }
            
            return dispositivoActualizado;
        } catch (error) {
            console.error('❌ Error actualizando dispositivo:', error);
            throw error;
        }
    }
    
    /**
     * Eliminar dispositivo de BD y desregistrar de MQTT
     */
    async eliminarDispositivo(id) {
        try {
            // Obtener dispositivo antes de eliminar
            const dispositivo = await DispositivoZKModel.getDispositivoById(id);
            if (!dispositivo) {
                throw new Error('Dispositivo no encontrado');
            }
            
            // Desregistrar del servicio MQTT
            zkDeviceService.unregisterDevice(dispositivo.serial);
            
            // Eliminar de base de datos
            const dispositivoEliminado = await DispositivoZKModel.deleteDispositivo(id);
            
            return dispositivoEliminado;
        } catch (error) {
            console.error('❌ Error eliminando dispositivo:', error);
            throw error;
        }
    }
    
    /**
     * Activar/Desactivar dispositivo
     */
    async toggleActivoDispositivo(id, activo) {
        try {
            const dispositivo = await DispositivoZKModel.getDispositivoById(id);
            if (!dispositivo) {
                throw new Error('Dispositivo no encontrado');
            }
            
            // Actualizar estado en BD
            await DispositivoZKModel.toggleActivo(id, activo);
            
            if (activo) {
                // Activar: registrar en MQTT
                zkDeviceService.registerDevice(dispositivo.serial, {
                    name: dispositivo.nombre,
                    location: dispositivo.ubicacion,
                    empresa_id: dispositivo.empresa_id,
                    ip_address: dispositivo.ip_address,
                    puerto: dispositivo.puerto,
                    dbId: dispositivo.id
                });
            } else {
                // Desactivar: desregistrar de MQTT
                zkDeviceService.unregisterDevice(dispositivo.serial);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error cambiando estado del dispositivo:', error);
            throw error;
        }
    }
    
    /**
     * Actualizar estado de un dispositivo cuando cambia su conexión
     * Este método debe ser llamado desde el servicio MQTT cuando detecta cambios
     */
    async actualizarEstadoDispositivo(serial, estado) {
        try {
            await DispositivoZKModel.updateEstado(serial, estado);
            console.log(`📡 Estado actualizado en BD: ${serial} -> ${estado}`);
        } catch (error) {
            console.error('❌ Error actualizando estado del dispositivo:', error);
        }
    }
    
    /**
     * Sincronizar estado de dispositivos entre MQTT y BD
     */
    async sincronizarEstados() {
        try {
            const dispositivos = await DispositivoZKModel.getAllDispositivos();
            
            for (const dispositivo of dispositivos) {
                if (dispositivo.activo) {
                    const estadoMQTT = zkDeviceService.getDeviceStatus(dispositivo.serial);
                    
                    if (estadoMQTT) {
                        // Actualizar BD con estado de MQTT
                        await DispositivoZKModel.updateEstado(
                            dispositivo.serial, 
                            estadoMQTT.status || 'unknown'
                        );
                    }
                }
            }
            
            console.log('✅ Estados sincronizados entre MQTT y BD');
        } catch (error) {
            console.error('❌ Error sincronizando estados:', error);
        }
    }
    
    /**
     * Obtener todos los dispositivos con información de BD y estado MQTT
     */
    async obtenerDispositivosConEstado() {
        try {
            const dispositivos = await DispositivoZKModel.getAllDispositivos();
            
            // Enriquecer con información del servicio MQTT
            return dispositivos.map(dispositivo => {
                const estadoMQTT = zkDeviceService.getDeviceStatus(dispositivo.serial);
                
                return {
                    ...dispositivo,
                    mqtt_status: estadoMQTT?.status || 'unknown',
                    mqtt_lastSeen: estadoMQTT?.lastSeen || null,
                    mqtt_online: estadoMQTT?.status === 'online'
                };
            });
        } catch (error) {
            console.error('❌ Error obteniendo dispositivos:', error);
            throw error;
        }
    }
    
    /**
     * Obtener dispositivos por empresa con estado MQTT
     */
    async obtenerDispositivosPorEmpresa(empresa_id) {
        try {
            const dispositivos = await DispositivoZKModel.getDispositivosByEmpresa(empresa_id);
            // Enriquecer con información del servicio MQTT
            return dispositivos.map(dispositivo => {
                const estadoMQTT = zkDeviceService.getDeviceStatus(dispositivo.serial);
                return {
                    ...dispositivo,
                    mqtt_status: estadoMQTT?.status || 'unknown',
                    mqtt_lastSeen: estadoMQTT?.lastSeen || null,
                    mqtt_online: estadoMQTT?.status === 'online'
                };
            });
        } catch (error) {
            console.error('❌ Error obteniendo dispositivos por empresa:', error);
            throw error;
        }
    }
    
    /**
     * Registrar dispositivo auto-detectado vía MQTT
     */
    async registrarAutoDetectado(serial, deviceInfo) {
        try {
            // Verificar si ya existe
            const existe = await DispositivoZKModel.getDispositivoBySerial(serial);
            
            if (!existe) {
                // Si no existe, crear como auto-detectado sin empresa asignada
                // Esto requeriría que empresa_id pueda ser NULL temporalmente
                // O asignar a una empresa por defecto
                console.log(`📱 Dispositivo auto-detectado: ${serial} - Requiere asignación manual a empresa`);
                
                // Por ahora solo registrar en MQTT, no en BD hasta que se asigne empresa
                return null;
            } else {
                // Si ya existe, actualizar estado
                await DispositivoZKModel.updateEstado(serial, 'online');
                return existe;
            }
        } catch (error) {
            console.error('❌ Error registrando dispositivo auto-detectado:', error);
            throw error;
        }
    }
    
    /**
     * Obtener estadísticas de dispositivos
     */
    async obtenerEstadisticas() {
        try {
            const { total, activos } = await DispositivoZKModel.contarDispositivos();
            const online = (await DispositivoZKModel.getDispositivosOnline()).length;
            
            return {
                total,
                activos,
                online,
                offline: activos - online
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
const dispositivoZKService = new DispositivoZKService();
export default dispositivoZKService;
