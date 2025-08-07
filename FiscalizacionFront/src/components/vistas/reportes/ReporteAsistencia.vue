<template>
  <div class="min-h-screen bg-gray-50">
    
    
    <!-- Main Content -->
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reporte de Asistencia</h1>
          <p class="mt-2 text-gray-600">Control y supervisión de asistencia del personal</p>
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
                  <option value="mañana">Turno Mañana (08:00-16:00)</option>
                  <option value="tarde">Turno Tarde (16:00-00:00)</option>
                  <option value="noche">Turno Noche (00:00-08:00)</option>
                  <option value="rotativo">Turno Rotativo</option>
                  <option value="mixto">Jornada Mixta</option>
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

            <!-- Estado de Asistencia -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Estado de Asistencia</label>
                <select 
                  v-model="filters.estado" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="PRESENTE">Presente</option>
                  <option value="AUSENTE">Ausente</option>
                  <option value="TARDANZA">Tardanza</option>
                  <option value="AUSENCIA_JUSTIFICADA">Ausencia Justificada</option>
                  <option value="LICENCIA_MEDICA">Licencia Médica</option>
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

        <!-- Stats Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Presentes</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.presentes }}</p>
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
                <p class="text-sm font-medium text-gray-600">Ausentes</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.ausentes }}</p>
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
                <p class="text-sm font-medium text-gray-600">Tardanzas</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.tardanzas }}</p>
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
                <p class="text-sm font-medium text-gray-600">Total</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.total }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Lista de Asistencia</h3>
                <p class="mt-2 text-sm text-gray-700">Detalle de asistencia del personal para la fecha seleccionada</p>
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
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Empleado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Cargo/Jornada</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Lugar</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Entrada</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Salida</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Horas</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Hash</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="empleado in filteredData" :key="empleado.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">{{ empleado.iniciales }}</span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ empleado.nombre }}</div>
                          <div class="text-sm text-gray-500">RUT: {{ empleado.cedula }}</div>
                          <div class="text-xs text-blue-600" v-if="empleado.empresaTransitoria">EST: {{ empleado.empresaTransitoria }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ empleado.cargo }}</div>
                      <div class="text-sm text-gray-500">{{ empleado.jornada }} - {{ empleado.departamento }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ empleado.lugar?.replace('_', ' ') || 'N/A' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ empleado.entrada }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ empleado.salida }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClass(empleado.estado)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ empleado.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ empleado.horas }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{{ empleado.hashChecksum?.substring(0, 8) || 'N/A' }}</td>
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
  // Filtros según Art. 25
  trabajadorNombre: '',
  trabajadorRut: '',
  jornada: '',
  fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Última semana por defecto
  fechaHasta: new Date().toISOString().split('T')[0],
  periodoRapido: 'semana',
  lugar: '',
  cargo: '',
  empresaTransitoria: '',
  hashChecksum: '',
  estado: '',
  departamento: ''
})

const empleados = ref([])

const summary = computed(() => {
  const data = filteredData.value
  return {
    total: data.length,
    presentes: data.filter(e => e.estado === 'PRESENTE').length,
    ausentes: data.filter(e => e.estado === 'AUSENTE').length,
    tardanzas: data.filter(e => e.estado === 'TARDANZA').length
  }
})

const filteredData = computed(() => {
  let data = empleados.value
  
  // Filtro por nombre o apellido del trabajador
  if (filters.value.trabajadorNombre) {
    const nombre = filters.value.trabajadorNombre.toLowerCase()
    data = data.filter(e => e.nombre.toLowerCase().includes(nombre))
  }
  
  // Filtro por RUT
  if (filters.value.trabajadorRut) {
    data = data.filter(e => e.cedula.includes(filters.value.trabajadorRut.replace(/[.-]/g, '')))
  }
  
  // Filtro por jornada/turno
  if (filters.value.jornada) {
    data = data.filter(e => e.jornada === filters.value.jornada)
  }
  
  // Filtro por lugar
  if (filters.value.lugar) {
    data = data.filter(e => e.lugar === filters.value.lugar)
  }
  
  // Filtro por cargo
  if (filters.value.cargo) {
    data = data.filter(e => e.cargo === filters.value.cargo)
  }
  
  // Filtro por empresa transitoria
  if (filters.value.empresaTransitoria) {
    if (filters.value.empresaTransitoria === 'directos') {
      data = data.filter(e => !e.empresaTransitoria)
    } else {
      data = data.filter(e => e.empresaTransitoria === filters.value.empresaTransitoria)
    }
  }
  
  // Filtro por código hash
  if (filters.value.hashChecksum) {
    data = data.filter(e => e.hashChecksum && e.hashChecksum.includes(filters.value.hashChecksum))
  }
  
  // Filtro por departamento
  if (filters.value.departamento) {
    data = data.filter(e => e.departamento === filters.value.departamento)
  }
  
  // Filtro por estado
  if (filters.value.estado) {
    data = data.filter(e => e.estado === filters.value.estado)
  }
  
  // Filtro por rango de fechas
  if (filters.value.fechaDesde && filters.value.fechaHasta) {
    data = data.filter(e => {
      const fechaEmpleado = new Date(e.fecha)
      const fechaDesde = new Date(filters.value.fechaDesde)
      const fechaHasta = new Date(filters.value.fechaHasta)
      return fechaEmpleado >= fechaDesde && fechaEmpleado <= fechaHasta
    })
  }
  
  return data
})

const getStatusClass = (estado) => {
  switch (estado) {
    case 'PRESENTE':
      return 'bg-green-100 text-green-800'
    case 'AUSENTE':
      return 'bg-red-100 text-red-800'
    case 'TARDANZA':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const loadData = async () => {
  // Simular datos ampliados para desarrollo
  empleados.value = [
    {
      id: 1,
      nombre: 'Juan Pérez Martínez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'IT',
      jornada: 'mañana',
      lugar: 'sucursal_central',
      cargo: 'tecnico',
      empresaTransitoria: null,
      entrada: '08:00',
      salida: '17:00',
      estado: 'PRESENTE',
      horas: '9:00',
      fecha: '2024-01-15',
      hashChecksum: 'abc123def456'
    },
    {
      id: 2,
      nombre: 'María González Silva',
      cedula: '87654321',
      iniciales: 'MG',
      departamento: 'RRHH',
      jornada: 'mañana',
      lugar: 'sucursal_central',
      cargo: 'administrativo',
      empresaTransitoria: null,
      entrada: '08:15',
      salida: '17:00',
      estado: 'TARDANZA',
      horas: '8:45',
      fecha: '2024-01-15',
      hashChecksum: 'def456ghi789'
    },
    {
      id: 3,
      nombre: 'Carlos López Fernández',
      cedula: '11223344',
      iniciales: 'CL',
      departamento: 'VENTAS',
      jornada: 'tarde',
      lugar: 'sucursal_norte',
      cargo: 'vendedor',
      empresaTransitoria: 'manpower',
      entrada: '-',
      salida: '-',
      estado: 'AUSENTE',
      horas: '0:00',
      fecha: '2024-01-15',
      hashChecksum: 'ghi789jkl012'
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez Castro',
      cedula: '55667788',
      iniciales: 'AR',
      departamento: 'PRODUCCION',
      jornada: 'rotativo',
      lugar: 'planta_produccion',
      cargo: 'operario',
      empresaTransitoria: null,
      entrada: '06:00',
      salida: '14:00',
      estado: 'PRESENTE',
      horas: '8:00',
      fecha: '2024-01-15',
      hashChecksum: 'jkl012mno345'
    },
    {
      id: 5,
      nombre: 'Roberto Sanchez Torres',
      cedula: '99887766',
      iniciales: 'RS',
      departamento: 'ADMINISTRACION',
      jornada: 'mañana',
      lugar: 'oficina_comercial',
      cargo: 'contador',
      empresaTransitoria: 'randstad',
      entrada: '09:00',
      salida: '18:00',
      estado: 'PRESENTE',
      horas: '9:00',
      fecha: '2024-01-15',
      hashChecksum: 'mno345pqr678'
    }
  ]
}

const applyFilters = () => {
  // La funcionalidad de filtrado se maneja automáticamente con computed
  console.log('Filtros aplicados según Art. 25:', filters.value)
}

const clearFilters = () => {
  filters.value = {
    trabajadorNombre: '',
    trabajadorRut: '',
    jornada: '',
    fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    periodoRapido: 'semana',
    lugar: '',
    cargo: '',
    empresaTransitoria: '',
    hashChecksum: '',
    estado: '',
    departamento: ''
  }
}

const setPeriodoRapido = (periodo) => {
  filters.value.periodoRapido = periodo
  const hoy = new Date()
  
  if (periodo === 'semana') {
    const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
    filters.value.fechaDesde = semanaAtras.toISOString().split('T')[0]
    filters.value.fechaHasta = hoy.toISOString().split('T')[0]
  } else if (periodo === 'mes') {
    const mesAtras = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
    filters.value.fechaDesde = mesAtras.toISOString().split('T')[0]
    filters.value.fechaHasta = hoy.toISOString().split('T')[0]
  }
}

const exportarPDF = () => {
  alert('Exportación a PDF - Funcionalidad en desarrollo\nDatos filtrados: ' + filteredData.value.length + ' registros')
}

const exportarWord = () => {
  alert('Exportación a Word - Funcionalidad en desarrollo\nDatos filtrados: ' + filteredData.value.length + ' registros')
}

const exportarExcel = () => {
  alert('Exportación a Excel - Funcionalidad en desarrollo\nDatos filtrados: ' + filteredData.value.length + ' registros')
}

const exportData = () => {
  // Funcionalidad de exportación legacy
  exportarExcel()
}

onMounted(() => {
  loadData()
})
</script>
