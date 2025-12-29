import AuthService from "../services/authservice.js";
import UserModel from "../model/UserModel.js";
import TurnosModel from "../model/TurnosModel.js";
import TipoTurnosModel from "../model/TipoTurnosModel.js";
import AsignacionTurnosModel from "../model/AsignacionTurnosModel.js";
import UsuarioEmpresaModel from "../model/UsuarioEmpresaModel.js";
import ResolucionModel from "../model/usuarios_empresas_resoluciones.js";
import AuditoriaModel from "../model/AuditoriaModel.js";
import { DateTime } from "luxon";






const createTrabajador = async (req, res) => {
    try {
        const userData = req.body;
        const USR_PETICION = req.user; // usuario que genera la consulta


        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);

        // Verificar si ya existe un usuario con este RUT o email
        const existingUserByRut = await UserModel.findByRut(userData.rut);
        if (existingUserByRut) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una cuenta para este trabajador con el RUT proporcionado"
            });
        }

        const existingUserByEmail = await UserModel.findByEmail(userData.email);
        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una cuenta para este trabajador con el email proporcionado"
            });
        }

        const newUser = await AuthService.registerUser(
            userData.email,
            userData.password,
            userData.nombre,
            userData.apellido_pat,
            userData.apellido_mat,
            userData.rol,
            userData.rut,
            userData.estado
        );

        // si new user throw error
        if (!newUser) {
            return res.status(400).json({ success: false, message: "Error creando trabajador" });
        }

        const newUserEmpresa = await UsuarioEmpresaModel.createUsuarioEmpresa({
            usuario_id: newUser.id,
            empresa_id: empresa.empresa_id,
            fecha_inicio: DateTime.now().setZone("America/Santiago").toISO(),
        });

        // MULTI-ROL: Asignar rol en la tabla usuarios_roles_asignados
        try {
            const UsuariosRolesAsignadosModel = (await import('../model/UsuariosRolesAsignadosModel.js')).default;
            const RolesSistemaModel = (await import('../model/RolesSistemaModel.js')).default;

            // Obtener el ID del rol desde roles_sistema
            const rolSistema = await RolesSistemaModel.findBySlug(userData.rol || 'trabajador');
            if (rolSistema) {
                await UsuariosRolesAsignadosModel.assignRole(newUserEmpresa.id, rolSistema.id);
                console.log(`✅ Rol '${userData.rol}' asignado al usuario en usuarios_roles_asignados`);
            } else {
                console.warn(`⚠️ No se encontró el rol '${userData.rol}' en roles_sistema`);
            }
        } catch (roleError) {
            console.error('❌ Error al asignar rol en usuarios_roles_asignados:', roleError);
            // No bloqueamos la creación del trabajador por este error
        }

        // Registrar el cambio en auditoría
        if (req.user && req.user.id) {
            try {
                console.log('🔄 Registrando creación de trabajador por empleador (AdminController):', req.user.id);

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'crear_trabajador_admin',
                    tabla_afectada: 'usuarios',
                    registro_id: newUser.id,
                    descripcion: `Trabajador creado por empleador: ${userData.nombre} ${userData.apellido_pat || ''} (${userData.email}) - Empresa: ${empresa.emp_nombre || 'Sin nombre'}`,
                    datos_anteriores: null,
                    datos_nuevos: JSON.stringify({
                        nombre: userData.nombre,
                        apellido_pat: userData.apellido_pat,
                        apellido_mat: userData.apellido_mat,
                        email: userData.email,
                        rut: userData.rut,
                        estado: userData.estado,
                        empresa_id: empresa.empresa_id
                    }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Cambio de creación de trabajador registrado en auditoría (AdminController)');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio en auditoría:', auditError);
            }
        } else {
            console.warn('⚠️ No se pudo registrar creación de trabajador en auditoría (AdminController):', {
                hasReqUser: !!req.user,
                userId: req.user?.id,
                reason: !req.user ? 'req.user no existe' : 'req.user.id no existe'
            });
        }

        if (userData.sistemaExcepcional && userData.sistemaExcepcional === true) {
            // crear resolucion para este usuario empresa
            ResolucionModel.create({
                usuario_empresa_id: newUserEmpresa.id,
                resolucion_numero: userData.numeroResolucion || 'EX-2024-00001',
                resolucion_fecha: userData.fechaResolucion || DateTime.now().setZone("America/Santiago").toISODate()
            });
        }




        res.status(500).json({ success: true, message: "Trabajador creado exitosamente" });
    } catch (error) {
        console.error("Error creating trabajador:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Nuevo: Obtener tipos de turno disponibles
const obtenerTiposTurnos = async (req, res) => {
    try {
        const tiposTurnos = await TipoTurnosModel.getAllWithDias();
        res.status(200).json({
            success: true,
            data: tiposTurnos
        });
    } catch (error) {
        console.error("Error obteniendo tipos de turnos:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener tipos de turnos",
            error: error.message
        });
    }
};

// Nuevo: Crear tipo de turno
const crearTipoTurno = async (req, res) => {
    try {
        const tipoTurnoData = req.body;
        const USR_PETICION = req.user;

        // Validar que sea empleador o admin
        if (!USR_PETICION || (USR_PETICION.rol !== 'empleador' && USR_PETICION.rol !== 'admin')) {
            return res.status(403).json({
                success: false,
                message: "No tiene permisos para crear tipos de turno"
            });
        }

        // Validar campos requeridos
        if (!tipoTurnoData.nombre || !tipoTurnoData.hora_inicio || !tipoTurnoData.hora_fin) {
            return res.status(400).json({
                success: false,
                message: "Nombre, hora de inicio y hora de fin son requeridos"
            });
        }

        // Validar que se proporcionen días de trabajo
        if (!tipoTurnoData.dias || !Array.isArray(tipoTurnoData.dias) || tipoTurnoData.dias.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Debe especificar al menos un día de trabajo"
            });
        }

        const nuevoTipoId = await TipoTurnosModel.create(tipoTurnoData);

        // Registrar en auditoría
        if (req.user && req.user.id) {
            try {
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'crear_tipo_turno',
                    tabla_afectada: 'tipo_turnos',
                    registro_id: nuevoTipoId,
                    descripcion: `Tipo de turno creado: ${tipoTurnoData.nombre}`,
                    datos_nuevos: JSON.stringify(tipoTurnoData),
                    ip_address: req.ip || req.connection.remoteAddress
                });
            } catch (auditError) {
                console.error('Error al registrar en auditoría:', auditError);
            }
        }

        res.status(201).json({
            success: true,
            message: "Tipo de turno creado exitosamente",
            data: { id: nuevoTipoId }
        });
    } catch (error) {
        console.error("Error creando tipo de turno:", error);
        res.status(500).json({
            success: false,
            message: "Error al crear tipo de turno",
            error: error.message
        });
    }
};

// Refactorizar: Crear asignación de turno
const createTurno = async (req, res) => {
    try {
        const asignacionData = req.body;
        const USR_PETICION = req.user;

        // Validar campos requeridos
        if (!asignacionData.usuario_empresa_id) {
            return res.status(400).json({
                success: false,
                message: "El ID del usuario empresa es requerido"
            });
        }
        if (!asignacionData.tipo_turno_id) {
            return res.status(400).json({
                success: false,
                message: "El tipo de turno es requerido"
            });
        }
        if (!asignacionData.fecha_inicio) {
            return res.status(400).json({
                success: false,
                message: "La fecha de inicio es requerida"
            });
        }

        // Verificar si ya existe una asignación activa
        const asignacionActiva = await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(
            asignacionData.usuario_empresa_id,
            asignacionData.fecha_inicio
        );

        if (asignacionActiva) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una asignación de turno activa para este trabajador en este período"
            });
        }

        const nuevaAsignacionId = await AsignacionTurnosModel.create(asignacionData);

        // Obtener información para auditoría
        const usuarioEmpresa = await UsuarioEmpresaModel.findById(asignacionData.usuario_empresa_id);
        const trabajador = usuarioEmpresa ? await UserModel.findById(usuarioEmpresa.usuario_id) : null;
        const tipoTurno = await TipoTurnosModel.getById(asignacionData.tipo_turno_id);
        const nombreTrabajador = trabajador ? `${trabajador.nombre} ${trabajador.apellido_pat || ''}`.trim() : 'Trabajador desconocido';

        // Registrar en auditoría
        if (req.user && req.user.id) {
            try {
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'asignar_turno_trabajador',
                    tabla_afectada: 'asignacion_turnos',
                    registro_id: nuevaAsignacionId,
                    descripcion: `Turno asignado a trabajador: ${nombreTrabajador} - ${tipoTurno?.nombre || 'Turno'} desde ${asignacionData.fecha_inicio}`,
                    datos_nuevos: JSON.stringify({
                        usuario_empresa_id: asignacionData.usuario_empresa_id,
                        trabajador_nombre: nombreTrabajador,
                        tipo_turno: tipoTurno?.nombre,
                        fecha_inicio: asignacionData.fecha_inicio,
                        fecha_fin: asignacionData.fecha_fin
                    }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
            } catch (auditError) {
                console.error('Error al registrar en auditoría:', auditError);
            }
        }

        res.status(201).json({
            success: true,
            message: "Turno asignado exitosamente",
            data: { id: nuevaAsignacionId }
        });
    } catch (error) {
        console.error("Error asignando turno:", error);
        res.status(500).json({
            success: false,
            message: "Error al asignar turno",
            error: error.message
        });
    }
};

// Refactorizar: Eliminar asignación de turno
const deleteTurno = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de turno inválido"
            });
        }

        const asignacionExistente = await AsignacionTurnosModel.getById(id);
        if (!asignacionExistente) {
            return res.status(404).json({
                success: false,
                message: "Asignación de turno no encontrada"
            });
        }

        const eliminado = await AsignacionTurnosModel.delete(id);

        if (eliminado === 0) {
            return res.status(404).json({
                success: false,
                message: "No se pudo eliminar la asignación de turno"
            });
        }

        // Registrar en auditoría
        if (req.user && req.user.id) {
            try {
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'eliminar_turno_trabajador',
                    tabla_afectada: 'asignacion_turnos',
                    registro_id: id,
                    descripcion: `Asignación de turno eliminada: ${asignacionExistente.tipo_turno_nombre || 'Turno'} - Usuario empresa ID: ${asignacionExistente.usuario_empresa_id}`,
                    datos_anteriores: JSON.stringify(asignacionExistente),
                    ip_address: req.ip || req.connection.remoteAddress
                });
            } catch (auditError) {
                console.error('Error al registrar en auditoría:', auditError);
            }
        }

        res.status(200).json({
            success: true,
            message: "Turno eliminado exitosamente"
        });
    } catch (error) {
        console.error("Error eliminando turno:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar turno",
            error: error.message
        });
    }
};

const obtenerTrabajadores = async (req, res) => {
    try {
        const USR_PETICION = req.user; // usuario que genera la consulta

        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        const trabajadores = await UsuarioEmpresaModel.getUsuariosByRolEnEmpresa(empresa.empresa_id, 'trabajador');

        res.status(200).json({ success: true, data: trabajadores });
    } catch (error) {
        console.error("Error fetching trabajadores:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
// Refactorizar: Obtener turnos
const obtenerTurnos = async (req, res) => {
    try {
        const { rut } = req.params;
        const asignaciones = await AsignacionTurnosModel.getByEmpresaRut(rut);

        // Formatear respuesta con información del trabajador
        const turnosFormateados = asignaciones.map(asignacion => ({
            id: asignacion.id,
            usuario_empresa_id: asignacion.usuario_empresa_id,
            tipo_turno_id: asignacion.tipo_turno_id,
            fecha_inicio: asignacion.fecha_inicio,
            fecha_fin: asignacion.fecha_fin,
            estado: asignacion.estado,
            tipo: asignacion.tipo_turno_nombre,
            inicio: asignacion.hora_inicio,
            fin: asignacion.hora_fin,
            colacion_inicio: asignacion.colacion_inicio,
            colacion_fin: asignacion.colacion_fin,
            dias_trabajo: asignacion.dias_trabajo,
            dias_descanso: asignacion.dias_descanso,
            trabajador: {
                id: asignacion.usuario_empresa_id,
                nombre: asignacion.usuario_nombre,
                apellido_pat: asignacion.apellido_pat,
                apellido_mat: asignacion.apellido_mat,
                rut: asignacion.rut,
                iniciales: asignacion.usuario_nombre.charAt(0) + (asignacion.apellido_pat ? asignacion.apellido_pat.charAt(0) : '')
            }
        }));

        res.status(200).json({
            success: true,
            data: turnosFormateados
        });
    } catch (error) {
        console.error("Error obteniendo turnos:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener turnos",
            error: error.message
        });
    }
};

const enrolarTrabajador = async (req, res) => {
    try {
        const { rut, email, password, rol, nombre, apellido_pat, apellido_mat } = req.body;

        // Verificar si ya existe un usuario con este RUT o email
        const existingUserByRut = await UserModel.findByRut(rut);
        if (existingUserByRut) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una cuenta para este trabajador con el RUT proporcionado"
            });
        }

        const existingUserByEmail = await UserModel.findByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una cuenta para este trabajador con el email proporcionado"
            });
        }

        // Crear el usuario
        const newUser = await AuthService.registerUser(email, password, nombre, apellido_pat, apellido_mat, rol, rut);

        res.status(201).json({
            success: true,
            message: "Trabajador enrolado exitosamente",
            data: newUser
        });
    } catch (error) {
        console.error("Error enrolando trabajador:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

const AdminController = {
    createTrabajador,
    obtenerTrabajadores,
    enrolarTrabajador,
    createTurno,
    deleteTurno,
    obtenerTurnos,
    obtenerTiposTurnos,
    crearTipoTurno
};



export default AdminController;