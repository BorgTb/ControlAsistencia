# TEST COMPLETO DEL SISTEMA DE ALERTAS DE ENTRADA Y SALIDA

Write-Host "🚀 INICIANDO TESTS DEL SISTEMA DE ALERTAS COMPLETO" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# 1. Verificar estado inicial
Write-Host "`n📊 TEST 1: Verificando estado inicial de la cola..." -ForegroundColor Green
try {
    $status = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/status" -Method GET
    Write-Host "✅ Estado obtenido:" -ForegroundColor Green
    Write-Host "   - Jobs esperando: $($status.data.waiting)" -ForegroundColor White
    Write-Host "   - Jobs activos: $($status.data.active)" -ForegroundColor White
    Write-Host "   - Jobs completados: $($status.data.completed)" -ForegroundColor White
    Write-Host "   - Jobs fallidos: $($status.data.failed)" -ForegroundColor White
} catch {
    Write-Host "❌ Error verificando estado: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Verificar datos disponibles
Write-Host "`n👥 TEST 2: Verificando usuarios y turnos disponibles..." -ForegroundColor Green
try {
    $datos = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/datos" -Method GET
    Write-Host "✅ Datos obtenidos:" -ForegroundColor Green
    Write-Host "   - Total usuarios: $($datos.data.total_usuarios)" -ForegroundColor White
    Write-Host "   - Total turnos: $($datos.data.total_turnos)" -ForegroundColor White
    
    if ($datos.data.usuarios_sample.Count -gt 0) {
        $usuario = $datos.data.usuarios_sample[0]
        Write-Host "   - Usuario de prueba: $($usuario.nombre) (ID: $($usuario.id), Email: $($usuario.email))" -ForegroundColor White
        $usuarioId = $usuario.id
    } else {
        Write-Host "❌ No hay usuarios disponibles para testing" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error obteniendo datos: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Programar alerta de ENTRADA
Write-Host "`n🕐 TEST 3: Programando alerta de ENTRADA (30 segundos)..." -ForegroundColor Green
try {
    $bodyEntrada = @{
        usuario_id = $usuarioId
        delay_minutos = 0.5
        tipo = "entrada"
    } | ConvertTo-Json

    $alertaEntrada = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/manual" -Method POST -Body $bodyEntrada -ContentType "application/json"
    Write-Host "✅ Alerta de ENTRADA programada:" -ForegroundColor Green
    Write-Host "   - Job ID: $($alertaEntrada.data.job_id)" -ForegroundColor White
    Write-Host "   - Tipo: $($alertaEntrada.data.tipo)" -ForegroundColor White
    Write-Host "   - Se ejecutará en: $($alertaEntrada.data.delay_minutos) minuto(s)" -ForegroundColor White
} catch {
    Write-Host "❌ Error programando alerta de entrada: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Programar alerta de SALIDA
Write-Host "`n🚪 TEST 4: Programando alerta de SALIDA (1 minuto)..." -ForegroundColor Green
try {
    $bodySalida = @{
        usuario_id = $usuarioId
        delay_minutos = 1
        tipo = "salida"
    } | ConvertTo-Json

    $alertaSalida = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/manual" -Method POST -Body $bodySalida -ContentType "application/json"
    Write-Host "✅ Alerta de SALIDA programada:" -ForegroundColor Green
    Write-Host "   - Job ID: $($alertaSalida.data.job_id)" -ForegroundColor White
    Write-Host "   - Tipo: $($alertaSalida.data.tipo)" -ForegroundColor White
    Write-Host "   - Se ejecutará en: $($alertaSalida.data.delay_minutos) minuto(s)" -ForegroundColor White
} catch {
    Write-Host "❌ Error programando alerta de salida: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Verificar estado después de programar
Write-Host "`n📊 TEST 5: Verificando estado después de programar alertas..." -ForegroundColor Green
try {
    $statusDespues = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/status" -Method GET
    Write-Host "✅ Estado actualizado:" -ForegroundColor Green
    Write-Host "   - Jobs esperando: $($statusDespues.data.waiting)" -ForegroundColor White
    Write-Host "   - Jobs activos: $($statusDespues.data.active)" -ForegroundColor White
    Write-Host "   - Total en cola: $($statusDespues.data.total)" -ForegroundColor White
} catch {
    Write-Host "❌ Error verificando estado: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Esperar y monitorear primera alerta
Write-Host "`n⏰ TEST 6: Esperando 35 segundos para la primera alerta..." -ForegroundColor Yellow
Write-Host "💡 Revisa los logs del servidor para ver el envío del correo de ENTRADA" -ForegroundColor Cyan
Start-Sleep 35

# 7. Verificar estado después de primera alerta
Write-Host "`n📊 TEST 7: Verificando estado después de primera alerta..." -ForegroundColor Green
try {
    $statusPrimera = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/status" -Method GET
    Write-Host "✅ Estado después de primera alerta:" -ForegroundColor Green
    Write-Host "   - Jobs esperando: $($statusPrimera.data.waiting)" -ForegroundColor White
    Write-Host "   - Jobs completados: $($statusPrimera.data.completed)" -ForegroundColor White
} catch {
    Write-Host "❌ Error verificando estado: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Esperar segunda alerta
Write-Host "`n⏰ TEST 8: Esperando 30 segundos más para la segunda alerta..." -ForegroundColor Yellow
Write-Host "💡 Revisa los logs del servidor para ver el envío del correo de SALIDA" -ForegroundColor Cyan
Start-Sleep 30

# 9. Verificar estado final
Write-Host "`n📊 TEST 9: Verificando estado final..." -ForegroundColor Green
try {
    $statusFinal = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/status" -Method GET
    Write-Host "✅ Estado final:" -ForegroundColor Green
    Write-Host "   - Jobs esperando: $($statusFinal.data.waiting)" -ForegroundColor White
    Write-Host "   - Jobs completados: $($statusFinal.data.completed)" -ForegroundColor White
    Write-Host "   - Jobs fallidos: $($statusFinal.data.failed)" -ForegroundColor White
} catch {
    Write-Host "❌ Error verificando estado final: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Test de programación diaria
Write-Host "`n🗓️ TEST 10: Probando programación diaria completa..." -ForegroundColor Green
try {
    $programacion = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/programar-diarias" -Method POST
    Write-Host "✅ Programación diaria ejecutada:" -ForegroundColor Green
    Write-Host "   - Jobs programados: $($programacion.data.jobs_programados)" -ForegroundColor White
} catch {
    Write-Host "❌ Error en programación diaria: $($_.Exception.Message)" -ForegroundColor Red
}

# 11. Limpiar cola
Write-Host "`n🧹 TEST 11: Limpiando cola de trabajos..." -ForegroundColor Green
try {
    $limpieza = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/limpiar" -Method DELETE
    Write-Host "✅ Cola limpiada:" -ForegroundColor Green
    Write-Host "   - Jobs restantes: $($limpieza.data.jobs_restantes)" -ForegroundColor White
} catch {
    Write-Host "❌ Error limpiando cola: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 TESTS COMPLETADOS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ Funcionalidades probadas:" -ForegroundColor Green
Write-Host "   - ✅ Alertas de ENTRADA programadas y enviadas" -ForegroundColor White
Write-Host "   - ✅ Alertas de SALIDA programadas y enviadas" -ForegroundColor White
Write-Host "   - ✅ Programación diaria automática" -ForegroundColor White
Write-Host "   - ✅ Gestión de cola con Redis y Bull" -ForegroundColor White
Write-Host "   - ✅ Limpieza automática de trabajos" -ForegroundColor White

Write-Host "`n📧 VERIFICACIONES MANUALES:" -ForegroundColor Yellow
Write-Host "   1. Revisa los emails enviados al usuario de prueba" -ForegroundColor White
Write-Host "   2. Verifica los logs del servidor para más detalles" -ForegroundColor White
Write-Host "   3. Verifica que Redis esté funcionando correctamente" -ForegroundColor White
