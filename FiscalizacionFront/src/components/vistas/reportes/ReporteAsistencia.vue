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
            
            <!-- Fila 1: Búsqueda Individual y Grupal de Trabajadores -->
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
                  <!-- Búsqueda grupal (activada si hay más de 10 trabajadores) -->
                  <div v-if="empleadosDisponibles.length > 10">
                    <button 
                      @click="mostrarSelectorGrupal = !mostrarSelectorGrupal"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                    >
                      👥 Selección múltiple ({{ trabajadoresSeleccionados.length }} seleccionados)
                    </button>
                    <div v-if="mostrarSelectorGrupal" class="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                      <div class="p-2 border-b bg-gray-50">
                        <input 
                          v-model="busquedaGrupal" 
                          placeholder="Buscar trabajadores..."
                          class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                      </div>
                      <div class="p-1">
                        <label v-for="empleado in empleadosFiltrados" :key="empleado.id" class="flex items-center px-2 py-1 hover:bg-gray-100 text-sm">
                          <input 
                            type="checkbox" 
                            :value="empleado.id" 
                            v-model="trabajadoresSeleccionados"
                            class="mr-2"
                          >
                          {{ empleado.nombre }} ({{ empleado.cedula }})
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Tipo de Jornada Mejorado -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Tipo de Jornada</label>
                <select 
                  v-model="filters.tipoJornada" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="fija">Jornada Fija</option>
                  <option value="turnos">Por Turnos</option>
                  <option value="ciclos">Por Ciclos</option>
                  <option value="bisemanal">Bisemanal</option>
                  <option value="excepcional">Excepcional</option>
                  <option value="parcial">Tiempo Parcial</option>
                </select>
              </div>
            </div>

            <!-- Fila 2: Período Predeterminado y Fechas Personalizadas -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Período Predeterminado</label>
                <div class="space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      @click="setPeriodoRapido('semana')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'semana', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'semana'}"
                      class="px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Última Semana
                    </button>
                    <button 
                      @click="setPeriodoRapido('quincena')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'quincena', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'quincena'}"
                      class="px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Última Quincena
                    </button>
                    <button 
                      @click="setPeriodoRapido('mes')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'mes', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'mes'}"
                      class="px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Mes Anterior
                    </button>
                    <button 
                      @click="setPeriodoRapido('trimestre')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'trimestre', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'trimestre'}"
                      class="px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Último Trimestre
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
              
              <!-- Turnos por Extensión Horaria -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Turnos y Horarios</label>
                <div class="space-y-2">
                  <select 
                    v-model="filters.turnoEspecifico" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los turnos</option>
                    <option value="mañana_lv">Lunes a Viernes, 08:00 a 17:00</option>
                    <option value="mañana_lj">Lunes a Jueves, 10:00 a 18:00</option>
                    <option value="tarde_lv">Lunes a Viernes, 14:00 a 23:00</option>
                    <option value="noche_lv">Lunes a Viernes, 22:00 a 06:00</option>
                    <option value="rotativo_247">24/7 Rotativo</option>
                    <option value="4x4">4x4 (4 días trabajo, 4 descanso)</option>
                    <option value="7x7">7x7 (7 días trabajo, 7 descanso)</option>
                  </select>
                  <select 
                    v-model="filters.lugarTrabajo" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los lugares de trabajo</option>
                    <option value="oficina">Oficina</option>
                    <option value="terreno">Terreno</option>
                    <option value="mixto">Mixto</option>
                    <option value="remoto">Remoto/Teletrabajo</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Fila 3: Ubicación con Filtro por Región -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Ubicación</label>
                <div class="space-y-2">
                  <!-- Filtro por región (si hay más de 5 locales por región) -->
                  <select 
                    v-model="filters.region" 
                    @change="filtrarLocalesPorRegion"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las regiones</option>
                    <option value="metropolitana">Región Metropolitana</option>
                    <option value="valparaiso">Región de Valparaíso</option>
                    <option value="biobio">Región del Biobío</option>
                    <option value="antofagasta">Región de Antofagasta</option>
                  </select>
                  
                  <!-- Local/Establecimiento/Faena -->
                  <select 
                    v-model="filters.establecimiento" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los establecimientos</option>
                    <option v-for="local in localesFiltrados" :key="local.codigo" :value="local.codigo">
                      {{ local.nombre }} - {{ local.tipo }}
                    </option>
                  </select>
                </div>
              </div>
              
              <!-- Cargo y Empresa -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Por Organización</label>
                <div class="space-y-2">
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
              </div>
            </div>

            <!-- Fila 4: Estado de Asistencia y Departamento -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
import { useReportes } from '../../composables/useReportes'


const {obtenerReporteAsistencia} = useReportes()

const filters = ref({
  // Filtros según Art. 25
  trabajadorNombre: '',
  trabajadorRut: '',
  tipoJornada: '', // Nuevo: Fija, Turnos, Ciclos, etc.
  turnoEspecifico: '', // Nuevo: Turnos por extensión horaria
  lugarTrabajo: '', // Nuevo: Oficina, Terreno, Mixto, Remoto
  fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Última semana por defecto
  fechaHasta: new Date().toISOString().split('T')[0],
  periodoRapido: 'semana',
  region: '', // Nuevo: Filtro por región
  establecimiento: '', // Nuevo: Local/Establecimiento/Faena
  cargo: '',
  empresaTransitoria: '',
  hashChecksum: '',
  estado: '',
  departamento: ''
})

// Nuevas variables para búsqueda grupal
const mostrarSelectorGrupal = ref(false)
const busquedaGrupal = ref('')
const trabajadoresSeleccionados = ref([])

const empleados = ref([])
const empleadosDisponibles = ref([]) // Lista completa para búsqueda grupal
const establecimientos = ref([]) // Lista de establecimientos por región

// Datos simulados de establecimientos por región
const establecimientosPorRegion = {
  metropolitana: [
    { codigo: 'rm_central', nombre: 'Oficina Central Santiago', tipo: 'Oficina' },
    { codigo: 'rm_las_condes', nombre: 'Sucursal Las Condes', tipo: 'Sucursal' },
    { codigo: 'rm_providencia', nombre: 'Centro de Distribución Providencia', tipo: 'Centro Distribución' },
    { codigo: 'rm_puente_alto', nombre: 'Planta Puente Alto', tipo: 'Planta' },
    { codigo: 'rm_maipu', nombre: 'Bodega Maipú', tipo: 'Bodega' },
    { codigo: 'rm_quinta_normal', nombre: 'Taller Quinta Normal', tipo: 'Taller' }
  ],
  valparaiso: [
    { codigo: 'vp_viña', nombre: 'Sucursal Viña del Mar', tipo: 'Sucursal' },
    { codigo: 'vp_valpo', nombre: 'Puerto Valparaíso', tipo: 'Puerto' },
    { codigo: 'vp_quilpue', nombre: 'Centro Logístico Quilpué', tipo: 'Centro Logístico' }
  ],
  biobio: [
    { codigo: 'bb_concepcion', nombre: 'Oficina Concepción', tipo: 'Oficina' },
    { codigo: 'bb_talcahuano', nombre: 'Puerto Talcahuano', tipo: 'Puerto' },
    { codigo: 'bb_los_angeles', nombre: 'Faena Forestal Los Ángeles', tipo: 'Faena' }
  ],
  antofagasta: [
    { codigo: 'af_antofagasta', nombre: 'Puerto Antofagasta', tipo: 'Puerto' },
    { codigo: 'af_calama', nombre: 'Faena Minera Calama', tipo: 'Faena Minera' },
    { codigo: 'af_mejillones', nombre: 'Terminal Mejillones', tipo: 'Terminal' }
  ]
}

// Computed para empleados filtrados en búsqueda grupal
const empleadosFiltrados = computed(() => {
  if (!busquedaGrupal.value) return empleadosDisponibles.value
  const busqueda = busquedaGrupal.value.toLowerCase()
  return empleadosDisponibles.value.filter(emp => 
    emp.nombre.toLowerCase().includes(busqueda) || 
    emp.cedula.includes(busqueda)
  )
})

// Computed para locales filtrados por región
const localesFiltrados = computed(() => {
  if (!filters.value.region) {
    // Si no hay región seleccionada, mostrar todos
    return Object.values(establecimientosPorRegion).flat()
  }
  return establecimientosPorRegion[filters.value.region] || []
})

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
  
  // Filtro por trabajadores seleccionados grupalmente
  if (trabajadoresSeleccionados.value.length > 0) {
    data = data.filter(e => trabajadoresSeleccionados.value.includes(e.id))
  }
  
  // Filtro por nombre o apellido del trabajador
  if (filters.value.trabajadorNombre) {
    const nombre = filters.value.trabajadorNombre.toLowerCase()
    data = data.filter(e => e.nombre.toLowerCase().includes(nombre))
  }
  
  // Filtro por RUT
  if (filters.value.trabajadorRut) {
    data = data.filter(e => e.cedula.includes(filters.value.trabajadorRut.replace(/[.-]/g, '')))
  }
  
  // Filtro por tipo de jornada
  if (filters.value.tipoJornada) {
    data = data.filter(e => e.tipoJornada === filters.value.tipoJornada)
  }
  
  // Filtro por turno específico
  if (filters.value.turnoEspecifico) {
    data = data.filter(e => e.turnoEspecifico === filters.value.turnoEspecifico)
  }
  
  // Filtro por lugar de trabajo
  if (filters.value.lugarTrabajo) {
    data = data.filter(e => e.lugarTrabajo === filters.value.lugarTrabajo)
  }
  
  // Filtro por región
  if (filters.value.region) {
    data = data.filter(e => e.region === filters.value.region)
  }
  
  // Filtro por establecimiento
  if (filters.value.establecimiento) {
    data = data.filter(e => e.establecimiento === filters.value.establecimiento)
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


const applyFilters = () => {
  // La funcionalidad de filtrado se maneja automáticamente con computed
  console.log('Filtros aplicados según Art. 25:', filters.value)
}

const clearFilters = () => {
  filters.value = {
    trabajadorNombre: '',
    trabajadorRut: '',
    tipoJornada: '',
    turnoEspecifico: '',
    lugarTrabajo: '',
    fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    periodoRapido: 'semana',
    region: '',
    establecimiento: '',
    cargo: '',
    empresaTransitoria: '',
    hashChecksum: '',
    estado: '',
    departamento: ''
  }
  
  // Limpiar selección grupal
  trabajadoresSeleccionados.value = []
  mostrarSelectorGrupal.value = false
  busquedaGrupal.value = ''
}

const setPeriodoRapido = (periodo) => {
  filters.value.periodoRapido = periodo
  const hoy = new Date()
  
  switch (periodo) {
    case 'semana':
      const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
      filters.value.fechaDesde = semanaAtras.toISOString().split('T')[0]
      filters.value.fechaHasta = hoy.toISOString().split('T')[0]
      break
    
    case 'quincena':
      const quincenaAtras = new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000)
      filters.value.fechaDesde = quincenaAtras.toISOString().split('T')[0]
      filters.value.fechaHasta = hoy.toISOString().split('T')[0]
      break
    
    case 'mes':
      // Mes anterior completo
      const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)
      filters.value.fechaDesde = primerDiaMesAnterior.toISOString().split('T')[0]
      filters.value.fechaHasta = ultimoDiaMesAnterior.toISOString().split('T')[0]
      break
    
    case 'trimestre':
      const trimestreAtras = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000)
      filters.value.fechaDesde = trimestreAtras.toISOString().split('T')[0]
      filters.value.fechaHasta = hoy.toISOString().split('T')[0]
      break
  }
}

// Nueva función para filtrar locales por región
const filtrarLocalesPorRegion = () => {
  // Limpiar establecimiento seleccionado al cambiar región
  filters.value.establecimiento = ''
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


const loadData = async () => {
  // Simular datos ampliados para desarrollo con nuevos campos
  empleados.value = [
    {
      id: 1,
      nombre: 'Juan Pérez Martínez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'IT',
      tipoJornada: 'fija',
      turnoEspecifico: 'mañana_lv',
      lugarTrabajo: 'oficina',
      region: 'metropolitana',
      establecimiento: 'rm_central',
      entrada: '08:00',
      salida: '17:00',
      estado: 'PRESENTE',
      cargo: 'tecnico',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      hashChecksum: 'abc123def456'
    },
    {
      id: 2,
      nombre: 'María González Silva',
      cedula: '87654321',
      iniciales: 'MG',
      departamento: 'RRHH',
      tipoJornada: 'turnos',
      turnoEspecifico: 'mañana_lj',
      lugarTrabajo: 'mixto',
      region: 'metropolitana',
      establecimiento: 'rm_las_condes',
      entrada: '10:00',
      salida: '18:00',
      estado: 'PRESENTE',
      cargo: 'administrativo',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      hashChecksum: 'def456ghi789'
    },
    {
      id: 3,
      nombre: 'Carlos López Fernández',
      cedula: '11223344',
      iniciales: 'CL',
      departamento: 'VENTAS',
      tipoJornada: 'ciclos',
      turnoEspecifico: '4x4',
      lugarTrabajo: 'terreno',
      region: 'antofagasta',
      establecimiento: 'af_calama',
      entrada: '06:00',
      salida: '18:00',
      estado: 'PRESENTE',
      cargo: 'operario',
      empresaTransitoria: 'manpower',
      fecha: '2024-01-15',
      hashChecksum: 'ghi789jkl012'
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez Castro',
      cedula: '55667788',
      iniciales: 'AR',
      departamento: 'MARKETING',
      tipoJornada: 'parcial',
      turnoEspecifico: 'mañana_lv',
      lugarTrabajo: 'remoto',
      region: 'valparaiso',
      establecimiento: 'vp_viña',
      entrada: '09:00',
      salida: '13:00',
      estado: 'PRESENTE',
      cargo: 'administrativo',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      hashChecksum: 'jkl012mno345'
    },
    {
      id: 5,
      nombre: 'Roberto Sanchez Torres',
      cedula: '99887766',
      iniciales: 'RS',
      departamento: 'PRODUCCION',
      tipoJornada: 'turnos',
      turnoEspecifico: 'rotativo_247',
      lugarTrabajo: 'terreno',
      region: 'biobio',
      establecimiento: 'bb_los_angeles',
      entrada: '22:00',
      salida: '06:00',
      estado: 'TARDANZA',
      cargo: 'operario',
      empresaTransitoria: 'randstad',
      fecha: '2024-01-15',
      hashChecksum: 'mno345pqr678'
    },
    // Agregar más empleados para probar la búsqueda grupal
    {
      id: 6,
      nombre: 'Patricia Morales Vega',
      cedula: '22334455',
      iniciales: 'PM',
      departamento: 'ADMINISTRACION',
      tipoJornada: 'fija',
      turnoEspecifico: 'mañana_lv',
      lugarTrabajo: 'oficina',
      region: 'metropolitana',
      establecimiento: 'rm_central',
      entrada: '08:30',
      salida: '17:30',
      estado: 'PRESENTE',
      cargo: 'contador',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      hashChecksum: 'pqr678stu901'
    },
    {
      id: 7,
      nombre: 'Diego Herrera Luna',
      cedula: '66778899',
      iniciales: 'DH',
      departamento: 'IT',
      tipoJornada: 'excepcional',
      turnoEspecifico: 'tarde_lv',
      lugarTrabajo: 'remoto',
      region: 'metropolitana',
      establecimiento: 'rm_providencia',
      entrada: '14:00',
      salida: '23:00',
      estado: 'AUSENTE',
      cargo: 'tecnico',
      empresaTransitoria: 'adecco',
      fecha: '2024-01-15',
      hashChecksum: 'stu901vwx234'
    },
    {
      id: 8,
      nombre: 'Carmen Espinoza Ramos',
      cedula: '33445566',
      iniciales: 'CE',
      departamento: 'VENTAS',
      tipoJornada: 'bisemanal',
      turnoEspecifico: '7x7',
      lugarTrabajo: 'mixto',
      region: 'valparaiso',
      establecimiento: 'vp_valpo',
      entrada: '08:00',
      salida: '17:00',
      estado: 'LICENCIA_MEDICA',
      cargo: 'vendedor',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      hashChecksum: 'vwx234yza567'
    },
    {
      id: 9,
      nombre: 'Francisco Silva Peña',
      cedula: '77889900',
      iniciales: 'FS',
      departamento: 'PRODUCCION',
      tipoJornada: 'turnos',
      turnoEspecifico: 'noche_lv',
      lugarTrabajo: 'terreno',
      region: 'antofagasta',
      establecimiento: 'af_antofagasta',
      entrada: '22:00',
      salida: '06:00',
      estado: 'PRESENTE',
      cargo: 'supervisor',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      hashChecksum: 'yza567bcd890'
    },
    {
      id: 10,
      nombre: 'Lorena Cáceres Muñoz',
      cedula: '44556677',
      iniciales: 'LC',
      departamento: 'RRHH',
      tipoJornada: 'fija',
      turnoEspecifico: 'mañana_lv',
      lugarTrabajo: 'oficina',
      region: 'biobio',
      establecimiento: 'bb_concepcion',
      entrada: '08:00',
      salida: '17:00',
      estado: 'AUSENCIA_JUSTIFICADA',
      cargo: 'gerente',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      hashChecksum: 'bcd890efg123'
    },
    {
      id: 11,
      nombre: 'Andrés Valenzuela Soto',
      cedula: '88990011',
      iniciales: 'AV',
      departamento: 'MARKETING',
      tipoJornada: 'parcial',
      turnoEspecifico: 'mañana_lj',
      lugarTrabajo: 'remoto',
      region: 'metropolitana',
      establecimiento: 'rm_maipu',
      entrada: '10:00',
      salida: '14:00',
      estado: 'PRESENTE',
      cargo: 'administrativo',
      empresaTransitoria: 'experis',
      fecha: '2024-01-15',
      hashChecksum: 'efg123hij456'
    }
  ]


  
  // Cargar empleados disponibles para búsqueda grupal
  empleadosDisponibles.value = [...empleados.value]
}

onMounted(async () => {
  await obtenerReporteAsistencia()
  loadData()
})
</script>
