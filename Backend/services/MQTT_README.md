# DocumentaciÃ³n del Servicio MQTT

## ConfiguraciÃ³n

Agregar las siguientes variables al archivo `.env`:

```env
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_PROTOCOL=mqtt
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=telemedios_backend
```

## Uso del Servicio

### 1. Importar el servicio

```javascript
import mqttService from './services/mqtt.service.js';
```

### 2. Conectar al broker

```javascript
mqttService.connect();
```

### 3. Suscribirse a topics

```javascript
mqttService.subscribe('telemedios/marcaciones', (topic, message) => {
    console.log(`Mensaje recibido en ${topic}:`, message);
    // Procesar el mensaje
});
```

### 4. Publicar mensajes

```javascript
mqttService.publish('telemedios/alertas', { 
    tipo: 'falta',
    usuario_id: 123,
    fecha: new Date()
});
```

## Eventos Disponibles

El servicio maneja automÃ¡ticamente los siguientes eventos:

- **connect**: Cuando se conecta exitosamente al broker
- **message**: Cuando se recibe un mensaje en un topic suscrito
- **error**: Cuando ocurre un error
- **close**: Cuando se cierra la conexiÃ³n
- **reconnect**: Cuando intenta reconectar
- **offline**: Cuando el cliente estÃ¡ offline
- **end**: Cuando finaliza la conexiÃ³n

## API REST para MQTT

### Publicar mensaje
```http
POST /api/mqtt/publish
Content-Type: application/json

{
    "topic": "telemedios/marcaciones",
    "message": "Hola MQTT",
    "options": {
        "qos": 0,
        "retain": false
    }
}
```

### Verificar estado de conexiÃ³n
```http
GET /api/mqtt/status
```

### Suscribirse a un topic
```http
POST /api/mqtt/subscribe
Content-Type: application/json

{
    "topic": "telemedios/notificaciones",
    "qos": 0
}
```

### Desuscribirse de un topic
```http
POST /api/mqtt/unsubscribe
Content-Type: application/json

{
    "topic": "telemedios/notificaciones"
}
```

## Ejemplos de Uso

### Enviar notificaciÃ³n de marcaciÃ³n

```javascript
mqttService.publish('telemedios/marcaciones', {
    usuario_id: 123,
    tipo: 'entrada',
    timestamp: new Date().toISOString(),
    ubicacion: { lat: -33.4489, lng: -70.6693 }
});
```

### Recibir alertas de faltas

```javascript
mqttService.subscribe('telemedios/alertas/faltas', (topic, message) => {
    const alerta = JSON.parse(message);
    console.log('Nueva falta detectada:', alerta);
    
    // Enviar email, push notification, etc.
});
```

### Sincronizar datos en tiempo real

```javascript
mqttService.subscribe('telemedios/sync/#', (topic, message) => {
    const data = JSON.parse(message);
    
    // Actualizar base de datos, cache, etc.
    switch(topic) {
        case 'telemedios/sync/usuarios':
            // Actualizar usuarios
            break;
        case 'telemedios/sync/empresas':
            // Actualizar empresas
            break;
    }
});
```

## QoS (Quality of Service)

- **QoS 0**: At most once (mÃ¡ximo una vez) - El mensaje se entrega una vez, sin confirmaciÃ³n
- **QoS 1**: At least once (al menos una vez) - El mensaje se entrega al menos una vez, con confirmaciÃ³n
- **QoS 2**: Exactly once (exactamente una vez) - El mensaje se entrega exactamente una vez

## Wildcards en Topics

- **+**: Coincide con un nivel
  - `telemedios/+/status` coincide con `telemedios/empresa1/status` y `telemedios/empresa2/status`
  
- **#**: Coincide con mÃºltiples niveles
  - `telemedios/#` coincide con todos los topics que empiezan con `telemedios/`

## Mejores PrÃ¡cticas

1. Usar topics descriptivos y jerÃ¡rquicos
2. Implementar QoS segÃºn la criticidad del mensaje
3. Manejar errores en los callbacks
4. No suscribirse a `#` (todos los topics) en producciÃ³n
5. Usar retain solo cuando sea necesario
6. Implementar autenticaciÃ³n y autorizaciÃ³n
7. Usar TLS/SSL en producciÃ³n
