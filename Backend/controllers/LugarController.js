import EmpresaLugarModel from '../model/EmpresaLugarModel.js';
import AuditoriaModel from '../model/AuditoriaModel.js';

// Crear un nuevo lugar
const createLugar = async (req, res) => {
  try {
    const lugarData = req.body;
    
    // Usar empresa_id del usuario autenticado
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    // Asignar el empresa_id del usuario autenticado
    lugarData.empresa_id = req.user.empresa_id;
    
    const nuevoLugar = await EmpresaLugarModel.createLugar(lugarData);
    
  
    
    res.status(201).json({
      success: true,
      data: nuevoLugar,
      message: 'Lugar creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el lugar',
      error: error.message
    });
  }
};

// Obtener todos los lugares de la empresa del usuario autenticado
const getAllLugares = async (req, res) => {
  try {
    // Usar empresa_id del usuario autenticado
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    const lugares = await EmpresaLugarModel.getLugaresByEmpresaId(req.user.empresa_id);
    
    res.status(200).json({
      success: true,
      data: lugares,
      message: 'Lugares obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener lugares:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los lugares',
      error: error.message
    });
  }
};

// Obtener lugares por empresa (usa empresa_id del usuario autenticado)
const getLugaresByEmpresa = async (req, res) => {
  try {
    // Usar empresa_id del usuario autenticado en lugar del parámetro
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    const lugares = await EmpresaLugarModel.getLugaresByEmpresaId(req.user.empresa_id);
    
    res.status(200).json({
      success: true,
      data: lugares,
      message: 'Lugares obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener lugares por empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los lugares',
      error: error.message
    });
  }
};

// Obtener lugares activos por empresa (usa empresa_id del usuario autenticado)
const getLugaresActivosByEmpresa = async (req, res) => {
  try {
    // Usar empresa_id del usuario autenticado
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    const lugares = await EmpresaLugarModel.getLugaresActivosByEmpresaId(req.user.empresa_id);
    
    res.status(200).json({
      success: true,
      data: lugares,
      message: 'Lugares activos obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener lugares activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los lugares activos',
      error: error.message
    });
  }
};

// Obtener lugar por ID
const getLugarById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar autenticación
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    const lugar = await EmpresaLugarModel.getLugarById(id);
    
    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }
    
    // Verificar que el lugar pertenezca a la empresa del usuario
    if (lugar.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para ver este lugar'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lugar,
      message: 'Lugar obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el lugar',
      error: error.message
    });
  }
};

// Actualizar lugar
const updateLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const lugarData = req.body;
    
    // Usar empresa_id del usuario autenticado
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    // Obtener datos anteriores para auditoría y verificar que pertenezca a la empresa
    const datosAnteriores = await EmpresaLugarModel.getLugarById(id);
    
    if (!datosAnteriores) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }
    
    // Verificar que el lugar pertenezca a la empresa del usuario
    if (datosAnteriores.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para actualizar este lugar'
      });
    }
    
    // Asegurar que no se cambie el empresa_id
    lugarData.empresa_id = req.user.empresa_id;
    
    const lugarActualizado = await EmpresaLugarModel.updateLugar(id, lugarData);
    
    // Registrar en auditoría
    if (req.user && req.user.id) {
      await AuditoriaModel.registrar({
        usuario_id: req.user.id,
        accion: 'UPDATE',
        tabla: 'empresa_lugar',
        registro_id: id,
        datos_anteriores: datosAnteriores,
        datos_nuevos: lugarActualizado
      });
    }
    
    res.status(200).json({
      success: true,
      data: lugarActualizado,
      message: 'Lugar actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el lugar',
      error: error.message
    });
  }
};

// Desactivar lugar
const desactivarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar autenticación
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    // Verificar que el lugar pertenezca a la empresa del usuario
    const lugar = await EmpresaLugarModel.getLugarById(id);
    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }
    
    if (lugar.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para desactivar este lugar'
      });
    }
    
    const resultado = await EmpresaLugarModel.desactivarLugar(id);
    
    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Error al desactivar el lugar'
      });
    }
    
    // Registrar en auditoría
    if (req.user && req.user.id) {
      await AuditoriaModel.registrar({
        usuario_id: req.user.id,
        accion: 'UPDATE',
        tabla: 'empresa_lugar',
        registro_id: id,
        datos_nuevos: { estado: 0 }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lugar desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar el lugar',
      error: error.message
    });
  }
};

// Activar lugar
const activarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar autenticación
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    // Verificar que el lugar pertenezca a la empresa del usuario
    const lugar = await EmpresaLugarModel.getLugarById(id);
    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }
    
    if (lugar.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para activar este lugar'
      });
    }
    
    const resultado = await EmpresaLugarModel.activarLugar(id);
    
    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Error al activar el lugar'
      });
    }
    
    // Registrar en auditoría
    if (req.user && req.user.id) {
      await AuditoriaModel.registrar({
        usuario_id: req.user.id,
        accion: 'UPDATE',
        tabla: 'empresa_lugar',
        registro_id: id,
        datos_nuevos: { estado: 1 }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lugar activado exitosamente'
    });
  } catch (error) {
    console.error('Error al activar lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar el lugar',
      error: error.message
    });
  }
};

// Eliminar lugar permanentemente
const deleteLugar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar autenticación
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    // Verificar que el lugar pertenezca a la empresa del usuario
    const lugar = await EmpresaLugarModel.getLugarById(id);
    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }
    
    if (lugar.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para eliminar este lugar'
      });
    }
    
    const lugarEliminado = await EmpresaLugarModel.deleteLugar(id);
    
    // Registrar en auditoría
    if (req.user && req.user.id) {
      await AuditoriaModel.registrar({
        usuario_id: req.user.id,
        accion: 'DELETE',
        tabla: 'empresa_lugar',
        registro_id: id,
        datos_anteriores: lugarEliminado
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lugar eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el lugar',
      error: error.message
    });
  }
};

// Buscar lugares por nombre (solo de la empresa del usuario)
const buscarLugaresPorNombre = async (req, res) => {
  try {
    const { q } = req.query;
    
    // Verificar autenticación
    if (!req.user || !req.user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener el ID de la empresa del usuario autenticado'
      });
    }
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro de búsqueda es obligatorio'
      });
    }
    
    // Buscar y filtrar por empresa
    const todosLosLugares = await EmpresaLugarModel.buscarLugaresPorNombre(q);
    const lugares = todosLosLugares.filter(lugar => lugar.empresa_id === req.user.empresa_id);
    
    res.status(200).json({
      success: true,
      data: lugares,
      message: 'Búsqueda completada exitosamente'
    });
  } catch (error) {
    console.error('Error al buscar lugares:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar lugares',
      error: error.message
    });
  }
};

const LugarController = {
  createLugar,
  getAllLugares,
  getLugaresByEmpresa,
  getLugaresActivosByEmpresa,
  getLugarById,
  updateLugar,
  desactivarLugar,
  activarLugar,
  deleteLugar,
  buscarLugaresPorNombre
};

export default LugarController;
