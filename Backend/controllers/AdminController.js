import AuthService from "../services/authservice.js";
import UserModel from "../model/UserModel.js";
import TurnosModel from "../model/TurnosModel.js";
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
                        rol: userData.rol,
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

const createTurno = async (req, res) => {
    try {
        const turnoData = req.body;

        // Validar campos requeridos - evita errores de base de datos
        if (!turnoData.usuario_id) {
            return res.status(400).json({ 
                success: false, 
                message: "El ID del usuario es requerido" 
            });
        }
        if (!turnoData.tipo) {
            return res.status(400).json({ 
                success: false, 
                message: "El tipo de turno es requerido" 
            });
        }
        if (!turnoData.dia) {
            return res.status(400).json({ 
                success: false, 
                message: "El día es requerido" 
            });
        }
        if (!turnoData.inicio || !turnoData.fin) {
            return res.status(400).json({ 
                success: false, 
                message: "Las horas de inicio y fin son requeridas" 
            });
        }

        // Verificar si ya existe un turno para este usuario en este día - evita duplicados
        const existingTurno = await TurnosModel.obtenerTurnoPorUsuarioYDia(turnoData.usuario_id, turnoData.dia);
        if (existingTurno) {
            return res.status(400).json({ 
                success: false, 
                message: "Ya existe un turno para este trabajador en el día seleccionado" 
            });
        }

        // Crear el turno con los datos validados
        const newTurno = await TurnosModel.createTurno(turnoData);

        // Registrar la asociación de turno en auditoría - permite seguimiento de cambios de admin
        if (req.user && req.user.id) {
            try {
                // Obtener información del trabajador para el registro de auditoría
                const trabajador = await UserModel.findById(turnoData.usuario_id);
                const nombreTrabajador = trabajador ? `${trabajador.nombre} ${trabajador.apellido_pat || ''}`.trim() : 'Trabajador desconocido';
                
                // Traducir día al español para mejor legibilidad
                const diasEspanol = {
                    'lunes': 'Lunes',
                    'martes': 'Martes', 
                    'miercoles': 'Miércoles',
                    'jueves': 'Jueves',
                    'viernes': 'Viernes',
                    'sabado': 'Sábado',
                    'domingo': 'Domingo'
                };
                const diaEspanol = diasEspanol[turnoData.dia.toLowerCase()] || turnoData.dia;

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'asignar_turno_trabajador',
                    tabla_afectada: 'turnos',
                    registro_id: newTurno,
                    descripcion: `Turno asignado a trabajador: ${nombreTrabajador} - ${turnoData.tipo} (${diaEspanol} ${turnoData.inicio}-${turnoData.fin})`,
                    datos_anteriores: null,
                    datos_nuevos: JSON.stringify({
                        usuario_id: turnoData.usuario_id,
                        trabajador_nombre: nombreTrabajador,
                        tipo: turnoData.tipo,
                        dia: turnoData.dia,
                        inicio: turnoData.inicio,
                        fin: turnoData.fin,
                        colacion_inicio: turnoData.colacion_inicio,
                        colacion_fin: turnoData.colacion_fin
                    }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Asignación de turno registrada en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar asignación de turno en auditoría:', auditError);
            }
        }

        res.status(201).json({ 
            success: true, 
            message: "Turno creado exitosamente",
            data: { id: newTurno }
        });
    } catch (error) {
        console.error("Error creating turno:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};

// Eliminar turno por ID - permite borrar turnos asignados específicos  
const deleteTurno = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID del turno sea válido
        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "ID de turno inválido" 
            });
        }

        // Verificar que el turno existe antes de eliminarlo
        const turnoExistente = await TurnosModel.getTurnoById(id);
        if (!turnoExistente) {
            return res.status(404).json({ 
                success: false, 
                message: "Turno no encontrado" 
            });
        }

        // Eliminar el turno de la base de datos
        const turnoEliminado = await TurnosModel.deleteTurno(id);
        
        if (turnoEliminado === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No se pudo eliminar el turno" 
            });
        }

        // Registrar la eliminación de turno en auditoría - permite seguimiento de cambios de admin
        if (req.user && req.user.id && turnoExistente) {
            try {
                // Obtener información del trabajador para el registro de auditoría
                const trabajador = await UserModel.findById(turnoExistente.usuario_id);
                const nombreTrabajador = trabajador ? `${trabajador.nombre} ${trabajador.apellido_pat || ''}`.trim() : 'Trabajador desconocido';
                
                // Traducir día al español para mejor legibilidad
                const diasEspanol = {
                    'lunes': 'Lunes',
                    'martes': 'Martes', 
                    'miercoles': 'Miércoles',
                    'jueves': 'Jueves',
                    'viernes': 'Viernes',
                    'sabado': 'Sábado',
                    'domingo': 'Domingo'
                };
                const diaEspanol = diasEspanol[turnoExistente.dia?.toLowerCase()] || turnoExistente.dia;

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'eliminar_turno_trabajador',
                    tabla_afectada: 'turnos',
                    registro_id: id,
                    descripcion: `Turno eliminado de trabajador: ${nombreTrabajador} - ${turnoExistente.tipo} (${diaEspanol} ${turnoExistente.inicio}-${turnoExistente.fin})`,
                    datos_anteriores: JSON.stringify({
                        usuario_id: turnoExistente.usuario_id,
                        trabajador_nombre: nombreTrabajador,
                        tipo: turnoExistente.tipo,
                        dia: turnoExistente.dia,
                        inicio: turnoExistente.inicio,
                        fin: turnoExistente.fin,
                        colacion_inicio: turnoExistente.colacion_inicio,
                        colacion_fin: turnoExistente.colacion_fin
                    }),
                    datos_nuevos: null,
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Eliminación de turno registrada en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar eliminación de turno en auditoría:', auditError);
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Turno eliminado exitosamente" 
        });
    } catch (error) {
        console.error("Error deleting turno:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
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
const obtenerTurnos = async (req, res) => {
    try {
        const { rut } = req.params;

        const turnos = [];

        // obtener trabajadores
        const trabajadores = await UsuarioEmpresaModel.getUsuariosByEmpresaRut(rut);
        // para cada trabajador obtener sus turnos e incluir información del trabajador
        
        for (const trabajador of trabajadores) {
            const trabajadorTurnos = await TurnosModel.getTurnosByUsuarioId(trabajador.id);
            const turnosConInfoTrabajador = trabajadorTurnos.map(turno => ({
                ...turno,
                trabajador: {
                    id: trabajador.id,
                    nombre: trabajador.usuario_nombre,
                    apellido_pat: trabajador.usuario_apellido_pat,
                    apellido_mat: trabajador.usuario_apellido_mat,
                    rut: trabajador.usuario_rut,
                    iniciales: trabajador.usuario_nombre.charAt(0) + (trabajador.usuario_apellido_pat ? trabajador.usuario_apellido_pat.charAt(0) : '')
                }
            }));
            turnos.push(...turnosConInfoTrabajador);
        }
        
        res.status(200).json({ success: true, data: turnos });
    } catch (error) {
        console.error("Error fetching turnos:", error);
        res.status(500).json({ error: "Internal server error" });
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
    deleteTurno, // agregar método de eliminación
    obtenerTurnos
};



export default AdminController;