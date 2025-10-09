import AuthService from "../services/authservice.js";
import UserModel from "../model/UserModel.js";
import TurnosModel from "../model/TurnosModel.js";
import UsuarioEmpresaModel from "../model/UsuarioEmpresaModel.js";
import ResolucionModel from "../model/usuarios_empresas_resoluciones.js";
import ReporteMarcacionesModel from "../model/ReportesModel.js";
import EmpresaModel from "../model/EmpresaModel.js";
import MarcacionesServices from "../services/MarcacionesServices.js";
import { DateTime } from "luxon";
import ReportesModel from "../model/ReportesModel.js";
import EstAsignacionesModel from "../model/EstAsignacionesModel.js";
import NotificacionService from "../services/NotificacionService.js";
import AuditoriaModel from "../model/AuditoriaModel.js";






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
                console.log('🔄 Registrando creación de trabajador por empleador (UserEmpresaController):', req.user.id);
                
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'crear_trabajador_empresa',
                    tabla_afectada: 'usuarios',
                    registro_id: newUser.id,
                    descripcion: `Trabajador creado en empresa: ${userData.nombre} ${userData.apellido_pat || ''} (${userData.email}) - Empresa: ${empresa.emp_nombre || 'Sin nombre'}`,
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
                console.log('✅ Cambio de creación de trabajador registrado en auditoría (UserEmpresaController)');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio en auditoría:', auditError);
            }
        } else {
            console.warn('⚠️ No se pudo registrar creación de trabajador en auditoría (UserEmpresaController):', {
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
            



        res.status(201).json({ success: true, message: "Trabajador creado exitosamente" });
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

        // Registrar la asociación de turno en auditoría - permite seguimiento de cambios de empleador
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

        // Registrar la eliminación de turno en auditoría - permite seguimiento de cambios de empleador
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

// Guardar configuración del sistema empresarial - permite personalizar ajustes
const guardarConfiguracion = async (req, res) => {
    try {
        const configuracionData = req.body;
        const USR_PETICION = req.user; // usuario que genera la consulta

        // Validar que el usuario tenga permisos para modificar configuración
        if (!USR_PETICION || (USR_PETICION.rol !== 'empleador' && USR_PETICION.rol !== 'admin')) {
            return res.status(403).json({ 
                success: false, 
                message: "No tiene permisos para modificar la configuración del sistema" 
            });
        }

        // Obtener empresa del usuario
        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        if (!empresa) {
            return res.status(404).json({ 
                success: false, 
                message: "Empresa no encontrada" 
            });
        }

        // Por ahora simularemos el guardado - aquí se implementaría el guardado real en BD
        console.log('Guardando configuración para empresa:', empresa.empresa_id);
        console.log('Configuración recibida:', configuracionData);

        // Registrar el cambio en auditoría - permite seguimiento de configuraciones
        if (USR_PETICION.id) {
            try {
                await AuditoriaModel.registrarCambio({
                    usuario_id: USR_PETICION.id,
                    accion: 'modificar_configuracion_sistema',
                    tabla_afectada: 'configuracion_empresa',
                    registro_id: empresa.empresa_id,
                    descripcion: `Configuración del sistema actualizada - Empresa: ${empresa.emp_nombre || 'Sin nombre'}`,
                    datos_anteriores: null, // Aquí se podría obtener la configuración anterior
                    datos_nuevos: JSON.stringify(configuracionData),
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Cambio de configuración registrado en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar cambio de configuración en auditoría:', auditError);
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Configuración guardada exitosamente",
            data: { empresa_id: empresa.empresa_id }
        });
    } catch (error) {
        console.error("Error saving configuration:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};

// Obtener configuración actual del sistema empresarial
const obtenerConfiguracion = async (req, res) => {
    try {
        const USR_PETICION = req.user; // usuario que genera la consulta

        // Obtener empresa del usuario
        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        if (!empresa) {
            return res.status(404).json({ 
                success: false, 
                message: "Empresa no encontrada" 
            });
        }

        // Por ahora retornamos configuración por defecto - aquí se obtendría de la BD
        const configuracionDefecto = {
            general: {
                emp_nombre: empresa.emp_nombre || 'TeleMedios S.A.',
                emp_rut: empresa.emp_rut || '76.123.456-7',
                direccion: 'Av. Providencia 1234, Santiago, Chile',
                zona_horaria: 'America/Santiago',
                idioma: 'español',
                formato_fecha: 'DD/MM/YYYY'
            },
            marcaciones: {
                tolerancia_entrada: 15,
                tolerancia_salida: 10,
                ubicacion_requerida: true,
                marcacion_remota: false,
                consentimiento_trabajador: 'siempre',
                tiempo_limite_modificacion: 24
            },
            turnos: {
                turno_manana: { activo: true, inicio: '09:00', fin: '17:00', descanso: 60 },
                turno_tarde: { activo: false, inicio: '14:00', fin: '22:00', descanso: 45 }
            },
            notificaciones: {
                email_tardanzas: true,
                email_ausencias: true,
                email_incidentes: false,
                servidor_smtp: 'smtp.empresa.com',
                puerto_smtp: 587,
                email_envio: 'sistema@empresa.com'
            }
        };

        res.status(200).json({ 
            success: true, 
            data: configuracionDefecto
        });
    } catch (error) {
        console.error("Error getting configuration:", error);
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

        // trabajadores que son de una est
        const trabajadoresDeEst = await EstAsignacionesModel.getTrabajadoresByUsuariaId(empresa.empresa_id);

        console.log("trabajadoresDeEst:", trabajadoresDeEst);
        console.log("trabajadores:", trabajadores);

        // juntar ambos arrays  y a los trabajadores de est agregarle un campo est = true
        const trabajadoresMap = new Map();

        trabajadores.forEach(trabajador => {
            trabajadoresMap.set(trabajador.id, { ...trabajador, esDeEst: false });
        });
        trabajadoresDeEst.forEach(trabajador => {
            trabajadoresMap.set(trabajador.id, { ...trabajador, esDeEst: true });
        }
        );

        const trabajadoresUnicos = Array.from(trabajadoresMap.values());
        console.log("trabajadoresUnicos:", trabajadoresUnicos);

        res.status(200).json({ success: true, data: trabajadoresUnicos });
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

        // agregar trabajadores est
        const trabajadoresDeEst = await EstAsignacionesModel.getTrabajadoresByUsuariaId(req.user.empresa_id);
        

        // agregar trabajadores de est al array de trabajadores si no existen ya
        for (const trabajadorEst of trabajadoresDeEst) {
            if (!trabajadores.find(t => t.id === trabajadorEst.id)) {
                trabajadores.push(trabajadorEst);
            }
        }


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

const obtenerReportesMarcaciones = async (req, res) => {
    try {
        const { rut } = req.params;
        const empresa = await EmpresaModel.getEmpresaByRut(rut);
        const reportes = await ReporteMarcacionesModel.findByEmpresaId(req.user.empresa_id);
        // obtener trabajadores de la empresa que son de una empresa EST 
        const trabajadoresDeEst = await EstAsignacionesModel.getTrabajadoresByUsuariaId(req.user.empresa_id);


        // para cada trabajador de est obtener sus reportes
        //
        const reportesTrabajadoresDeEst = await Promise.all(
            trabajadoresDeEst.map(trabajador => 
            ReporteMarcacionesModel.findByUsuarioId(trabajador.id)
            )
        ).then(reportesArrays => reportesArrays.flat());
        
       // unir ambos arrays de reportes
        reportes.push(...reportesTrabajadoresDeEst);

        // agregar info del trabajador a cada reporte
        // para cada reporte, incluir info de la marcacion
        for (let reporte of reportes) {   
            const marcacion = await MarcacionesServices.obtenerMarcacionPorId(reporte.marcacion_id);

            if (!marcacion || !marcacion.data) {
                console.log("No se encontró la marcación para el reporte:", reporte);
                continue; // saltar si no se encuentra la marcación
            }
            reporte.nombreTrabajador = marcacion.data.nombre;
            reporte.horaOriginal = marcacion.data.hora;
            reporte.tipoMarcacion = marcacion.data.tipo;
        }
        // cargar reportes que corresponden a trabajadores de una est

        


    res.status(200).json({
      success: true,
      data: reportes,
      message: "Reportes de marcaciones obtenidos exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los reportes de marcaciones",
      error: error.message
    });
  }
}


const aprobarCambioMarcacion = async (req, res) => {
    try {
        const { reporteId } = req.params;
        // obtener reporte
        let reporte = await ReporteMarcacionesModel.findById(reporteId);
        console.log("reporte a aprobar:", reporte);
        if (!reporte) {
            return res.status(404).json({ success: false, message: "Reporte no encontrado" });
        }
        const datosCambios = {
            tipo: reporte.tipo,
        };
        // actualizar marcacion
        //await ReportesModel.aprobar(reporteId);
        if (reporte.tipo === 'modificar') {

            // obtener marcacion original
            const marcacionOriginal = await MarcacionesServices.obtenerMarcacionPorId(reporte.marcacion_id);

            // agregar datos de la marcacion original al objeto datosCambios
            datosCambios.marcacionOriginal = marcacionOriginal.data;

            if (reporte.fecha_correcta){
                //await MarcacionesServices.updateFechaMarcacion(reporte.marcacion_id, reporte.fecha_correcta );
                datosCambios.fechaModificada = marcacionOriginal.data.fecha;
            }
            if (reporte.hora_correcta){
               // await MarcacionesServices.updateHoraMarcacion(reporte.marcacion_id, reporte.hora_correcta );
                datosCambios.horaModificada = marcacionOriginal.data.hora;
            }

            //await ReporteMarcacionesModel.aprobar(reporteId);
        } else if (reporte.tipo === 'agregar') {
            // crear nueva marcacion
                //await MarcacionesServices.insertarMarcacionManual(reporte.usuario_id,reporte.tipo_marcacion_correcta,reporte.fecha_correcta,reporte.hora_correcta);
                
                

                datosCambios.fechaNueva = reporte.fecha_correcta;
                datosCambios.horaNueva = reporte.hora_correcta;
                datosCambios.tipoNueva = reporte.tipo_marcacion_correcta;

        }
                

        await ReporteMarcacionesModel.cambiarEstado(reporteId, 'POR CONFIRMAR');
        const reporteActualizado = await ReportesModel.findById(reporteId);

        if (reporte.tipo === 'modificar') {
            NotificacionService.enviarNotificacionConfirmacionModificacionMarcacion(reporte, datosCambios, datosCambios.marcacionOriginal);
        } else if (reporte.tipo === 'agregar') {
            // agregar informacion del usuario a datosCambios
            const usuario = await UsuarioEmpresaModel.obtenerUsuarioByID(reporte.usuario_id);
            datosCambios.usuario = usuario;
            NotificacionService.enviarNotificacionConfirmacionNuevaMarcacion(reporte, datosCambios);
        }

        
        res.status(200).json({ success: true, message: "Reporte aprobado", data: reporteActualizado });
    } catch (error) {
        console.error("Error aprobando reporte de marcación:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

const rechazarCambioMarcacion = async (req, res) => {
    try {
        const { reporteId } = req.params;
        // obtener reporte
        const reporte = await ReporteMarcacionesModel.findById(reporteId);
        if (!reporte) {
            return res.status(404).json({ success: false, message: "Reporte no encontrado" });
        }
        // rechazar reporte
        await ReportesModel.rechazar(reporteId);

        const reporteActualizado = await ReportesModel.findById(reporteId);

        res.status(200).json({ success: true, message: "Reporte rechazado", data: reporteActualizado });
    } catch (error) {
        console.error("Error rechazando reporte de marcación:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};


const AdminController = {
    createTrabajador,
    obtenerTrabajadores,
    enrolarTrabajador,
    createTurno,
    deleteTurno, // agregar método de eliminación
    obtenerTurnos,
    guardarConfiguracion, // nueva funcionalidad de configuración
    obtenerConfiguracion, // obtener configuración actual
    obtenerReportesMarcaciones,
    aprobarCambioMarcacion,
    rechazarCambioMarcacion
};



export default AdminController;