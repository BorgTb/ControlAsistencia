import pool from '../config/dbconfig.js';

class AuditoriaModel {
    
    // Crear registro de inicio de sesión con zona horaria de Chile
    static async registrarInicioSesion(usuario_id, ip_address = null, rol = null) {
        try {
            // Configurar zona horaria de Chile antes de la consulta
            await pool.execute("SET time_zone = '-03:00'");
            
            const query = `
                INSERT INTO auditoria_sesiones (usuario_id, rol, fecha_inicio, ip_address, estado)
                VALUES (?, ?, NOW(), ?, 'activo')
            `;
            const [result] = await pool.execute(query, [usuario_id, rol, ip_address]);
            console.log('✅ Sesión iniciada con zona horaria Chile:', {
                usuario_id,
                rol,
                sesion_id: result.insertId,
                ip_address,
                fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })
            });
            return result.insertId;
        } catch (error) {
            console.error('Error al registrar inicio de sesión:', error);
            throw error;
        }
    }

    // Registrar cierre de sesión con zona horaria de Chile
    static async registrarCierreSesion(usuario_id, sesion_id = null) {
        try {
            // Configurar zona horaria de Chile antes de la consulta
            await pool.execute("SET time_zone = '-03:00'");
            
            let query;
            let params;
            
            if (sesion_id) {
                // Si tenemos el ID de sesión específico
                query = `
                    UPDATE auditoria_sesiones 
                    SET fecha_cierre = NOW(), 
                        tiempo_activo = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW()),
                        estado = 'cerrado'
                    WHERE id = ? AND usuario_id = ?
                `;
                params = [sesion_id, usuario_id];
            } else {
                // Si no tenemos ID específico, cerrar la sesión activa más reciente
                query = `
                    UPDATE auditoria_sesiones 
                    SET fecha_cierre = NOW(), 
                        tiempo_activo = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW()),
                        estado = 'cerrado'
                    WHERE usuario_id = ? AND estado = 'activo'
                    ORDER BY fecha_inicio DESC 
                    LIMIT 1
                `;
                params = [usuario_id];
            }
            
            const [result] = await pool.execute(query, params);
            console.log('✅ Sesión cerrada con zona horaria Chile:', {
                usuario_id,
                sesiones_cerradas: result.affectedRows,
                fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })
            });
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al registrar cierre de sesión:', error);
            throw error;
        }
    }

    // Obtener registros de auditoría con información del usuario
    static async obtenerRegistrosAuditoria(limite = 50) {
        try {
            // Configurar zona horaria de Chile para las consultas
            await pool.execute("SET time_zone = '-03:00'");
            
            // Asegurar que limite sea un número entero válido
            const limiteNumero = Math.max(1, Math.min(parseInt(limite) || 50, 1000));
            
            // Usar el rol guardado en auditoria_sesiones
            const query = `
                SELECT 
                    a.id,
                    a.usuario_id,
                    u.nombre,
                    u.apellido_pat,
                    u.apellido_mat,
                    u.email,
                    u.activo,
                    a.rol as rol_en_sesion,
                    u.rol as rol_actual,
                    a.fecha_inicio,
                    a.fecha_cierre,
                    a.tiempo_activo,
                    a.ip_address,
                    a.estado,
                    CASE 
                        WHEN a.fecha_cierre IS NULL THEN 'Sesión Activa'
                        ELSE CONCAT(a.tiempo_activo, ' minutos')
                    END as duracion_sesion
                FROM auditoria_sesiones a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                ORDER BY a.fecha_inicio DESC
                LIMIT ${limiteNumero}
            `;
            const [rows] = await pool.execute(query);
            
            // Usar el rol de la sesión si existe, sino el actual
            const rowsWithRol = rows.map(row => ({
                ...row,
                rol: row.rol_en_sesion || row.rol_actual
            }));
            
            return rowsWithRol;
        } catch (error) {
            console.error('Error al obtener registros de auditoría:', error);
            throw error;
        }
    }

    // Obtener registros de auditoría de un usuario específico
    static async obtenerRegistrosPorUsuario(usuario_id, limite = 20) {
        try {
            // Configurar zona horaria de Chile
            await pool.execute("SET time_zone = '-03:00'");
            
            // Asegurar que los parámetros sean del tipo correcto
            const usuarioIdNumero = parseInt(usuario_id);
            const limiteNumero = Math.max(1, Math.min(parseInt(limite) || 20, 1000));
            
            // Usar el rol guardado en auditoria_sesiones
            const query = `
                SELECT 
                    a.id,
                    a.usuario_id,
                    u.nombre,
                    u.apellido_pat,
                    u.apellido_mat,
                    u.email,
                    u.activo,
                    a.rol as rol_en_sesion,
                    u.rol as rol_actual,
                    a.fecha_inicio,
                    a.fecha_cierre,
                    a.tiempo_activo,
                    a.ip_address,
                    a.estado,
                    CASE 
                        WHEN a.fecha_cierre IS NULL THEN 'Sesión Activa'
                        ELSE CONCAT(a.tiempo_activo, ' minutos')
                    END as duracion_sesion
                FROM auditoria_sesiones a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.usuario_id = ?
                ORDER BY a.fecha_inicio DESC
                LIMIT ${limiteNumero}
            `;
            const [rows] = await pool.execute(query, [usuarioIdNumero]);
            
            // Usar el rol de la sesión si existe, sino el actual
            const rowsWithRol = rows.map(row => ({
                ...row,
                rol: row.rol_en_sesion || row.rol_actual
            }));
            
            return rowsWithRol;
        } catch (error) {
            console.error('Error al obtener registros de auditoría por usuario:', error);
            throw error;
        }
    }

    // Cerrar sesión específica del usuario con zona horaria correcta
    static async cerrarSesionUsuario(usuario_id) {
        try {
            // Configurar zona horaria de Chile antes del cierre
            await pool.execute("SET time_zone = '-03:00'");
            
            const usuarioIdNumero = parseInt(usuario_id);
            console.log('🔒 Cerrando sesión para usuario ID:', usuarioIdNumero);
            console.log('🕐 Hora Chile actual:', new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }));
            
            const query = `
                UPDATE auditoria_sesiones 
                SET fecha_cierre = NOW(), 
                    tiempo_activo = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW()),
                    estado = 'cerrado'
                WHERE usuario_id = ? 
                AND estado = 'activo'
            `;
            const [result] = await pool.execute(query, [usuarioIdNumero]);
            console.log('✅ Sesiones cerradas:', result.affectedRows);
            return {
                sesiones_cerradas: result.affectedRows,
                success: true
            };
        } catch (error) {
            console.error('Error al cerrar sesión del usuario:', error);
            throw error;
        }
    }

    // Cerrar sesiones activas automáticamente (para mantenimiento)
    static async cerrarSesionesExpiradas(horasExpiracion = 24) {
        try {
            // Configurar zona horaria de Chile
            await pool.execute("SET time_zone = '-03:00'");
            
            const query = `
                UPDATE auditoria_sesiones 
                SET fecha_cierre = NOW(), 
                    tiempo_activo = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW()),
                    estado = 'expirado'
                WHERE estado = 'activo' 
                AND fecha_inicio < DATE_SUB(NOW(), INTERVAL ? HOUR)
            `;
            const [result] = await pool.execute(query, [horasExpiracion]);
            return result.affectedRows;
        } catch (error) {
            console.error('Error al cerrar sesiones expiradas:', error);
            throw error;
        }
    }

    // Obtener estadísticas de sesiones
    static async obtenerEstadisticasSesiones() {
        try {
            // Configurar zona horaria de Chile para estadísticas
            await pool.execute("SET time_zone = '-03:00'");
            
            const query = `
                SELECT 
                    COUNT(*) as total_sesiones,
                    COUNT(CASE WHEN estado = 'activo' THEN 1 END) as sesiones_activas,
                    COUNT(CASE WHEN DATE(fecha_inicio) = CURDATE() THEN 1 END) as sesiones_hoy,
                    AVG(tiempo_activo) as promedio_duracion,
                    MAX(fecha_inicio) as ultimo_acceso
                FROM auditoria_sesiones
            `;
            const [rows] = await pool.execute(query);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas de sesiones:', error);
            throw error;
        }
    }

    // Contar sesiones activas
    static async contarSesionesActivas() {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM auditoria_sesiones 
                WHERE estado = 'activo'
            `;
            const [rows] = await pool.execute(query);
            return rows[0].total || 0;
        } catch (error) {
            console.error('Error al contar sesiones activas:', error);
            return 0;
        }
    }

    // ========== MÉTODOS PARA AUDITORÍA DE CAMBIOS ==========

    // Registrar un cambio específico realizado por un usuario
    static async registrarCambio(datosDelCambio) {
        try {
            // Configurar zona horaria de Chile
            await pool.execute("SET time_zone = '-03:00'");
            
            const {
                usuario_id,
                accion,
                tabla_afectada,
                registro_id = null,
                descripcion,
                datos_anteriores = null,
                datos_nuevos = null,
                ip_address = null
            } = datosDelCambio;

            console.log('📝 Registrando cambio en BD:', { usuario_id, accion, tabla_afectada });

            const query = `
                INSERT INTO auditoria_cambios (
                    usuario_id, 
                    accion, 
                    tabla_afectada, 
                    registro_id, 
                    descripcion, 
                    datos_anteriores, 
                    datos_nuevos, 
                    ip_address,
                    fecha_cambio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            // Convertir datos a JSON si no son string
            const datosAnterioresJson = datos_anteriores ? 
                (typeof datos_anteriores === 'string' ? datos_anteriores : JSON.stringify(datos_anteriores)) : null;
            const datosNuevosJson = datos_nuevos ? 
                (typeof datos_nuevos === 'string' ? datos_nuevos : JSON.stringify(datos_nuevos)) : null;

            const [result] = await pool.execute(query, [
                usuario_id,
                accion,
                tabla_afectada,
                registro_id,
                descripcion,
                datosAnterioresJson,
                datosNuevosJson,
                ip_address
            ]);

            console.log('✅ Cambio registrado con ID:', result.insertId);
            return result.insertId;

        } catch (error) {
            console.error('❌ Error al registrar cambio:', error);
            throw error;
        }
    }

    // Obtener cambios realizados por un usuario específico
    static async obtenerCambiosPorUsuario(usuario_id, limite = 50) {
        try {
            // Configurar zona horaria de Chile
            await pool.execute("SET time_zone = '-03:00'");
            
            // Validar y limitar parámetros
            const usuarioIdNumero = parseInt(usuario_id);
            const limiteNumero = Math.max(1, Math.min(parseInt(limite) || 50, 200));

            console.log('🔍 Buscando cambios para usuario:', { usuarioIdNumero, limiteNumero });

            const query = `
                SELECT 
                    ac.id,
                    ac.usuario_id,
                    ac.accion,
                    ac.tabla_afectada,
                    ac.registro_id,
                    ac.descripcion,
                    ac.datos_anteriores,
                    ac.datos_nuevos,
                    ac.fecha_cambio,
                    ac.ip_address,
                    u.nombre,
                    u.apellido_pat,
                    u.apellido_mat,
                    u.email,
                    u.rol
                FROM auditoria_cambios ac
                INNER JOIN usuarios u ON ac.usuario_id = u.id
                WHERE ac.usuario_id = ?
                ORDER BY ac.fecha_cambio DESC
                LIMIT ${limiteNumero}
            `;

            const [rows] = await pool.execute(query, [usuarioIdNumero]);

            console.log(`✅ Encontrados ${rows.length} cambios para usuario ${usuarioIdNumero}`);
            return rows;

        } catch (error) {
            console.error('❌ Error al obtener cambios por usuario:', error);
            throw error;
        }
    }

    // Obtener estadísticas de cambios del sistema
    static async obtenerEstadisticasCambios() {
        try {
            // Configurar zona horaria de Chile
            await pool.execute("SET time_zone = '-03:00'");

            const query = `
                SELECT 
                    COUNT(*) as total_cambios,
                    COUNT(CASE WHEN accion LIKE '%empresa%' THEN 1 END) as cambios_empresas,
                    COUNT(CASE WHEN accion LIKE '%trabajador%' THEN 1 END) as cambios_trabajadores,
                    COUNT(CASE WHEN accion LIKE '%rol%' OR accion LIKE '%perfil%' THEN 1 END) as cambios_sistema,
                    COUNT(DISTINCT usuario_id) as usuarios_activos,
                    DATE(fecha_cambio) as fecha
                FROM auditoria_cambios 
                WHERE fecha_cambio >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(fecha_cambio)
                ORDER BY fecha DESC
                LIMIT 30
            `;

            const [rows] = await pool.execute(query);
            return rows;

        } catch (error) {
            console.error('❌ Error al obtener estadísticas de cambios:', error);
            throw error;
        }
    }

    // Obtener los últimos cambios del sistema (para dashboard)
    static async obtenerUltimosCambios(limite = 10) {
        try {
            // Configurar zona horaria de Chile
            await pool.execute("SET time_zone = '-03:00'");

            const limiteNumero = Math.max(1, Math.min(parseInt(limite) || 10, 50));

            const query = `
                SELECT 
                    ac.id,
                    ac.accion,
                    ac.tabla_afectada,
                    ac.descripcion,
                    ac.fecha_cambio,
                    u.nombre,
                    u.apellido_pat,
                    u.rol
                FROM auditoria_cambios ac
                INNER JOIN usuarios u ON ac.usuario_id = u.id
                ORDER BY ac.fecha_cambio DESC
                LIMIT ${limiteNumero}
            `;

            const [rows] = await pool.execute(query);
            return rows;

        } catch (error) {
            console.error('❌ Error al obtener últimos cambios:', error);
            throw error;
        }
    }
}

export default AuditoriaModel;