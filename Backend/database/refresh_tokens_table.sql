-- =====================================================
-- TABLA: refresh_tokens
-- =====================================================
-- Descripción: Almacena los refresh tokens para implementar
--              sesiones persistentes tipo Gmail (30 días)
-- =====================================================

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `token` TEXT NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `revoked` BOOLEAN DEFAULT FALSE,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    
    -- Índices para optimizar búsquedas
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_expires_at` (`expires_at`),
    INDEX `idx_revoked` (`revoked`),
    
    -- Relación con tabla usuarios
    FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMENTARIOS SOBRE LA TABLA
-- =====================================================
-- id: Identificador único del refresh token
-- user_id: ID del usuario al que pertenece el token (FK a usuarios)
-- token: El refresh token JWT completo (almacenado como TEXT)
-- expires_at: Fecha de expiración del token (30 días desde creación)
-- created_at: Timestamp de creación del registro
-- revoked: Indica si el token fue revocado manualmente (logout)
-- ip_address: Dirección IP desde donde se creó la sesión
-- user_agent: User-Agent del navegador/aplicación

-- =====================================================
-- VENTAJAS DE ESTE DISEÑO
-- =====================================================
-- 1. Permite revocar tokens específicos (logout individual)
-- 2. Permite revocar todos los tokens de un usuario (logout all devices)
-- 3. Rastrea sesiones activas con IP y user agent
-- 4. Limpieza automática de tokens expirados con job programado
-- 5. Protección adicional: el token debe existir en DB y no estar revocado

-- =====================================================
-- EJEMPLO DE USO
-- =====================================================
-- 1. Login: INSERT nuevo refresh token
-- 2. Refresh: SELECT para validar token
-- 3. Logout: UPDATE para marcar revoked = TRUE
-- 4. Cleanup job: DELETE tokens con expires_at < NOW()

-- =====================================================
-- ÍNDICES EXPLICADOS
-- =====================================================
-- idx_user_id: Para obtener todas las sesiones activas de un usuario
-- idx_expires_at: Para job de limpieza de tokens expirados
-- idx_revoked: Para filtrar tokens válidos vs revocados
