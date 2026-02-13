/**
 * adms.routes.js
 * 
 * Rutas para el protocolo ADMS (iclock).
 */

import express from 'express';
import * as ADMSController from '../controllers/adms.controller.js';
import ADMSService from '../services/adms.service.js';

const router = express.Router();

// El protocolo ADMS usa cuerpos de texto plano (tab-separated o similar)
const textParser = express.text({ type: '*/*', limit: '5mb' });

// 1. Endpoint de datos (cdata)
router.all('/cdata', textParser, ADMSController.handleCData);

// 2. Endpoint de consulta de comandos (getrequest)
router.all('/getrequest', textParser, ADMSController.handleGetRequest);

// 3. Endpoint de respuesta de comandos (devicecmd)
router.all('/devicecmd', textParser, ADMSController.handleDeviceCmd);

// 4. API PARA CONTROL EXTERNO (Uso interno/test)
router.get('/api/devices', (req, res) => {
    res.json(Array.from(ADMSService.devices.values()));
});

router.get('/api/logs', (req, res) => {
    // Esto podrÃ­a traerlo de la base de datos si se desea, 
    // pero por ahora para el test devolvemos un mensaje o algo simple
    res.json({ message: "Logs are processed and stored in DB via ZKDeviceService" });
});

router.get('/api/commands/:sn', (req, res) => {
    const { sn } = req.params;
    res.json({
        pending: ADMSService.commandQueue.get(sn) || [],
        history: ADMSService.commandHistory.get(sn) || []
    });
});

router.post('/api/command/:sn', express.json(), (req, res) => {
    const { sn } = req.params;
    const { action, payload } = req.body;
    let cmdId;

    try {
        switch (action) {
            case 'addUser':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.addUser(payload.pin, payload.name, payload.pri, payload.password, payload.card));
                break;
            case 'deleteUser':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.deleteUser(payload.pin));
                break;
            case 'deleteFingerprint':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.deleteFingerprint(payload.pin, payload.fid));
                break;
            case 'setFingerprint':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.setFingerprint(payload.pin, payload.fid, payload.template.length, payload.template));
                break;
            case 'setFace':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.setFace(payload.pin, payload.fid, payload.template.length, payload.template));
                break;
            case 'enrollFP':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.enrollFingerprint(payload.pin, payload.fid || 0));
                break;
            case 'enrollFace':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.enrollFace(payload.pin));
                break;
            case 'syncTime':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.syncTime());
                break;
            case 'reboot':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.reboot());
                break;
            case 'clearLog':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.clearLog());
                break;
            case 'syncUsers':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.queryData('USERINFO'));
                break;
            case 'syncLogs':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.queryData('ATTLOG'));
                break;
            case 'syncFingers':
                cmdId = ADMSService.queueCommand(sn, ADMSService.commands.queryData('FINGERTMP'));
                break;
            default:
                return res.status(400).send('Unknown action');
        }
        res.json({ status: 'queued', cmdId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
