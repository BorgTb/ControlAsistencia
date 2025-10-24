import alertasService from '../jobs/Alertas.js';
import UserModel from '../model/UserModel.js';
import TurnosModel from '../model/TurnosModel.js';
import AsignacionTurnosModel from '../model/AsignacionTurnosModel.js';
import pool from '../config/dbconfig.js';
import { DateTime } from 'luxon';

class TestAlertas {
    constructor() {
        this.timezone = 'America/Santiago';
        console.log('🧪 Iniciando tests del sistema de alertas');
    }

    // Test 1: Programar alerta manual para testing inmediato
    async testAlertaManual(usuario_id, delay_minutos = 0.5) {
        try {
            console.log('\n🔬 TEST 1: Programando alerta manual...');
            
            const job = await alertasService.programarAlertaManual(usuario_id, delay_minutos);
            
            console.log(`✅ Alerta manual programada exitosamente`);
            console.log(`   - Job ID: ${job.id}`);
            console.log(`   - Se ejecutará en ${delay_minutos} minuto(s)`);
            
            return job;
            
        } catch (error) {
            console.error('❌ Error en test de alerta manual:', error);
            throw error;
        }
    }

    // Test 2: Verificar estado de la cola
    async testEstadoCola() {
        try {
            console.log('\n🔬 TEST 2: Verificando estado de la cola...');
            
            const stats = await alertasService.obtenerEstadisticas();
            
            if (stats) {
                console.log('✅ Estadísticas de la cola:');
                console.log(`   - Jobs esperando: ${stats.waiting}`);
                console.log(`   - Jobs activos: ${stats.active}`);
                console.log(`   - Jobs completados: ${stats.completed}`);
                console.log(`   - Jobs fallidos: ${stats.failed}`);
                console.log(`   - Total en cola: ${stats.total}`);
            } else {
                console.log('❌ No se pudieron obtener estadísticas');
            }
            
            return stats;
            
        } catch (error) {
            console.error('❌ Error verificando estado de cola:', error);
            throw error;
        }
    }

    // Test 3: Simular programación diaria
    async testProgramacionDiaria() {
        try {
            console.log('\n🔬 TEST 3: Simulando programación diaria...');
            
            await alertasService.programarAlertasDiarias();
            
            console.log('✅ Programación diaria ejecutada');
            
            // Verificar cuántos jobs se programaron
            const stats = await alertasService.obtenerEstadisticas();
            console.log(`   - Jobs programados: ${stats.waiting}`);
            
        } catch (error) {
            console.error('❌ Error en test de programación diaria:', error);
            throw error;
        }
    }

    // Test 4: Verificar usuarios y turnos disponibles
    async testDatosDisponibles() {
        try {
            console.log('\n🔬 TEST 4: Verificando datos disponibles...');
            
            // Obtener usuarios
            const usuarios = await UserModel.findAll();
            console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
            
            if (usuarios.length > 0) {
                console.log('   Primeros usuarios:');
                usuarios.slice(0, 3).forEach(user => {
                    console.log(`   - ID: ${user.id}, Nombre: ${user.nombre}, Email: ${user.email}`);
                });
            }
            
            // Obtener asignaciones de turnos
            const asignaciones = await TurnosModel.getAllTurnos();
            console.log(`✅ Asignaciones de turnos encontradas: ${asignaciones.length}`);
            
            if (asignaciones.length > 0) {
                console.log('   Primeras asignaciones:');
                const fechaHoy = DateTime.now().setZone(this.timezone).toISODate();
                
                for (const asignacion of asignaciones.slice(0, 3)) {
                    // Verificar si tiene turno activo hoy
                    const turnoActivo = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(
                        asignacion.usuario_empresa_id,
                        fechaHoy
                    );
                    
                    const estadoHoy = turnoActivo ? '✓ Trabaja hoy' : '✗ No trabaja hoy';
                    console.log(`   - ID: ${asignacion.id}, Usuario: ${asignacion.usuario_nombre}, Estado: ${asignacion.estado}, ${estadoHoy}`);
                    
                    if (turnoActivo) {
                        console.log(`     Horario: ${turnoActivo.hora_inicio} - ${turnoActivo.hora_fin}`);
                    }
                }
            }
            
            return { usuarios, turnos: asignaciones };
            
        } catch (error) {
            console.error('❌ Error verificando datos:', error);
            throw error;
        }
    }

    // Test 5: Test completo con monitoreo
    async testCompleto(usuario_id = null) {
        try {
            console.log('\n🚀 INICIANDO TEST COMPLETO DEL SISTEMA DE ALERTAS');
            console.log('=' .repeat(60));
            
            // 1. Verificar datos disponibles
            const { usuarios, turnos } = await this.testDatosDisponibles();
            
            if (usuarios.length === 0) {
                console.log('❌ No hay usuarios para testear');
                return;
            }
            
            // 2. Usar usuario proporcionado o el primero disponible
            const usuarioTest = usuario_id ? 
                usuarios.find(u => u.id === usuario_id) : 
                usuarios[0];
                
            if (!usuarioTest) {
                console.log('❌ Usuario no encontrado para testing');
                return;
            }
            
            console.log(`\n👤 Usando usuario: ${usuarioTest.nombre} (${usuarioTest.email})`);
            
            // 3. Verificar estado inicial de la cola
            await this.testEstadoCola();
            
            // 4. Programar alerta manual para testing inmediato
            console.log('\n⏰ Programando alerta de prueba para 30 segundos...');
            const job = await this.testAlertaManual(usuarioTest.id, 0.5);
            
            // 5. Monitorear el job
            await this.monitorearJob(job);
            
            // 6. Verificar estado final
            await this.testEstadoCola();
            
            console.log('\n✅ TEST COMPLETO FINALIZADO');
            
        } catch (error) {
            console.error('❌ Error en test completo:', error);
            throw error;
        }
    }

    // Monitorear un job específico
    async monitorearJob(job, timeout = 60000) {
        return new Promise((resolve, reject) => {
            console.log(`\n👀 Monitoreando job ${job.id}...`);
            
            const interval = setInterval(async () => {
                try {
                    const jobActualizado = await job.queue.getJob(job.id);
                    
                    if (!jobActualizado) {
                        console.log('❌ Job no encontrado');
                        clearInterval(interval);
                        resolve(false);
                        return;
                    }
                    
                    const estado = await jobActualizado.getState();
                    console.log(`   Estado del job: ${estado}`);
                    
                    if (estado === 'completed') {
                        console.log('✅ Job completado exitosamente');
                        clearInterval(interval);
                        resolve(true);
                    } else if (estado === 'failed') {
                        console.log('❌ Job falló');
                        const failedReason = jobActualizado.failedReason;
                        console.log(`   Razón del fallo: ${failedReason}`);
                        clearInterval(interval);
                        resolve(false);
                    }
                    
                } catch (error) {
                    console.error('Error monitoreando job:', error);
                    clearInterval(interval);
                    reject(error);
                }
            }, 5000); // Verificar cada 5 segundos
            
            // Timeout después de 60 segundos
            setTimeout(() => {
                clearInterval(interval);
                console.log('⏰ Timeout del monitoreo');
                resolve(false);
            }, timeout);
        });
    }

    // Test de limpieza
    async testLimpiarCola() {
        try {
            console.log('\n🧹 TEST: Limpiando cola...');
            
            await alertasService.limpiarTrabajosCompletados();
            
            console.log('✅ Limpieza completada');
            
            const stats = await alertasService.obtenerEstadisticas();
            console.log(`   Jobs restantes: ${stats.total}`);
            
        } catch (error) {
            console.error('❌ Error limpiando cola:', error);
            throw error;
        }
    }

    // Listar todos los tests disponibles
    listarTests() {
        console.log('\n📋 TESTS DISPONIBLES:');
        console.log('1. testAlertaManual(usuario_id, delay_minutos) - Programa alerta inmediata');
        console.log('2. testEstadoCola() - Verifica estado de la cola');
        console.log('3. testProgramacionDiaria() - Simula programación diaria');
        console.log('4. testDatosDisponibles() - Verifica usuarios y turnos');
        console.log('5. testCompleto(usuario_id) - Test completo con monitoreo');
        console.log('6. testLimpiarCola() - Limpia trabajos completados');
        console.log('\nEjemplo de uso:');
        console.log('const tester = new TestAlertas();');
        console.log('await tester.testCompleto(); // Test completo');
        console.log('await tester.testAlertaManual(1, 0.5); // Alerta en 30 segundos');
    }
}

export default TestAlertas;

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new TestAlertas();
    tester.listarTests();
    
    // Ejecutar test completo si se pasa argumento
    if (process.argv[2] === 'run') {
        const usuario_id = process.argv[3] ? parseInt(process.argv[3]) : null;
        tester.testCompleto(usuario_id).catch(console.error);
    }
}
