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
            
            <!-- Indicador de Carga -->
            <div v-if="cargando" class="mt-8 flex justify-center items-center py-12">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-4 text-sm text-gray-600">Cargando modificaciones de turnos...</p>
              </div>
            </div>

            <!-- Tabla de Datos -->
            <div v-else class="mt-8 overflow-x-auto">
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
                  <tr v-for="modificacion in modificaciones" :key="modificacion.id" class="hover:bg-gray-50">
                    <!-- d.1) Trabajador: Nombre completo y cédula -->
                    <td class="px-3 py-4 text-sm">
                      <div class="font-medium text-gray-900">
                        {{ getNombreCompleto(modificacion.trabajador) }}
                      </div>
                      <div class="text-xs text-gray-500">{{ formatearRut(modificacion.trabajador?.rut) }}</div>
                    </td>
                    
                    <!-- d.1) CI y Lugar de prestación -->
                    <td class="px-3 py-4 text-sm">
                      <div class="text-xs text-gray-500">-</div>
                    </td>
                    
                    <!-- d.2) Fecha asignación turno original -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearFecha(modificacion.datos_anteriores?.fecha_asignacion) }}
                    </td>
                    
                    <!-- d.3) Turno asignado original -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                      <div class="text-gray-900">{{ getTurnoHorario(modificacion.datos_anteriores) }}</div>
                    </td>
                    
                    <!-- d.4) Extensión del turno original -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ getTurnoExtension(modificacion.datos_anteriores) }}
                    </td>
                    
                    <!-- d.5) Fecha asignación nuevo turno -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearFecha(modificacion.datos_nuevos?.fecha_asignacion) }}
                    </td>
                    
                    <!-- d.6) Inicio del nuevo turno -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ modificacion.datos_nuevos?.fecha_inicio }}
                    </td>
                    
                    <!-- d.7) Nuevo turno asignado -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                      <div class="text-gray-900">{{ getTurnoHorario(modificacion.datos_nuevos) }}</div>
                    </td>
                    
                    <!-- d.8) Extensión del nuevo turno -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ getTurnoExtension(modificacion.datos_nuevos) }}
                    </td>
                    
                    <!-- d.9) Quién solicitó el cambio -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                      <span :class="getSolicitanteClass(modificacion.solicitante)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ capitalize(modificacion.solicitante) }}
                      </span>
                    </td>
                    
                    <!-- d.10) Observaciones -->
                    <td class="px-3 py-4 text-sm text-gray-900 max-w-xs">
                      <div class="truncate" :title="modificacion.descripcion">
                        {{ modificacion.descripcion || 'Sin observaciones' }}
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Mensaje cuando no hay datos -->
                  <tr v-if="!cargando && filteredData.length === 0">
                    <td colspan="11" class="px-3 py-12 text-center">
                      <div class="flex flex-col items-center">
                        <svg class="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p class="text-sm text-gray-500 font-medium">No se encontraron modificaciones de turnos</p>
                        <p class="text-xs text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
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
                      <p class="text-sm text-gray-900">{{ getNombreCompleto(modificacionSeleccionada.trabajador) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Cédula:</label>
                      <p class="text-sm text-gray-900">{{ formatearRut(modificacionSeleccionada.trabajador?.rut) }}</p>
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Lugar de Prestación:</label>
                      <p class="text-sm text-gray-900">-</p>
                    </div>
                  </div>
                </div>

                <!-- Turno Original -->
                <div class="bg-blue-50 p-4 rounded-md">
                  <h4 class="font-semibold text-gray-700 mb-2">Turno Original</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Fecha Asignación:</label>
                      <p class="text-sm text-gray-900">{{ formatearFecha(modificacionSeleccionada.datos_anteriores?.fecha_asignacion) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Horario:</label>
                      <p class="text-sm text-gray-900">{{ getTurnoHorario(modificacionSeleccionada.datos_anteriores) }}</p>
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Extensión:</label>
                      <p class="text-sm text-gray-900">{{ getTurnoExtension(modificacionSeleccionada.datos_anteriores) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Turno Nuevo -->
                <div class="bg-green-50 p-4 rounded-md">
                  <h4 class="font-semibold text-gray-700 mb-2">Turno Nuevo</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Fecha Asignación:</label>
                      <p class="text-sm text-gray-900">{{ formatearFecha(modificacionSeleccionada.datos_nuevos?.fecha_asignacion) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Inicio Turno:</label>
                      <p class="text-sm text-gray-900">{{ formatearFecha(modificacionSeleccionada.datos_nuevos?.fecha_inicio) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Horario:</label>
                      <p class="text-sm text-gray-900">{{ getTurnoHorario(modificacionSeleccionada.datos_nuevos) }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Extensión:</label>
                      <p class="text-sm text-gray-900">{{ getTurnoExtension(modificacionSeleccionada.datos_nuevos) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Información Adicional -->
                <div class="border-t pt-3">
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700">Solicitante:</label>
                    <span :class="getSolicitanteClass(modificacionSeleccionada.solicitante)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ capitalize(modificacionSeleccionada.solicitante) }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Observaciones:</label>
                    <p class="text-sm text-gray-900">{{ modificacionSeleccionada.descripcion || 'Sin observaciones' }}</p>
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
import { useDataStore } from '../../../store/dataStorage.js'
import reporteService from '../../../services/reporteService.js'

const dataStore = useDataStore()
const empresaSeleccionada = computed(() => dataStore.empresaSeleccionada)

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
const cargando = ref(false)
const modalDetalle = ref(false)
const modificacionSeleccionada = ref(null)

const stats = computed(() => {
  return {
    total: filteredData.value.length,
    porEmpleador: filteredData.value.filter(m => m.solicitante?.toLowerCase() === 'empleador').length,
    porTrabajador: filteredData.value.filter(m => m.solicitante?.toLowerCase() === 'trabajador').length
  }
})

const filteredData = computed(() => {
  let data = modificaciones.value


  console.log(data)

  if (filters.value.trabajador) {
    const busqueda = filters.value.trabajador.toLowerCase()
    data = data.filter(m => {
      const nombreCompleto = getNombreCompleto(m.trabajador).toLowerCase()
      const rut = m.trabajador?.rut?.toLowerCase() || ''
      return nombreCompleto.includes(busqueda) || rut.includes(busqueda)
    })
  }

  if (filters.value.lugar) {
    data = data.filter(m => {
      const lugar = m.lugar || '-'
      return lugar.toLowerCase().includes(filters.value.lugar.toLowerCase())
    })
  }

  if (filters.value.fechaInicio && filters.value.fechaFin) {
    data = data.filter(m => {
      const fecha = new Date(m.datos_nuevos?.fecha_asignacion || m.fecha_cambio)
      return fecha >= new Date(filters.value.fechaInicio) && fecha <= new Date(filters.value.fechaFin)
    })
  }

  return data.sort((a, b) => {
    const fechaA = new Date(a.datos_nuevos?.fecha_asignacion || a.fecha_cambio)
    const fechaB = new Date(b.datos_nuevos?.fecha_asignacion || b.fecha_cambio)
    return fechaB - fechaA
  })
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
  const solicitanteLower = solicitante?.toLowerCase() || ''
  const classes = {
    'empleador': 'bg-blue-100 text-blue-800',
    'trabajador': 'bg-green-100 text-green-800'
  }
  return classes[solicitanteLower] || 'bg-gray-100 text-gray-800'
}

// Capitalizar primera letra
const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Obtener nombre completo del trabajador
const getNombreCompleto = (trabajador) => {
  if (!trabajador) return '-'
  const nombre = trabajador.nombre || ''
  const apellidoPat = trabajador.apellido_pat || ''
  const apellidoMat = trabajador.apellido_mat || ''
  return `${nombre} ${apellidoPat} ${apellidoMat}`.trim()
}

// Obtener horario del turno (hora_inicio - hora_fin)
const getTurnoHorario = (datos) => {
  if (!datos) return '-'
  const horaInicio = datos.hora_inicio || ''
  const horaFin = datos.hora_fin || ''
  if (!horaInicio || !horaFin) return datos.tipo_turno_nombre || '-'
  return `${horaInicio.substring(0, 5)} - ${horaFin.substring(0, 5)}`
}

// Obtener extensión del turno (días que trabaja)
const getTurnoExtension = (datos) => {
  if (!datos || !datos.detalle_dias_turno) return '-'
  const diasTrabaja = datos.detalle_dias_turno
    .filter(d => d.trabaja === 1)
    .map(d => d.dia_semana)
  
  if (diasTrabaja.length === 0) return 'Sin días asignados'
  
  // Mapeo de días en español
  const diasAbreviados = {
    'lunes': 'L',
    'martes': 'M',
    'miércoles': 'X',
    'miercoles': 'X',
    'jueves': 'J',
    'viernes': 'V',
    'sábado': 'S',
    'sabado': 'S',
    'domingo': 'D'
  }
  
  return diasTrabaja.map(d => diasAbreviados[d.toLowerCase()] || d.substring(0, 1).toUpperCase()).join(', ')
}

const loadData = async () => {
  if (!empresaSeleccionada.value?.id) {
    console.warn('No hay empresa seleccionada')
    return
  }

  try {
    cargando.value = true
    
    // Obtener reporte de modificaciones desde el backend
    const response = await reporteService.obtenerReporteModificacionesTurnos(empresaSeleccionada.value.id)
    
    if (response.success) {
      modificaciones.value = response.data
      
      // Actualizar información del empleador
      if (response.empresa) {
        empleadorInfo.value = {
          razonSocial: response.empresa.razonSocial || 'Sin información',
          rut: formatearRut(response.empresa.rut) || 'Sin información'
        }
      }
      
      console.log('✅ Modificaciones cargadas:', modificaciones.value)
    } else {
      console.error('❌ Error al cargar modificaciones:', response.error)
      modificaciones.value = []
    }
  } catch (error) {
    console.error('❌ Error al cargar datos:', error)
    modificaciones.value = []
  } finally {
    cargando.value = false
  }
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
