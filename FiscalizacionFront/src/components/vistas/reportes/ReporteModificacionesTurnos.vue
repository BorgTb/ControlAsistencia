<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reporte de Modificaciones de Turnos</h1>
          <p class="mt-2 text-gray-600">Control y seguimiento de cambios en horarios de trabajo</p>
        </div>

        <!-- Encabezado del Reporte con información del empleador -->
        <div class="bg-white shadow rounded-lg mb-6 p-6">
          <div class="border-b pb-4 mb-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Información del Empleador</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Razón Social</label>
                <p class="mt-1 text-sm text-gray-900">{{ empleadorInfo.razonSocial }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">RUT Empleador</label>
                <p class="mt-1 text-sm text-gray-900">{{ empleadorInfo.rut }}</p>
              </div>
            </div>
          </div>

          <!-- Filtros -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label for="trabajador" class="block text-sm font-medium text-gray-700">Trabajador</label>
                <input 
                  type="text" 
                  id="trabajador"
                  v-model="filters.trabajador"
                  placeholder="Nombre o RUT"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label for="lugar" class="block text-sm font-medium text-gray-700">Lugar de Prestación</label>
                <input 
                  type="text" 
                  id="lugar"
                  v-model="filters.lugar"
                  placeholder="Lugar de trabajo"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Modificaciones</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Por Empleador</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.porEmpleador }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Por Trabajador</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.porTrabajador }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center mb-6">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Registro de Modificaciones de Turnos</h3>
                <p class="mt-2 text-sm text-gray-700">Historial completo de cambios en turnos de trabajo</p>
              </div>
              <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button 
                  @click="exportData"
                  class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Exportar Excel
                </button>
              </div>
            </div>
            
            <div class="mt-8 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Trabajador</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">CI / Lugar</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Fecha Asignación Turno</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Turno Asignado</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Extensión Turno</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Fecha Asignación Nuevo Turno</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Inicio Turno</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Nuevo Turno</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Extensión Nuevo</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Solicitante</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase">Observaciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="modificacion in filteredData" :key="modificacion.id" class="hover:bg-gray-50">
                    <!-- d.1) Trabajador: Nombre completo y cédula -->
                    <td class="px-3 py-4 text-sm">
                      <div class="font-medium text-gray-900">{{ modificacion.nombreCompleto }}</div>
                    </td>
                    
                    <!-- d.1) CI y Lugar de prestación -->
                    <td class="px-3 py-4 text-sm">
                      <div class="text-gray-900">{{ formatearRut(modificacion.ci) }}</div>
                      <div class="text-xs text-gray-500">{{ modificacion.lugarPrestacion }}</div>
                    </td>
                    
                    <!-- d.2) Fecha asignación turno original -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearFecha(modificacion.fechaAsignacionOriginal) }}
                    </td>
                    
                    <!-- d.3) Turno asignado original -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                      <div class="text-gray-900">{{ modificacion.turnoOriginal.horario }}</div>
                    </td>
                    
                    <!-- d.4) Extensión del turno original -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ modificacion.turnoOriginal.extension }}
                    </td>
                    
                    <!-- d.5) Fecha asignación nuevo turno -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearFecha(modificacion.fechaAsignacionNuevo) }}
                    </td>
                    
                    <!-- d.6) Inicio del nuevo turno -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearFecha(modificacion.fechaInicioNuevo) }}
                    </td>
                    
                    <!-- d.7) Nuevo turno asignado -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                      <div class="text-gray-900">{{ modificacion.turnoNuevo.horario }}</div>
                    </td>
                    
                    <!-- d.8) Extensión del nuevo turno -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ modificacion.turnoNuevo.extension }}
                    </td>
                    
                    <!-- d.9) Quién solicitó el cambio -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                      <span :class="getSolicitanteClass(modificacion.solicitante)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ modificacion.solicitante }}
                      </span>
                    </td>
                    
                    <!-- d.10) Observaciones -->
                    <td class="px-3 py-4 text-sm text-gray-900 max-w-xs">
                      <div class="truncate" :title="modificacion.observaciones">
                        {{ modificacion.observaciones || 'Sin observaciones' }}
                      </div>
                    </td>
                  </tr>
                  
                  <tr v-if="filteredData.length === 0">
                    <td colspan="11" class="px-3 py-8 text-center text-sm text-gray-500">
                      No se encontraron registros de modificaciones de turnos
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal de Detalle -->
        <div v-if="modalDetalle" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Detalle de Modificación de Turno</h3>
              <div v-if="modificacionSeleccionada" class="space-y-4">
                <!-- Información del Trabajador -->
                <div class="bg-gray-50 p-4 rounded-md">
                  <h4 class="font-semibold text-gray-700 mb-2">Información del Trabajador</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Nombre Completo:</label>
                      <p class="text-sm text-gray-900">{{ modificacionSeleccionada.nombreCompleto }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Cédula:</label>
                      <p class="text-sm text-gray-900">{{ formatearRut(modificacionSeleccionada.ci) }}</p>
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Lugar de Prestación:</label>
                      <p class="text-sm text-gray-900">{{ modificacionSeleccionada.lugarPrestacion }}</p>
                    </div>
                  </div>
                </div>

                <!-- Turno Original -->
                <div class="bg-blue-50 p-4 rounded-md">
                  <h4 class="font-semibold text-gray-700 mb-2">Turno Original</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Fecha Asignación:</label>
                      <p class="text-sm text-gray-900">{{ formatearFecha(modificacionSeleccionada.fechaAsignacionOriginal) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Horario:</label>
                      <p class="text-sm text-gray-900">{{ modificacionSeleccionada.turnoOriginal.horario }}</p>
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Extensión:</label>
                      <p class="text-sm text-gray-900">{{ modificacionSeleccionada.turnoOriginal.extension }}</p>
                    </div>
                  </div>
                </div>

                <!-- Turno Nuevo -->
                <div class="bg-green-50 p-4 rounded-md">
                  <h4 class="font-semibold text-gray-700 mb-2">Turno Nuevo</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Fecha Asignación:</label>
                      <p class="text-sm text-gray-900">{{ formatearFecha(modificacionSeleccionada.fechaAsignacionNuevo) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Inicio Turno:</label>
                      <p class="text-sm text-gray-900">{{ formatearFecha(modificacionSeleccionada.fechaInicioNuevo) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Horario:</label>
                      <p class="text-sm text-gray-900">{{ modificacionSeleccionada.turnoNuevo.horario }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Extensión:</label>
                      <p class="text-sm text-gray-900">{{ modificacionSeleccionada.turnoNuevo.extension }}</p>
                    </div>
                  </div>
                </div>

                <!-- Información Adicional -->
                <div class="border-t pt-3">
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700">Solicitante:</label>
                    <span :class="getSolicitanteClass(modificacionSeleccionada.solicitante)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ modificacionSeleccionada.solicitante }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Observaciones:</label>
                    <p class="text-sm text-gray-900">{{ modificacionSeleccionada.observaciones || 'Sin observaciones' }}</p>
                  </div>
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

const empleadorInfo = ref({
  razonSocial: '',
  rut: ''
})

const filters = ref({
  fechaInicio: thirtyDaysAgo.toISOString().split('T')[0],
  fechaFin: today.toISOString().split('T')[0],
  trabajador: '',
  lugar: ''
})

const modificaciones = ref([])
const modalDetalle = ref(false)
const modificacionSeleccionada = ref(null)

const stats = computed(() => {
  return {
    total: filteredData.value.length,
    porEmpleador: filteredData.value.filter(m => m.solicitante === 'Empleador').length,
    porTrabajador: filteredData.value.filter(m => m.solicitante === 'Trabajador').length
  }
})

const filteredData = computed(() => {
  let data = modificaciones.value

  if (filters.value.trabajador) {
    data = data.filter(m => 
      m.nombreCompleto.toLowerCase().includes(filters.value.trabajador.toLowerCase())
    )
  }

  if (filters.value.lugar) {
    data = data.filter(m => 
      m.lugarPrestacion.toLowerCase().includes(filters.value.lugar.toLowerCase())
    )
  }

  if (filters.value.fechaInicio && filters.value.fechaFin) {
    data = data.filter(m => {
      const fecha = new Date(m.fechaAsignacionNuevo)
      return fecha >= new Date(filters.value.fechaInicio) && fecha <= new Date(filters.value.fechaFin)
    })
  }

  return data.sort((a, b) => new Date(b.fechaAsignacionNuevo) - new Date(a.fechaAsignacionNuevo))
})

// Formatear fecha a formato dd/mm/aa
const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const anio = String(date.getFullYear()).slice(-2)
  return `${dia}/${mes}/${anio}`
}

// Formatear RUT chileno
const formatearRut = (rut) => {
  if (!rut) return '-'
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '')
  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}

// Obtener clase CSS según el solicitante
const getSolicitanteClass = (solicitante) => {
  const classes = {
    'Empleador': 'bg-blue-100 text-blue-800',
    'Trabajador': 'bg-green-100 text-green-800'
  }
  return classes[solicitante] || 'bg-gray-100 text-gray-800'
}

const loadData = async () => {
  // Simular información del empleador
  empleadorInfo.value = {
    razonSocial: 'TELEMEDIOS S.A.',
    rut: '76.123.456-7'
  }
  
  // Simular datos de modificaciones según requisitos regulatorios
  modificaciones.value = [
    {
      id: 1,
      nombreCompleto: 'Juan Carlos Pérez González',
      ci: '12345678-9',
      lugarPrestacion: 'Sucursal Santiago Centro',
      fechaAsignacionOriginal: '2024-01-05',
      turnoOriginal: {
        horario: '08:00 - 17:00',
        extension: 'Diario'
      },
      fechaAsignacionNuevo: '2024-01-15',
      fechaInicioNuevo: '2024-01-20',
      turnoNuevo: {
        horario: '14:00 - 23:00',
        extension: 'Semanal'
      },
      solicitante: 'Trabajador',
      observaciones: 'Solicita cambio de turno por motivos de estudios'
    },
    {
      id: 2,
      nombreCompleto: 'María Fernanda López Silva',
      ci: '23456789-0',
      lugarPrestacion: 'Sucursal Providencia',
      fechaAsignacionOriginal: '2024-01-03',
      turnoOriginal: {
        horario: '14:00 - 23:00',
        extension: 'Semanal'
      },
      fechaAsignacionNuevo: '2024-01-10',
      fechaInicioNuevo: '2024-01-12',
      turnoNuevo: {
        horario: '08:00 - 17:00',
        extension: 'Diario'
      },
      solicitante: 'Empleador',
      observaciones: 'Cambio por necesidad de servicio'
    },
    {
      id: 3,
      nombreCompleto: 'Carlos Andrés Ramírez Torres',
      ci: '34567890-1',
      lugarPrestacion: 'Sucursal Las Condes',
      fechaAsignacionOriginal: '2024-01-01',
      turnoOriginal: {
        horario: '22:00 - 06:00',
        extension: 'Bisemanal'
      },
      fechaAsignacionNuevo: '2024-01-08',
      fechaInicioNuevo: '2024-01-10',
      turnoNuevo: {
        horario: '06:00 - 14:00',
        extension: 'Mensual'
      },
      solicitante: 'Trabajador',
      observaciones: 'Solicita turno diurno por problemas de salud'
    },
    {
      id: 4,
      nombreCompleto: 'Ana Patricia Morales Vega',
      ci: '45678901-2',
      lugarPrestacion: 'Sucursal Maipú',
      fechaAsignacionOriginal: '2023-12-20',
      turnoOriginal: {
        horario: '06:00 - 14:00',
        extension: 'Mensual'
      },
      fechaAsignacionNuevo: '2024-01-12',
      fechaInicioNuevo: '2024-01-15',
      turnoNuevo: {
        horario: '08:00 - 17:00',
        extension: 'Diario'
      },
      solicitante: 'Empleador',
      observaciones: 'Ajuste por reestructuración de equipos'
    }
  ]
}

const applyFilters = () => {
  console.log('Filtros aplicados:', filters.value)
}

const clearFilters = () => {
  filters.value = {
    fechaInicio: thirtyDaysAgo.toISOString().split('T')[0],
    fechaFin: today.toISOString().split('T')[0],
    trabajador: '',
    lugar: ''
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

const exportData = () => {
  // TODO: Implementar exportación a Excel
  alert('Función de exportación en desarrollo')
}

onMounted(() => {
  loadData()
})
</script>
