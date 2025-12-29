import zkDeviceService from '../services/ZKDeviceService.js';
import dispositivoZKService from '../services/DispositivoZKService.js';
import ADMSService from '../services/ADMSService.js';

/**
 * Obtener todos los dispositivos ZK registrados
 */
export const getAllDevices = async (req, res) => {
    try {
        // Usar servicio de BD enriquecido con estado MQTT
        let devices;
        // Si hay usuario autenticado con empresa, filtrar
        if (req.user && req.user.empresa_id) {
            devices = await dispositivoZKService.obtenerDispositivosPorEmpresa(req.user.empresa_id);
        } else {
            devices = await dispositivoZKService.obtenerDispositivosConEstado();
        }

        res.status(200).json({
            success: true,
            count: devices.length,
            data: devices
        });
    } catch (error) {
        console.error('Error obteniendo dispositivos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener dispositivos',
            error: error.message
        });
    }
};

/**
 * Obtener dispositivos online
 */
export const getOnlineDevices = async (req, res) => {
    try {
        // Filtrar de la lista completa
        let devices;
        if (req.user && req.user.empresa_id) {
            devices = await dispositivoZKService.obtenerDispositivosPorEmpresa(req.user.empresa_id);
        } else {
            devices = await dispositivoZKService.obtenerDispositivosConEstado();
        }

        const onlineDevices = devices.filter(d => d.mqtt_online);

        res.status(200).json({
            success: true,
            count: onlineDevices.length,
            data: onlineDevices
        });
    } catch (error) {
        console.error('Error obteniendo dispositivos online:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener dispositivos online',
            error: error.message
        });
    }
};

/**
 * Obtener estado de un dispositivo específico
 */
export const getDeviceStatus = async (req, res) => {
    try {
        const { serial } = req.params;
        const device = zkDeviceService.getDeviceStatus(serial);

        // También intentar obtener info de la BD
        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const found = dbDevice.find(d => d.serial === serial);

        if (!device && !found) {
            return res.status(404).json({
                success: false,
                message: `Dispositivo ${serial} no encontrado`
            });
        }

        res.status(200).json({
            success: true,
            data: found || device
        });
    } catch (error) {
        console.error('Error obteniendo estado del dispositivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estado',
            error: error.message
        });
    }
};

/**
 * Registrar un nuevo dispositivo ZK
 */
export const registerDevice = async (req, res) => {
    try {
        const { serial, name, location, empresa_id, protocolo } = req.body;

        if (!serial) {
            return res.status(400).json({
                success: false,
                message: 'Serial es requerido'
            });
        }

        // Determinar ID de empresa (del body o del usuario autenticado)
        const empresaId = empresa_id || (req.user ? req.user.empresa_id : 1); // Fallback a 1 si no hay auth

        const deviceData = {
            serial,
            nombre: name,
            ubicacion: location,
            empresa_id: empresaId,
            activo: true,
            protocolo: protocolo || 'MQTT'
        };

        const device = await dispositivoZKService.crearDispositivo(deviceData);

        res.status(201).json({
            success: true,
            message: 'Dispositivo registrado exitosamente',
            data: device
        });
    } catch (error) {
        console.error('Error registrando dispositivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar dispositivo',
            error: error.message
        });
    }
};

/**
 * Actualizar un dispositivo ZK
 */
export const updateDevice = async (req, res) => {
    try {
        const { serial } = req.params;
        const { name, location, protocolo, activo } = req.body;

        // Buscar el dispositivo por serial para obtener su ID
        const devices = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = devices.find(d => d.serial === serial);

        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Dispositivo no encontrado'
            });
        }

        const updateData = {
            nombre: name || device.nombre,
            ubicacion: location || device.ubicacion,
            protocolo: protocolo || device.protocolo,
            activo: activo !== undefined ? activo : device.activo,
            empresa_id: device.empresa_id // Mantener el mismo
        };

        const updated = await dispositivoZKService.actualizarDispositivo(device.id, updateData);

        res.status(200).json({
            success: true,
            message: 'Dispositivo actualizado exitosamente',
            data: updated
        });
    } catch (error) {
        console.error('Error actualizando dispositivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar dispositivo',
            error: error.message
        });
    }
};

/**
 * Desregistrar un dispositivo ZK
 */
export const unregisterDevice = async (req, res) => {
    try {
        const { serial } = req.params;

        // Necesitamos el ID de BD para eliminar usando el servicio
        // Ojo, el servicio `eliminarDispositivo` pide ID.
        // Pero nuestra ruta usa serial. 
        // Vamos a buscar primero el dispositivo por serial en la lista
        const devices = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = devices.find(d => d.serial === serial);

        if (device) {
            await dispositivoZKService.eliminarDispositivo(device.id);
        } else {
            // Si no está en BD pero está en memoria (casos raros)
            zkDeviceService.unregisterDevice(serial);
        }

        res.status(200).json({
            success: true,
            message: `Dispositivo ${serial} desregistrado`
        });
    } catch (error) {
        console.error('Error desregistrando dispositivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desregistrar dispositivo',
            error: error.message
        });
    }
};

/**
 * Enviar comando a un dispositivo
 */
export const sendCommand = async (req, res) => {
    try {
        const { serial } = req.params;
        const { action, payload, timeout } = req.body;

        // Obtener el protocolo del dispositivo
        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        let result;
        if (device && device.protocolo === 'ADMS') {
            // Mapear acciones MQTT a comandos ADMS si es necesario
            let admsCommand;
            switch (action) {
                case 'syncTime': admsCommand = ADMSService.syncTime(); break;
                case 'reboot': case 'restart': admsCommand = ADMSService.reboot(); break;
                case 'clearLogs': admsCommand = ADMSService.clearLog(); break;
                case 'setHeartbeat':
                    admsCommand = ADMSService.commands.setDelay(payload.delay || 10);
                    break;
                case 'CREATE_USER':
                    admsCommand = ADMSService.addUser(
                        payload.user_id,
                        payload.name,
                        payload.password,
                        payload.privilege || 0,
                        payload.card || ''
                    );
                    result = ADMSService.queueCommand(serial, admsCommand);
                    if (payload.register_finger) {
                        ADMSService.queueCommand(serial, ADMSService.enrollFingerprint(payload.user_id));
                    }
                    if (payload.register_face) {
                        ADMSService.queueCommand(serial, ADMSService.enrollFace(payload.user_id));
                    }
                    break;
                // ... añadir más mapeos según sea necesario
                default: admsCommand = action; // Intentar usar el string directamente
            }
            // If result was not set in a specific case (like CREATE_USER), set it here
            if (result === undefined) {
                result = ADMSService.queueCommand(serial, admsCommand);
            }

            // Esperar el resultado si es un comando síncrono (opcional, pero mejora la experiencia)
            console.log(`[ADMS] Esperando resultado de comando ${result} para ${serial}...`);
            const waitResult = await ADMSService.waitForCommand(result, 20000);

            return res.status(200).json({
                success: waitResult.success,
                message: waitResult.success ? 'Comando ejecutado con éxito' : (waitResult.message || 'El dispositivo recibió el comando pero no confirmó ejecución'),
                data: waitResult
            });
        } else {
            result = await zkDeviceService.sendCommand(
                serial,
                action,
                payload || {},
                timeout || 30000
            );
        }

        res.status(200).json({
            success: true,
            message: 'Comando ejecutado exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error ejecutando comando:', error);
        res.status(500).json({
            success: false,
            message: 'Error al ejecutar comando',
            error: error.message
        });
    }
};

/**
 * Obtener usuarios del dispositivo
 */
export const getUsers = async (req, res) => {
    try {
        const { serial } = req.params;
        // Obtener el protocolo del dispositivo
        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        let users;
        if (device && device.protocolo === 'ADMS') {
            // Para ADMS, encolamos el comando de consulta y ESPERAMOS el resultado
            console.log(`[ADMS] Solicitando sincronización de usuarios para ${serial}...`);
            const cmdId = ADMSService.queueCommand(serial, 'DATA QUERY USERINFO');

            // Esperar a que el dispositivo ejecute el comando (timeout 20s para no bloquear tanto el front)
            const result = await ADMSService.waitForCommand(cmdId, 20000);

            if (result.success) {
                // El comando se ejecutó, pero la data puede tardar un poco en llegar vía POST /iclock/cdata
                console.log(`[ADMS] Comando de sincronización confirmado. Esperando 2s por los datos de ${serial}...`);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // El comando se ejecutó, los datos ya deberían estar en el cache (vía handleCData)
                const cachedUsers = ADMSService.userDatabase.get(serial);
                if (cachedUsers && cachedUsers.size > 0) {
                    const deviceUsersList = Array.from(cachedUsers.values());

                    // Nota: Aquí podrías volver a agregar la relación con el sistema si lo deseas
                    // Por ahora retornamos lo que viene del reloj de forma síncrona
                    users = deviceUsersList;
                } else {
                    return res.status(200).json({
                        success: true,
                        message: 'Sincronización completada pero el dispositivo no devolvió usuarios.',
                        data: []
                    });
                }
            } else {
                // Si hubo timeout o error, intentar devolver lo que haya en cache por si acaso
                const cachedUsers = ADMSService.userDatabase.get(serial);
                if (cachedUsers && cachedUsers.size > 0) {
                    return res.status(200).json({
                        success: true,
                        message: 'Sincronización lenta o fallida, se muestran datos cacheados.',
                        data: Array.from(cachedUsers.values())
                    });
                } else {
                    return res.status(504).json({
                        success: false,
                        message: 'El dispositivo no respondió a la solicitud de sincronización a tiempo.'
                    });
                }
            }
        } else {
            users = await zkDeviceService.getUsers(serial);
        }
        console.log(`Usuarios obtenidos: ${users}`);


        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

/**
 * Sincronizar tiempo del dispositivo
 */
export const syncTime = async (req, res) => {
    try {
        const { serial } = req.params;

        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        let result;
        if (device && device.protocolo === 'ADMS') {
            const cmdId = ADMSService.queueCommand(serial, ADMSService.syncTime());
            console.log(`[ADMS] Ejecutando Deep Sync (Time + TZ + NTP/DST off) para ${serial}...`);
            const waitResult = await ADMSService.waitForCommand(cmdId, 25000);

            return res.status(200).json({
                success: waitResult.success,
                message: waitResult.success ? 'Zona horaria y tiempo sincronizados con éxito' : (waitResult.message || 'El dispositivo no confirmó la sincronización'),
                data: waitResult
            });
        } else {
            result = await zkDeviceService.syncTime(serial);
        }

        res.status(200).json({
            success: true,
            message: 'Tiempo sincronizado',
            data: result
        });
    } catch (error) {
        console.error('Error sincronizando tiempo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al sincronizar tiempo',
            error: error.message
        });
    }
};

/**
 * Obtener registros de asistencia del dispositivo
 */
export const getAttendance = async (req, res) => {
    try {
        const { serial } = req.params;
        const { startDate, endDate } = req.query;

        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        let attendance;
        if (device && device.protocolo === 'ADMS') {
            // En ADMS la asistencia suele subir automáticamente via cdata
            // Si queremos pedir un rango específico:
            ADMSService.queueCommand(serial, `DATA QUERY ATTLOG StartTime=${startDate} EndTime=${endDate}`);
            return res.status(202).json({
                success: true,
                message: 'Comando de consulta de asistencia encolado para ADMS'
            });
        } else {
            attendance = await zkDeviceService.getAttendance(serial, startDate, endDate);
        }

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Error obteniendo asistencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener asistencia',
            error: error.message
        });
    }
};

/**
 * Obtener información del dispositivo
 */
export const getDeviceInfo = async (req, res) => {
    try {
        const { serial } = req.params;

        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        let info;
        if (device && device.protocolo === 'ADMS') {
            // ADMS doesn't have a direct "get info" command that returns JSON immediately.
            // We can query device options.
            ADMSService.queueCommand(serial, 'INFO'); // Custom command string for testing or use set options
            return res.status(202).json({
                success: true,
                message: 'Comando de información encolado para ADMS'
            });
        } else {
            info = await zkDeviceService.getDeviceInfo(serial);
        }

        res.status(200).json({
            success: true,
            data: info
        });
    } catch (error) {
        console.error('Error obteniendo información del dispositivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información',
            error: error.message
        });
    }
};

/**
 * Reiniciar dispositivo
 */
export const restartDevice = async (req, res) => {
    try {
        const { serial } = req.params;
        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        let result;
        if (device && device.protocolo === 'ADMS') {
            const cmdId = ADMSService.queueCommand(serial, ADMSService.reboot());
            console.log(`[ADMS] Esperando resultado de reboot para ${serial}...`);
            const waitResult = await ADMSService.waitForCommand(cmdId, 25000); // 25s for reboot

            return res.status(200).json({
                success: waitResult.success,
                message: waitResult.success ? 'Dispositivo reiniciado con éxito' : (waitResult.message || 'El dispositivo no confirmó el reinicio'),
                data: waitResult
            });
        } else {
            result = await zkDeviceService.restart(serial);
        }

        res.status(200).json({
            success: true,
            message: 'Dispositivo reiniciado',
            data: result
        });
    } catch (error) {
        console.error('Error reiniciando dispositivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al reiniciar dispositivo',
            error: error.message
        });
    }
};

/**
 * Abrir puerta
 */
export const openDoor = async (req, res) => {
    try {
        const { serial } = req.params;
        const { duration } = req.body;

        const result = await zkDeviceService.openDoor(serial, duration || 5);

        res.status(200).json({
            success: true,
            message: 'Puerta abierta',
            data: result
        });
    } catch (error) {
        console.error('Error abriendo puerta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al abrir puerta',
            error: error.message
        });
    }
};

/**
 * Limpiar logs del dispositivo
 */
export const clearLogs = async (req, res) => {
    try {
        const { serial } = req.params;

        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        let result;
        if (device && device.protocolo === 'ADMS') {
            const cmdId = ADMSService.queueCommand(serial, ADMSService.clearLog());
            console.log(`[ADMS] Esperando resultado de clearLogs para ${serial}...`);
            const waitResult = await ADMSService.waitForCommand(cmdId, 20000);

            return res.status(200).json({
                success: waitResult.success,
                message: waitResult.success ? 'Logs limpiados con éxito' : (waitResult.message || 'El dispositivo no confirmó la limpieza de logs'),
                data: waitResult
            });
        } else {
            result = await zkDeviceService.clearLogs(serial);
        }

        res.status(200).json({
            success: true,
            message: 'Logs limpiados',
            data: result
        });
    } catch (error) {
        console.error('Error limpiando logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error al limpiar logs',
            error: error.message
        });
    }
};
