# Documentación: Sistema de Notificación de Amonestaciones con PDF

## Descripción General

El sistema de notificación de amonestaciones permite enviar automáticamente un correo electrónico al trabajador amonestado con un documento PDF adjunto que contiene todos los detalles de la amonestación.

## Flujo de Funcionamiento

### 1. Creación de Amonestación

Cuando se crea una nueva amonestación a través del endpoint `POST /api/amonestaciones`, el sistema:

1. **Valida** los datos recibidos (trabajadorId, tipoFalta, tipoSancion)
2. **Crea** el registro en la base de datos
3. **Registra** la acción en auditoría
4. **Genera** automáticamente un PDF con los detalles de la amonestación
5. **Envía** un correo electrónico al trabajador con el PDF adjunto
6. **Elimina** el archivo temporal del PDF

### 2. Generación del PDF

El servicio `PDFService` se encarga de generar un documento profesional en formato PDF que incluye:

#### Contenido del PDF:

- **Encabezado**: Título "CARTA DE AMONESTACIÓN" con número de documento
- **Información de la Empresa**: Nombre y RUT de la empresa
- **Información del Trabajador**: 
  - Nombre completo
  - RUT
  - Cargo (si aplica)
  - Área/Departamento (si aplica)
- **Detalles de la Amonestación**:
  - Fecha del hecho
  - Tipo de falta
  - Tipo de sanción
  - Monto de multa (si aplica)
  - Supervisor responsable (si aplica)
- **Descripción Detallada**: Narrativa completa de los hechos
- **Norma Infringida**: Reglamento o norma vulnerada (si aplica)
- **Plazo para Descargos**: Fecha límite para presentar descargos (destacado en rojo)
- **Observaciones RRHH**: Comentarios adicionales (si aplican)
- **Firmas**: Espacios para firma del empleador y del trabajador
- **Pie de Página**: Fecha y hora de generación del documento

#### Características del PDF:

- Tamaño: Carta (Letter)
- Formato profesional con colores corporativos
- Bloques de información claramente diferenciados
- RUTs formateados con puntos y guion
- Fechas en formato español largo
- Líneas divisoras para mejor legibilidad
- Información de generación automática en el pie de página

### 3. Envío de Notificación por Correo

El servicio `NotificacionService` y `MailService` manejan el envío del correo:

#### Contenido del Correo:

- **Asunto**: "Notificación de Amonestación - [Nombre Empresa]"
- **Encabezado**: Diseño visual con icono de advertencia ⚠️
- **Saludo Personalizado**: Con nombre completo del trabajador
- **Bloques de Información**:
  - Datos del trabajador (con colores diferenciados)
  - Detalles de la amonestación (fondo rojizo)
  - Información de la empresa (fondo morado)
  - Plazo para descargos (fondo amarillo, destacado)
- **Adjunto**: PDF de la amonestación con nombre descriptivo
- **Pie de Página**: Información del sistema y año

#### Características del Correo:

- HTML responsivo
- Diseño profesional con CSS inline
- Colores diferenciados por tipo de información
- RUTs y fechas formateados
- Advertencia destacada sobre plazo de descargos
- Archivo PDF adjunto con nombre descriptivo: `Amonestacion_[ID]_[RUT].pdf`

## Estructura de Archivos

### Servicios Creados/Modificados:

```
Backend/
├── services/
│   ├── PDFService.js          # Genera PDFs de amonestaciones
│   ├── MailService.js         # Método enviarNotificacionAmonestacion()
│   └── NotificacionService.js # Método enviarNotificacionAmonestacion()
├── controllers/
│   └── AmonestacionesController.js # Modificado para enviar notificación
└── temp/                      # Carpeta temporal para PDFs (auto-creada)
```

## Dependencias

### Paquetes NPM necesarios:

```json
{
  "pdfkit": "^0.15.0",        // Generación de PDFs
  "nodemailer": "^7.0.5"      // Envío de correos (ya existente)
}
```

## Uso

### Crear una Amonestación:

**Endpoint**: `POST /api/amonestaciones`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**:
```json
{
  "trabajadorId": 123,
  "cargo": "Desarrollador Senior",
  "areaDepartamento": "Tecnología",
  "empresaEmpleadoraRut": "76123456-7",
  "supervisorResponsable": "Juan Pérez",
  "tipoFalta": "LEVE",
  "fechaHecho": "2025-10-20",
  "descripcionDetallada": "El trabajador llegó 30 minutos tarde sin justificación previa...",
  "normaInfringida": "Artículo 54 del Reglamento Interno de Orden, Higiene y Seguridad",
  "tipoSancion": "AMONESTACION_ESCRITA",
  "montoMulta": null,
  "observacionesRRHH": "Primera amonestación del trabajador",
  "plazoDescargos": "2025-10-30",
  "archivosAdjuntos": []
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "message": "Amonestación registrada exitosamente",
  "data": {
    "id": 45
  }
}
```

### Proceso Automático:

Tras recibir la respuesta, el sistema automáticamente:

1. ✅ Genera el PDF de la amonestación
2. ✅ Guarda temporalmente el archivo
3. ✅ Envía el correo al trabajador con el PDF adjunto
4. ✅ Elimina el archivo temporal
5. ✅ Registra el proceso en los logs del servidor

## Manejo de Errores

### Errores en Generación de PDF:

Si falla la generación del PDF, el error se registra en los logs pero **no afecta** la creación de la amonestación. El registro se guarda correctamente en la base de datos.

### Errores en Envío de Correo:

Si falla el envío del correo (por ejemplo, por problemas de conexión SMTP), el error se registra en los logs pero **no afecta** la creación de la amonestación.

**Log de error típico**:
```
⚠️ Error enviando notificación: Error de conexión con el servicio de correo
```

### Errores en Proceso Completo:

```javascript
try {
    // Proceso de notificación
} catch (errorNotificacion) {
    console.error('⚠️ Error en proceso de notificación:', errorNotificacion);
    // No se detiene la respuesta principal
}
```

## Configuración Requerida

### Variables de Entorno (.env):

```env
# Configuración de correo (ya existente)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion
MAIL_FROM_NAME=Sistema de Control de Asistencia
MAIL_FROM_ADDRESS=tu_correo@gmail.com
```

### Permisos de Directorio:

Asegurar que el servidor tenga permisos de escritura en:
- `/Backend/temp/` - Para guardar PDFs temporales

## Logs y Monitoreo

### Logs Exitosos:

```
📝 Creando amonestación: {...}
✅ Amonestación creada con ID: 45
✅ Notificación de amonestación enviada: <mensaje-id>
✅ Notificación de amonestación enviada exitosamente
```

### Logs de Advertencia:

```
⚠️ Usuario empresa no encontrado para enviar notificación
⚠️ Error enviando notificación: <mensaje-error>
⚠️ Error en proceso de notificación: <stack-trace>
```

### Logs de Error:

```
❌ Error creando amonestación: <mensaje-error>
❌ Error enviando notificación de amonestación: <mensaje-error>
```

## Seguridad

### Datos Sensibles:

- Los PDFs se generan y eliminan inmediatamente después del envío
- No se almacenan copias permanentes de los PDFs en el servidor
- Los archivos temporales se crean con nombres únicos por amonestación
- El acceso al endpoint requiere autenticación JWT

### Auditoría:

Cada amonestación se registra en la tabla de auditoría con:
- Usuario que creó la amonestación
- Timestamp de creación
- Datos completos de la amonestación
- IP del solicitante

## Consideraciones Adicionales

### Archivos Temporales:

La carpeta `/Backend/temp/` está incluida en `.gitignore` y se limpia automáticamente después de cada envío. En casos excepcionales donde el proceso falle antes de eliminar el archivo, se puede implementar un cron job para limpiar archivos antiguos:

```javascript
// En jobs/CleanupTemp.js
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

// Limpiar archivos temporales cada día a las 2 AM
cron.schedule('0 2 * * *', () => {
    const tempDir = path.join(__dirname, '../temp');
    // Eliminar archivos más antiguos de 24 horas
});
```

### Personalización del PDF:

Para personalizar el diseño del PDF, modificar `/Backend/services/PDFService.js`:

- Colores: Buscar `fillColor('#hexcode')`
- Fuentes: Buscar `font('Helvetica-Bold')`
- Tamaños: Buscar `fontSize(10)`
- Márgenes: Modificar en `new PDFDocument()`

### Personalización del Correo:

Para personalizar el diseño del correo, modificar el método `enviarNotificacionAmonestacion()` en `/Backend/services/MailService.js`:

- Estilos CSS: Dentro de la etiqueta `<style>`
- Contenido HTML: Dentro de `contenidoHTML`
- Asunto: Variable `asunto`

## Testing

### Probar Generación de PDF:

```javascript
import PDFService from './services/PDFService.js';

const amonestacion = { /* datos de prueba */ };
const trabajador = { /* datos de prueba */ };
const empresa = { /* datos de prueba */ };

const pdfBuffer = await PDFService.generarPDFAmonestacion(
    amonestacion,
    trabajador,
    empresa
);

// Guardar para inspección
await PDFService.guardarPDFTemporal(pdfBuffer, 'test.pdf');
```

### Probar Envío de Correo:

```javascript
import NotificacionService from './services/NotificacionService.js';

const resultado = await NotificacionService.enviarNotificacionAmonestacion(
    trabajador,
    amonestacion,
    empresa,
    '/path/to/test.pdf'
);

console.log('Resultado:', resultado);
```

## Soporte

Para problemas o consultas:
- Revisar logs del servidor
- Verificar configuración de correo en `.env`
- Asegurar permisos de directorio `/temp/`
- Validar que el trabajador tenga un email válido en la base de datos
