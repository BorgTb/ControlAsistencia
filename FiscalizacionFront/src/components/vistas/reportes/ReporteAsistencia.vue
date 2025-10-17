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
                  <p class="text-sm text-gray-500">Según Art. 25 - Registro de asistencia</p>
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
            <div v-else>
            
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
                        <span class="ml-3 text-sm text-gray-700">
                          <span class="font-medium">{{ empleado.nombre }}</span>
                          <span class="text-gray-500 ml-2">({{ empleado.cedula }})</span>
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
                  <option value="manpower">Manpower Chile S.A.</option>
                  <option value="randstad">Randstad Chile S.A.</option>
                  <option value="adecco">Adecco Chile S.A.</option>
                  <option value="experis">Experis Chile S.A.</option>
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
                      <div class="text-sm text-gray-500">{{ empleado.tipoJornada }} - {{ empleado.departamento }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ empleado.lugarTrabajo?.replace('_', ' ') || 'N/A' }}</td>
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


const {obtenerReporteAsistencia, obtenerDatosParaFiltros} = useReportes()

const filters = ref({
  trabajadorNombre: '',
  trabajadorRut: '',
  tipoJornada: '',
  turnoEspecifico: '',
  lugarTrabajo: '',
  fechaDesde: '',
  fechaHasta: '',
  periodoRapido: '',
  region: '',
  establecimiento: '',
  cargo: '',
  empresaTransitoria: '',
  hashChecksum: '',
  estado: '',
  departamento: ''
})

// Control de visibilidad de filtros
const mostrarFiltros = ref(true)
const cargandoFiltros = ref(true)

// Nuevas variables para búsqueda grupal
const mostrarSelectorGrupal = ref(false)
const busquedaGrupal = ref('')
const trabajadoresSeleccionados = ref([])

const empleados = ref([])
const empleadosDisponibles = ref([]) // Lista completa para búsqueda grupal

// Datos dinámicos desde la API
const tiposJornadaDB = ref([])
const lugaresDB = ref([])
const turnosDB = ref([])
const rolesDB = ref([])
const regionesDB = ref([])
const comunasDB = ref([])

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


const loadData = async (apiData = null) => {
  if (apiData && apiData.length > 0) {
    // Usar datos reales de la API

    empleados.value = apiData.map(empleado => ({
      ...empleado,
      // Normalizar campos para compatibilidad con la vista
      estado: empleado.estado?.toUpperCase() || 'PRESENTE', // Convertir a mayúsculas
      tipoJornada: normalizeJornadaType(empleado.tipoJornada),
      turnoEspecifico: normalizeTurnoType(empleado.turnoEspecifico),
      lugarTrabajo: normalizeLugarType(empleado.lugarTrabajo),
      region: normalizeRegionType(empleado.region),
      // Asegurar que horas esté calculado
      horas: empleado.horas || calcularHorasTrabajadas(empleado.entrada, empleado.salida)
    }))

  } else {
    // Datos de fallback/simulados para desarrollo
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
        hashChecksum: 'abc123def456',
        horas: '9:00'
      }
    ]
  }
  
  // Cargar empleados disponibles para búsqueda grupal
  empleadosDisponibles.value = [...empleados.value]
}

// Funciones de normalización para compatibilidad
const normalizeJornadaType = (jornada) => {
  if (!jornada) return 'fija'
  const jornadaLower = jornada.toLowerCase()
  if (jornadaLower.includes('completa')) return 'fija'
  if (jornadaLower.includes('parcial')) return 'parcial'
  if (jornadaLower.includes('turno')) return 'turnos'
  return 'fija'
}

const normalizeTurnoType = (turno) => {
  if (!turno) return 'mañana_lv'
  const turnoLower = turno.toLowerCase()
  if (turnoLower.includes('mañana')) return 'mañana_lv'
  if (turnoLower.includes('tarde')) return 'tarde_lv'
  if (turnoLower.includes('noche')) return 'noche_lv'
  return 'mañana_lv'
}

const normalizeLugarType = (lugar) => {
  if (!lugar) return 'oficina'
  const lugarLower = lugar.toLowerCase()
  if (lugarLower.includes('central') || lugarLower.includes('oficina')) return 'oficina'
  if (lugarLower.includes('terreno')) return 'terreno'
  if (lugarLower.includes('remoto')) return 'remoto'
  if (lugarLower.includes('mixto')) return 'mixto'
  return 'oficina'
}

const normalizeRegionType = (region) => {
  if (!region) return 'metropolitana'
  const regionLower = region.toLowerCase()
  if (regionLower.includes('metropolitana')) return 'metropolitana'
  if (regionLower.includes('valparaiso')) return 'valparaiso'
  if (regionLower.includes('biobio')) return 'biobio'
  if (regionLower.includes('antofagasta')) return 'antofagasta'
  return 'metropolitana'
}

const calcularHorasTrabajadas = (entrada, salida) => {
  if (!entrada || !salida) return '0:00'
  
  try {
    // Convertir horas a minutos para calcular
    const [entradaH, entradaM, entradaS] = entrada.split(':').map(Number)
    const [salidaH, salidaM, salidaS] = salida.split(':').map(Number)
    
    const entradaMinutos = entradaH * 60 + entradaM
    const salidaMinutos = salidaH * 60 + salidaM
    
    let diferenciaMinutos = salidaMinutos - entradaMinutos
    
    // Si la salida es al día siguiente (para turnos nocturnos)
    if (diferenciaMinutos < 0) {
      diferenciaMinutos += 24 * 60
    }
    
    const horas = Math.floor(diferenciaMinutos / 60)
    const minutos = diferenciaMinutos % 60
    
    return `${horas}:${minutos.toString().padStart(2, '0')}`
  } catch (error) {
    console.error('Error calculando horas:', error)
    return '0:00'
  }
}

onMounted(async () => {
  try {
    cargandoFiltros.value = true;
    
    // Cargar datos para filtros
    const dataFiltros = await obtenerDatosParaFiltros();
    console.log('Datos para filtros obtenidos:', dataFiltros);
    
    // Verificar estructura de respuesta
    const filtrosData = dataFiltros?.data?.data || dataFiltros?.data;
    
    if (filtrosData) {
      // Cargar tipos de jornada
      tiposJornadaDB.value = filtrosData.tiposJornada || [];
      
      // Cargar lugares de trabajo
      lugaresDB.value = filtrosData.lugaresTrabajo || [];
      
      // Cargar turnos
      turnosDB.value = filtrosData.turnos || [];
      
      // Cargar roles/cargos
      rolesDB.value = filtrosData.roles || [];
      
      // Cargar regiones (eliminar duplicados y valores vacíos)
      regionesDB.value = [...new Set(filtrosData.regiones || [])].filter(r => r && r.trim());
      
      // Cargar comunas (eliminar duplicados y valores vacíos)
      comunasDB.value = [...new Set(filtrosData.comunas || [])].filter(c => c && c.trim());
      
      console.log('Filtros cargados:', {
        tiposJornada: tiposJornadaDB.value.length,
        lugares: lugaresDB.value.length,
        turnos: turnosDB.value.length,
        roles: rolesDB.value.length,
        regiones: regionesDB.value.length,
        comunas: comunasDB.value.length
      });
    }
    
    cargandoFiltros.value = false;
    
    // Cargar datos de asistencia
    const rest = await obtenerReporteAsistencia()
    console.log('Datos recibidos de la API:', rest.data)
    
    // Verificar si la respuesta tiene la estructura esperada
    if (rest?.data && Array.isArray(rest.data)) {
      await loadData(rest.data)
      console.log('Datos cargados exitosamente:', empleados.value.length, 'empleados')
    } else {
      console.warn('No se recibieron datos válidos de la API, usando datos de fallback')
      await loadData()
    }
  } catch (error) {
    console.error('Error al obtener datos de asistencia:', error)
    cargandoFiltros.value = false;
    // En caso de error, cargar datos de fallback
    await loadData()
  }
})
</script>
