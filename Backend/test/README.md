# 🧪 Testing del Sistema de Alertas

## 🚀 Inicio Rápido

### 1. Verificar que el sistema funciona
```bash
# Ver usuarios y turnos disponibles
curl http://localhost:3000/api/test/alertas/datos

# Ver turnos activos de hoy
curl http://localhost:3000/api/test/alertas/turnos-activos
```

### 2. Programar alerta de prueba (se ejecuta en 30 segundos)
```bash
curl -X POST http://localhost:3000/api/test/alertas/manual \
  -H "Content-Type: application/json" \
  -d '{"usuario_id": 1, "delay_minutos": 0.5, "tipo": "entrada"}'
```

### 3. Ver estado de la cola
```bash
curl http://localhost:3000/api/test/alertas/status
```

### 4. Ver logs después de 40 segundos
```bash
curl http://localhost:3000/api/test/alertas/logs
```

## 📁 Archivos de Documentación

- **TESTING_ALERTAS.md** - Guía completa de todos los endpoints y cómo usarlos
- **SCRIPTS_TESTING.md** - Scripts JavaScript listos para copiar y pegar
- **CAMBIOS_ALERTAS.md** - Detalles técnicos de los cambios implementados
- **RESUMEN_ACTUALIZACION_ALERTAS.md** - Resumen ejecutivo de la actualización

## 🎯 Endpoints Principales

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/status` | GET | Ver estado de la cola |
| `/datos` | GET | Ver usuarios y asignaciones |
| `/turnos-activos` | GET | Ver turnos activos del día |
| `/usuario/:id/turnos` | GET | Ver turnos de un usuario |
| `/manual` | POST | Programar alerta de prueba |
| `/programar-diarias` | POST | Ejecutar programación diaria |
| `/simular-dia` | POST | Simular alertas de una fecha |
| `/logs` | GET | Ver logs recientes |
| `/pendientes` | GET | Ver alertas pendientes |
| `/limpiar` | DELETE | Limpiar trabajos completados |

## 🔍 Casos de Uso Comunes

### Verificar un usuario específico
```bash
# Ver turnos del usuario ID 1
curl http://localhost:3000/api/test/alertas/usuario/1/turnos

# Programar alerta de prueba para ese usuario
curl -X POST http://localhost:3000/api/test/alertas/manual \
  -H "Content-Type: application/json" \
  -d '{"usuario_id": 1, "delay_minutos": 0.5}'
```

### Verificar día laborable vs no laborable
```bash
# Ver turnos del lunes (día laborable)
curl "http://localhost:3000/api/test/alertas/turnos-activos?fecha=2025-10-20"

# Ver turnos del domingo (usualmente sin turnos)
curl "http://localhost:3000/api/test/alertas/turnos-activos?fecha=2025-10-19"
```

### Simular programación de un día futuro
```bash
curl -X POST http://localhost:3000/api/test/alertas/simular-dia \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2025-10-22"}'
```

## 🐛 Troubleshooting

### No se programan alertas
1. Verificar que hay usuarios con asignaciones activas:
   ```bash
   curl http://localhost:3000/api/test/alertas/datos
   ```

2. Verificar que hay turnos para el día:
   ```bash
   curl http://localhost:3000/api/test/alertas/turnos-activos
   ```

3. Ver logs del servidor para detalles

### Alertas no se ejecutan
1. Verificar estado de la cola:
   ```bash
   curl http://localhost:3000/api/test/alertas/status
   ```

2. Ver tareas pendientes:
   ```bash
   curl http://localhost:3000/api/test/alertas/pendientes
   ```

3. Verificar que Redis está corriendo

### Usuario no recibe email
1. Ver logs de ejecución:
   ```bash
   curl http://localhost:3000/api/test/alertas/logs
   ```

2. Verificar configuración SMTP en `.env`

3. Revisar que el email del usuario es válido

## 📊 Monitoreo

### Script de monitoreo continuo (Bash)
```bash
#!/bin/bash
while true; do
    clear
    echo "=== Estado del Sistema de Alertas ==="
    echo ""
    curl -s http://localhost:3000/api/test/alertas/status | jq '.data'
    echo ""
    echo "Actualizado: $(date)"
    sleep 5
done
```

### Script de monitoreo continuo (PowerShell)
```powershell
while ($true) {
    Clear-Host
    Write-Host "=== Estado del Sistema de Alertas ===" -ForegroundColor Cyan
    Write-Host ""
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/status"
    $response.data | Format-Table
    Write-Host ""
    Write-Host "Actualizado: $(Get-Date)" -ForegroundColor Gray
    Start-Sleep -Seconds 5
}
```

## 🎓 Tutoriales

### Tutorial 1: Primera Alerta
1. Ver usuarios disponibles
2. Seleccionar un usuario
3. Programar alerta de prueba
4. Esperar y verificar logs

### Tutorial 2: Testing Completo del Día
1. Ver turnos activos del día
2. Programar alertas diarias
3. Ver alertas pendientes
4. Monitorear ejecución

### Tutorial 3: Testing de Usuario Específico
1. Consultar turnos del usuario
2. Verificar horarios por día
3. Simular alerta para ese usuario
4. Verificar resultado

## 🛠️ Herramientas Recomendadas

- **Postman** - Para testing manual de APIs
- **curl** - Para testing desde terminal
- **Consola del navegador** - Para ejecutar scripts JavaScript
- **jq** - Para formatear respuestas JSON en terminal

## 📞 Soporte

Si encuentras problemas:
1. Consulta la documentación completa en `TESTING_ALERTAS.md`
2. Revisa los logs del servidor
3. Verifica que Redis está corriendo
4. Verifica la configuración de la base de datos

## ⚡ Tips de Productividad

1. **Usa alias en tu terminal:**
   ```bash
   alias test-alertas='curl http://localhost:3000/api/test/alertas'
   ```

2. **Guarda queries comunes:**
   ```bash
   test-alertas/status
   test-alertas/turnos-activos
   ```

3. **Usa scripts de monitoreo** para ver cambios en tiempo real

4. **Combina con jq** para mejor visualización:
   ```bash
   curl -s http://localhost:3000/api/test/alertas/status | jq '.data'
   ```

## 🎉 ¡Listo!

Ahora tienes todas las herramientas para probar el sistema de alertas. 

Para más detalles, consulta la documentación completa en los archivos MD mencionados al inicio.
