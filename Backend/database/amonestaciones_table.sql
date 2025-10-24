-- Crear tabla de amonestaciones
CREATE TABLE IF NOT EXISTS amonestaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_empresa_id INT NOT NULL,
    
    -- Datos del trabajador y empresa
    cargo VARCHAR(100),
    area_departamento VARCHAR(100),
    empresa_rut VARCHAR(20),
    supervisor_responsable VARCHAR(200),
    
    -- Detalle de la falta
    tipo_falta ENUM('atraso', 'inasistencia', 'salida_anticipada', 'no_marcacion', 'otra') NOT NULL,
    fecha_hecho DATE NOT NULL,
    descripcion_detallada TEXT NOT NULL,
    norma_infringida TEXT,
    
    -- Sanción aplicada
    tipo_sancion ENUM('verbal', 'escrita', 'multa') NOT NULL,
    monto_multa DECIMAL(10,2) NULL,
    observaciones_rrhh TEXT,
    
    -- Derecho a descargos
    plazo_descargos DATE NOT NULL,
    descargos_trabajador TEXT,
    
    -- Archivos adjuntos (JSON)
    archivos_json JSON,
    
    -- Control de estado
    estado ENUM('PENDIENTE', 'CON_DESCARGOS', 'RESUELTA', 'ANULADA') DEFAULT 'PENDIENTE',
    
    -- Auditoría
    creado_por INT NOT NULL,
    ip_registro VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices y relaciones
    INDEX idx_usuario_empresa (usuario_empresa_id),
    INDEX idx_tipo_falta (tipo_falta),
    INDEX idx_estado (estado),
    INDEX idx_fecha_hecho (fecha_hecho),
    INDEX idx_creado_por (creado_por),
    
    -- Relaciones (opcional, dependiendo de la estructura existente)
    FOREIGN KEY (usuario_empresa_id) REFERENCES usuarios_empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Comentarios para documentación
ALTER TABLE amonestaciones 
COMMENT = 'Tabla para registrar amonestaciones laborales aplicadas a trabajadores';

-- Añadir comentarios a las columnas principales
ALTER TABLE amonestaciones 
MODIFY COLUMN tipo_falta ENUM('atraso', 'inasistencia', 'salida_anticipada', 'no_marcacion', 'otra') NOT NULL 
COMMENT 'Tipo de falta cometida por el trabajador',

MODIFY COLUMN tipo_sancion ENUM('verbal', 'escrita', 'multa') NOT NULL 
COMMENT 'Tipo de sanción aplicada según art. 154 del Código del Trabajo',

MODIFY COLUMN estado ENUM('PENDIENTE', 'CON_DESCARGOS', 'RESUELTA', 'ANULADA') DEFAULT 'PENDIENTE' 
COMMENT 'Estado actual del proceso de amonestación',

MODIFY COLUMN archivos_json JSON 
COMMENT 'Archivos adjuntos como evidencias (nombres, rutas, metadatos)',

MODIFY COLUMN monto_multa DECIMAL(10,2) NULL 
COMMENT 'Monto de la multa si aplica (máximo 25% del sueldo diario)';