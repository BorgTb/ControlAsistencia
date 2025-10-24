<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reporte Jornada Diaria</h1>
          <p class="mt-2 text-gray-600">Control de horas trabajadas y cumplimiento de jornada laboral</p>
        </div>

        <!-- Filtros Básicos (Solo Rango de Fechas) -->
        <div class="bg-white shadow-md rounded-lg mb-6">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h2>
            </div>
            
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Fecha Desde -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                <input 
                  v-model="filters.fechaDesde"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <!-- Fecha Hasta -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <input 
                  v-model="filters.fechaHasta"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <!-- Búsqueda de Trabajador -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Trabajador</label>
                <input 
                  v-model="filters.trabajadorNombre"
                  type="text"
                  placeholder="Nombre o RUT..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <!-- Botones de Acción -->
            <div class="mt-4 flex justify-between items-center">
              <div class="flex space-x-2">
                <button 
                  @click="setPeriodoRapido('semana')"
                  class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  :class="{ 'bg-blue-100 text-blue-700': filters.periodoRapido === 'semana' }"
                >
                  Última Semana
                </button>
                <button 
                  @click="setPeriodoRapido('mes')"
                  class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  :class="{ 'bg-blue-100 text-blue-700': filters.periodoRapido === 'mes' }"
                >
                  Último Mes
                </button>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  @click="clearFilters"
                  class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded-md transition-colors"
                >
                  Limpiar
                </button>
                <button 
                  @click="applyFilters"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                  :disabled="cargandoDatos"
                >
                  <span v-if="cargandoDatos">Cargando...</span>
                  <span v-else>Aplicar Filtros</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Jornadas Completas</p>
                <p class="text-2xl font-bold text-green-600">{{ stats.jornadaCompleta }}</p>
              </div>
              <div class="p-3 bg-green-100 rounded-full">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Jornadas Incompletas</p>
                <p class="text-2xl font-bold text-red-600">{{ stats.jornadaIncompleta }}</p>
              </div>
              <div class="p-3 bg-red-100 rounded-full">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Horas Extras</p>
                <p class="text-2xl font-bold text-blue-600">{{ stats.horasExtras }}</p>
              </div>
              <div class="p-3 bg-blue-100 rounded-full">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Promedio Horas/Día</p>
                <p class="text-2xl font-bold text-purple-600">{{ stats.promedioHoras }}</p>
              </div>
              <div class="p-3 bg-purple-100 rounded-full">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <!-- Loading State -->
            <div v-if="cargandoDatos" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p class="mt-4 text-gray-600">Cargando datos de jornada...</p>
            </div>
            
            <!-- Empty State -->
            <div v-else-if="filteredData.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="mt-4 text-gray-600">No se encontraron registros para el período seleccionado</p>
            </div>
            
            <!-- Table -->
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jornada Pactada</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colación</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hrs Efectivas</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="registro in filteredData" :key="registro.id" class="hover:bg-gray-50">
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearFecha(registro.fecha) }}
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {{ registro.iniciales || getIniciales(registro.nombre) }}
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ registro.nombre }}</div>
                          <div class="text-sm text-gray-500">{{ registro.cargo || 'Sin cargo' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatearRut(registro.cedula) }}
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        {{ registro.turno }}
                      </span>
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {{ registro.jornadaPactada || 'N/A' }}
                        <div v-if="registro.jornadaPactadaMinutos > 0" class="text-xs text-gray-500">
                          ({{ formatearDuracion(registro.jornadaPactadaMinutos) }})
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ registro.entrada || 'N/A' }}
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ registro.salida || 'N/A' }}
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div v-if="registro.colacionInicio && registro.colacionFin">
                        {{ registro.colacionInicio }} - {{ registro.colacionFin }}
                        <div class="text-xs text-gray-500">({{ registro.colacionPactada }})</div>
                      </div>
                      <span v-else class="text-gray-400">Sin colación</span>
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ registro.horasEfectivas || calcularHorasEfectivas(registro) }}
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium" :class="getDiferenciaClass(registro.tiempoExtra || registro.tiempoFaltante || '00:00')">
                      <span v-if="registro.tiempoExtra" class="text-blue-600">{{ registro.tiempoExtra }}</span>
                      <span v-else-if="registro.tiempoFaltante" class="text-red-600">{{ registro.tiempoFaltante }}</span>
                      <span v-else class="text-gray-400">--</span>
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getCumplimientoClass(registro.cumplimiento)">
                        {{ registro.cumplimiento }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Totales Semanales -->
              <div v-if="totalesSemanales" class="mt-6 border-t pt-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Resumen del Período</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-xs text-gray-600">Total Jornada Pactada</p>
                    <p class="text-lg font-bold text-gray-900">{{ totalesSemanales.jornadaPactadaTotal }}</p>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-xs text-gray-600">Total Horas Trabajadas</p>
                    <p class="text-lg font-bold text-gray-900">{{ totalesSemanales.horasTrabajadasTotal }}</p>
                  </div>
                  <div v-if="totalesSemanales.tiempoExtraTotal" class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-xs text-blue-600">Total Tiempo Extra</p>
                    <p class="text-lg font-bold text-blue-600">{{ totalesSemanales.tiempoExtraTotal }}</p>
                  </div>
                  <div v-if="totalesSemanales.tiempoFaltanteTotal" class="bg-red-50 p-4 rounded-lg">
                    <p class="text-xs text-red-600">Total Tiempo Faltante</p>
                    <p class="text-lg font-bold text-red-600">{{ totalesSemanales.tiempoFaltanteTotal }}</p>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-xs text-gray-600">Balance General</p>
                    <p class="text-lg font-bold" :class="{
                      'text-green-600': totalesSemanales.balancePositivo,
                      'text-red-600': totalesSemanales.balanceNegativo,
                      'text-gray-900': !totalesSemanales.balancePositivo && !totalesSemanales.balanceNegativo
                    }">
                      {{ totalesSemanales.balance }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Export Buttons -->
            <div class="mt-6 flex justify-end space-x-2">
              <button 
                @click="exportarExcel"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span>Exportar Excel</span>
              </button>
              <button 
                @click="exportarPDF"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmpresa } from '../../../composables/useEmpresa'
import { useAuth } from '../../../composables/useAuth'

const { obtenerReporteJornadaDiaria } = useEmpresa()
const { user } = useAuth()

const filters = ref({
  trabajadorNombre: '',
  fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  fechaHasta: new Date().toISOString().split('T')[0],
  periodoRapido: 'semana'
})

const registros = ref([])
const cargandoDatos = ref(false)

// Computed para estadísticas
const stats = computed(() => {
  const data = filteredData.value
  
  // Calcular horas extras totales
  let horasExtrasTotales = 0
  data.forEach(r => {
    if (r.tiempoExtra) {
      const horas = r.tiempoExtra.replace('+', '').split(':')
      horasExtrasTotales += parseInt(horas[0]) + (parseInt(horas[1]) / 60)
    }
  })
  
  // Calcular promedio de horas trabajadas
  let promedioHoras = 0
  if (data.length > 0) {
    let totalMinutos = 0
    data.forEach(r => {
      if (r.entrada !== 'N/A' && r.salida !== 'N/A') {
        const minutosEntrada = convertirHoraAMinutos(r.entrada)
        const minutosSalida = convertirHoraAMinutos(r.salida)
        let diferencia = minutosSalida - minutosEntrada
        if (diferencia < 0) diferencia += 24 * 60
        totalMinutos += diferencia
      }
    })
    promedioHoras = (totalMinutos / data.length / 60).toFixed(1)
  }
  
  return {
    jornadaCompleta: data.filter(r => r.cumplimiento === 'COMPLETO').length,
    jornadaIncompleta: data.filter(r => 
      r.cumplimiento === 'INCOMPLETO' || 
      r.cumplimiento === 'AUSENTE' || 
      r.cumplimiento === 'SIN ENTRADA' || 
      r.cumplimiento === 'SIN SALIDA' ||
      r.cumplimiento === 'ATRASO GRAVE' ||
      r.cumplimiento === 'SALIDA ANTICIPADA'
    ).length,
    horasExtras: horasExtrasTotales.toFixed(1),
    promedioHoras: promedioHoras
  }
})

// Computed para totales semanales
const totalesSemanales = computed(() => {
  const data = filteredData.value
  if (data.length === 0) return null
  
  // Calcular total jornada pactada
  const totalJornadaPactada = data.reduce((sum, r) => {
    if (r.jornadaPactadaMinutos && r.jornadaPactadaMinutos > 0) {
      return sum + r.jornadaPactadaMinutos
    }
    return sum
  }, 0)
  
  // Calcular total horas trabajadas
  const totalHorasTrabajadas = data.reduce((sum, r) => {
    if (r.entrada !== 'N/A' && r.salida !== 'N/A') {
      const entrada = convertirHoraAMinutos(r.entrada)
      const salida = convertirHoraAMinutos(r.salida)
      let diferencia = salida - entrada
      if (diferencia < 0) diferencia += 24 * 60
      return sum + diferencia
    }
    return sum
  }, 0)
  
  // Calcular totales de tiempo faltante y extra
  let totalFaltante = 0
  let totalExtra = 0
  
  data.forEach(r => {
    if (r.tiempoFaltante) {
      const tiempo = r.tiempoFaltante.replace('-', '')
      totalFaltante += convertirHoraAMinutos(tiempo)
    }
    if (r.tiempoExtra) {
      const tiempo = r.tiempoExtra.replace('+', '')
      totalExtra += convertirHoraAMinutos(tiempo)
    }
  })
  
  const balance = totalExtra > totalFaltante ? 'Positivo' : totalFaltante > totalExtra ? 'Negativo' : 'Equilibrado'
  
  return {
    jornadaPactadaTotal: convertirMinutosAHoras(totalJornadaPactada),
    horasTrabajadasTotal: convertirMinutosAHoras(totalHorasTrabajadas),
    tiempoFaltanteTotal: totalFaltante > 0 ? `-${convertirMinutosAHoras(totalFaltante)}` : null,
    tiempoExtraTotal: totalExtra > 0 ? `+${convertirMinutosAHoras(totalExtra)}` : null,
    balance,
    balancePositivo: balance === 'Positivo',
    balanceNegativo: balance === 'Negativo'
  }
})

const filteredData = computed(() => {
  let data = registros.value
  
  // Filtro por nombre o RUT del trabajador
  if (filters.value.trabajadorNombre) {
    const busqueda = filters.value.trabajadorNombre.toLowerCase()
    data = data.filter(r => 
      r.nombre.toLowerCase().includes(busqueda) || 
      (r.cedula && r.cedula.includes(busqueda.replace(/[.-]/g, '')))
    )
  }
  
  return data
})

const getCumplimientoClass = (cumplimiento) => {
  switch (cumplimiento) {
    case 'COMPLETO':
      return 'bg-green-100 text-green-800'
    case 'INCOMPLETO':
    case 'SIN ENTRADA':
    case 'SIN SALIDA':
      return 'bg-red-100 text-red-800'
    case 'ATRASO GRAVE':
      return 'bg-orange-100 text-orange-800'
    case 'SALIDA ANTICIPADA':
      return 'bg-yellow-100 text-yellow-800'
    case 'EXCEDIDO':
    case 'HORAS_EXTRA':
      return 'bg-blue-100 text-blue-800'
    case 'AUSENTE':
      return 'bg-gray-100 text-gray-800'
    case 'DIA_LIBRE':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getDiferenciaClass = (diferencia) => {
  if (diferencia.includes('+')) {
    return 'text-blue-600 font-medium'
  } else if (diferencia.includes('-')) {
    return 'text-red-600 font-medium'
  }
  return 'text-green-600 font-medium'
}

const cargarReporteConFiltros = async () => {
  try {
    cargandoDatos.value = true
    console.log('🔍 Cargando jornada diaria para empresa con rango de fechas:', {
      desde: filters.value.fechaDesde,
      hasta: filters.value.fechaHasta,
      empresaId: user.value?.empresa_id,
      rutEmpresa: user.value?.rut
    })
    
    // Llamar al backend usando useEmpresa
    const response = await obtenerReporteJornadaDiaria(
      filters.value.fechaDesde,
      filters.value.fechaHasta
    )
    console.log('📊 Datos recibidos de la API:', response)
    
    if (response) {
      if (response.trabajadores || response.marcacionesAgrupadasPorUsuario) {
        await loadData(response)
        console.log('✅ Datos cargados exitosamente:', registros.value.length, 'registros de jornada')
      } else {
        console.warn('⚠️ Estructura de datos no reconocida')
        loadData()
      }
    } else {
      console.warn('⚠️ No se recibieron datos válidos de la API')
      loadData()
    }
  } catch (error) {
    console.error('❌ Error al cargar reporte:', error)
  } finally {
    cargandoDatos.value = false
  }
}

const loadData = async (apiData = null) => {
  if (apiData && (apiData.trabajadores || apiData.marcacionesAgrupadasPorUsuario)) {
    const trabajadoresData = apiData.trabajadores || []
    const marcacionesData = apiData.marcacionesAgrupadasPorUsuario || {}

    const registrosProcessed = []
    
    for (const trabajador of trabajadoresData) {
      const datosTrabajador = marcacionesData[trabajador.id]
      
      if (datosTrabajador && datosTrabajador.marcaciones) {
        for (const [fechaISO, datosAsistencia] of Object.entries(datosTrabajador.marcaciones)) {
          const fecha = fechaISO
          
          const marcacionesArray = datosAsistencia.marcaciones || []
          const turno = datosAsistencia.turno
          const estadoAsistencia = datosAsistencia.estado_asistencia
          const atraso = datosAsistencia.atraso
          const salida = datosAsistencia.salida
          
          console.log(`📋 Turno para ${trabajador.usuario_nombre} en ${fecha}:`, turno)
        
          const marcacionEntrada = marcacionesArray.find(m => m.tipo === 'entrada')
          const marcacionSalida = marcacionesArray.find(m => m.tipo === 'salida')
          const colaciones = marcacionesArray.filter(m => m.tipo === 'colacion')
          
          // Obtener jornada pactada (hora inicio - hora fin)
          let jornadaPactada = 'N/A'
          let jornadaPactadaMinutos = 0
          if (turno && turno.hora_inicio && turno.hora_fin) {
            console.log(`⏰ Jornada pactada - Inicio: ${turno.hora_inicio}, Fin: ${turno.hora_fin}`)
            // Formatear las horas (quitar segundos si existen)
            const horaInicio = turno.hora_inicio.substring(0, 5)
            const horaFin = turno.hora_fin.substring(0, 5)
            jornadaPactada = `${horaInicio} - ${horaFin}`
            
            // Calcular minutos de jornada pactada para comparaciones
            const minutosInicio = convertirHoraAMinutos(turno.hora_inicio)
            const minutosFin = convertirHoraAMinutos(turno.hora_fin)
            jornadaPactadaMinutos = minutosFin - minutosInicio
            if (jornadaPactadaMinutos < 0) jornadaPactadaMinutos += 24 * 60
            
            console.log(`⏰ Jornada pactada: ${jornadaPactada} (${jornadaPactadaMinutos} minutos)`)
          } else {
            console.warn(`⚠️ No se pudo obtener jornada pactada - turno:`, turno)
          }
          
          // Calcular horas trabajadas y diferencias
          let tiempoExtra = null
          let tiempoFaltante = null
          let minutosReales = 0
          
          if (marcacionEntrada && marcacionSalida) {
            const minutosEntrada = convertirHoraAMinutos(marcacionEntrada.hora)
            const minutosSalida = convertirHoraAMinutos(marcacionSalida.hora)
            minutosReales = minutosSalida - minutosEntrada
            if (minutosReales < 0) minutosReales += 24 * 60
          }
          
          if (marcacionEntrada && marcacionSalida && turno && jornadaPactadaMinutos > 0) {
            const diferencia = minutosReales - jornadaPactadaMinutos
            
            if (diferencia > 0) {
              tiempoExtra = `+${convertirMinutosAHoras(diferencia)}`
            } else if (diferencia < 0) {
              tiempoFaltante = `-${convertirMinutosAHoras(Math.abs(diferencia))}`
            }
          }
          
          // Determinar cumplimiento con análisis de entrada/salida atrasada o anticipada
          let cumplimiento = 'INCOMPLETO'
          let entroMuyTarde = false
          let salioMuyAntes = false
          
          // Analizar si entró muy tarde o salió muy antes (tolerancia: 30 minutos)
          const TOLERANCIA_MINUTOS = 30
          
          if (turno && turno.hora_inicio && turno.hora_fin && marcacionEntrada && marcacionSalida) {
            const minutosInicioTurno = convertirHoraAMinutos(turno.hora_inicio)
            const minutosFinTurno = convertirHoraAMinutos(turno.hora_fin)
            const minutosEntradaReal = convertirHoraAMinutos(marcacionEntrada.hora)
            const minutosSalidaReal = convertirHoraAMinutos(marcacionSalida.hora)
            
            // Verificar si entró muy tarde (más de 30 minutos después)
            const atrasoEntrada = minutosEntradaReal - minutosInicioTurno
            if (atrasoEntrada > TOLERANCIA_MINUTOS) {
              entroMuyTarde = true
            }
            
            // Verificar si salió muy antes (más de 30 minutos antes)
            const anticipoSalida = minutosFinTurno - minutosSalidaReal
            if (anticipoSalida > TOLERANCIA_MINUTOS) {
              salioMuyAntes = true
            }
          }

          if (estadoAsistencia === 'NO_ASISTE' || estadoAsistencia === 'NO') {
            cumplimiento = 'AUSENTE'
          } else if (estadoAsistencia === 'PRESENTE') {
            // Si entró muy tarde Y salió muy antes = INCOMPLETO
            if (entroMuyTarde && salioMuyAntes) {
              cumplimiento = 'INCOMPLETO'
            }
            // Solo entró muy tarde
            else if (entroMuyTarde && !salioMuyAntes) {
              cumplimiento = 'ATRASO GRAVE'
            }
            // Solo salió muy antes
            else if (!entroMuyTarde && salioMuyAntes) {
              cumplimiento = 'SALIDA ANTICIPADA'
            }
            // Cumplimiento normal con horas extra
            else if (tiempoExtra) {
              cumplimiento = 'EXCEDIDO'
            }
            // Cumplimiento normal sin tiempo faltante
            else if (!tiempoFaltante) {
              cumplimiento = 'COMPLETO'
            }
            // Tiene tiempo faltante pero dentro de tolerancia
            else {
              cumplimiento = 'INCOMPLETO'
            }
          } else if (estadoAsistencia === 'INCOMPLETA_ENTRADA') {
            cumplimiento = 'SIN ENTRADA'
          } else if (estadoAsistencia === 'INCOMPLETA_SALIDA') {
            cumplimiento = 'SIN SALIDA'
          } else if (estadoAsistencia === 'DIA_LIBRE') {
            cumplimiento = 'DIA_LIBRE'
          }
          
          // Información de colación
          let colacionInicio = null
          let colacionFin = null
          let colacionPactada = turno?.duracion_colacion || '01:00:00'
          
          if (colaciones.length >= 2) {
            colacionInicio = colaciones[0].hora
            colacionFin = colaciones[1].hora
          }
          
          registrosProcessed.push({
            id: `${trabajador.id}-${fecha}`,
            trabajador_id: trabajador.id,
            usuario_id: trabajador.usuario_id,
            nombre: `${trabajador.usuario_nombre} ${trabajador.usuario_apellido_pat} ${trabajador.usuario_apellido_mat}`.trim(),
            cedula: trabajador.usuario_rut,
            iniciales: `${trabajador.usuario_nombre[0]}${trabajador.usuario_apellido_pat[0]}`.toUpperCase(),
            cargo: trabajador.rol_en_empresa || 'Trabajador',
            turno: turno ? `${turno.tipo_turno_nombre}` : 'Sin turno',
            fecha: fecha,
            jornadaPactada: jornadaPactada,
            jornadaPactadaMinutos: jornadaPactadaMinutos,
            entrada: marcacionEntrada ? marcacionEntrada.hora : 'N/A',
            salida: marcacionSalida ? marcacionSalida.hora : 'N/A',
            colacionPactada: colacionPactada,
            colacionInicio: colacionInicio,
            colacionFin: colacionFin,
            tiempoExtra: tiempoExtra,
            tiempoFaltante: tiempoFaltante,
            horasEfectivas: minutosReales > 0 ? convertirMinutosAHoras(minutosReales) : '00:00:00',
            cumplimiento: cumplimiento,
            observaciones: atraso || salida || '',
            otrasMarcaciones: marcacionesArray.filter(m => m.tipo !== 'entrada' && m.tipo !== 'salida' && m.tipo !== 'colacion')
          })
        }
      }
    }
    
    registros.value = registrosProcessed
    console.log('✅ Registros procesados:', registros.value.length)
  } else {
    // Sin datos
    registros.value = []
  }
}

// Funciones auxiliares
const convertirHoraAMinutos = (hora) => {
  if (!hora) return 0
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

const convertirMinutosAHoras = (minutos) => {
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  
  try {
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [anio, mes, dia] = fecha.split('-')
      return `${dia}/${mes}/${anio.slice(-2)}`
    }
    
    const date = new Date(fecha)
    const dia = date.getUTCDate().toString().padStart(2, '0')
    const mes = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const año = date.getUTCFullYear().toString().slice(-2)
    return `${dia}/${mes}/${año}`
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return 'N/A'
  }
}

const formatearRut = (rut) => {
  if (!rut) return 'Sin RUT'
  const rutLimpio = rut.replace(/[.-]/g, '')
  if (rutLimpio.length >= 7) {
    const cuerpo = rutLimpio.slice(0, -1)
    const dv = rutLimpio.slice(-1)
    return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
  }
  return rut
}

const getIniciales = (nombre) => {
  if (!nombre) return '??'
  const partes = nombre.split(' ')
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

const calcularHorasEfectivas = (registro) => {
  if (registro.entrada === 'N/A' || registro.salida === 'N/A') return '00:00:00'
  
  const minutosEntrada = convertirHoraAMinutos(registro.entrada)
  const minutosSalida = convertirHoraAMinutos(registro.salida)
  let diferencia = minutosSalida - minutosEntrada
  if (diferencia < 0) diferencia += 24 * 60
  
  return convertirMinutosAHoras(diferencia)
}

const formatearDuracion = (minutos) => {
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  
  if (mins === 0) {
    return `${horas} hrs`
  } else {
    return `${horas} hrs ${mins} min`
  }
}

const applyFilters = async () => {
  await cargarReporteConFiltros()
}

const clearFilters = () => {
  filters.value = {
    trabajadorNombre: '',
    fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    periodoRapido: 'semana'
  }
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
    
    case 'mes':
      const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)
      filters.value.fechaDesde = primerDiaMesAnterior.toISOString().split('T')[0]
      filters.value.fechaHasta = ultimoDiaMesAnterior.toISOString().split('T')[0]
      break
  }
}

const exportarPDF = () => {
  alert('Exportación a PDF - Funcionalidad en desarrollo\nDatos filtrados: ' + filteredData.value.length + ' registros')
}

const exportarExcel = () => {
  alert('Exportación a Excel - Funcionalidad en desarrollo\nDatos filtrados: ' + filteredData.value.length + ' registros')
}

onMounted(async () => {
  try {
    console.log('🚀 Iniciando componente ReporteJornadaDiaria para empresa')
    console.log('👤 Usuario actual:', user.value)
    await cargarReporteConFiltros()
  } catch (error) {
    console.error('❌ Error al inicializar componente:', error)
    await loadData()
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
