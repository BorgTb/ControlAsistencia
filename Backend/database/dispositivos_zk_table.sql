-- =====================================================
-- TABLA: dispositivos_zk
-- =====================================================
-- Descripción: Almacena los dispositivos ZK de control de asistencia
--              relacionados con cada empresa
-- =====================================================

CREATE TABLE IF NOT EXISTS `dispositivos_zk` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `serial` VARCHAR(100) NOT NULL UNIQUE,
    `nombre` VARCHAR(255) NOT NULL,
    `ubicacion` VARCHAR(255) NULL,
    `empresa_id` INT NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `puerto` INT DEFAULT 4370,
    `activo` BOOLEAN DEFAULT TRUE,
    `auto_detectado` BOOLEAN DEFAULT FALSE,
    `ultimo_estado` ENUM('online', 'offline', 'unknown') DEFAULT 'unknown',
    `ultima_conexion` DATETIME NULL,
    `configuracion` JSON NULL COMMENT 'Configuración adicional del dispositivo (timezone, firmware, etc)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimizar búsquedas
    INDEX `idx_empresa_id` (`empresa_id`),
    INDEX `idx_serial` (`serial`),
    INDEX `idx_activo` (`activo`),
    INDEX `idx_ultimo_estado` (`ultimo_estado`),
    
    -- Relación con tabla empresa
    FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`empresa_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMENTARIOS SOBRE LA TABLA
-- =====================================================
-- id: Identificador único del dispositivo
-- serial: Número de serie único del dispositivo ZK
-- nombre: Nombre descriptivo asignado al dispositivo
-- ubicacion: Ubicación física del dispositivo (ej: "Entrada Principal", "Área Producción")
-- empresa_id: ID de la empresa a la que pertenece el dispositivo
-- ip_address: Dirección IP del dispositivo (si es conocida)
-- puerto: Puerto de comunicación (por defecto 4370 para ZK)
-- activo: Indica si el dispositivo está activo/habilitado
-- auto_detectado: Indica si el dispositivo fue detectado automáticamente vía MQTT
-- ultimo_estado: Último estado conocido del dispositivo (online/offline/unknown)
-- ultima_conexion: Fecha y hora de la última conexión exitosa
-- configuracion: JSON con configuración adicional (zona horaria, versión firmware, etc)
-- created_at: Fecha de registro del dispositivo
-- updated_at: Fecha de última actualización
-- =====================================================
