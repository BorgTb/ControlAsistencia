/**
 * ========== SERVICIO DE AUDITORÍA ==========
 * Este servicio maneja todas las operaciones relacionadas con el historial
 * de cambios y auditoría del sistema, incluyendo sesiones de usuarios,
 * modificaciones de datos y seguimiento de actividades.
 */

// Importación del store de autenticación para obtener el token
import { useAuthStore } from '../stores/authStore.js'

// URL base del backend para endpoints de auditoría
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * ========== ENDPOINTS DE AUDITORÍA ==========
 */

/**
 * Obtiene los registros de auditoría del sistema
 * Incluye información de sesiones de usuarios, cambios realizados,
 * direcciones IP, fechas de inicio/cierre y duración de sesiones
 * @param {Object} filtros - Filtros para la consulta
 * @param {number} filtros.limite - Cantidad máxima de registros a devolver
 * @param {string} filtros.estado - Estado de la sesión (activo, cerrado, expirado)
 * @param {string} filtros.usuario - Nombre o email del usuario para filtrar
 * @param {string} filtros.fechaInicio - Fecha de inicio para filtrar (formato YYYY-MM-DD)
 * @param {string} filtros.fechaFin - Fecha de fin para filtrar (formato YYYY-MM-DD)
 * @returns {Promise<Object>} Respuesta con registros y metadatos
 */
export const obtenerRegistrosAuditoria = async (filtros = {}) => {
  try {
    // Construir parámetros de consulta desde los filtros
    const params = new URLSearchParams()
    
    // Añadir filtros válidos a la URL
    if (filtros.limite) params.append('limite', filtros.limite)
    if (filtros.estado) params.append('estado', filtros.estado)
    if (filtros.usuario) params.append('usuario', filtros.usuario)
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)

    // Realizar petición al endpoint de auditoría
    const authStore = useAuthStore()
    const response = await fetch(`${API_BASE_URL}/auditoria/sesiones?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getToken}` // Token JWT para autenticación
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener registros: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Procesar fechas para zona horaria de Chile
    if (data.data) {
      data.registros = data.data.map(registro => ({
        ...registro,
        fecha_inicio: registro.fecha_inicio ? new Date(registro.fecha_inicio) : null,
        fecha_cierre: registro.fecha_cierre ? new Date(registro.fecha_cierre) : null
      }))
      // Mantener compatibilidad con el formato esperado
      data.success = data.success
    }

    return data
  } catch (error) {
    console.error('❌ Error al obtener registros de auditoría:', error)
    throw error
  }
}

/**
 * Obtiene estadísticas generales del sistema de auditoría
 * Incluye conteos de sesiones activas, cerradas, usuarios únicos,
 * promedios de tiempo de sesión y otras métricas relevantes
 * @returns {Promise<Object>} Estadísticas del sistema
 */
export const obtenerEstadisticasAuditoria = async () => {
  try {
    const authStore = useAuthStore()
    const response = await fetch(`${API_BASE_URL}/auditoria/estadisticas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de auditoría:', error)
    throw error
  }
}

/**
 * Cierra la sesión activa de un usuario específico
 * Utilizado por administradores para cerrar sesiones de otros usuarios
 * @param {number} usuarioId - ID del usuario cuya sesión se cerrará
 * @param {number} sesionId - ID específico de la sesión a cerrar
 * @returns {Promise<Object>} Resultado de la operación
 */
export const cerrarSesionUsuario = async (usuarioId, sesionId) => {
  try {
    const authStore = useAuthStore()
    const response = await fetch(`${API_BASE_URL}/auditoria/cerrar-sesion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getToken}`
      },
      body: JSON.stringify({
        usuarioId,
        sesionId,
        motivo: 'Cerrado por administrador' // Motivo estándar para cierre administrativo
      })
    })

    if (!response.ok) {
      throw new Error(`Error al cerrar sesión: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('❌ Error al cerrar sesión de usuario:', error)
    throw error
  }
}

/**
 * Obtiene los cambios específicos realizados por un usuario
 * Incluye modificaciones de empresas, trabajadores, roles y configuraciones
 * @param {number} usuarioId - ID del usuario cuyos cambios se quieren obtener
 * @param {number} limite - Cantidad máxima de cambios a devolver (por defecto 50)
 * @returns {Promise<Object>} Respuesta con cambios y metadatos
 */
export const obtenerCambiosUsuario = async (usuarioId, limite = 50) => {
  try {
    console.log('🔍 Obteniendo cambios para usuario:', { usuarioId, limite })
    console.log('🔍 Tipo de usuarioId:', typeof usuarioId, 'Valor:', usuarioId)
    
    const authStore = useAuthStore()
    const token = authStore.getToken
    console.log('🔍 Token disponible:', !!token, 'Primeros caracteres:', token?.substring(0, 20))
    
    const url = `${API_BASE_URL}/auditoria/cambios/${usuarioId}?limite=${limite}`
    console.log('🔍 URL de la petición:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('🔍 Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error response body:', errorText)
      throw new Error(`Error al obtener cambios: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('🔍 Data recibida del servidor:', data)
    
    // Procesar fechas de cambios para zona horaria de Chile
    if (data.cambios) {
      data.cambios = data.cambios.map(cambio => ({
        ...cambio,
        fecha_cambio: cambio.fecha_cambio ? new Date(cambio.fecha_cambio) : null
      }))
    }

    console.log('✅ Cambios obtenidos:', data.cambios?.length || 0)
    console.log('🔍 Cambios procesados:', data.cambios)
    return data
  } catch (error) {
    console.error('❌ Error al obtener cambios de usuario:', error)
    throw error
  }
}

/**
 * Registra un nuevo cambio en el sistema
 * Utilizado para auditar modificaciones de datos importantes
 * @param {Object} datosDelCambio - Información del cambio a registrar
 * @param {number} datosDelCambio.usuario_id - ID del usuario que realizó el cambio
 * @param {string} datosDelCambio.accion - Tipo de acción realizada
 * @param {string} datosDelCambio.tabla_afectada - Tabla o entidad modificada
 * @param {string} datosDelCambio.descripcion - Descripción legible del cambio
 * @param {Object} datosDelCambio.datos_anteriores - Estado anterior (opcional)
 * @param {Object} datosDelCambio.datos_nuevos - Estado nuevo (opcional)
 * @returns {Promise<Object>} Resultado del registro
 */
export const registrarCambio = async (datosDelCambio) => {
  try {
    console.log('📝 Registrando cambio:', datosDelCambio.accion)
    
    const authStore = useAuthStore()
    const response = await fetch(`${API_BASE_URL}/auditoria/registrar-cambio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getToken}`
      },
      body: JSON.stringify(datosDelCambio)
    })

    if (!response.ok) {
      throw new Error(`Error al registrar cambio: ${response.statusText}`)
    }

    const resultado = await response.json()
    console.log('✅ Cambio registrado con ID:', resultado.cambio_id)
    return resultado
  } catch (error) {
    console.error('❌ Error al registrar cambio:', error)
    throw error
  }
}

/**
 * ========== UTILIDADES DE FORMATO ==========
 */

/**
 * Formatea una fecha a la zona horaria de Chile (America/Santiago)
 * Maneja tanto objetos Date como strings de fecha
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada en formato local chileno
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  
  try {
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha)
    
    // Formatear para zona horaria de Chile
    return fechaObj.toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    console.error('❌ Error al formatear fecha:', error)
    return 'Fecha inválida'
  }
}

/**
 * Formatea la duración de una sesión en minutos u horas
 * Convierte tiempo en minutos a un formato legible
 * @param {number} minutos - Duración en minutos
 * @returns {string} Duración formateada
 */
export const formatearDuracion = (minutos) => {
  if (!minutos || minutos <= 0) return 'N/A'
  
  if (minutos < 60) {
    return `${minutos} min`
  } else {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`
  }
}

/**
 * Obtiene las clases CSS para el estado de una sesión
 * Aplica colores consistentes según el estado de la sesión
 * @param {string} estado - Estado de la sesión
 * @returns {string} Clases CSS para el badge del estado
 */
export const obtenerColorEstado = (estado) => {
  const colores = {
    'activo': 'bg-green-100 text-green-800 border-green-200',
    'cerrado': 'bg-gray-100 text-gray-800 border-gray-200',
    'expirado': 'bg-red-100 text-red-800 border-red-200',
    'suspendido': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  
  return colores[estado?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
}