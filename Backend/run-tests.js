import TestAlertas from './test/test-alertas.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const tester = new TestAlertas();

async function ejecutarTests() {
    console.log('🚀 INICIANDO TESTS DEL SISTEMA DE ALERTAS');
    console.log('=' .repeat(60));
    
    try {
        // 1. Mostrar tests disponibles
        tester.listarTests();
        
        // 2. Verificar datos disponibles
        console.log('\n🔍 Verificando datos disponibles...');
        const datos = await tester.testDatosDisponibles();
        
        if (datos.usuarios.length === 0) {
            console.log('❌ No hay usuarios disponibles para testing');
            return;
        }
        
        // 3. Verificar estado inicial de la cola
        console.log('\n📊 Estado inicial de la cola:');
        await tester.testEstadoCola();
        
        // 4. Preguntar al usuario qué test ejecutar
        console.log('\n🤔 ¿Qué test quieres ejecutar?');
        console.log('1. Test de alerta manual (30 segundos)');
        console.log('2. Test completo con monitoreo');
        console.log('3. Test de programación diaria');
        console.log('4. Solo verificar estado');
        console.log('5. Limpiar cola');
        
        // Por defecto ejecutamos test de alerta manual
        const usuarioTest = datos.usuarios[0];
        console.log(`\n⚡ Ejecutando test de alerta manual con usuario: ${usuarioTest.nombre}`);
        
        const job = await tester.testAlertaManual(usuarioTest.id, 0.5);
        
        console.log('\n👀 Monitoreando ejecución...');
        console.log('⏰ La alerta debería enviarse en aproximadamente 30 segundos');
        console.log('📧 Revisa el email del usuario para verificar que llegó el correo');
        
        // Monitorear por 2 minutos
        await tester.monitorearJob(job, 120000);
        
        // Estado final
        console.log('\n📊 Estado final de la cola:');
        await tester.testEstadoCola();
        
        console.log('\n✅ TESTS COMPLETADOS');
        console.log('💡 TIP: Puedes usar las rutas de la API para testing interactivo:');
        console.log('   GET  /api/test/alertas/status');
        console.log('   POST /api/test/alertas/manual');
        console.log('   POST /api/test/alertas/test-completo');
        
    } catch (error) {
        console.error('❌ Error ejecutando tests:', error);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    ejecutarTests().catch(console.error);
}
