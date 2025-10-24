<template>
  <div class="min-h-screen bg-gray-50">

    
    <!-- Main Content -->
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reporte Jornada Diaria</h1>
          <p class="mt-2 text-gray-600">Control de horas trabajadas y cumplimiento de jornada laboral según normativa</p>
        </div>

        <!-- Encabezado Legal Requerido -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">📋 Información Legal del Reporte</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Información de la Empresa -->
              <div class="space-y-3">
                <h4 class="font-medium text-gray-800 border-b pb-2">Datos de la Empresa</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-600">Razón Social:</span>
                    <span class="text-gray-900">{{ encabezado.razonSocial }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-600">RUT Empresa:</span>
                    <span class="text-gray-900">{{ encabezado.rutEmpresa }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-600">Lugar de Trabajo:</span>
                    <span class="text-gray-900">{{ encabezado.lugarTrabajo }}</span>
                  </div>
                </div>
              </div>

              <!-- Información del Trabajador -->
              <div class="space-y-3">
                <h4 class="font-medium text-gray-800 border-b pb-2">Datos del Trabajador</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-600">Nombre Completo:</span>
                    <span class="text-gray-900">{{ encabezado.nombreTrabajador }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-600">RUT Trabajador:</span>
                    <span class="text-gray-900">{{ encabezado.rutTrabajador }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-600">Banda Horaria:</span>
                    <span class="text-gray-900" :class="encabezado.bandaHoraria ? 'text-blue-600' : 'text-gray-500'">
                      {{ encabezado.bandaHoraria || 'No Aplica' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros Avanzados (Art. 25) -->
        <div class="bg-white shadow-md rounded-lg mb-6">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-xl font-semibold text-gray-900">Filtros de Consulta</h3>
                  <p class="text-sm text-gray-500">Según Art. 25 - Registro de jornada diaria</p>
                </div>
              </div>
              <button 
                @click="mostrarFiltros = !mostrarFiltros"
                class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg 
                  class="w-5 h-5 mr-2 transition-transform duration-200" 
                  :class="{ 'rotate-180': !mostrarFiltros }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                <span class="text-sm font-medium">
                  {{ mostrarFiltros ? 'Ocultar' : 'Mostrar' }} Filtros
                </span>
              </button>
            </div>
          </div>
          
          <div 
            v-show="mostrarFiltros" 
            class="px-6 pb-6 transition-all duration-300"
          >
            <!-- Indicador de carga de filtros -->
            <div v-if="cargandoFiltros" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span class="ml-3 text-gray-600">Cargando opciones de filtro...</span>
            </div>

            <!-- Contenido de filtros -->
            <div v-else">
            
            <!-- Fila 1: Búsqueda de Trabajadores y Tipo de Jornada -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Búsqueda de Trabajadores -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  👤 Búsqueda por Trabajador
                </label>
                <input 
                  v-model="filters.trabajadorNombre" 
                  type="text" 
                  placeholder="Buscar por nombre o apellido..."
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                <input 
                  v-model="filters.trabajadorRut" 
                  type="text" 
                  placeholder="Buscar por RUT (ej: 12.345.678-9)"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                <!-- Búsqueda grupal -->
                <div v-if="empleadosDisponibles.length > 10" class="mt-2">
                  <button 
                    @click="mostrarSelectorGrupal = !mostrarSelectorGrupal"
                    class="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between transition-all"
                  >
                    <span class="text-sm font-medium text-blue-700">
                      👥 Selección múltiple
                    </span>
                    <span class="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      {{ trabajadoresSeleccionados.length }} seleccionados
                    </span>
                  </button>
                  <div v-if="mostrarSelectorGrupal" class="mt-2 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden bg-white">
                    <div class="p-3 border-b bg-gray-50 sticky top-0 z-10">
                      <input 
                        v-model="busquedaGrupal" 
                        placeholder="🔍 Buscar trabajadores..."
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                    </div>
                    <div class="overflow-y-auto max-h-44">
                      <label 
                        v-for="empleado in empleadosFiltrados" 
                        :key="empleado.id" 
                        class="flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <input 
                          type="checkbox" 
                          :value="empleado.id" 
                          v-model="trabajadoresSeleccionados"
                          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        >
                        <span class="ml-3 text-sm text-gray-700 flex-1">
                          <span class="font-medium">{{ empleado.nombre }}</span>
                          <span class="text-gray-500 ml-2">({{ empleado.cedula }})</span>
                          <span v-if="empleado.es_est" class="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            EST: {{ empleado.empresa_nombre }}
                          </span>
                          <span v-else class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Directo
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Tipo de Jornada -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  📋 Tipo de Jornada
                </label>
                <select 
                  v-model="filters.tipoJornada" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todos los tipos de jornada</option>
                  <option v-for="jornada in tiposJornadaDB" :key="jornada.id" :value="jornada.id">
                    {{ jornada.nombre }} - {{ jornada.descripcion }}
                  </option>
                </select>
                
                <label class="block text-sm font-semibold text-gray-700 mt-4">
                  🏢 Lugar de Trabajo
                </label>
                <select 
                  v-model="filters.lugarTrabajo" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todos los lugares</option>
                  <option v-for="lugar in lugaresDB" :key="lugar.lugar_id" :value="lugar.lugar_id">
                    {{ lugar.nombre }} - {{ lugar.ciudad }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Fila 2: Período y Turnos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Período -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  📅 Período de Consulta
                </label>
                <div class="grid grid-cols-2 gap-2 mb-3">
                  <button 
                    @click="setPeriodoRapido('semana')" 
                    :class="filters.periodoRapido === 'semana' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    class="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    Última Semana
                  </button>
                  <button 
                    @click="setPeriodoRapido('quincena')" 
                    :class="filters.periodoRapido === 'quincena' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    class="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    Quincena
                  </button>
                  <button 
                    @click="setPeriodoRapido('mes')" 
                    :class="filters.periodoRapido === 'mes' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    class="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    Mes Anterior
                  </button>
                  <button 
                    @click="setPeriodoRapido('trimestre')" 
                    :class="filters.periodoRapido === 'trimestre' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    class="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    Trimestre
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Fecha Desde</label>
                    <input 
                      v-model="filters.fechaDesde" 
                      type="date" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Fecha Hasta</label>
                    <input 
                      v-model="filters.fechaHasta" 
                      type="date" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                  </div>
                </div>
              </div>
              
              <!-- Turnos -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  ⏰ Turno y Horario
                </label>
                <select 
                  v-model="filters.turnoEspecifico" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todos los turnos</option>
                  <option v-for="turno in turnosDB" :key="turno.id" :value="turno.id">
                    {{ turno.nombre }} ({{ turno.hora_inicio?.substring(0,5) }} - {{ turno.hora_fin?.substring(0,5) }})
                  </option>
                </select>
                
                <label class="block text-sm font-semibold text-gray-700 mt-4">
                  🏛️ Cargo/Rol
                </label>
                <select 
                  v-model="filters.cargo" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todos los cargos</option>
                  <option v-for="rol in rolesDB" :key="rol" :value="rol">
                    {{ rol }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Fila 3: Ubicación y Organización -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Ubicación -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  📍 Ubicación Geográfica
                </label>
                <select 
                  v-model="filters.region" 
                  @change="filtrarLocalesPorRegion"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todas las regiones</option>
                  <option v-for="region in regionesDB" :key="region" :value="region">
                    {{ region }}
                  </option>
                </select>
                
                <select 
                  v-model="filters.establecimiento" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todos los establecimientos</option>
                  <option v-for="local in localesFiltrados" :key="local.lugar_id" :value="local.lugar_id">
                    {{ local.nombre }} - {{ local.ciudad || local.comuna }}
                  </option>
                </select>
              </div>
              
              <!-- Organización -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  💼 Organización
                </label>
                
                <select 
                  v-model="filters.empresaTransitoria" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Personal directo + EST</option>
                  <option value="directos">Solo Personal Directo</option>
                  <option v-if="empresaEstDB" :value="empresaEstDB.empresa_id">
                    EST: {{ empresaEstDB.emp_nombre }}
                  </option>
                </select>
                
                <label class="block text-sm font-semibold text-gray-700 mt-4">
                  ✅ Cumplimiento de Jornada
                </label>
                <select 
                  v-model="filters.cumplimiento" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todos los cumplimientos</option>
                  <option value="COMPLETO">✅ Jornada Completa</option>
                  <option value="INCOMPLETO">❌ Jornada Incompleta</option>
                  <option value="EXCEDIDO">📈 Jornada Excedida</option>
                  <option value="AUSENTE">⭕ Ausente</option>
                  <option value="DIA_LIBRE">🏖️ Día Libre</option>
                </select>
              </div>
            </div>

            <!-- Fila 4: Estado y Hash -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  ✅ Estado de Asistencia
                </label>
                <select 
                  v-model="filters.estado" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="PRESENTE">✅ Presente</option>
                  <option value="AUSENTE">❌ Ausente</option>
                  <option value="TARDANZA">⚠️ Tardanza</option>
                  <option value="AUSENCIA_JUSTIFICADA">📝 Ausencia Justificada</option>
                  <option value="LICENCIA_MEDICA">🏥 Licencia Médica</option>
                </select>
              </div>
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">
                  🔐 Código Hash/Checksum
                </label>
                <input 
                  v-model="filters.hashChecksum" 
                  type="text" 
                  placeholder="Ingrese código de verificación..."
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                >
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button 
                @click="applyFilters" 
                class="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Aplicar Filtros
              </button>
              <button 
                @click="clearFilters" 
                class="inline-flex items-center px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all shadow-sm font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Limpiar
              </button>
              <div class="border-l border-gray-300 mx-2"></div>
              <button 
                @click="exportarPDF" 
                class="inline-flex items-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm font-medium"
              >
                📄 PDF
              </button>
              <button 
                @click="exportarWord" 
                class="inline-flex items-center px-4 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-all shadow-sm font-medium"
              >
                📝 Word
              </button>
              <button 
                @click="exportarExcel" 
                class="inline-flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm font-medium"
              >
                📊 Excel
              </button>
            </div>
            </div>
            <!-- Fin del contenido de filtros -->
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Jornada Completa</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.jornadaCompleta }}</p>
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
                <p class="text-sm font-medium text-gray-600">Jornada Incompleta</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.jornadaIncompleta }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Horas Extras</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.horasExtras }}</p>
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
                <p class="text-sm font-medium text-gray-600">Promedio Horas</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.promedioHoras }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Registro Detallado de Jornada Laboral</h3>
                <p class="mt-2 text-sm text-gray-700">Control diario según normativa laboral vigente</p>
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
            
            <!-- Tabla Principal -->
            <div class="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[90px]">
                      Fecha<br/><span class="text-xs font-normal">(dd/mm/aa)</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[180px]">
                      Trabajador<br/><span class="text-xs font-normal">Nombre y RUT</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[100px]">
                      Jornada Ordinaria<br/><span class="text-xs font-normal">Pactada</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[120px]">
                      Marcaciones Jornada<br/><span class="text-xs font-normal">Inicio/Fin</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[100px]">
                      Colación<br/><span class="text-xs font-normal">Pactada</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[120px]">
                      Marcaciones<br/><span class="text-xs font-normal">Colación</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[100px]">
                      Tiempo<br/><span class="text-xs font-normal text-red-600">Faltante (-)</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[100px]">
                      Tiempo<br/><span class="text-xs font-normal text-blue-600">Extra (+)</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[120px]">
                      Otras<br/><span class="text-xs font-normal">Marcaciones</span>
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[120px]">
                      Observaciones
                    </th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[120px]">
                      Distribución<br/><span class="text-xs font-normal">Excepcional</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <!-- Registros diarios -->
                  <tr v-for="registro in filteredData" :key="registro.id" class="hover:bg-gray-50">
                    <!-- 1. Fecha -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ formatearFecha(registro.fecha) }}
                    </td>
                    
                    <!-- 2. Trabajador -->
                    <td class="px-3 py-4 text-sm text-gray-900">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span class="text-xs font-medium text-blue-600">{{ registro.iniciales }}</span>
                          </div>
                        </div>
                        <div class="ml-3">
                          <p class="font-medium text-gray-900">{{ registro.nombre }}</p>
                          <p class="text-xs text-gray-500">{{ formatearRut(registro.cedula) }}</p>
                        </div>
                      </div>
                    </td>
                    
                    <!-- 3. Jornada Ordinaria Pactada -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div v-if="registro.turno_info" class="space-y-1">
                        <div class="text-xs text-gray-500">
                          {{ registro.turno_info.hora_inicio?.substring(0, 5) }} - {{ registro.turno_info.hora_fin?.substring(0, 5) }}
                        </div>
                        <div class="font-mono font-medium">
                          {{ registro.jornadaPactada }}
                        </div>
                      </div>
                      <div v-else class="font-mono">
                        {{ registro.jornadaPactada }}
                      </div>
                    </td>
                    
                    <!-- 3. Marcaciones Jornada (Inicio/Fin) -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div class="space-y-1">
                        <div class="flex items-center">
                          <span class="w-8 text-xs text-gray-500">In:</span>
                          <span class="font-mono">{{ registro.entrada }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="w-8 text-xs text-gray-500">Out:</span>
                          <span class="font-mono">{{ registro.salida }}</span>
                        </div>
                      </div>
                    </td>
                    
                    <!-- 4. Colación Pactada -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-mono">
                      {{ registro.colacionPactada }}
                    </td>
                    
                    <!-- 5. Marcaciones Colación -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div v-if="registro.colacionInicio && registro.colacionFin" class="space-y-1">
                        <div class="flex items-center">
                          <span class="w-8 text-xs text-gray-500">In:</span>
                          <span class="font-mono">{{ registro.colacionInicio }}</span>
                        </div>
                        <div class="flex items-center">
                          <span class="w-8 text-xs text-gray-500">Out:</span>
                          <span class="font-mono">{{ registro.colacionFin }}</span>
                        </div>
                      </div>
                      <div v-else class="text-center text-gray-500 italic">
                        No Aplica
                      </div>
                    </td>
                    
                    <!-- 6. Tiempo Faltante -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-center font-mono">
                      <span v-if="registro.tiempoFaltante" class="text-red-600 font-medium">
                        {{ registro.tiempoFaltante }}
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    
                    <!-- 7. Tiempo Extra -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-center font-mono">
                      <span v-if="registro.tiempoExtra" class="text-blue-600 font-medium">
                        {{ registro.tiempoExtra }}
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    
                    <!-- 8. Otras Marcaciones -->
                    <td class="px-3 py-4 text-sm text-gray-900">
                      <div v-if="registro.otrasMarcaciones && registro.otrasMarcaciones.length > 0" class="space-y-1">
                        <div v-for="(marca, index) in registro.otrasMarcaciones" :key="index" class="text-xs">
                          <span class="font-medium">{{ marca.tipo }}:</span>
                          <span class="font-mono ml-1">{{ marca.horario }}</span>
                        </div>
                      </div>
                      <div v-else class="text-center text-gray-500 italic text-xs">
                        Sin registros
                      </div>
                    </td>
                    
                    <!-- 9. Observaciones -->
                    <td class="px-3 py-4 text-sm text-gray-900">
                      <div v-if="registro.observaciones" class="max-w-xs">
                        <p class="text-xs leading-relaxed">{{ registro.observaciones }}</p>
                      </div>
                      <div v-else class="text-center text-gray-500 italic text-xs">
                        Sin observaciones
                      </div>
                    </td>
                    
                    <!-- 10. Distribución Excepcional -->
                    <td class="px-3 py-4 text-sm text-gray-900">
                      <div v-if="registro.distribucionExcepcional" class="max-w-xs">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {{ registro.distribucionExcepcional }}
                        </span>
                      </div>
                      <div v-else class="text-center text-gray-500 italic text-xs">
                        No Aplica
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Fila de Totales Semanales -->
                  <tr v-if="totalesSemanales" class="bg-blue-50 border-t-2 border-blue-200">
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-bold text-blue-900" colspan="2">
                      TOTALES SEMANALES
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-900 text-center">
                      {{ totalesSemanales.jornadaPactadaTotal }}
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-900 text-center">
                      {{ totalesSemanales.horasTrabajadasTotal }}
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-900 text-center">
                      {{ totalesSemanales.colacionTotal }}
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-blue-900 text-center">
                      -
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-mono font-bold text-center">
                      <span v-if="totalesSemanales.tiempoFaltanteTotal" class="text-red-600">
                        {{ totalesSemanales.tiempoFaltanteTotal }}
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-mono font-bold text-center">
                      <span v-if="totalesSemanales.tiempoExtraTotal" class="text-blue-600">
                        {{ totalesSemanales.tiempoExtraTotal }}
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="px-3 py-4 text-sm font-bold text-blue-900 text-center">
                      {{ totalesSemanales.otrasMarcacionesCount }} registros
                    </td>
                    <td class="px-3 py-4 text-sm font-bold text-blue-900 text-center">
                      RESUMEN SEMANAL
                    </td>
                    <td class="px-3 py-4 text-sm font-bold text-blue-900 text-center">
                      <div class="flex items-center justify-center space-x-2">
                        <span v-if="totalesSemanales.balancePositivo" class="text-green-600 font-bold">✓</span>
                        <span v-if="totalesSemanales.balanceNegativo" class="text-red-600 font-bold">⚠</span>
                        <span class="text-xs">{{ totalesSemanales.balance }}</span>
                      </div>
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
import { useReportes } from '../../composables/useReportes'

const { obtenerReporteAsistencia, obtenerDatosParaFiltros } = useReportes()

const filters = ref({
  trabajadorNombre: '',
  trabajadorRut: '',
  tipoJornada: '',
  turnoEspecifico: '',
  lugarTrabajo: '',
  fechaDesde: new Date().toISOString().split('T')[0],
  fechaHasta: new Date().toISOString().split('T')[0],
  periodoRapido: '',
  region: '',
  establecimiento: '',
  cargo: '',
  empresaTransitoria: '',
  hashChecksum: '',
  estado: '',
  departamento: '',
  cumplimiento: '' // Mantener para compatibilidad con la vista actual
})

const registros = ref([])

// Control de visibilidad de filtros
const mostrarFiltros = ref(true)
const cargandoFiltros = ref(true)

// Nuevas variables para búsqueda grupal
const mostrarSelectorGrupal = ref(false)
const busquedaGrupal = ref('')
const trabajadoresSeleccionados = ref([])

const empleadosDisponibles = ref([]) // Lista completa para búsqueda grupal

// Datos dinámicos desde la API
const tiposJornadaDB = ref([])
const lugaresDB = ref([])
const turnosDB = ref([])
const rolesDB = ref([])
const regionesDB = ref([])
const comunasDB = ref([])
const trabajadoresDB = ref([])
const empresaEstDB = ref(null)

const establecimientos = ref([]) // Lista de establecimientos por región

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
    // Si no hay región seleccionada, mostrar todos los lugares
    return lugaresDB.value
  }
  // Filtrar lugares por región seleccionada
  return lugaresDB.value.filter(lugar => lugar.region === filters.value.region)
})

// Datos del encabezado legal requerido
const encabezado = ref({
  razonSocial: 'TELEMEDIOS S.A.',
  rutEmpresa: '96.789.123-4',
  nombreTrabajador: 'Sin seleccionar',
  rutTrabajador: 'Sin seleccionar',
  lugarTrabajo: 'Oficina Central Santiago',
  bandaHoraria: 'Turno Mañana (08:00 - 17:00)'
})

// Computed para totales semanales
const totalesSemanales = computed(() => {
  const data = filteredData.value
  if (data.length === 0) return null
  
  // Calcular total jornada pactada
  const totalJornadaPactada = data.reduce((sum, r) => {
    if (r.jornadaPactada && r.jornadaPactada !== '00:00') {
      return sum + convertirHoraAMinutos(r.jornadaPactada)
    }
    return sum
  }, 0)
  
  // Calcular total horas trabajadas
  const totalHorasTrabajadas = data.reduce((sum, r) => {
    if (r.entrada !== 'N/A' && r.salida !== 'N/A') {
      const entrada = convertirHoraAMinutos(r.entrada)
      const salida = convertirHoraAMinutos(r.salida)
      let diferencia = salida - entrada
      if (diferencia < 0) diferencia += 24 * 60 // Ajuste para turnos nocturnos
      return sum + diferencia
    }
    return sum
  }, 0)
  
  // Calcular total colación pactada
  const totalColacion = data.reduce((sum, r) => {
    if (r.colacionPactada) {
      return sum + convertirHoraAMinutos(r.colacionPactada)
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
  
  const otrasMarcacionesCount = data.reduce((sum, r) => sum + (r.otrasMarcaciones?.length || 0), 0)
  const balance = totalExtra > totalFaltante ? 'Positivo' : totalFaltante > totalExtra ? 'Negativo' : 'Equilibrado'
  
  return {
    jornadaPactadaTotal: convertirMinutosAHoras(totalJornadaPactada),
    horasTrabajadasTotal: convertirMinutosAHoras(totalHorasTrabajadas),
    colacionTotal: convertirMinutosAHoras(totalColacion),
    tiempoFaltanteTotal: totalFaltante > 0 ? `-${convertirMinutosAHoras(totalFaltante)}` : null,
    tiempoExtraTotal: totalExtra > 0 ? `+${convertirMinutosAHoras(totalExtra)}` : null,
    otrasMarcacionesCount,
    balance,
    balancePositivo: balance === 'Positivo',
    balanceNegativo: balance === 'Negativo'
  }
})

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
    jornadaIncompleta: data.filter(r => r.cumplimiento === 'INCOMPLETO' || r.cumplimiento === 'AUSENTE').length,
    horasExtras: horasExtrasTotales.toFixed(1),
    promedioHoras: promedioHoras
  }
})

const filteredData = computed(() => {
  let data = registros.value
  
  // Filtro por trabajadores seleccionados grupalmente
  if (trabajadoresSeleccionados.value.length > 0) {
    data = data.filter(r => 
      trabajadoresSeleccionados.value.includes(r.trabajador_id) || 
      trabajadoresSeleccionados.value.includes(r.usuario_id)
    )
  }
  
  // Filtro por nombre o apellido del trabajador
  if (filters.value.trabajadorNombre) {
    const nombre = filters.value.trabajadorNombre.toLowerCase()
    data = data.filter(r => r.nombre.toLowerCase().includes(nombre))
  }
  
  // Filtro por RUT
  if (filters.value.trabajadorRut) {
    data = data.filter(r => r.cedula && r.cedula.includes(filters.value.trabajadorRut.replace(/[.-]/g, '')))
  }
  
  // Filtro por tipo de jornada
  if (filters.value.tipoJornada) {
    data = data.filter(r => r.tipoJornada === filters.value.tipoJornada)
  }
  
  // Filtro por turno específico
  if (filters.value.turnoEspecifico) {
    // Obtener el nombre del turno seleccionado sin paréntesis ni su contenido
    const turnoSeleccionado = turnosDB.value.find(t => t.id === filters.value.turnoEspecifico)
    if (turnoSeleccionado) {
      const nombreTurnoSinParentesis = turnoSeleccionado.nombre.split('(')[0].trim()
      // Filtrar comparando solo el nombre del turno sin paréntesis
      data = data.filter(r => {
        const nombreTurnoSinParentesis_r = r.turno.split('(')[0].trim()
        return nombreTurnoSinParentesis_r === nombreTurnoSinParentesis
      })
    }
  }
  
  // Filtro por lugar de trabajo
  if (filters.value.lugarTrabajo) {
    data = data.filter(r => r.lugar === filters.value.lugarTrabajo || r.lugarTrabajo === filters.value.lugarTrabajo)
  }
  
  // Filtro por región
  if (filters.value.region) {
    data = data.filter(r => r.region === filters.value.region)
  }
  
  // Filtro por establecimiento
  if (filters.value.establecimiento) {
    data = data.filter(r => r.establecimiento === filters.value.establecimiento)
  }
  
  // Filtro por cargo
  if (filters.value.cargo) {
    data = data.filter(r => r.cargo === filters.value.cargo)
  }
  
  // Filtro por empresa transitoria
  if (filters.value.empresaTransitoria) {
    if (filters.value.empresaTransitoria === 'directos') {
      data = data.filter(r => !r.es_est)
    } else {
      // Filtrar por ID de empresa EST (empleadora)
      data = data.filter(r => 
        r.empresaEmpleadora === filters.value.empresaTransitoria || 
        r.empresa_est_id === filters.value.empresaTransitoria ||
        (r.es_est && String(r.empresa_id) === String(filters.value.empresaTransitoria))
      )
    }
  }
  
  // Filtro por código hash
  if (filters.value.hashChecksum) {
    data = data.filter(r => r.hashChecksum && r.hashChecksum.includes(filters.value.hashChecksum))
  }
  
  // Filtro por departamento
  if (filters.value.departamento) {
    data = data.filter(r => r.departamento === filters.value.departamento)
  }
  
  // Filtro por estado
  if (filters.value.estado) {
    data = data.filter(r => r.estadoAsistencia === filters.value.estado || r.estado === filters.value.estado)
  }
  
  // Filtro por cumplimiento
  if (filters.value.cumplimiento) {
    data = data.filter(r => r.cumplimiento === filters.value.cumplimiento)
  }
  
  // Filtro por rango de fechas
  if (filters.value.fechaDesde && filters.value.fechaHasta) {
    data = data.filter(r => {
      if (!r.fecha) return false
      const fechaRegistro = new Date(r.fecha)
      const fechaDesde = new Date(filters.value.fechaDesde)
      const fechaHasta = new Date(filters.value.fechaHasta)
      // Normalizar las fechas a medianoche para comparar solo días
      fechaRegistro.setHours(0, 0, 0, 0)
      fechaDesde.setHours(0, 0, 0, 0)
      fechaHasta.setHours(23, 59, 59, 999)
      return fechaRegistro >= fechaDesde && fechaRegistro <= fechaHasta
    })
  }
  
  return data
})

const getCumplimientoClass = (cumplimiento) => {
  switch (cumplimiento) {
    case 'COMPLETO':
      return 'bg-green-100 text-green-800'
    case 'INCOMPLETO':
      return 'bg-red-100 text-red-800'
    case 'EXCEDIDO':
      return 'bg-blue-100 text-blue-800'
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

// Control de carga
const cargandoDatos = ref(false)

const cargarReporteConFiltros = async () => {
  try {
    cargandoDatos.value = true
    console.log('🔍 Cargando jornada diaria con rango de fechas:', {
      desde: filters.value.fechaDesde,
      hasta: filters.value.fechaHasta
    })
    
    // Solo enviar filtros de fecha al backend
    const filtrosBackend = {
      fecha_inicio: filters.value.fechaDesde,
      fecha_fin: filters.value.fechaHasta
    }
    
    // Llamar al backend (mismo servicio que ReporteAsistencia)
    const rest = await obtenerReporteAsistencia(filtrosBackend)
    console.log('📊 Datos recibidos de la API:', rest.data)
    
    // Verificar si la respuesta tiene la estructura esperada
    if (rest?.data) {
      if (rest.data.trabajadores || rest.data.marcacionesAgrupadasPorUsuario) {
        await loadData(rest.data)
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
    // Nueva estructura: { trabajadores: [], marcacionesAgrupadasPorUsuario: {}, configuracion: {} }
    const trabajadoresData = apiData.trabajadores || []
    const marcacionesData = apiData.marcacionesAgrupadasPorUsuario || {}
    const configuracion = apiData.configuracion || {}
    
    console.log('📦 Procesando trabajadores:', trabajadoresData.length)
    console.log('📦 Procesando marcaciones:', Object.keys(marcacionesData).length)
    
    // Procesar cada trabajador con sus marcaciones
    const registrosProcessed = []
    
    for (const trabajador of trabajadoresData) {
      const datosTrabajador = marcacionesData[trabajador.id]
      
      if (datosTrabajador && datosTrabajador.marcaciones) {
        // Procesar cada fecha con datos de asistencia
        for (const [fechaISO, datosAsistencia] of Object.entries(datosTrabajador.marcaciones)) {
          const fecha = fechaISO // Ya viene en formato YYYY-MM-DD
          
          const marcacionesArray = datosAsistencia.marcaciones || []
          const turno = datosAsistencia.turno
          const estadoAsistencia = datosAsistencia.estado_asistencia
          const atraso = datosAsistencia.atraso
          const salida = datosAsistencia.salida
          
          // Buscar marcaciones específicas
          const marcacionEntrada = marcacionesArray.find(m => m.tipo === 'entrada')
          const marcacionSalida = marcacionesArray.find(m => m.tipo === 'salida')
          const colaciones = marcacionesArray.filter(m => m.tipo === 'colacion')
          const descansos = marcacionesArray.filter(m => m.tipo === 'descanso')
          
          // Calcular jornada pactada desde el turno
          let jornadaPactada = '00:00'
          if (turno && turno.hora_inicio && turno.hora_fin) {
            const minutosJornada = convertirHoraAMinutos(turno.hora_fin) - convertirHoraAMinutos(turno.hora_inicio)
            jornadaPactada = convertirMinutosAHoras(minutosJornada)
          }
          
          // Calcular horas trabajadas y tiempo extra/faltante
          let tiempoExtra = null
          let tiempoFaltante = null
          let minutosReales = 0
          
          if (marcacionEntrada && marcacionSalida) {
            minutosReales = convertirHoraAMinutos(marcacionSalida.hora) - convertirHoraAMinutos(marcacionEntrada.hora)
            // Ajuste para turnos nocturnos
            if (minutosReales < 0) minutosReales += 24 * 60
          }
          
          if (marcacionEntrada && marcacionSalida && turno) {
            const minutosPactados = convertirHoraAMinutos(turno.hora_fin) - convertirHoraAMinutos(turno.hora_inicio)
            const diferencia = minutosReales - minutosPactados
            
            // Tolerancia de 15 minutos
            if (diferencia > 15) {
              tiempoExtra = `+${convertirMinutosAHoras(diferencia)}`
            } else if (diferencia < -15) {
              tiempoFaltante = `-${convertirMinutosAHoras(Math.abs(diferencia))}`
            }
          }
          
          // Determinar cumplimiento
          let cumplimiento = 'INCOMPLETO'
          if (estadoAsistencia === 'NO_ASISTE') {
            cumplimiento = 'AUSENTE'
            if (turno) {
              const minutosPactados = convertirHoraAMinutos(turno.hora_fin) - convertirHoraAMinutos(turno.hora_inicio)
              tiempoFaltante = `-${convertirMinutosAHoras(minutosPactados)}`
            }
          } else if (estadoAsistencia === 'PRESENTE') {
            if (tiempoExtra) {
              cumplimiento = 'EXCEDIDO'
            } else if (!tiempoFaltante) {
              cumplimiento = 'COMPLETO'
            }
          } else if (estadoAsistencia === 'DIA_LIBRE') {
            cumplimiento = 'DIA_LIBRE'
          }
          
          // Obtener información del lugar
          let lugarInfo = null
          let lugarNombre = 'No especificado'
          let lugarRegion = 'N/A'
          let lugarEstablecimiento = 'N/A'
          if (marcacionEntrada?.lugar_id || marcacionSalida?.lugar_id) {
            const lugarId = marcacionEntrada?.lugar_id || marcacionSalida?.lugar_id
            lugarInfo = lugaresDB.value.find(l => l.lugar_id === lugarId)
            if (lugarInfo) {
              lugarNombre = `${lugarInfo.nombre}, ${lugarInfo.ciudad || lugarInfo.comuna}`
              lugarRegion = lugarInfo.region || 'N/A'
              lugarEstablecimiento = lugarInfo.nombre || 'N/A'
            }
          }
          
          // Crear observaciones basadas en atrasos y salidas
          let observaciones = ''
          if (atraso) {
            if (atraso.atrasado) {
              observaciones += `Tardanza de ${atraso.minutos_atraso} min. `
            } else if (atraso.llego_antes) {
              observaciones += `Llegó ${atraso.minutos_anticipacion} min antes. `
            }
          }
          if (salida) {
            if (salida.salida_anticipada) {
              observaciones += `Salida anticipada ${salida.minutos_anticipados} min. `
            }
          }
          if (estadoAsistencia === 'NO_ASISTE') {
            observaciones += 'NO ASISTIÓ. '
          }
          if (!marcacionEntrada && estadoAsistencia !== 'NO_ASISTE' && estadoAsistencia !== 'DIA_LIBRE') {
            observaciones += 'Sin marcación de entrada. '
          }
          if (!marcacionSalida && marcacionEntrada) {
            observaciones += 'Sin marcación de salida (En curso). '
          }
          if (!observaciones && estadoAsistencia === 'PRESENTE') {
            observaciones = 'Jornada normal sin novedades'
          }
          
          // Otras marcaciones (colaciones, descansos)
          const otrasMarcaciones = []
          
          colaciones.forEach((col, idx) => {
            otrasMarcaciones.push({
              tipo: `Colación ${idx + 1}`,
              horario: col.hora.substring(0, 5)
            })
          })
          
          descansos.forEach((desc, idx) => {
            otrasMarcaciones.push({
              tipo: `Descanso ${idx + 1}`,
              horario: desc.hora.substring(0, 5)
            })
          })
          
          registrosProcessed.push({
            id: `${trabajador.id}-${fecha}`,
            trabajador_id: trabajador.id,
            usuario_id: trabajador.usuario_id,
            nombre: `${trabajador.usuario_nombre} ${trabajador.usuario_apellido_pat} ${trabajador.usuario_apellido_mat}`.trim(),
            cedula: trabajador.usuario_rut,
            iniciales: `${trabajador.usuario_nombre.charAt(0)}${trabajador.usuario_apellido_pat.charAt(0)}`.toUpperCase(),
            departamento: trabajador.rol_en_empresa || 'N/A',
            turno: turno?.nombre || 'N/A',
            tipoJornada: turno ? 'fija' : 'N/A',
            lugar: lugarNombre,
            lugarTrabajo: lugarNombre,
            region: lugarRegion,
            establecimiento: lugarEstablecimiento,
            cargo: trabajador.rol_en_empresa || 'N/A',
            empresaTransitoria: trabajador.es_est ? trabajador.empresa_empleadora_nombre : null,
            fecha: fecha,
            jornadaPactada: jornadaPactada,
            entrada: marcacionEntrada ? marcacionEntrada.hora.substring(0, 5) : 'N/A',
            salida: marcacionSalida ? marcacionSalida.hora.substring(0, 5) : 'N/A',
            colacionPactada: '01:00', // Por defecto 1 hora
            colacionInicio: colaciones.length > 0 ? colaciones[0].hora.substring(0, 5) : null,
            colacionFin: colaciones.length > 1 ? colaciones[colaciones.length - 1].hora.substring(0, 5) : null,
            tiempoFaltante: tiempoFaltante,
            tiempoExtra: tiempoExtra,
            otrasMarcaciones: otrasMarcaciones,
            observaciones: observaciones.trim() || 'Sin observaciones',
            distribucionExcepcional: null,
            cumplimiento: cumplimiento,
            hashChecksum: marcacionEntrada?.hash?.substring(0, 12) || marcacionSalida?.hash?.substring(0, 12) || 'N/A',
            // Datos adicionales para filtros
            es_est: trabajador.es_est || false,
            empresa_est_id: trabajador.es_est ? trabajador.empresa_id : null,
            empresaEmpleadora: trabajador.es_est ? trabajador.empresa_empleadora_nombre : (trabajador.empresa_nombre || 'EmpresaPrincipal'),
            empresaEmpleadoraRut: trabajador.es_est ? trabajador.empresa_empleadora_rut : (trabajador.empresa_rut || '123'),
            empresaAsignada: trabajador.es_est ? trabajador.empresa_asignada_nombre : null,
            empresaAsignadaRut: trabajador.es_est ? trabajador.empresa_asignada_rut : null,
            empresa_id: trabajador.empresa_id,
            email: trabajador.usuario_email,
            atraso_info: atraso,
            salida_info: salida,
            turno_info: turno,
            estadoAsistencia: estadoAsistencia,
            estado: cumplimiento
          })
        }
      }
    }
    
    registros.value = registrosProcessed
    console.log('✅ Registros procesados:', registros.value.length)
    
    // Actualizar encabezado con el primer trabajador si existe
    if (registros.value.length > 0) {
      const primerTrabajador = registros.value[0]
      encabezado.value.nombreTrabajador = primerTrabajador.nombre
      encabezado.value.rutTrabajador = formatearRut(primerTrabajador.cedula)
      encabezado.value.lugarTrabajo = primerTrabajador.lugar
      encabezado.value.bandaHoraria = primerTrabajador.turno
    }
    
    // Si empleadosDisponibles está vacío, cargar desde registros
    if (empleadosDisponibles.value.length === 0) {
      empleadosDisponibles.value = registros.value.map(r => ({
        id: r.trabajador_id || r.usuario_id,
        nombre: r.nombre,
        cedula: r.cedula,
        rol: r.cargo,
        es_est: r.es_est || false,
        empresa_nombre: r.empresaTransitoria || 'Personal Directo'
      }))
    }
    
  } else {
    // Simular datos según el formato legal requerido (fallback)
    registros.value = [
    {
      id: 1,
      nombre: 'Juan Pérez Martínez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'IT',
      turno: 'MAÑANA',
      lugar: 'sucursal_central',
      cargo: 'tecnico',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      jornadaPactada: '08:00:00',
      entrada: '08:00:00',
      salida: '17:30:00',
      colacionPactada: '01:00:00',
      colacionInicio: '12:30:00',
      colacionFin: '13:30:00',
      tiempoFaltante: null,
      tiempoExtra: '+01:30:00',
      otrasMarcaciones: [
        { tipo: 'Descanso', horario: '10:15-10:30' },
        { tipo: 'Descanso', horario: '15:00-15:15' }
      ],
      observaciones: 'Trabajador cumplió jornada completa con horas extras autorizadas',
      distribucionExcepcional: null,
      cumplimiento: 'EXCEDIDO',
      hashChecksum: 'abc123def456'
    },
    {
      id: 2,
      nombre: 'María González Silva',
      cedula: '87654321',
      iniciales: 'MG',
      departamento: 'RRHH',
      turno: 'MAÑANA',
      lugar: 'sucursal_central',
      cargo: 'administrativo',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      jornadaPactada: '08:00:00',
      entrada: '08:15:00',
      salida: '17:00:00',
      colacionPactada: '01:00:00',
      colacionInicio: '13:00:00',
      colacionFin: '14:00:00',
      tiempoFaltante: '-00:15:00',
      tiempoExtra: null,
      otrasMarcaciones: [
        { tipo: 'Reunión', horario: '09:00-10:00' }
      ],
      observaciones: 'Tardanza justificada por transporte público',
      distribucionExcepcional: null,
      cumplimiento: 'INCOMPLETO',
      hashChecksum: 'def456ghi789'
    },
    {
      id: 3,
      nombre: 'Carlos López Fernández',
      cedula: '11223344',
      iniciales: 'CL',
      departamento: 'VENTAS',
      turno: 'TARDE',
      lugar: 'sucursal_norte',
      cargo: 'vendedor',
      empresaTransitoria: 'manpower',
      fecha: '2024-01-15',
      jornadaPactada: '08:00:00',
      entrada: '14:00:00',
      salida: '21:30:00',
      colacionPactada: '00:30:00',
      colacionInicio: '18:00:00',
      colacionFin: '18:30:00',
      tiempoFaltante: '-01:00:00',
      tiempoExtra: null,
      otrasMarcaciones: [],
      observaciones: 'Salida anticipada por cita médica autorizada',
      distribucionExcepcional: 'Jornada reducida autorizada',
      cumplimiento: 'INCOMPLETO',
      hashChecksum: 'ghi789jkl012'
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez Castro',
      cedula: '55667788',
      iniciales: 'AR',
      departamento: 'MARKETING',
      turno: 'MAÑANA',
      lugar: 'oficina_comercial',
      cargo: 'administrativo',
      empresaTransitoria: null,
      fecha: '2024-01-15',
      jornadaPactada: '08:00:00',
      entrada: '08:00:00',
      salida: '16:00:00',
      colacionPactada: '01:00:00',
      colacionInicio: '12:00:00',
      colacionFin: '13:00:00',
      tiempoFaltante: null,
      tiempoExtra: null,
      otrasMarcaciones: [
        { tipo: 'Capacitación', horario: '14:00-15:00' }
      ],
      observaciones: 'Jornada normal sin novedades',
      distribucionExcepcional: null,
      cumplimiento: 'COMPLETO',
      hashChecksum: 'jkl012mno345'
    },
    {
      id: 5,
      nombre: 'Roberto Sanchez Torres',
      cedula: '99887766',
      iniciales: 'RS',
      departamento: 'PRODUCCION',
      turno: 'ROTATIVO',
      lugar: 'planta_produccion',
      cargo: 'operario',
      empresaTransitoria: 'randstad',
      fecha: '2024-01-15',
      jornadaPactada: '08:00:00',
      entrada: '06:00:00',
      salida: '15:30:00',
      colacionPactada: '00:30:00',
      colacionInicio: null,
      colacionFin: null,
      tiempoFaltante: null,
      tiempoExtra: '+01:00:00',
      otrasMarcaciones: [
        { tipo: 'Jornada Pasiva', horario: '11:00-11:30' },
        { tipo: 'Mantenimiento', horario: '14:00-14:30' }
      ],
      observaciones: 'Turno nocturno con horas extras por producción urgente',
      distribucionExcepcional: 'Turno especial 24/7',
      cumplimiento: 'HORAS_EXTRA',
      hashChecksum: 'mno345pqr678'
    }
  ]
  
    // Actualizar encabezado con el primer trabajador si existe
    if (registros.value.length > 0) {
      const primerTrabajador = registros.value[0]
      encabezado.value.nombreTrabajador = primerTrabajador.nombre
      encabezado.value.rutTrabajador = formatearRut(primerTrabajador.cedula)
    }
  }
}

// Funciones auxiliares para manejo de tiempo
const convertirHorasAMinutos = (hora) => {
  if (!hora) return 0
  const [h, m, s] = hora.split(':').map(Number)
  return h * 60 + m + (s ? Math.round(s / 60) : 0)
}

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
    // Si la fecha ya viene en formato YYYY-MM-DD, convertir directamente
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [anio, mes, dia] = fecha.split('-')
      return `${dia}/${mes}/${anio.slice(-2)}`
    }
    
    // Si viene en otro formato, usar Date con UTC para evitar cambio de zona horaria
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
  // Simular formato de RUT chileno
  const rutLimpio = rut.replace(/[.-]/g, '')
  if (rutLimpio.length >= 7) {
    const cuerpo = rutLimpio.slice(0, -1)
    const dv = rutLimpio.slice(-1)
    return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
  }
  return rut
}

const applyFilters = async () => {
  // Llamar a la función empaquetada para recargar datos con nuevas fechas
  await cargarReporteConFiltros()
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
    cumplimiento: '',
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



onMounted(async () => {
  try {
    cargandoFiltros.value = true
    
    // Cargar datos para filtros
    const dataFiltros = await obtenerDatosParaFiltros()
    console.log('Datos para filtros obtenidos:', dataFiltros)
    
    // Verificar estructura de respuesta (puede ser data.data o data.data.data)
    const filtrosData = dataFiltros?.data?.data || dataFiltros?.data
    
    if (filtrosData) {
      // Cargar tipos de jornada
      tiposJornadaDB.value = filtrosData.tiposJornada || []
      
      // Cargar lugares de trabajo
      lugaresDB.value = filtrosData.lugaresTrabajo || []
      
      // Cargar turnos
      turnosDB.value = filtrosData.turnos || []
      
      // Cargar roles/cargos (array de strings)
      rolesDB.value = filtrosData.roles || []
      
      // Cargar regiones (eliminar duplicados y valores vacíos)
      regionesDB.value = [...new Set(filtrosData.regiones || [])].filter(r => r && r.trim())
      
      // Cargar comunas (eliminar duplicados y valores vacíos)
      comunasDB.value = [...new Set(filtrosData.comunas || [])].filter(c => c && c.trim())
      
      // Cargar trabajadores
      trabajadoresDB.value = filtrosData.trabajadores || []
      
      // Cargar empresa EST (puede ser null)
      empresaEstDB.value = filtrosData.empresaEst || null
      
      // Actualizar empleados disponibles para búsqueda grupal
      empleadosDisponibles.value = trabajadoresDB.value.map(t => ({
        id: t.usuario_id,
        nombre: `${t.usuario_nombre} ${t.usuario_apellido_pat} ${t.usuario_apellido_mat}`.trim(),
        cedula: t.usuario_rut,
        rol: t.rol_en_empresa,
        email: t.usuario_email,
        es_est: t.es_est,
        empresa_nombre: t.es_est ? t.empresa_asignada_nombre : t.empresa_nombre,
        empresa_rut: t.es_est ? t.empresa_asignada_rut : t.empresa_rut
      }))
      
      console.log('Filtros cargados:', {
        tiposJornada: tiposJornadaDB.value.length,
        lugares: lugaresDB.value.length,
        turnos: turnosDB.value.length,
        roles: rolesDB.value.length,
        regiones: regionesDB.value.length,
        comunas: comunasDB.value.length,
        trabajadores: trabajadoresDB.value.length,
        empresaEst: empresaEstDB.value ? empresaEstDB.value.emp_nombre : 'Sin EST'
      })
    }
    
    cargandoFiltros.value = false
    
    // Cargar datos iniciales de jornada diaria
    await cargarReporteConFiltros()
    
  } catch (error) {
    console.error('Error al inicializar componente:', error)
    cargandoFiltros.value = false
    // En caso de error, cargar datos de fallback
    await loadData()
  }
})
</script>
