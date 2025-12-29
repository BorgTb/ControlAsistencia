/**
 * ADMSService.js
 * 
 * Gestiona el protocolo ADMS (Push SDK 3.2.0) para dispositivos ZKTeco.
 * Mantiene la cola de comandos, historial y registro de dispositivos activos.
 */

import { DateTime } from 'luxon';

class ADMSService {
    constructor() {
        this.devices = new Map(); // Map<sn, { lastUpdate: Date, status: string, name: string }>
        this.commandQueue = new Map(); // Map<sn, Array<{ id: string, content: string }>>
        this.commandHistory = new Map(); // Map<sn, Array<{ id: string, return: string, timestamp: Date }>>
        this.cmdIdCounter = 100;
        this.userDatabase = new Map(); // Map<sn, Map<pin, user>>
        this.fingerprintDatabase = new Map(); // Map<sn, Map<pin, Array<fp>>>
        this.pendingResponses = new Map(); // Map<cmdId, { resolve: function, timer: timer }>
    }

    /**
     * Genera el siguiente ID de comando
     */
    nextCmdId() {
        return (this.cmdIdCounter++).toString();
    }

    /**
     * Registra o actualiza un dispositivo
     * @param {string} sn - Número de serie del dispositivo
     */
    updateDeviceHeartbeat(sn) {
        if (!this.devices.has(sn)) {
            this.devices.set(sn, {
                sn,
                firstSeen: new Date(),
                status: 'online'
            });
            console.log(`[ADMS] Nuevo dispositivo detectado: ${sn}`);
        }
        const device = this.devices.get(sn);
        device.lastUpdate = new Date();
        device.status = 'online';
    }

    /**
     * Encola un comando para un dispositivo
     * @param {string} sn - Número de serie
     * @param {string} cmdContent - Contenido del comando (sin prefijo C:ID:)
     * @returns {string} - ID del comando generado
     */
    queueCommand(sn, cmdContent) {
        if (!this.commandQueue.has(sn)) {
            this.commandQueue.set(sn, []);
        }
        const id = this.nextCmdId();
        const formattedCmd = `C:${id}:${cmdContent}`;
        this.commandQueue.get(sn).push({ id, content: formattedCmd });
        console.log(`[ADMS] Comando ${id} encolado para ${sn}: ${cmdContent}`);
        return id;
    }

    /**
     * Obtiene y remueve el siguiente comando de la cola
     * @param {string} sn - Número de serie
     */
    getNextCommand(sn) {
        if (this.commandQueue.has(sn) && this.commandQueue.get(sn).length > 0) {
            return this.commandQueue.get(sn).shift();
        }
        return null;
    }

    /**
     * Registra el resultado de un comando
     * @param {string} sn - Número de serie
     * @param {string} cmdId - ID del comando
     * @param {string} returnValue - Código de retorno del dispositivo
     */
    recordCommandResult(sn, cmdId, returnValue) {
        if (!this.commandHistory.has(sn)) {
            this.commandHistory.set(sn, []);
        }
        this.commandHistory.get(sn).push({
            id: cmdId,
            return: returnValue,
            timestamp: new Date()
        });
        console.log(`[ADMS] Resultado recibido de ${sn}: ID=${cmdId}, Return=${returnValue}`);

        // Resolver promesas pendientes para este ID de comando
        if (this.pendingResponses.has(cmdId)) {
            const { resolve, timer } = this.pendingResponses.get(cmdId);
            clearTimeout(timer);
            this.pendingResponses.delete(cmdId);
            resolve({ success: returnValue === '0', return: returnValue });
        }
    }

    /**
     * Espera a que un comando sea ejecutado por el dispositivo
     * @param {string} cmdId - ID del comando
     * @param {number} timeout - Tiempo máximo de espera en ms
     */
    async waitForCommand(cmdId, timeout = 30000) {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                if (this.pendingResponses.has(cmdId)) {
                    this.pendingResponses.delete(cmdId);
                    resolve({ success: false, error: 'timeout', message: 'Dispositivo no respondió a tiempo' });
                }
            }, timeout);

            this.pendingResponses.set(cmdId, { resolve, timer });
        });
    }

    /**
     * Utilidad para parsear líneas de clave-valor (formato ADMS)
     * e.g. PIN=1\tName=Alex
     */
    parseKeyValueLine(line) {
        const obj = {};
        const parts = line.split('\t');
        parts.forEach(part => {
            const [key, ...valueParts] = part.split('=');
            if (key) obj[key] = valueParts.join('=');
        });
        return obj;
    }

    /**
     * Obtiene el estado de un dispositivo
     * @param {string} sn - Número de serie
     */
    getDeviceStatus(sn) {
        return this.devices.get(sn) || null;
    }

    // --- Atajos para comandos comunes ---
    syncTime() { return this.commands.syncTime(); }
    reboot() { return this.commands.reboot(); }
    clearLog() { return this.commands.clearLog(); }
    addUser(...args) { return this.commands.addUser(...args); }
    deleteUser(...args) { return this.commands.deleteUser(...args); }
    enrollFingerprint(...args) { return this.commands.enrollFingerprint(...args); }
    enrollFace(...args) { return this.commands.enrollFace(...args); }
    setTimezone(offset) { return this.commands.setTimezone(offset); }

    /**
     * Genera la respuesta de configuración para el handshake (cdata GET)
     */
    getHandshakeResponse() {
        const now = DateTime.now().setZone('America/Santiago');
        const formatted = now.toFormat('yyyy-MM-dd HH:mm:ss');

        // El Stamp debe ser un número único (usamos segundos actuales)
        const stamp = Math.floor(now.toMillis() / 1000);

        // CRÍTICO: El formato debe ser EXACTO según especificación ZKTeco
        // Cada parámetro en una línea separada con \r\n
        const response = [
            'OK',
            `Stamp=${stamp}`,
            `OpStamp=${stamp}`,
            `PhotoStamp=${stamp}`,
            `ErrorDelay=60`,
            `Delay=10`,
            `TransTimes=00:00;14:05`,
            `TransInterval=1`,
            `TransFlag=TransData AttLog\tOpLog\tAttPhoto\tEnrollUser\tEnrollFP\tChgUser\tChgFP`,
            `TimeZone=-3`,
            `RealTime=1`,
            `Encrypt=0`
        ].join('\r\n') + '\r\n';

        console.log(`[ADMS] >>> ENVIANDO HANDSHAKE <<<`);
        console.log(`[ADMS] Hora Chile: ${formatted}`);
        console.log(`[ADMS] Stamp: ${stamp}`);
        console.log(`[ADMS] TimeZone: -3`);

        return response;
    }

    /**
     * Comandos estándar del protocolo ADMS
     */
    get commands() {
        return {
            syncTime: () => {
                const now = DateTime.now();
                const formatted = now.toFormat('yyyy-MM-dd HH:mm:ss');
                console.log(`[ADMS] >>> GENERANDO DEEP SYNC_TIME <<<`);
                console.log(`[ADMS] Timezone servidor: ${now.zoneName}`);
                console.log(`[ADMS] Hora a enviar: ${formatted}`);

                // Forzar todas las opciones de tiempo en un solo comando
                // TZ=-180 (minutos), TimeZone=-3 (horas), DaylightSavingTimeOn=0 (No DST), NTPOn=0 (No NTP)
                return `SET OPTIONS DateTime=${formatted},TZ=-180,TimeZone=-3,DaylightSavingTimeOn=0,NTPOn=0`;
            },
            setTimezone: (offset = -180) => `SET OPTIONS TZ=${offset}`, // Offset en minutos (-180 = -3h Chile)
            reboot: () => `REBOOT`,
            clearLog: () => `CLEAR LOG`,
            addUser: (pin, name, pri = 0, password = '', card = '') => {
                let cmd = `DATA USER PIN=${pin}\tName=${name}\tPri=${pri}\tVerify=0\tGroup=1\tTZ=0000000100000000`;
                if (password) cmd += `\tPasswd=${password}`;
                if (card) cmd += `\tCard=${card}`;
                return cmd;
            },
            deleteUser: (pin) => `DATA DELETE USERINFO PIN=${pin}`,
            setFingerprint: (pin, fid, size, template) =>
                `DATA FP PIN=${pin}\tFID=${fid}\tSize=${size}\tValid=1\tTMP=${template}`,
            setFace: (pin, fid, size, template) =>
                `DATA FACE PIN=${pin}\tFID=${fid}\tSize=${size}\tValid=1\tTMP=${template}`,
            deleteFingerprint: (pin, fid) => `DATA DELETE USERFP PIN=${pin}\tFID=${fid}`,
            enrollFingerprint: (pin, fid) => `ENROLL_FP PIN=${pin}\tFID=${fid}`,
            enrollFace: (pin) => `ENROLL_FACE PIN=${pin}`,
            queryData: (table) => `DATA QUERY ${table}`,
            setDelay: (seconds) => `SET OPTIONS Delay=${seconds}`
        };
    }
}

export default new ADMSService();
