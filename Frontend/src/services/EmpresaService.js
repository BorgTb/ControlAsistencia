// NOTA:
// Se eliminaron los métodos createEmpresa y actualizarEmpresa que estaban duplicados y fuera de la clase AdminServices.
// Esto es necesario porque los métodos deben estar dentro de la clase para que el servicio funcione correctamente y evitar errores de sintaxis.
// Además, así se mantiene la organización y encapsulamiento del código.
// Esto permite que el CRUD de empresas funcione correctamente, mostrando los datos en la web y permitiendo crear, editar y visualizar sin errores de autenticación.
import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js'

// Configuración de la URL base de la API
const API_BASE_URL = (() => {
  // Verificar si estamos en un entorno Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }
  // Fallback para otros entornos
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
})()

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

// Interceptor para agregar el token y el user a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.getToken
    const user = authStore.getUser

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (user) {
      config.headers['X-User'] = user
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    
    // Si recibimos un 401, limpiamos la autenticación
    if (error.response?.status === 401) {
      authStore.clearAuth()
    }
    
    return Promise.reject(error)
  }
)


class AdminServices{
  // Eliminar empresa (CRUD empresa, NO empresa_lugar)
  // Este método elimina una empresa de la tabla empresa, no afecta empresa_lugar ni otros módulos
  static async eliminarEmpresa(empresaId) {
    try {
      const response = await apiClient.delete(`/empresas/${empresaId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
  // Obtener todas las empresas (para el CRUD de empresas)
  // Se agrega para que el frontend use el apiClient y así el token JWT se envíe correctamente
  static async obtenerEmpresas() {
    try {
      const response = await apiClient.get('/empresas')
      return response.data
    } catch (error) {
      throw error
    }
  }
  // Métodos para empresas
  // Se agregan para que el frontend use el apiClient y así el token JWT se envíe correctamente, pues sin esto no guarda los datos del crud empresas.
  // Esto permite que el CRUD de empresas funcione correctamente, mostrando los datos en la web y permitiendo crear, editar y visualizar sin errores de autenticación.
  static async createEmpresa(empresaData) {
    try {
      const response = await apiClient.post('/empresas', empresaData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async actualizarEmpresa(empresaId, empresaData) {
    try {
      const response = await apiClient.put(`/empresas/${empresaId}`, empresaData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async crearTrabajador(trabajadorData) {
    try {
      const response = await apiClient.post('/userEmpresa/trabajador', trabajadorData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async obtenerTrabajadores(rut, enrolados = false) {
    console.log("Obteniendo trabajadores para RUT:", rut, "Enrolados:", enrolados);
    try {
      const response = await apiClient.get(`/userEmpresa/trabajador/${rut}`, {
        params: { enrolados: enrolados }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async actualizarTrabajador(trabajadorId, trabajadorData) {
    try {
      const response = await apiClient.put(`/userEmpresa/trabajadores/${trabajadorId}`, trabajadorData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async eliminarTrabajador(trabajadorId) {
    try {
      const response = await apiClient.delete(`/userEmpresa/trabajadores/${trabajadorId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async asignarTurno(turnoData) {
    try {
      const response = await apiClient.post('/userEmpresa/turnos', turnoData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async createTurno(turnoData) {
    try {
      const response = await apiClient.post('/userEmpresa/turnos', turnoData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async obtenerTurnos(rut) {
    try {
      const response = await apiClient.get(`/userEmpresa/turnos/${rut}`)
      console.log('Turnos obtenidos:', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async enrolarTrabajador(datosEnrolamiento) {
    try {
      const response = await apiClient.post('/userEmpresa/enrolar-trabajador', datosEnrolamiento)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Métodos para marcaciones
  static async obtenerTodasLasMarcaciones() {
    try {
      const response = await apiClient.get('/marcaciones/userEmpresa/todas')
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async obtenerMarcacionesPorFecha(rutEmpresa, fecha) {
    try {
      const response = await apiClient.get(`/marcaciones/userEmpresa/empresa/${rutEmpresa}/fecha/${fecha}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async obtenerMarcacionesPorEmpresa(rutEmpresa) {
    try {
      const response = await apiClient.get(`/marcaciones/userEmpresa/empresa/${rutEmpresa}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async obtenerReportesMarcaciones(rutEmpresa) {
    try {
      const response = await apiClient.get(`/userEmpresa/reportes/${rutEmpresa}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async aprobarReporte(reporteId) {
    try {
      const response = await apiClient.post(`/userEmpresa/reportes/aprobar/${reporteId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async rechazarReporte(reporteId) {
    try {
      const response = await apiClient.post(`/userEmpresa/reportes/rechazar/${reporteId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default AdminServices;

