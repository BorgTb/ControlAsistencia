import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();

// MySQL Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}); 


try {
    const connection = await pool.getConnection();
    console.log('Connected to the MySQL database.');
    connection.release(); // Devuelve la conexión al pool
} catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
}

export default pool;
