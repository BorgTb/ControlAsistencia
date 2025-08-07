<template>
  <div class="min-h-screen bg-gray-50">
    
    
    <!-- Main Content -->
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reporte Domingos y Festivos</h1>
          <p class="mt-2 text-gray-600">Control de trabajo en días no laborales y feriados</p>
        </div>

        <!-- Filtros Avanzados (Art. 25) - Sin scroll lateral, todos visibles -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">🔍 Filtros de Consulta (Art. 25)</h3>
            
            <!-- Fila 1: Trabajador y Jornada -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Trabajador</label>
                <div class="space-y-2">
                  <input 
                    v-model="filters.trabajadorNombre" 
                    type="text" 
                    placeholder="Nombre o apellido"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  <input 
                    v-model="filters.trabajadorRut" 
                    type="text" 
                    placeholder="RUT (12.345.678-9)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Jornada/Turno</label>
                <select 
                  v-model="filters.jornada" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las jornadas</option>
                  <option value="MAÑANA">Turno Mañana (08:00-16:00)</option>
                  <option value="TARDE">Turno Tarde (16:00-00:00)</option>
                  <option value="NOCHE">Turno Noche (00:00-08:00)</option>
                  <option value="ROTATIVO">Turno Rotativo</option>
                  <option value="ESPECIAL">Jornada Especial</option>
                </select>
              </div>
            </div>

            <!-- Fila 2: Fechas y Lugar -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Fechas</label>
                <div class="space-y-2">
                  <div class="flex space-x-2">
                    <button 
                      @click="setPeriodoRapido('semana')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'semana', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'semana'}"
                      class="px-3 py-1 rounded text-sm"
                    >
                      Última Semana
                    </button>
                    <button 
                      @click="setPeriodoRapido('mes')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'mes', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'mes'}"
                      class="px-3 py-1 rounded text-sm"
                    >
                      Último Mes
                    </button>
                  </div>
                  <div class="flex space-x-2">
                    <input 
                      v-model="filters.fechaDesde" 
                      type="date" 
                      placeholder="Desde"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <input 
                      v-model="filters.fechaHasta" 
                      type="date" 
                      placeholder="Hasta"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Lugar</label>
                <div class="space-y-2">
                  <select 
                    v-model="filters.lugar" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los lugares</option>
                    <option value="sucursal_central">Sucursal Central</option>
                    <option value="sucursal_norte">Sucursal Norte</option>
                    <option value="sucursal_sur">Sucursal Sur</option>
                    <option value="faena_1">Faena Minera 1</option>
                    <option value="faena_2">Faena Construcción 2</option>
                    <option value="oficina_comercial">Oficina Comercial</option>
                    <option value="planta_produccion">Planta de Producción</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Fila 3: Cargo, Empresa y Hash -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Cargo</label>
                <select 
                  v-model="filters.cargo" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los cargos</option>
                  <option value="gerente">Gerente</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="operario">Operario</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="tecnico">Técnico</option>
                  <option value="contador">Contador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="seguridad">Seguridad</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Empresa de Servicios Transitorios</label>
                <select 
                  v-model="filters.empresaTransitoria" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Personal directo + EST</option>
                  <option value="directos">Solo Personal Directo</option>
                  <option value="manpower">Manpower Chile S.A.</option>
                  <option value="randstad">Randstad Chile S.A.</option>
                  <option value="adecco">Adecco Chile S.A.</option>
                  <option value="experis">Experis Chile S.A.</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Código Hash/Checksum</label>
                <input 
                  v-model="filters.hashChecksum" 
                  type="text" 
                  placeholder="Código de verificación"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>

            <!-- Tipo de Día y Departamento -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Día No Laboral</label>
                <select 
                  v-model="filters.tipoDia" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="DOMINGO">Domingos</option>
                  <option value="FESTIVO">Días Festivos</option>
                  <option value="FERIADO_LEGAL">Feriados Legales</option>
                  <option value="DIA_NACIONAL">Días Nacionales</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Departamento/Área</label>
                <select 
                  v-model="filters.departamento" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los departamentos</option>
                  <option value="RRHH">Recursos Humanos</option>
                  <option value="IT">Tecnología</option>
                  <option value="VENTAS">Ventas</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="PRODUCCION">Producción</option>
                  <option value="ADMINISTRACION">Administración</option>
                  <option value="SEGURIDAD">Seguridad</option>
                </select>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex flex-wrap gap-2">
              <button 
                @click="applyFilters" 
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                🔍 Aplicar Filtros
              </button>
              <button 
                @click="clearFilters" 
                class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                🧹 Limpiar Filtros
              </button>
              <button 
                @click="exportarPDF" 
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                📄 Exportar PDF
              </button>
              <button 
                @click="exportarWord" 
                class="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition-colors"
              >
                📝 Exportar Word
              </button>
              <button 
                @click="exportarExcel" 
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                📊 Exportar Excel
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Domingos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalDomingos }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-red-100 rounded-lg">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Festivos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalFestivos }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Empleados Trabajaron</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.empleadosTrabajaron }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Pagos Extra</p>
                <p class="text-2xl font-bold text-gray-900">${{ stats.totalPagosExtra }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar View -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Vista de Calendario - Días No Laborales</h3>
            <div class="grid grid-cols-7 gap-2 text-center">
              <!-- Calendar headers -->
              <div class="font-semibold text-gray-600 py-2">Dom</div>
              <div class="font-semibold text-gray-600 py-2">Lun</div>
              <div class="font-semibold text-gray-600 py-2">Mar</div>
              <div class="font-semibold text-gray-600 py-2">Mié</div>
              <div class="font-semibold text-gray-600 py-2">Jue</div>
              <div class="font-semibold text-gray-600 py-2">Vie</div>
              <div class="font-semibold text-gray-600 py-2">Sáb</div>
              
              <!-- Calendar days -->
              <div v-for="dia in calendarioDias" :key="dia.fecha" 
                   :class="getDiaClass(dia)" 
                   class="p-2 border rounded cursor-pointer hover:bg-gray-50">
                <div class="text-sm font-medium">{{ dia.numero }}</div>
                <div v-if="dia.tipo" class="text-xs mt-1">{{ dia.empleados }} emp.</div>
              </div>
            </div>
            <div class="mt-4 flex space-x-4 text-sm">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-purple-200 rounded mr-2"></div>
                <span>Domingo</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-red-200 rounded mr-2"></div>
                <span>Festivo</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-200 rounded mr-2"></div>
                <span>Con Personal</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Registro de Trabajo en Días No Laborales</h3>
                <p class="mt-2 text-sm text-gray-700">Detalle de empleados que trabajaron en domingos y festivos</p>
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
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Empleado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Departamento</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Entrada</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Salida</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Horas</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Pago Extra</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="registro in filteredData" :key="registro.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatearFecha(registro.fecha) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getTipoClass(registro.tipo)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ registro.tipo }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">{{ registro.iniciales }}</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ registro.nombre }}</div>
                          <div class="text-sm text-gray-500">{{ registro.cedula }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ registro.departamento }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ registro.entrada }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ registro.salida }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ registro.horas }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${{ registro.pagoExtra }}</td>
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

const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const filters = ref({
  fechaInicio: firstDay.toISOString().split('T')[0],
  fechaFin: lastDay.toISOString().split('T')[0],
  departamento: '',
  tipoDia: ''
})

const registros = ref([])

const stats = computed(() => {
  const data = filteredData.value
  return {
    totalDomingos: data.filter(r => r.tipo === 'DOMINGO').length,
    totalFestivos: data.filter(r => r.tipo === 'FESTIVO').length,
    empleadosTrabajaron: [...new Set(data.map(r => r.empleadoId))].length,
    totalPagosExtra: data.reduce((sum, r) => sum + parseFloat(r.pagoExtra), 0).toFixed(2)
  }
})

const filteredData = computed(() => {
  let data = registros.value
  
  if (filters.value.departamento) {
    data = data.filter(r => r.departamento === filters.value.departamento)
  }
  
  if (filters.value.tipoDia) {
    data = data.filter(r => r.tipo === filters.value.tipoDia)
  }
  
  return data
})

const calendarioDias = computed(() => {
  const dias = []
  const inicio = new Date(filters.value.fechaInicio)
  const fin = new Date(filters.value.fechaFin)
  
  // Generar días del mes actual
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const fecha = new Date(d)
    const esDomingo = fecha.getDay() === 0
    const esFestivo = esFechaFestivo(fecha)
    const trabajaron = registros.value.filter(r => r.fecha === fecha.toISOString().split('T')[0])
    
    if (esDomingo || esFestivo) {
      dias.push({
        fecha: fecha.toISOString().split('T')[0],
        numero: fecha.getDate(),
        tipo: esFestivo ? 'FESTIVO' : 'DOMINGO',
        empleados: trabajaron.length
      })
    }
  }
  
  return dias
})

const esFechaFestivo = (fecha) => {
  // Lista de festivos (simplificada)
  const festivos = [
    '2024-01-01', // Año Nuevo
    '2024-05-01', // Día del Trabajo
    '2024-12-25'  // Navidad
  ]
  return festivos.includes(fecha.toISOString().split('T')[0])
}

const getDiaClass = (dia) => {
  const base = 'min-h-16 '
  if (dia.tipo === 'DOMINGO') return base + 'bg-purple-100 border-purple-300'
  if (dia.tipo === 'FESTIVO') return base + 'bg-red-100 border-red-300'
  if (dia.empleados > 0) return base + 'bg-green-100 border-green-300'
  return base + 'bg-gray-50'
}

const getTipoClass = (tipo) => {
  switch (tipo) {
    case 'DOMINGO':
      return 'bg-purple-100 text-purple-800'
    case 'FESTIVO':
      return 'bg-red-100 text-red-800'
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
  registros.value = [
    {
      id: 1,
      fecha: '2024-01-07', // Domingo
      tipo: 'DOMINGO',
      empleadoId: 1,
      nombre: 'Juan Pérez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'SEGURIDAD',
      entrada: '08:00',
      salida: '16:00',
      horas: '8.0',
      pagoExtra: '120.00'
    },
    {
      id: 2,
      fecha: '2024-01-01', // Festivo
      tipo: 'FESTIVO',
      empleadoId: 2,
      nombre: 'María González',
      cedula: '87654321',
      iniciales: 'MG',
      departamento: 'IT',
      entrada: '09:00',
      salida: '13:00',
      horas: '4.0',
      pagoExtra: '80.00'
    },
    {
      id: 3,
      fecha: '2024-01-14', // Domingo
      tipo: 'DOMINGO',
      empleadoId: 3,
      nombre: 'Carlos López',
      cedula: '11223344',
      iniciales: 'CL',
      departamento: 'SEGURIDAD',
      entrada: '20:00',
      salida: '06:00',
      horas: '10.0',
      pagoExtra: '150.00'
    }
  ]
}

const applyFilters = () => {
  console.log('Filtros aplicados:', filters.value)
}

const clearFilters = () => {
  filters.value = {
    fechaInicio: firstDay.toISOString().split('T')[0],
    fechaFin: lastDay.toISOString().split('T')[0],
    departamento: '',
    tipoDia: ''
  }
}

const exportData = () => {
  alert('Función de exportación en desarrollo')
}

onMounted(() => {
  loadData()
})
</script>
