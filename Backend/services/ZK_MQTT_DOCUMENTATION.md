# DocumentaciÃ³n del Sistema MQTT para Dispositivos ZK

## Arquitectura de Topics

El sistema utiliza el siguiente patrÃ³n de topics para dispositivos ZKTeco:

### ðŸ“¥ Entrada (Comandos): `zk/{serial}/in`
El backend se suscribe a este topic para **recibir comandos** que enviarÃ¡ a los dispositivos.

**Formato JSON:**
```json
{
  "commandId": "ABC123_get_users_1703334000000",
  "action": "get_users",
  "payload": {},
  "timestamp": "2025-12-23T10:30:00Z"
}
```

### ðŸ“¤ Salida (Respuestas): `zk/{serial}/out`
Los dispositivos publican en este topic las **respuestas a comandos**.

**Formato JSON:**
```json
{
  "status": "ok",
  "message": "Usuario Juan Perez creado exitosamente",
  "device_name": "Equipo 1",
  "action": "CREATE_USER",
  "payload": {
    // Datos adicionales si el comando los requerÃ­a
  }
}
```

**Ejemplos:**
- **Ã‰xito:** `{"status": "ok", "message": "Usuario creado exitosamente", "action": "CREATE_USER"}`
- **Error:** `{"status": "error", "message": "El ID de usuario ya existe en el dispositivo", "action": "CREATE_USER"}`

### ðŸ“‹ Eventos (Logs): `zk/{serial}/logs`
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

### ðŸ”Œ Estado (Disponibilidad): `zk/{serial}/status`
Los dispositivos publican su estado de conexiÃ³n.

**Mensajes:**
- `"online"` - Al conectarse
- `"offline"` - Mediante Last Will Testament al desconectarse

---

## ConfiguraciÃ³n

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

### ðŸ“Œ GestiÃ³n de Dispositivos

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
  "location": "RecepciÃ³n"
}
```

#### Desregistrar dispositivo
```http
DELETE /api/zk/devices/{serial}
```

---

### ðŸŽ® Comandos a Dispositivos

#### Enviar comando genÃ©rico
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

#### Obtener informaciÃ³n del dispositivo
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

## Uso ProgramÃ¡tico

### Registrar un dispositivo

```javascript
import zkDeviceService from './services/zk-device.service.js';

// Registrar dispositivo
zkDeviceService.registerDevice('ABC123', {
  name: 'Reloj Principal',
  location: 'RecepciÃ³n'
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

Los marcajes se reciben automÃ¡ticamente en el mÃ©todo `processAttendanceLog` del [zk-device.service.js](services/zk-device.service.js). Puedes modificar este mÃ©todo para integrar con tu base de datos:

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

Cuando un dispositivo ZK se conecta, debe configurar un Last Will para notificar su desconexiÃ³n:

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

### 2ï¸âƒ£ Backend Detecta Dispositivo

```
Backend detecta mensaje en zk/+/status
Si status es "online" y no estÃ¡ registrado â†’ Auto-registro con device_name e ip_local
### 1ï¸âƒ£ ConexiÃ³n del Dispositivo

```
Dispositivo ZK â†’ Broker MQTT
Topic: zk/ABC123/status
Payload: "online"
QoS: 1, Retain: true
```
action": "GET_USERS",
  "payload": {}
}
```

### 4ï¸âƒ£ Dispositivo Responde

```
Dispositivo â†’ Broker MQTT
Topic: zk/ABC123/out
Payload: {
  "status": "ok",
  "message": "Usuarios obtenidos exitosamente",
  "device_name": "Equipo 1",
  "action": "GET_USERS",
  "payload": { "users": [...] }
}
```

### 5ï¸âƒ£ Marcaje Detectado

```
Dispositivo â†’ Broker MQTT
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

### 5ï¸âƒ£ Marcaje Detectado

```
Dispositivo â†’ Broker MQTT
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
| `GET_FIRMWARE_VERSION` | VersiÃ³n del firmware | `{

### 6ï¸âƒ£ DesconexiÃ³n del Dispositivo

```
Dispositivo se desconecta â†’ Broker MQTT publica Last Will
Topic: zk/ABC123/status
Payload: "offline"
```

---

## Acciones Disponibles

| AcciÃ³n | DescripciÃ³n | Payload |
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
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ mqtt.service.js          # Servicio MQTT base
â”‚   â””â”€â”€ zk-device.service.js      # Servicio especÃ­fico para ZK
â”œâ”€â”€ controllers/
â”‚   â”œâ”€â”€ mqtt.controller.js       # API MQTT genÃ©rica
â”‚   â””â”€â”€ zk-device.controller.js   # API para dispositivos ZK
â””â”€â”€ routes/
    â”œâ”€â”€ mqtt.routes.js
    â””â”€â”€ zk-device.routes.js
```

---

## PrÃ³ximos Pasos

1. âœ… Implementar agente MQTT en los dispositivos ZK
2. âœ… Configurar broker MQTT (Mosquitto, EMQX, etc.)
3. âœ… Integrar `processAttendanceLog` con base de datos
4. âœ… Agregar autenticaciÃ³n/autorizaciÃ³n MQTT
5. âœ… Implementar TLS/SSL en producciÃ³n
6. âœ… Agregar persistencia de dispositivos en BD
