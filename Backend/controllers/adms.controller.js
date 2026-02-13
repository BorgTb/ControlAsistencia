/**
 * adms.controller.js
 * 
 * Controlador para los endpoints /iclock del protocolo ADMS.
 */

import ADMSService from '../services/adms.service.js';
import zkDeviceService from '../services/zk-device.service.js';
import DispositivoZKService from '../services/dispositivo-zk.service.js';

const getSerialFromRequest = (req) => {
    const candidate = req.query?.sn || req.query?.SN || req.body?.sn || req.body?.SN || '';
    return String(candidate).trim();
};

const getBodyAsText = (body) => {
    if (!body) return '';
    if (typeof body === 'string') return body;
    if (Buffer.isBuffer(body)) return body.toString('utf8');
    if (typeof body === 'object') {
        return Object.entries(body)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
    }
    return String(body);
};

export const handleCData = async (req, res) => {
    const sn = getSerialFromRequest(req);
    const table = req.query.table || req.query.TABLE;

    if (!sn) {
        return res.send('OK');
    }

    // Actualizar latido del dispositivo
    ADMSService.updateDeviceHeartbeat(sn);

    // Si es un GET, es un apretÃ³n de manos inicial o solicitud de opciones
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

    // Si es un POST, es envÃ­o de datos
    if (req.method === 'POST') {
        const payload = getBodyAsText(req.body);
        if (!payload) return res.send('OK');

        console.log(`[ADMS] Recibida tabla ${table} de SN: ${sn}`);

        const lines = payload.split(/\r?\n/).filter(l => l.trim());
        const tableName = (table || '').toUpperCase();

        if (tableName === 'ATTLOG') {
            for (const line of lines) {
            const [pin, time] = line.split('\t').map(value => String(value || '').trim());
            if (!pin || !time) continue;
                console.log(`[ADMS] MarcaciÃ³n: SN:${sn} PIN:${pin} Time:${time}`);

                // Reutilizar la lÃ³gica de procesamiento de ZKDeviceService
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
        } else if (tableName === 'OPERLOG') {

            
            // Si detectamos que tiene formato de usuarios (lÃ­neas que empiezan con "USER PIN=")
            if (lines.length > 0 && (lines[0].includes('USER PIN=') || lines[0].includes('PIN='))) {
                if (!ADMSService.userDatabase.has(sn)) {
                    ADMSService.userDatabase.set(sn, new Map());
                }
                const snDB = ADMSService.userDatabase.get(sn);
                lines.forEach(line => {
                    // Remover el prefijo "USER " si existe
                    let cleanLine = line.replace(/^USER\s+/, '');
                    const user = ADMSService.parseKeyValueLine(cleanLine);
                    if (user.PIN) {
                        snDB.set(user.PIN, {
                            user_id: user.PIN,
                            name: user.Name || `User ${user.PIN}`,
                            privilege: parseInt(user.Pri) || 0,
                            card: user.Card || '',
                            password: user.Passwd || ''
                        });
                        console.log(`[ADMS] Sync Usuario desde OPERLOG (SN:${sn}): ${user.Name} (PIN:${user.PIN})`);
                    }
                });
            }
        } else if (tableName === 'FINGERTMP' || tableName === 'FINGERTEMP' || tableName === 'FP') {
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
        }
        
        // Se pueden agregar mÃ¡s tablas (FP, OPERLOG, etc.) segÃºn sea necesario

        return res.status(200).send('OK');
    }
};

export const handleGetRequest = (req, res) => {
    const sn = getSerialFromRequest(req);
    if (!sn) return res.status(200).send('OK');

    const command = ADMSService.getNextCommand(sn);
    if (command) {
        console.log(`[ADMS] Enviando comando ${command.id} a SN: ${sn}`);
        return res.send(command.content);
    }

    res.send('OK');
};

export const handleDeviceCmd = (req, res) => {
    const sn = getSerialFromRequest(req);
    let body = getBodyAsText(req.body).trim();

    if (!body && req.query) {
        const pairs = Object.entries(req.query)
            .filter(([key]) => key !== 'sn' && key !== 'SN')
            .map(([key, value]) => `${key}=${value}`);
        body = pairs.join('&').trim();
    }

    if (!sn || !body) return res.send('OK');

    console.log(`[ADMS] Resultado SN: ${sn} -> ${body}`);
    // Formato esperado: ID=100&Return=0
    const result = ADMSService.parseKeyValueLine(body.replace(/&/g, '\t'));

    const commandId = result.ID || result.id;
    const returnValue = result.Return || result.return;
    if (commandId) {
        ADMSService.recordCommandResult(sn, commandId, returnValue);
    }

    res.send('OK');
};
