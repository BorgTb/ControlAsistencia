// Controlador para eliminar una empresa (CRUD)
// Se agrega para permitir el borrado real desde el frontend usando la tabla empresa
const deleteEmpresa = async (req, res) => {
  try {
    const empresaId = req.params.id;
    // Llamar al modelo para eliminar la empresa en la base de datos real
    const empresaEliminada = await EmpresaModel.deleteEmpresa(empresaId);
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
// Se agrega para permitir la creación de empresas desde el frontend usando la tabla empresa real
const createEmpresa = async (req, res) => {
  try {
    const empresaData = req.body;
    // Validación básica (puedes mejorarla según tus reglas de negocio)
    if (!empresaData.emp_nombre || !empresaData.emp_rut) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y RUT son obligatorios'
      });
    }
    // Llamar al modelo para crear la empresa en la base de datos real
    const nuevaEmpresa = await EmpresaModel.createEmpresa(empresaData);
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
// Se conecta este método con el modelo real para actualizar empresas en la base de datos.
// Así, cuando el frontend edita una empresa, el cambio se guarda realmente y no solo en un mock.
const updateEmpresa = async (req, res) => {
  try {
    const empresaId = req.params.id;
    const empresaData = req.body;
    // Validación básica (puedes mejorarla según tus reglas de negocio)
    if (!empresaData.emp_nombre || !empresaData.emp_rut) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y RUT son obligatorios'
      });
    }
    // Llamar al modelo para actualizar la empresa en la base de datos
    const empresaActualizada = await EmpresaModel.updateEmpresa(empresaId, empresaData);
    if (!empresaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
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
import EmpresaModel from "../model/EmpresaModel.js";
import UsuarioEmpresaModel from "../model/UsuarioEmpresaModel.js";


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

// Controlador para obtener empresas activas únicamente
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
        message: "El parámetro 'nombre' es requerido"
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
        dia: "Miércoles",
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
