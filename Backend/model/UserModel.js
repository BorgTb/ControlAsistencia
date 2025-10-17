import pool from '../config/dbconfig.js';

class UserModel {
    /**
     * Obtiene todos los usuarios cuyo rol es 'admin'.
     * Útil para paneles de gestión y auditoría de administradores.
     */
    static async findAllAdmins() {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE rol = "admin"');
        return rows;
    }
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows.length ? rows[0] : null;
    }
    
    static async findByRut(rut) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE rut = ?', [rut]);
        return rows.length ? rows[0] : null;
    }

    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        return rows;
    }

    static async getAllUsers() {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        return rows;
    }

    static async findAllWorkers() {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE rol = "trabajador"');
        return rows;
    }

    static async create(data) {
        const { nombre, apellido_pat, apellido_mat, email, password, rol, rut, estado } = data;
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, apellido_pat, apellido_mat, email, password, rol, rut, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido_pat || null, apellido_mat || null, email, password, rol, rut, estado]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        await pool.query(`UPDATE usuarios SET ${fields} WHERE id = ?`, values);
    }

    static async updateUser(id, data) {
        const { nombre, apellido_pat, apellido_mat, rut, email } = data;
        const updateFields = [];
        const updateValues = [];

        if (nombre !== undefined) {
            updateFields.push('nombre = ?');
            updateValues.push(nombre);
        }
        if (apellido_pat !== undefined) {
            updateFields.push('apellido_pat = ?');
            updateValues.push(apellido_pat);
        }
        if (apellido_mat !== undefined) {
            updateFields.push('apellido_mat = ?');
            updateValues.push(apellido_mat);
        }
        if (rut !== undefined) {
            updateFields.push('rut = ?');
            updateValues.push(rut);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        if (updateFields.length === 0) {
            throw new Error('No hay campos para actualizar');
        }

        updateValues.push(id);
        const [result] = await pool.query(
            `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const connection = await pool.getConnection();
        try {
            console.log(`🗑️ Iniciando eliminación en cascada para usuario ${id}`);
            
            // Iniciar transacción para garantizar consistencia
            await connection.beginTransaction();
            
            // 1. Primero, obtener todos los usuarios_empresas_id relacionados
            const [usuariosEmpresas] = await connection.query(
                'SELECT id FROM usuarios_empresas WHERE usuario_id = ?', 
                [id]
            );
            console.log(`📋 Encontrados ${usuariosEmpresas.length} registros usuario-empresa`);
            
            // 2. Eliminar turnos asociados al usuario (a través de usuarios_empresas)
            if (usuariosEmpresas.length > 0) {
                const usuarioEmpresaIds = usuariosEmpresas.map(ue => ue.id);
                await connection.query(
                    `DELETE FROM turnos WHERE usuario_id IN (${usuarioEmpresaIds.map(() => '?').join(',')})`,
                    usuarioEmpresaIds
                );
                console.log('✅ Turnos del usuario eliminados');
                
                // 3. Eliminar marcaciones del usuario
                await connection.query(
                    `DELETE FROM marcaciones WHERE usuario_empresa_id IN (${usuarioEmpresaIds.map(() => '?').join(',')})`,
                    usuarioEmpresaIds
                );
                console.log('✅ Marcaciones del usuario eliminadas');
            }
            
            // 4. Eliminar relaciones usuario-empresa
            await connection.query('DELETE FROM usuarios_empresas WHERE usuario_id = ?', [id]);
            console.log('✅ Relaciones usuario-empresa eliminadas');
            
            // 5. Eliminar registros de auditoría relacionados (opcional, o mantener para histórico)
            // Comentado para mantener el histórico de auditoría
            // await connection.query('DELETE FROM auditoria_cambios WHERE usuario_id = ?', [id]);
            // await connection.query('DELETE FROM auditoria_sesiones WHERE usuario_id = ?', [id]);
            
            // 6. Finalmente eliminar el usuario
            const [result] = await connection.query('DELETE FROM usuarios WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                throw new Error('Usuario no encontrado o ya eliminado');
            }
            
            console.log('✅ Usuario eliminado de la tabla usuarios');
            
            // Confirmar transacción
            await connection.commit();
            console.log('✅ Eliminación completa exitosa');
            
            return { success: true, message: 'Usuario eliminado exitosamente' };
            
        } catch (error) {
            // Revertir transacción en caso de error
            await connection.rollback();
            console.error('❌ Error en eliminación, transacción revertida:', error);
            throw error;
        } finally {
            // Liberar conexión
            connection.release();
        }
    }

    // Métodos para estadísticas
    static async contarUsuarios() {
        try {
            // Contar usuarios activos (estado = 1)
            const [activosResult] = await pool.query('SELECT COUNT(*) as total FROM usuarios WHERE estado = 1');
            const activos = activosResult[0].total;

            // Contar total de usuarios
            const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
            const total = totalResult[0].total;

            // Estimación del mes anterior (para el cálculo de cambio)
            const mesAnterior = Math.max(0, total - Math.floor(total * 0.1));

            return {
                total: total,
                activos: activos,
                mesAnterior: mesAnterior
            };
        } catch (error) {
            console.error('Error al contar usuarios:', error);
            return { total: 0, activos: 0, mesAnterior: 0 };
        }
    }

    static async obtenerDistribucionPorRol() {
        try {
            const [rows] = await pool.query(`
                SELECT rol, COUNT(*) as cantidad 
                FROM usuarios 
                WHERE estado = 1 
                GROUP BY rol
            `);
            
            const distribucion = {};
            rows.forEach(row => {
                distribucion[row.rol] = row.cantidad;
            });
            
            // Asegurar que todos los roles estén representados
            const rolesBase = ['admin', 'empleador', 'fiscalizador', 'trabajador'];
            rolesBase.forEach(rol => {
                if (!distribucion[rol]) {
                    distribucion[rol] = 0;
                }
            });
            
            return distribucion;
        } catch (error) {
            console.error('Error al obtener distribución por rol:', error);
            return { admin: 0, empleador: 0, fiscalizador: 0, trabajador: 0 };
        }
    }

    static async obtenerUsuariosRecientes(dias = 7) {
        try {
            // Obtener usuarios creados hoy
            const [hoyResult] = await pool.query(`
                SELECT COUNT(*) as total 
                FROM usuarios 
                WHERE DATE(created_at) = CURDATE()
            `);
            
            // Obtener usuarios creados hace 2 días
            const [dosDiasResult] = await pool.query(`
                SELECT COUNT(*) as total 
                FROM usuarios 
                WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 2 DAY)
            `);
            
            // Obtener usuarios creados en los últimos 7 días
            const [semanaResult] = await pool.query(`
                SELECT COUNT(*) as total 
                FROM usuarios 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            `, [dias]);
            
            return {
                hoy: hoyResult[0].total || 0,
                dosDias: dosDiasResult[0].total || 0,
                semana: semanaResult[0].total || 0
            };
        } catch (error) {
            console.error('Error al obtener usuarios recientes:', error);
            return { hoy: 0, dosDias: 0, semana: 0 };
        }
    }
}

export default UserModel;