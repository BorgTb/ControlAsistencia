import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Configuración global de zona horaria para Chile
process.env.TZ = 'America/Santiago';

import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import ApiTelegestorRouter from './TelegestorApi/routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { startCleanupJob } from './jobs/CleanupRefreshTokens.js';
import mqttService from './services/MQTTService.js';
import zkDeviceService from './services/ZKDeviceService.js';

import ADMSLink from './routes/ADMSLink.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT;

//MIDDLEWARE
// Configurar CORS para permitir cookies
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true // IMPORTANTE: permitir envío de cookies
}));
app.use(express.json());
app.use(cookieParser()); // Parsear cookies


// Telegestor API Routes usa el mismo servidor pero con rutas separadas en un futuro deberia ir en un microservicio aparte
ApiTelegestorRouter(app);



// ROUTES
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', router.login);
app.use('/api/marcaciones', router.marcaciones);
app.use('/api/user', router.users);
app.use('/api/empresas', router.empresas);
app.use('/api/admin', router.admin);
app.use('/api/userEmpresa', router.userEmpresa);
//app.use('/api/test/alertas', router.test);
app.use('/api/auditoria', router.auditoria);
app.use('/api/estadisticas', router.estadisticas);
app.use('/api/fiscalizador', router.fiscalizador);
app.use('/api/justificaciones', router.justificaciones);
app.use('/api/feriados', router.feriados);
app.use('/api/mqtt', router.mqtt);
app.use('/api/zk', router.zk);
app.use('/api/documentos', express.static(path.join(__dirname, 'uploads')), router.documentos);
app.use('/iclock', ADMSLink);




// START SERVER
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Iniciar job de limpieza de refresh tokens (cada 24 horas)
    // Esto elimina tokens expirados y mantiene la BD optimizada
    startCleanupJob(24);
    console.log('✅ Job de limpieza de refresh tokens iniciado');

    // Iniciar servicio MQTT
    mqttService.connect();
    //console.log('✅ Servicio MQTT iniciado');

    // Inicializar servicio de dispositivos ZK (Carga desde BD y sincroniza con MQTT)
    import('./services/DispositivoZKService.js').then(module => {
        const dispositivoZKService = module.default;
        dispositivoZKService.initialize()
            // .then(() => console.log('✅ Servicio de persistencia ZK inicializado'))
            .catch(err => console.error('❌ Error inicializando persistencia ZK:', err));
    }).catch(err => console.error('❌ Error importando DispositivoZKService:', err));

    // Suscribirse a topic wildcard para detectar nuevos dispositivos
    mqttService.subscribe('zk/+/status', async (topic, message) => {
        try {
            const serial = topic.split('/')[1];
            const status = message.toString().trim();

            // Importar servicio dinámicamente para evitar problemas de dependencias circulares si las hubiera
            // O usar la misma referencia si ya está cargada
            const zkDeviceService = (await import('./services/ZKDeviceService.js')).default;
            const dispositivoZKService = (await import('./services/DispositivoZKService.js')).default;

            if (status === 'online' && !zkDeviceService.getDeviceStatus(serial)) {
                console.log(`📱 Nuevo dispositivo ZK detectado: ${serial}`);

                // Registrar como auto-detectado (solo en MQTT por ahora o segun logica de negocio)
                await dispositivoZKService.registrarAutoDetectado(serial, {
                    name: `Auto-detectado ${serial}`,
                    autoDetected: true
                });
            }
        } catch (error) {
            console.error('Error handling new device:', error);
        }
    });
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
    console.log('🛑 Cerrando servidor...');
    mqttService.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Cerrando servidor...');
    mqttService.disconnect();
    process.exit(0);
});
