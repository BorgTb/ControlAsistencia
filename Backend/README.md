# Backend - Sistema de Control de Asistencia

Este es el backend del Sistema de Control de Asistencia desarrollado en Node.js con Express y MySQL.

## 📋 Descripción

API RESTful para gestionar el control de asistencia de empleados, incluyendo autenticación, registro de marcaciones (entrada/salida) con geolocalización, y sistema de notificaciones por correo electrónico.

## 🚀 Características

- **Autenticación JWT**: Sistema de login/registro con tokens seguros
- **Marcaciones con Geolocalización**: Registro de entradas y salidas con coordenadas GPS
- **Notificaciones por Email**: Envío automático de correos al registrar marcaciones
- **Base de Datos MySQL**: Almacenamiento persistente de usuarios y marcaciones
- **Middleware de Seguridad**: Verificación de tokens y validación de usuarios
- **Arquitectura MVC**: Separación clara de responsabilidades

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver de base de datos
- **JWT** (jsonwebtoken) - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **Nodemailer** - Envío de correos electrónicos
- **dotenv** - Variables de entorno
- **CORS** - Cross-Origin Resource Sharing

## 📁 Estructura del Proyecto

```
Backend/
├── config/
│   └── dbconfig.js           # Configuración de base de datos
├── controllers/
│   ├── LoginController.js    # Controlador de autenticación
│   └── MarcacionesController.js # Controlador de marcaciones
├── middleware/
│   └── AuthMiddleWare.js     # Middleware de autenticación
├── model/
│   ├── UserModel.js          # Modelo de usuario
│   └── MarcacionesModel.js   # Modelo de marcaciones
├── routes/
│   ├── index.js              # Enrutador principal
│   ├── AuthRoutes.js         # Rutas de autenticación
│   └── MarcacionesRoutes.js  # Rutas de marcaciones
├── services/
│   ├── authservice.js        # Servicios de autenticación
│   ├── MarcacionesServices.js # Servicios de marcaciones
│   ├── MailService.js        # Servicio de correo electrónico
│   └── NotificacionService.js # Servicio de notificaciones
├── .env                      # Variables de entorno
├── index.js                  # Punto de entrada de la aplicación
└── package.json              # Dependencias y scripts
```

## ⚙️ Instalación

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

# Configuración de correo
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

5. **Ejecutar la aplicación**

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

## 📚 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/logout` | Cerrar sesión | No |

### Marcaciones

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/marcaciones/entrada` | Registrar entrada | Sí |
| POST | `/api/marcaciones/salida` | Registrar salida | Sí |
| GET | `/api/marcaciones/hoy` | Obtener marcaciones del día | Sí |

## 📝 Ejemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
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

### Obtener Marcaciones del Día
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

## 🔧 Servicios Principales

### AuthService ([authservice.js](services/authservice.js))
Maneja toda la lógica de autenticación:
- **generateToken(user)**: Genera tokens JWT
- **verifyToken(token)**: Verifica y decodifica tokens
- **registerUser(email, password, ...)**: Registro de usuarios
- **loginUser(email, password)**: Autenticación de usuarios
- **getUserById(id)**: Obtiene usuario por ID
- **getUserByEmail(email)**: Obtiene usuario por email

### MarcacionesService ([MarcacionesServices.js](services/MarcacionesServices.js))
Gestiona las marcaciones de asistencia:
- **registrarMarcacion(usuario_id, tipo, geo_lat, geo_lon, ip_origen)**: Registra nueva marcación
- **obtenerMarcacionesPorUsuario(usuario_id, fecha)**: Consulta marcaciones por usuario
- **obtenerMarcacionPorId(id)**: Obtiene marcación específica
- **eliminarMarcacion(id)**: Elimina marcación

### MailService ([MailService.js](services/MailService.js))
Sistema de notificaciones por correo:
- **enviarCorreo(destinatario, asunto, contenidoHTML)**: Envío general de correos
- **enviarNotificacionMarcacion(email, nombre, tipo, fecha, hora)**: Notificación de marcación
- **enviarCorreoBienvenida(email, nombre, password)**: Correo de bienvenida
- **enviarCorreoRecuperacion(email, token, nombre)**: Recuperación de contraseña
- **verificarConexion()**: Verifica configuración de correo

### NotificacionService ([NotificacionService.js](services/NotificacionService.js))
Orquesta las notificaciones:
- **procesarNotificacionMarcacion(usuario_id, marcacion_id)**: Procesa notificaciones de forma asíncrona

## 🗄️ Modelos de Datos

### UserModel ([UserModel.js](model/UserModel.js))
```javascript
class Usuario {
  // Métodos estáticos
  static async findById(id)
  static async findByEmail(email)
  static async findAll()
  static async create(data)
  static async update(id, data)
  static async delete(id)
}
```

### MarcacionesModel ([MarcacionesModel.js](model/MarcacionesModel.js))
```javascript
class Marcaciones {
  async createMarcacion(data)
  async getMarcacionesByUsuario(usuario_id, fecha)
  async getMarcacionById(id)
  async deleteMarcacion(id)
}
```

## 🔒 Middleware de Autenticación

El [`AuthMiddleWare`](middleware/AuthMiddleWare.js) verifica tokens JWT en rutas protegidas:

```javascript
// Uso en rutas
router.post('/entrada', AuthService.verifyToken, MarcacionesController.registrarEntrada);
```

**Funcionamiento:**
1. Extrae token del header `Authorization: Bearer <token>`
2. Verifica token con `AuthService.verifyToken()`
3. Añade información del usuario a `req.user`
4. Maneja errores de token expirado o inválido

## 🚨 Manejo de Errores

La API implementa manejo centralizado de errores con respuestas consistentes:

**Éxito:**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* datos */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos del error"
}
```

**Códigos de Estado:**
- `200` - Éxito
- `201` - Creado
- `400` - Datos inválidos
- `401` - No autorizado
- `404` - No encontrado
- `500` - Error del servidor

## 📧 Sistema de Notificaciones

### Tipos de Correo

1. **Notificación de Marcación**
   - Se envía automáticamente al registrar entrada/salida
   - Incluye tipo, fecha y hora de marcación
   - Procesamiento asíncrono (no bloquea respuesta)

2. **Correo de Bienvenida**
   - Al crear nuevo usuario
   - Incluye credenciales temporales
   - Enlace al sistema

3. **Recuperación de Contraseña**
   - Token de recuperación con expiración
   - Enlace seguro al frontend

### Configuración de Correo

```env
MAIL_HOST=mail.agustinmeza.dev
MAIL_PORT=465
MAIL_USERNAME=noreply@agustinmeza.dev
MAIL_PASSWORD=?.ZZo+z-p1[q
MAIL_FROM_NAME=noreply@agustinmeza.dev
MAIL_FROM_ADDRESS=noreply@agustinmeza.dev
```

## 🗃️ Base de Datos

### Configuración ([dbconfig.js](config/dbconfig.js))
- Pool de conexiones MySQL2
- Configuración mediante variables de entorno
- Verificación automática de conexión al inicio

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

## 🔐 Seguridad

### Autenticación JWT
- Tokens con expiración de 1 hora
- Payload mínimo (solo ID y email)
- Verificación en cada request protegido

### Encriptación de Contraseñas
```javascript
// Hash con bcrypt (salt rounds: 10)
const hashedPassword = await bcrypt.hash(password, 10);
```

### Validación de Datos
- Verificación de campos requeridos
- Validación de tipos de datos
- Sanitización de inputs

### Variables de Entorno
- Configuración sensible en archivo `.env`
- No incluir `.env` en control de versiones
- Usar valores por defecto seguros

## 🚦 Estados de Respuesta

### Marcaciones
```javascript
// Éxito
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

### Autenticación
```javascript
// Login exitoso
{
  success: true,
  message: "Login successful",
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: { id: 1, nombre: "Usuario", email: "user@example.com" }
}

// Credenciales inválidas
{
  success: false,
  message: "Invalid credentials"
}
```

## 🔄 Flujo de Trabajo

### Registro de Marcación
1. Usuario envía datos de geolocalización
2. Middleware verifica token JWT
3. Controller valida datos requeridos
4. Service genera hash único y registra en BD
5. Se inicia notificación asíncrona por email
6. Response inmediata al cliente
7. Notificación se procesa en background

### Autenticación
1. Usuario envía credenciales
2. Service busca usuario en BD
3. Verifica contraseña con bcrypt
4. Genera token JWT
5. Retorna token y datos del usuario

## 📊 Logs y Monitoreo

### Console Logs
```javascript
// Datos de entrada
console.log('Datos recibidos para registrar entrada:', { usuario_id, geo_lat, geo_lon });

// Errores
console.error('Error en registrarEntrada:', error);

// Notificaciones
console.log('Estado de envío de correo:', estado);
```

### Manejo de Errores Asíncronos
```javascript
// Notificaciones no bloquean la respuesta
NotificacionService.procesarNotificacionMarcacion(usuario_id, result.data.id)
    .catch(error => console.error('Error en notificación:', error));
```

## 🔧 Scripts NPM

```json
{
  "scripts": {
    "start": "node index.js",        // Producción
    "dev": "nodemon index.js",       // Desarrollo
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## 📦 Dependencias

### Producción
```json
{
  "bcrypt": "^6.0.0",          // Encriptación de contraseñas
  "cors": "^2.8.5",            // Cross-Origin Resource Sharing
  "dotenv": "^17.2.1",         // Variables de entorno
  "express": "^5.1.0",         // Framework web
  "jsonwebtoken": "^9.0.2",    // JWT tokens
  "mysql2": "^3.14.3",         // Driver MySQL
  "nodemailer": "^7.0.5"       // Envío de correos
}
```

### Desarrollo
```json
{
  "nodemon": "^3.1.10"         // Auto-reload en desarrollo
}
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama para nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

### Estándares de Código
- Usar ES6+ modules (import/export)
- Manejo de errores con try/catch
- Respuestas consistentes con `success: true/false`
- Logs descriptivos para debugging
- Documentación JSDoc en funciones complejas

## 🐛 Troubleshooting

### Error de Conexión a MySQL
```bash
Error connecting to the database: Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solución:** Verificar que MySQL esté ejecutándose y las credenciales en `.env` sean correctas.

### Error de Token Expirado
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```
**Solución:** El usuario debe volver a iniciar sesión para obtener un nuevo token.

### Error de Envío de Correo
```bash
Error en configuración de correo: Error: Invalid login
```
**Solución:** Verificar credenciales de correo en `.env` y configuración del servidor SMTP.

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación, contactar al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2025  
**Autor:** Equipo de Desarrollo TELEMEDIOS