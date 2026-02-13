# Backend - Sistema de Control de Asistencia

Este es el backend del Sistema de Control de Asistencia desarrollado en Node.js con Express y MySQL.

## ðŸ“‹ DescripciÃ³n

API RESTful para gestionar el control de asistencia de empleados, incluyendo autenticaciÃ³n, registro de marcaciones (entrada/salida) con geolocalizaciÃ³n, y sistema de notificaciones por correo electrÃ³nico.

## ðŸš€ CaracterÃ­sticas

- **AutenticaciÃ³n JWT**: Sistema de login/registro con tokens seguros
- **Marcaciones con GeolocalizaciÃ³n**: Registro de entradas y salidas con coordenadas GPS
- **Notificaciones por Email**: EnvÃ­o automÃ¡tico de correos al registrar marcaciones
- **Base de Datos MySQL**: Almacenamiento persistente de usuarios y marcaciones
- **Middleware de Seguridad**: VerificaciÃ³n de tokens y validaciÃ³n de usuarios
- **Arquitectura MVC**: SeparaciÃ³n clara de responsabilidades

## ðŸ› ï¸ TecnologÃ­as

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver de base de datos
- **JWT** (jsonwebtoken) - AutenticaciÃ³n
- **bcrypt** - EncriptaciÃ³n de contraseÃ±as
- **Nodemailer** - EnvÃ­o de correos electrÃ³nicos
- **dotenv** - Variables de entorno
- **CORS** - Cross-Origin Resource Sharing

## ðŸ“ Estructura del Proyecto

```
Backend/
â”œâ”€â”€ config/
â”‚   â””â”€â”€ dbconfig.js           # ConfiguraciÃ³n de base de datos
â”œâ”€â”€ controllers/
â”‚   â”œâ”€â”€ login.controller.js    # Controlador de autenticaciÃ³n
â”‚   â””â”€â”€ marcaciones.controller.js # Controlador de marcaciones
â”œâ”€â”€ middleware/
â”‚   â””â”€â”€ AuthMiddleWare.js     # Middleware de autenticaciÃ³n
â”œâ”€â”€ model/
â”‚   â”œâ”€â”€ user.model.js          # Modelo de usuario
â”‚   â””â”€â”€ marcaciones.model.js   # Modelo de marcaciones
â”œâ”€â”€ routes/
â”‚   â”œâ”€â”€ index.js              # Enrutador principal
â”‚   â”œâ”€â”€ auth.routes.js         # Rutas de autenticaciÃ³n
â”‚   â””â”€â”€ marcaciones.routes.js  # Rutas de marcaciones
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ auth.service.js        # Servicios de autenticaciÃ³n
â”‚   â”œâ”€â”€ marcaciones.service.js # Servicios de marcaciones
â”‚   â”œâ”€â”€ mail.service.js        # Servicio de correo electrÃ³nico
â”‚   â””â”€â”€ notificacion.service.js # Servicio de notificaciones
â”œâ”€â”€ .env                      # Variables de entorno
â”œâ”€â”€ index.js                  # Punto de entrada de la aplicaciÃ³n
â””â”€â”€ package.json              # Dependencias y scripts
```

## âš™ï¸ InstalaciÃ³n

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env` con las siguientes variables:
```env
SERVER_PORT=3000
SECRET_KEY=tu_clave_secreta_jwt
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=ControlAsistencia
DB_PORT=3306

# ConfiguraciÃ³n de correo
MAIL_HOST=tu_host_de_correo
MAIL_PORT=465
MAIL_USERNAME=tu_email@dominio.com
MAIL_PASSWORD=tu_password_email
MAIL_FROM_NAME=Control de Asistencia
MAIL_FROM_ADDRESS=noreply@dominio.com

FRONTEND_URL=http://localhost:3000
```

4. **Configurar base de datos**
Crear la base de datos MySQL y las tablas necesarias:

```sql
CREATE DATABASE ControlAsistencia;

USE ControlAsistencia;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('user', 'admin') DEFAULT 'user',
    rut VARCHAR(12),
    estado TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de marcaciones
CREATE TABLE marcaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo ENUM('entrada', 'salida') NOT NULL,
    hash VARCHAR(255) NOT NULL,
    ip_origen VARCHAR(45),
    geo_lat DECIMAL(10, 8),
    geo_lon DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

5. **Ejecutar la aplicaciÃ³n**

**Desarrollo:**
```bash
npm run dev
```

**ProducciÃ³n:**
```bash
npm start
```

## ðŸ“š API Endpoints

### AutenticaciÃ³n

| MÃ©todo | Endpoint | DescripciÃ³n | AutenticaciÃ³n |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Iniciar sesiÃ³n | No |
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/logout` | Cerrar sesiÃ³n | No |

### Marcaciones

| MÃ©todo | Endpoint | DescripciÃ³n | AutenticaciÃ³n |
|--------|----------|-------------|---------------|
| POST | `/api/marcaciones/entrada` | Registrar entrada | SÃ­ |
| POST | `/api/marcaciones/salida` | Registrar salida | SÃ­ |
| GET | `/api/marcaciones/hoy` | Obtener marcaciones del dÃ­a | SÃ­ |

## ðŸ“ Ejemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseÃ±a123"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Usuario Ejemplo",
    "email": "usuario@ejemplo.com",
    "rol": "user"
  }
}
```

### Registrar Entrada
```bash
curl -X POST http://localhost:3000/api/marcaciones/entrada \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_jwt_token" \
  -d '{
    "geo_lat": -33.4489,
    "geo_lon": -70.6693,
    "location_quality": "high",
    "ip_cliente": "192.168.1.100"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "entrada registrada correctamente",
  "data": {
    "id": 123,
    "tipo": "entrada",
    "hash": "a1b2c3d4e5f6..."
  }
}
```

### Obtener Marcaciones del DÃ­a
```bash
curl -X GET "http://localhost:3000/api/marcaciones/hoy?fecha=2025-01-18" \
  -H "Authorization: Bearer tu_jwt_token"
```

**Respuesta:**
```json
{
  "success": true,
  "fecha": "2025-01-18",
  "marcaciones": [
    {
      "id": 123,
      "usuario_id": 1,
      "fecha": "2025-01-18",
      "hora": "08:30:00",
      "tipo": "entrada",
      "geo_lat": -33.4489,
      "geo_lon": -70.6693,
      "ip_origen": "192.168.1.100"
    }
  ]
}
```

## ðŸ”§ Servicios Principales

### AuthService ([auth.service.js](services/auth.service.js))
Maneja toda la lÃ³gica de autenticaciÃ³n:
- **generateToken(user)**: Genera tokens JWT
- **verifyToken(token)**: Verifica y decodifica tokens
- **registerUser(email, password, ...)**: Registro de usuarios
- **loginUser(email, password)**: AutenticaciÃ³n de usuarios
- **getUserById(id)**: Obtiene usuario por ID
- **getUserByEmail(email)**: Obtiene usuario por email

### MarcacionesService ([marcaciones.service.js](services/marcaciones.service.js))
Gestiona las marcaciones de asistencia:
- **registrarMarcacion(usuario_id, tipo, geo_lat, geo_lon, ip_origen)**: Registra nueva marcaciÃ³n
- **obtenerMarcacionesPorUsuario(usuario_id, fecha)**: Consulta marcaciones por usuario
- **obtenerMarcacionPorId(id)**: Obtiene marcaciÃ³n especÃ­fica
- **eliminarMarcacion(id)**: Elimina marcaciÃ³n

### MailService ([mail.service.js](services/mail.service.js))
Sistema de notificaciones por correo:
- **enviarCorreo(destinatario, asunto, contenidoHTML)**: EnvÃ­o general de correos
- **enviarNotificacionMarcacion(email, nombre, tipo, fecha, hora)**: NotificaciÃ³n de marcaciÃ³n
- **enviarCorreoBienvenida(email, nombre, password)**: Correo de bienvenida
- **enviarCorreoRecuperacion(email, token, nombre)**: RecuperaciÃ³n de contraseÃ±a
- **verificarConexion()**: Verifica configuraciÃ³n de correo

### NotificacionService ([notificacion.service.js](services/notificacion.service.js))
Orquesta las notificaciones:
- **procesarNotificacionMarcacion(usuario_id, marcacion_id)**: Procesa notificaciones de forma asÃ­ncrona

## ðŸ—„ï¸ Modelos de Datos

### UserModel ([user.model.js](model/user.model.js))
```javascript
class Usuario {
  // MÃ©todos estÃ¡ticos
  static async findById(id)
  static async findByEmail(email)
  static async findAll()
  static async create(data)
  static async update(id, data)
  static async delete(id)
}
```

### MarcacionesModel ([marcaciones.model.js](model/marcaciones.model.js))
```javascript
class Marcaciones {
  async createMarcacion(data)
  async getMarcacionesByUsuario(usuario_id, fecha)
  async getMarcacionById(id)
  async deleteMarcacion(id)
}
```

## ðŸ”’ Middleware de AutenticaciÃ³n

El [`AuthMiddleWare`](middleware/AuthMiddleWare.js) verifica tokens JWT en rutas protegidas:

```javascript
// Uso en rutas
router.post('/entrada', AuthService.verifyToken, MarcacionesController.registrarEntrada);
```

**Funcionamiento:**
1. Extrae token del header `Authorization: Bearer <token>`
2. Verifica token con `AuthService.verifyToken()`
3. AÃ±ade informaciÃ³n del usuario a `req.user`
4. Maneja errores de token expirado o invÃ¡lido

## ðŸš¨ Manejo de Errores

La API implementa manejo centralizado de errores con respuestas consistentes:

**Ã‰xito:**
```json
{
  "success": true,
  "message": "OperaciÃ³n exitosa",
  "data": { /* datos */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "DescripciÃ³n del error",
  "error": "Detalles tÃ©cnicos del error"
}
```

**CÃ³digos de Estado:**
- `200` - Ã‰xito
- `201` - Creado
- `400` - Datos invÃ¡lidos
- `401` - No autorizado
- `404` - No encontrado
- `500` - Error del servidor

## ðŸ“§ Sistema de Notificaciones

### Tipos de Correo

1. **NotificaciÃ³n de MarcaciÃ³n**
   - Se envÃ­a automÃ¡ticamente al registrar entrada/salida
   - Incluye tipo, fecha y hora de marcaciÃ³n
   - Procesamiento asÃ­ncrono (no bloquea respuesta)

2. **Correo de Bienvenida**
   - Al crear nuevo usuario
   - Incluye credenciales temporales
   - Enlace al sistema

3. **RecuperaciÃ³n de ContraseÃ±a**
   - Token de recuperaciÃ³n con expiraciÃ³n
   - Enlace seguro al frontend

### ConfiguraciÃ³n de Correo

```env
MAIL_HOST=mail.agustinmeza.dev
MAIL_PORT=465
MAIL_USERNAME=noreply@agustinmeza.dev
MAIL_PASSWORD=?.ZZo+z-p1[q
MAIL_FROM_NAME=noreply@agustinmeza.dev
MAIL_FROM_ADDRESS=noreply@agustinmeza.dev
```

## ðŸ—ƒï¸ Base de Datos

### ConfiguraciÃ³n ([dbconfig.js](config/dbconfig.js))
- Pool de conexiones MySQL2
- ConfiguraciÃ³n mediante variables de entorno
- VerificaciÃ³n automÃ¡tica de conexiÃ³n al inicio

### Esquema de Base de Datos

**Tabla `usuarios`:**
```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('user', 'admin') DEFAULT 'user',
    rut VARCHAR(12),
    estado TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabla `marcaciones`:**
```sql
CREATE TABLE marcaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo ENUM('entrada', 'salida') NOT NULL,
    hash VARCHAR(255) NOT NULL,
    ip_origen VARCHAR(45),
    geo_lat DECIMAL(10, 8),
    geo_lon DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

## ðŸ” Seguridad

### AutenticaciÃ³n JWT
- Tokens con expiraciÃ³n de 1 hora
- Payload mÃ­nimo (solo ID y email)
- VerificaciÃ³n en cada request protegido

### EncriptaciÃ³n de ContraseÃ±as
```javascript
// Hash con bcrypt (salt rounds: 10)
const hashedPassword = await bcrypt.hash(password, 10);
```

### ValidaciÃ³n de Datos
- VerificaciÃ³n de campos requeridos
- ValidaciÃ³n de tipos de datos
- SanitizaciÃ³n de inputs

### Variables de Entorno
- ConfiguraciÃ³n sensible en archivo `.env`
- No incluir `.env` en control de versiones
- Usar valores por defecto seguros

## ðŸš¦ Estados de Respuesta

### Marcaciones
```javascript
// Ã‰xito
{
  success: true,
  message: "entrada registrada correctamente",
  data: { id: 123, tipo: "entrada", hash: "..." }
}

// Error
{
  success: false,
  message: "Faltan datos requeridos para registrar la entrada."
}
```

### AutenticaciÃ³n
```javascript
// Login exitoso
{
  success: true,
  message: "Login successful",
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: { id: 1, nombre: "Usuario", email: "user@example.com" }
}

// Credenciales invÃ¡lidas
{
  success: false,
  message: "Invalid credentials"
}
```

## ðŸ”„ Flujo de Trabajo

### Registro de MarcaciÃ³n
1. Usuario envÃ­a datos de geolocalizaciÃ³n
2. Middleware verifica token JWT
3. Controller valida datos requeridos
4. Service genera hash Ãºnico y registra en BD
5. Se inicia notificaciÃ³n asÃ­ncrona por email
6. Response inmediata al cliente
7. NotificaciÃ³n se procesa en background

### AutenticaciÃ³n
1. Usuario envÃ­a credenciales
2. Service busca usuario en BD
3. Verifica contraseÃ±a con bcrypt
4. Genera token JWT
5. Retorna token y datos del usuario

## ðŸ“Š Logs y Monitoreo

### Console Logs
```javascript
// Datos de entrada
console.log('Datos recibidos para registrar entrada:', { usuario_id, geo_lat, geo_lon });

// Errores
console.error('Error en registrarEntrada:', error);

// Notificaciones
console.log('Estado de envÃ­o de correo:', estado);
```

### Manejo de Errores AsÃ­ncronos
```javascript
// Notificaciones no bloquean la respuesta
NotificacionService.procesarNotificacionMarcacion(usuario_id, result.data.id)
    .catch(error => console.error('Error en notificaciÃ³n:', error));
```

## ðŸ”§ Scripts NPM

```json
{
  "scripts": {
    "start": "node index.js",        // ProducciÃ³n
    "dev": "nodemon index.js",       // Desarrollo
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## ðŸ“¦ Dependencias

### ProducciÃ³n
```json
{
  "bcrypt": "^6.0.0",          // EncriptaciÃ³n de contraseÃ±as
  "cors": "^2.8.5",            // Cross-Origin Resource Sharing
  "dotenv": "^17.2.1",         // Variables de entorno
  "express": "^5.1.0",         // Framework web
  "jsonwebtoken": "^9.0.2",    // JWT tokens
  "mysql2": "^3.14.3",         // Driver MySQL
  "nodemailer": "^7.0.5"       // EnvÃ­o de correos
}
```

### Desarrollo
```json
{
  "nodemon": "^3.1.10"         // Auto-reload en desarrollo
}
```

## ðŸ¤ ContribuciÃ³n

1. Fork del repositorio
2. Crear rama para nueva caracterÃ­stica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Agregar nueva caracterÃ­stica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

### EstÃ¡ndares de CÃ³digo
- Usar ES6+ modules (import/export)
- Manejo de errores con try/catch
- Respuestas consistentes con `success: true/false`
- Logs descriptivos para debugging
- DocumentaciÃ³n JSDoc en funciones complejas

## ðŸ› Troubleshooting

### Error de ConexiÃ³n a MySQL
```bash
Error connecting to the database: Error: connect ECONNREFUSED 127.0.0.1:3306
```
**SoluciÃ³n:** Verificar que MySQL estÃ© ejecutÃ¡ndose y las credenciales en `.env` sean correctas.

### Error de Token Expirado
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```
**SoluciÃ³n:** El usuario debe volver a iniciar sesiÃ³n para obtener un nuevo token.

### Error de EnvÃ­o de Correo
```bash
Error en configuraciÃ³n de correo: Error: Invalid login
```
**SoluciÃ³n:** Verificar credenciales de correo en `.env` y configuraciÃ³n del servidor SMTP.

## ðŸ“„ Licencia

Este proyecto estÃ¡ bajo la Licencia ISC.

## ðŸ“ž Soporte

Para soporte tÃ©cnico o preguntas sobre la implementaciÃ³n, contactar al equipo de desarrollo.

---

**VersiÃ³n:** 1.0.0  
**Ãšltima actualizaciÃ³n:** Enero 2025  
**Autor:** Equipo de Desarrollo TELEMEDIOS

ðŸ“… Martes 00:00:00 (Santiago)
â”œâ”€â”€ Cron ejecuta programarAlertasDiarias()
â”œâ”€â”€ Encuentra turno: Juan 09:00-17:00
â”œâ”€â”€ Programa alerta entrada: 09:30
â”œâ”€â”€ Programa alerta salida: 17:30
â””â”€â”€ Jobs guardados en Redis

â° Martes 09:30:00 (Santiago)
â”œâ”€â”€ Bull detecta job listo
â”œâ”€â”€ Ejecuta procesarRecordatorioEntrada()
â”œâ”€â”€ Verifica si Juan marcÃ³ entrada
â””â”€â”€ EnvÃ­a correo si no marcÃ³

ðŸšª Martes 17:30:00 (Santiago)
â”œâ”€â”€ Bull detecta job listo
â”œâ”€â”€ Ejecuta procesarRecordatorioSalida()
â”œâ”€â”€ Verifica si Juan marcÃ³ salida
â””â”€â”€ EnvÃ­a correo si no marcÃ³