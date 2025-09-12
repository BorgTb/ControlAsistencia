# Sistema de Reportes de Marcaciones

## Descripción
Se ha implementado un sistema completo de reportes para marcaciones que permite a los usuarios reportar problemas con sus registros de asistencia.

## Archivos Creados/Modificados

### 1. Modal de Reporte
**Archivo:** `Frontend/src/components/modals/ReporteModal.vue`
- Modal completo para reportar problemas de marcaciones
- Formulario con validación
- Soporte para adjuntar archivos
- Diferentes tipos de problemas predefinidos
- Campos opcionales para datos correctos

### 2. Servicio de Reportes
**Archivo:** `Frontend/src/services/ReportesService.js`
- Servicio completo para manejar reportes
- Soporte para envío con archivos (multipart/form-data)
- CRUD completo de reportes
- Manejo de errores y autenticación

### 3. Composable de Reportes
**Archivo:** `Frontend/src/composables/useReportes.js`
- Lógica reutilizable para manejar reportes
- Estado reactivo global
- Métodos para CRUD de reportes
- Utilidades para formateo y UI

### 4. Historial de Usuario (Modificado)
**Archivo:** `Frontend/src/components/vistas/HistorialUsuario.vue`
- Agregado botón "Reportar" en cada fila
- Integración con modal de reporte
- Nueva columna "Acciones" en la tabla

## Endpoints del Backend

⚠️ **IMPORTANTE: Configurar estos endpoints en tu backend**

Los siguientes endpoints están configurados y deben ser implementados en el backend:

### Endpoint Principal
```
POST /api/user/reportes/
```
**Descripción:** Enviar un nuevo reporte de marcación
**Content-Type:** 
- `application/json` (sin archivos)
- `multipart/form-data` (con archivos)

**Payload esperado:**
```json
{
  "marcacion_id": 123,
  "tipo_problema": "hora_incorrecta",
  "prioridad": "media",
  "descripcion": "La hora registrada no coincide con la hora real...",
  "fecha_correcta": "2024-01-15", // opcional
  "hora_correcta": "08:30", // opcional
  "archivos": [...] // array de archivos (solo en multipart)
}
```

### Endpoints Adicionales (Opcionales)
```
GET /api/user/reportes/                    - Obtener reportes del usuario
GET /api/user/reportes/:id                 - Obtener reporte específico
PUT /api/user/reportes/:id                 - Actualizar reporte
POST /api/user/reportes/:id/cancelar       - Cancelar reporte
GET /api/user/reportes/estadisticas        - Estadísticas de reportes
```

## Configuración Requerida

### 1. Cambiar URL Base del API (si es necesario)
**Archivo:** `Frontend/src/services/ReportesService.js`
**Líneas:** 7-14
```javascript
const API_BASE_URL = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
})()
```

### 2. Ajustar Endpoints Específicos
**Archivo:** `Frontend/src/services/ReportesService.js`
Buscar comentarios `// TODO: Cambiar este endpoint según la estructura de tu API`

Ejemplo de cambios necesarios:
```javascript
// Cambiar de:
const response = await apiClient.post('/user/reportes/', formData)

// A (si tu API es diferente):
const response = await apiClient.post('/reportes/crear', formData)
```

### 3. Configurar Variables de Entorno
**Archivo:** `.env` (en la raíz del proyecto Frontend)
```
VITE_API_URL=http://tu-dominio.com/api
```

## Tipos de Problemas Disponibles

El modal incluye los siguientes tipos de problemas predefinidos:
- `hora_incorrecta` - Hora incorrecta
- `tipo_incorrecto` - Tipo de marcación incorrecto
- `ubicacion_incorrecta` - Ubicación incorrecta
- `marcacion_duplicada` - Marcación duplicada
- `marcacion_faltante` - Marcación faltante
- `error_sistema` - Error del sistema
- `otro` - Otro

## Niveles de Prioridad
- `baja` - Baja
- `media` - Media (por defecto)
- `alta` - Alta
- `critica` - Crítica

## Uso del Sistema

### Para reportar una marcación:
1. Ir al "Historial de Marcaciones"
2. Hacer clic en el botón "Reportar" de la marcación deseada
3. Completar el formulario del modal
4. Opcionalmente adjuntar archivos de evidencia
5. Enviar el reporte

### Estados del reporte:
- `pendiente` - Recién enviado, esperando revisión
- `procesado` - En revisión por el equipo
- `resuelto` - Problema solucionado
- `cancelado` - Cancelado por el usuario
- `rechazado` - Rechazado por el equipo

## Archivos Adjuntos

### Formatos soportados:
- Imágenes: JPG, JPEG, PNG
- Documentos: PDF, DOC, DOCX

### Límites:
- Tamaño máximo por archivo: 5MB
- Múltiples archivos permitidos

## Notificaciones

Actualmente el sistema muestra alertas básicas. Se recomienda integrar con un sistema de notificaciones más sofisticado como:
- Toast notifications
- Notificaciones push
- Emails de confirmación

## Próximos Pasos

1. **Implementar endpoints en el backend**
2. **Configurar URLs según tu estructura de API**
3. **Probar funcionalidad completa**
4. **Agregar sistema de notificaciones mejorado**
5. **Implementar panel de administración para gestionar reportes**

## Notas de Desarrollo

- El composable `useReportes` mantiene estado global reactivo
- Los archivos se envían usando FormData para soporte multipart
- Validación tanto en frontend como backend recomendada
- Sistema preparado para internacionalización (i18n) si es necesario
