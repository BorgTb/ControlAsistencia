import zkDeviceService from '../services/ZKDeviceService.js';
import dispositivoZKService from '../services/DispositivoZKService.js';

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
        const { serial, name, location, empresa_id } = req.body;

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
            activo: true
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

        if (!action) {
            return res.status(400).json({
                success: false,
                message: 'Action es requerido'
            });
        }

        const result = await zkDeviceService.sendCommand(
            serial,
            action,
            payload || {},
            timeout || 30000
        );

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
        //console.log(`Obteniendo usuarios del dispositivo ${serial}`);   
        const users = await zkDeviceService.getUsers(serial);
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
        const result = await zkDeviceService.syncTime(serial);

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

        const attendance = await zkDeviceService.getAttendance(serial, startDate, endDate);

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
        const info = await zkDeviceService.getDeviceInfo(serial);

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
        const result = await zkDeviceService.restart(serial);

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
        const result = await zkDeviceService.clearLogs(serial);

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
