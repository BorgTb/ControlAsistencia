import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';


dotenv.config();



const app = express();
const PORT = process.env.SERVER_PORT;


//MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', router.login);
app.use('/api/marcaciones', router.marcaciones);
app.use('/api/user', router.users);
app.use('/api/empresas', router.empresas);
app.use('/api/admin', router.admin);
app.use('/api/reportes', router.reportes);


// START SERVER
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
