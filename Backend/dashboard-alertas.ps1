# DASHBOARD SIMPLE DE TAREAS

function Show-AlertasDashboard {
    Write-Host "┌─────────────────────────────────────────────┐" -ForegroundColor Cyan
    Write-Host "│            DASHBOARD DE ALERTAS             │" -ForegroundColor Cyan
    Write-Host "└─────────────────────────────────────────────┘" -ForegroundColor Cyan
    
    try {
        # Obtener datos
        $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/status" -Method GET
        $pendientes = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/pendientes" -Method GET
        
        if ($stats.success -and $pendientes.success) {
            $s = $stats.data
            $p = $pendientes.data
            
            # Resumen
            Write-Host "`n📊 RESUMEN GENERAL:" -ForegroundColor Green
            Write-Host "   🕐 Esperando    : $($s.waiting)" -ForegroundColor Yellow
            Write-Host "   ⚡ Ejecutando   : $($s.active)" -ForegroundColor Red
            Write-Host "   ✅ Completados : $($s.completed)" -ForegroundColor Green
            Write-Host "   ❌ Fallidos    : $($s.failed)" -ForegroundColor Red
            Write-Host "   📊 Total       : $($s.total)" -ForegroundColor White
            
            # Próxima tarea
            if ($p.proxima_ejecucion) {
                $proxima = $p.proxima_ejecucion
                Write-Host "`n🎯 PRÓXIMA TAREA:" -ForegroundColor Cyan
                Write-Host "   👤 Usuario: $($proxima.usuario.nombre)" -ForegroundColor White
                Write-Host "   📧 Email  : $($proxima.usuario.email)" -ForegroundColor Gray
                Write-Host "   🏷️ Tipo   : $($proxima.tipo.ToUpper())" -ForegroundColor $(if($proxima.tipo -eq "entrada"){"Green"}else{"Yellow"})
                Write-Host "   ⏰ Tiempo : $($proxima.tiempo_restante)" -ForegroundColor Yellow
            } else {
                Write-Host "`n😴 No hay tareas pendientes" -ForegroundColor Green
            }
            
            # Lista de tareas esperando
            if ($p.tareas_esperando.Count -gt 0) {
                Write-Host "`n📋 COLA DE ESPERA:" -ForegroundColor Cyan
                $p.tareas_esperando | ForEach-Object {
                    $icono = if ($_.tipo -eq "entrada") { "🕐" } else { "🚪" }
                    $color = if ($_.tipo -eq "entrada") { "Green" } else { "Yellow" }
                    Write-Host "   $icono [$($_.id)] $($_.usuario.nombre) - $($_.tiempo_restante)" -ForegroundColor $color
                }
            }
            
        } else {
            Write-Host "❌ Error obteniendo datos del servidor" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Error de conexión: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Ejecutar dashboard
Show-AlertasDashboard
