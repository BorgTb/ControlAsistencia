import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import ApiTelegestorRouter from './TelegestorApi/routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT;

//MIDDLEWARE
app.use(cors());
app.use(express.json());


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
app.use('/api/documentos', express.static(path.join(__dirname, 'uploads')), router.documentos);




// START SERVER
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
});
