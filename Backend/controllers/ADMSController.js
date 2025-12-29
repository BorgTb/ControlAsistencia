/**
 * ADMSController.js
 * 
 * Controlador para los endpoints /iclock del protocolo ADMS.
 */

import ADMSService from '../services/ADMSService.js';
import zkDeviceService from '../services/ZKDeviceService.js';
import DispositivoZKService from '../services/DispositivoZKService.js';

export const handleCData = async (req, res) => {
    const sn = req.query.sn || req.query.SN;
    const { table } = req.query;

    if (!sn) {
        return res.send('OK');
    }

    // Actualizar latido del dispositivo
    ADMSService.updateDeviceHeartbeat(sn);

    // Si es un GET, es un apretón de manos inicial o solicitud de opciones
    if (req.method === 'GET') {
        console.log(`[ADMS] Handshake/Config SN: ${sn}`);
        // Registrar dispositivo en la base de datos si no existe (auto-detectado)
        try {
            if (!zkDeviceService.getDeviceStatus(sn)) {
                await DispositivoZKService.registrarAutoDetectado(sn, {
                    name: `ADMS-${sn}`,
                    autoDetected: true,
                    protocol: 'ADMS'
                });
            }
        } catch (error) {
            console.error(`[ADMS] Error auto-registrando dispositivo ${sn}:`, error);
        }
        return res.send(ADMSService.getHandshakeResponse());
    }

    // Si es un POST, es envío de datos
    if (req.method === 'POST') {
        const payload = req.body;
        if (!payload) return res.send('OK');

        console.log(`[ADMS] Recibida tabla ${table} de SN: ${sn}`);

        const lines = payload.split('\n').filter(l => l.trim());
        const tableName = (table || '').toUpperCase();

        if (tableName === 'ATTLOG') {
            for (const line of lines) {
                const [pin, time, status, verify, workcode] = line.split('\t');
                console.log(`[ADMS] Marcación: SN:${sn} PIN:${pin} Time:${time}`);

                // Reutilizar la lógica de procesamiento de ZKDeviceService
                await zkDeviceService.processAttendanceLog(sn, {
                    user_id: pin,
                    timestamp: time
                });
            }
        } else if (tableName === 'USER' || tableName === 'USERINFO') {
            if (!ADMSService.userDatabase.has(sn)) {
                ADMSService.userDatabase.set(sn, new Map());
            }
            const snDB = ADMSService.userDatabase.get(sn);
            lines.forEach(line => {
                const user = ADMSService.parseKeyValueLine(line);
                if (user.PIN) {
                    snDB.set(user.PIN, {
                        user_id: user.PIN,
                        name: user.Name || `User ${user.PIN}`,
                        privilege: parseInt(user.Pri) || 0,
                        card: user.Card || ''
                    });
                    console.log(`[ADMS] Sync Usuario (SN:${sn}): ${user.Name} (PIN:${user.PIN})`);
                }
            });
        } else if (tableName === 'FINGERTMP' || tableName === 'FP') {
            if (!ADMSService.fingerprintDatabase.has(sn)) {
                ADMSService.fingerprintDatabase.set(sn, new Map());
            }
            const snFPDB = ADMSService.fingerprintDatabase.get(sn);
            lines.forEach(line => {
                const fpData = ADMSService.parseKeyValueLine(line);
                if (fpData.PIN) {
                    if (!snFPDB.has(fpData.PIN)) {
                        snFPDB.set(fpData.PIN, []);
                    }
                    snFPDB.get(fpData.PIN).push(fpData);
                    console.log(`[ADMS] Sync Huella (SN:${sn}): PIN:${fpData.PIN} FID:${fpData.FID}`);
                }
            });
        } else if (tableName === 'OPERLOG') {
            lines.forEach(line => {
                console.log(`[ADMS] Log de Operación (SN:${sn}): ${line}`);
            });
        } else {
            console.log(`[ADMS] Tabla ${tableName} no procesada específicamente o vacía. Líneas: ${lines.length}`);
            if (lines.length > 0) {
                console.log(`[ADMS] Contenido raw: ${payload}`);
            }
        }
        // Se pueden agregar más tablas (FP, OPERLOG, etc.) según sea necesario

        return res.send('OK');
    }
};

export const handleGetRequest = (req, res) => {
    const sn = req.query.sn || req.query.SN;
    if (!sn) return res.send('OK');

    const command = ADMSService.getNextCommand(sn);
    if (command) {
        console.log(`[ADMS] Enviando comando ${command.id} a SN: ${sn}`);
        return res.send(command.content);
    }

    res.send('OK');
};

export const handleDeviceCmd = (req, res) => {
    const sn = req.query.sn || req.query.SN;
    const body = (req.body || '').trim();

    if (!sn || !body) return res.send('OK');

    console.log(`[ADMS] Resultado SN: ${sn} -> ${body}`);
    // Formato esperado: ID=100&Return=0
    const result = ADMSService.parseKeyValueLine(body.replace(/&/g, '\t'));

    if (result.ID) {
        ADMSService.recordCommandResult(sn, result.ID, result.Return);
    }

    res.send('OK');
};
