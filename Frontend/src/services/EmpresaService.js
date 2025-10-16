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
    console.log('🔧 Interceptor request ejecutándose para:', config.url)
    
    const authStore = useAuthStore()
    const token = authStore.getToken
    const user = authStore.getUser

    console.log('🔍 Estado de autenticación:')
    console.log('- Token presente:', !!token)
    console.log('- Usuario presente:', !!user)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token agregado al header Authorization')
    } else {
      console.warn('⚠️ No hay token disponible')
    }

    if (user) {
      config.headers['X-User'] = user
      console.log('✅ Usuario agregado al header X-User')
    } else {
      console.warn('⚠️ No hay usuario disponible')
    }

    console.log('📋 Headers finales:', config.headers)
    return config
  },
  (error) => {
    console.error('❌ Error en interceptor request:', error)
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




class EmpresaServices{

  static async crearTrabajador(trabajadorData) {
    try {
      console.log('🚀 EmpresaService.crearTrabajador iniciado')
      console.log('📤 Datos a enviar:', trabajadorData)
      
      const response = await apiClient.post('/userEmpresa/trabajador', trabajadorData)
      console.log('✅ Respuesta exitosa:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error en EmpresaService.crearTrabajador:', error)
      console.error('📋 Detalles del error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      // Si el servidor devuelve un mensaje específico, lo pasamos
      if (error.response?.data?.message) {
        const serverError = new Error(error.response.data.message)
        serverError.response = error.response
        throw serverError
      }
      
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

  // Nuevo: Obtener tipos de turnos disponibles
  static async obtenerTiposTurnos() {
    try {
      const response = await apiClient.get('/userEmpresa/tipos-turnos')
      return response.data
    } catch (error) {
      console.error('Error obteniendo tipos de turnos:', error)
      throw error
    }
  }

  // Nuevo: Crear tipo de turno
  static async crearTipoTurno(tipoTurnoData) {
    try {
      const response = await apiClient.post('/userEmpresa/tipos-turnos', tipoTurnoData)
      return response.data
    } catch (error) {
      console.error('Error creando tipo de turno:', error)
      throw error
    }
  }

  // Actualizar: createTurno ahora crea asignación
  static async createTurno(asignacionData) {
    try {
      console.log('asignacionData', asignacionData)
      const response = await apiClient.post('/userEmpresa/turnos', asignacionData)
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

  static async obtenerTurnosTrabajador(trabajadorId) {
    try {
      console.log('🚀 Obteniendo turnos para trabajador ID:', trabajadorId)
      const response = await apiClient.get(`/userEmpresa/trabajador/${trabajadorId}/turnos`)
      console.log('✅ Turnos del trabajador obtenidos:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo turnos del trabajador:', error)
      throw error
    }
  }

  static async obtenerMarcacionesTrabajador(trabajadorId, limite = 10) {
    try {
      console.log('🚀 Obteniendo marcaciones para trabajador ID:', trabajadorId)
      const response = await apiClient.get(`/userEmpresa/trabajador/${trabajadorId}/marcaciones`, {
        params: { limite }
      })
      console.log('✅ Marcaciones del trabajador obtenidas:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo marcaciones del trabajador:', error)
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

  static async modificarMarcacion(marcacionId, datosMarcacion) {
    try {
      const response = await apiClient.put(`/marcaciones/userEmpresa/modificar/${marcacionId}`, datosMarcacion)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async agregarMarcacionManual(datosMarcacion) {
    try {
      const response = await apiClient.post('/marcaciones/userEmpresa/agregar', datosMarcacion)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async guardarConfiguracion(data) {
    console.log("Guardando configuración:", data);

    try {
      const response = await apiClient.post('/userEmpresa/configuracion/marcaciones', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async obtenerConfiguracionMarcaciones() {
    try {
      const response = await apiClient.get('/userEmpresa/configuracion/marcaciones')
      return response.data
    }
    catch (error) {
      throw error
    }
  }

  static async obtenerHistorialSolicitudes() {
    try {
      const response = await apiClient.get('/userEmpresa/historial-solicitudes')
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async eliminarTurno(turnoId) {
    try {
      const response = await apiClient.delete(`/userEmpresa/turnos/${turnoId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtiene las horas trabajadas en la semana actual para un trabajador específico
   * @param {number} usuarioEmpresaId - ID del usuario en la tabla usuario_empresa
   * @returns {Promise} Respuesta con las horas semanales calculadas
   */
  static async obtenerHorasSemanales(usuarioEmpresaId) {
    try {
      const response = await apiClient.get(`/marcaciones/horas-semanales/${usuarioEmpresaId}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener horas semanales:', error)
      throw error
    }
  }

  /**
   * Actualiza las horas laborales semanales de un trabajador
   * @param {number} trabajadorId - ID del trabajador
   * @param {string} horasLaborales - Horas laborales semanales (44, 45 o 54)
   * @returns {Promise} Respuesta de la operación
   */
  static async actualizarHorasLaborales(trabajadorId, horasLaborales) {
    try {
      console.log('🚀 Actualizando horas laborales:', { trabajadorId, horasLaborales })
      const response = await apiClient.put(`/userEmpresa/trabajador/${trabajadorId}/horas-laborales`, {
        horas_laborales: horasLaborales
      })
      console.log('✅ Horas laborales actualizadas:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error actualizando horas laborales:', error)
      throw error
    }
  }

}

export default EmpresaServices;

