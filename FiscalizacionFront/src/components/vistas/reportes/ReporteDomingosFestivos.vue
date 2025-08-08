<template>
  <div class="min-h-screen bg-gray-50">
    
    
    <!-- Main Content -->
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reporte de Domingos y/o Festivos Laborados</h1>
          <p class="mt-2 text-gray-600">Control de trabajo en días no laborales según normativa laboral</p>
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
                    <span class="font-medium text-gray-600">Cargo/Función:</span>
                    <span class="text-gray-900">{{ encabezado.cargoFuncion }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-600">Trabajador Comercio:</span>
                    <span class="text-gray-900" :class="encabezado.trabajadorComercio ? 'text-blue-600 font-medium' : 'text-gray-500'">
                      {{ encabezado.trabajadorComercio ? 'SÍ - Con descansos dominicales adicionales' : 'NO' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Alerta sobre trabajadores sin servicio en domingos/festivos -->
            <div v-if="!trabajadorLaboraDomingosFestivos" class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700 font-medium">
                    ⚠️ La jornada de este trabajador no incluye domingos o festivos
                  </p>
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
                  <option value="ESPECIAL">Jornada Especial</option>
                </select>
              </div>
            </div>

            <!-- Fila 2: Período de Consulta (hasta 24 meses atrás) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Período de Consulta (Máximo 24 meses)</label>
                <div class="space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      @click="setPeriodoRapido('mes')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'mes', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'mes'}"
                      class="px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Último Mes
                    </button>
                    <button 
                      @click="setPeriodoRapido('trimestre')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'trimestre', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'trimestre'}"
                      class="px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Último Trimestre
                    </button>
                    <button 
                      @click="setPeriodoRapido('semestre')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'semestre', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'semestre'}"
                      class="px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Último Semestre
                    </button>
                    <button 
                      @click="setPeriodoRapido('año')" 
                      :class="{'bg-blue-500 text-white': filters.periodoRapido === 'año', 'bg-gray-200 text-gray-700': filters.periodoRapido !== 'año'}"
                      class="px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Último Año
                    </button>
                  </div>
                  <div class="flex space-x-2">
                    <input 
                      v-model="filters.fechaDesde" 
                      type="date" 
                      :max="fechaMaxima"
                      :min="fechaMinima"
                      placeholder="Desde"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <input 
                      v-model="filters.fechaHasta" 
                      type="date" 
                      :max="fechaMaxima"
                      placeholder="Hasta"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>
                  <p class="text-xs text-gray-500">* Período máximo: 24 meses hacia atrás desde la fecha actual</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Filtros Adicionales</label>
                <div class="space-y-2">
                  <select 
                    v-model="filters.trabajadorComercio" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los trabajadores</option>
                    <option value="SI">Solo trabajadores del comercio</option>
                    <option value="NO">Solo trabajadores no comercio</option>
                  </select>
                  <select 
                    v-model="filters.tipoDia" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Domingos y Festivos</option>
                    <option value="DOMINGO">Solo Domingos</option>
                    <option value="FESTIVO">Solo Festivos</option>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Días Trabajados</p>
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

        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Registro de Domingos y/o Festivos Laborados</h3>
                <p class="mt-2 text-sm text-gray-700">Control según normativa laboral vigente</p>
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
            <div class="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Trabajador del Comercio<br/>
                      <span class="text-xs font-normal">(Descansos Adicionales)</span>
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Fecha<br/>
                      <span class="text-xs font-normal">(dd/mm/aa)</span>
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Asistencia<br/>
                      <span class="text-xs font-normal">(Sí/No)</span>
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Ausencia<br/>
                      <span class="text-xs font-normal">(Justificada/Injustificada)</span>
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <!-- Registros agrupados por mes -->
                  <template v-for="(registrosMes, mesAno) in registrosAgrupadosPorMes" :key="mesAno">
                    <!-- Registros del mes -->
                    <tr v-for="registro in registrosMes.registros" :key="registro.id" class="hover:bg-gray-50">
                      <!-- 1. Indicador Trabajador del Comercio -->
                      <td class="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <span v-if="registro.trabajadorComercio" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ✓ SÍ
                        </span>
                        <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          NO
                        </span>
                      </td>
                      
                      <!-- 2. Fecha -->
                      <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div class="flex flex-col">
                          <span>{{ formatearFecha(registro.fecha) }}</span>
                          <span class="text-xs text-gray-500">{{ registro.tipoDia }}</span>
                        </div>
                      </td>
                      
                      <!-- 3. Asistencia (Sí/No) -->
                      <td class="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <span v-if="registro.asistencia" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ SÍ
                        </span>
                        <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ NO
                        </span>
                      </td>
                      
                      <!-- 4. Ausencia (Justificada/Injustificada) -->
                      <td class="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <span v-if="!registro.asistencia">
                          <span v-if="registro.ausenciaJustificada" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Justificada
                          </span>
                          <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Injustificada
                          </span>
                        </span>
                        <span v-else class="text-gray-400 italic text-xs">
                          No Aplica
                        </span>
                      </td>
                      
                      <!-- 5. Observaciones -->
                      <td class="px-4 py-4 text-sm text-gray-900 max-w-xs">
                        <div v-if="registro.observaciones" class="truncate" :title="registro.observaciones">
                          {{ registro.observaciones }}
                        </div>
                        <div v-else class="text-gray-400 italic text-xs">
                          Sin observaciones
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Línea de totales mensuales -->
                    <tr class="bg-blue-50 border-t-2 border-blue-200">
                      <td class="px-4 py-3 text-sm font-bold text-blue-900 text-center">
                        TOTAL {{ mesAno }}
                      </td>
                      <td class="px-4 py-3 text-sm font-bold text-blue-900 text-center">
                        {{ registrosMes.totalDias }} días
                      </td>
                      <td class="px-4 py-3 text-sm font-bold text-blue-900 text-center">
                        {{ registrosMes.totalAsistencias }} trabajados
                      </td>
                      <td class="px-4 py-3 text-sm font-bold text-blue-900 text-center">
                        {{ registrosMes.totalAusenciasJustificadas }} justificadas
                      </td>
                      <td class="px-4 py-3 text-sm font-bold text-blue-900">
                        Resumen mensual de domingos/festivos
                      </td>
                    </tr>
                  </template>
                  
                  <!-- Línea final con totales del período -->
                  <tr v-if="totalesPeriodo" class="bg-green-50 border-t-4 border-green-300">
                    <td class="px-4 py-4 text-sm font-bold text-green-900 text-center">
                      TOTAL PERÍODO
                    </td>
                    <td class="px-4 py-4 text-sm font-bold text-green-900 text-center">
                      {{ totalesPeriodo.totalDiasPeriodo }} días
                    </td>
                    <td class="px-4 py-4 text-sm font-bold text-green-900 text-center">
                      {{ totalesPeriodo.totalAsistenciasPeriodo }} trabajados
                    </td>
                    <td class="px-4 py-4 text-sm font-bold text-green-900 text-center">
                      {{ totalesPeriodo.totalAusenciasJustificadasPeriodo }} justificadas
                    </td>
                    <td class="px-4 py-4 text-sm font-bold text-green-900">
                      <div class="flex flex-col">
                        <span>RESUMEN TOTAL DEL PERÍODO</span>
                        <span class="text-xs font-normal">
                          ({{ formatearFecha(filters.fechaDesde) }} - {{ formatearFecha(filters.fechaHasta) }})
                        </span>
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

const today = new Date()
const fechaMaxima = today.toISOString().split('T')[0]
// Fecha mínima: 24 meses hacia atrás
const fechaMinima = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()).toISOString().split('T')[0]

const filters = ref({
  trabajadorNombre: '',
  trabajadorRut: '',
  jornada: '',
  fechaDesde: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0], // Mes anterior
  fechaHasta: fechaMaxima,
  periodoRapido: 'mes',
  lugar: '',
  cargo: '',
  empresaTransitoria: '',
  hashChecksum: '',
  tipoDia: '',
  departamento: '',
  trabajadorComercio: ''
})

const registros = ref([])

// Datos del encabezado legal requerido
const encabezado = ref({
  razonSocial: 'TELEMEDIOS S.A.',
  rutEmpresa: '96.789.123-4',
  nombreTrabajador: 'Juan Pérez Martínez',
  rutTrabajador: '12.345.678-9',
  lugarTrabajo: 'Oficina Central Santiago',
  cargoFuncion: 'Técnico en Sistemas - Turno Especial',
  trabajadorComercio: true // Indica si tiene descansos dominicales adicionales
})

// Variable para controlar si el trabajador labora en domingos/festivos
const trabajadorLaboraDomingosFestivos = ref(true)

// Computed para registros agrupados por mes
const registrosAgrupadosPorMes = computed(() => {
  const data = filteredData.value
  const agrupados = {}
  
  data.forEach(registro => {
    const fecha = new Date(registro.fecha)
    const mesAno = `${fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}`
    
    if (!agrupados[mesAno]) {
      agrupados[mesAno] = {
        registros: [],
        totalDias: 0,
        totalAsistencias: 0,
        totalAusenciasJustificadas: 0
      }
    }
    
    agrupados[mesAno].registros.push(registro)
    agrupados[mesAno].totalDias++
    
    if (registro.asistencia) {
      agrupados[mesAno].totalAsistencias++
    } else if (registro.ausenciaJustificada) {
      agrupados[mesAno].totalAusenciasJustificadas++
    }
  })
  
  return agrupados
})

// Computed para totales del período
const totalesPeriodo = computed(() => {
  const data = filteredData.value
  if (data.length === 0) return null
  
  return {
    totalDiasPeriodo: data.length,
    totalAsistenciasPeriodo: data.filter(r => r.asistencia).length,
    totalAusenciasJustificadasPeriodo: data.filter(r => !r.asistencia && r.ausenciaJustificada).length
  }
})

const stats = computed(() => {
  const data = filteredData.value
  return {
    totalDomingos: data.filter(r => r.tipoDia === 'DOMINGO').length,
    totalFestivos: data.filter(r => r.tipoDia === 'FESTIVO').length,
    empleadosTrabajaron: data.filter(r => r.asistencia).length,
    totalPagosExtra: data.reduce((sum, r) => sum + (r.asistencia ? parseFloat(r.pagoExtra || 0) : 0), 0).toFixed(2)
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
  
  // Filtro por trabajador de comercio
  if (filters.value.trabajadorComercio) {
    const esComercio = filters.value.trabajadorComercio === 'SI'
    data = data.filter(r => r.trabajadorComercio === esComercio)
  }
  
  // Filtro por tipo de día
  if (filters.value.tipoDia) {
    data = data.filter(r => r.tipoDia === filters.value.tipoDia)
  }
  
  // Filtro por departamento
  if (filters.value.departamento) {
    data = data.filter(r => r.departamento === filters.value.departamento)
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
  
  // Filtro por rango de fechas
  if (filters.value.fechaDesde && filters.value.fechaHasta) {
    data = data.filter(r => {
      const fechaRegistro = new Date(r.fecha)
      const fechaDesde = new Date(filters.value.fechaDesde)
      const fechaHasta = new Date(filters.value.fechaHasta)
      return fechaRegistro >= fechaDesde && fechaRegistro <= fechaHasta
    })
  }
  
  return data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
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


const loadData = async () => {
  // Simular datos según el formato legal requerido
  registros.value = [
    {
      id: 1,
      fecha: '2024-01-07', // Domingo
      tipoDia: 'DOMINGO',
      nombre: 'Juan Pérez Martínez',
      cedula: '12345678',
      iniciales: 'JP',
      departamento: 'SEGURIDAD',
      cargo: 'seguridad',
      empresaTransitoria: null,
      trabajadorComercio: false,
      asistencia: true,
      ausenciaJustificada: null,
      observaciones: 'Turno de seguridad nocturna - Personal esencial',
      pagoExtra: '120.00',
      hashChecksum: 'abc123def456'
    },
    {
      id: 2,
      fecha: '2024-01-01', // Festivo - Año Nuevo
      tipoDia: 'FESTIVO',
      nombre: 'María González Silva',
      cedula: '87654321',
      iniciales: 'MG',
      departamento: 'IT',
      cargo: 'tecnico',
      empresaTransitoria: null,
      trabajadorComercio: true,
      asistencia: true,
      ausenciaJustificada: null,
      observaciones: 'Mantenimiento de servidores críticos en feriado',
      pagoExtra: '180.00',
      hashChecksum: 'def456ghi789'
    },
    {
      id: 3,
      fecha: '2024-01-14', // Domingo
      tipoDia: 'DOMINGO',
      nombre: 'Carlos López Fernández',
      cedula: '11223344',
      iniciales: 'CL',
      departamento: 'SEGURIDAD',
      cargo: 'seguridad',
      empresaTransitoria: 'manpower',
      trabajadorComercio: false,
      asistencia: false,
      ausenciaJustificada: true,
      observaciones: 'Ausencia justificada por licencia médica',
      pagoExtra: '0.00',
      hashChecksum: 'ghi789jkl012'
    },
    {
      id: 4,
      fecha: '2024-01-21', // Domingo
      tipoDia: 'DOMINGO',
      nombre: 'Ana Rodríguez Castro',
      cedula: '55667788',
      iniciales: 'AR',
      departamento: 'VENTAS',
      cargo: 'vendedor',
      empresaTransitoria: null,
      trabajadorComercio: true,
      asistencia: false,
      ausenciaJustificada: false,
      observaciones: 'Falta injustificada - Se aplicará descuento según normativa',
      pagoExtra: '0.00',
      hashChecksum: 'jkl012mno345'
    },
    {
      id: 5,
      fecha: '2024-01-28', // Domingo
      tipoDia: 'DOMINGO',
      nombre: 'Roberto Sanchez Torres',
      cedula: '99887766',
      iniciales: 'RS',
      departamento: 'PRODUCCION',
      cargo: 'operario',
      empresaTransitoria: 'randstad',
      trabajadorComercio: false,
      asistencia: true,
      ausenciaJustificada: null,
      observaciones: 'Producción urgente para entrega de lunes',
      pagoExtra: '150.00',
      hashChecksum: 'mno345pqr678'
    },
    {
      id: 6,
      fecha: '2024-02-04', // Domingo - Febrero
      tipoDia: 'DOMINGO',
      nombre: 'Patricia Morales Vega',
      cedula: '22334455',
      iniciales: 'PM',
      departamento: 'ADMINISTRACION',
      cargo: 'contador',
      empresaTransitoria: null,
      trabajadorComercio: true,
      asistencia: true,
      ausenciaJustificada: null,
      observaciones: 'Cierre contable mensual urgente',
      pagoExtra: '200.00',
      hashChecksum: 'pqr678stu901'
    },
    {
      id: 7,
      fecha: '2024-02-14', // Festivo - Día de San Valentín (ejemplo)
      tipoDia: 'FESTIVO',
      nombre: 'Diego Herrera Luna',
      cedula: '66778899',
      iniciales: 'DH',
      departamento: 'IT',
      cargo: 'tecnico',
      empresaTransitoria: 'adecco',
      trabajadorComercio: false,
      asistencia: false,
      ausenciaJustificada: true,
      observaciones: 'Compensación por día trabajado en enero',
      pagoExtra: '0.00',
      hashChecksum: 'stu901vwx234'
    }
  ]
  
  // Verificar si el trabajador actual labora en domingos/festivos
  trabajadorLaboraDomingosFestivos.value = registros.value.length > 0
}

const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  const dia = date.getDate().toString().padStart(2, '0')
  const mes = (date.getMonth() + 1).toString().padStart(2, '0')
  const año = date.getFullYear().toString().slice(-2)
  return `${dia}/${mes}/${año}`
}

const setPeriodoRapido = (periodo) => {
  filters.value.periodoRapido = periodo
  const hoy = new Date()
  
  switch (periodo) {
    case 'mes':
      const mesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)
      filters.value.fechaDesde = mesAtras.toISOString().split('T')[0]
      filters.value.fechaHasta = ultimoDiaMesAnterior.toISOString().split('T')[0]
      break
    
    case 'trimestre':
      const trimestreAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1)
      filters.value.fechaDesde = trimestreAtras.toISOString().split('T')[0]
      filters.value.fechaHasta = hoy.toISOString().split('T')[0]
      break
    
    case 'semestre':
      const semestreAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 6, 1)
      filters.value.fechaDesde = semestreAtras.toISOString().split('T')[0]
      filters.value.fechaHasta = hoy.toISOString().split('T')[0]
      break
    
    case 'año':
      const añoAtras = new Date(hoy.getFullYear() - 1, hoy.getMonth(), hoy.getDate())
      filters.value.fechaDesde = añoAtras.toISOString().split('T')[0]
      filters.value.fechaHasta = hoy.toISOString().split('T')[0]
      break
  }
}

const applyFilters = () => {
  // La funcionalidad de filtrado se maneja automáticamente con computed
  console.log('Filtros aplicados según Art. 25:', filters.value)
}

const clearFilters = () => {
  const hoy = new Date()
  filters.value = {
    trabajadorNombre: '',
    trabajadorRut: '',
    jornada: '',
    fechaDesde: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0],
    fechaHasta: fechaMaxima,
    periodoRapido: 'mes',
    lugar: '',
    cargo: '',
    empresaTransitoria: '',
    hashChecksum: '',
    tipoDia: '',
    departamento: '',
    trabajadorComercio: ''
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
