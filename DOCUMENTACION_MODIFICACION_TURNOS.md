# Funcionalidad de Modificación de Turnos

## Descripción General

La funcionalidad de modificación de turnos permite a los administradores cambiar el turno asignado a un trabajador sin eliminar el registro histórico del turno anterior. Cuando se modifica un turno:

1. **El turno anterior se invalida**: Se marca con estado `'modificado'` y se le asigna una fecha_fin (fecha actual).
2. **Se crea un nuevo turno**: Con los nuevos datos proporcionados y estado `'activo'`.
3. **Se mantiene el historial**: Ambos registros quedan en la base de datos para auditoría.

## Backend

### Modelo: `AsignacionTurnosModel.js`

#### Método: `modificarTurno(turnoId, nuevosDatos)`

```javascript
/**
 * Modifica un turno existente invalidando el anterior y creando uno nuevo
 * @param {number} turnoId - ID del turno a modificar
 * @param {object} nuevosDatos - Datos del nuevo turno
 * @returns {object} - { turnoAnteriorId, nuevoTurnoId, turnoAnterior }
 */
```

**Proceso:**
1. Obtiene el turno actual de la base de datos
2. Inicia una transacción
3. Invalida el turno actual (estado = 'modificado', fecha_fin = hoy)
4. Crea un nuevo turno con los datos actualizados
5. Confirma la transacción
6. Retorna los IDs de ambos turnos

### Controlador: `UserEmpresaController.js`

#### Endpoint: `PUT /userEmpresa/turnos/:id`

**Validaciones:**
- ID de turno válido
- Tipo de turno requerido
- La asignación existe
- El estado del turno es 'activo' (solo se pueden modificar turnos activos)
- El nuevo tipo de turno existe

**Auditoría:**
- Registra en la tabla `auditoria` la modificación con:
  - Datos anteriores (turno original)
  - Datos nuevos (nuevo turno)
  - Usuario que realizó el cambio
  - Timestamp y IP

### Rutas: `UserEmpresa.js`

```javascript
router.put('/turnos/:id', AuthService.verifyToken, UserEmpresaController.updateTurno);
```

## Frontend

### Servicio: `EmpresaService.js`

```javascript
static async updateTurno(turnoId, nuevosDatos) {
  const response = await apiClient.put(`/userEmpresa/turnos/${turnoId}`, nuevosDatos);
  return response.data;
}
```

### Composable: `useEmpresa.js`

```javascript
const modificarTurno = async (turnoId, nuevosDatos) => {
  const response = await EmpresaServices.updateTurno(turnoId, nuevosDatos);
  return response;
};
```

### Componente: `ControlTurnos.vue`

#### Modal de Modificación

El modal muestra:
- Nombre del trabajador
- Turno actual asignado
- Selector de nuevo tipo de turno
- Fecha de inicio del nuevo turno
- Fecha de fin (opcional)
- Advertencia sobre la invalidación del turno anterior

#### Funciones principales:

```javascript
// Abre el modal con los datos del turno a modificar
const abrirModalModificarTurno = (turno) => { ... }

// Cierra el modal y limpia el formulario
const cerrarModalModificarTurno = () => { ... }

// Guarda la modificación del turno
const guardarModificacionTurno = async () => { ... }
```

## Flujo de Uso

1. **Usuario selecciona "Modificar"** en un turno activo de la tabla
2. **Se abre el modal** mostrando información del turno actual
3. **Usuario selecciona** nuevo tipo de turno y fechas
4. **Sistema valida** los datos ingresados
5. **Backend procesa** la modificación:
   - Invalida turno anterior
   - Crea nuevo turno
   - Registra en auditoría
6. **Frontend actualiza** la lista de turnos
7. **Usuario ve** el nuevo turno en la tabla

## Base de Datos

### Estados de Turno

La tabla `asignacion_turnos` soporta los siguientes estados:

- `activo`: Turno vigente actualmente
- `finalizado`: Turno que terminó naturalmente (por fecha_fin o eliminación)
- `suspendido`: Turno pausado temporalmente
- `modificado`: Turno que fue reemplazado por una modificación (NUEVO)

### Columnas Relevantes

```sql
CREATE TABLE asignacion_turnos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_empresa_id INT NOT NULL,
  tipo_turno_id INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  estado ENUM('activo', 'finalizado', 'suspendido', 'modificado') DEFAULT 'activo',
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- ... otras columnas
);
```

## Ventajas de este Enfoque

1. **Historial completo**: No se pierde información de turnos anteriores
2. **Auditoría robusta**: Todos los cambios quedan registrados
3. **Rollback simple**: Se puede reactivar un turno anterior si es necesario
4. **Reportes precisos**: Los reportes históricos mantienen su integridad
5. **Cumplimiento normativo**: Facilita auditorías laborales

## Consideraciones

- Solo se pueden modificar turnos con estado `'activo'`
- El turno anterior se marca como `'modificado'` (no `'finalizado'`)
- La fecha_fin del turno anterior se establece en la fecha actual
- El nuevo turno mantiene el mismo `usuario_empresa_id`
- La fecha de inicio del nuevo turno puede ser inmediata o futura
- Las modificaciones quedan registradas en la tabla de auditoría

## Ejemplos de Uso

### Cambiar de turno mañana a turno tarde

```javascript
await modificarTurno(123, {
  tipo_turno_id: 5, // ID del turno tarde
  fecha_inicio: '2025-10-25',
  fecha_fin: null // Indefinido
});
```

### Cambiar a turno temporal

```javascript
await modificarTurno(123, {
  tipo_turno_id: 8, // ID del turno temporal
  fecha_inicio: '2025-10-25',
  fecha_fin: '2025-11-30' // Hasta fin de mes
});
```

## Mensajes de Error

- **400**: ID de turno inválido
- **400**: El tipo de turno es requerido
- **400**: Solo se pueden modificar turnos activos
- **404**: Asignación de turno no encontrada
- **404**: Tipo de turno no encontrado
- **500**: Error interno del servidor

## Testing

Para probar la funcionalidad:

1. Crear un trabajador
2. Asignar un turno inicial
3. Modificar el turno con nuevos datos
4. Verificar que:
   - El turno anterior tiene estado 'modificado'
   - El nuevo turno está activo
   - Las fechas son correctas
   - La auditoría registró el cambio
