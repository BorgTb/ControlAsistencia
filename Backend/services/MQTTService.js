import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

class MQTTService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscribers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
    }

    /**
     * Conectar al broker MQTT
     * @param {Object} options - Opciones de conexión
     */
    connect(options = {}) {
        const defaultOptions = {
            host: process.env.MQTT_HOST || 'localhost',
            port: parseInt(process.env.MQTT_PORT) || 1883,
            protocol: process.env.MQTT_PROTOCOL || 'mqtt',
            username: process.env.MQTT_USERNAME || '',
            password: process.env.MQTT_PASSWORD || '',
            clientId: process.env.MQTT_CLIENT_ID || `mqtt_${Math.random().toString(16).slice(3)}`,
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 30000,
            keepalive: 60,
            will: options.will || null // Last Will Testament
        };

        const mqttOptions = { ...defaultOptions, ...options };
        const connectUrl = `${mqttOptions.protocol}://${mqttOptions.host}:${mqttOptions.port}`;

        //console.log(`📡 Conectando al broker MQTT en ${connectUrl}...`);

        const clientOptions = {
            clientId: mqttOptions.clientId,
            clean: mqttOptions.clean,
            reconnectPeriod: mqttOptions.reconnectPeriod,
            connectTimeout: mqttOptions.connectTimeout,
            username: mqttOptions.username,
            password: mqttOptions.password,
            keepalive: mqttOptions.keepalive
        };

        // Agregar Last Will Testament si está configurado
        if (mqttOptions.will) {
            clientOptions.will = mqttOptions.will;
        }

        this.client = mqtt.connect(connectUrl, clientOptions);

        this.setupEventHandlers();
        return this.client;
    }

    /**
     * Configurar los manejadores de eventos del cliente MQTT
     */
    setupEventHandlers() {
        // Evento: Conexión exitosa
        this.client.on('connect', () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            //console.log('✅ Conectado al broker MQTT');
            
            // Re-suscribirse a todos los topics después de reconexión
            this.resubscribeAll();
        });

        // Evento: Mensaje recibido
        this.client.on('message', (topic, message, packet) => {
            try {
                const payload = message.toString();
                //console.log(`📩 Mensaje recibido en topic "${topic}":`, payload);

                // Ejecutar todos los callbacks suscritos a este topic
                if (this.subscribers.has(topic)) {
                    const callbacks = this.subscribers.get(topic);
                    callbacks.forEach(callback => {
                        try {
                            callback(topic, payload, packet);
                        } catch (error) {
                            console.error(`❌ Error en callback del topic "${topic}":`, error);
                        }
                    });
                }
            } catch (error) {
                console.error('❌ Error procesando mensaje MQTT:', error);
            }
        });

        // Evento: Error
        this.client.on('error', (error) => {
            console.error('❌ Error en cliente MQTT:', error.message);
        });

        // Evento: Desconexión
        this.client.on('close', () => {
            this.connected = false;
            console.log('⚠️ Desconectado del broker MQTT');
        });

        // Evento: Reconexión
        this.client.on('reconnect', () => {
            this.reconnectAttempts++;
            console.log(`🔄 Intentando reconectar al broker MQTT... (Intento ${this.reconnectAttempts})`);
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error(`❌ Se alcanzó el máximo de intentos de reconexión (${this.maxReconnectAttempts})`);
                this.client.end();
            }
        });

        // Evento: Desconexión offline
        this.client.on('offline', () => {
            this.connected = false;
            console.log('⚠️ Cliente MQTT offline');
        });

        // Evento: Fin de conexión
        this.client.on('end', () => {
            this.connected = false;
            console.log('🛑 Conexión MQTT finalizada');
        });
    }

    /**
     * Suscribirse a un topic
     * @param {string} topic - Topic al cual suscribirse
     * @param {Function} callback - Función callback que se ejecutará al recibir mensajes
     * @param {Object} options - Opciones de suscripción
     */
    subscribe(topic, callback, options = {}) {
        if (!this.client) {
            throw new Error('Cliente MQTT no inicializado. Llama a connect() primero.');
        }

        const defaultOptions = { qos: 0 };
        const subOptions = { ...defaultOptions, ...options };

        this.client.subscribe(topic, subOptions, (error) => {
            if (error) {
                console.error(`❌ Error al suscribirse al topic "${topic}":`, error);
                return;
            }
            //console.log(`✅ Suscrito al topic: "${topic}"`);
        });

        // Agregar callback a la lista de suscriptores
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, []);
        }
        this.subscribers.get(topic).push(callback);
    }

    /**
     * Re-suscribirse a todos los topics después de reconexión
     */
    resubscribeAll() {
        if (this.subscribers.size === 0) return;

        //console.log('🔄 Re-suscribiendo a topics...');
        for (const topic of this.subscribers.keys()) {
            this.client.subscribe(topic, { qos: 0 }, (error) => {
                if (error) {
                    console.error(`❌ Error al re-suscribirse al topic "${topic}":`, error);
                } else {
                    //console.log(`✅ Re-suscrito al topic: "${topic}"`);
                }
            });
        }
    }

    /**
     * Desuscribirse de un topic
     * @param {string} topic - Topic del cual desuscribirse
     */
    unsubscribe(topic) {
        if (!this.client) return;

        this.client.unsubscribe(topic, (error) => {
            if (error) {
                console.error(`❌ Error al desuscribirse del topic "${topic}":`, error);
                return;
            }
            console.log(`✅ Desuscrito del topic: "${topic}"`);
        });

        // Eliminar callbacks del topic
        this.subscribers.delete(topic);
    }

    /**
     * Publicar un mensaje en un topic
     * @param {string} topic - Topic donde publicar
     * @param {string|Object} message - Mensaje a publicar
     * @param {Object} options - Opciones de publicación
     */
    publish(topic, message, options = {}) {
        if (!this.client || !this.connected) {
            console.error('❌ No hay conexión MQTT activa');
            return;
        }

        const defaultOptions = { qos: 0, retain: false };
        const pubOptions = { ...defaultOptions, ...options };

        // Si el mensaje es un objeto, convertirlo a JSON
        const payload = typeof message === 'object' ? JSON.stringify(message) : message;

        this.client.publish(topic, payload, pubOptions, (error) => {
            if (error) {
                console.error(`❌ Error al publicar en topic "${topic}":`, error);
                return;
            }
            //console.log(`✅ Mensaje publicado en topic "${topic}"`);
        });
    }

    /**
     * Verificar si el cliente está conectado
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Desconectar del broker MQTT
     */
    disconnect() {
        if (this.client) {
            this.client.end(false, () => {
                console.log('✅ Desconectado del broker MQTT de forma limpia');
            });
        }
    }

    /**
     * Obtener el cliente MQTT (para uso avanzado)
     */
    getClient() {
        return this.client;
    }
}

// Exportar instancia singleton
const mqttService = new MQTTService();
export default mqttService;
