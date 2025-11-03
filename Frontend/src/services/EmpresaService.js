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
    } else {
      console.warn('⚠️ No hay token disponible')
    }

    if (user) {
      config.headers['X-User'] = user
    } else {
      console.warn('⚠️ No hay usuario disponible')
    }
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
      const response = await apiClient.post('/userEmpresa/trabajador', trabajadorData)
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

  // Nuevo: Obtener detalle de tipo de turno
  static async obtenerDetalleTipoTurno(id) {
    try {
      const response = await apiClient.get(`/userEmpresa/tipos-turnos/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error obteniendo detalle de tipo de turno:', error)
      throw error
    }
  }

  // Actualizar: createTurno ahora crea asignación
  static async createTurno(asignacionData) {
    try {
      const response = await apiClient.post('/userEmpresa/turnos', asignacionData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async updateTurno(turnoId, nuevosDatos) {
    try {
      console.log('Modificando turno:', turnoId, nuevosDatos)
      const response = await apiClient.put(`/userEmpresa/turnos/${turnoId}`, nuevosDatos)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async obtenerTurnos(rut) {
    try {
      const response = await apiClient.get(`/userEmpresa/turnos/${rut}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async obtenerTurnosTrabajador(trabajadorId) {
    try {
      const response = await apiClient.get(`/userEmpresa/trabajador/${trabajadorId}/turnos`)
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo turnos del trabajador:', error)
      throw error
    }
  }

  static async obtenerMarcacionesTrabajador(trabajadorId, limite = 10) {
    try {
      const response = await apiClient.get(`/userEmpresa/trabajador/${trabajadorId}/marcaciones`, {
        params: { limite }
      })
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

  static async deleteTipoTurno(tipoTurnoId) {
    try {
      const response = await apiClient.delete(`/userEmpresa/tipos-turnos/${tipoTurnoId}`)
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
      const response = await apiClient.put(`/userEmpresa/trabajador/${trabajadorId}/horas-laborales`, {
        horas_laborales: horasLaborales
      })
      return response.data
    } catch (error) {
      console.error('❌ Error actualizando horas laborales:', error)
      throw error
    }
  }

  /**
   * Registra una nueva amonestación para un trabajador
   * @param {Object} amonestacionData - Datos de la amonestación
   * @returns {Promise} Respuesta de la operación
   */
  static async registrarAmonestacion(amonestacionData) {
    try {
      const response = await apiClient.post('/userEmpresa/amonestaciones', amonestacionData)
      return response.data
    } catch (error) {
      console.error('❌ Error registrando amonestación:', error)
      throw error
    }
  }

  /**
   * Obtiene las amonestaciones de un trabajador específico o todas si no se especifica
   * @param {number} trabajadorId - ID del trabajador (opcional)
   * @returns {Promise} Lista de amonestaciones
   */
  static async obtenerAmonestaciones(trabajadorId = null) {
    try {
      const url = trabajadorId 
        ? `/userEmpresa/amonestaciones/trabajador/${trabajadorId}`
        : '/userEmpresa/amonestaciones'
      
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo amonestaciones:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las amonestaciones de una empresa
   * @param {string} rutEmpresa - RUT de la empresa
   * @returns {Promise} Lista de amonestaciones de la empresa
   */
  static async obtenerAmonestacionesPorEmpresa(rutEmpresa) {
    try {
      const response = await apiClient.get(`/userEmpresa/amonestaciones/empresa/${rutEmpresa}`)
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo amonestaciones de la empresa:', error)
      throw error
    }
  }

  /**
   * Actualiza una amonestación existente
   * @param {number} amonestacionId - ID de la amonestación
   * @param {Object} datosActualizados - Datos a actualizar
   * @returns {Promise} Respuesta de la operación
   */
  static async actualizarAmonestacion(amonestacionId, datosActualizados) {
    try {
      const response = await apiClient.put(`/userEmpresa/amonestaciones/${amonestacionId}`, datosActualizados)
      return response.data
    } catch (error) {
      console.error('❌ Error actualizando amonestación:', error)
      throw error
    }
  }

  /**
   * Elimina una amonestación
   * @param {number} amonestacionId - ID de la amonestación
   * @returns {Promise} Respuesta de la operación
   */
  static async eliminarAmonestacion(amonestacionId) {
    try {
      const response = await apiClient.delete(`/userEmpresa/amonestaciones/${amonestacionId}`)
      return response.data
    } catch (error) {
      console.error('❌ Error eliminando amonestación:', error)
      throw error
    }
  }

  /**
   * Obtiene el reporte de jornada diaria para una empresa
   * @param {string} rutEmpresa - RUT de la empresa
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise} Reporte de jornada diaria
   */
  static async obtenerReporteJornadaDiaria(rutEmpresa, fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get(`/userEmpresa/reporte-jornada/${rutEmpresa}`, {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }
      })
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo reporte de jornada diaria:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de asistencia detallado con métricas avanzadas
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD) - opcional
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD) - opcional
   * @returns {Promise} Datos detallados del reporte de asistencia
   */
  static async obtenerReporteAsistenciaDetallado(fechaInicio = null, fechaFin = null) {
    try {
      
      const params = {}
      if (fechaInicio) params.fechaInicio = fechaInicio
      if (fechaFin) params.fechaFin = fechaFin
      
      const response = await apiClient.get('/userEmpresa/reportes-asistencia-detallado', { params })
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo reporte detallado:', error)
      throw error
    }
  }

  /**
   * Aprueba horas extras de un trabajador
   * @param {Object} horasExtrasData - Datos de las horas extras a aprobar
   * @returns {Promise} Respuesta de la operación
   */
  static async aprobarHorasExtras(horasExtrasData) {
    try {
      console.log('🚀 Aprobando horas extras:', horasExtrasData)
      const response = await apiClient.post('/userEmpresa/horas-extras/aprobar', horasExtrasData)
      console.log('✅ Horas extras aprobadas:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error aprobando horas extras:', error)
      throw error
    }
  }

  /**
   * Aprueba una hora extra específica que está PENDIENTE por su ID
   * @param {number} horaExtraId - ID de la hora extra pendiente
   * @param {string} motivo - Motivo de la aprobación (opcional)
   * @returns {Promise} Respuesta de la operación
   */
  static async aprobarHoraExtraPendiente(horaExtraId, motivo = null) {
    try {
      console.log('🚀 Aprobando hora extra pendiente:', horaExtraId)
      const response = await apiClient.patch(`/userEmpresa/horas-extras/${horaExtraId}/aprobar`, {
        motivo: motivo
      })
      console.log('✅ Hora extra pendiente aprobada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error aprobando hora extra pendiente:', error)
      throw error
    }
  }

  /**
   * Rechaza una hora extra específica que está PENDIENTE por su ID
   * @param {number} horaExtraId - ID de la hora extra pendiente
   * @param {string} motivoRechazo - Motivo del rechazo
   * @returns {Promise} Respuesta de la operación
   */
  static async rechazarHoraExtraPendiente(horaExtraId, motivoRechazo) {
    try {
      console.log('🚀 Rechazando hora extra pendiente:', horaExtraId)
      const response = await apiClient.patch(`/userEmpresa/horas-extras/${horaExtraId}/rechazar`, {
        motivo_rechazo: motivoRechazo
      })
      console.log('✅ Hora extra pendiente rechazada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error rechazando hora extra pendiente:', error)
      throw error
    }
  }

  /**
   * Obtiene horas extras por empresa
   * @param {number} empresaId - ID de la empresa
   * @returns {Promise} Lista de horas extras
   */
  static async obtenerHorasExtrasPorEmpresa(empresaId) {
    try {
      const response = await apiClient.get(`/userEmpresa/horas-extras/empresa/${empresaId}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo horas extras de la empresa:', error)
      throw error
    }
  }

  /**
   * Obtiene horas extras por trabajador
   * @param {number} usuarioEmpresaId - ID del usuario_empresa
   * @returns {Promise} Lista de horas extras del trabajador
   */
  static async obtenerHorasExtrasPorTrabajador(usuarioEmpresaId) {
    try {
      const response = await apiClient.get(`/userEmpresa/horas-extras/trabajador/${usuarioEmpresaId}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo horas extras del trabajador:', error)
      throw error
    }
  }

  /**
   * Obtiene resumen de horas extras por empresa y período
   * @param {number} empresaId - ID de la empresa
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise} Resumen de horas extras
   */
  static async obtenerResumenHorasExtras(empresaId, fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get(`/userEmpresa/horas-extras/resumen/${empresaId}`, {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }
      })
      return response.data
    } catch (error) {
      console.error('Error obteniendo resumen de horas extras:', error)
      throw error
    }
  }

}

export default EmpresaServices;

