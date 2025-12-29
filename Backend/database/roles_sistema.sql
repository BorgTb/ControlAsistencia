-- =====================================================
-- Tabla: roles_sistema
-- Descripción: Catálogo maestro de roles del sistema
-- =====================================================

CREATE TABLE IF NOT EXISTS `roles_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL COMMENT 'Nombre descriptivo del rol',
  `slug` varchar(50) NOT NULL COMMENT 'Identificador único para uso programático',
  `descripcion` varchar(255) DEFAULT NULL COMMENT 'Descripción detallada del rol',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Catálogo de roles disponibles en el sistema';

-- =====================================================
-- Datos iniciales: Roles del sistema
-- =====================================================

INSERT INTO `roles_sistema` (`nombre`, `slug`, `descripcion`) VALUES
('Administrador', 'admin', 'Administrador del sistema con acceso completo'),
('Empleador', 'empleador', 'Gestión de empresa, trabajadores y reportes'),
('Fiscalizador', 'fiscalizador', 'Supervisión y auditoría de empresas'),
('Trabajador', 'trabajador', 'Registro de asistencia y consulta de marcaciones')
ON DUPLICATE KEY UPDATE 
  `nombre` = VALUES(`nombre`),
  `descripcion` = VALUES(`descripcion`);
