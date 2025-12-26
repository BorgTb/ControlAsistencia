import mqttService from './MQTTService.js';
import DispositivoZKModel from '../model/DispositivoZKModel.js';
import UserModel from '../model/UserModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import MarcacionesServices from './MarcacionesServices.js';

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

        //console.log(`✅ Dispositivo ZK registrado: ${serial}`);
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

        //console.log(`📡 Suscrito a topics del dispositivo: zk/${serial}/*`);
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

            const { status, message: responseMessage, action, payload, data, device_name } = response;

            // Buscar callback pendiente
            // Estrategia: 
            // 1. Si la respuesta tiene 'action', buscar coincidencia exacta.
            // 2. Si la respuesta NO tiene 'action', tomar el primer comando pendiente para este dispositivo (FIFO).
            let foundCommandId = null;
            for (const [commandId, callbackData] of this.commandCallbacks.entries()) {
                if (commandId.includes(serial)) {
                    // Si la respuesta trae acción, debe coincidir
                    if (action && callbackData.action !== action) {
                        continue;
                    }
                    // Si llegamos aqui, es match (o acción coincide, o respuesta no trae acción y asumimos es para este cmd)
                    foundCommandId = commandId;
                    break;
                }
            }

            if (foundCommandId && this.commandCallbacks.has(foundCommandId)) {
                const { resolve, reject, timeoutId } = this.commandCallbacks.get(foundCommandId);
                clearTimeout(timeoutId);
                this.commandCallbacks.delete(foundCommandId);

                if (status === 'ok') {
                    // Resolver con payload o data (algunos comandos devuelven 'data', otros 'payload')
                    resolve({
                        message: responseMessage,
                        payload,
                        data,
                        device_name
                    });
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

            // Actualizar última actividad y nombre del dispositivo
            if (this.devices.has(serial)) {
                const device = this.devices.get(serial);
                device.lastSeen = new Date();
                if (logData.device_name) {
                    device.name = logData.device_name;
                }
                this.devices.set(serial, device);
            }

            // CASO 1: Log individual (estructura reportada por usuario)
            if (logData.user_id && logData.timestamp) {
                console.log(`📊 Procesando log individual del dispositivo ${logData.device_name || serial}`);
                this.processAttendanceLog(serial, logData);
                return;
            }

            // CASO 2: Batch de logs (estructura original esperada)
            const { device_name, count, data } = logData;
            if (data && Array.isArray(data)) {
                console.log(`📊 Procesando ${count} marcaje(s) del dispositivo ${device_name || serial}`);
                data.forEach(attendance => {
                    this.processAttendanceLog(serial, attendance);
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
     * @param {Object} log - Datos del marcaje (user_id, timestamp, etc.)
     */
    async processAttendanceLog(serial, log) {
        try {
            console.log(`📊 Procesando marcación dispositivo ${serial}:`, log);

            // 1. Obtener dispositivo y empresa (Fallback a BD si no está en memoria)
            let device = this.devices.get(serial);
            if (!device) {
                console.log(`🔍 Dispositivo ${serial} no hallado en memoria, buscando en BD...`);
                device = await DispositivoZKModel.getBySerial(serial);
            }

            if (!device || !device.empresa_id) {
                console.warn(`⚠️ Dispositivo ${serial} no registrado o sin empresa asignada.`);
                return;
            }

            // 2. Obtener Usuario
            // El dispositivo envía user_id como string, asumimos que corresponde al ID de la tabla usuarios o al ID en dispositivo
            const userId = parseInt(log.user_id);
            if (isNaN(userId)) {
                console.warn(`⚠️ ID de usuario inválido en marcación: ${log.user_id}`);
                return;
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                console.warn(`⚠️ Usuario ID ${userId} no encontrado en BD.`);
                return;
            }

            // 3. Obtener relación Usuario-Empresa
            const usuarioEmpresaId = await UsuarioEmpresaModel.getIdByUsuarioIdAndEmpresaId(userId, device.empresa_id);
            if (!usuarioEmpresaId) {
                console.warn(`⚠️ Usuario ${userId} no tiene relación activa con empresa ${device.empresa_id}.`);
                return;
            }

            // 4. Parsear Fecha y Hora del log
            const logDate = new Date(log.timestamp);
            if (isNaN(logDate.getTime())) {
                console.error('❌ Fecha de marcación inválida:', log.timestamp);
                return;
            }

            const fechaStr = logDate.toISOString().split('T')[0];
            const horaStr = logDate.toTimeString().split(' ')[0];

            // 5. Verificar duplicados y determinar Tipo
            const historial = await MarcacionesServices.obtenerMarcacionesPorUsuario(usuarioEmpresaId, fechaStr, fechaStr);
            const marcacionesHoy = (historial.marcaciones && historial.marcaciones[fechaStr]) ? historial.marcaciones[fechaStr] : [];

            // Verificar duplicados (misma hora exacta)
            const duplicado = marcacionesHoy.find(m => m.hora === horaStr);
            if (duplicado) {
                console.log(`ℹ️ Marcación duplicada ignorada para usuario ${userId} a las ${horaStr}`);
                return;
            }

            // Validar si ya tiene salida (Turno finalizado)
            if (marcacionesHoy.some(m => m.tipo === 'salida')) {
                console.warn(`🛑 Usuario ${userId} ya tiene salida registrada hoy. Se ignora marcación.`);
                return;
            }

            // Lógica de turno: Entrada -> Colación -> Colación -> Salida
            let tipo = 'entrada';

            // Ordenamos por hora para contar correctamente (ya debería venir ordenado, pero aseguramos)
            const sortedPunches = marcacionesHoy.sort((a, b) => a.hora.localeCompare(b.hora));
            const count = sortedPunches.length;

            if (count === 0) {
                tipo = 'entrada';
            } else if (count === 1) {
                tipo = 'colacion'; // Colación Inicio
            } else if (count === 2) {
                tipo = 'colacion'; // Colación Fin
            } else if (count >= 3) {
                tipo = 'salida';
            }

            console.log(`
                usuarioEmpresaId: ${usuarioEmpresaId}
                tipo: ${tipo}
                fechaStr: ${fechaStr}
                horaStr: ${horaStr}
            `);
            // 6. Guardar Marcación
            const result = await MarcacionesServices.insertarMarcacionManual(
                usuarioEmpresaId,
                tipo,
                fechaStr,
                horaStr
            );

            if (result.success) {
                console.log(`✅ Marcación registrada: ${tipo} para usuario ${userId} (${horaStr})`);
            } else {
                console.error('❌ Error guardando marcación:', result.message);
            }

        } catch (error) {
            console.error('❌ Error procesando marcación ZK:', error);
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
        mqttService.unsubscribe(`zk / ${serial}/out`);
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
        const test = await this.sendCommand(serial, 'GET_USERS', {});
        console.log("test");
        console.log(test);
        return test;
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
