import AuthService from "../services/authservice.js";
import UserModel from "../model/UserModel.js";
import TurnosModel from "../model/TurnosModel.js";
import TipoTurnosModel from "../model/TipoTurnosModel.js";
import AsignacionTurnosModel from "../model/AsignacionTurnosModel.js";
import UsuarioEmpresaModel from "../model/UsuarioEmpresaModel.js";
import ResolucionModel from "../model/usuarios_empresas_resoluciones.js";
import ReporteMarcacionesModel from "../model/ReportesModel.js";
import EmpresaModel from "../model/EmpresaModel.js";
import MarcacionesServices from "../services/MarcacionesServices.js";
import MarcacionesModel from "../model/MarcacionesModel.js";
import { DateTime } from "luxon";
import ReportesModel from "../model/ReportesModel.js";
import EstAsignacionesModel from "../model/EstAsignacionesModel.js";
import NotificacionService from "../services/NotificacionService.js";
import AuditoriaModel from "../model/AuditoriaModel.js";
import  ConfigToleranciaModel from "../model/ConfigTolerancias.js";





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
        const asignacionData = req.body;
        console.log('Asignación de turno recibida:', asignacionData);
        // Validar campos requeridos
        if (!asignacionData.usuario_empresa_id) {
            return res.status(400).json({ 
                success: false, 
                message: "El usuario_id del trabajador es requerido" 
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

        // Obtener información del trabajador
        
    const trabajador = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(asignacionData.usuario_empresa_id);
        if (!trabajador) {
            return res.status(404).json({ 
                success: false, 
                message: "Trabajador no encontrado" 
            });
        }

        // Obtener información del tipo de turno
        const tipoTurno = await TipoTurnosModel.getById(asignacionData.tipo_turno_id);
        if (!tipoTurno) {
            return res.status(404).json({ 
                success: false, 
                message: "Tipo de turno no encontrado" 
            });
        }

        // Validar si ya tiene turnos creados en el rango de fechas
        // Obtener los días laborables del tipo de turno
        const diasLaborables = await AsignacionTurnosModel.getDiasLaborablesByTipoTurno(asignacionData.tipo_turno_id);
        
        // Obtener turnos existentes del trabajador
        const turnosExistentes = await AsignacionTurnosModel.getByUsuarioEmpresaId(asignacionData.usuario_empresa_id);
        
        // Filtrar solo los turnos activos en el rango de fechas del nuevo turno
        const fechaInicio = new Date(asignacionData.fecha_inicio);
        const fechaFin = asignacionData.fecha_fin ? new Date(asignacionData.fecha_fin) : null;
        
        const turnosEnRango = turnosExistentes.filter(turno => {
            if (turno.estado !== 'activo') return false;
            
            const turnoInicio = new Date(turno.fecha_inicio);
            const turnoFin = turno.fecha_fin ? new Date(turno.fecha_fin) : null;
            
            // Verificar si hay solapamiento de fechas
            if (fechaFin) {
                // El nuevo turno tiene fecha fin
                if (turnoFin) {
                    // Ambos tienen fecha fin
                    return (turnoInicio <= fechaFin && (!turnoFin || turnoFin >= fechaInicio));
                } else {
                    // El turno existente no tiene fecha fin
                    return turnoInicio <= fechaFin;
                }
            } else {
                // El nuevo turno no tiene fecha fin
                if (turnoFin) {
                    // El turno existente tiene fecha fin
                    return turnoFin >= fechaInicio;
                } else {
                    // Ninguno tiene fecha fin
                    return true;
                }
            }
        });
        
        // Si hay turnos en el rango, verificar conflictos por día
        if (turnosEnRango.length > 0) {
            const diasConflicto = [];
            
            for (const diaLabor of diasLaborables) {
                if (diaLabor.trabaja) {
                    // Verificar si algún turno existente también trabaja este día
                    for (const turnoExistente of turnosEnRango) {
                        const diasTurnoExistente = await AsignacionTurnosModel.getDiasLaborablesByTipoTurno(turnoExistente.tipo_turno_id);
                        
                        const conflicto = diasTurnoExistente.find(d => 
                            d.dia_semana === diaLabor.dia_semana && d.trabaja
                        );
                        
                        if (conflicto) {
                            diasConflicto.push({
                                dia: diaLabor.dia_semana,
                                turnoExistente: turnoExistente.tipo_turno_nombre || 'Turno existente',
                                fechaInicio: turnoExistente.fecha_inicio,
                                fechaFin: turnoExistente.fecha_fin
                            });
                            break; // Ya encontramos un conflicto para este día
                        }
                    }
                }
            }
            
            if (diasConflicto.length > 0) {
                return res.status(409).json({ 
                    success: false, 
                    message: "El trabajador ya tiene turnos asignados en los siguientes días",
                    conflictos: diasConflicto
                });
            }
        }

        // Crear la asignación de turno
        const asignacionId = await AsignacionTurnosModel.create(asignacionData);

        // Registrar la asignación de turno en auditoría
        if (req.user && req.user.id) {
            try {
                const nombreTrabajador = `${trabajador.nombre} ${trabajador.apellido_pat || ''}`.trim();

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'asignar_turno_trabajador',
                    tabla_afectada: 'asignacion_turnos',
                    registro_id: asignacionId,
                    descripcion: `Turno asignado a trabajador: ${nombreTrabajador} - ${tipoTurno.nombre} (${tipoTurno.hora_inicio}-${tipoTurno.hora_fin})`,
                    datos_anteriores: null,
                    datos_nuevos: JSON.stringify({
                        usuario_empresa_id: asignacionData.usuario_empresa_id,
                        trabajador_nombre: nombreTrabajador,
                        tipo_turno_id: asignacionData.tipo_turno_id,
                        tipo_turno_nombre: tipoTurno.nombre,
                        fecha_inicio: asignacionData.fecha_inicio,
                        fecha_fin: asignacionData.fecha_fin || null
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
            message: "Turno asignado exitosamente",
            data: { id: asignacionId }
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

        // Verificar que la asignación existe antes de eliminarla
        const asignacionExistente = await AsignacionTurnosModel.getById(id);
        if (!asignacionExistente) {
            return res.status(404).json({ 
                success: false, 
                message: "Asignación de turno no encontrada" 
            });
        }

        // Obtener información del trabajador y tipo de turno para auditoría
        const trabajador = await UserModel.findById(asignacionExistente.usuario_empresa_id);
        const tipoTurno = await TipoTurnosModel.getById(asignacionExistente.tipo_turno_id);

        // Eliminar la asignación de turno
        const resultado = await AsignacionTurnosModel.delete(id);
        
        if (resultado === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No se pudo eliminar la asignación de turno" 
            });
        }

        // Registrar la eliminación en auditoría
        if (req.user && req.user.id) {
            try {
                const nombreTrabajador = trabajador ? `${trabajador.nombre} ${trabajador.apellido_pat || ''}`.trim() : 'Trabajador desconocido';
                const nombreTipoTurno = tipoTurno ? tipoTurno.nombre : 'Tipo desconocido';

                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'eliminar_turno_trabajador',
                    tabla_afectada: 'asignacion_turnos',
                    registro_id: id,
                    descripcion: `Asignación de turno eliminada: ${nombreTrabajador} - ${nombreTipoTurno}`,
                    datos_anteriores: JSON.stringify({
                        usuario_empresa_id: asignacionExistente.usuario_empresa_id,
                        trabajador_nombre: nombreTrabajador,
                        tipo_turno_id: asignacionExistente.tipo_turno_id,
                        tipo_turno_nombre: nombreTipoTurno,
                        fecha_inicio: asignacionExistente.fecha_inicio,
                        fecha_fin: asignacionExistente.fecha_fin
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
            message: "Asignación de turno eliminada exitosamente" 
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
     
        trabajadoresUnicos.forEach(trabajador => {
            console.log(`  - ${trabajador.usuario_nombre} (ID: ${trabajador.id}): ${trabajador.horas_laborales || 'SIN HORAS LABORALES'}`);
        });

        res.status(200).json({ success: true, data: trabajadoresUnicos });
    } catch (error) {
        console.error("Error fetching trabajadores:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
const obtenerTurnos = async (req, res) => {
    try {
        const { rut } = req.params;

        // Obtener todas las asignaciones de turnos por empresa
        const asignaciones = await AsignacionTurnosModel.getByEmpresaRut(rut);

        // se deben otener los turnos de los trabajadore que son de una est asignados a esta empresa
        const estActiva = await EstAsignacionesModel.getEstInfoByUsuariaRut(rut);
        // para cada est activa obtener sus asignaciones
        for (let est of estActiva) {
            console.log("Obteniendo turnos para est activa:", est);
            const asignacion  = await AsignacionTurnosModel.getByEmpresaRut(est.emp_rut);
            console.log("Asignaciones obtenidas para est:", asignacion);
            asignaciones.push(...asignacion);
        }
    
        

        
        // Formatear las 1 con información completa
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
            trabajador: {
                id: asignacion.usuario_empresa_id,
                nombre: asignacion.usuario_nombre,
                apellido_pat: asignacion.usuario_apellido_pat,
                apellido_mat: asignacion.usuario_apellido_mat,
                rut: asignacion.usuario_rut,
                iniciales: asignacion.usuario_nombre.charAt(0) + (asignacion.usuario_apellido_pat ? asignacion.usuario_apellido_pat.charAt(0) : '')
            }
        }));
        
        res.status(200).json({ success: true, data: turnosFormateados });
    } catch (error) {
        console.error("Error fetching turnos:", error);
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


const historialSolicitudes = async (req, res) => {
    try {
        const historial = await ReporteMarcacionesModel.findByEmpresaId(req.user.empresa_id);

        // agregar los reportes de los trabajadores de est que estnan en esta empresa
        const trabajadoresDeEst = await EstAsignacionesModel.getTrabajadoresByUsuariaId(req.user.empresa_id);
        const reportesTrabajadoresDeEst = await Promise.all(
            trabajadoresDeEst.map(trabajador =>
            ReporteMarcacionesModel.findByUsuarioId(trabajador.id)
            )
        ).then(reportesArrays => reportesArrays.flat());
        historial.push(...reportesTrabajadoresDeEst);
        //agregar info del trabajador a cada reporte
        for (let reporte of historial) {
            const ue = await UsuarioEmpresaModel.obtenerUsuarioByID(reporte.usuario_id);
            if (ue) {
                reporte.nombreTrabajador = ue.nombre;
                reporte.apellido_pat = ue.apellido_pat;
                reporte.apellido_mat = ue.apellido_mat;
            }
        }

        console.log("historial:", historial);
        res.status(200).json({ success: true, data: historial });
    }
    catch (error) {
        console.error("Error obteniendo historial de solicitudes:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};


const configurarToleranciaHorarias = async (req, res) => {
    try {
        const USR_PETICION = req.user; // usuario que genera la consulta
        const { tolerancia_entrada, tolerancia_salida, tiempo_min_entre_marcaciones } = req.body;
        const empresa_id = USR_PETICION.empresa_id;


        await ConfigToleranciaModel.createOrUpdate(
            empresa_id,
            { tolerancia_entrada, tolerancia_salida, tiempo_min_entre_marcaciones }
        )

        res.status(201).json({ success: true, message: "Tolerancias configuradas exitosamente" });
    } catch (error) {
        console.error("Error configurando tolerancias:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
}


const obtenerConfiguracionTolerancias = async (req, res) => {
    try {
        const USR_PETICION = req.user; // usuario que genera la consulta
        const empresa_id = USR_PETICION.empresa_id;
        const config = await ConfigToleranciaModel.findByEmpresaId(empresa_id);
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("Error obteniendo configuración de tolerancias:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
}

// Obtener turnos específicos de un trabajador por ID
const obtenerTurnosTrabajador = async (req, res) => {
    try {
        const { id } = req.params; // ID del trabajador
        const USR_PETICION = req.user; // usuario que genera la consulta

        console.log('🔍 Obteniendo turnos para trabajador ID:', id);

        // Verificar que el trabajador pertenece a la empresa del usuario logueado
        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        const trabajadorEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(id);
        console.log('Empresa usuario logueado:', empresa ? empresa.empresa_id : null);
        console.log('Empresa trabajador:', trabajadorEmpresa ? trabajadorEmpresa.empresa_id : null);
        if (!trabajadorEmpresa || trabajadorEmpresa.empresa_id !== empresa.empresa_id) {
            return res.status(403).json({ 
                success: false, 
                message: "No tiene permisos para ver turnos de este trabajador" 
            });
        }

        // Obtener turnos del trabajador
        const turnos = await TurnosModel.getTurnosByUsuarioId(id);

        console.log('✅ Turnos encontrados:', turnos.length);

        res.status(200).json({
            success: true,
            data: turnos,
            message: `Turnos del trabajador obtenidos correctamente`
        });

    } catch (error) {
        console.error('❌ Error obteniendo turnos del trabajador:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor al obtener turnos",
            error: error.message 
        });
    }
};

// Obtener marcaciones específicas de un trabajador por ID
const obtenerMarcacionesTrabajador = async (req, res) => {
    try {
        const { id } = req.params; // ID del trabajador
        const { limite = 10 } = req.query; // Límite de marcaciones a obtener
        const USR_PETICION = req.user; // usuario que genera la consulta

        console.log('🔍 Obteniendo marcaciones para trabajador ID:', id, 'Límite:', limite);

        // Verificar que el trabajador pertenece a la empresa del usuario logueado
        const empresasUsuario = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        const trabajadorEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(id);
        console.log('Empresas usuario logueado:', empresasUsuario.map(e => e.empresa_id));
        console.log('Empresa trabajador:', trabajadorEmpresa ? trabajadorEmpresa.empresa_id : null);
        const empresasUsuarioIds = empresasUsuario.map(e => e.empresa_id);
        if (!trabajadorEmpresa || !empresasUsuarioIds.includes(trabajadorEmpresa.empresa_id)) {
            return res.status(403).json({ 
                success: false, 
                message: "No tiene permisos para ver marcaciones de este trabajador" 
            });
        }

        // Obtener marcaciones del trabajador usando la función correcta
        // Nota: getMarcacionesByUsuario usa usuario_empresa_id, no usuario_id
        const marcacionesCompletas = await MarcacionesModel.getMarcacionesByUsuario(trabajadorEmpresa.id);
        
        // Aplicar límite manualmente ya que la función no lo tiene
        const marcaciones = marcacionesCompletas.slice(0, parseInt(limite));

        console.log('✅ Marcaciones encontradas:', marcaciones.length, 'de', marcacionesCompletas.length, 'totales');

        // Formatear marcaciones para el frontend
        const marcacionesFormateadas = marcaciones.map(marcacion => ({
            id: marcacion.id,
            fecha_marcacion: marcacion.fecha,
            hora_marcacion: marcacion.hora,
            tipo_marcacion: marcacion.tipo,
            ip_origen: marcacion.ip_origen,
            geo_lat: marcacion.geo_lat,
            geo_lon: marcacion.geo_lon
        }));

        res.status(200).json({
            success: true,
            data: marcacionesFormateadas,
            total: marcacionesCompletas.length,
            message: `Marcaciones del trabajador obtenidas correctamente`
        });

    } catch (error) {
        console.error('❌ Error obteniendo marcaciones del trabajador:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor al obtener marcaciones",
            error: error.message 
        });
    }
};

const actualizarHorasLaborales = async (req, res) => {
    try {
        const { id } = req.params; // ID del trabajador
        const { horas_laborales } = req.body; // Nuevas horas laborales
        const USR_PETICION = req.user; // usuario que genera la consulta

        console.log('🔄 Actualizando horas laborales:', { 
            trabajadorId: id, 
            horasLaborales: horas_laborales,
            usuarioEmpresa: USR_PETICION.id 
        });

        // Validar que las horas laborales sean válidas
        const horasValidas = ['44', '45', '54'];
        if (!horasValidas.includes(horas_laborales)) {
            return res.status(400).json({
                success: false,
                message: "Las horas laborales deben ser 44, 45 o 54"
            });
        }

        // Verificar que el trabajador pertenece a la empresa del usuario logueado
        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        const trabajadorEmpresa = await UsuarioEmpresaModel.getUsuarioEmpresaByUsuarioId(id);
        console.log('Empresa usuario logueado:', empresa ? empresa.empresa_id : null);
        console.log('Empresa trabajador:', trabajadorEmpresa ? trabajadorEmpresa.empresa_id : null);
        if (!trabajadorEmpresa || trabajadorEmpresa.empresa_id !== empresa.empresa_id) {
            return res.status(403).json({ 
                success: false, 
                message: "No tiene permisos para modificar este trabajador" 
            });
        }

        // Actualizar las horas laborales en la base de datos
        const resultado = await UsuarioEmpresaModel.actualizarHorasLaborales(trabajadorEmpresa.id, horas_laborales);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Trabajador no encontrado"
            });
        }

        // Registrar auditoría (comentado temporalmente)
        // await AuditoriaModel.registrarAccion(
        //     USR_PETICION.id,
        //     'UPDATE',
        //     'usuario_empresa',
        //     trabajadorEmpresa.id,
        //     `Actualización de horas laborales de ${trabajadorEmpresa.horas_laborales || 'Sin definir'} a ${horas_laborales} horas`,
        //     req.ip,
        //     req.get('User-Agent')
        // );

        console.log('✅ Horas laborales actualizadas exitosamente');

        res.status(200).json({
            success: true,
            message: "Horas laborales actualizadas correctamente",
            data: {
                trabajador_id: id,
                horas_laborales_anteriores: trabajadorEmpresa.horas_laborales,
                horas_laborales_nuevas: horas_laborales
            }
        });

    } catch (error) {
        console.error('❌ Error actualizando horas laborales:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor al actualizar horas laborales",
            error: error.message 
        });
    }
};

// Nuevo: Obtener tipos de turno disponibles para la empresa del usuario
const obtenerTiposTurnos = async (req, res) => {
    try {
        console.log(req.user);
        const empresa_id = req.user.empresa_id
        // Obtener solo los tipos de turno de la empresa
        const tiposTurnos = await TipoTurnosModel.getByEmpresaId(empresa_id);
        // para cada tipo de turno agregarle los dias en que aplica

        console.log("Obteniendo tipos de turnos para empresa ID:", empresa_id);
        const tiposConDias = await TipoTurnosModel.getAllWithDiasByEmpresaId(empresa_id);
        console.log("Tipos de turnos obtenidos:", tiposConDias);
        res.status(200).json({
            success: true,
            data: tiposConDias,
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

// Nuevo: Eliminar tipo de turno por ID
const eliminarTipoTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const USR_PETICION = req.user;
        const empresa_id = req.user.empresa_id;
        // Validar que sea empleador o admin
        if (!USR_PETICION || (USR_PETICION.rol !== 'empleador' && USR_PETICION.rol !== 'admin')) {
            return res.status(403).json({
                success: false,
                message: "No tiene permisos para eliminar tipos de turno"
            });
        }
        // Verificar que el tipo de turno pertenece a la empresa del usuario
        const tipoTurno = await TipoTurnosModel.getById(id);
        if (!tipoTurno || tipoTurno.empresa_id !== empresa_id) {
            return res.status(404).json({
                success: false,
                message: "Tipo de turno no encontrado"
            });
        }
        // Eliminar el tipo de turno
        const resultado = await TipoTurnosModel.delete(id);
        if (resultado === 0) {
            return res.status(404).json({
                success: false,
                message: "No se pudo eliminar el tipo de turno"
            });
        }
        // Registrar en auditoría
        if (req.user && req.user.id) {
            try {
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'eliminar_tipo_turno',
                    tabla_afectada: 'tipo_turnos',
                    registro_id: id,
                    descripcion: `Tipo de turno eliminado: ${tipoTurno.nombre} - Empresa ID: ${empresa_id}`,
                    datos_anteriores: JSON.stringify(tipoTurno),
                    datos_nuevos: null,
                    ip_address: req.ip || req.connection.remoteAddress
                });
                console.log('✅ Eliminación de tipo de turno registrada en auditoría');
            } catch (auditError) {
                console.error('⚠️ Error al registrar eliminación de tipo de turno en auditoría:', auditError);
            }
        }
        res.status(200).json({
            success: true,
            message: "Tipo de turno eliminado exitosamente"
        });
    } catch (error) {
        console.error("Error eliminando tipo de turno:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar tipo de turno",
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

        // Obtener empresa del usuario
        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: "Empresa no encontrada para el usuario"
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

      

        // Agregar empresa_id al tipo de turno
        tipoTurnoData.empresa_id = empresa.empresa_id;

        const nuevoTipoId = await TipoTurnosModel.create(tipoTurnoData);

        // Registrar en auditoría
        if (req.user && req.user.id) {
            try {
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'crear_tipo_turno',
                    tabla_afectada: 'tipo_turnos',
                    registro_id: nuevoTipoId,
                    descripcion: `Tipo de turno creado: ${tipoTurnoData.nombre} - Empresa: ${empresa.emp_nombre || empresa.empresa_id}`,
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

const actualizarTrabajador = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, rut, email } = req.body;
        const USR_PETICION = req.user;

        console.log('🔄 Actualizando trabajador:', { id, nombre, apellido, rut, email });

        // Validaciones
        if (!nombre || !apellido || !rut) {
            return res.status(400).json({
                success: false,
                message: "Nombre, apellido y RUT son obligatorios"
            });
        }

        // Obtener datos anteriores del trabajador para auditoría
        const trabajadorAnterior = await UsuarioEmpresaModel.getUsuarioEmpresaById(id);
        if (!trabajadorAnterior) {
            return res.status(404).json({
                success: false,
                message: "Trabajador no encontrado"
            });
        }

        // Verificar si el RUT ya existe en otro usuario (excepto el actual)
        const existingUserByRut = await UserModel.findByRut(rut);
        if (existingUserByRut && existingUserByRut.id !== trabajadorAnterior.usuario_id) {
            return res.status(400).json({
                success: false,
                message: "Ya existe otro trabajador con este RUT"
            });
        }

        // Verificar si el email ya existe en otro usuario (excepto el actual)
        if (email) {
            const existingUserByEmail = await UserModel.findByEmail(email);
            if (existingUserByEmail && existingUserByEmail.id !== trabajadorAnterior.usuario_id) {
                return res.status(400).json({
                    success: false,
                    message: "Ya existe otro trabajador con este email"
                });
            }
        }

        // Actualizar usuario
        await UserModel.updateUser(trabajadorAnterior.usuario_id, {
            nombre: nombre,
            apellido_pat: apellido,
            rut: rut,
            email: email || trabajadorAnterior.usuario_email
        });

        // Registrar en auditoría
        if (req.user && req.user.id) {
            try {
                await AuditoriaModel.registrarCambio({
                    usuario_id: req.user.id,
                    accion: 'actualizar_trabajador',
                    tabla_afectada: 'usuarios',
                    registro_id: trabajadorAnterior.usuario_id,
                    descripcion: `Trabajador actualizado: ${nombre} ${apellido} (${rut})`,
                    datos_anteriores: JSON.stringify({
                        nombre: trabajadorAnterior.usuario_nombre,
                        apellido_pat: trabajadorAnterior.usuario_apellido_pat,
                        rut: trabajadorAnterior.usuario_rut,
                        email: trabajadorAnterior.usuario_email
                    }),
                    datos_nuevos: JSON.stringify({
                        nombre,
                        apellido_pat: apellido,
                        rut,
                        email
                    }),
                    ip_address: req.ip || req.connection.remoteAddress
                });
            } catch (auditError) {
                console.error('⚠️ Error al registrar en auditoría:', auditError);
            }
        }

        res.status(200).json({
            success: true,
            message: "Trabajador actualizado exitosamente"
        });

    } catch (error) {
        console.error('❌ Error actualizando trabajador:', error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar trabajador",
            error: error.message
        });
    }
};

/**
 * Obtener reporte de jornada diaria con marcaciones agrupadas por usuario
 * Similar al reporte de asistencia pero específico para empresas
 */
const obtenerReporteJornadaDiariaEmpresa = async (req, res) => {
    try {
        const { rutEmpresa } = req.params;
        const { fecha_inicio, fecha_fin } = req.query;

        console.log('📊 Obteniendo reporte de jornada diaria:', {
            rutEmpresa,
            fecha_inicio,
            fecha_fin,
            usuario: req.user
        });

        // Validar fechas
        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren fecha_inicio y fecha_fin'
            });
        }

        // Obtener empresa
        const empresa = await EmpresaModel.getEmpresaByRut(rutEmpresa);
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }
        // Obtener todos los trabajadores de la empresa (directos)
        const trabajadoresDirectos = await UsuarioEmpresaModel.getUsuariosByEmpresaId(empresa.empresa_id);
        
        // Obtener trabajadores de empresas EST asociadas
        const trabajadoresEST = await EstAsignacionesModel.getTrabajadoresByUsuariaId(empresa.empresa_id);
        console.log(trabajadoresEST);
        // Combinar todos los trabajadores
        const todosTrabajadores = [...trabajadoresDirectos, ...trabajadoresEST];

        // Objeto para agrupar marcaciones por usuario
        const marcacionesAgrupadasPorUsuario = {};

        // Procesar cada trabajador
        for (const trabajador of todosTrabajadores) {
            const usuarioEmpresaId = trabajador.id;

            // Inicializar estructura de datos para este trabajador
            marcacionesAgrupadasPorUsuario[usuarioEmpresaId] = {
                trabajador_id: usuarioEmpresaId,
                marcaciones: {}
            };

            // Obtener marcaciones del trabajador en el rango de fechas
            const marcaciones = await MarcacionesServices.obtenerMarcacionesPorUsuarioYRango(
                usuarioEmpresaId,
                fecha_inicio,
                fecha_fin
            );
            console.log(`🔍 Marcaciones obtenidas para usuario_empresa_id ${usuarioEmpresaId}:`, marcaciones);
            // Agrupar marcaciones por fecha
            if (marcaciones && marcaciones.data && marcaciones.data.length > 0) {
                for (const marcacion of marcaciones.data) {
                    const fechaMarcacion = DateTime.fromJSDate(new Date(marcacion.fecha))
                        .setZone('America/Santiago')
                        .toISODate();

                    if (!marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones[fechaMarcacion]) {
                        // Obtener turno del trabajador para esa fecha
                        const turno = await TurnosModel.obtenerTurnoPorUsuarioYFecha(
                            usuarioEmpresaId,
                            fechaMarcacion
                        );

                   
                        marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones[fechaMarcacion] = {
                            marcaciones: [],
                            turno: turno || null,
                            estado_asistencia: 'NO_ASISTE',
                            atraso: null,
                            salida: null
                        };
                    }

                    // Agregar marcación al array
                    marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones[fechaMarcacion].marcaciones.push({
                        id: marcacion.id,
                        hora: marcacion.hora,
                        tipo: marcacion.tipo,
                        fecha: marcacion.fecha,
                        lugar_id: marcacion.lugar_id
                    });
                }

                // Determinar estado de asistencia para cada fecha DESPUÉS de agrupar todas las marcaciones
                for (const fechaMarcacion in marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones) {
                    const tiposMarcacion = marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones[fechaMarcacion].marcaciones.map(m => m.tipo);
                    console.log(`Tipos de marcación para usuario_empresa_id ${usuarioEmpresaId} en ${fechaMarcacion}:`, tiposMarcacion);
                    
                    if (tiposMarcacion.includes('entrada') && tiposMarcacion.includes('salida')) {
                        marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones[fechaMarcacion].estado_asistencia = 'PRESENTE';
                    } else if (tiposMarcacion.includes('entrada') && !tiposMarcacion.includes('salida')) {
                        marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones[fechaMarcacion].estado_asistencia = 'INCOMPLETA_SALIDA';
                    } else if (!tiposMarcacion.includes('entrada') && tiposMarcacion.includes('salida')) {
                        marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones[fechaMarcacion].estado_asistencia = 'INCOMPLETA_ENTRADA';
                    } else {
                        marcacionesAgrupadasPorUsuario[usuarioEmpresaId].marcaciones[fechaMarcacion].estado_asistencia = 'NO';
                    }
                }
            }
        }

        // Formatear respuesta con información de trabajadores
        const trabajadoresFormateados = todosTrabajadores.map(t => ({
            id: t.id,
            usuario_id: t.usuario_id,
            usuario_nombre: t.usuario_nombre,
            usuario_apellido_pat: t.usuario_apellido_pat,
            usuario_apellido_mat: t.usuario_apellido_mat,
            usuario_rut: t.usuario_rut,
            usuario_email: t.usuario_email,
            rol_en_empresa: t.rol_en_empresa,
            es_est: t.es_est || false,
            empresa_id: t.empresa_id,
            empresa_nombre: t.empresa_nombre || empresa.emp_nombre,
            empresa_rut: t.empresa_rut || empresa.emp_rut
        }));

        console.log(marcacionesAgrupadasPorUsuario);

        res.status(200).json({
            success: true,
            data: {
                trabajadores: trabajadoresFormateados,
                marcacionesAgrupadasPorUsuario,
                empresa: {
                    id: empresa.id,
                    nombre: empresa.emp_nombre,
                    rut: empresa.emp_rut
                },
                periodo: {
                    fecha_inicio,
                    fecha_fin
                }
            },
            message: 'Reporte de jornada diaria obtenido exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al obtener reporte de jornada diaria:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte de jornada diaria',
            error: error.message
        });
    }
};

// Función para obtener datos detallados de reporte de asistencia
const obtenerReporteAsistenciaDetallado = async (req, res) => {
    try {
        const USR_PETICION = req.user;
        const { fechaInicio, fechaFin } = req.query;

        console.log('🚀 Obteniendo reporte detallado:', { fechaInicio, fechaFin, usuario: USR_PETICION.id });

        // Obtener empresa del usuario
        const [empresa] = await UsuarioEmpresaModel.getEmpresasByUsuarioId(USR_PETICION.id);
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: "No se encontró empresa asociada al usuario"
            });
        }

        // Obtener trabajadores
        const trabajadores = await UsuarioEmpresaModel.getUsuariosByRolEnEmpresa(empresa.empresa_id, 'trabajador');
        
        // Calcular fechas si no se proporcionan
        let inicioSemana, finSemana;
        if (fechaInicio && fechaFin) {
            inicioSemana = fechaInicio;
            finSemana = fechaFin;
        } else {
            const hoy = new Date();
            const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay());
            const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay() + 6);
            inicioSemana = primerDia.toISOString().split('T')[0];
            finSemana = ultimoDia.toISOString().split('T')[0];
        }

        console.log(`📅 Calculando para el período: ${inicioSemana} al ${finSemana}`);

        // Procesar cada trabajador
        const trabajadoresConDatos = await Promise.all(
            trabajadores.map(async (trabajador) => {
                try {
                    console.log(`👤 Procesando: ${trabajador.usuario_nombre} (ID: ${trabajador.id})`);

                    // Obtener marcaciones del período
                    const marcaciones = await MarcacionesModel.obtenerMarcacionesPorPeriodo(
                        trabajador.id, 
                        inicioSemana, 
                        finSemana
                    );

                    // Obtener turnos asignados
                    const turnosAsignados = await AsignacionTurnosModel.getTurnosByUsuarioEmpresa(trabajador.id);
                    
                    // Calcular horas trabajadas en el período
                    const horasCalculadas = await MarcacionesServices.calcularHorasSemanales(
                        trabajador.id,
                        inicioSemana,
                        finSemana
                    );

                    // Calcular estadísticas de asistencia
                    const estadisticasAsistencia = calcularEstadisticasAsistencia(marcaciones, inicioSemana, finSemana);
                    
                    // Obtener información de turnos
                    const infoTurnos = await obtenerInformacionTurnos(turnosAsignados);

                    const horasLaborales = parseInt(trabajador.horas_laborales || '45');
                    const horasTrabajadas = horasCalculadas.totalHorasSemanales || 0;
                    const excedeHoras = horasTrabajadas > horasLaborales;

                    return {
                        id: trabajador.id,
                        nombre_completo: `${trabajador.usuario_nombre || ''} ${trabajador.usuario_apellido_pat || ''} ${trabajador.usuario_apellido_mat || ''}`.trim(),
                        rut: trabajador.usuario_rut || 'Sin RUT',
                        email: trabajador.usuario_email || 'Sin email',
                        iniciales: `${(trabajador.usuario_nombre || '').charAt(0)}${(trabajador.usuario_apellido_pat || '').charAt(0)}`,
                        
                        // Horas
                        horas_laborales_asignadas: horasLaborales,
                        horas_trabajadas_reales: Math.round(horasTrabajadas * 100) / 100,
                        excede_horas: excedeHoras,
                        porcentaje_cumplimiento: horasLaborales > 0 ? Math.round((horasTrabajadas / horasLaborales) * 100) : 0,
                        
                        // Asistencia
                        dias_presente: estadisticasAsistencia.diasPresente,
                        dias_ausente: estadisticasAsistencia.diasAusente,
                        porcentaje_asistencia: estadisticasAsistencia.porcentajeAsistencia,
                        llegadas_tarde: estadisticasAsistencia.llegadasTarde,
                        salidas_anticipadas: estadisticasAsistencia.salidasAnticipadas,
                        
                        // Turnos
                        turnos_asignados: infoTurnos,
                        tipo_jornada: infoTurnos.length > 0 ? infoTurnos[0].tipo_jornada : 'No asignado',
                        
                        // Marcaciones
                        total_marcaciones: marcaciones.length,
                        marcaciones_recientes: marcaciones.slice(-5).map(m => ({
                            fecha: m.fecha,
                            hora: m.hora,
                            tipo: m.tipo,
                            estado: 'normal'
                        }))
                    };

                } catch (error) {
                    console.error(`❌ Error procesando trabajador ${trabajador.usuario_nombre}:`, error);
                    return {
                        id: trabajador.id,
                        nombre_completo: `${trabajador.usuario_nombre || ''} ${trabajador.usuario_apellido_pat || ''}`.trim(),
                        error: 'Error al procesar datos'
                    };
                }
            })
        );

        // Calcular resumen general
        const resumenGeneral = {
            total_trabajadores: trabajadoresConDatos.length,
            trabajadores_dentro_limite: trabajadoresConDatos.filter(t => !t.excede_horas).length,
            trabajadores_exceden_horas: trabajadoresConDatos.filter(t => t.excede_horas).length,
            promedio_horas_semana: trabajadoresConDatos.length > 0 
                ? (trabajadoresConDatos.reduce((sum, t) => sum + (t.horas_trabajadas_reales || 0), 0) / trabajadoresConDatos.length).toFixed(1)
                : '0.0',
            promedio_asistencia: trabajadoresConDatos.length > 0
                ? Math.round(trabajadoresConDatos.reduce((sum, t) => sum + (t.porcentaje_asistencia || 0), 0) / trabajadoresConDatos.length)
                : 0,
            total_ausencias_injustificadas: trabajadoresConDatos.reduce((sum, t) => sum + (t.dias_ausente || 0), 0)
        };

        res.status(200).json({
            success: true,
            data: {
                periodo: {
                    fecha_inicio: inicioSemana,
                    fecha_fin: finSemana
                },
                resumen: resumenGeneral,
                trabajadores: trabajadoresConDatos
            }
        });

    } catch (error) {
        console.error('❌ Error obteniendo reporte detallado:', error);
        res.status(500).json({
            success: false,
            message: "Error al generar reporte de asistencia",
            error: error.message
        });
    }
};

// Función auxiliar para calcular estadísticas de asistencia
function calcularEstadisticasAsistencia(marcaciones, fechaInicio, fechaFin) {
    const diasTotales = calcularDiasLaborables(fechaInicio, fechaFin);
    const diasConMarcaciones = new Set(marcaciones.map(m => m.fecha)).size;
    const diasAusente = Math.max(0, diasTotales - diasConMarcaciones);
    
    // Calcular llegadas tarde (asumiendo horario 09:00)
    const llegadasTarde = marcaciones.filter(m => 
        m.tipo === 'entrada' && m.hora > '09:00:00'
    ).length;
    
    // Calcular salidas anticipadas (asumiendo horario 17:00)
    const salidasAnticipadas = marcaciones.filter(m => 
        m.tipo === 'salida' && m.hora < '17:00:00'
    ).length;
    
    return {
        diasPresente: diasConMarcaciones,
        diasAusente: diasAusente,
        porcentajeAsistencia: diasTotales > 0 ? Math.round((diasConMarcaciones / diasTotales) * 100) : 0,
        llegadasTarde: llegadasTarde,
        salidasAnticipadas: salidasAnticipadas
    };
}

// Función auxiliar para calcular días laborables
function calcularDiasLaborables(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    let diasLaborables = 0;
    
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) { // No domingo ni sábado
            diasLaborables++;
        }
    }
    
    return diasLaborables;
}

// Función auxiliar para obtener información de turnos
async function obtenerInformacionTurnos(turnosAsignados) {
    if (!turnosAsignados || turnosAsignados.length === 0) {
        return [{
            nombre: 'Turno General',
            horario: '09:00 - 17:00',
            tipo_jornada: 'Ordinaria',
            dias_trabajo: 5,
            horas_programadas: 8
        }];
    }
    
    // Obtener detalles de los turnos desde la base de datos
    return await Promise.all(
        turnosAsignados.map(async (turno) => {
            try {
                const tipoTurno = await TipoTurnosModel.findById(turno.tipo_turno_id);
                return {
                    nombre: tipoTurno?.nombre || 'Turno sin nombre',
                    horario: `${tipoTurno?.hora_inicio || '09:00'} - ${tipoTurno?.hora_fin || '17:00'}`,
                    tipo_jornada: tipoTurno?.tipo_jornada || 'Ordinaria',
                    dias_trabajo: tipoTurno?.dias_trabajo || 5,
                    horas_programadas: calcularHorasTurno(tipoTurno?.hora_inicio, tipoTurno?.hora_fin)
                };
            } catch (error) {
                console.error('Error obteniendo tipo de turno:', error);
                return {
                    nombre: 'Error al cargar turno',
                    horario: '09:00 - 17:00',
                    tipo_jornada: 'Ordinaria',
                    dias_trabajo: 5,
                    horas_programadas: 8
                };
            }
        })
    );
}

// Función auxiliar para calcular horas de un turno
function calcularHorasTurno(horaInicio, horaFin) {
    if (!horaInicio || !horaFin) return 8;
    
    const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
    const [finHoras, finMinutos] = horaFin.split(':').map(Number);
    
    const inicioEnMinutos = inicioHoras * 60 + inicioMinutos;
    const finEnMinutos = finHoras * 60 + finMinutos;
    
    return Math.round((finEnMinutos - inicioEnMinutos) / 60 * 100) / 100;
}

const AdminController = {
    createTrabajador,
    obtenerTrabajadores,
    obtenerTurnosTrabajador,
    obtenerMarcacionesTrabajador,
    actualizarHorasLaborales,
    actualizarTrabajador,
    enrolarTrabajador,
    createTurno,
    deleteTurno,
    obtenerTurnos,
    obtenerTiposTurnos,
    eliminarTipoTurno,
    crearTipoTurno,
    guardarConfiguracion,
    obtenerConfiguracion,
    obtenerReportesMarcaciones,
    aprobarCambioMarcacion,
    rechazarCambioMarcacion,
    configurarToleranciaHorarias,
    obtenerConfiguracionTolerancias,
    historialSolicitudes,
    obtenerReporteJornadaDiariaEmpresa,
    historialSolicitudes,
    obtenerReporteAsistenciaDetallado
};



export default AdminController;