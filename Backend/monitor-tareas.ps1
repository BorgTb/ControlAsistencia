# MONITOR DE TAREAS PENDIENTES - SISTEMA DE ALERTAS

Write-Host "🔍 MONITOR DE TAREAS PENDIENTES" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

function Show-TaskDetails {
    param($endpoint, $title)
    
    Write-Host "`n$title" -ForegroundColor Green
    Write-Host "-" * $title.Length -ForegroundColor Green
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/$endpoint" -Method GET
        
        if ($response.success) {
            return $response.data
        } else {
            Write-Host "❌ Error: $($response.error)" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "❌ Error de conexión: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Mostrar estadísticas generales
$stats = Show-TaskDetails "status" "📊 ESTADÍSTICAS GENERALES"
if ($stats) {
    Write-Host "   Jobs esperando: $($stats.waiting)" -ForegroundColor Yellow
    Write-Host "   Jobs ejecutándose: $($stats.active)" -ForegroundColor Green
    Write-Host "   Jobs completados: $($stats.completed)" -ForegroundColor Blue
    Write-Host "   Jobs fallidos: $($stats.failed)" -ForegroundColor Red
    Write-Host "   Total en cola: $($stats.total)" -ForegroundColor White
}

# 2. Mostrar tareas pendientes detalladas
$pendientes = Show-TaskDetails "pendientes" "⏰ TAREAS PENDIENTES DETALLADAS"
if ($pendientes) {
    Write-Host "   Total pendientes: $($pendientes.resumen.total_pendientes)" -ForegroundColor White
    Write-Host "   Esperando: $($pendientes.resumen.esperando)" -ForegroundColor Yellow
    Write-Host "   Ejecutándose: $($pendientes.resumen.ejecutandose)" -ForegroundColor Green
    
    if ($pendientes.proxima_ejecucion) {
        $proxima = $pendientes.proxima_ejecucion
        Write-Host "`n🎯 PRÓXIMA EJECUCIÓN:" -ForegroundColor Cyan
        Write-Host "   Usuario: $($proxima.usuario.nombre) ($($proxima.usuario.email))" -ForegroundColor White
        Write-Host "   Tipo: $($proxima.tipo.ToUpper())" -ForegroundColor White
        Write-Host "   Tiempo restante: $($proxima.tiempo_restante)" -ForegroundColor Yellow
        Write-Host "   Fecha ejecución: $($proxima.fecha_ejecucion)" -ForegroundColor White
    }
    
    if ($pendientes.tareas_esperando.Count -gt 0) {
        Write-Host "`n📋 TAREAS ESPERANDO:" -ForegroundColor Cyan
        foreach ($tarea in $pendientes.tareas_esperando) {
            $tipoColor = if ($tarea.tipo -eq "entrada") { "Green" } else { "Yellow" }
            Write-Host "   [$($tarea.id)] $($tarea.tipo.ToUpper()) - $($tarea.usuario.nombre) - $($tarea.tiempo_restante)" -ForegroundColor $tipoColor
        }
    }
    
    if ($pendientes.tareas_ejecutandose.Count -gt 0) {
        Write-Host "`n⚡ TAREAS EJECUTÁNDOSE:" -ForegroundColor Cyan
        foreach ($tarea in $pendientes.tareas_ejecutandose) {
            Write-Host "   [$($tarea.id)] $($tarea.tipo.ToUpper()) - $($tarea.usuario.nombre) - EJECUTANDO" -ForegroundColor Red
        }
    }
}

# 3. Opción de monitoreo continuo
Write-Host "`n🔄 ¿Quieres monitoreo continuo? (s/n): " -NoNewline -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -eq "s" -or $respuesta -eq "S") {
    Write-Host "`n🔄 INICIANDO MONITOREO CONTINUO (Ctrl+C para detener)..." -ForegroundColor Green
    
    while ($true) {
        Clear-Host
        Write-Host "🔍 MONITOR EN TIEMPO REAL - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
        Write-Host "=" * 60 -ForegroundColor Cyan
        
        # Estadísticas rápidas
        $statsActual = Show-TaskDetails "status" "📊 ESTADO ACTUAL"
        if ($statsActual) {
            Write-Host "Pendientes: $($statsActual.total) | Completados: $($statsActual.completed) | Fallidos: $($statsActual.failed)" -ForegroundColor White
        }
        
        # Próxima tarea
        $pendientesActual = Show-TaskDetails "pendientes" "⏰ PRÓXIMA TAREA"
        if ($pendientesActual -and $pendientesActual.proxima_ejecucion) {
            $proxima = $pendientesActual.proxima_ejecucion
            Write-Host "Próxima: $($proxima.tipo.ToUpper()) - $($proxima.usuario.nombre) - $($proxima.tiempo_restante)" -ForegroundColor Yellow
        } else {
            Write-Host "No hay tareas pendientes" -ForegroundColor Green
        }
        
        Write-Host "`nActualizando en 5 segundos... (Ctrl+C para detener)" -ForegroundColor Gray
        Start-Sleep 5
    }
}

Write-Host "`n✅ Monitor finalizado" -ForegroundColor Green
