import pool from '../config/dbconfig.js';
import UsuariosRolesAsignadosModel from './UsuariosRolesAsignadosModel.js';

class UserModel {
    /**
     * Obtiene todos los usuarios que tienen el rol 'admin'.
     * Ahora usa la tabla usuarios_roles_asignados (sistema multi-rol).
     */
    static async findAllAdmins() {
        const [rows] = await pool.query(`
            SELECT DISTINCT u.* 
            FROM usuarios u
            INNER JOIN usuarios_empresas ue ON u.id = ue.usuario_id
            INNER JOIN usuarios_roles_asignados ura ON ue.id = ura.usuario_empresa_id
            INNER JOIN roles_sistema rs ON ura.rol_sistema_id = rs.id
            WHERE rs.slug = 'admin' AND ue.activo = 1
        `);
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
        const [rows] = await pool.query(`
            SELECT DISTINCT u.* 
            FROM usuarios u
            INNER JOIN usuarios_empresas ue ON u.id = ue.usuario_id
            INNER JOIN usuarios_roles_asignados ura ON ue.id = ura.usuario_empresa_id
            INNER JOIN roles_sistema rs ON ura.rol_sistema_id = rs.id
            WHERE rs.slug = 'trabajador' AND ue.activo = 1
        `);
        return rows;
    }

    static async create(data) {
        const { nombre, apellido_pat, apellido_mat, email, password, rut, estado } = data;
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, apellido_pat, apellido_mat, email, password, rut, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido_pat || null, apellido_mat || null, email, password, rut, estado]
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

    /**
     * Obtener usuario con todos sus roles asignados
     * @param {number} id - ID del usuario
     * @returns {Object|null} Usuario con array de roles o null si no existe
     */
    static async getUserWithRoles(id) {
        const user = await this.findById(id);
        if (!user) {
            return null;
        }

        // Obtener todas las relaciones usuario-empresa activas
        const [usuariosEmpresas] = await pool.query(
            `SELECT id, empresa_id 
             FROM usuarios_empresas 
             WHERE usuario_id = ? 
             AND (fecha_fin IS NULL OR fecha_fin > CURRENT_DATE)`,
            [id]
        );

        // Obtener roles para cada relación usuario-empresa
        const rolesPromises = usuariosEmpresas.map(async (ue) => {
            const roles = await UsuariosRolesAsignadosModel.getUserRoles(ue.id);
            return {
                empresa_id: ue.empresa_id,
                usuario_empresa_id: ue.id,
                roles: roles.map(r => ({
                    id: r.rol_sistema_id,
                    nombre: r.rol_nombre,
                    slug: r.rol_slug,
                    descripcion: r.rol_descripcion
                }))
            };
        });

        const rolesData = await Promise.all(rolesPromises);

        return {
            ...user,
            empresas_roles: rolesData
        };
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