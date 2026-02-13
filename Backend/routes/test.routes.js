import express from 'express';
import alertasService from '../jobs/Alertas.js';
import TestAlertas from '../test/test-alertas.js';

const router = express.Router();
const testAlertas = new TestAlertas();

// GET /api/test/alertas/status - Ver estado de la cola
router.get('/status', async (req, res) => {
    try {
        const stats = await alertasService.obtenerEstadisticas();
        
        res.json({
            success: true,
            data: stats,
            message: 'Estado de la cola obtenido exitosamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/test/alertas/pendientes - Ver tareas pendientes detalladas
router.get('/pendientes', async (req, res) => {
    try {
        const tareasPendientes = await alertasService.obtenerTareasPendientes();
        
        res.json({
            success: true,
            data: tareasPendientes,
            message: 'Tareas pendientes obtenidas exitosamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/test/alertas/debug - Debug detallado de la cola
router.get('/debug', async (req, res) => {
    try {
        // Importar la cola directamente para debug
        const { alertasQueue } = await import('../jobs/Alertas.js');
        
        const waiting = await alertasQueue.getWaiting();
        const active = await alertasQueue.getActive();
        const completed = await alertasQueue.getCompleted(0, 5); // Ãšltimos 5
        const failed = await alertasQueue.getFailed(0, 5); // Ãšltimos 5
        
        const debugInfo = {
            queue_info: {
                name: alertasQueue.name,
                total_waiting: waiting.length,
                total_active: active.length,
                total_completed: completed.length,
                total_failed: failed.length
            },
            waiting_jobs: waiting.map(job => ({
                id: job.id,
                name: job.name,
                data: job.data,
                opts: job.opts,
                timestamp: job.timestamp,
                delay: job.opts.delay,
                attempts: job.opts.attempts,
                created_at: new Date(job.timestamp).toISOString(),
                execute_at: new Date(job.timestamp + (job.opts.delay || 0)).toISOString()
            })),
            active_jobs: active.map(job => ({
                id: job.id,
                name: job.name,
                data: job.data,
                processedOn: job.processedOn
            }))
        };
        
        res.json({
            success: true,
            data: debugInfo,
            message: 'Debug informaciÃ³n obtenida exitosamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// POST /api/test/alertas/manual - Programar alerta manual
router.post('/manual', async (req, res) => {
    try {
        const { usuario_id, delay_minutos = 0.1, tipo = 'entrada' } = req.body;
        
        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                error: 'usuario_id es requerido'
            });
        }

        if (!['entrada', 'salida'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                error: 'tipo debe ser "entrada" o "salida"'
            });
        }
        
        const job = await alertasService.programarAlertaManual(usuario_id, delay_minutos, tipo);
        
        res.json({
            success: true,
            data: {
                job_id: job.id,
                delay_minutos,
                tipo,
                mensaje: `Alerta de ${tipo} programada para ${delay_minutos} minuto(s)`
            },
            message: 'Alerta manual programada exitosamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/test/alertas/programar-diarias - Ejecutar programaciÃ³n diaria manualmente
router.post('/programar-diarias', async (req, res) => {
    try {
        await alertasService.programarAlertasDiarias();
        
        const stats = await alertasService.obtenerEstadisticas();
        
        res.json({
            success: true,
            data: {
                jobs_programados: stats.waiting,
                stats_completas: stats
            },
            message: 'ProgramaciÃ³n diaria ejecutada exitosamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/test/alertas/datos - Verificar datos disponibles
router.get('/datos', async (req, res) => {
    try {
        const resultado = await testAlertas.testDatosDisponibles();
        
        res.json({
            success: true,
            data: {
                total_usuarios: resultado.usuarios.length,
                total_asignaciones: resultado.turnos.length,
                usuarios_sample: resultado.usuarios.slice(0, 5).map(u => ({
                    id: u.id,
                    nombre: u.nombre,
                    email: u.email,
                    rut: u.rut
                })),
                asignaciones_sample: resultado.turnos.slice(0, 5).map(t => ({
                    id: t.id,
                    usuario_empresa_id: t.usuario_empresa_id,
                    usuario_nombre: t.usuario_nombre,
                    tipo_turno: t.tipo_turno_nombre,
                    fecha_inicio: t.fecha_inicio,
                    fecha_fin: t.fecha_fin,
                    estado: t.estado,
                    hora_inicio: t.hora_inicio,
                    hora_fin: t.hora_fin
                }))
            },
            message: 'Datos verificados exitosamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/test/alertas/test-completo - Ejecutar test completo
router.post('/test-completo', async (req, res) => {
    try {
        const { usuario_id } = req.body;
        
        // Ejecutar test completo en background
        testAlertas.testCompleto(usuario_id).catch(console.error);
        
        res.json({
            success: true,
            message: 'Test completo iniciado. Revisa los logs del servidor para ver el progreso.',
            data: {
                usuario_id: usuario_id || 'primer usuario disponible',
                nota: 'El test se ejecuta en background. Verifica los logs del servidor.'
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE /api/test/alertas/limpiar - Limpiar cola
router.delete('/limpiar', async (req, res) => {
    try {
        await alertasService.limpiarTrabajosCompletados();
        
        const stats = await alertasService.obtenerEstadisticas();
        
        res.json({
            success: true,
            data: {
                jobs_restantes: stats.total,
                stats: stats
            },
            message: 'Cola limpiada exitosamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/test/alertas/cancelar - Cancelar alerta especÃ­fica
router.post('/cancelar', async (req, res) => {
    try {
        const { usuario_id, fecha, tipo } = req.body;
        
        if (!usuario_id || !fecha) {
            return res.status(400).json({
                success: false,
                error: 'usuario_id y fecha son requeridos'
            });
        }

        if (tipo && !['entrada', 'salida'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                error: 'tipo debe ser "entrada" o "salida" (opcional)'
            });
        }
        
        await alertasService.cancelarAlerta(usuario_id, fecha, tipo);
        
        const mensaje = tipo ? 
            `Alerta de ${tipo} cancelada exitosamente` : 
            'Alertas de entrada y salida canceladas exitosamente';
        
        res.json({
            success: true,
            message: mensaje
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/test/alertas/logs - Ver logs recientes
router.get('/logs', async (req, res) => {
    try {
        const { alertasQueue } = await import('../jobs/Alertas.js');
        
        // Obtener trabajos completados y fallidos recientes
        const completed = await alertasQueue.getCompleted(0, 10);
        const failed = await alertasQueue.getFailed(0, 10);
        
        // FunciÃ³n helper para formatear fecha de forma segura
        const formatearFechaSafe = (timestamp) => {
            if (!timestamp || isNaN(timestamp)) return 'No disponible';
            try {
                return new Date(timestamp).toISOString();
            } catch (error) {
                return 'Fecha invÃ¡lida';
            }
        };
        
        // FunciÃ³n helper para calcular duraciÃ³n de forma segura
        const calcularDuracionSafe = (finishedOn, processedOn) => {
            if (!finishedOn || !processedOn || isNaN(finishedOn) || isNaN(processedOn)) {
                return 'No calculable';
            }
            try {
                return finishedOn - processedOn;
            } catch (error) {
                return 'Error cÃ¡lculo';
            }
        };
        
        const logs = {
            trabajos_completados: completed.map(job => ({
                id: job.id,
                tipo: job.data?.tipo || 'No especificado',
                usuario: job.data?.nombre || 'Usuario desconocido',
                email: job.data?.email || 'Email no disponible',
                completado_en: formatearFechaSafe(job.finishedOn),
                resultado: job.returnvalue || 'Sin resultado',
                duracion_ms: calcularDuracionSafe(job.finishedOn, job.processedOn),
                timestamp_raw: {
                    finishedOn: job.finishedOn,
                    processedOn: job.processedOn
                }
            })),
            trabajos_fallidos: failed.map(job => ({
                id: job.id,
                tipo: job.data?.tipo || 'No especificado',
                usuario: job.data?.nombre || 'Usuario desconocido',
                email: job.data?.email || 'Email no disponible',
                error: job.failedReason || 'Error desconocido',
                fallo_en: formatearFechaSafe(job.failedOn),
                intentos: job.attemptsMade || 0,
                stack_trace: job.stacktrace ? job.stacktrace.slice(0, 500) + '...' : 'No disponible',
                timestamp_raw: {
                    failedOn: job.failedOn,
                    processedOn: job.processedOn
                }
            })),
            resumen: {
                total_completados: completed.length,
                total_fallidos: failed.length,
                ultima_actualizacion: new Date().toISOString()
            }
        };
        
        res.json({
            success: true,
            data: logs,
            message: 'Logs obtenidos exitosamente'
        });
        
    } catch (error) {
        console.error('Error obteniendo logs:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// GET /api/test/alertas/turnos-activos - Ver turnos activos del dÃ­a
router.get('/turnos-activos', async (req, res) => {
    try {
        const { fecha } = req.query;
        const AsignacionTurnosModel = (await import('../model/asignacion-turnos.model.js')).default;
        const TurnosModel = (await import('../model/turnos.model.js')).default;
        const { DateTime } = await import('luxon');
        
        const fechaBusqueda = fecha || DateTime.now().setZone('America/Santiago').toISODate();
        
        // Obtener todas las asignaciones
        const asignaciones = await TurnosModel.getAllTurnos();
        
        const turnosActivos = [];
        
        for (const asignacion of asignaciones) {
            // Verificar si estÃ¡ activa
            const fechaInicio = new Date(asignacion.fecha_inicio);
            const fechaFin = asignacion.fecha_fin ? new Date(asignacion.fecha_fin) : null;
            const fechaActual = new Date(fechaBusqueda);

            if (fechaActual < fechaInicio || (fechaFin && fechaActual > fechaFin)) {
                continue;
            }

            if (asignacion.estado !== 'activo') {
                continue;
            }

            // Obtener turno activo del dÃ­a
            const turnoActivo = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(
                asignacion.usuario_empresa_id,
                fechaBusqueda
            );

            if (turnoActivo && turnoActivo.trabaja) {
                turnosActivos.push({
                    asignacion_id: asignacion.id,
                    usuario_empresa_id: asignacion.usuario_empresa_id,
                    usuario_nombre: asignacion.usuario_nombre,
                    usuario_rut: asignacion.rut,
                    empresa: asignacion.empresa_nombre,
                    tipo_turno: asignacion.tipo_turno_nombre,
                    dia_semana: turnoActivo.dia_semana,
                    hora_inicio: turnoActivo.hora_inicio,
                    hora_fin: turnoActivo.hora_fin,
                    fecha_busqueda: fechaBusqueda
                });
            }
        }
        
        res.json({
            success: true,
            data: {
                fecha: fechaBusqueda,
                total_turnos_activos: turnosActivos.length,
                total_asignaciones_revisadas: asignaciones.length,
                turnos: turnosActivos
            },
            message: `Se encontraron ${turnosActivos.length} turnos activos para el ${fechaBusqueda}`
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// GET /api/test/alertas/usuario/:id/turnos - Ver turnos de un usuario especÃ­fico
router.get('/usuario/:id/turnos', async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha } = req.query;
        const pool = (await import('../config/dbconfig.js')).default;
        const AsignacionTurnosModel = (await import('../model/asignacion-turnos.model.js')).default;
        const { DateTime } = await import('luxon');
        
        const fechaBusqueda = fecha || DateTime.now().setZone('America/Santiago').toISODate();
        
        // Obtener usuario_empresa_id del usuario
        const [usuariosEmpresas] = await pool.query(`
            SELECT ue.id, ue.empresa_id, e.emp_nombre
            FROM usuarios_empresas ue
            INNER JOIN empresa e ON ue.empresa_id = e.empresa_id
            WHERE ue.usuario_id = ?
        `, [id]);

        if (usuariosEmpresas.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no tiene empresas asignadas'
            });
        }

        const turnosDelUsuario = [];

        for (const ue of usuariosEmpresas) {
            // Obtener todas las asignaciones
            const asignaciones = await AsignacionTurnosModel.getByUsuarioEmpresaId(ue.id);
            
            for (const asignacion of asignaciones) {
                // Verificar turno activo para la fecha
                const turnoActivo = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(
                    ue.id,
                    fechaBusqueda
                );

                turnosDelUsuario.push({
                    asignacion_id: asignacion.id,
                    empresa: ue.emp_nombre,
                    tipo_turno: asignacion.tipo_turno_nombre,
                    fecha_inicio: asignacion.fecha_inicio,
                    fecha_fin: asignacion.fecha_fin,
                    estado: asignacion.estado,
                    activo_para_fecha: turnoActivo ? 'SÃ­' : 'No',
                    trabaja_hoy: turnoActivo?.trabaja ? 'SÃ­' : 'No',
                    horario_hoy: turnoActivo?.trabaja ? 
                        `${turnoActivo.hora_inicio} - ${turnoActivo.hora_fin}` : 
                        'No trabaja',
                    dia_semana: turnoActivo?.dia_semana || 'N/A'
                });
            }
        }
        
        res.json({
            success: true,
            data: {
                usuario_id: id,
                fecha_consulta: fechaBusqueda,
                total_asignaciones: turnosDelUsuario.length,
                turnos: turnosDelUsuario
            },
            message: 'Turnos del usuario obtenidos exitosamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// POST /api/test/alertas/simular-dia - Simular alertas para un dÃ­a especÃ­fico
router.post('/simular-dia', async (req, res) => {
    try {
        const { fecha, usuario_empresa_id } = req.body;
        const { DateTime } = await import('luxon');
        
        const fechaSimulacion = fecha || DateTime.now().setZone('America/Santiago').toISODate();
        
        console.log(`\nðŸŽ­ Simulando alertas para el dÃ­a: ${fechaSimulacion}`);
        
        if (usuario_empresa_id) {
            // Simular para un usuario especÃ­fico
            const AsignacionTurnosModel = (await import('../model/asignacion-turnos.model.js')).default;
            const turnoActivo = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(
                usuario_empresa_id,
                fechaSimulacion
            );
            
            if (!turnoActivo || !turnoActivo.trabaja) {
                return res.json({
                    success: false,
                    message: `Usuario ${usuario_empresa_id} no tiene turno activo para ${fechaSimulacion}`
                });
            }
            
            // Programar alertas para este turno
            await alertasService.programarAlertasParaTurno(turnoActivo, fechaSimulacion);
            
            const stats = await alertasService.obtenerEstadisticas();
            
            return res.json({
                success: true,
                data: {
                    fecha: fechaSimulacion,
                    usuario_empresa_id,
                    turno: {
                        hora_inicio: turnoActivo.hora_inicio,
                        hora_fin: turnoActivo.hora_fin,
                        dia_semana: turnoActivo.dia_semana
                    },
                    jobs_programados: stats.waiting
                },
                message: 'Alertas simuladas exitosamente para el usuario'
            });
        } else {
            // Simular para todos los usuarios del dÃ­a
            await alertasService.programarAlertasDiarias();
            
            const stats = await alertasService.obtenerEstadisticas();
            
            return res.json({
                success: true,
                data: {
                    fecha: fechaSimulacion,
                    jobs_programados: stats.waiting,
                    stats_completas: stats
                },
                message: 'Alertas simuladas exitosamente para todos los usuarios'
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

export default router;
