<template>
  <div class="min-h-screen bg-gray-50">
    
    
    <!-- Main Content -->
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Marcaciones Diarias</h1>
          <p class="mt-2 text-gray-600">Registro detallado de entradas y salidas del personal</p>
        </div>

        <!-- Filters -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Filtros</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha</label>
                <input 
                  type="date" 
                  id="fecha"
                  v-model="filters.fecha"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label for="empleado" class="block text-sm font-medium text-gray-700">Empleado</label>
                <input 
                  type="text" 
                  id="empleado"
                  v-model="filters.empleado"
                  placeholder="Buscar por nombre o cédula"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
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
              <div>
                <label for="tipoMarcacion" class="block text-sm font-medium text-gray-700">Tipo Marcación</label>
                <select 
                  id="tipoMarcacion"
                  v-model="filters.tipoMarcacion"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="SALIDA">Salida</option>
                  <option value="DESCANSO_INICIO">Inicio Descanso</option>
                  <option value="DESCANSO_FIN">Fin Descanso</option>
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
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Entradas</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalEntradas }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-red-100 rounded-lg">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Salidas</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalSalidas }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Marcaciones Irregulares</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.irregulares }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Empleados Únicos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.empleadosUnicos }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline View -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Línea de Tiempo - Marcaciones del Día</h3>
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div class="space-y-4">
                <div v-for="hora in timelineHoras" :key="hora.hora" class="relative flex items-center">
                  <div class="absolute left-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-blue-600">{{ hora.hora }}</span>
                  </div>
                  <div class="ml-12 flex-1">
                    <div class="flex flex-wrap gap-2">
                      <div v-for="marcacion in hora.marcaciones" :key="marcacion.id" 
                           :class="getMarcacionTimelineClass(marcacion.tipo)"
                           class="px-3 py-1 rounded-full text-xs font-medium">
                        {{ marcacion.empleado }} - {{ marcacion.tipo }}
                      </div>
                    </div>
                  </div>
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
                <h3 class="text-lg font-medium text-gray-900">Registro de Marcaciones</h3>
                <p class="mt-2 text-sm text-gray-700">Detalle completo de todas las marcaciones registradas</p>
              </div>
              <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
                <button 
                  @click="refreshData"
                  class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Actualizar
                </button>
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
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Hora</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Empleado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Dispositivo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Ubicación</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Observaciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="marcacion in filteredData" :key="marcacion.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ marcacion.hora }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">{{ marcacion.iniciales }}</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ marcacion.nombre }}</div>
                          <div class="text-sm text-gray-500">{{ marcacion.cedula }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getTipoMarcacionClass(marcacion.tipo)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ marcacion.tipo.replace('_', ' ') }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ marcacion.dispositivo }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ marcacion.ubicacion }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getEstadoClass(marcacion.estado)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ marcacion.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {{ marcacion.observaciones || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
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

const filters = ref({
  fecha: new Date().toISOString().split('T')[0],
  empleado: '',
  departamento: '',
  tipoMarcacion: ''
})

const marcaciones = ref([])

const stats = computed(() => {
  const data = filteredData.value
  return {
    totalEntradas: data.filter(m => m.tipo === 'ENTRADA').length,
    totalSalidas: data.filter(m => m.tipo === 'SALIDA').length,
    irregulares: data.filter(m => m.estado === 'IRREGULAR').length,
    empleadosUnicos: [...new Set(data.map(m => m.empleadoId))].length
  }
})

const filteredData = computed(() => {
  let data = marcaciones.value
  
  if (filters.value.empleado) {
    const searchTerm = filters.value.empleado.toLowerCase()
    data = data.filter(m => 
      m.nombre.toLowerCase().includes(searchTerm) || 
      m.cedula.includes(searchTerm)
    )
  }
  
  if (filters.value.departamento) {
    data = data.filter(m => m.departamento === filters.value.departamento)
  }
  
  if (filters.value.tipoMarcacion) {
    data = data.filter(m => m.tipo === filters.value.tipoMarcacion)
  }
  
  return data.sort((a, b) => a.hora.localeCompare(b.hora))
})

const timelineHoras = computed(() => {
  const horas = {}
  
  filteredData.value.forEach(marcacion => {
    const hora = marcacion.hora.substring(0, 2) + ':00'
    if (!horas[hora]) {
      horas[hora] = { hora, marcaciones: [] }
    }
    horas[hora].marcaciones.push({
      id: marcacion.id,
      empleado: marcacion.nombre.split(' ')[0],
      tipo: marcacion.tipo
    })
  })
  
  return Object.values(horas).sort((a, b) => a.hora.localeCompare(b.hora))
})

const getTipoMarcacionClass = (tipo) => {
  switch (tipo) {
    case 'ENTRADA':
      return 'bg-green-100 text-green-800'
    case 'SALIDA':
      return 'bg-red-100 text-red-800'
    case 'DESCANSO_INICIO':
      return 'bg-yellow-100 text-yellow-800'
    case 'DESCANSO_FIN':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getMarcacionTimelineClass = (tipo) => {
  switch (tipo) {
    case 'ENTRADA':
      return 'bg-green-200 text-green-800'
    case 'SALIDA':
      return 'bg-red-200 text-red-800'
    case 'DESCANSO_INICIO':
      return 'bg-yellow-200 text-yellow-800'
    case 'DESCANSO_FIN':
      return 'bg-blue-200 text-blue-800'
    default:
      return 'bg-gray-200 text-gray-800'
  }
}

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'VALIDA':
      return 'bg-green-100 text-green-800'
    case 'IRREGULAR':
      return 'bg-red-100 text-red-800'
    case 'TARDANZA':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const loadData = async () => {
  // Simular datos para desarrollo
  marcaciones.value = [
    {
      id: 1,
      hora: '08:00',
      empleadoId: 1,
      nombre: 'Juan Pérez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'IT',
      tipo: 'ENTRADA',
      dispositivo: 'Terminal 01',
      ubicacion: 'Entrada Principal',
      estado: 'VALIDA',
      observaciones: null
    },
    {
      id: 2,
      hora: '08:15',
      empleadoId: 2,
      nombre: 'María González',
      cedula: '87654321',
      iniciales: 'MG',
      departamento: 'RRHH',
      tipo: 'ENTRADA',
      dispositivo: 'Terminal 01',
      ubicacion: 'Entrada Principal',
      estado: 'TARDANZA',
      observaciones: 'Llegada tardía'
    },
    {
      id: 3,
      hora: '12:00',
      empleadoId: 1,
      nombre: 'Juan Pérez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'IT',
      tipo: 'DESCANSO_INICIO',
      dispositivo: 'Terminal 02',
      ubicacion: 'Cafetería',
      estado: 'VALIDA',
      observaciones: null
    },
    {
      id: 4,
      hora: '13:00',
      empleadoId: 1,
      nombre: 'Juan Pérez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'IT',
      tipo: 'DESCANSO_FIN',
      dispositivo: 'Terminal 02',
      ubicacion: 'Cafetería',
      estado: 'VALIDA',
      observaciones: null
    },
    {
      id: 5,
      hora: '17:00',
      empleadoId: 1,
      nombre: 'Juan Pérez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'IT',
      tipo: 'SALIDA',
      dispositivo: 'Terminal 01',
      ubicacion: 'Entrada Principal',
      estado: 'VALIDA',
      observaciones: null
    },
    {
      id: 6,
      hora: '17:30',
      empleadoId: 2,
      nombre: 'María González',
      cedula: '87654321',
      iniciales: 'MG',
      departamento: 'RRHH',
      tipo: 'SALIDA',
      dispositivo: 'Terminal 01',
      ubicacion: 'Entrada Principal',
      estado: 'VALIDA',
      observaciones: null
    }
  ]
}

const refreshData = async () => {
  await loadData()
  alert('Datos actualizados')
}

const applyFilters = () => {
  console.log('Filtros aplicados:', filters.value)
}

const clearFilters = () => {
  filters.value = {
    fecha: new Date().toISOString().split('T')[0],
    empleado: '',
    departamento: '',
    tipoMarcacion: ''
  }
}

const exportData = () => {
  alert('Función de exportación en desarrollo')
}

onMounted(() => {
  loadData()
})
</script>
