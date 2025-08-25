// Mock data para simular la base de datos de empresas
const empresasMock = [
  {
    id: 1,
    nombre: "Telemedios S.A.",
    rut: "96.123.456-7",
    activa: true
  },
  {
    id: 2,
    nombre: "Tecnología Digital Ltda.",
    rut: "76.987.654-3",
    activa: true
  },
  {
    id: 3,
    nombre: "Comunicaciones del Sur",
    rut: "85.456.789-0",
    activa: false
  },
  {
    id: 4,
    nombre: "Servicios Integrales S.A.",
    rut: "92.345.678-1",
    activa: true
  },
  {
    id: 5,
    nombre: "Innovación y Desarrollo",
    rut: "81.234.567-8",
    activa: true
  },
  {
    id: 6,
    nombre: "Sistemas Avanzados Ltda.",
    rut: "77.876.543-2",
    activa: false
  },
  {
    id: 7,
    nombre: "Consultoría Empresarial",
    rut: "93.567.890-4",
    activa: true
  },
  {
    id: 8,
    nombre: "Soluciones Tecnológicas",
    rut: "88.432.109-6",
    activa: true
  },
  {
    id: 9,
    nombre: "Medios y Comunicación",
    rut: "79.654.321-5",
    activa: false
  },
  {
    id: 10,
    nombre: "Desarrollo Software Chile",
    rut: "94.789.012-3",
    activa: true
  }
];

// Controlador para obtener todas las empresas
const getAllEmpresas = async (req, res) => {
  try {
    // Usar datos mock en lugar de TelegestorService
    const empresas = empresasMock.map(empresa => ({
      ...empresa,
      totalEmpleados: Math.floor(Math.random() * 100) + 1 // Simular cantidad de empleados
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

const EmpresaController = {
  getAllEmpresas,
  getEmpresasActivas,
  getEmpresaById,
  buscarEmpresasPorNombre,
  getHorariosEmpresa
};

export default EmpresaController;
