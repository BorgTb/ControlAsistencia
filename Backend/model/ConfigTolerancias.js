import pool from '../config/dbconfig.js';

class ConfigToleranciaModel {
    /**
     * Obtiene la configuración de tolerancias por ID
     */
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM config_tolerancias WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
    }

    /**
     * Obtiene la configuración de tolerancias por empresa_id
     */
    static async findByEmpresaId(empresa_id) {
        const [rows] = await pool.query(
            'SELECT * FROM config_tolerancias WHERE empresa_id = ? AND estado = 1', 
            [empresa_id]
        );
        return rows.length ? rows[0] : null;
    }

    /**
     * Obtiene todas las configuraciones de tolerancias
     */
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM config_tolerancias');
        return rows;
    }

    /**
     * Obtiene todas las configuraciones activas
     */
    static async findAllActive() {
        const [rows] = await pool.query('SELECT * FROM config_tolerancias WHERE estado = 1');
        return rows;
    }

    /**
     * Crea una nueva configuración de tolerancias
     */
    static async create(data) {
        const { 
            empresa_id, 
            tolerancia_entrada = 0, 
            tolerancia_salida = 0, 
            tiempo_min_entre_marcaciones = 0,
            estado = 1 
        } = data;

        const [result] = await pool.query(
            `INSERT INTO config_tolerancias 
            (empresa_id, tolerancia_entrada, tolerancia_salida, tiempo_min_entre_marcaciones, estado) 
            VALUES (?, ?, ?, ?, ?)`,
            [empresa_id, tolerancia_entrada, tolerancia_salida, tiempo_min_entre_marcaciones, estado]
        );
        return result.insertId;
    }

    /**
     * Actualiza una configuración de tolerancias existente
     */
    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        const [result] = await pool.query(
            `UPDATE config_tolerancias SET ${fields} WHERE id = ?`, 
            values
        );
        return result.affectedRows > 0;
    }

    /**
     * Actualiza la configuración por empresa_id
     */
    static async updateByEmpresaId(empresa_id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), empresa_id];
        const [result] = await pool.query(
            `UPDATE config_tolerancias SET ${fields} WHERE empresa_id = ?`, 
            values
        );
        return result.affectedRows > 0;
    }

    /**
     * Elimina (soft delete) una configuración de tolerancias
     */
    static async softDelete(id) {
        const [result] = await pool.query(
            'UPDATE config_tolerancias SET estado = 0 WHERE id = ?', 
            [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Elimina permanentemente una configuración de tolerancias
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM config_tolerancias WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    /**
     * Verifica si existe una configuración para una empresa
     */
    static async existsByEmpresaId(empresa_id) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM config_tolerancias WHERE empresa_id = ?', 
            [empresa_id]
        );
        return rows[0].count > 0;
    }

    /**
     * Crea o actualiza la configuración de tolerancias para una empresa
     */
    static async createOrUpdate(empresa_id, data) {
        const exists = await this.existsByEmpresaId(empresa_id);
        
        if (exists) {
            // Actualizar configuración existente
            await this.updateByEmpresaId(empresa_id, data);
            const config = await this.findByEmpresaId(empresa_id);
            return { action: 'updated', config };
        } else {
            // Crear nueva configuración
            const id = await this.create({ empresa_id, ...data });
            const config = await this.findById(id);
            return { action: 'created', config };
        }
    }

    /**
     * Obtiene la configuración de tolerancias con información de la empresa
     */
    static async findByEmpresaIdWithDetails(empresa_id) {
        const [rows] = await pool.query(
            `SELECT 
                ct.*,
                e.nombre as empresa_nombre,
                e.rut as empresa_rut
            FROM config_tolerancias ct
            INNER JOIN empresas e ON ct.empresa_id = e.id
            WHERE ct.empresa_id = ? AND ct.estado = 1`,
            [empresa_id]
        );
        return rows.length ? rows[0] : null;
    }

    /**
     * Obtiene estadísticas de configuraciones
     */
    static async obtenerEstadisticas() {
        try {
            // Total de configuraciones
            const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM config_tolerancias');
            
            // Configuraciones activas
            const [activasResult] = await pool.query(
                'SELECT COUNT(*) as total FROM config_tolerancias WHERE estado = 1'
            );
            
            // Promedio de tolerancia de entrada
            const [promedioEntradaResult] = await pool.query(
                'SELECT AVG(tolerancia_entrada) as promedio FROM config_tolerancias WHERE estado = 1'
            );
            
            // Promedio de tolerancia de salida
            const [promedioSalidaResult] = await pool.query(
                'SELECT AVG(tolerancia_salida) as promedio FROM config_tolerancias WHERE estado = 1'
            );
            
            return {
                total: totalResult[0].total || 0,
                activas: activasResult[0].total || 0,
                promedioToleranciaEntrada: Math.round(promedioEntradaResult[0].promedio || 0),
                promedioToleranciaSalida: Math.round(promedioSalidaResult[0].promedio || 0)
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de configuraciones:', error);
            return { 
                total: 0, 
                activas: 0, 
                promedioToleranciaEntrada: 0, 
                promedioToleranciaSalida: 0 
            };
        }
    }

    /**
     * Valida si una marcación está dentro de la tolerancia configurada
     */
    static async validarTolerancia(empresa_id, tipo_marcacion, minutos_diferencia) {
        const config = await this.findByEmpresaId(empresa_id);
        
        if (!config) {
            return { valido: false, mensaje: 'No hay configuración de tolerancias para esta empresa' };
        }

        let tolerancia = 0;
        if (tipo_marcacion === 'entrada') {
            tolerancia = config.tolerancia_entrada;
        } else if (tipo_marcacion === 'salida') {
            tolerancia = config.tolerancia_salida;
        }

        const valido = Math.abs(minutos_diferencia) <= tolerancia;
        
        return {
            valido,
            tolerancia,
            diferencia: minutos_diferencia,
            mensaje: valido 
                ? 'Marcación dentro de la tolerancia permitida' 
                : `Marcación fuera de tolerancia (${Math.abs(minutos_diferencia)} min > ${tolerancia} min permitidos)`
        };
    }

    /**
     * Valida si el tiempo entre marcaciones es suficiente
     */
    static async validarTiempoEntreMarcaciones(empresa_id, minutos_transcurridos) {
        const config = await this.findByEmpresaId(empresa_id);
        
        if (!config) {
            return { valido: false, mensaje: 'No hay configuración de tolerancias para esta empresa' };
        }

        const valido = minutos_transcurridos >= config.tiempo_min_entre_marcaciones;
        
        return {
            valido,
            tiempoMinimo: config.tiempo_min_entre_marcaciones,
            tiempoTranscurrido: minutos_transcurridos,
            mensaje: valido 
                ? 'Tiempo entre marcaciones válido' 
                : `Debe esperar al menos ${config.tiempo_min_entre_marcaciones} minutos entre marcaciones`
        };
    }
    static async obtenerTolerenciaEmpresaUsuaria(empresa_usuario_id) {
    }
}

export default ConfigToleranciaModel;
