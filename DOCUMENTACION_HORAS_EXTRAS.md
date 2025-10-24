# Documentación: Sistema de Aprobación de Horas Extras

## 📋 Descripción General

Se ha implementado un sistema completo para la aprobación de horas extras desde el reporte de jornada diaria. Este sistema permite a las empresas identificar y aprobar horas extras trabajadas por sus empleados de manera eficiente.

## 🎯 Funcionalidades Implementadas

### Cálculo de Horas Extras

**Importante**: Las horas extras se calculan desde que termina el turno pactado hasta que el trabajador marcó su salida real.

**Ejemplo**:
- Turno pactado: 08:00 - 18:00
- Hora de salida real: 20:30
- **Horas extras**: Desde 18:00 hasta 20:30 = 2.5 horas

El sistema registra:
- `hora_inicio`: Hora de fin del turno pactado (18:00)
- `hora_fin`: Hora real de salida (20:30)
- `total_horas`: Calculado automáticamente por la BD (2.5)

### Backend

#### 1. Nuevo Controlador: `HorasExtrasController.js`
Ubicación: `Backend/controllers/HorasExtrasController.js`

**Métodos implementados:**
- `aprobarHorasExtras`: Aprueba horas extras para un trabajador específico
- `obtenerHorasExtrasPorEmpresa`: Obtiene todas las horas extras de una empresa
- `obtenerHorasExtrasPorTrabajador`: Obtiene horas extras de un trabajador específico
- `obtenerResumenHorasExtras`: Obtiene un resumen de horas extras por período

**Validaciones incluidas:**
- ✅ Verificación de permisos (solo empresa propietaria puede aprobar)
- ✅ Validación de datos requeridos
- ✅ Detección de solapamiento de registros de horas extras
- ✅ Registro en auditoría de todas las aprobaciones

#### 2. Nuevas Rutas
Archivo: `Backend/routes/UserEmpresa.js`

```javascript
// Rutas para gestión de horas extras
router.post('/horas-extras/aprobar', AuthService.verifyToken, HorasExtrasController.aprobarHorasExtras);
router.get('/horas-extras/empresa/:empresa_id', AuthService.verifyToken, HorasExtrasController.obtenerHorasExtrasPorEmpresa);
router.get('/horas-extras/trabajador/:usuario_empresa_id', AuthService.verifyToken, HorasExtrasController.obtenerHorasExtrasPorTrabajador);
router.get('/horas-extras/resumen/:empresa_id', AuthService.verifyToken, HorasExtrasController.obtenerResumenHorasExtras);
```

#### 3. Modelo Existente Utilizado
Se utiliza el modelo `HorasExtrasModel.js` existente que ya incluye:
- Tabla `horas_extras` en la base de datos
- Métodos para crear, actualizar y consultar registros
- Sistema de validación de solapamiento
- Cálculo automático de `total_horas`

### Frontend

#### 1. Servicio Actualizado: `EmpresaService.js`

**Nuevos métodos:**
```javascript
- aprobarHorasExtras(horasExtrasData)
- obtenerHorasExtrasPorEmpresa(empresaId)
- obtenerHorasExtrasPorTrabajador(usuarioEmpresaId)
- obtenerResumenHorasExtras(empresaId, fechaInicio, fechaFin)
```

#### 2. Composable Actualizado: `useEmpresa.js`

Se agregaron métodos wrapper para acceder a los servicios:
```javascript
- aprobarHorasExtras(horasExtrasData)
- obtenerHorasExtrasPorEmpresa()
- obtenerHorasExtrasPorTrabajador(usuarioEmpresaId)
```

#### 3. Componente Vue Mejorado: `ReporteJornadaDiaria.vue`

**Nuevas características:**

1. **Columna de Acciones en la Tabla**
   - Botón "Aprobar H. Extras" (solo visible cuando hay tiempo extra positivo)
   - Indicador visual cuando las horas ya están aprobadas
   - Estados claros con íconos SVG

2. **Modal de Aprobación**
   - Muestra información detallada del trabajador
   - Despliega fecha, turno, jornada pactada
   - Resalta las horas extras a aprobar
   - Campo opcional para agregar motivo
   - Validación de datos antes de enviar

3. **Datos Extendidos en Registros**
   ```javascript
   - usuario_empresa_id: ID necesario para la aprobación
   - asignacion_turno_id: Referencia al turno asignado
   - marcacion_id: Referencia a la marcación de entrada
   - horasExtrasAprobadas: Flag para controlar estado de aprobación
   ```

## 🔐 Seguridad

### Validaciones de Seguridad Implementadas:

1. **Autenticación**: Token JWT requerido en todas las peticiones
2. **Autorización**: Verificación de que el usuario pertenece a la empresa
3. **Validación de Datos**: Campos requeridos validados en backend
4. **Auditoría**: Registro de todas las aprobaciones en tabla de auditoría
5. **Prevención de Duplicados**: Validación de solapamiento de horarios

## 📊 Flujo de Aprobación

```
1. Usuario visualiza el Reporte de Jornada Diaria
   ↓
2. Sistema identifica registros con tiempo extra positivo
   ↓
3. Aparece botón "Aprobar H. Extras" en columna de Acciones
   ↓
4. Usuario hace clic en el botón
   ↓
5. Se abre modal con información detallada
   ↓
6. Usuario puede agregar motivo (opcional)
   ↓
7. Usuario confirma aprobación
   ↓
8. Sistema valida permisos y datos
   ↓
9. Se crea registro en tabla horas_extras con estado 'APROBADA'
   ↓
10. Se registra en auditoría
   ↓
11. Se actualiza UI mostrando estado "Aprobadas"
```

## 💾 Estructura de Datos

### Tabla: `horas_extras`

```sql
CREATE TABLE horas_extras (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_empresa_id INT NOT NULL,
    asignacion_turno_id INT,
    marcacion_id INT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    total_horas DECIMAL(5,2) AS (TIMESTAMPDIFF(MINUTE, hora_inicio, hora_fin) / 60) STORED,
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA') DEFAULT 'PENDIENTE',
    motivo TEXT,
    aprobado_por INT,
    fecha_aprobacion DATETIME,
    tipo_compensacion ENUM('PAGO', 'DESCANSO') DEFAULT 'PAGO',
    dias_descanso_equivalentes DECIMAL(3,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_empresa_id) REFERENCES usuarios_empresas(id),
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id)
);
```

### Objeto de Aprobación (Request):

```javascript
{
  usuario_empresa_id: 123,           // ID del trabajador (usuario_empresa)
  fecha: "2025-10-24",              // Fecha de las horas extras
  hora_inicio: "18:00:00",          // Hora de FIN del turno pactado (cuando empiezan las horas extras)
  hora_fin: "20:30:00",             // Hora de salida REAL del trabajador
  motivo: "Horas extras por...",    // Motivo (opcional)
  asignacion_turno_id: 456,         // ID asignación turno (opcional)
  marcacion_id: 789                 // ID marcación (opcional)
}
```

**Nota importante**: 
- `hora_inicio` NO es la hora de entrada del trabajador, es la hora de FIN del turno pactado
- `hora_fin` es la hora real de salida marcada por el trabajador
- Las horas extras se calculan como: `hora_fin - hora_inicio`

### Respuesta de Aprobación:

```javascript
{
  success: true,
  message: "Horas extras aprobadas exitosamente",
  data: {
    id: 1,
    usuario_empresa_id: 123,
    fecha: "2025-10-24",
    hora_inicio: "18:00:00",  // Fin del turno pactado
    hora_fin: "20:30:00",     // Salida real
    total_horas: 2.50,        // Calculado automáticamente (2.5 horas)
    estado: "APROBADA",
    motivo: "Horas extras por...",
    aprobado_por: 10,
    fecha_aprobacion: "2025-10-24T15:30:00",
    tipo_compensacion: "PAGO",
    created_at: "2025-10-24T15:30:00",
    updated_at: "2025-10-24T15:30:00"
  }
}
```

## 🎨 UI/UX

### Estados Visuales:

1. **Botón Aprobar** (cuando hay horas extras sin aprobar):
   - Color: Azul (bg-blue-600)
   - Ícono: Reloj
   - Texto: "Aprobar H. Extras"

2. **Estado Aprobado**:
   - Color: Verde (bg-green-100, text-green-700)
   - Ícono: Check en círculo
   - Texto: "Aprobadas"

3. **Sin Horas Extras**:
   - Texto: "--" en gris claro

### Modal de Aprobación:

- Título: "Aprobar Horas Extras"
- Ícono: Reloj azul
- Información destacada en panel azul
- Botones: "Aprobar Horas Extras" (azul) y "Cancelar" (gris)
- Loading state durante procesamiento

## 🧪 Pruebas Recomendadas

### Backend:
1. ✅ Aprobar horas extras con datos válidos
2. ✅ Validar que solo la empresa propietaria pueda aprobar
3. ✅ Verificar detección de solapamiento
4. ✅ Probar con campos opcionales (motivo, asignacion_turno_id, marcacion_id)
5. ✅ Verificar registro en auditoría

### Frontend:
1. ✅ Verificar que el botón solo aparezca cuando hay tiempo extra positivo
2. ✅ Probar apertura y cierre del modal
3. ✅ Validar envío de formulario con y sin motivo
4. ✅ Verificar actualización de UI después de aprobar
5. ✅ Probar manejo de errores

## 📝 Logs y Debugging

El sistema incluye logs detallados:

```javascript
// Backend
console.log('🚀 Aprobando horas extras:', horasExtrasData)
console.log('✅ Horas extras aprobadas:', response.data)
console.error('❌ Error aprobando horas extras:', error)

// Frontend
console.log('📤 Enviando datos de aprobación:', horasExtrasData)
console.log('✅ Horas extras aprobadas exitosamente')
console.error('❌ Error al aprobar horas extras:', error)
```

## 🚀 Próximas Mejoras Sugeridas

1. **Notificaciones**:
   - Enviar email al trabajador cuando sus horas extras son aprobadas
   - Notificaciones push en la aplicación

2. **Reportes**:
   - Generar reporte mensual de horas extras aprobadas
   - Exportar horas extras a Excel/PDF

3. **Gestión Avanzada**:
   - Ver historial de horas extras por trabajador
   - Estadísticas de horas extras por departamento
   - Dashboard con métricas de horas extras

4. **Compensación**:
   - Implementar tipo de compensación por descanso
   - Calcular días de descanso equivalentes automáticamente

5. **Workflow**:
   - Sistema de aprobación multinivel
   - Solicitud de horas extras por parte del trabajador

## 📞 Soporte

Para problemas o consultas sobre este sistema:
1. Revisar los logs en consola del navegador y servidor
2. Verificar permisos de usuario
3. Validar que la tabla `horas_extras` exista en la base de datos
4. Comprobar que las rutas estén correctamente registradas

---

**Última actualización**: 24 de Octubre, 2025
**Versión**: 1.0.0
