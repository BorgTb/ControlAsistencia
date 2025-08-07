<template>
  <div class="min-h-screen bg-gray-50">


    <!-- Main Content -->
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Modificaciones de Turnos</h1>
          <p class="mt-2 text-gray-600">Control y seguimiento de cambios en horarios de trabajo</p>
        </div>

        <!-- Filters -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Filtros</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label for="fechaInicio" class="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                <input 
                  type="date" 
                  id="fechaInicio"
                  v-model="filters.fechaInicio"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label for="fechaFin" class="block text-sm font-medium text-gray-700">Fecha Fin</label>
                <input 
                  type="date" 
                  id="fechaFin"
                  v-model="filters.fechaFin"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label for="estado" class="block text-sm font-medium text-gray-700">Estado</label>
                <select 
                  id="estado"
                  v-model="filters.estado"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="APROBADA">Aprobada</option>
                  <option value="RECHAZADA">Rechazada</option>
                  <option value="APLICADA">Aplicada</option>
                </select>
              </div>
              <div>
                <label for="departamento" class="block text-sm font-medium text-gray-700">Departamento</label>
                <select 
                  id="departamento"
                  v-model="filters.departamento"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="RRHH">Recursos Humanos</option>
                  <option value="IT">Tecnología</option>
                  <option value="VENTAS">Ventas</option>
                  <option value="MARKETING">Marketing</option>
                </select>
              </div>
            </div>
            <div class="mt-4 flex justify-end space-x-3">
              <button 
                @click="clearFilters"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Limpiar
              </button>
              <button 
                @click="applyFilters"
                class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Pendientes</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.pendientes }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Aprobadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.aprobadas }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-red-100 rounded-lg">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Rechazadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.rechazadas }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Aplicadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.aplicadas }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Solicitudes de Modificación</h3>
                <p class="mt-2 text-sm text-gray-700">Historial de cambios solicitados en turnos de trabajo</p>
              </div>
              <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button 
                  @click="exportData"
                  class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Exportar Excel
                </button>
              </div>
            </div>
            <div class="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Solicitud</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Empleado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Cambio</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Turno Original</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Turno Solicitado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Motivo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="modificacion in filteredData" :key="modificacion.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearFecha(modificacion.fechaSolicitud) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">{{ modificacion.iniciales }}</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ modificacion.nombre }}</div>
                          <div class="text-sm text-gray-500">{{ modificacion.departamento }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearFecha(modificacion.fechaCambio) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ modificacion.turnoOriginal.nombre }}</div>
                      <div class="text-sm text-gray-500">{{ modificacion.turnoOriginal.horario }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ modificacion.turnoSolicitado.nombre }}</div>
                      <div class="text-sm text-gray-500">{{ modificacion.turnoSolicitado.horario }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                      {{ modificacion.motivo }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getEstadoClass(modificacion.estado)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ modificacion.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button 
                          v-if="modificacion.estado === 'PENDIENTE'"
                          @click="aprobarModificacion(modificacion.id)"
                          class="text-green-600 hover:text-green-900"
                        >
                          Aprobar
                        </button>
                        <button 
                          v-if="modificacion.estado === 'PENDIENTE'"
                          @click="rechazarModificacion(modificacion.id)"
                          class="text-red-600 hover:text-red-900"
                        >
                          Rechazar
                        </button>
                        <button 
                          @click="verDetalle(modificacion)"
                          class="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal de Detalle -->
        <div v-if="modalDetalle" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Detalle de Modificación</h3>
              <div v-if="modificacionSeleccionada" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Empleado:</label>
                  <p class="text-sm text-gray-900">{{ modificacionSeleccionada.nombre }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Motivo:</label>
                  <p class="text-sm text-gray-900">{{ modificacionSeleccionada.motivo }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Justificación:</label>
                  <p class="text-sm text-gray-900">{{ modificacionSeleccionada.justificacion }}</p>
                </div>
                <div v-if="modificacionSeleccionada.comentarioSupervisor">
                  <label class="block text-sm font-medium text-gray-700">Comentario del Supervisor:</label>
                  <p class="text-sm text-gray-900">{{ modificacionSeleccionada.comentarioSupervisor }}</p>
                </div>
              </div>
              <div class="mt-6 flex justify-end space-x-3">
                <button 
                  @click="cerrarModal"
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from '../../component/header.vue'

const today = new Date()
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

const filters = ref({
  fechaInicio: thirtyDaysAgo.toISOString().split('T')[0],
  fechaFin: today.toISOString().split('T')[0],
  estado: '',
  departamento: ''
})

const modificaciones = ref([])
const modalDetalle = ref(false)
const modificacionSeleccionada = ref(null)

const stats = computed(() => {
  const data = filteredData.value
  return {
    pendientes: data.filter(m => m.estado === 'PENDIENTE').length,
    aprobadas: data.filter(m => m.estado === 'APROBADA').length,
    rechazadas: data.filter(m => m.estado === 'RECHAZADA').length,
    aplicadas: data.filter(m => m.estado === 'APLICADA').length
  }
})

const filteredData = computed(() => {
  let data = modificaciones.value
  
  if (filters.value.estado) {
    data = data.filter(m => m.estado === filters.value.estado)
  }
  
  if (filters.value.departamento) {
    data = data.filter(m => m.departamento === filters.value.departamento)
  }
  
  return data.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
})

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-yellow-100 text-yellow-800'
    case 'APROBADA':
      return 'bg-green-100 text-green-800'
    case 'RECHAZADA':
      return 'bg-red-100 text-red-800'
    case 'APLICADA':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const loadData = async () => {
  // Simular datos para desarrollo
  modificaciones.value = [
    {
      id: 1,
      fechaSolicitud: '2024-01-15',
      nombre: 'Juan Pérez',
      iniciales: 'JP',
      departamento: 'IT',
      fechaCambio: '2024-01-20',
      turnoOriginal: {
        nombre: 'Turno Mañana',
        horario: '08:00 - 17:00'
      },
      turnoSolicitado: {
        nombre: 'Turno Tarde',
        horario: '14:00 - 23:00'
      },
      motivo: 'Cita médica familiar',
      justificacion: 'Necesito llevar a mi hijo al médico en la mañana',
      estado: 'PENDIENTE',
      comentarioSupervisor: null
    },
    {
      id: 2,
      fechaSolicitud: '2024-01-10',
      nombre: 'María González',
      iniciales: 'MG',
      departamento: 'RRHH',
      fechaCambio: '2024-01-12',
      turnoOriginal: {
        nombre: 'Turno Tarde',
        horario: '14:00 - 23:00'
      },
      turnoSolicitado: {
        nombre: 'Turno Mañana',
        horario: '08:00 - 17:00'
      },
      motivo: 'Estudios universitarios',
      justificacion: 'Tengo clases en la tarde que no puedo perder',
      estado: 'APROBADA',
      comentarioSupervisor: 'Aprobado por razones académicas'
    },
    {
      id: 3,
      fechaSolicitud: '2024-01-08',
      nombre: 'Carlos López',
      iniciales: 'CL',
      departamento: 'VENTAS',
      fechaCambio: '2024-01-10',
      turnoOriginal: {
        nombre: 'Turno Noche',
        horario: '22:00 - 06:00'
      },
      turnoSolicitado: {
        nombre: 'Turno Mañana',
        horario: '08:00 - 17:00'
      },
      motivo: 'Problemas de transporte',
      justificacion: 'No hay transporte público en la madrugada',
      estado: 'RECHAZADA',
      comentarioSupervisor: 'No hay disponibilidad en turno mañana'
    }
  ]
}

const aprobarModificacion = async (id) => {
  const modificacion = modificaciones.value.find(m => m.id === id)
  if (modificacion) {
    modificacion.estado = 'APROBADA'
    modificacion.comentarioSupervisor = 'Aprobado por fiscalizador'
    alert('Modificación aprobada exitosamente')
  }
}

const rechazarModificacion = async (id) => {
  const motivo = prompt('Ingrese el motivo del rechazo:')
  if (motivo) {
    const modificacion = modificaciones.value.find(m => m.id === id)
    if (modificacion) {
      modificacion.estado = 'RECHAZADA'
      modificacion.comentarioSupervisor = motivo
      alert('Modificación rechazada')
    }
  }
}

const verDetalle = (modificacion) => {
  modificacionSeleccionada.value = modificacion
  modalDetalle.value = true
}

const cerrarModal = () => {
  modalDetalle.value = false
  modificacionSeleccionada.value = null
}

const applyFilters = () => {
  console.log('Filtros aplicados:', filters.value)
}

const clearFilters = () => {
  filters.value = {
    fechaInicio: thirtyDaysAgo.toISOString().split('T')[0],
    fechaFin: today.toISOString().split('T')[0],
    estado: '',
    departamento: ''
  }
}

const exportData = () => {
  alert('Función de exportación en desarrollo')
}

onMounted(() => {
  loadData()
})
</script>
