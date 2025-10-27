-- Actualización para soportar modificación de turnos
-- El campo 'estado' de asignacion_turnos ahora puede tener los siguientes valores:
-- 'activo': Turno actualmente vigente
-- 'finalizado': Turno terminado naturalmente
-- 'modificado': Turno que fue reemplazado por una modificación

-- Verificar que el campo estado existe y puede contener el nuevo valor
ALTER TABLE asignacion_turnos 
MODIFY COLUMN estado ENUM('activo', 'finalizado', 'suspendido', 'modificado') DEFAULT 'activo';

-- Agregar índice para mejorar búsquedas de turnos activos
CREATE INDEX IF NOT EXISTS idx_asignacion_estado ON asignacion_turnos(estado);

-- Agregar columna de fecha_actualizacion si no existe
ALTER TABLE asignacion_turnos 
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Comentarios de las columnas
ALTER TABLE asignacion_turnos 
MODIFY COLUMN estado ENUM('activo', 'finalizado', 'suspendido', 'modificado') DEFAULT 'activo' 
COMMENT 'Estado del turno: activo=vigente, finalizado=terminado, suspendido=pausado, modificado=reemplazado por modificación';
