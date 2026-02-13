import EmpresaModel from "../model/empresa.model.js";
import EmpresaEstModel from "../model/empresa-est.model.js";
import UsuarioEmpresaModel from "../model/usuario-empresa.model.js";
import AuditoriaModel from "../model/auditoria.model.js";

// Controlador para eliminar una empresa (CRUD)
// Se agrega para permitir el borrado real desde el frontend usando la tabla empresa
const deleteEmpresa = async (req, res) => {
  try {
    const empresaId = req.params.id;
    
    // Obtener los datos de la empresa antes de eliminarla
    let datosAnteriores = null;
    try {
      const empresaAnterior = await EmpresaModel.getEmpresaById(empresaId);
      datosAnteriores = empresaAnterior;
    } catch (error) {
      console.warn('No se pudieron obtener datos de la empresa a eliminar');
    }
    
    // Llamar al modelo para eliminar la empresa en la base de datos real
    const empresaEliminada = await EmpresaModel.deleteEmpresa(empresaId);
    
    // Registrar el cambio en auditorÃ­a
    if (req.user && req.user.id && datosAnteriores) {
      try {
        await AuditoriaModel.registrarCambio({
          usuario_id: req.user.id,
          accion: 'eliminar_empresa',
          tabla_afectada: 'empresas',
          registro_id: empresaId,
          descripcion: `Empresa eliminada: ${datosAnteriores.emp_nombre || 'Sin nombre'} (RUT: ${datosAnteriores.emp_rut || 'Sin RUT'})`,
          datos_anteriores: JSON.stringify(datosAnteriores),
          datos_nuevos: null,
          ip_address: req.ip || req.connection.remoteAddress
        });
        console.log('âœ… Cambio de eliminaciÃ³n de empresa registrado en auditorÃ­a');
      } catch (auditError) {
        console.error('âš ï¸ Error al registrar cambio en auditorÃ­a:', auditError);
        // No fallar la operaciÃ³n principal por un error de auditorÃ­a
      }
    }
    
    res.status(200).json({
      success: true,
      data: empresaEliminada,
      message: 'Empresa eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la empresa',
      error: error.message
    });
  }
};
// Controlador para crear una nueva empresa (CRUD)
// Se agrega para permitir la creaciÃ³n de empresas desde el frontend usando la tabla empresa real
const createEmpresa = async (req, res) => {
  try {
    const empresaData = req.body;
    // ValidaciÃ³n bÃ¡sica (puedes mejorarla segÃºn tus reglas de negocio)
    if (!empresaData.emp_nombre || !empresaData.emp_rut) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y RUT son obligatorios'
      });
    }
    
    // Llamar al modelo para crear la empresa en la base de datos real
    const nuevaEmpresa = await EmpresaModel.createEmpresa(empresaData);
    
    // Debug: Verificar informaciÃ³n del usuario
    console.log('ðŸ” Debug usuario en createEmpresa:', {
      hasReqUser: !!req.user,
      userId: req.user?.id,
      userRol: req.user?.rol,
      userEmail: req.user?.email
    });
    
    // Registrar el cambio en auditorÃ­a
    if (req.user && req.user.id) {
      try {
        console.log('ðŸ”„ Intentando registrar cambio en auditorÃ­a para usuario:', req.user.id);
        await AuditoriaModel.registrarCambio({
          usuario_id: req.user.id,
          accion: 'crear_empresa',
          tabla_afectada: 'empresas',
          registro_id: nuevaEmpresa.id,
          descripcion: `Empresa creada: ${empresaData.emp_nombre} (RUT: ${empresaData.emp_rut})`,
          datos_anteriores: null,
          datos_nuevos: JSON.stringify(empresaData),
          ip_address: req.ip || req.connection.remoteAddress
        });
        console.log('âœ… Cambio de creaciÃ³n de empresa registrado en auditorÃ­a');
      } catch (auditError) {
        console.error('âš ï¸ Error al registrar cambio en auditorÃ­a:', auditError);
        // No fallar la operaciÃ³n principal por un error de auditorÃ­a
      }
    } else {
      console.warn('âš ï¸ No se pudo registrar en auditorÃ­a:', {
        hasReqUser: !!req.user,
        userId: req.user?.id,
        reason: !req.user ? 'req.user no existe' : 'req.user.id no existe'
      });
    }
    
    res.status(201).json({
      success: true,
      data: nuevaEmpresa,
      message: 'Empresa creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la empresa',
      error: error.message
    });
  }
};
// Se conecta este mÃ©todo con el modelo real para actualizar empresas en la base de datos.
// AsÃ­, cuando el frontend edita una empresa, el cambio se guarda realmente y no solo en un mock.
const updateEmpresa = async (req, res) => {
  console.log('ðŸ”¥ === INICIO updateEmpresa ===');
  console.log('ðŸ“Š Request params:', req.params);
  console.log('ðŸ“Š Request body:', req.body);
  console.log('ðŸ‘¤ Request user:', req.user);
  
  try {
    const empresaId = req.params.id;
    const empresaData = req.body;
    
    // ValidaciÃ³n bÃ¡sica (puedes mejorarla segÃºn tus reglas de negocio)
    if (!empresaData.emp_nombre || !empresaData.emp_rut) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y RUT son obligatorios'
      });
    }
    
    // Obtener los datos anteriores de la empresa antes de actualizar
    let datosAnteriores = null;
    try {
      const empresaAnterior = await EmpresaModel.getEmpresaById(empresaId);
      datosAnteriores = empresaAnterior;
    } catch (error) {
      console.warn('No se pudieron obtener datos anteriores de la empresa');
    }
    
    // Llamar al modelo para actualizar la empresa en la base de datos
    const empresaActualizada = await EmpresaModel.updateEmpresa(empresaId, empresaData);
    
    if (!empresaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      });
    }
    console.log('ðŸ‘¤ Datos EST:', empresaData.es_est);
    // Manejar datos EST si la empresa es EST
    if (empresaData.es_est) {
      try {
        // Verificar si ya existe un registro EST
        const existeEst = await EmpresaEstModel.findByEmpresaId(empresaId);
        
        if (existeEst) {
          // Actualizar registro EST existente
          await EmpresaEstModel.update(empresaId, {
            est_registro_numero: empresaData.est_registro_numero,
            est_registro_fecha: empresaData.est_registro_fecha,
            vigente: empresaData.est_vigente ? 1 : 0
          });
        } else {
          // Crear nuevo registro EST
          await EmpresaEstModel.create({
            empresa_id: empresaId,
            est_registro_numero: empresaData.est_registro_numero,
            est_registro_fecha: empresaData.est_registro_fecha,
            vigente: empresaData.est_vigente ? 1 : 0
          });
        }
      } catch (estError) {
        console.error('Error al manejar registro EST:', estError);
        // No fallar toda la operaciÃ³n si falla el registro EST
      }
    } else {
      // Si ya no es EST, eliminar el registro EST si existe
      try {
        const existeEst = await EmpresaEstModel.findByEmpresaId(empresaId);
        if (existeEst) {
          await EmpresaEstModel.delete(empresaId);
        }
      } catch (estError) {
        console.error('Error al eliminar registro EST:', estError);
      }
    }
    
    // Debug: Verificar informaciÃ³n del usuario
    console.log('ðŸ” Debug usuario en updateEmpresa:', {
      hasReqUser: !!req.user,
      userId: req.user?.id,
      userRol: req.user?.rol,
      userEmail: req.user?.email,
      empresaId: empresaId,
      empresaData: empresaData
    });
    
    // Mostrar tambiÃ©n las cabeceras para debug
    console.log('ðŸ” Headers de la peticiÃ³n:', {
      authorization: req.headers.authorization,
      contentType: req.headers['content-type']
    });
    
    // Registrar el cambio en auditorÃ­a
    if (req.user && req.user.id) {
      try {
        console.log('ðŸ”„ Intentando registrar cambio de actualizaciÃ³n en auditorÃ­a para usuario:', req.user.id);
        
        // Crear descripciÃ³n mÃ¡s detallada comparando campos
        let descripcionDetallada = `Empresa actualizada: ${empresaData.emp_nombre} (RUT: ${empresaData.emp_rut})`;
        let cambiosRealizados = [];
        
        if (datosAnteriores) {
          // Comparar campos especÃ­ficos para crear descripciÃ³n detallada
          if (datosAnteriores.emp_nombre !== empresaData.emp_nombre) {
            cambiosRealizados.push(`Nombre: "${datosAnteriores.emp_nombre}" â†’ "${empresaData.emp_nombre}"`);
          }
          if (datosAnteriores.emp_rut !== empresaData.emp_rut) {
            cambiosRealizados.push(`RUT: "${datosAnteriores.emp_rut}" â†’ "${empresaData.emp_rut}"`);
          }
          if (datosAnteriores.emp_telefono !== empresaData.emp_telefono) {
            cambiosRealizados.push(`TelÃ©fono: "${datosAnteriores.emp_telefono || 'Sin telÃ©fono'}" â†’ "${empresaData.emp_telefono || 'Sin telÃ©fono'}"`);
          }
          if (datosAnteriores.emp_descripcion !== empresaData.emp_descripcion) {
            cambiosRealizados.push(`DescripciÃ³n: "${datosAnteriores.emp_descripcion || 'Sin descripciÃ³n'}" â†’ "${empresaData.emp_descripcion || 'Sin descripciÃ³n'}"`);
          }
          if (Number(datosAnteriores.estado) !== Number(empresaData.estado)) {
            const estadoAnterior = Number(datosAnteriores.estado) === 1 ? 'Activa' : 'Inactiva';
            const estadoNuevo = Number(empresaData.estado) === 1 ? 'Activa' : 'Inactiva';
            cambiosRealizados.push(`Estado: "${estadoAnterior}" â†’ "${estadoNuevo}"`);
          }
          
          if (cambiosRealizados.length > 0) {
            descripcionDetallada += ` - Cambios: ${cambiosRealizados.join(', ')}`;
          }
        }
        
        await AuditoriaModel.registrarCambio({
          usuario_id: req.user.id,
          accion: 'editar_empresa',
          tabla_afectada: 'empresas',
          registro_id: empresaId,
          descripcion: descripcionDetallada,
          datos_anteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : null,
          datos_nuevos: JSON.stringify(empresaData),
          ip_address: req.ip || req.connection.remoteAddress
        });
        console.log('âœ… Cambio de actualizaciÃ³n de empresa registrado en auditorÃ­a');
        console.log('ðŸ“ DescripciÃ³n registrada:', descripcionDetallada);
      } catch (auditError) {
        console.error('âš ï¸ Error al registrar cambio en auditorÃ­a:', auditError);
        // No fallar la operaciÃ³n principal por un error de auditorÃ­a
      }
    } else {
      console.warn('âš ï¸ No se pudo registrar actualizaciÃ³n en auditorÃ­a:', {
        hasReqUser: !!req.user,
        userId: req.user?.id,
        reason: !req.user ? 'req.user no existe' : 'req.user.id no existe'
      });
    }
    
    res.status(200).json({
      success: true,
      data: empresaActualizada,
      message: 'Empresa actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la empresa',
      error: error.message
    });
  }
};


// Mock data para simular la base de datos de empresas
const empresasMock = [
  {
    id: 1,
    nombre: "Telemedios S.A.",
    rut: "96.123.456-7",
    activa: true
  },
];

// Controlador para obtener todas las empresas
const getAllEmpresas = async (req, res) => {
  try {
    const empresas = await EmpresaModel.getAllEmpresas();
    await Promise.all(empresas.map(async empresa => {
      empresa.activa = empresa.activa === 1;
      empresa.totalEmpleados = (await UsuarioEmpresaModel.getUsuariosByEmpresaId(empresa.id)).length;
    }));

    
    res.status(200).json({
      success: true,
      data: empresas,
      message: "Empresas obtenidas exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las empresas",
      error: error.message
    });
  }
};

// Controlador para obtener empresas activas Ãºnicamente
const getEmpresasActivas = async (req, res) => {
  try {
    const empresasActivas = empresasMock.filter(empresa => empresa.activa);
    res.status(200).json({
      success: true,
      data: empresasActivas,
      message: "Empresas activas obtenidas exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las empresas activas",
      error: error.message
    });
  }
};

// Controlador para obtener una empresa por ID
const getEmpresaById = (req, res) => {
  try {
    const { id } = req.params;
    const empresa = empresasMock.find(emp => emp.id === parseInt(id));
    
    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: "Empresa no encontrada"
      });
    }
    
    res.status(200).json({
      success: true,
      data: empresa,
      message: "Empresa obtenida exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la empresa",
      error: error.message
    });
  }
};

// Controlador para buscar empresas por nombre
const buscarEmpresasPorNombre = (req, res) => {
  try {
    const { nombre } = req.query;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El parÃ¡metro 'nombre' es requerido"
      });
    }
    
    const empresasEncontradas = empresasMock.filter(empresa => 
      empresa.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
    
    res.status(200).json({
      success: true,
      data: empresasEncontradas,
      message: `Se encontraron ${empresasEncontradas.length} empresas`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al buscar empresas",
      error: error.message
    });
  }
};

const getHorariosEmpresa = async (req, res) => {
  try {
    const { rut } = req.params;
    
    // Buscar empresa por RUT en los datos mock
    const empresa = empresasMock.find(emp => emp.rut === rut);
    
    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: "Empresa no encontrada"
      });
    }
    
    // Simular horarios de empresa
    const horariosSimulados = [
      {
        dia: "Lunes",
        hora_inicio: "08:00",
        hora_fin: "17:00",
        activo: true
      },
      {
        dia: "Martes",
        hora_inicio: "08:00",
        hora_fin: "17:00",
        activo: true
      },
      {
        dia: "MiÃ©rcoles",
        hora_inicio: "08:00",
        hora_fin: "17:00",
        activo: true
      },
      {
        dia: "Jueves",
        hora_inicio: "08:00",
        hora_fin: "17:00",
        activo: true
      },
      {
        dia: "Viernes",
        hora_inicio: "08:00",
        hora_fin: "17:00",
        activo: true
      }
    ];
    
    res.status(200).json({
      success: true,
      data: horariosSimulados,
      message: "Horarios de la empresa obtenidos exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los horarios de la empresa",
      error: error.message
    });
  }
};



// Se agrega createEmpresa para exponer el endpoint POST y permitir crear empresas desde el frontend
// Se agrega deleteEmpresa para exponer el endpoint DELETE y permitir borrar empresas desde el frontend
const EmpresaController = {
  getAllEmpresas,
  getEmpresasActivas,
  getEmpresaById,
  buscarEmpresasPorNombre,
  getHorariosEmpresa,
  updateEmpresa,
  createEmpresa,
  deleteEmpresa
};

export default EmpresaController;
