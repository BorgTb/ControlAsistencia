import zkDeviceService from '../services/ZKDeviceService.js';
import dispositivoZKService from '../services/DispositivoZKService.js';
import ADMSService from '../services/ADMSService.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import ZKUsuarioSincronizacionModel from '../model/zk_usuario_sincronizacion.js';

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
        const { forceSync } = req.query; // Parámetro opcional para forzar sincronización
        
        // Obtener el protocolo del dispositivo
        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Dispositivo no encontrado'
            });
        }

        // Función auxiliar para enriquecer usuarios con validación de sistema y datos completos
        const enrichUsersWithSystemValidation = async (users, empresaId, dispositivoId) => {
            // Obtener todos los usuarios de la empresa
            const usuariosEmpresa = await UsuarioEmpresaModel.getUsuariosByEmpresaId(empresaId);
            
            return Promise.all(users.map(async (user) => {
                // Buscar si el usuario existe en la BD por user_id (PIN del dispositivo)
                const usuarioEnSistema = usuariosEmpresa.find(ue => 
                    ue.usuario_rut === user.user_id || 
                    ue.usuario_id?.toString() === user.user_id
                );

                const enrichedUser = {
                    ...user,
                    in_system: !!usuarioEnSistema
                };

                // Si existe en sistema, agregar datos adicionales y persistir en BD
                if (usuarioEnSistema) {
                    enrichedUser.rut = usuarioEnSistema.usuario_rut;
                    enrichedUser.nombre_completo = `${usuarioEnSistema.usuario_nombre} ${usuarioEnSistema.usuario_apellido_pat || ''}`.trim();
                    enrichedUser.usuario_empresa_id = usuarioEnSistema.id;
                    
                    // Persistir en BD para consulta futura
                    await ZKUsuarioSincronizacionModel.saveUsuarioDispositivo(
                        dispositivoId,
                        user.user_id,
                        enrichedUser
                    );
                }

                return enrichedUser;
            }));
        };

        let users;
        if (device && device.protocolo === 'ADMS') {
            // Siempre intentar sincronizar desde el dispositivo primero
            console.log(`[ADMS] Solicitando sincronización de usuarios para ${serial}...`);
            const cmdId = ADMSService.queueCommand(serial, 'DATA QUERY USERINFO');

            // Esperar confirmación del comando
            const result = await ADMSService.waitForCommand(cmdId, 10000);

            if (result.success) {
                // El comando se ejecutó, esperar un poco por los datos
                console.log(`[ADMS] Comando confirmado. Esperando datos...`);
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Verificar si llegaron datos
                const updatedCache = ADMSService.userDatabase.get(serial);
                if (updatedCache && updatedCache.size > 0) {
                    users = Array.from(updatedCache.values());
                    console.log(`[ADMS] ✓ ${users.length} usuarios sincronizados correctamente desde dispositivo`);
                } else {
                    return res.status(200).json({
                        success: true,
                        message: 'Sincronización iniciada. Los datos pueden tardar en llegar. Intente nuevamente en unos segundos.',
                        data: [],
                        syncing: true
                    });
                }
            } else {
                // Si hubo timeout, combinar BD + cache para mostrar todos los usuarios
                console.log(`[ADMS] Dispositivo no respondió. Consultando BD y cache para ${serial}...`);
                
                const dbUsers = await ZKUsuarioSincronizacionModel.getUsuariosConDatos(device.id);
                const fallbackCache = ADMSService.userDatabase.get(serial);
                
                // Combinar usuarios de BD y cache
                const usersMap = new Map();
                
                // Agregar usuarios de BD primero (tienen más info)
                dbUsers.forEach(user => {
                    usersMap.set(user.user_id, user);
                });
                
                // Agregar usuarios del cache que no estén en BD
                if (fallbackCache && fallbackCache.size > 0) {
                    const cacheArray = Array.from(fallbackCache.values());
                    for (const user of cacheArray) {
                        if (!usersMap.has(user.user_id)) {
                            // Usuario del cache no está en sistema
                            usersMap.set(user.user_id, {
                                ...user,
                                in_system: false,
                                from_cache: true
                            });
                        }
                    }
                }
                
                const combinedUsers = Array.from(usersMap.values());
                
                if (combinedUsers.length > 0) {
                    console.log(`[ADMS] Retornando ${combinedUsers.length} usuarios (${dbUsers.length} de BD, ${combinedUsers.length - dbUsers.length} solo en cache)`);
                    return res.status(200).json({
                        success: true,
                        message: 'Dispositivo no disponible. Mostrando última sincronización guardada.',
                        data: combinedUsers,
                        from_db: dbUsers.length > 0,
                        cached: fallbackCache && fallbackCache.size > 0
                    });
                }
                
                return res.status(504).json({
                    success: false,
                    message: 'El dispositivo no respondió y no hay datos disponibles.'
                });
            }
        } else {
            users = await zkDeviceService.getUsers(serial);
        }
        
        // Enriquecer usuarios con validación de sistema
        const enrichedUsers = await enrichUsersWithSystemValidation(users, device.empresa_id, device.id);
        console.log(`Usuarios obtenidos y validados: ${enrichedUsers.length || 0}`);

        res.status(200).json({
            success: true,
            data: enrichedUsers
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
 * Eliminar usuario del dispositivo
 */
export const deleteUser = async (req, res) => {
    try {
        const { serial } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id es requerido'
            });
        }

        const dbDevice = await dispositivoZKService.obtenerDispositivosConEstado();
        const device = dbDevice.find(d => d.serial === serial);

        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Dispositivo no encontrado'
            });
        }

        let result;
        if (device && device.protocolo === 'ADMS') {
            const cmdId = ADMSService.queueCommand(serial, ADMSService.deleteUser(user_id));
            console.log(`[ADMS] Esperando resultado de eliminación de usuario ${user_id} en ${serial}...`);
            const waitResult = await ADMSService.waitForCommand(cmdId, 15000);

            if (waitResult.success) {
                // Eliminar de BD también
                await ZKUsuarioSincronizacionModel.deleteByUserId(device.id, user_id);
                // Limpiar cache
                const cachedUsers = ADMSService.userDatabase.get(serial);
                if (cachedUsers) {
                    cachedUsers.delete(user_id);
                }
            }

            return res.status(200).json({
                success: waitResult.success,
                message: waitResult.success ? 'Usuario eliminado con éxito' : (waitResult.message || 'El dispositivo no confirmó la eliminación'),
                data: waitResult
            });
        } else {
            result = await zkDeviceService.deleteUser(serial, user_id);
            // Eliminar de BD también
            await ZKUsuarioSincronizacionModel.deleteByUserId(device.id, user_id);
        }

        res.status(200).json({
            success: true,
            message: 'Usuario eliminado',
            data: result
        });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
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
