/**
 * ========== COMPOSABLE DE AUDITORÍA ==========
 * Este composable maneja el estado reactivo y la lógica de negocio
 * para el sistema de auditoría y seguimiento de cambios.
 * Proporciona una interfaz unificada para gestionar registros de auditoría,
 * estadísticas del sistema y operaciones relacionadas.
 */

import { ref, computed, reactive } from 'vue'
import {
  obtenerRegistrosAuditoria,
  obtenerEstadisticasAuditoria,
  cerrarSesionUsuario as cerrarSesionAPI,
  obtenerCambiosUsuario as obtenerCambiosUsuarioAPI,
  registrarCambio as registrarCambioAPI,
  formatearFecha as formatearFechaService,
  formatearDuracion as formatearDuracionService,
  obtenerColorEstado as obtenerColorEstadoService
} from '@/services/auditoria-service.js'

/**
 * ========== ESTADO REACTIVO GLOBAL ==========
 */

// Lista completa de registros de auditoría obtenidos del servidor
const registrosOriginales = ref([])

// Estados de carga y error para feedback del usuario
const loading = ref(false)
const error = ref(null)

// Estadísticas calculadas del sistema
const estadisticas = ref({
  total: 0,
  activos: 0,
  cerrados: 0,
  expirados: 0,
  promedioDuracion: 0,
  usuariosUnicos: 0
})

// Filtros reactivos aplicables a los registros
const filtros = reactive({
  limite: 50,
  estado: '',
  usuario: '',
  fechaInicio: '',
  fechaFin: ''
})

/**
 * ========== COMPUTED PROPERTIES ==========
 */

/**
 * Lista de registros filtrados basada en los filtros activos
 * Aplica filtros de texto y estado en tiempo real
 */
const registros = computed(() => {
  let resultado = registrosOriginales.value

  // Filtrar por búsqueda de usuario (nombre o email)
  if (filtros.usuario.trim()) {
    const busqueda = filtros.usuario.toLowerCase()
    resultado = resultado.filter(registro => {
      const nombreCompleto = `${registro.nombre} ${registro.apellido_pat} ${registro.apellido_mat}`.toLowerCase()
      const email = registro.email?.toLowerCase() || ''
      return nombreCompleto.includes(busqueda) || email.includes(busqueda)
    })
  }

  // Filtrar por estado de sesión
  if (filtros.estado) {
    resultado = resultado.filter(registro => registro.estado === filtros.estado)
  }

  return resultado
})

/**
 * Estadísticas calculadas en base a los registros filtrados
 * Proporciona métricas en tiempo real sobre los datos visibles
 */
const estadisticasCalculadas = computed(() => {
  const total = registros.value.length
  const activos = registros.value.filter(r => r.estado === 'activo').length
  const cerrados = registros.value.filter(r => r.estado === 'cerrado').length
  const expirados = registros.value.filter(r => r.estado === 'expirado').length
  
  // Calcular porcentaje de sesiones activas
  const porcentajeActivos = total > 0 ? Math.round((activos / total) * 100) : 0

  return {
    total,
    activos,
    cerrados,
    expirados,
    porcentajeActivos,
    // Incluir estadísticas adicionales del servidor
    ...estadisticas.value
  }
})

/**
 * ========== FUNCIONES PRINCIPALES ==========
 */

/**
 * Carga registros de auditoría desde el servidor
 * Actualiza el estado reactivo con los nuevos datos
 * @param {number} limite - Número máximo de registros a cargar
 * @param {Object} filtrosAdicionales - Filtros adicionales para la consulta
 */
const cargarRegistros = async (limite = 50, filtrosAdicionales = {}) => {
  try {
    loading.value = true
    error.value = null

    console.log('📊 Cargando registros de auditoría...', { limite, filtros: filtrosAdicionales })

    // Combinar filtros actuales con los adicionales
    const filtrosCompletos = {
      limite,
      ...filtros,
      ...filtrosAdicionales
    }

    // Llamar al servicio de auditoría
    const respuesta = await obtenerRegistrosAuditoria(filtrosCompletos)

    if (respuesta.success) {
      registrosOriginales.value = respuesta.registros || []
      console.log(`✅ ${registrosOriginales.value.length} registros cargados exitosamente`)
    } else {
      throw new Error(respuesta.message || 'Error al cargar registros')
    }

  } catch (err) {
    console.error('❌ Error al cargar registros:', err)
    error.value = `Error al cargar datos: ${err.message}`
    registrosOriginales.value = []
  } finally {
    loading.value = false
  }
}

/**
 * Carga estadísticas generales del sistema
 * Complementa los datos de registros con métricas del servidor
 */
const cargarEstadisticas = async () => {
  try {
    console.log('📈 Cargando estadísticas del sistema...')

    const respuesta = await obtenerEstadisticasAuditoria()

    if (respuesta.success) {
      estadisticas.value = respuesta.estadisticas || {}
      console.log('✅ Estadísticas cargadas:', estadisticas.value)
    } else {
      console.warn('⚠️ No se pudieron cargar las estadísticas')
    }

  } catch (err) {
    console.error('❌ Error al cargar estadísticas:', err)
    // No es crítico, continuar sin estadísticas del servidor
  }
}

/**
 * Cierra la sesión activa de un usuario específico
 * Utilizado por administradores para gestionar sesiones
 * @param {number} usuarioId - ID del usuario
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<boolean>} true si se cerró exitosamente
 */
const cerrarSesionUsuario = async (usuarioId, sesionId) => {
  try {
    console.log('🚪 Cerrando sesión de usuario...', { usuarioId, sesionId })

    const respuesta = await cerrarSesionAPI(usuarioId, sesionId)

    if (respuesta.success) {
      console.log('✅ Sesión cerrada exitosamente')
      
      // Actualizar el registro local
      const indice = registrosOriginales.value.findIndex(r => r.id === sesionId)
      if (indice !== -1) {
        registrosOriginales.value[indice].estado = 'cerrado'
        registrosOriginales.value[indice].fecha_cierre = new Date()
      }

      // Recargar datos para estar sincronizados
      await cargarRegistros(filtros.limite)
      
      return true
    } else {
      throw new Error(respuesta.message || 'Error al cerrar sesión')
    }

  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err)
    error.value = `Error al cerrar sesión: ${err.message}`
    return false
  }
}

/**
 * Actualiza los filtros y recarga los datos
 * Permite cambiar filtros y actualizar la vista automáticamente
 * @param {Object} nuevosFiltros - Filtros a actualizar
 */
const actualizarFiltros = async (nuevosFiltros) => {
  try {
    console.log('🔍 Actualizando filtros...', nuevosFiltros)

    // Actualizar filtros reactivos
    Object.assign(filtros, nuevosFiltros)

    // Recargar datos con los nuevos filtros
    await cargarRegistros(filtros.limite)

  } catch (err) {
    console.error('❌ Error al actualizar filtros:', err)
    error.value = `Error al aplicar filtros: ${err.message}`
  }
}

/**
 * Limpia todos los filtros aplicados
 * Restaura la vista a su estado inicial
 */
const limpiarFiltros = async () => {
  filtros.estado = ''
  filtros.usuario = ''
  filtros.fechaInicio = ''
  filtros.fechaFin = ''
  
  await cargarRegistros(filtros.limite)
}

/**
 * ========== FUNCIONES PARA CAMBIOS DE USUARIOS ==========
 */

/**
 * Obtiene cambios específicos realizados por un usuario
 * Utilizado por el modal de cambios para mostrar historial detallado
 * @param {number} usuarioId - ID del usuario
 * @param {number} limite - Cantidad de cambios a obtener
 * @returns {Promise<Object>} Resultado con cambios del usuario
 */
const obtenerCambiosUsuario = async (usuarioId, limite = 50) => {
  try {
    console.log('📋 Obteniendo cambios para usuario desde composable:', { usuarioId, limite })

    const respuesta = await obtenerCambiosUsuarioAPI(usuarioId, limite)
    
    if (respuesta.success) {
      console.log('✅ Cambios obtenidos desde API:', respuesta.cambios?.length || 0)
      return respuesta
    } else {
      throw new Error(respuesta.message || 'Error al obtener cambios')
    }

  } catch (err) {
    console.error('❌ Error en composable obtenerCambiosUsuario:', err)
    throw err
  }
}

/**
 * Registra un nuevo cambio en el sistema
 * Función auxiliar para registrar modificaciones importantes
 * @param {Object} datosDelCambio - Datos del cambio a registrar
 * @returns {Promise<boolean>} true si se registró exitosamente
 */
const registrarCambio = async (datosDelCambio) => {
  try {
    console.log('📝 Registrando cambio desde composable:', datosDelCambio.accion)

    const respuesta = await registrarCambioAPI(datosDelCambio)
    
    if (respuesta.success) {
      console.log('✅ Cambio registrado exitosamente')
      return true
    } else {
      throw new Error(respuesta.message || 'Error al registrar cambio')
    }

  } catch (err) {
    console.error('❌ Error al registrar cambio:', err)
    return false
  }
}

/**
 * ========== UTILIDADES DE FORMATO ==========
 * Re-exportar funciones del servicio para uso en componentes
 */

const formatearFecha = formatearFechaService
const formatearDuracion = formatearDuracionService
const obtenerColorEstado = obtenerColorEstadoService

/**
 * ========== EXPORTACIÓN DEL COMPOSABLE ==========
 */

export function useAuditoria() {
  return {
    // Estados reactivos
    registros,
    registrosOriginales: readonly(registrosOriginales),
    estadisticasCalculadas,
    loading: readonly(loading),
    error: readonly(error),
    filtros,

    // Funciones principales
    cargarRegistros,
    cargarEstadisticas,
    cerrarSesionUsuario,
    actualizarFiltros,
    limpiarFiltros,

    // Funciones para cambios de usuarios
    obtenerCambiosUsuario,
    registrarCambio,

    // Utilidades de formato
    formatearFecha,
    formatearDuracion,
    obtenerColorEstado
  }
}

/**
 * ========== FUNCIONES DE UTILIDAD ADICIONALES ==========
 */

/**
 * Función auxiliar para crear una referencia de solo lectura
 * Evita modificaciones accidentales del estado
 */
function readonly(ref) {
  return computed(() => ref.value)
}