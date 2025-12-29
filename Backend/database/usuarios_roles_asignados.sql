-- =====================================================
-- Tabla: usuarios_roles_asignados
-- Descripción: Relación muchos-a-muchos entre usuarios_empresas y roles_sistema
--              Permite que un usuario tenga múltiples roles en una empresa
-- =====================================================

CREATE TABLE IF NOT EXISTS `usuarios_roles_asignados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_empresa_id` int NOT NULL COMMENT 'FK a usuarios_empresas',
  `rol_sistema_id` int NOT NULL COMMENT 'FK a roles_sistema',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de asignación del rol',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_rol` (`usuario_empresa_id`, `rol_sistema_id`) COMMENT 'Evita duplicados de rol para mismo usuario-empresa',
  KEY `idx_usuario_empresa` (`usuario_empresa_id`),
  KEY `idx_rol_sistema` (`rol_sistema_id`),
  CONSTRAINT `fk_rol_sistema` FOREIGN KEY (`rol_sistema_id`) REFERENCES `roles_sistema` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rol_usuario_empresa` FOREIGN KEY (`usuario_empresa_id`) REFERENCES `usuarios_empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Asignación de roles a usuarios en contexto de empresa';
