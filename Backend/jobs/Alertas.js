import Bull from 'bull';
import Redis from 'ioredis';
import TurnosModel from '../model/TurnosModel.js';
import UserModel from '../model/UserModel.js';
import MailService from '../services/MailService.js';
import MarcacionesService from '../services/MarcacionesServices.js';
import cron from 'node-cron';
import { DateTime } from 'luxon';

// Configuración de Redis
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

// Crear cola de Bull para alertas de asistencia
const alertasQueue = new Bull('alertas asistencia', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    }
});

class AlertasService {
    constructor() {
        this.timezone = 'America/Santiago';
        this.setupQueue();
        this.setupCronJobs();
    }

    // Helper para obtener fecha/hora actual en Santiago
    obtenerFechaSantiago() {
        return DateTime.now().setZone(this.timezone);
    }

    // Helper para crear fecha específica en Santiago
    crearFechaSantiago(horas, minutos, segundos = 0) {
        return DateTime.now()
            .setZone(this.timezone)
            .set({ hour: horas, minute: minutos, second: segundos, millisecond: 0 });
    }

    // Helper para formatear fecha para base de datos
    formatearFechaParaDB(fecha) {
        return fecha.toFormat('yyyy-MM-dd');
    }

    // Configurar procesamiento de la cola
    setupQueue() {
        // Procesar alertas de asistencia (entrada)
        alertasQueue.process('recordatorio-entrada', async (job) => {
            return await this.procesarRecordatorioEntrada(job.data);
        });

        // Procesar alertas de salida
        alertasQueue.process('recordatorio-salida', async (job) => {
            return await this.procesarRecordatorioSalida(job.data);
        });

        // Eventos de la cola
        alertasQueue.on('completed', (job) => {
            const tipo = job.data.tipo || 'entrada';
            console.log(`Job completado: ${job.id} - Recordatorio de ${tipo} enviado a ${job.data.email}`);
        });

        alertasQueue.on('failed', (job, err) => {
            console.error(`Job fallido: ${job.id} - Error:`, err);
        });

        alertasQueue.on('stalled', (job) => {
            console.warn(`Job estancado: ${job.id}`);
        });
    }

    // Configurar tareas cron
    setupCronJobs() {
        // Ejecutar a las 00:00 todos los días para programar alertas del día
        cron.schedule('0 0 * * *', async () => {
            console.log('🕛 Ejecutando programación de alertas diarias...');
            await this.programarAlertasDiarias();
        });

        // Limpiar trabajos completados cada día a las 23:59
        cron.schedule('59 23 * * *', async () => {
            console.log('🧹 Limpiando trabajos completados...');
            await this.limpiarTrabajosCompletados();
        });

        // Programar a las 13:10
        cron.schedule('10 13 * * *', async () => {
            console.log('🕐 Ejecutando programación de alertas a las 13:10...');
            await this.programarAlertasDiarias();
        });
    }

    // Programar alertas para todos los trabajadores del día
    async programarAlertasDiarias() {
        try {
            const fechaSantiago = this.obtenerFechaSantiago();
            console.log(`📅 Iniciando programación de alertas para hoy: ${fechaSantiago.toFormat('yyyy-MM-dd HH:mm:ss')} (${this.timezone})`);
            
            // Obtener todos los turnos
            const turnos = await TurnosModel.getAllTurnos();
            const fechaHoy = this.formatearFechaParaDB(fechaSantiago);
            
            console.log(`📋 Se encontraron ${turnos.length} turnos para procesar`);

            for (const turno of turnos) {
                await this.programarAlertasParaTurno(turno, fechaHoy);
            }

            console.log('✅ Programación de alertas completada');
            
            // Guardar estadísticas en Redis
            await this.guardarEstadisticasProgramacion(turnos.length);
            
        } catch (error) {
            console.error('❌ Error programando alertas diarias:', error);
        }
    }

    // Programar alertas para un turno específico (entrada y salida)
    async programarAlertasParaTurno(turno, fecha) {
        try {
            // Obtener datos del usuario
            const usuario = await UserModel.findById(turno.usuario_id);
            if (!usuario) {
                console.warn(`⚠️ Usuario no encontrado para turno ID: ${turno.id}`);
                return;
            }

            // Programar alerta de entrada (30 minutos después de la hora de entrada)
            await this.programarAlertaEntrada(turno, usuario, fecha);
            
            // Programar alerta de salida (30 minutos después de la hora de salida)
            await this.programarAlertaSalida(turno, usuario, fecha);
            
        } catch (error) {
            console.error(`❌ Error programando alertas para turno ${turno.id}:`, error);
        }
    }

    // Programar alerta de entrada específica
    async programarAlertaEntrada(turno, usuario, fecha) {
        try {
            // Parsear hora de entrada del turno (formato HH:mm:ss)
            const [horas, minutos] = turno.inicio.split(':').map(Number);
            
            // Crear fecha/hora para 30 minutos después de la hora de entrada en Santiago
            const fechaAlerta = this.crearFechaSantiago(horas, minutos + 30);
            const ahora = this.obtenerFechaSantiago();
            
            let delay;
            let ejecutarInmediatamente = false;
            
            // Si la hora ya pasó hoy, ejecutar inmediatamente
            if (fechaAlerta <= ahora) {
                console.log(`⚡ Hora de alerta de entrada ya pasó para ${usuario.nombre} (${fechaAlerta.toFormat('HH:mm')}), ejecutando inmediatamente`);
                delay = 1000; // 1 segundo de delay mínimo
                ejecutarInmediatamente = true;
            } else {
                // Calcular delay normal
                delay = fechaAlerta.toMillis() - ahora.toMillis();
            }
            
            console.log(`📊 Debug - Usuario: ${usuario.nombre}, Fecha: ${fecha}, Alerta: ${fechaAlerta.toFormat('yyyy-MM-dd HH:mm:ss')} (${this.timezone})`);
            
            // Programar el job en Bull
            const job = await alertasQueue.add(
                'recordatorio-entrada',
                {
                    usuario_id: turno.usuario_id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    turno_id: turno.id,
                    hora_entrada: turno.inicio,
                    fecha_programada: fecha,
                    fecha_alerta: fechaAlerta.toISO(),
                    tipo: 'entrada'
                },
                {
                    delay: delay,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    removeOnComplete: 10,
                    removeOnFail: 5,
                }
            );
            console.log(fechaAlerta);
            console.log(`⏰ Alerta de ENTRADA programada para ${usuario.nombre} (${usuario.email}) a las ${fechaAlerta.toFormat('HH:mm:ss')} - Job ID: ${job.id}`);
            
            // Guardar referencia del job en Redis
            await this.guardarReferenciaJob(usuario.id, fecha, job.id, fechaAlerta.toISO(), 'entrada');
            
        } catch (error) {
            console.error(`❌ Error programando alerta de entrada para turno ${turno.id}:`, error);
        }
    }

    // Programar alerta de salida específica
    async programarAlertaSalida(turno, usuario, fecha) {
        try {
            // Parsear hora de salida del turno (formato HH:mm:ss)
            const [horas, minutos] = turno.fin.split(':').map(Number);
            
            // Crear fecha/hora para 30 minutos después de la hora de salida en Santiago
            const fechaAlerta = this.crearFechaSantiago(horas, minutos + 30);
            const ahora = this.obtenerFechaSantiago();
            
            let delay;
            
            // Si la hora ya pasó hoy, ejecutar inmediatamente (con 1 minuto de delay)
            if (fechaAlerta <= ahora) {
                console.log(`⚡ Hora de alerta de SALIDA ya pasó (${fechaAlerta.toFormat('HH:mm')}), ejecutando inmediatamente para ${usuario.nombre}`);
                delay = 60000; // 1 minuto en milisegundos
            } else {
                // Calcular delay normal
                delay = fechaAlerta.toMillis() - ahora.toMillis();
            }
            
            console.log(`📊 Debug - Usuario: ${usuario.nombre}, Fecha: ${fecha}, Alerta: ${fechaAlerta.toFormat('yyyy-MM-dd HH:mm:ss')} (${this.timezone})`);
            console.log(fechaAlerta);
            // Programar el job en Bull
            const job = await alertasQueue.add(
                'recordatorio-salida',
                {
                    usuario_id: turno.usuario_id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    turno_id: turno.id,
                    hora_salida: turno.fin,
                    fecha_programada: fecha,
                    fecha_alerta: fechaAlerta.toISO(),
                    tipo: 'salida'
                },
                {
                    delay: delay,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    removeOnComplete: 10,
                    removeOnFail: 5,
                }
            );

            console.log(`🚪 Alerta de SALIDA programada para ${usuario.nombre} (${usuario.email}) a las ${fechaAlerta.toFormat('HH:mm:ss')} - Job ID: ${job.id}`);
            
            // Guardar referencia del job en Redis
            await this.guardarReferenciaJob(usuario.id, fecha, job.id, fechaAlerta.toISO(), 'salida');
            
        } catch (error) {
            console.error(`❌ Error programando alerta de salida para turno ${turno.id}:`, error);
        }
    }

    // Procesar recordatorio de entrada
    async procesarRecordatorioEntrada(data) {
        try {
            console.log(`🔔 Procesando recordatorio de ENTRADA para ${data.nombre} (${data.email})`);
            
            // Verificar si ya marcó entrada
            const yaMarco = await this.verificarEntradaMarcada(data.usuario_id, data.fecha_programada);
            
            if (yaMarco) {
                console.log(`✅ ${data.nombre} ya marcó entrada, omitiendo recordatorio`);
                return {
                    success: true,
                    message: 'Usuario ya marcó entrada',
                    omitido: true
                };
            }

            // Enviar correo de recordatorio de entrada
            const resultado = await this.enviarCorreoRecordatorioEntrada(data);
            
            if (resultado.success) {
                // Registrar envío en Redis
                await this.registrarEnvioRecordatorio(data.usuario_id, data.fecha_programada, 'entrada');
                console.log(`📧 Recordatorio de ENTRADA enviado exitosamente a ${data.email}`);
            } else {
                console.error(`❌ Error enviando recordatorio de entrada a ${data.email}:`, resultado.error);
            }

            return resultado;
            
        } catch (error) {
            console.error('❌ Error procesando recordatorio de entrada:', error);
            throw error;
        }
    }

    // Procesar recordatorio de salida
    async procesarRecordatorioSalida(data) {
        try {
            console.log(`� Procesando recordatorio de SALIDA para ${data.nombre} (${data.email})`);
            
            // Verificar si ya marcó salida
            const yaMarco = await this.verificarSalidaMarcada(data.usuario_id, data.fecha_programada);
            
            if (yaMarco) {
                console.log(`✅ ${data.nombre} ya marcó salida, omitiendo recordatorio`);
                return {
                    success: true,
                    message: 'Usuario ya marcó salida',
                    omitido: true
                };
            }

            // Verificar si marcó entrada (requisito para marcar salida)
            const marcoEntrada = await this.verificarEntradaMarcada(data.usuario_id, data.fecha_programada);
            
            if (!marcoEntrada) {
                console.log(`⚠️ ${data.nombre} no marcó entrada, omitiendo recordatorio de salida`);
                return {
                    success: true,
                    message: 'Usuario no marcó entrada, no se puede marcar salida',
                    omitido: true
                };
            }

            // Enviar correo de recordatorio de salida
            const resultado = await this.enviarCorreoRecordatorioSalida(data);
            
            if (resultado.success) {
                // Registrar envío en Redis
                await this.registrarEnvioRecordatorio(data.usuario_id, data.fecha_programada, 'salida');
                console.log(`📧 Recordatorio de SALIDA enviado exitosamente a ${data.email}`);
            } else {
                console.error(`❌ Error enviando recordatorio de salida a ${data.email}:`, resultado.error);
            }

            return resultado;
            
        } catch (error) {
            console.error('❌ Error procesando recordatorio de salida:', error);
            throw error;
        }
    }

    // Verificar si el usuario ya marcó entrada
    async verificarEntradaMarcada(usuario_id, fecha) {
        try {
            const entrada = await MarcacionesService.obtenerEntradaPorUsuario(usuario_id, fecha);
            console.log(entrada);
            return entrada.success && entrada.data && entrada.data.id;
        } catch (error) {
            console.error('Error verificando entrada:', error);
            return false;
        }
    }

    // Verificar si el usuario ya marcó salida
    async verificarSalidaMarcada(usuario_id, fecha) {
        try {
            const salida = await MarcacionesService.obtenerSalidaPorUsuario(usuario_id, fecha);
            return salida.success && salida.data && salida.data.length > 0;
        } catch (error) {
            console.error('Error verificando salida:', error);
            return false;
        }
    }

    // Enviar correo de recordatorio
    async enviarCorreoRecordatorio(data) {
        try {
            const asunto = '⏰ Recordatorio: Marca tu asistencia';
            const contenidoHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Recordatorio de Asistencia</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .alert-info { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF5722; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #FF5722; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; background-color: #f0f0f0; }
                        .icon { font-size: 24px; margin-right: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1><span class="icon">⏰</span>Recordatorio de Asistencia</h1>
                        </div>
                        <div class="content">
                            <h2>Hola ${data.nombre},</h2>
                            <p>Te recordamos que aún no has marcado tu entrada de hoy.</p>
                            <div class="alert-info">
                                <h3>📝 Detalles de tu turno:</h3>
                                <p><strong>Hora de entrada:</strong> ${data.hora_entrada}</p>
                                <p><strong>Fecha:</strong> ${new Date(data.fecha_programada).toLocaleDateString('es-CL')}</p>
                            </div>
                            <p>Por favor, marca tu asistencia lo antes posible para registrar tu entrada.</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Marcar Asistencia Ahora</a>
                            <p><small>💡 <strong>Consejo:</strong> Puedes marcar tu asistencia desde cualquier dispositivo con acceso a internet.</small></p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Sistema de Control de Asistencia - TELEMEDIOS</p>
                            <p>Este es un recordatorio automático. Si ya marcaste tu asistencia, puedes ignorar este mensaje.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return await MailService.enviarCorreo(data.email, asunto, contenidoHTML);
            
        } catch (error) {
            console.error('Error enviando correo de recordatorio:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Enviar correo de recordatorio de entrada
    async enviarCorreoRecordatorioEntrada(data) {
        try {
            const asunto = '⏰ Recordatorio: Marca tu entrada';
            const contenidoHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Recordatorio de Entrada</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .alert-info { background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; background-color: #f0f0f0; }
                        .icon { font-size: 24px; margin-right: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1><span class="icon">🕐</span>Recordatorio de Entrada</h1>
                        </div>
                        <div class="content">
                            <h2>Hola ${data.nombre},</h2>
                            <p>Te recordamos que aún no has marcado tu <strong>entrada</strong> de hoy.</p>
                            <div class="alert-info">
                                <h3>📝 Detalles de tu turno:</h3>
                                <p><strong>Hora de entrada:</strong> ${data.hora_entrada}</p>
                                <p><strong>Fecha:</strong> ${DateTime.fromISO(data.fecha_programada).setZone('America/Santiago').toFormat('dd/MM/yyyy')}</p>
                            </div>
                            <p>Por favor, marca tu entrada lo antes posible para registrar el inicio de tu jornada laboral.</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Marcar Entrada Ahora</a>
                            <p><small>💡 <strong>Recuerda:</strong> Es importante marcar tu entrada al inicio de tu turno para llevar un control preciso de tu asistencia.</small></p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Sistema de Control de Asistencia - TELEMEDIOS</p>
                            <p>Este es un recordatorio automático. Si ya marcaste tu entrada, puedes ignorar este mensaje.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return await MailService.enviarCorreo(data.email, asunto, contenidoHTML);
            
        } catch (error) {
            console.error('Error enviando correo de recordatorio de entrada:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Enviar correo de recordatorio de salida
    async enviarCorreoRecordatorioSalida(data) {
        try {
            const asunto = '🚪 Recordatorio: Marca tu salida';
            const contenidoHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Recordatorio de Salida</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .alert-info { background-color: #fff8e1; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; background-color: #f0f0f0; }
                        .icon { font-size: 24px; margin-right: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1><span class="icon">🚪</span>Recordatorio de Salida</h1>
                        </div>
                        <div class="content">
                            <h2>Hola ${data.nombre},</h2>
                            <p>Tu jornada laboral ha terminado. Te recordamos que aún no has marcado tu <strong>salida</strong> de hoy.</p>
                            <div class="alert-info">
                                <h3>📝 Detalles de tu turno:</h3>
                                <p><strong>Hora de salida:</strong> ${data.hora_salida}</p>
                                <p><strong>Fecha:</strong> ${DateTime.fromISO(data.fecha_programada).setZone('America/Santiago').toFormat('dd/MM/yyyy')}</p>
                            </div>
                            <p>Por favor, marca tu salida para completar el registro de tu jornada laboral.</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Marcar Salida Ahora</a>
                            <p><small>⚠️ <strong>Importante:</strong> Marcar tu salida es necesario para calcular correctamente las horas trabajadas.</small></p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Sistema de Control de Asistencia - TELEMEDIOS</p>
                            <p>Este es un recordatorio automático. Si ya marcaste tu salida, puedes ignorar este mensaje.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return await MailService.enviarCorreo(data.email, asunto, contenidoHTML);
            
        } catch (error) {
            console.error('Error enviando correo de recordatorio de salida:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Guardar referencia del job en Redis
    async guardarReferenciaJob(usuario_id, fecha, job_id, fecha_alerta, tipo = 'entrada') {
        try {
            const key = `alerta:${usuario_id}:${fecha}:${tipo}`;
            const data = {
                job_id,
                fecha_alerta,
                tipo,
                programado_en: this.obtenerFechaSantiago().toISO()
            };
            
            await redis.setex(key, 86400, JSON.stringify(data)); // Expira en 24 horas
        } catch (error) {
            console.error('Error guardando referencia de job:', error);
        }
    }

    // Registrar envío de recordatorio
    async registrarEnvioRecordatorio(usuario_id, fecha, tipo = 'entrada') {
        try {
            const key = `recordatorio:enviado:${usuario_id}:${fecha}:${tipo}`;
            await redis.setex(key, 86400, this.obtenerFechaSantiago().toISO()); // Expira en 24 horas
        } catch (error) {
            console.error('Error registrando envío:', error);
        }
    }

    // Guardar estadísticas de programación
    async guardarEstadisticasProgramacion(total_turnos) {
        try {
            const fechaSantiago = this.obtenerFechaSantiago();
            const fecha = this.formatearFechaParaDB(fechaSantiago);
            const key = `stats:programacion:${fecha}`;
            const stats = {
                total_turnos,
                fecha_programacion: fechaSantiago.toISO(),
                jobs_activos: await alertasQueue.getWaiting().then(jobs => jobs.length)
            };
            
            await redis.setex(key, 86400 * 7, JSON.stringify(stats)); // Expira en 7 días
        } catch (error) {
            console.error('Error guardando estadísticas:', error);
        }
    }

    // Limpiar trabajos completados
    async limpiarTrabajosCompletados() {
        try {
            await alertasQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Limpiar completados de más de 24h
            await alertasQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Limpiar fallidos de más de 24h
            console.log('🧹 Trabajos antiguos limpiados');
        } catch (error) {
            console.error('Error limpiando trabajos:', error);
        }
    }

    // Obtener estadísticas de alertas
    async obtenerEstadisticas() {
        try {
            const waiting = await alertasQueue.getWaiting();
            const active = await alertasQueue.getActive();
            const completed = await alertasQueue.getCompleted();
            const failed = await alertasQueue.getFailed();

            return {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                total: waiting.length + active.length,
                queue_name: alertasQueue.name,
                debug: {
                    waiting_jobs: waiting.map(j => ({ id: j.id, name: j.name, data: j.data })),
                    active_jobs: active.map(j => ({ id: j.id, name: j.name, data: j.data }))
                }
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
                total: 0,
                error: error.message
            };
        }
    }

    // Obtener tareas pendientes con detalles
    async obtenerTareasPendientes() {
        try {
            const waiting = await alertasQueue.getWaiting();
            const active = await alertasQueue.getActive();
            
            const formatearTarea = (job) => {
                const data = job.data;
                const delay = job.opts.delay || 0;
                const fechaCreacion = DateTime.fromMillis(job.timestamp).setZone(this.timezone);
                const fechaEjecucion = DateTime.fromMillis(job.timestamp + delay).setZone(this.timezone);
                
                return {
                    id: job.id,
                    tipo: data.tipo || 'entrada',
                    usuario: {
                        id: data.usuario_id,
                        nombre: data.nombre,
                        email: data.email
                    },
                    turno: {
                        id: data.turno_id,
                        hora_entrada: data.hora_entrada,
                        hora_salida: data.hora_salida
                    },
                    fecha_programada: data.fecha_programada,
                    fecha_creacion: fechaCreacion.toISO(),
                    fecha_ejecucion: fechaEjecucion.toISO(),
                    tiempo_restante: this.calcularTiempoRestante(fechaEjecucion),
                    estado: job.finishedOn ? 'completado' : (job.processedOn ? 'activo' : 'esperando'),
                    intentos: job.attemptsMade || 0,
                    max_intentos: job.opts.attempts || 1,
                    delay_ms: delay,
                    queue_name: job.queue.name
                };
            };

            const tareasEsperando = waiting.map(formatearTarea);
            const tareasActivas = active.map(formatearTarea);

            // Ordenar por fecha de ejecución
            const todasLasTareas = [...tareasEsperando, ...tareasActivas].sort(
                (a, b) => DateTime.fromISO(a.fecha_ejecucion).toMillis() - DateTime.fromISO(b.fecha_ejecucion).toMillis()
            );

            return {
                resumen: {
                    total_pendientes: waiting.length + active.length,
                    esperando: waiting.length,
                    ejecutandose: active.length,
                    ultima_actualizacion: this.obtenerFechaSantiago().toISO()
                },
                tareas_esperando: tareasEsperando,
                tareas_ejecutandose: tareasActivas,
                todas_las_tareas: todasLasTareas,
                proxima_ejecucion: todasLasTareas.length > 0 ? todasLasTareas[0] : null,
                debug: {
                    waiting_jobs_raw: waiting.length,
                    active_jobs_raw: active.length,
                    queue_name: alertasQueue.name
                }
            };
        } catch (error) {
            console.error('Error obteniendo tareas pendientes:', error);
            return {
                error: error.message,
                resumen: { 
                    total_pendientes: 0, 
                    esperando: 0, 
                    ejecutandose: 0,
                    ultima_actualizacion: this.obtenerFechaSantiago().toISO()
                },
                tareas_esperando: [],
                tareas_ejecutandose: [],
                todas_las_tareas: [],
                proxima_ejecucion: null,
                debug: {
                    error_details: error.message
                }
            };
        }
    }

    // Calcular tiempo restante hasta ejecución
    calcularTiempoRestante(fechaEjecucion) {
        const ahora = this.obtenerFechaSantiago();
        const diferencia = fechaEjecucion.toMillis() - ahora.toMillis();
        
        if (diferencia <= 0) {
            return 'Ya debería haberse ejecutado';
        }
        
        const minutos = Math.floor(diferencia / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
        
        if (minutos > 0) {
            return `${minutos} minuto(s) ${segundos} segundo(s)`;
        } else {
            return `${segundos} segundo(s)`;
        }
    }

    // Cancelar alerta específica
    async cancelarAlerta(usuario_id, fecha, tipo = null) {
        try {
            // Si no se especifica tipo, cancelar ambas (entrada y salida)
            const tipos = tipo ? [tipo] : ['entrada', 'salida'];
            
            for (const tipoAlerta of tipos) {
                const key = `alerta:${usuario_id}:${fecha}:${tipoAlerta}`;
                const data = await redis.get(key);
                
                if (data) {
                    const jobInfo = JSON.parse(data);
                    const job = await alertasQueue.getJob(jobInfo.job_id);
                    
                    if (job) {
                        await job.remove();
                        console.log(`🗑️ Alerta de ${tipoAlerta} cancelada para usuario ${usuario_id} fecha ${fecha}`);
                    }
                    
                    await redis.del(key);
                }
            }
        } catch (error) {
            console.error('Error cancelando alerta:', error);
        }
    }

    // Método para programar alerta manual (útil para testing)
    async programarAlertaManual(usuario_id, delay_minutos = 1, tipo = 'entrada') {
        try {
            const usuario = await UserModel.findById(usuario_id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            const fechaSantiago = this.obtenerFechaSantiago();
            const fechaEjecucion = fechaSantiago.plus({ minutes: delay_minutos });

            const tipoQueue = tipo === 'salida' ? 'recordatorio-salida' : 'recordatorio-entrada';
            const data = {
                usuario_id,
                email: usuario.email,
                nombre: usuario.nombre,
                turno_id: 'manual',
                fecha_programada: this.formatearFechaParaDB(fechaSantiago),
                fecha_alerta: fechaEjecucion.toISO(),
                tipo
            };

            // Agregar campo específico según el tipo
            if (tipo === 'salida') {
                data.hora_salida = 'Manual';
            } else {
                data.hora_entrada = 'Manual';
            }

            const job = await alertasQueue.add(
                tipoQueue,
                data,
                {
                    delay: delay_minutos * 60 * 1000,
                    attempts: 1,
                }
            );

            console.log(`⚡ Alerta manual de ${tipo.toUpperCase()} programada para ${usuario.nombre} en ${delay_minutos} minuto(s) - Job ID: ${job.id} (${fechaEjecucion.toFormat('HH:mm:ss')} Santiago)`);
            return job;
            
        } catch (error) {
            console.error('Error programando alerta manual:', error);
            throw error;
        }
    }

    // Cerrar conexiones
    async cerrar() {
        await alertasQueue.close();
        await redis.disconnect();
    }
}

// Exportar instancia singleton
const alertasService = new AlertasService();

export default alertasService;
export { alertasQueue, redis };

