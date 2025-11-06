-- Tabla de Preferencias de Compensación de Horas Extras
-- Esta tabla almacena las preferencias de compensación para cada trabajador
-- Permite definir si prefiere pago en dinero, descanso o una combinación

CREATE TABLE preferencias_compensacion (
    id_preferencia INT AUTO_INCREMENT PRIMARY KEY,
    id_trabajador INT NOT NULL,
    tipo_compensacion ENUM('PAGO', 'DESCANSO', 'mixto') NOT NULL DEFAULT 'PAGO',
    porcentaje_pago DECIMAL(5,2) DEFAULT NULL, -- Porcentaje en pago si aplica para mixto (0-100)
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE DEFAULT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimizar búsquedas
    INDEX idx_id_trabajador (id_trabajador),
    INDEX idx_activo (activo),
    INDEX idx_fecha_inicio (fecha_inicio),
    
    -- Clave foránea hacia la tabla de usuarios
    CONSTRAINT fk_preferencias_trabajador FOREIGN KEY (id_trabajador) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_trabajador_activo ON preferencias_compensacion(id_trabajador, activo);

-- Comentarios para documentación
ALTER TABLE preferencias_compensacion COMMENT = 'Almacena las preferencias de compensación de horas extras por trabajador';
ALTER TABLE preferencias_compensacion MODIFY COLUMN tipo_compensacion COMMENT 'Tipo de compensación: PAGO (dinero), DESCANSO (días libres), mixto (combinación)';
ALTER TABLE preferencias_compensacion MODIFY COLUMN porcentaje_pago COMMENT 'Porcentaje de pago en caso de compensación mixta (0-100)';
ALTER TABLE preferencias_compensacion MODIFY COLUMN fecha_inicio COMMENT 'Fecha a partir de la cual la preferencia es válida';
ALTER TABLE preferencias_compensacion MODIFY COLUMN fecha_fin COMMENT 'Fecha hasta la cual es válida la preferencia (NULL = vigente indefinidamente)';
ALTER TABLE preferencias_compensacion MODIFY COLUMN activo COMMENT 'Indica si la preferencia está activa';

-- Ejemplo de inserción
-- INSERT INTO preferencias_compensacion (id_trabajador, tipo_compensacion, porcentaje_pago, fecha_inicio, activo)
-- VALUES (1, 'PAGO', NULL, CURDATE(), TRUE);

-- INSERT INTO preferencias_compensacion (id_trabajador, tipo_compensacion, porcentaje_pago, fecha_inicio, activo)
-- VALUES (2, 'mixto', 70.00, CURDATE(), TRUE);
