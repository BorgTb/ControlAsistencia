import mqttService from './MQTTService.js';

/**
 * Servicio para gestionar dispositivos ZK a través de MQTT
 * Sigue el patrón de topics:
 * - zk/{serial}/in -> Comandos hacia el dispositivo
 * - zk/{serial}/out -> Respuestas del dispositivo
 * - zk/{serial}/logs -> Eventos de marcajes detectados
 * - zk/{serial}/status -> Estado de disponibilidad
 */
class ZKDeviceService {
    constructor() {
        this.devices = new Map(); // Map<serial, deviceInfo>
        this.commandCallbacks = new Map(); // Map<commandId, callback>
        this.commandTimeout = 30000; // 30 segundos timeout para comandos
    }

    /**
     * Registrar un nuevo dispositivo ZK
     * @param {string} serial - Número de serie del dispositivo
     * @param {Object} deviceInfo - Información adicional del dispositivo
     */
    registerDevice(serial, deviceInfo = {}) {
        if (!serial) {
            throw new Error('Serial es requerido');
        }

        // Suscribirse a todos los topics del dispositivo
        this.subscribeToDevice(serial);

        // Guardar información del dispositivo
        this.devices.set(serial, {
            serial,
            status: 'unknown',
            lastSeen: null,
            ...deviceInfo
        });

        console.log(`✅ Dispositivo ZK registrado: ${serial}`);
        return this.devices.get(serial);
    }

    /**
     * Suscribirse a los topics de un dispositivo
     * @param {string} serial - Número de serie del dispositivo
     */
    subscribeToDevice(serial) {
        // Topic para respuestas de comandos
        mqttService.subscribe(`zk/${serial}/out`, (topic, message) => {
            this.handleDeviceResponse(serial, message);
        });

        // Topic para eventos/logs de marcajes
        mqttService.subscribe(`zk/${serial}/logs`, (topic, message) => {
            this.handleDeviceLog(serial, message);
        });

        // Topic para estado de disponibilidad
        mqttService.subscribe(`zk/${serial}/status`, (topic, message) => {
            this.handleDeviceStatus(serial, message);
        });

        console.log(`📡 Suscrito a topics del dispositivo: zk/${serial}/*`);
    }

    /**
     * Enviar comando a un dispositivo ZK
     * @param {string} serial - Número de serie del dispositivo
     * @param {string} action - Acción a ejecutar (ej: CREATE_USER, GET_USERS, etc.)
     * @param {Object} payload - Datos del comando
     * @param {number} timeout - Tiempo de espera en ms
     * @returns {Promise} - Promesa que se resuelve con la respuesta
     */
    sendCommand(serial, action, payload = {}, timeout = this.commandTimeout) {
        return new Promise((resolve, reject) => {
            const commandId = `${serial}_${action}_${Date.now()}`;
            
            const command = {
                action,
                payload
            };

            // Configurar callback para la respuesta
            const timeoutId = setTimeout(() => {
                this.commandCallbacks.delete(commandId);
                reject(new Error(`Timeout esperando respuesta del dispositivo ${serial}`));
            }, timeout);

            this.commandCallbacks.set(commandId, {
                resolve,
                reject,
                timeoutId,
                action
            });

            // Publicar comando en topic de entrada
            mqttService.publish(`zk/${serial}/in`, command, { qos: 1 });
            console.log(`📤 Comando enviado a zk/${serial}/in:`, action);
        });
    }

    /**
     * Manejar respuesta del dispositivo
     * @param {string} serial - Número de serie del dispositivo
     * @param {string} message - Mensaje recibido
     */
    handleDeviceResponse(serial, message) {
        try {
            const response = JSON.parse(message);
            console.log(`📥 Respuesta de zk/${serial}/out:`, response);

            const { status, message: responseMessage, action, payload, device_name } = response;

            // Buscar callback pendiente por action
            // Buscar el commandId que corresponda a esta acción
            let foundCommandId = null;
            for (const [commandId, callbackData] of this.commandCallbacks.entries()) {
                if (commandId.includes(serial) && callbackData.action === action) {
                    foundCommandId = commandId;
                    break;
                }
            }

            if (foundCommandId && this.commandCallbacks.has(foundCommandId)) {
                const { resolve, reject, timeoutId } = this.commandCallbacks.get(foundCommandId);
                clearTimeout(timeoutId);
                this.commandCallbacks.delete(foundCommandId);

                if (status === 'ok') {
                    resolve({ message: responseMessage, payload, device_name });
                } else {
                    reject(new Error(responseMessage || 'Comando falló'));
                }
            }

            // Actualizar última actividad del dispositivo
            if (this.devices.has(serial)) {
                const device = this.devices.get(serial);
                device.lastSeen = new Date();
                if (device_name) {
                    device.name = device_name;
                }
                this.devices.set(serial, device);
            }
        } catch (error) {
            console.error(`❌ Error procesando respuesta de ${serial}:`, error);
        }
    }

    /**
     * Manejar evento/log de marcaje del dispositivo
     * @param {string} serial - Número de serie del dispositivo
     * @param {string} message - Mensaje recibido
     */
    handleDeviceLog(serial, message) {
        try {
            const logData = JSON.parse(message);
            console.log(`📋 Log de marcaje zk/${serial}/logs:`, logData);

            const { device_name, count, data } = logData;

            // Actualizar última actividad y nombre del dispositivo
            if (this.devices.has(serial)) {
                const device = this.devices.get(serial);
                device.lastSeen = new Date();
                if (device_name) {
                    device.name = device_name;
                }
                this.devices.set(serial, device);
            }

            // Procesar cada marcaje del array
            if (data && Array.isArray(data)) {
                console.log(`📊 Procesando ${count} marcaje(s) del dispositivo ${device_name || serial}`);
                data.forEach(attendance => {
                    this.processAttendanceLog(serial, attendance, device_name);
                });
            }
        } catch (error) {
            console.error(`❌ Error procesando log de ${serial}:`, error);
        }
    }

    /**
     * Manejar cambio de estado del dispositivo
     * @param {string} serial - Número de serie del dispositivo
     * @param {string} message - Estado recibido
     */
    handleDeviceStatus(serial, message) {
        try {
            const statusData = JSON.parse(message);
            const { status, device_name, ip_local, timestamp } = statusData;
            
            console.log(`🔌 Estado de zk/${serial}/status: ${status}`);

            if (this.devices.has(serial)) {
                const device = this.devices.get(serial);
                device.status = status;
                device.lastSeen = timestamp ? new Date(timestamp) : new Date();
                if (device_name) {
                    device.name = device_name;
                }
                if (ip_local) {
                    device.ip_local = ip_local;
                }
                this.devices.set(serial, device);
            } else if (status === 'online') {
                // Auto-registrar dispositivo si se conecta y no está registrado
                this.registerDevice(serial, {
                    name: device_name || `Dispositivo ${serial}`,
                    ip_local,
                    status,
                    autoDetected: true
                });
            }

            // Emitir evento para notificar cambio de estado
            if (status === 'online') {
                console.log(`✅ Dispositivo ${device_name || serial} conectado desde ${ip_local || 'IP desconocida'}`);
            } else if (status === 'offline') {
                console.log(`⚠️ Dispositivo ${serial} desconectado`);
            }
        } catch (error) {
            // Si no es JSON, intentar como string simple (para compatibilidad)
            const status = message.toString().trim();
            console.log(`🔌 Estado de zk/${serial}/status: ${status}`);
            
            if (this.devices.has(serial)) {
                const device = this.devices.get(serial);
                device.status = status;
                device.lastSeen = new Date();
                this.devices.set(serial, device);
            }
        }
    }

    /**
     * Procesar log de marcaje de asistencia
     * @param {string} serial - Número de serie del dispositivo
     * @param {Object} attendance - Datos del marcaje
     * @param {string} deviceName - Nombre del dispositivo
     */
    async processAttendanceLog(serial, attendance, deviceName) {
        try {
            // Estructura del attendance:
            // {
            //     user_id: "105",
            //     timestamp: "2025-12-23 14:30:05",
            //     status: 1,
            //     punch: 0
            // }

            const { user_id, timestamp, status, punch } = attendance;

            console.log(`💾 Procesando marcaje: Usuario ${user_id} - ${timestamp} (Status: ${status}, Punch: ${punch})`);

            // TODO: Implementar lógica para guardar marcaje en BD
            // Mapear status/punch a tipo de marcaje según tu sistema
            // Status típicamente: 0=check-in, 1=check-out, 2=break-out, 3=break-in
            // Punch: 0=entrada, 1=salida, etc. (depende del dispositivo)

            // Aquí integrar con MarcacionesModel o controller
            // await MarcacionesModel.crear({
            //     usuario_id: user_id,
            //     fecha_hora: timestamp,
            //     tipo: status === 0 ? 'entrada' : 'salida',
            //     dispositivo_serial: serial,
            //     dispositivo_nombre: deviceName
            // });
        } catch (error) {
            console.error('❌ Error guardando marcaje:', error);
        }
    }

    /**
     * Obtener estado de un dispositivo
     * @param {string} serial - Número de serie del dispositivo
     * @returns {Object|null} - Información del dispositivo
     */
    getDeviceStatus(serial) {
        return this.devices.get(serial) || null;
    }

    /**
     * Obtener todos los dispositivos registrados
     * @returns {Array} - Lista de dispositivos
     */
    getAllDevices() {
        return Array.from(this.devices.values());
    }

    /**
     * Obtener dispositivos online
     * @returns {Array} - Lista de dispositivos online
     */
    getOnlineDevices() {
        return Array.from(this.devices.values()).filter(d => d.status === 'online');
    }

    /**
     * Desregistrar un dispositivo
     * @param {string} serial - Número de serie del dispositivo
     */
    unregisterDevice(serial) {
        // Desuscribirse de los topics
        mqttService.unsubscribe(`zk/${serial}/out`);
        mqttService.unsubscribe(`zk/${serial}/logs`);
        mqttService.unsubscribe(`zk/${serial}/status`);

        // Eliminar del mapa
        this.devices.delete(serial);
        console.log(`🗑️ Dispositivo ZK desregistrado: ${serial}`);
    }

    // === Comandos específicos para dispositivos ZK ===

    /**
     * Solicitar usuarios del dispositivo
     */
    async getUsers(serial) {
        return this.sendCommand(serial, 'GET_USERS', {});
    }

    /**
     * Crear usuario en el dispositivo
     */
    async createUser(serial, userData) {
        return this.sendCommand(serial, 'CREATE_USER', userData);
    }

    /**
     * Eliminar usuario del dispositivo
     */
    async deleteUser(serial, userId) {
        return this.sendCommand(serial, 'DELETE_USER', { user_id: userId });
    }

    /**
     * Sincronizar tiempo del dispositivo
     */
    async syncTime(serial) {
        return this.sendCommand(serial, 'SYNC_TIME', {
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Obtener registros de asistencia
     */
    async getAttendance(serial, startDate, endDate) {
        return this.sendCommand(serial, 'GET_ATTENDANCE', {
            start_date: startDate,
            end_date: endDate
        });
    }

    /**
     * Limpiar logs del dispositivo
     */
    async clearLogs(serial) {
        return this.sendCommand(serial, 'CLEAR_LOGS', {});
    }

    /**
     * Reiniciar dispositivo
     */
    async restart(serial) {
        return this.sendCommand(serial, 'RESTART_DEVICE', {});
    }

    /**
     * Obtener información del dispositivo
     */
    async getDeviceInfo(serial) {
        return this.sendCommand(serial, 'GET_DEVICE_INFO', {});
    }

    /**
     * Abrir puerta (si tiene control de acceso)
     */
    async openDoor(serial, duration = 5) {
        return this.sendCommand(serial, 'OPEN_DOOR', { duration });
    }

    /**
     * Obtener versión del firmware
     */
    async getFirmwareVersion(serial) {
        return this.sendCommand(serial, 'GET_FIRMWARE_VERSION', {});
    }
}

// Exportar instancia singleton
const zkDeviceService = new ZKDeviceService();
export default zkDeviceService;
