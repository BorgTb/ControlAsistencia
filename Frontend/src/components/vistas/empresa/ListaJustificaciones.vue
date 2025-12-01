<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestión de Justificaciones</h1>
            <p class="text-gray-600 mt-2">Revisa y aprueba las solicitudes de justificación de ausencias</p>
          </div>
          <div class="flex space-x-3">
            <button @click="emit('cerrar')" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors duration-200">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Cerrar
            </button>
            <button @click="actualizarLista" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pendientes</p>
              <p class="text-2xl font-bold text-gray-900">{{ estadisticas.pendientes }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Aprobadas Hoy</p>
              <p class="text-2xl font-bold text-gray-900">{{ estadisticas.aprobadasHoy }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Rechazadas Hoy</p>
              <p class="text-2xl font-bold text-gray-900">{{ estadisticas.rechazadasHoy }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ justificaciones.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
              v-model="filtros.estado" 
              @change="aplicarFiltros"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADA">Aprobadas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select 
              v-model="filtros.tipo" 
              @change="aplicarFiltros"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos los tipos</option>
              <option value="MEDICA">Médica</option>
              <option value="PERSONAL">Personal</option>
              <option value="FAMILIAR">Familiar</option>
              <option value="EDUCATIVA">Educativa</option>
              <option value="OTRA">Otra</option>
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

      <!-- Lista de justificaciones -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">
            Justificaciones 
            <span class="text-sm text-gray-500">({{ justificacionesFiltradas.length }} registros)</span>
          </h3>
          <div class="text-sm text-gray-500">
            <span v-if="cargando">Cargando...</span>
            <span v-else>Última actualización: {{ formatearFechaCompleta(new Date()) }}</span>
          </div>
        </div>
        
        <div v-if="cargando" class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else-if="justificacionesFiltradas.length === 0" class="text-center py-12">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay justificaciones</h3>
          <p class="text-gray-500">No se encontraron justificaciones con los filtros aplicados.</p>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li v-for="justificacion in justificacionesFiltradas" :key="justificacion.id" class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ justificacion.usuario_nombre }}</p>
                      <p class="text-sm text-gray-500">{{ justificacion.usuario_rut }} - {{ justificacion.empresa_nombre }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="getEstadoColor(justificacion.estado)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                      {{ formatearEstado(justificacion.estado) }}
                    </span>
                    <span :class="getTipoColor(justificacion.tipo_justificacion)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                      {{ formatearTipo(justificacion.tipo_justificacion) }}
                    </span>
                  </div>
                </div>
                
                <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span class="font-medium">Período:</span>
                    <span class="ml-1">{{ formatearFecha(justificacion.fecha_inicio) }} - {{ formatearFecha(justificacion.fecha_fin) }}</span>
                    <span class="text-blue-600 font-medium ml-1">({{ justificacion.dias_totales }} días)</span>
                  </div>
                  <div>
                    <span class="font-medium">Solicitado:</span>
                    <span class="ml-1">{{ formatearFechaCompleta(justificacion.fecha_solicitud) }}</span>
                  </div>
                  <div v-if="justificacion.archivo_url">
                    <span class="font-medium">Archivo:</span>
                    <a :href="justificacion.archivo_url" target="_blank" class="text-blue-600 hover:text-blue-800 ml-1">
                      <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                      </svg>
                      Ver archivo
                    </a>
                  </div>
                </div>
                
                <div v-if="justificacion.motivo" class="mt-2">
                  <span class="text-sm font-medium text-gray-600">Motivo:</span>
                  <p class="text-sm text-gray-800 mt-1">{{ justificacion.motivo }}</p>
                </div>

                <div v-if="justificacion.observaciones" class="mt-2">
                  <span class="text-sm font-medium text-gray-600">Observaciones:</span>
                  <p class="text-sm text-gray-800 mt-1">{{ justificacion.observaciones }}</p>
                </div>

                <div v-if="justificacion.aprobado_por_nombre" class="mt-2">
                  <span class="text-sm font-medium text-gray-600">
                    {{ justificacion.estado === 'APROBADA' ? 'Aprobado por:' : 'Rechazado por:' }}
                  </span>
                  <span class="text-sm text-gray-800 ml-1">{{ justificacion.aprobado_por_nombre }}</span>
                  <span class="text-sm text-gray-500 ml-1">el {{ formatearFechaCompleta(justificacion.fecha_aprobacion) }}</span>
                </div>
              </div>
              
              <!-- Botones de acción -->
              <div v-if="justificacion.estado === 'PENDIENTE'" class="flex space-x-2 ml-4">
                <button 
                  @click="abrirModalAprobacion(justificacion, 'APROBADA')" 
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Aprobar
                </button>
                <button 
                  @click="abrirModalAprobacion(justificacion, 'RECHAZADA')" 
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Rechazar
                </button>
              </div>

              <div v-else class="ml-4">
                <span class="text-sm text-gray-500">{{ justificacion.estado === 'APROBADA' ? 'Aprobada' : 'Rechazada' }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal de aprobación/rechazo -->
    <ModalAprobacionJustificacion
      v-if="mostrarModal"
      :justificacion="justificacionSeleccionada"
      :accion="accionSeleccionada"
      @confirmar="confirmarAccion"
      @cancelar="cerrarModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue'
import JustificacionesService from '@/services/JustificacionesService.js'
import ModalAprobacionJustificacion from '@/components/modals/ModalAprobacionJustificacion.vue'

// Definir emits
const emit = defineEmits(['cerrar'])

// Estados reactivos
const justificaciones = ref([])
const cargando = ref(false)
const error = ref('')

// Modal
const mostrarModal = ref(false)
const justificacionSeleccionada = ref(null)
const accionSeleccionada = ref('')

// Filtros
const filtros = ref({
  estado: '',
  tipo: ''
})

// Computed properties
const justificacionesFiltradas = computed(() => {
  let resultado = [...justificaciones.value]

  if (filtros.value.estado) {
    resultado = resultado.filter(j => j.estado === filtros.value.estado)
  }

  if (filtros.value.tipo) {
    resultado = resultado.filter(j => j.tipo_justificacion === filtros.value.tipo)
  }

  // Ordenar por fecha de solicitud más reciente primero
  return resultado.sort((a, b) => {
    return new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud)
  })
})

const estadisticas = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  
  return {
    pendientes: justificaciones.value.filter(j => j.estado === 'PENDIENTE').length,
    aprobadasHoy: justificaciones.value.filter(j => 
      j.estado === 'APROBADA' && 
      j.fecha_aprobacion && 
      j.fecha_aprobacion.split('T')[0] === hoy
    ).length,
    rechazadasHoy: justificaciones.value.filter(j => 
      j.estado === 'RECHAZADA' && 
      j.fecha_aprobacion && 
      j.fecha_aprobacion.split('T')[0] === hoy
    ).length
  }
})

// Métodos
const cargarJustificaciones = async () => {
  cargando.value = true
  error.value = ''

  try {
    // Obtener todas las justificaciones (pendientes, aprobadas y rechazadas)
    const response = await JustificacionesService.obtenerJustificacionesPendientes(1000, true)
    justificaciones.value = response.data || []
  } catch (err) {
    error.value = 'Error al cargar justificaciones'
    console.error('Error cargando justificaciones:', err)
    justificaciones.value = []
  } finally {
    cargando.value = false
  }
}

const actualizarLista = () => {
  cargarJustificaciones()
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente por el computed
}

const limpiarFiltros = () => {
  filtros.value.estado = ''
  filtros.value.tipo = ''
}

const abrirModalAprobacion = (justificacion, accion) => {
  justificacionSeleccionada.value = justificacion
  accionSeleccionada.value = accion
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  justificacionSeleccionada.value = null
  accionSeleccionada.value = ''
}

const confirmarAccion = async (observaciones) => {
  try {
    await JustificacionesService.actualizarEstado(
      justificacionSeleccionada.value.id,
      accionSeleccionada.value,
      observaciones
    )

    // Actualizar la justificación en la lista
    const index = justificaciones.value.findIndex(j => j.id === justificacionSeleccionada.value.id)
    if (index !== -1) {
      justificaciones.value[index].estado = accionSeleccionada.value
      justificaciones.value[index].observaciones = observaciones
      justificaciones.value[index].fecha_aprobacion = new Date().toISOString()
    }

    cerrarModal()
    
    // Mostrar mensaje de éxito
    console.log(`Justificación ${accionSeleccionada.value.toLowerCase()} correctamente`)
  } catch (err) {
    console.error('Error al actualizar justificación:', err)
    error.value = 'Error al actualizar la justificación'
  }
}

// Funciones auxiliares
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
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

const formatearEstado = (estado) => {
  const estados = {
    'PENDIENTE': 'Pendiente',
    'APROBADA': 'Aprobada',
    'RECHAZADA': 'Rechazada'
  }
  return estados[estado] || estado
}

const formatearTipo = (tipo) => {
  const tipos = {
    'MEDICA': 'Médica',
    'PERSONAL': 'Personal',
    'FAMILIAR': 'Familiar',
    'EDUCATIVA': 'Educativa',
    'OTRA': 'Otra'
  }
  return tipos[tipo] || tipo
}

const getEstadoColor = (estado) => {
  const colores = {
    'PENDIENTE': 'bg-yellow-100 text-yellow-800',
    'APROBADA': 'bg-green-100 text-green-800',
    'RECHAZADA': 'bg-red-100 text-red-800'
  }
  return colores[estado] || 'bg-gray-100 text-gray-800'
}

const getTipoColor = (tipo) => {
  const colores = {
    'MEDICA': 'bg-blue-100 text-blue-800',
    'PERSONAL': 'bg-purple-100 text-purple-800',
    'FAMILIAR': 'bg-pink-100 text-pink-800',
    'EDUCATIVA': 'bg-indigo-100 text-indigo-800',
    'OTRA': 'bg-gray-100 text-gray-800'
  }
  return colores[tipo] || 'bg-gray-100 text-gray-800'
}

// Lifecycle
onMounted(() => {
  cargarJustificaciones()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>