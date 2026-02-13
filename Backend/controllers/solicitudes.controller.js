import SolicitudesUsuariosModel from '../model/solicitudes-usuarios.model.js';
import UserEmpresaModel from '../model/usuario-empresa.model.js';
import UsuariosRolesAsignadosModel from '../model/usuarios-roles-asignados.model.js';
import RolesSistemaModel from '../model/roles-sistema.model.js';
import PreferenciasCompensacionModel from '../model/preferencias-compensacion.model.js';
import { DateTime } from 'luxon';

/**
 * Obtener informaciÃ³n de solicitud por token (endpoint pÃºblico)
 */
const obtenerSolicitudPorToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: 'Token es requerido'
      });
    }

    console.log('Token recibido:', token);


    // Obtener solicitud por token
    const solicitud = await SolicitudesUsuariosModel.obtenerPorToken(token);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada o token invÃ¡lido'
      });
    }

    // Validar que el token no haya expirado
    const validacion = await SolicitudesUsuariosModel.validarToken(token);
    
    if (!validacion.valido) {
      return res.status(400).json({
        error: validacion.mensaje
      });
    }

    // Retornar informaciÃ³n de la solicitud (sin datos sensibles)
    return res.json({
      id_solicitud: solicitud.id_solicitud,
      tipo: solicitud.tipo,
      subtipo: solicitud.subtipo,
      titulo: solicitud.titulo,
      descripcion: solicitud.descripcion,
      estado: solicitud.estado,
      fecha_emision: solicitud.fecha_emision,
      fecha_expiracion: solicitud.fecha_expiracion,
      empresa_solicitante: {
        empresa_id: solicitud.empresa_solicitante_id,
        nombre_empresa: solicitud.nombre_empresa
      },
      usuario: {
        usuario_id: solicitud.usuario_id,
        nombre: solicitud.nombre_usuario,
        apellidos: solicitud.apellidos_usuario,
        rut: solicitud.rut_usuario
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener informaciÃ³n de la solicitud',
      detalle: error.message
    });
  }
};

/**
 * Aceptar solicitud de agregar empresa (requiere login)
 */
const aceptarSolicitudEmpresa = async (req, res) => {
  try {
    const { token } = req.params;
    const user = req.user; // Del middleware de autenticaciÃ³n

 
    if (!token) {
      return res.status(400).json({
        error: 'Token es requerido'
      });
    }

   

    // Obtener y validar solicitud
    const solicitud = await SolicitudesUsuariosModel.obtenerPorToken(token);


    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada'
      });
    }

    // Validar que el usuario autenticado sea el destinatario
    if (solicitud.usuario_id !== user.id) {
      return res.status(403).json({
        error: 'No tienes permiso para aceptar esta solicitud'
      });
    }

   


    // Validar token y expiraciÃ³n
    const validacion = await SolicitudesUsuariosModel.validarToken(token);

   
    
    if (!validacion.valido) {
      return res.status(400).json({
        error: validacion.mensaje
      });
    }

    // Validar estado
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        error: `Esta solicitud ya fue ${solicitud.estado}`
      });
    }



    console.log('Usuario que acepta la solicitud:', user);
    console.log('Solicitud a aceptar:', solicitud);
    // Verificar que no exista ya una relaciÃ³n activa
    const relacionExistente = await UserEmpresaModel.getUsuarioEmpresaById(
      user.id,
      solicitud.empresa_solicitante_id
    );



    if (relacionExistente && relacionExistente.fecha_fin) {
      return res.status(400).json({
        error: 'Ya tienes una relaciÃ³n activa con esta empresa'
      });
    }

    // Extraer userData de la descripciÃ³n si existe (formato JSON)
    let userData = null;
    try {
      const descripcionData = JSON.parse(solicitud.descripcion);
      if (descripcionData.userData) {
        userData = descripcionData.userData;
        console.log('âœ… UserData extraÃ­do de la solicitud:', userData);
      }
    } catch (e) {
      // Si no es JSON o no tiene userData, continuar normalmente
      console.log('â„¹ï¸ Solicitud sin userData en descripciÃ³n');
    }

    // Crear asociaciÃ³n usuario-empresa
    const nuevaAsociacion = await UserEmpresaModel.createUsuarioEmpresa({
      usuario_id: user.id,
      empresa_id: solicitud.empresa_solicitante_id,
      fecha_inicio: DateTime.now().toISODate(),
    });

    console.log('ðŸ” Nueva asociaciÃ³n creada:', nuevaAsociacion);
    console.log('ðŸ” ID de nueva asociaciÃ³n:', nuevaAsociacion.id);

    // Asignar rol si userData estÃ¡ disponible
    if (userData && userData.rol) {
      
    
      try {
        console.log('ðŸŽ­ Intentando asignar rol:', userData.rol, 'a usuario_empresa_id:', nuevaAsociacion.id);
        // Obtener el ID del rol desde roles_sistema
        const rolSistema = await RolesSistemaModel.findBySlug(userData.rol);
        if (rolSistema) {
          await UsuariosRolesAsignadosModel.assignRole(nuevaAsociacion.id, rolSistema.id);
          console.log(`âœ… Rol '${userData.rol}' asignado al usuario en usuarios_roles_asignados`);
        } else {
          console.warn(`âš ï¸ No se encontrÃ³ el rol '${userData.rol}' en roles_sistema`);
        }
      } catch (roleError) {
        console.error('âŒ Error al asignar rol:', roleError);
        // No bloqueamos la aceptaciÃ³n por este error
      }
    }

    // Crear preferencia de compensaciÃ³n si estÃ¡ en userData
    if (userData && userData.preferenciasCompensacion) {
      try {
        console.log('ðŸ’° Intentando crear preferencias de compensaciÃ³n para usuario_empresa_id:', nuevaAsociacion.id);
        console.log('ðŸ’° Datos de preferencias:', userData.preferenciasCompensacion);
        
        await PreferenciasCompensacionModel.crear({
          id_trabajador: nuevaAsociacion.id,
          tipo_compensacion: userData.preferenciasCompensacion.tipo_compensacion || 'PAGO',
          porcentaje_pago: userData.preferenciasCompensacion.porcentaje_pago || 0,
          fecha_inicio: userData.preferenciasCompensacion.fecha_inicio || DateTime.now().toISODate()
        });
        
        console.log('âœ… Preferencias de compensaciÃ³n creadas');
      } catch (prefError) {
        console.error('âŒ Error al crear preferencias de compensaciÃ³n:', prefError);
        // No bloqueamos la aceptaciÃ³n por este error
      }
    }

    // Actualizar la solicitud con el id_usuario_empresa creado
    await SolicitudesUsuariosModel.actualizarIdUsuarioEmpresa(
      solicitud.id_solicitud,
      nuevaAsociacion.id
    );

    // Actualizar estado de la solicitud
    await SolicitudesUsuariosModel.actualizarEstado(
      solicitud.id_solicitud,
      'aceptada',
      `Aceptada por usuario el ${new Date().toISOString()}`
    );


    return res.json({
      mensaje: 'Solicitud aceptada exitosamente',
      asociacion: {
        id: nuevaAsociacion.id,
        usuario_id: user.id,
        empresa_id: solicitud.empresa_solicitante_id,
        nombre_empresa: solicitud.nombre_empresa
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Error al aceptar la solicitud',
      detalle: error.message
    });
  }
};

/**
 * Rechazar solicitud de agregar empresa (requiere login)
 */
const rechazarSolicitudEmpresa = async (req, res) => {
  try {
    const { token } = req.params;
    const { usuario_id } = req.user;
    const { motivo } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token es requerido'
      });
    }

    // Obtener y validar solicitud
    const solicitud = await SolicitudesUsuariosModel.obtenerPorToken(token);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada'
      });
    }

    // Validar que el usuario autenticado sea el destinatario
    if (solicitud.usuario_id !== usuario_id) {
      return res.status(403).json({
        error: 'No tienes permiso para rechazar esta solicitud'
      });
    }

    // Validar estado
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        error: `Esta solicitud ya fue ${solicitud.estado}`
      });
    }

    // Actualizar estado de la solicitud
    const observaciones = motivo 
      ? `Rechazada por usuario: ${motivo}` 
      : `Rechazada por usuario el ${new Date().toISOString()}`;

    await SolicitudesUsuariosModel.actualizarEstado(
      solicitud.id_solicitud,
      'rechazada',
      observaciones
    );

   
    return res.json({
      mensaje: 'Solicitud rechazada exitosamente'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Error al rechazar la solicitud',
      detalle: error.message
    });
  }
};

/**
 * Obtener solicitudes pendientes del usuario autenticado
 */
const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const { usuario_id } = req.user;

    const solicitudes = await SolicitudesUsuariosModel.obtenerSolicitudesPendientesUsuario(usuario_id);

    return res.json({
      solicitudes,
      total: solicitudes.length
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener solicitudes pendientes',
      detalle: error.message
    });
  }
};



export default {
  obtenerSolicitudPorToken,
  aceptarSolicitudEmpresa,
  rechazarSolicitudEmpresa,
  obtenerSolicitudesPendientes
};
