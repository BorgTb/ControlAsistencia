import { ref, computed } from 'vue'
import AsistenciaService from '../services/AsistenciaService.js'

export function useAsistencia() {
  // Estado reactivo
  const registros = ref([])
  const estadoActual = ref('fuera') // 'dentro' | 'fuera'
  const isLoading = ref(false)
  const estadisticas = ref({})

  // Computed properties
  const estaEnTrabajo = computed(() => estadoActual.value === 'dentro')
  const totalRegistros = computed(() => registros.value.length)
  
  const tiempoTrabajadoHoy = computed(() => {
    if (registros.value.length === 0) return { horas: 0, minutos: 0, total: '0h 0m' }
    
    const hoy = new Date().toDateString()
    const registrosHoy = registros.value.filter(registro => 
      new Date(registro.fecha).toDateString() === hoy
    )
    
    let tiempoTotal = 0
    let ultimaEntrada = null
    
    registrosHoy.forEach(registro => {
      if (registro.tipo === 'entrada') {
        ultimaEntrada = new Date(registro.fecha)
      } else if (registro.tipo === 'salida' && ultimaEntrada) {
        const salida = new Date(registro.fecha)
        tiempoTotal += salida.getTime() - ultimaEntrada.getTime()
        ultimaEntrada = null
      }
    })
    
    // Si hay una entrada sin salida (está trabajando actualmente)
    if (ultimaEntrada && estadoActual.value === 'dentro') {
      tiempoTotal += new Date().getTime() - ultimaEntrada.getTime()
    }
    
    const horas = Math.floor(tiempoTotal / (1000 * 60 * 60))
    const minutos = Math.floor((tiempoTotal % (1000 * 60 * 60)) / (1000 * 60))
    
    return {
      horas,
      minutos,
      total: `${horas}h ${minutos}m`,
      milisegundos: tiempoTotal
    }
  })

  const ultimoRegistro = computed(() => {
    if (registros.value.length === 0) return null
    return registros.value[registros.value.length - 1]
  })

  // Métodos
  const registrarEntrada = async () => {
    isLoading.value = true
    try {
      const result = await AsistenciaService.registrarEntrada()
      if (result.success) {
        estadoActual.value = 'dentro'
        await cargarRegistrosHoy()
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  const registrarSalida = async () => {
    isLoading.value = true
    try {
      const result = await AsistenciaService.registrarSalida()
      if (result.success) {
        estadoActual.value = 'fuera'
        await cargarRegistrosHoy()
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  const cargarRegistrosHoy = async () => {
    isLoading.value = true
    try {
      const result = await AsistenciaService.obtenerRegistrosHoy()
      if (result.success) {
        registros.value = result.data
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  const cargarRegistrosPorPeriodo = async (fechaInicio, fechaFin) => {
    isLoading.value = true
    try {
      const result = await AsistenciaService.obtenerRegistrosPorPeriodo(fechaInicio, fechaFin)
      if (result.success) {
        registros.value = result.data
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  const verificarEstadoActual = async () => {
    try {
      const result = await AsistenciaService.obtenerEstadoActual()
      if (result.success) {
        estadoActual.value = result.data.estado || 'fuera'
      }
      return result
    } catch (error) {
      console.error('Error verificando estado:', error)
      return { success: false, error: error.message }
    }
  }

  const cargarEstadisticas = async (mes = null) => {
    isLoading.value = true
    try {
      const result = await AsistenciaService.obtenerEstadisticas(mes)
      if (result.success) {
        estadisticas.value = result.data
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  const corregirRegistro = async (registroId, datosCorreccion) => {
    isLoading.value = true
    try {
      const result = await AsistenciaService.corregirRegistro(registroId, datosCorreccion)
      if (result.success) {
        await cargarRegistrosHoy()
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  const eliminarRegistro = async (registroId) => {
    isLoading.value = true
    try {
      const result = await AsistenciaService.eliminarRegistro(registroId)
      if (result.success) {
        await cargarRegistrosHoy()
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  const generarReporte = async (parametros) => {
    isLoading.value = true
    try {
      const result = await AsistenciaService.generarReporte(parametros)
      return result
    } finally {
      isLoading.value = false
    }
  }

  // Utilidades
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatearFechaCompleta = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const esHoy = (fecha) => {
    const hoy = new Date()
    const fechaComparar = new Date(fecha)
    return fechaComparar.toDateString() === hoy.toDateString()
  }

  const esEstaSeamana = (fecha) => {
    const hoy = new Date()
    const fechaComparar = new Date(fecha)
    const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()))
    return fechaComparar >= inicioSemana
  }

  const calcularTiempoPorDia = (registrosDia) => {
    let tiempoTotal = 0
    let ultimaEntrada = null
    
    registrosDia.forEach(registro => {
      if (registro.tipo === 'entrada') {
        ultimaEntrada = new Date(registro.fecha)
      } else if (registro.tipo === 'salida' && ultimaEntrada) {
        const salida = new Date(registro.fecha)
        tiempoTotal += salida.getTime() - ultimaEntrada.getTime()
        ultimaEntrada = null
      }
    })
    
    const horas = Math.floor(tiempoTotal / (1000 * 60 * 60))
    const minutos = Math.floor((tiempoTotal % (1000 * 60 * 60)) / (1000 * 60))
    
    return {
      horas,
      minutos,
      total: `${horas}h ${minutos}m`,
      milisegundos: tiempoTotal
    }
  }

  return {
    // Estado
    registros,
    estadoActual,
    isLoading,
    estadisticas,
    
    // Computed
    estaEnTrabajo,
    totalRegistros,
    tiempoTrabajadoHoy,
    ultimoRegistro,
    
    // Métodos principales
    registrarEntrada,
    registrarSalida,
    cargarRegistrosHoy,
    cargarRegistrosPorPeriodo,
    verificarEstadoActual,
    cargarEstadisticas,
    corregirRegistro,
    eliminarRegistro,
    generarReporte,
    
    // Utilidades
    formatearFecha,
    formatearHora,
    formatearFechaCompleta,
    esHoy,
    esEstaSeamana,
    calcularTiempoPorDia
  }
}
