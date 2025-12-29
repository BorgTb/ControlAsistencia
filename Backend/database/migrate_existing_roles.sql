-- =====================================================
-- Script de migración: Roles existentes
-- Descripción: Migra los roles actuales de usuarios.rol a usuarios_roles_asignados
-- IMPORTANTE: Ejecutar DESPUÉS de crear roles_sistema y usuarios_roles_asignados
-- =====================================================

-- Migrar roles de usuarios existentes a la nueva tabla
-- Solo migra usuarios que tienen una relación activa en usuarios_empresas

INSERT INTO `usuarios_roles_asignados` (`usuario_empresa_id`, `rol_sistema_id`, `created_at`)
SELECT 
    ue.id as usuario_empresa_id,
    rs.id as rol_sistema_id,
    CURRENT_TIMESTAMP as created_at
FROM usuarios_empresas ue
INNER JOIN usuarios u ON ue.usuario_id = u.id
INNER JOIN roles_sistema rs ON rs.slug = u.rol
WHERE (ue.fecha_fin IS NULL OR ue.fecha_fin > CURRENT_DATE)
  AND u.estado = 1
  AND NOT EXISTS (
    -- Evitar duplicados si el script se ejecuta múltiples veces
    SELECT 1 
    FROM usuarios_roles_asignados ura 
    WHERE ura.usuario_empresa_id = ue.id 
      AND ura.rol_sistema_id = rs.id
  );

-- Verificar resultados de la migración
SELECT 
    COUNT(*) as total_roles_migrados,
    rs.nombre as rol_nombre
FROM usuarios_roles_asignados ura
INNER JOIN roles_sistema rs ON ura.rol_sistema_id = rs.id
GROUP BY rs.nombre
ORDER BY total_roles_migrados DESC;
