import UserModel from '../model/UserModel.js';
import authservice from '../services/authservice.js';
import {DateTime} from 'luxon';
import ReportesModel from '../model/ReportesModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';
import AuditoriaModel from '../model/AuditoriaModel.js';
import FileUploadService from '../services/FileUploadService.js';
import SolicitudesUsuariosModel from '../model/SolicitudesUsuariosModel.js';

/**
 * Actualiza el rol de un usuario por su id.
 * Permite cambiar el campo rol desde el frontend de forma segura.
 */
export const updateRol = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;
    try {
        // Obtener datos anteriores del usuario
        let datosAnteriores = null;
        try {
            const usuarioAnterior = await UserModel.findById(id);
            datosAnteriores = { rol: usuarioAnterior?.rol };
        } catch (error) {
            console.warn('No se pudieron obtener datos anteriores del usuario');
        }

        // Actualizar el rol
        await UserModel.update(id, { rol });
        
        // Registrar el cambio en auditoría
        if (req.user && req.user.id) {
            try {
                // Traducir roles al español para la descripción
                const traducirRol = (rol) => {
                    switch (rol) {
                        case 'admin': return 'Administrador'
                        case 'empleador': return 'Empleador'
                        case 'trabajador': return 'Trabajador'
                        case 'fiscalizador': return 'Fiscalizador'
                        default: return rol
                    }
                }

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'cambiar_rol',
                    tabla_afectada: 'usuarios',
                    registro_id: id,
                    descripcion: `Rol de usuario cambiado de "${traducirRol(datosAnteriores?.rol || 'Sin rol')}" a "${traducirRol(rol)}"`,
                    datos_anteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : null,
                    datos_nuevos: JSON.stringify({ rol }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Cambio de rol registrado en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio en auditoría:', auditError);
            }
        }
        
        res.status(200).json({ success: true, message: 'Rol actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar rol', error });
    }
};
/**
 * Actualiza el estado de un usuario por su id.
 * Permite cambiar el campo estado desde el frontend.
 */
const updateEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        // Obtener datos anteriores del usuario
        let datosAnteriores = null;
        try {
            const usuarioAnterior = await UserModel.findById(id);
            datosAnteriores = { estado: usuarioAnterior?.estado };
        } catch (error) {
            console.warn('No se pudieron obtener datos anteriores del usuario');
        }

        // Actualizar el estado
        await UserModel.update(id, { estado });
        
        // Registrar el cambio en auditoría
        if (req.user && req.user.id) {
            try {
                const estadoTexto = estado ? 'Activo' : 'Inactivo';
                const estadoAnterior = datosAnteriores?.estado ? 'Activo' : 'Inactivo';
                
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'cambiar_estado',
                    tabla_afectada: 'usuarios',
                    registro_id: id,
                    descripcion: `Estado de usuario cambiado de "${estadoAnterior}" a "${estadoTexto}"`,
                    datos_anteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : null,
                    datos_nuevos: JSON.stringify({ estado }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Cambio de estado registrado en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio en auditoría:', auditError);
            }
        }
        
        res.status(200).json({ success: true, message: 'Estado actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar estado', error });
    }
};

const updateEmail = async (req, res) => {
    const { newEmail, password } = req.body; // nuevos datos
    const user  = req.user;
    
   
    const valid = await authservice.isPasswordCorrect(user.id, password);
  
    if (!valid) {
        return res.status(400).json({
            message: 'Contraseña incorrecta',
        });
    }

    // Verificar si el nuevo email ya está en uso
    const existingUser = await UserModel.findByEmail(newEmail);
    if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
            message: 'El email ya está en uso por otro usuario',
        });
    }

    // Actualizar el email del usuario
    await UserModel.update(user.id, { email: newEmail });

    const newUser = await UserModel.findByEmail(newEmail);
   
    res.status(200).json({
        message: 'Email actualizado correctamente',
        success: true,
        user: {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email,
            rol: newUser.rol,
            rut: newUser.rut,
            estado: newUser.estado
        }
    });
}

const updatePassword = async (req, res) => {
    const { newPassword, currentPassword } = req.body; // nuevos datos
    const user = req.user;

    const valid = await authservice.isPasswordCorrect(user.id, currentPassword);
  
    if (!valid) {
        return res.status(400).json({
            message: 'Contraseña actual incorrecta',
        });
    }


    // Actualizar la contraseña del usuario
    await authservice.updateUserPassword(user.id, newPassword);

    res.status(200).json({
        message: 'Contraseña actualizada correctamente',
        success: true
    });
}

const createReporte = async (req, res) => {
    const reporteData = req.body;
    const user = req.user;
    try {
        // Aquí iría la lógica para guardar el reporte en la base de datos
        console.log(reporteData);   
        const nuevoReporte = {
            marcacion_id: reporteData.marcacion_id,
            usuario_id: await UsuarioEmpresaModel.obtenerIdByUsuarioId(user.id),
            tipo_problema: reporteData.tipo_problema,
            descripcion: reporteData.descripcion,
            fecha_correcta: reporteData.fecha_correcta,
            hora_correcta: reporteData.hora_correcta,
            fecha_creacion: DateTime.now().setZone('America/Santiago').toISO(),
            tipo: reporteData.tipo // 'modificar' para reportes de marcación,
        };

        // Guardar el reporte en la base de datos
        const reporteGuardado = await ReportesModel.create(nuevoReporte);
        res.status(201).json({
            success: true,
            message: 'Reporte enviado correctamente',
            data: reporteGuardado
        });
    } catch (error) {
        console.error('Error al crear el reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el reporte'
        });
    }
}




const createSolicitudMarcacion = async (req, res) => {
    const solicitudData = req.body;
    const user = req.user;

    try {
        // Aquí iría la lógica para guardar la solicitud de marcación en la base de datos
        console.log(solicitudData);


        /*
            {
                tipo: 'entrada',
                fecha: '2025-09-25',
                hora: '21:18',
                motivo: 'olvido_marcar',
                descripcion: '11111111111111111111111111',
                geo_lat: -35.4578,
                geo_lon: -71.6751,
                estado: 'pendiente',
                fecha_solicitud: '2025-09-26T00:56:14.631Z'
            }
        */
        
        const nuevoReporte = {
            marcacion_id: null, // No aplica en solicitudes de marcación
            usuario_id: await UsuarioEmpresaModel.obtenerIdByUsuarioId(user.id),
            tipo_problema: solicitudData.motivo,
            descripcion: solicitudData.descripcion,
            fecha_correcta: solicitudData.fecha,
            hora_correcta: solicitudData.hora,
            fecha_creacion: DateTime.now().setZone('America/Santiago').toISO(),
            tipo: solicitudData.tipo, // 'agregar' para solicitudes de marcación,
            tipo_marcacion_correcta: solicitudData.tipo_marcacion_correcta || null,
        };

        // Guardar el reporte en la base de datos
        const reporteGuardado = await ReportesModel.create(nuevoReporte);

        res.status(201).json({
            success: true,
            message: 'Solicitud de marcación creada correctamente',
            data: reporteGuardado
        });
    } catch (error) {
        console.error('Error al crear la solicitud de marcación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la solicitud de marcación'
        });
    }
}





/**
 * Crea un usuario administrador.
 * Este endpoint permite registrar un nuevo usuario con el rol 'admin'.
 * Es útil para gestionar el acceso administrativo desde el backend.
 */
const createAdmin = async (req, res) => {
    try {
        const { nombre, apellido_pat, apellido_mat, email, password, rut, estado } = req.body;
        // El campo 'rol' se fuerza a 'admin' para asegurar el tipo de usuario
        const data = { nombre, apellido_pat, apellido_mat, email, password, rol: 'admin', rut, estado };
        const id = await UserModel.create(data);
        res.status(201).json({ success: true, id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear administrador', error });
    }
}

/**
 * Lista todos los usuarios con rol 'admin'.
 * Este endpoint permite obtener todos los administradores registrados en el sistema.
 * Útil para paneles de gestión y auditoría.
 */
const listAdmins = async (req, res) => {
    try {
        const admins = await UserModel.findAllAdmins();
        res.status(200).json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al listar administradores', error });
    }
}


/**
 * Lista todos los usuarios.
 * Endpoint público para obtener todos los usuarios registrados.
 */
const listAllUsers = async (req, res) => {
    try {
        const users = await UserModel.findAll();
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al listar usuarios', error });
    }
};

// Crear nuevo usuario (solo para admins)
const createUser = async (req, res) => {
    try {
        const { nombre, apellido_pat, apellido_mat, email, password, rol, rut, estado = 1 } = req.body;
        
        // Validaciones básicas
        if (!nombre || !email || !password || !rol || !rut) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: nombre, email, password, rol, rut'
            });
        }

        // Verificar si ya existe un usuario con este email o RUT
        const existingUserByEmail = await UserModel.findByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con este email'
            });
        }

        const existingUserByRut = await UserModel.findByRut(rut);
        if (existingUserByRut) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con este RUT'
            });
        }

        // Crear usuario usando AuthService para hash de password
        const newUser = await authservice.registerUser(
            email, 
            password, 
            nombre, 
            apellido_pat, 
            apellido_mat, 
            rol, 
            rut, 
            estado
        );

        // Debug: Verificar información del usuario
        console.log('🔍 Debug usuario en createUser:', {
            hasReqUser: !!req.user,
            userId: req.user?.id,
            userRol: req.user?.rol,
            userEmail: req.user?.email,
            newUserId: newUser?.id
        });

        // Registrar el cambio en auditoría
        if (req.user && req.user.id) {
            try {
                console.log('🔄 Intentando registrar creación de usuario en auditoría para usuario:', req.user.id);
                
                // Traducir rol al español
                const traducirRol = (rol) => {
                    switch (rol) {
                        case 'admin': return 'Administrador'
                        case 'empleador': return 'Empleador'
                        case 'trabajador': return 'Trabajador'
                        case 'fiscalizador': return 'Fiscalizador'
                        default: return rol
                    }
                }

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'crear_usuario',
                    tabla_afectada: 'usuarios',
                    registro_id: newUser.id,
                    descripcion: `Usuario creado: ${nombre} ${apellido_pat || ''} (${email}) - Rol: ${traducirRol(rol)}`,
                    datos_anteriores: null,
                    datos_nuevos: JSON.stringify({
                        nombre,
                        apellido_pat,
                        apellido_mat,
                        email,
                        rol,
                        rut,
                        estado
                    }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Cambio de creación de usuario registrado en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio en auditoría:', auditError);
            }
        } else {
            console.warn('⚠️ No se pudo registrar creación de usuario en auditoría:', {
                hasReqUser: !!req.user,
                userId: req.user?.id,
                reason: !req.user ? 'req.user no existe' : 'req.user.id no existe'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                apellido_pat: newUser.apellido_pat,
                apellido_mat: newUser.apellido_mat,
                email: newUser.email,
                rol: newUser.rol,
                rut: newUser.rut,
                estado: newUser.estado
            }
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Crear trabajador (solo para empleadores - permisos limitados)
const createTrabajador = async (req, res) => {
    try {
        const { nombre, apellido_pat, apellido_mat, email, password, rut, estado = 1 } = req.body;
        
        // Forzar rol como trabajador - los empleadores solo pueden crear trabajadores
        const rol = 'trabajador';
        
        // Validaciones básicas
        if (!nombre || !email || !password || !rut) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: nombre, email, password, rut'
            });
        }

        // Verificar si ya existe un usuario con este email o RUT
        const existingUserByEmail = await UserModel.findByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con este email'
            });
        }

        const existingUserByRut = await UserModel.findByRut(rut);
        if (existingUserByRut) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con este RUT'
            });
        }

        // Crear trabajador usando AuthService para hash de password
        const newUser = await authservice.registerUser(
            email, 
            password, 
            nombre, 
            apellido_pat, 
            apellido_mat, 
            rol, 
            rut, 
            estado
        );

        // Debug: Verificar información del usuario empleador que crea el trabajador
        console.log('🔍 Debug empleador creando trabajador:', {
            hasReqUser: !!req.user,
            empleadorId: req.user?.id,
            empleadorRol: req.user?.rol,
            empleadorEmail: req.user?.email,
            newTrabajadorId: newUser?.id
        });

        // Registrar el cambio en auditoría
        if (req.user && req.user.id) {
            try {
                console.log('🔄 Registrando creación de trabajador por empleador:', req.user.id);
                
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'crear_trabajador',
                    tabla_afectada: 'usuarios',
                    registro_id: newUser.id,
                    descripcion: `Trabajador creado: ${nombre} ${apellido_pat || ''} (${email}) por empleador`,
                    datos_anteriores: null,
                    datos_nuevos: JSON.stringify({
                        nombre,
                        apellido_pat,
                        apellido_mat,
                        email,
                        rol,
                        rut,
                        estado
                    }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Cambio de creación de trabajador registrado en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio en auditoría:', auditError);
            }
        } else {
            console.warn('⚠️ No se pudo registrar creación de trabajador en auditoría:', {
                hasReqUser: !!req.user,
                userId: req.user?.id,
                reason: !req.user ? 'req.user no existe' : 'req.user.id no existe'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Trabajador creado exitosamente',
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                apellido_pat: newUser.apellido_pat,
                apellido_mat: newUser.apellido_mat,
                email: newUser.email,
                rol: newUser.rol,
                rut: newUser.rut,
                estado: newUser.estado
            }
        });

    } catch (error) {
        console.error('Error creating trabajador:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Eliminar usuario (solo para admins)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user; // Usuario autenticado que hace la petición

        // Prevenir que un admin se elimine a sí mismo
        if (currentUser.id == id) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta'
            });
        }

        // Verificar que el usuario existe
        const userToDelete = await UserModel.findById(id);
        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Eliminar usuario
        await UserModel.delete(id);

        // Registrar el cambio en auditoría
        if (req.user && req.user.id) {
            try {
                // Traducir rol al español
                const traducirRol = (rol) => {
                    switch (rol) {
                        case 'admin': return 'Administrador'
                        case 'empleador': return 'Empleador'
                        case 'trabajador': return 'Trabajador'
                        case 'fiscalizador': return 'Fiscalizador'
                        default: return rol
                    }
                }

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'eliminar_usuario',
                    tabla_afectada: 'usuarios',
                    registro_id: id,
                    descripcion: `Usuario eliminado: ${userToDelete.nombre} ${userToDelete.apellido_pat || ''} (${userToDelete.email}) - Rol: ${traducirRol(userToDelete.rol)}`,
                    datos_anteriores: JSON.stringify({
                        nombre: userToDelete.nombre,
                        apellido_pat: userToDelete.apellido_pat,
                        apellido_mat: userToDelete.apellido_mat,
                        email: userToDelete.email,
                        rol: userToDelete.rol,
                        rut: userToDelete.rut,
                        estado: userToDelete.estado
                    }),
                    datos_nuevos: null,
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Cambio de eliminación de usuario registrado en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio en auditoría:', auditError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        
        // Manejar errores específicos
        let errorMessage = 'Error interno del servidor';
        let statusCode = 500;

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            errorMessage = 'No se puede eliminar el usuario porque tiene datos relacionados (turnos, marcaciones, etc.)';
            statusCode = 409; // Conflict
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            errorMessage = 'Usuario no encontrado';
            statusCode = 404;
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = 'Error en la estructura de datos';
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Obtiene todas las empresas disponibles para asignar a trabajadores
 * Utilizado en el modal de unión trabajador-empresa
 */
const getAllEmpresas = async (req, res) => {
    try {
        // Importar el modelo de empresas dinámicamente para evitar dependencias circulares
        const { default: EmpresaModel } = await import('../model/EmpresaModel.js');
        
        const empresas = await EmpresaModel.getAllEmpresas();
        
        res.status(200).json(empresas);
    } catch (error) {
        console.error('Error obteniendo empresas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empresas',
            error: error.message
        });
    }
};

/**
 * Obtiene todas las relaciones usuario-empresa existentes
 * Permite determinar qué usuarios ya tienen empresa asignada
 */
const getUsuariosEmpresas = async (req, res) => {
    try {
        const relaciones = await UsuarioEmpresaModel.getAllUsuariosEmpresas();
        
        res.status(200).json(relaciones);
    } catch (error) {
        console.error('Error obteniendo relaciones usuario-empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener relaciones usuario-empresa',
            error: error.message
        });
    }
};

/**
 * Crea una nueva relación usuario-empresa
 * Se ejecuta cuando se une un trabajador a una empresa desde el frontend
 */
const createUsuarioEmpresa = async (req, res) => {
    try {
        const { usuario_id, empresa_id, rol_en_empresa, fecha_inicio } = req.body;
        
        // Validación de datos requeridos
        if (!usuario_id || !empresa_id) {
            return res.status(400).json({
                success: false,
                message: 'usuario_id y empresa_id son requeridos'
            });
        }

        // Verificar que el usuario existe
        const usuario = await UserModel.findById(usuario_id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el usuario ya tiene una empresa asignada
        const relacionExistente = await UsuarioEmpresaModel.getUsuarioEmpresaById(usuario_id);
        if (relacionExistente) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya tiene una empresa asignada'
            });
        }

        // Crear la relación usuario-empresa
        const datosRelacion = {
            usuario_id,
            empresa_id,
            rol_en_empresa: rol_en_empresa || usuario.rol, // Usar el rol del usuario si no se especifica
            fecha_inicio: fecha_inicio || new Date().toISOString().split('T')[0]
        };

        const nuevaRelacion = await UsuarioEmpresaModel.createUsuarioEmpresa(datosRelacion);
        
        // Registrar el cambio en auditoría
        if (req.user && req.user.id) {
            try {
                // Obtener nombre de la empresa para la descripción
                let nombreEmpresa = 'Empresa desconocida';
                try {
                    const { default: EmpresaModel } = await import('../model/EmpresaModel.js');
                    const empresa = await EmpresaModel.getEmpresaById(empresa_id);
                    nombreEmpresa = empresa?.emp_nombre || `Empresa ID: ${empresa_id}`;
                } catch (empresaError) {
                    console.warn('No se pudo obtener información de la empresa');
                }

                // Traducir rol al español
                const traducirRol = (rol) => {
                    switch (rol) {
                        case 'admin': return 'Administrador'
                        case 'empleador': return 'Empleador'
                        case 'trabajador': return 'Trabajador'
                        case 'fiscalizador': return 'Fiscalizador'
                        default: return rol
                    }
                }

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'asignar_trabajador',
                    tabla_afectada: 'usuario_empresa',
                    registro_id: nuevaRelacion.id || usuario_id,
                    descripcion: `Trabajador asignado: ${usuario.nombre} ${usuario.apellido_pat || ''} a empresa "${nombreEmpresa}" como ${traducirRol(rol_en_empresa || usuario.rol)}`,
                    datos_anteriores: null,
                    datos_nuevos: JSON.stringify({
                        usuario_id,
                        empresa_id,
                        rol_en_empresa: rol_en_empresa || usuario.rol,
                        fecha_inicio: datosRelacion.fecha_inicio
                    }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Cambio de asignación de trabajador registrado en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio en auditoría:', auditError);
            }
        }
        
        res.status(201).json({
            success: true,
            data: nuevaRelacion,
            message: 'Usuario asignado a empresa exitosamente'
        });
        
    } catch (error) {
        console.error('Error creando relación usuario-empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar usuario a empresa',
            error: error.message
        });
    }
};



const createSolicitud = async (req, res) => {
    try {
        console.log('📥 Recibiendo formData en createSolicitud:', req.body);
        console.log('📎 Archivo recibido:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No hay archivo');
        

        const user = req.user;
        const userEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(user.id);


        // Validar que se recibieron los datos necesarios
        const { tipo, datos } = req.body;
        if (!tipo || !datos) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere tipo y datos de la solicitud'
            });
        }

        // Procesar datos (parsear si es string)
        let datosProcessados = datos;
        if (typeof datos === 'string') {
            try {
                datosProcessados = JSON.parse(datos);
            } catch (error) {
                console.error('Error al parsear datos:', error);
                datosProcessados = datos;
            }
        }


        console.log(datosProcessados);

        // Preparar objeto de solicitud
        const solicitud = {
            id_usuario_empresa: userEmpresa ? userEmpresa.id : null,
            tipo: 'solicitud',
            subtipo: tipo,
            titulo: `Solicitud de tipo: ${tipo}, por usuario ${userEmpresa.usuario_nombre}`,
            descripcion: datosProcessados.motivo || 'Sin motivo especificado',
            fecha_inicio: datosProcessados.fecha_inicio || null,
            fecha_fin: datosProcessados.fecha_fin || null,
        };




        // Si hay archivo adjunto - usar FileUploadService
        if (req.file) {
            const fileInfo = FileUploadService.getFileInfo(req.file, 'solicitudes');
            solicitud.documento_adjunto = fileInfo.url;
            solicitud.archivo_nombre = fileInfo.nombre;
            solicitud.archivo_tamaño = fileInfo.tamaño;
            solicitud.archivo_mimetype = fileInfo.mimetype;
        }

        

        console.log('✅ Solicitud procesada:', solicitud);
        
        await SolicitudesUsuariosModel.crear(solicitud);
        
        res.status(501).json({
            success: true,
            message: 'Solicitud recibida correctamente',
            data: solicitud
        });
        
    } catch (error) {
        console.error('Error procesando solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud',
            error: error.message
        });
    }
}

const getSolicitudes = async (req, res) => {
    try {
        const user = req.user;
        const userEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaById(user.id);
        const solicitudes = await SolicitudesUsuariosModel.obtenerPorUsuarioEmpresa(userEmpresa.id);
        console.log('📋 Solicitudes obtenidas para usuario_empresa_id', userEmpresa.id, ':', solicitudes);
        //console.log('✅ Solicitudes obtenidas:', solicitudes);
        res.status(200).json({
            success: true,
            data: solicitudes
        });
    } catch (error) {
        console.error('Error obteniendo solicitudes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las solicitudes',
            error: error.message
        });
    }
}

const UserController = {
    updateEmail,
    updatePassword,
    createReporte,
    createAdmin,
    listAdmins,
    listAllUsers,
    updateEstado,
    updateRol, // Se agrega para edición de rol desde rutas
    createUser, // Nuevo endpoint para crear usuarios
    createTrabajador, // Nuevo endpoint para que empleadores creen trabajadores
    deleteUser, // Nuevo endpoint para eliminar usuarios
    getAllEmpresas, // Obtener empresas para modal de unión
    getUsuariosEmpresas, // Obtener relaciones usuario-empresa
    createUsuarioEmpresa, // Crear relación usuario-empresa
    listAdmins,
    createSolicitudMarcacion,
    createSolicitud,
    getSolicitudes
}

export default UserController;