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
                  <option value="MIXTO">Jornada Mixta</option>
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

            <!-- Cumplimiento y Departamento -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cumplimiento de Jornada</label>
                <select 
                  v-model="filters.cumplimiento" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los cumplimientos</option>
                  <option value="COMPLETO">Jornada Completa</option>
                  <option value="INCOMPLETO">Jornada Incompleta</option>
                  <option value="EXCEDIDO">Jornada Excedida</option>
                  <option value="HORAS_EXTRA">Con Horas Extra</option>
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
                    
                    <!-- 2. Jornada Ordinaria Pactada -->
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-mono">
                      {{ registro.jornadaPactada }}
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
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
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
  cumplimiento: '',
  departamento: ''
})

const registros = ref([])

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
  
  const totalJornadaPactada = data.reduce((sum, r) => sum + convertirHorasAMinutos(r.jornadaPactada || '08:00:00'), 0)
  const totalHorasTrabajadas = data.reduce((sum, r) => {
    const entrada = convertirHoraAMinutos(r.entrada)
    const salida = convertirHoraAMinutos(r.salida)
    return sum + (salida - entrada)
  }, 0)
  
  const totalColacion = data.reduce((sum, r) => sum + convertirHorasAMinutos(r.colacionPactada || '01:00:00'), 0)
  
  let totalFaltante = 0
  let totalExtra = 0
  
  data.forEach(r => {
    if (r.tiempoFaltante) {
      totalFaltante += convertirHorasAMinutos(r.tiempoFaltante.replace('-', ''))
    }
    if (r.tiempoExtra) {
      totalExtra += convertirHorasAMinutos(r.tiempoExtra.replace('+', ''))
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
  return {
    jornadaCompleta: data.filter(r => r.cumplimiento === 'COMPLETO').length,
    jornadaIncompleta: data.filter(r => r.cumplimiento === 'INCOMPLETO').length,
    horasExtras: data.reduce((sum, r) => {
      const diff = parseFloat(r.diferencia.replace('+', ''))
      return sum + (diff > 0 ? diff : 0)
    }, 0).toFixed(1),
    promedioHoras: data.length > 0 ? 
      (data.reduce((sum, r) => sum + parseFloat(r.horasTrabajadas), 0) / data.length).toFixed(1) : '0.0'
  }
})

const filteredData = computed(() => {
  let data = registros.value
  
  // Filtro por nombre o apellido del trabajador
  if (filters.value.trabajadorNombre) {
    const nombre = filters.value.trabajadorNombre.toLowerCase()
    data = data.filter(r => r.nombre.toLowerCase().includes(nombre))
  }
  
  // Filtro por RUT
  if (filters.value.trabajadorRut) {
    data = data.filter(r => r.cedula && r.cedula.includes(filters.value.trabajadorRut.replace(/[.-]/g, '')))
  }
  
  // Filtro por jornada/turno
  if (filters.value.jornada) {
    data = data.filter(r => r.turno === filters.value.jornada)
  }
  
  // Filtro por lugar
  if (filters.value.lugar) {
    data = data.filter(r => r.lugar === filters.value.lugar)
  }
  
  // Filtro por cargo
  if (filters.value.cargo) {
    data = data.filter(r => r.cargo === filters.value.cargo)
  }
  
  // Filtro por empresa transitoria
  if (filters.value.empresaTransitoria) {
    if (filters.value.empresaTransitoria === 'directos') {
      data = data.filter(r => !r.empresaTransitoria)
    } else {
      data = data.filter(r => r.empresaTransitoria === filters.value.empresaTransitoria)
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
  
  // Filtro por cumplimiento
  if (filters.value.cumplimiento) {
    data = data.filter(r => r.cumplimiento === filters.value.cumplimiento)
  }
  
  // Filtro por rango de fechas
  if (filters.value.fechaDesde && filters.value.fechaHasta) {
    data = data.filter(r => {
      const fechaRegistro = new Date(r.fecha)
      const fechaDesde = new Date(filters.value.fechaDesde)
      const fechaHasta = new Date(filters.value.fechaHasta)
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

const loadData = async () => {
  // Simular datos según el formato legal requerido
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
  const date = new Date(fecha)
  const dia = date.getDate().toString().padStart(2, '0')
  const mes = (date.getMonth() + 1).toString().padStart(2, '0')
  const año = date.getFullYear().toString().slice(-2)
  return `${dia}/${mes}/${año}`
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
    cumplimiento: '',
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
