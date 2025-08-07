<template>
  <div class="min-h-screen bg-gray-50">
    
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Incidentes Técnicos</h1>
          <p class="mt-2 text-gray-600">Registro y seguimiento de problemas técnicos del sistema</p>
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
                <label for="severidad" class="block text-sm font-medium text-gray-700">Severidad</label>
                <select 
                  id="severidad"
                  v-model="filters.severidad"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="CRITICA">Crítica</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Media</option>
                  <option value="BAJA">Baja</option>
                </select>
              </div>
              <div>
                <label for="estado" class="block text-sm font-medium text-gray-700">Estado</label>
                <select 
                  id="estado"
                  v-model="filters.estado"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="ABIERTO">Abierto</option>
                  <option value="EN_PROGRESO">En Progreso</option>
                  <option value="RESUELTO">Resuelto</option>
                  <option value="CERRADO">Cerrado</option>
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
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-red-100 rounded-lg">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Críticos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.criticos }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Abiertos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.abiertos }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">En Progreso</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.enProgreso }}</p>
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
                <p class="text-sm font-medium text-gray-600">Resueltos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.resueltos }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Estado del Sistema</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Servidor Principal</h4>
                    <p class="text-sm text-green-600">Operativo</p>
                  </div>
                  <div class="h-3 w-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Base de Datos</h4>
                    <p class="text-sm text-green-600">Operativo</p>
                  </div>
                  <div class="h-3 w-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Red</h4>
                    <p class="text-sm text-yellow-600">Lenta</p>
                  </div>
                  <div class="h-3 w-3 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Registro de Incidentes</h3>
                <p class="mt-2 text-sm text-gray-700">Historial detallado de problemas técnicos reportados</p>
              </div>
              <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
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
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha/Hora</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Severidad</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tiempo Resolución</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="incidente in filteredData" :key="incidente.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{{ incidente.id }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{{ formatearFecha(incidente.fechaReporte) }}</div>
                      <div class="text-xs text-gray-500">{{ incidente.horaReporte }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ incidente.tipo }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 max-w-48 truncate">{{ incidente.descripcion }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getSeveridadClass(incidente.severidad)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ incidente.severidad }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getEstadoClass(incidente.estado)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ incidente.estado.replace('_', ' ') }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ incidente.tiempoResolucion || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button 
                          @click="verDetalle(incidente)"
                          class="text-blue-600 hover:text-blue-900"
                        >
                          Ver Detalle
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
              <h3 class="text-lg font-medium text-gray-900 mb-4">Detalle del Incidente #{{ incidenteSeleccionado?.id }}</h3>
              <div v-if="incidenteSeleccionado" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo:</label>
                  <p class="text-sm text-gray-900">{{ incidenteSeleccionado.tipo }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Descripción:</label>
                  <p class="text-sm text-gray-900">{{ incidenteSeleccionado.descripcion }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Componente Afectado:</label>
                  <p class="text-sm text-gray-900">{{ incidenteSeleccionado.componenteAfectado }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Usuarios Afectados:</label>
                  <p class="text-sm text-gray-900">{{ incidenteSeleccionado.usuariosAfectados }}</p>
                </div>
                <div v-if="incidenteSeleccionado.solucion">
                  <label class="block text-sm font-medium text-gray-700">Solución:</label>
                  <p class="text-sm text-gray-900">{{ incidenteSeleccionado.solucion }}</p>
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
const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

const filters = ref({
  fechaInicio: sevenDaysAgo.toISOString().split('T')[0],
  fechaFin: today.toISOString().split('T')[0],
  severidad: '',
  estado: ''
})

const incidentes = ref([])
const modalDetalle = ref(false)
const incidenteSeleccionado = ref(null)

const stats = computed(() => {
  const data = filteredData.value
  return {
    total: data.length,
    criticos: data.filter(i => i.severidad === 'CRITICA').length,
    abiertos: data.filter(i => i.estado === 'ABIERTO').length,
    enProgreso: data.filter(i => i.estado === 'EN_PROGRESO').length,
    resueltos: data.filter(i => i.estado === 'RESUELTO').length
  }
})

const filteredData = computed(() => {
  let data = incidentes.value
  
  if (filters.value.severidad) {
    data = data.filter(i => i.severidad === filters.value.severidad)
  }
  
  if (filters.value.estado) {
    data = data.filter(i => i.estado === filters.value.estado)
  }
  
  return data.sort((a, b) => new Date(b.fechaReporte) - new Date(a.fechaReporte))
})

const getSeveridadClass = (severidad) => {
  switch (severidad) {
    case 'CRITICA':
      return 'bg-red-100 text-red-800'
    case 'ALTA':
      return 'bg-orange-100 text-orange-800'
    case 'MEDIA':
      return 'bg-yellow-100 text-yellow-800'
    case 'BAJA':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'ABIERTO':
      return 'bg-red-100 text-red-800'
    case 'EN_PROGRESO':
      return 'bg-blue-100 text-blue-800'
    case 'RESUELTO':
      return 'bg-green-100 text-green-800'
    case 'CERRADO':
      return 'bg-gray-100 text-gray-800'
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
  incidentes.value = [
    {
      id: 1001,
      fechaReporte: '2024-01-15',
      horaReporte: '14:30',
      tipo: 'Sistema de Marcación',
      descripcion: 'Terminal de marcación no responde en entrada principal',
      severidad: 'ALTA',
      estado: 'ABIERTO',
      componenteAfectado: 'Terminal 01',
      usuariosAfectados: '50+ empleados',
      tiempoResolucion: null,
      solucion: null
    },
    {
      id: 1002,
      fechaReporte: '2024-01-14',
      horaReporte: '09:15',
      tipo: 'Base de Datos',
      descripción: 'Lentitud en consultas de reportes de asistencia',
      severidad: 'MEDIA',
      estado: 'EN_PROGRESO',
      componenteAfectado: 'Servidor BD',
      usuariosAfectados: 'Supervisores',
      tiempoResolucion: null,
      solucion: 'Optimización de índices en progreso'
    },
    {
      id: 1003,
      fechaReporte: '2024-01-13',
      horaReporte: '16:45',
      tipo: 'Red',
      descripcion: 'Intermitencia en conexión de red en planta 2',
      severidad: 'BAJA',
      estado: 'RESUELTO',
      componenteAfectado: 'Switch Planta 2',
      usuariosAfectados: '20 empleados',
      tiempoResolucion: '2 horas',
      solucion: 'Reemplazo de cable de red defectuoso'
    },
    {
      id: 1004,
      fechaReporte: '2024-01-12',
      horaReporte: '11:20',
      tipo: 'Aplicación Web',
      descripcion: 'Error 500 al generar reporte de horas extras',
      severidad: 'MEDIA',
      estado: 'CERRADO',
      componenteAfectado: 'Módulo Reportes',
      usuariosAfectados: 'RRHH',
      tiempoResolucion: '4 horas',
      solucion: 'Corrección de bug en cálculo de horas extras'
    }
  ]
}

const verDetalle = (incidente) => {
  incidenteSeleccionado.value = incidente
  modalDetalle.value = true
}

const cerrarModal = () => {
  modalDetalle.value = false
  incidenteSeleccionado.value = null
}

const applyFilters = () => {
  console.log('Filtros aplicados:', filters.value)
}

const clearFilters = () => {
  filters.value = {
    fechaInicio: sevenDaysAgo.toISOString().split('T')[0],
    fechaFin: today.toISOString().split('T')[0],
    severidad: '',
    estado: ''
  }
}

const exportData = () => {
  alert('Función de exportación en desarrollo')
}

onMounted(() => {
  loadData()
})
</script>
