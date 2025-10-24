-- ================================================
-- MÓDULO DE JUSTIFICACIONES DE AUSENCIAS
-- Compatible con base de datos ControlAsistencia
-- ================================================

-- Tabla principal: solicitud de justificación o permiso
CREATE TABLE IF NOT EXISTS `justificaciones_ausencias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_empresa_id` INT NOT NULL,   -- trabajador que justifica
  `fecha_inicio` DATE NOT NULL,        -- inicio del periodo
  `fecha_fin` DATE NOT NULL,           -- fin del periodo
  `tipo_justificacion` ENUM(
    'licencia_medica',
    'permiso_personal',
    'permiso_administrativo',
    'vacaciones',
    'otro'
  ) NOT NULL,
  `motivo` TEXT NULL,                  -- descripción o comentario
  `archivo_url` VARCHAR(500) NULL,     -- enlace al documento de respaldo
  `archivo_nombre` VARCHAR(255) NULL,  -- nombre original del archivo
  `estado` ENUM('PENDIENTE','APROBADA','RECHAZADA') 
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
  `aprobado_por` INT NULL,             -- usuario que aprueba (RRHH, admin, etc.)
  `fecha_solicitud` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_aprobacion` DATETIME NULL,
  `observaciones` TEXT NULL,           -- comentarios del aprobador
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),

  INDEX `idx_usuario_empresa` (`usuario_empresa_id`),
  INDEX `idx_estado` (`estado`),
  INDEX `idx_tipo` (`tipo_justificacion`),
  INDEX `idx_fechas` (`fecha_inicio`, `fecha_fin`),

  CONSTRAINT `fk_justificacion_usuario_empresa`
    FOREIGN KEY (`usuario_empresa_id`) 
    REFERENCES `usuarios_empresas`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,

  CONSTRAINT `fk_justificacion_aprobador`
    FOREIGN KEY (`aprobado_por`) 
    REFERENCES `usuarios`(`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Solicitudes de justificación de ausencias, permisos o vacaciones';
  

-- Tabla auxiliar: días individuales justificados (útil para reportes de asistencia)
CREATE TABLE IF NOT EXISTS `justificaciones_dias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `justificacion_id` INT NOT NULL,
  `usuario_empresa_id` INT NOT NULL,
  `fecha` DATE NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_fecha` (`usuario_empresa_id`, `fecha`),
  INDEX `idx_fecha` (`fecha`),

  CONSTRAINT `fk_jd_justificacion`
    FOREIGN KEY (`justificacion_id`) 
    REFERENCES `justificaciones_ausencias`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,

  CONSTRAINT `fk_jd_usuario_empresa`
    FOREIGN KEY (`usuario_empresa_id`) 
    REFERENCES `usuarios_empresas`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Días específicos justificados para excluir del cálculo de asistencia';

