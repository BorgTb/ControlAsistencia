# EJEMPLOS DE TESTING DEL SISTEMA DE ALERTAS (ENTRADA Y SALIDA)

## 1. Verificar estado de la cola
GET http://localhost:3000/api/test/alertas/status

```bash
curl -X GET http://localhost:3000/api/test/alertas/status
```

## 2. Verificar datos disponibles (usuarios y turnos)
GET http://localhost:3000/api/test/alertas/datos

```bash
curl -X GET http://localhost:3000/api/test/alertas/datos
```

## 3. Programar alerta manual de ENTRADA (se ejecuta en 30 segundos)
POST http://localhost:3000/api/test/alertas/manual

```bash
curl -X POST http://localhost:3000/api/test/alertas/manual \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "delay_minutos": 0.5,
    "tipo": "entrada"
  }'
```

## 4. Programar alerta manual de SALIDA (se ejecuta en 30 segundos)
POST http://localhost:3000/api/test/alertas/manual

```bash
curl -X POST http://localhost:3000/api/test/alertas/manual \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "delay_minutos": 0.5,
    "tipo": "salida"
  }'
```

## 5. Ejecutar programación diaria completa (entrada y salida)
POST http://localhost:3000/api/test/alertas/programar-diarias

```bash
curl -X POST http://localhost:3000/api/test/alertas/programar-diarias
```

## 6. Ejecutar test completo
POST http://localhost:3000/api/test/alertas/test-completo

```bash
curl -X POST http://localhost:3000/api/test/alertas/test-completo \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1
  }'
```

## 7. Limpiar cola de trabajos
DELETE http://localhost:3000/api/test/alertas/limpiar

```bash
curl -X DELETE http://localhost:3000/api/test/alertas/limpiar
```

## 8. Cancelar alerta específica de entrada
POST http://localhost:3000/api/test/alertas/cancelar

```bash
curl -X POST http://localhost:3000/api/test/alertas/cancelar \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "fecha": "2025-08-08",
    "tipo": "entrada"
  }'
```

## 9. Cancelar alerta específica de salida
POST http://localhost:3000/api/test/alertas/cancelar

```bash
curl -X POST http://localhost:3000/api/test/alertas/cancelar \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "fecha": "2025-08-08",
    "tipo": "salida"
  }'
```

## 10. Cancelar TODAS las alertas de un usuario/fecha
POST http://localhost:3000/api/test/alertas/cancelar

```bash
curl -X POST http://localhost:3000/api/test/alertas/cancelar \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "fecha": "2025-08-08"
  }'
```

## TESTING CON POWERSHELL (Windows)

```powershell
# 1. Verificar estado
Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/status" -Method GET

# 2. Programar alerta manual de ENTRADA
$bodyEntrada = @{
    usuario_id = 1
    delay_minutos = 0.5
    tipo = "entrada"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/manual" -Method POST -Body $bodyEntrada -ContentType "application/json"

# 3. Programar alerta manual de SALIDA
$bodySalida = @{
    usuario_id = 1
    delay_minutos = 0.5
    tipo = "salida"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/manual" -Method POST -Body $bodySalida -ContentType "application/json"

# 4. Ver datos disponibles
Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/datos" -Method GET

# 5. Cancelar alerta específica
$bodyCancel = @{
    usuario_id = 1
    fecha = "2025-08-08"
    tipo = "entrada"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/test/alertas/cancelar" -Method POST -Body $bodyCancel -ContentType "application/json"
```

## TESTING DIRECTO CON NODE.JS

```bash
# Ejecutar script de testing
node run-tests.js

# O desde el directorio test
node test/test-alertas.js run
```

## MONITOREO EN TIEMPO REAL

Para monitorear los logs del sistema mientras testas:

```bash
# En Windows con PowerShell
Get-Content -Path ".\logs\server.log" -Wait

# O simplemente ejecuta el servidor y observa la consola
npm run dev
```

## SECUENCIA RECOMENDADA PARA TESTING

1. **Verificar datos disponibles:**
   ```bash
   curl -X GET http://localhost:3000/api/test/alertas/datos
   ```

2. **Verificar estado inicial:**
   ```bash
   curl -X GET http://localhost:3000/api/test/alertas/status
   ```

3. **Programar alerta de prueba (30 segundos):**
   ```bash
   curl -X POST http://localhost:3000/api/test/alertas/manual \
     -H "Content-Type: application/json" \
     -d '{"usuario_id": 1, "delay_minutos": 0.5}'
   ```

4. **Esperar 30 segundos y verificar:**
   - Revisa los logs del servidor
   - Verifica el email del usuario
   - Verifica estado de la cola nuevamente

5. **Limpiar después del test:**
   ```bash
   curl -X DELETE http://localhost:3000/api/test/alertas/limpiar
   ```

## NOTAS IMPORTANTES

- Asegúrate de que Redis esté ejecutándose
- Verifica que el servicio de email esté configurado
- Los logs aparecen en la consola del servidor
- Las alertas manuales se ejecutan inmediatamente según el delay especificado
- Los correos se envían a los emails reales de los usuarios en la base de datos
