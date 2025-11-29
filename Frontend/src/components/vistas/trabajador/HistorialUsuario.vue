<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Historial de Marcaciones</h1>
            <p class="text-gray-600 mt-2">Registro completo de todas tus marcaciones de asistencia</p>
          </div>
          <div class="flex space-x-3">
            <button @click="abrirModalAgregarMarcacion" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                Solicitar Marcación
            </button>
            <button @click="exportarHistorial" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
              Exportar CSV
            </button>
            <button @click="cargarHistorial" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input 
              type="date" 
              v-model="filtros.fechaDesde" 
              @change="aplicarFiltros"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input 
              type="date" 
              v-model="filtros.fechaHasta" 
              @change="aplicarFiltros"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Marcación</label>
            <select 
              v-model="filtros.tipo" 
              @change="aplicarFiltros"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos los tipos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="colacion">Colación</option>
              <option value="descanso">Descanso</option>
            </select>
          </div>
          <div class="flex items-end">
            <button 
              @click="limpiarFiltros" 
              class="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors duration-200"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Entradas</p>
              <p class="text-2xl font-bold text-gray-900">{{ estadisticas.totalEntradas }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Salidas</p>
              <p class="text-2xl font-bold text-gray-900">{{ estadisticas.totalSalidas }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 rounded-lg">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Colaciones</p>
              <p class="text-2xl font-bold text-gray-900">{{ estadisticas.totalColaciones }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Días Trabajados</p>
              <p class="text-2xl font-bold text-gray-900">{{ estadisticas.diasTrabajados }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Marcaciones -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">
            Marcaciones 
            <span class="text-sm text-gray-500">({{ marcacionesFiltradas.length }} registros)</span>
          </h3>
          <div class="text-sm text-gray-500">
            <span v-if="cargando">Cargando...</span>
            <span v-else>Última actualización: {{ formatearFechaCompleta(new Date()) }}</span>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Origen</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="marcacion in marcacionesPaginadas" :key="marcacion.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatearFecha(marcacion.fecha) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatearHora(marcacion.hora) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getColorByType(marcacion.tipo)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white">
                    {{ getTipoLabel(marcacion.tipo) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="marcacion.geo_lat && marcacion.geo_lon" class="flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-xs">GPS Registrado</span>
                  </div>
                  <div v-else class="flex items-center">
                    <svg class="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-xs text-gray-400">Sin ubicación</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ marcacion.ip_origen || 'No disponible' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Procesada
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    @click="abrirModalReporte(marcacion)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    title="Reportar problema con esta marcación"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    Reportar
                  </button>
                </td>
              </tr>

              <!-- Mensaje cuando no hay marcaciones -->
              <tr v-if="marcacionesFiltradas.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No hay marcaciones</h3>
                    <p class="text-gray-500">No se encontraron marcaciones con los filtros aplicados.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginación -->
        <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6" v-if="marcacionesFiltradas.length > marcacionesPorPagina">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ indiceInicio + 1 }}</span> a 
              <span class="font-medium">{{ Math.min(indiceFin, marcacionesFiltradas.length) }}</span> de 
              <span class="font-medium">{{ marcacionesFiltradas.length }}</span> marcaciones
            </div>
            <div class="flex space-x-2">
              <button 
                @click="paginaAnterior" 
                :disabled="paginaActual === 1"
                :class="paginaActual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
                class="px-3 py-1 text-sm border border-gray-300 rounded"
              >
                Anterior
              </button>
              
              <span class="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                {{ paginaActual }}
              </span>
              
              <button 
                @click="paginaSiguiente" 
                :disabled="paginaActual >= totalPaginas"
                :class="paginaActual >= totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
                class="px-3 py-1 text-sm border border-gray-300 rounded"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Reporte -->
    <ReporteModal 
      v-if="showReporteModal && marcacionSeleccionada" 
      :marcacion="marcacionSeleccionada"
      @confirm="manejarEnvioReporte" 
      @cancel="cerrarModalReporte" 
    />
    
    <!-- Modal de Solicitud de Marcación -->
    <AgregarMarcacionModal 
      v-if="showAgregarModal" 
      @confirm="manejarSolicitudMarcacion" 
      @cancel="cerrarModalAgregarMarcacion" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AsistenciaService from '@/services/AsistenciaService.js'
import ReporteModal from '@/components/modals/ReporteModal.vue'
import AgregarMarcacionModal from '@/components/modals/AgregarMarcacionModal.vue'
import { useReportes } from '@/composables/useReportes.js'
import { useMarcaciones } from '@/composables/useMarcaciones.js'
// Estados reactivos
const marcaciones = ref([])
const cargando = ref(false)
const error = ref('')

// Composable de reportes
const { 
  showReporteModal, 
  marcacionSeleccionada, 
  abrirModalReporte, 
  cerrarModalReporte, 
  enviarReporte 
} = useReportes()

// Composable de marcaciones
const { 
  showAgregarModal, 
  abrirModalAgregarMarcacion, 
  cerrarModalAgregarMarcacion, 
  solicitarMarcacion 
} = useMarcaciones()

// Filtros
const filtros = ref({
  fechaDesde: '',
  fechaHasta: '',
  tipo: ''
})

// Paginación
const paginaActual = ref(1)
const marcacionesPorPagina = 20

// Computed properties
const marcacionesFiltradas = computed(() => {
  let resultado = [...marcaciones.value]

  // Filtrar por fecha desde
  if (filtros.value.fechaDesde) {
    resultado = resultado.filter(m => {
      const fechaMarcacion = new Date(m.fecha).toISOString().split('T')[0]
      return fechaMarcacion >= filtros.value.fechaDesde
    })
  }

  // Filtrar por fecha hasta
  if (filtros.value.fechaHasta) {
    resultado = resultado.filter(m => {
      const fechaMarcacion = new Date(m.fecha).toISOString().split('T')[0]
      return fechaMarcacion <= filtros.value.fechaHasta
    })
  }

  // Filtrar por tipo
  if (filtros.value.tipo) {
    resultado = resultado.filter(m => m.tipo === filtros.value.tipo)
  }

  // Ordenar por fecha y hora más recientes primero
  return resultado.sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`)
    const fechaB = new Date(`${b.fecha}T${b.hora}`)
    return fechaB.getTime() - fechaA.getTime()
  })
})

const totalPaginas = computed(() => {
  return Math.ceil(marcacionesFiltradas.value.length / marcacionesPorPagina)
})

const indiceInicio = computed(() => {
  return (paginaActual.value - 1) * marcacionesPorPagina
})

const indiceFin = computed(() => {
  return indiceInicio.value + marcacionesPorPagina
})

const marcacionesPaginadas = computed(() => {
  return marcacionesFiltradas.value.slice(indiceInicio.value, indiceFin.value)
})

const estadisticas = computed(() => {
  const stats = {
    totalEntradas: 0,
    totalSalidas: 0,
    totalColaciones: 0,
    diasTrabajados: 0
  }

  const diasUnicos = new Set()

  marcacionesFiltradas.value.forEach(marcacion => {
    switch (marcacion.tipo) {
      case 'entrada':
        stats.totalEntradas++
        break
      case 'salida':
        stats.totalSalidas++
        break
      case 'colacion':
        stats.totalColaciones++
        break
    }

    // Agregar día único
    const fecha = new Date(marcacion.fecha).toISOString().split('T')[0]
    diasUnicos.add(fecha)
  })

  stats.diasTrabajados = diasUnicos.size

  return stats
})

// Métodos
const cargarHistorial = async () => {
  cargando.value = true
  error.value = ''

  try {
    const result = await AsistenciaService.obtenerMarcacionesPorPeriodo()
    console.log('Resultado de obtenerMarcacionesPorPeriodo:', result)
    if (result.success) {
      // El nuevo formato agrupa marcaciones por fecha: { "2025-10-17": [...marcaciones] }
      if (result.data && typeof result.data === 'object') {
        // Extraer todas las marcaciones de todas las fechas y aplanarlas en un solo array
        const todasLasMarcaciones = Object.values(result.data).flat()
        marcaciones.value = todasLasMarcaciones || []
        
        console.log('📋 Historial cargado:', todasLasMarcaciones.length, 'marcaciones')
      } else {
        // Formato antiguo (array directo) - por compatibilidad
        marcaciones.value = result.data || []
      }
    } else {
      error.value = result.error || 'Error al cargar historial'
      console.error('Error cargando historial:', result.error)
    }
  } catch (err) {
    error.value = 'Error inesperado al cargar historial'
    console.error('Error cargando historial:', err)
  } finally {
    cargando.value = false
  }
}

const aplicarFiltros = () => {
  paginaActual.value = 1 // Resetear a la primera página
}

const limpiarFiltros = () => {
  filtros.value.fechaDesde = ''
  filtros.value.fechaHasta = ''
  filtros.value.tipo = ''
  paginaActual.value = 1
}

const paginaAnterior = () => {
  if (paginaActual.value > 1) {
    paginaActual.value--
  }
}

const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) {
    paginaActual.value++
  }
}

const exportarHistorial = () => {
  if (marcacionesFiltradas.value.length === 0) {
    alert('No hay marcaciones para exportar')
    return
  }

  // Crear CSV
  const headers = ['Fecha', 'Hora', 'Tipo', 'Latitud', 'Longitud', 'IP Origen']
  const csvContent = [
    headers.join(','),
    ...marcacionesFiltradas.value.map(m => [
      formatearFecha(m.fecha),
      formatearHora(m.hora),
      getTipoLabel(m.tipo),
      m.geo_lat || '',
      m.geo_lon || '',
      m.ip_origen || ''
    ].join(','))
  ].join('\n')

  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `historial_marcaciones_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Funciones auxiliares
const formatearFecha = (fecha) => {
  // Manejar diferentes formatos de fecha para evitar conversión de zona horaria
  if (typeof fecha === 'string') {
    // Formato ISO con hora (YYYY-MM-DDTHH:mm:ss.sssZ)
    if (fecha.includes('T')) {
      const fechaSolo = fecha.split('T')[0]
      const [anio, mes, dia] = fechaSolo.split('-')
      return `${dia}/${mes}/${anio}`
    }
    
    // Formato ISO simple (YYYY-MM-DD)
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [anio, mes, dia] = fecha.split('-')
      return `${dia}/${mes}/${anio}`
    }
  }
  
  // Fallback: usar objeto Date con métodos UTC para evitar conversión de zona horaria
  const d = new Date(fecha)
  const dia = String(d.getUTCDate()).padStart(2, '0')
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
  const anio = d.getUTCFullYear()
  return `${dia}/${mes}/${anio}`
}

const formatearHora = (hora) => {
  if (typeof hora === 'string' && hora.includes(':')) {
    const [horas, minutos, segundos] = hora.split(':')
    return `${horas}:${minutos}:${segundos || '00'}`
  }
  
  return new Date(hora).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatearFechaCompleta = (fecha) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTipoLabel = (tipo) => {
  const labels = {
    'entrada': 'Entrada',
    'salida': 'Salida',
    'colacion': 'Colación',
    'descanso': 'Descanso'
  }
  return labels[tipo] || tipo
}

const getColorByType = (tipo) => {
  const colors = {
    'entrada': 'bg-green-500',
    'salida': 'bg-red-500',
    'colacion': 'bg-orange-500',
    'descanso': 'bg-blue-500'
  }
  return colors[tipo] || 'bg-gray-500'
}

// Manejador del modal de reporte
const manejarEnvioReporte = async (reporteData) => {
  const result = await enviarReporte(reporteData)
  
  if (result.success) {
    // Mostrar mensaje de éxito (podrías usar una notificación aquí)
    console.log('Reporte enviado exitosamente:', result.message)
    // Opcional: Mostrar una notificación toast o similar
    alert('Reporte enviado correctamente. Será revisado por el equipo de soporte.')
  } else {
    // Mostrar mensaje de error
    console.error('Error enviando reporte:', result.error)
    alert('Error al enviar el reporte: ' + result.error)
  }
}

// Manejador del modal de solicitud de marcación
const manejarSolicitudMarcacion = async (solicitudData) => {
  const result = await solicitarMarcacion(solicitudData)
  
  if (result.success) {
    // Mostrar mensaje de éxito
    console.log('Solicitud de marcación enviada exitosamente:', result.message)
    alert('Solicitud enviada correctamente. Será revisada por el equipo de supervisión.')
    
    // Opcional: Recargar el historial si se quiere mostrar solicitudes pendientes
    // await cargarHistorial()
  } else {
    // Mostrar mensaje de error
    console.error('Error enviando solicitud:', result.error)
    alert('Error al enviar la solicitud: ' + result.error)
  }
}

// Lifecycle
onMounted(async () => {
  await cargarHistorial()
})
</script>