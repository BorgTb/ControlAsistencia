# Documentación del Sistema MQTT para Dispositivos ZK

## Arquitectura de Topics

El sistema utiliza el siguiente patrón de topics para dispositivos ZKTeco:

### 📥 Entrada (Comandos): `zk/{serial}/in`
El backend se suscribe a este topic para **recibir comandos** que enviará a los dispositivos.

**Formato JSON:**
```json
{
  "commandId": "ABC123_get_users_1703334000000",
  "action": "get_users",
  "payload": {},
  "timestamp": "2025-12-23T10:30:00Z"
}
```

### 📤 Salida (Respuestas): `zk/{serial}/out`
Los dispositivos publican en este topic las **respuestas a comandos**.

**Formato JSON:**
```json
{
  "status": "ok",
  "message": "Usuario Juan Perez creado exitosamente",
  "device_name": "Equipo 1",
  "action": "CREATE_USER",
  "payload": {
    // Datos adicionales si el comando los requería
  }
}
```

**Ejemplos:**
- **Éxito:** `{"status": "ok", "message": "Usuario creado exitosamente", "action": "CREATE_USER"}`
- **Error:** `{"status": "error", "message": "El ID de usuario ya existe en el dispositivo", "action": "CREATE_USER"}`

### 📋 Eventos (Logs): `zk/{serial}/logs`
Los dispositivos publican **marcajes de asistencia** detectados en tiempo real.

**Formato JSON:**
```json
{
  "device_name": "Equipo 1",
  "serial": "CNCJ23126001",
  "count": 1,
  "data": [
    {
      "user_id": "105",
      "timestamp": "2025-12-23 14:30:05",
      "status": 1,
      "punch": 0
    }
  ]
}Al Conectar (Online):**
```json
{
  "status": "online",
  "device_name": "Sucursal Norte",
  "ip_local": "192.168.1.13",
  "timestamp": "2025-12-23T17:00:00Z"
}
```

**Al Desconectar (Offline - Last Will):**
```json
{
  "status": "offline",
  "serial": "CNCJ23126001"
}
```
**Campos:**
- `user_id`: ID del empleado en el reloj
- `timestamp`: Formato `YYYY-MM-DD HH:MM:SS`
- `status`: Tipo de marcaje (0=entrada, 1=salida, etc.)
- `punch`: Entrada/salida/tiempo extra (opcional, depende del dispositivo)

### 🔌 Estado (Disponibilidad): `zk/{serial}/status`
Los dispositivos publican su estado de conexión.

**Mensajes:**
- `"online"` - Al conectarse
- `"offline"` - Mediante Last Will Testament al desconectarse

---

## Configuración

### Variables de Entorno (.env)

```env
# MQTT Broker
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_PROTOCOL=mqtt
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=telemedios_backend

# Dispositivos ZK conocidos (separados por coma)
ZK_DEVICES=ABC123,XYZ789,DEF456
```

---

## API REST para Dispositivos ZK

### 📌 Gestión de Dispositivos

#### Obtener todos los dispositivos
```http
GET /api/zk/devices
```

**Respuesta:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "serial": "ABC123",
      "name": "Dispositivo ZK ABC123",
      "location": "Entrada principal",
      "status": "online",
      "lastSeen": "2025-12-23T10:30:00Z"
    }
  ]
}
```

#### Obtener dispositivos online
```http
GET /api/zk/devices/online
```

#### Obtener estado de un dispositivo
```http
GET /api/zk/devices/{serial}
```

#### Registrar nuevo dispositivo
```http
POST /api/zk/devices
Content-Type: application/json

{
  "serial": "ABC123",
  "name": "Reloj Principal",
  "location": "Recepción"
}
```

#### Desregistrar dispositivo
```http
DELETE /api/zk/devices/{serial}
```

---

### 🎮 Comandos a Dispositivos

#### Enviar comando genérico
```http
POST /api/zk/devices/{serial}/command
Content-Type: application/json

{
  "action": "get_info",
  "payload": {},
  "timeout": 30000
}
```

#### Obtener usuarios del dispositivo
```http
GET /api/zk/devices/{serial}/users
```

#### Sincronizar tiempo
```http
POST /api/zk/devices/{serial}/sync-time
```

#### Obtener registros de asistencia
```http
GET /api/zk/devices/{serial}/attendance?startDate=2025-12-01&endDate=2025-12-23
```

#### Obtener información del dispositivo
```http
GET /api/zk/devices/{serial}/info
```

#### Reiniciar dispositivo
```http
POST /api/zk/devices/{serial}/restart
```

#### Limpiar logs del dispositivo
```http
POST /api/zk/devices/{serial}/clear-logs
```

#### Abrir puerta
```http
POST /api/zk/devices/{serial}/open-door
Content-Type: application/json

{
  "duration": 5
}
```

---

## Uso Programático

### Registrar un dispositivo

```javascript
import zkDeviceService from './services/ZKDeviceService.js';

// Registrar dispositivo
zkDeviceService.registerDevice('ABC123', {
  name: 'Reloj Principal',
  location: 'Recepción'
});
```

### Enviar comando

```javascript
try {
  const users = await zkDeviceService.getUsers('ABC123');
  console.log('Usuarios:', users);
} catch (error) {
  console.error('Error:', error);
}
```

### Manejar eventos de marcajes

Los marcajes se reciben automáticamente en el método `processAttendanceLog` del [ZKDeviceService.js](services/ZKDeviceService.js). Puedes modificar este método para integrar con tu base de datos:

```javascript
async processAttendanceLog(serial, attendance, deviceName) {
  // attendance estructura:
  // {
  //   user_id: "105",
  //   timestamp: "2025-12-23 14:30:05",
  //   status: 1,
  //   punch: 0
  // }
  
  // Guardar en base de datos
  await MarcacionesModel.crear({
    usuario_id: attendance.user_id,
    fecha_hora: attendance.timestamp,
    tipo: attendance.status === 0 ? 'entrada' : 'salida',
    dispositivo_serial: serial,
    dispositivo_nombre: deviceName,
    punch_state: attendance.punch
  });
}
```

---

## Last Will Testament

Cuando un dispositivo ZK se conecta, debe configurar un Last Will para notificar su desconexión:

```javascript
// Desde el agente del dispositivo
const mqttClient = mqtt.connect('mqtt://broker', {
  clientId: 'zk_ABC123',
  will: {
    topic: 'zk/ABC123/status',
    payload: JSON.stringify({
      status: 'offline',
      serial: 'ABC123'
    }),
    qos: 1,
    retain: true
  }
});

// Al conectar, publicar estado online
mqttClient.on('connect', () => {
  mqttClient.publish('zk/ABC123/status', JSON.stringify({
    status: 'online',
    device_name: 'Sucursal Norte',
    ip_local: '192.168.1.13',
    timestamp: new Date().toISOString()
  }), { 
    qos: 1, 
    retai{
  "status": "online",
  "device_name": "Sucursal Norte",
  "ip_local": "192.168.1.13",
  "timestamp": "2025-12-23T17:00:00Z"
}
QoS: 1, Retain: true
```

### 2️⃣ Backend Detecta Dispositivo

```
Backend detecta mensaje en zk/+/status
Si status es "online" y no está registrado → Auto-registro con device_name e ip_local
### 1️⃣ Conexión del Dispositivo

```
Dispositivo ZK → Broker MQTT
Topic: zk/ABC123/status
Payload: "online"
QoS: 1, Retain: true
```
action": "GET_USERS",
  "payload": {}
}
```

### 4️⃣ Dispositivo Responde

```
Dispositivo → Broker MQTT
Topic: zk/ABC123/out
Payload: {
  "status": "ok",
  "message": "Usuarios obtenidos exitosamente",
  "device_name": "Equipo 1",
  "action": "GET_USERS",
  "payload": { "users": [...] }
}
```

### 5️⃣ Marcaje Detectado

```
Dispositivo → Broker MQTT
Topic: zk/ABC123/logs
Payload: {
  "device_name": "Equipo 1",
  "serial": "ABC123",
  "count": 1,
  "data": [
    {
      "user_id": "105",
      "timestamp": "2025-12-23 14:30:05",
      "status": 1,
      "punch": 0
    }
  ]
  "data": { "users": [...] }
}{
  "status": "offline",
  "serial": "ABC123"
}
```

### 5️⃣ Marcaje Detectado

```
Dispositivo → Broker MQTT
Topic: zk/ABC123/logs
PayGET_USERS` | Obtener lista de usuarios | `{}` |
| `CREATE_USER` | Crear nuevo usuario | `{ "user_id": "123", "name": "...", ... }` |
| `DELETE_USER` | Eliminar usuario | `{ "user_id": "123" }` |
| `SYNC_TIME` | Sincronizar reloj | `{ "timestamp": "ISO-8601" }` |
| `GET_ATTENDANCE` | Obtener marcajes | `{ "start_date": "...", "end_date": "..." }` |
| `CLEAR_LOGS` | Limpiar registros | `{}` |
| `RESTART_DEVICE` | Reiniciar dispositivo | `{}` |
| `GET_DEVICE_INFO` | Info del dispositivo | `{}` |
| `OPEN_DOOR` | Abrir puerta | `{ "duration": 5 }` |
| `GET_FIRMWARE_VERSION` | Versión del firmware | `{

### 6️⃣ Desconexión del Dispositivo

```
Dispositivo se desconecta → Broker MQTT publica Last Will
Topic: zk/ABC123/status
Payload: "offline"
```

---

## Acciones Disponibles

| Acción | Descripción | Payload |
|--------|-------------|---------|
| `get_users` | Obtener lista de usuarios | `{}` |
| `sync_time` | Sincronizar reloj | `{ "timestamp": "ISO-8601" }` |
| `get_attendance` | Obtener marcajes | `{ "startDate": "...", "endDate": "..." }` |
| `clear_logs` | Limpiar registros | `{}` |
| `restart` | Reiniciar dispositivo | `{}` |
| `get_info` | Info del dispositivo | `{}` |
| `open_door` | Abrir puerta | `{ "duration": 5 }` |

---

## Monitoreo y Debugging

Para ver los mensajes MQTT en tiempo real, puedes usar:

```bash
# Con mosquitto_sub
mosquitto_sub -h localhost -t "zk/#" -v

# Ver solo un dispositivo
mosquitto_sub -h localhost -t "zk/ABC123/#" -v

# Ver solo logs de marcajes
mosquitto_sub -h localhost -t "zk/+/logs" -v
```

---

## Estructura de Archivos

```
Backend/
├── services/
│   ├── MQTTService.js          # Servicio MQTT base
│   └── ZKDeviceService.js      # Servicio específico para ZK
├── controllers/
│   ├── MQTTController.js       # API MQTT genérica
│   └── ZKDeviceController.js   # API para dispositivos ZK
└── routes/
    ├── MQTTRoutes.js
    └── ZKDeviceRoutes.js
```

---

## Próximos Pasos

1. ✅ Implementar agente MQTT en los dispositivos ZK
2. ✅ Configurar broker MQTT (Mosquitto, EMQX, etc.)
3. ✅ Integrar `processAttendanceLog` con base de datos
4. ✅ Agregar autenticación/autorización MQTT
5. ✅ Implementar TLS/SSL en producción
6. ✅ Agregar persistencia de dispositivos en BD
