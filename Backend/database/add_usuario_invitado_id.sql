-- Agregar columna usuario_invitado_id a la tabla solicitudes_usuarios
-- Esta columna almacena el ID del usuario de la tabla 'usuarios' cuando es una invitación pendiente
-- Una vez que el usuario acepta, se actualiza id_usuario_empresa con el ID de 'usuarios_empresas'

ALTER TABLE solicitudes_usuarios 
ADD COLUMN IF NOT EXISTS usuario_invitado_id INT NULL 
COMMENT 'ID del usuario general (tabla usuarios) cuando es invitación pendiente'
AFTER id_usuario_empresa;

-- Agregar índice para mejorar las búsquedas
ALTER TABLE solicitudes_usuarios 
ADD INDEX IF NOT EXISTS idx_usuario_invitado (usuario_invitado_id);

-- Agregar constraint de foreign key (opcional pero recomendado)
ALTER TABLE solicitudes_usuarios 
ADD CONSTRAINT fk_solicitudes_usuario_invitado 
FOREIGN KEY (usuario_invitado_id) REFERENCES usuarios(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;
