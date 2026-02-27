<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <!-- Notificación Toast -->
    <transition name="slide-down">
      <div v-if="notificacion.mostrar" 
           :class="[
             'fixed top-4 right-4 z-50 max-w-md w-full rounded-lg shadow-lg p-4 border-l-4',
             notificacion.tipo === 'error' ? 'bg-red-50 border-red-500' : 
             notificacion.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500' : 
             notificacion.tipo === 'success' ? 'bg-green-50 border-green-500' :
             'bg-blue-50 border-blue-500'
           ]">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="notificacion.tipo === 'error'" class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="notificacion.tipo === 'warning'" class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else-if="notificacion.tipo === 'success'" class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p :class="[
              'text-sm font-medium',
              notificacion.tipo === 'error' ? 'text-red-800' : 
              notificacion.tipo === 'warning' ? 'text-yellow-800' : 
              notificacion.tipo === 'success' ? 'text-green-800' :
              'text-blue-800'
            ]">
              {{ notificacion.mensaje }}
            </p>
          </div>
          <button @click="cerrarNotificacion" class="ml-4 flex-shrink-0">
            <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Calendario de Asistencia</h1>
        <p class="mt-2 text-sm text-gray-600">
          Revisa tu historial de asistencia y marcaciones
        </p>
      </div>

      <!-- Tarjeta de estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Días Trabajados
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.trabajados }}
            </dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
              Días Libres
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.libres }}
            </dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              Ausencias
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.ausentes }}
            </dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Incidentes
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.incidentes }}
            </dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
              Justificados
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.justificados || 0 }}
            </dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-gray-400">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
              Sin Turno
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.sinTurno || 0 }}
            </dd>
          </div>
        </div>
      </div>

      <!-- Tarjeta de Horas Extras -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Horas Extras del Mes
          </h3>
          <div v-if="isLoadingHorasExtras" class="flex items-center text-sm text-gray-500">
            <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando...
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Horas Aprobadas -->
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-purple-700 mb-1">Horas Aprobadas</p>
                <p class="text-3xl font-bold text-purple-900">
                  {{ horasExtrasInfo.aprobadas }}
                </p>
                <p class="text-xs text-purple-600 mt-2">
                  <span v-if="horasExtrasInfo.tieneAprobadas" class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    Disponibles para pago
                  </span>
                  <span v-else class="text-gray-500">Sin horas aprobadas este mes</span>
                </p>
              </div>
              <div class="bg-purple-200 rounded-full p-3">
                <svg class="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Horas Acumuladas (Pendientes de Aprobación) -->
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-orange-700 mb-1">Horas Acumuladas</p>
                <p class="text-3xl font-bold text-orange-900">
                  {{ horasExtrasInfo.acumuladas }}
                </p>
                <p class="text-xs text-orange-600 mt-2">
                  <span v-if="horasExtrasInfo.tieneAcumuladas" class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                    Pendientes de aprobación
                  </span>
                  <span v-else class="text-gray-500">Sin horas acumuladas este mes</span>
                </p>
              </div>
              <div class="bg-orange-200 rounded-full p-3">
                <svg class="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje informativo -->
        <div v-if="horasExtrasInfo.tieneAprobadas || horasExtrasInfo.tieneAcumuladas" class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Información sobre horas extras:</p>
              <ul class="list-disc list-inside space-y-1">
                <li v-if="horasExtrasInfo.tieneAprobadas">Las horas aprobadas serán consideradas en tu próximo pago.</li>
                <li v-if="horasExtrasInfo.tieneAcumuladas">Las horas acumuladas están pendientes de revisión y aprobación por tu supervisor.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendario -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Header del calendario -->
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <button 
              @click="cambiarMes('anterior')"
              class="text-white hover:bg-indigo-500 rounded-full p-2 transition-colors duration-200"
              :disabled="isLoading"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <div class="text-center">
              <h2 class="text-2xl font-bold text-white">
                {{ nombreMes }} {{ anioActual }}
              </h2>
              <button 
                @click="irMesActual"
                class="text-sm text-indigo-100 hover:text-white mt-1 transition-colors duration-200"
                :disabled="isLoading"
              >
                Ir al mes actual
              </button>
            </div>

            <div class="flex items-center space-x-2" ref="exportMenuRef">
              <div class="relative">
                <button
                  @click.stop="toggleExportDropdown"
                  class="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-white rounded-md hover:bg-indigo-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isLoading || isExporting"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-8m0 8l-3-3m3 3l3-3M4 20h16"/>
                  </svg>
                  {{ isExporting ? 'Exportando...' : 'Exportar asistencia' }}
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                <div
                  v-if="mostrarExportDropdown"
                  class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40 p-4"
                  @click.stop
                >
                  <p class="text-sm font-semibold text-gray-900 mb-3">Exportar asistencia</p>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                      <input
                        v-model="exportRangeForm.fechaInicio"
                        type="date"
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        :disabled="isExporting"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                      <input
                        v-model="exportRangeForm.fechaFin"
                        type="date"
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        :disabled="isExporting"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <button
                      @click="exportarAsistenciaTrabajador('csv')"
                      class="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="isExporting"
                    >
                      {{ isExporting && exportTipoEnProceso === 'csv' ? 'Exportando...' : 'CSV' }}
                    </button>
                    <button
                      @click="exportarAsistenciaTrabajador('excel')"
                      class="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="isExporting"
                    >
                      {{ isExporting && exportTipoEnProceso === 'excel' ? 'Exportando...' : 'Excel' }}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                @click="cambiarMes('siguiente')"
                class="text-white hover:bg-indigo-500 rounded-full p-2 transition-colors duration-200"
                :disabled="isLoading"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Días de la semana -->
        <div class="grid grid-cols-7 gap-px bg-gray-200">
          <div 
            v-for="dia in ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']" 
            :key="dia"
            class="bg-gray-50 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
          >
            {{ dia }}
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-gray-600">Cargando calendario...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="mt-4 text-red-600">{{ error }}</p>
          <button 
            @click="recargarCalendario"
            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>

        <!-- Grid del calendario -->
        <div v-else class="grid grid-cols-7 gap-px bg-gray-200">
          <div 
            v-for="(dia, index) in diasCalendario" 
            :key="index"
            class="bg-white min-h-32 p-2 relative transition-all duration-200 hover:shadow-lg"
            :class="[
              !dia.esMesActual && 'bg-gray-50',
              dia.esHoy && 'ring-2 ring-indigo-500 ring-inset',
              dia.esMesActual && dia.estado && 'cursor-pointer hover:ring-2 hover:ring-indigo-300'
            ]"
            @click="dia.esMesActual && dia.estado ? mostrarDetalleDia(dia) : null"
          >
            <!-- Día vacío -->
            <div v-if="!dia.esMesActual" class="h-full"></div>

            <!-- Día del mes -->
            <div v-else class="h-full flex flex-col">
              <!-- Número del día -->
              <div class="flex justify-between items-start mb-1">
                <span 
                  class="text-sm font-semibold"
                  :class="[
                    dia.esHoy ? 'bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-700',
                    !dia.estado && 'text-gray-400'
                  ]"
                >
                  {{ dia.dia }}
                </span>
                
                <!-- Icono de estado -->
                <span 
                  v-if="dia.estado"
                  class="text-lg font-bold"
                  :class="getEstadoColorTexto(dia.estado)"
                >
                  {{ getEstadoIcono(dia.estado) }}
                </span>
              </div>

              <!-- Badge de estado -->
              <div v-if="dia.estado" class="mt-auto space-y-1">
                <span 
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                  :class="getEstadoColor(dia.estado)"
                >
                  {{ formatearEstado(dia.estado) }}
                </span>

                <!-- Horas si está trabajado -->
                <div v-if="dia.horaEntrada && dia.estado === 'trabajado'" class="text-xs text-gray-600 space-y-0.5">
                  <div class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14"/>
                    </svg>
                    {{ dia.horaEntrada }}
                  </div>
                  <div v-if="dia.horaSalida" class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                    {{ dia.horaSalida }}
                  </div>
                  
                  <!-- Horas Extras del día -->
                  <div v-if="tieneHorasExtras(dia)" class="flex items-center text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded mt-1">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-xs">{{ formatearMinutosAHoras(dia.minutosExtra) }} HE</span>
                  </div>

                  <!-- Retraso del día -->
                  <div v-if="tieneRetraso(dia)" class="flex items-center text-orange-700 font-semibold bg-orange-50 px-1.5 py-0.5 rounded mt-1">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-xs">{{ formatearMinutosAHoras(dia.minutosRetraso) }}</span>
                  </div>
                </div>

                <!-- Indicador de incidente -->
                <div v-if="dia.incidente">
                  <button 
                    @click="mostrarDetalleIncidente(dia)"
                    class="text-xs text-yellow-700 hover:text-yellow-900 underline"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="mt-8 bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Leyenda</h3>
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-green-100 border-green-300 flex items-center justify-center text-green-800 font-bold text-xl">
              ✓
            </div>
            <div>
              <div class="font-medium text-gray-900">Trabajado</div>
              <div class="text-xs text-gray-500">Marcaciones completas</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-blue-100 border-blue-300 flex items-center justify-center text-blue-800 font-bold text-xl">
              ○
            </div>
            <div>
              <div class="font-medium text-gray-900">Libre</div>
              <div class="text-xs text-gray-500">Día de descanso</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-red-100 border-red-300 flex items-center justify-center text-red-800 font-bold text-xl">
              ✗
            </div>
            <div>
              <div class="font-medium text-gray-900">Ausente</div>
              <div class="text-xs text-gray-500">Sin marcaciones</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-yellow-100 border-yellow-300 flex items-center justify-center text-yellow-800 font-bold text-xl">
              ⚠
            </div>
            <div>
              <div class="font-medium text-gray-900">Incidente</div>
              <div class="text-xs text-gray-500">Marcación incompleta</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-purple-100 border-purple-300 flex items-center justify-center text-purple-800 font-bold text-xl">
              📄
            </div>
            <div>
              <div class="font-medium text-gray-900">Justificado</div>
              <div class="text-xs text-gray-500">Ausencia justificada</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-gray-100 border-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl">
              —
            </div>
            <div>
              <div class="font-medium text-gray-900">Sin Turno</div>
              <div class="text-xs text-gray-500">Día previo a asignación</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Unificado con Vistas Deslizantes -->
    <div 
      v-if="diaSeleccionado" 
      class="fixed inset-0 bg-transparent backdrop-blur-sm bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="cerrarDetalleDia"
    >
      <div 
        class="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-lg bg-white overflow-hidden"
        @click.stop
      >
        <Transition :name="`slide-${direccionAnimacion}`" mode="out-in">
          <!-- VISTA 1: Detalle del Día -->
          <div v-if="vistaModal === 'detalle'" key="detalle" class="mt-3">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900 flex items-center">
              <span 
                class="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-xl"
                :class="getEstadoColor(diaSeleccionado.estado)"
              >
                {{ getEstadoIcono(diaSeleccionado.estado) }}
              </span>
              Detalle del {{ formatearFecha(diaSeleccionado.fecha) }}
            </h3>
            <button 
              @click="cerrarDetalleDia"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Estado del día -->
          <div class="mb-6">
            <div 
              class="inline-flex items-center px-4 py-2 rounded-lg text-base font-semibold border-2"
              :class="getEstadoColor(diaSeleccionado.estado)"
            >
              Estado: {{ formatearEstado(diaSeleccionado.estado) }}
            </div>
          </div>

          <!-- Información del turno -->
          <div v-if="diaSeleccionado.turno" class="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              Turno Asignado
            </h4>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-indigo-700 font-medium">Tipo:</span>
                <span class="text-indigo-900 ml-2">{{ diaSeleccionado.turno.tipo }}</span>
              </div>
              <div>
                <span class="text-indigo-700 font-medium">Horario:</span>
                <span class="text-indigo-900 ml-2">{{ diaSeleccionado.turno.horaInicio }} - {{ diaSeleccionado.turno.horaFin }}</span>
              </div>
            </div>
          </div>

          <!-- Información de Justificación -->
          <div v-if="diaSeleccionado.justificado && diaSeleccionado.justificacion" class="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-purple-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
              Día Justificado
            </h4>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-purple-700 font-medium">Tipo:</span>
                <span class="text-purple-900 ml-2">{{ getTipoJustificacionTexto(diaSeleccionado.justificacion.tipo) }}</span>
              </div>
              <div v-if="diaSeleccionado.justificacion.motivo">
                <span class="text-purple-700 font-medium">Motivo:</span>
                <p class="text-purple-900 mt-1">{{ diaSeleccionado.justificacion.motivo }}</p>
              </div>
            </div>
          </div>

          <!-- Marcaciones del día -->
          <div class="space-y-4">
            <!-- Hora de Entrada -->
            <div v-if="diaSeleccionado.horaEntrada" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    <h4 class="text-sm font-semibold text-green-900">Hora de Entrada</h4>
                  </div>
                  <p class="text-2xl font-bold text-green-900 ml-7">{{ diaSeleccionado.horaEntrada }}</p>
                  
                  <!-- Retraso -->
                  <div v-if="tieneRetraso(diaSeleccionado)" class="mt-2 ml-7">
                    <div class="inline-flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                      </svg>
                      Retraso: {{ formatearMinutosAHoras(diaSeleccionado.minutosRetraso) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hora de Salida -->
            <div v-if="diaSeleccionado.horaSalida" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                    <h4 class="text-sm font-semibold text-blue-900">Hora de Salida</h4>
                  </div>
                  <p class="text-2xl font-bold text-blue-900 ml-7">{{ diaSeleccionado.horaSalida }}</p>
                </div>
              </div>
            </div>

            <!-- Colación -->
            <div v-if="diaSeleccionado.horaInicioColacion && diaSeleccionado.horaFinColacion" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 mr-2 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
                <h4 class="text-sm font-semibold text-amber-900">Colación</h4>
              </div>
              <div class="ml-7 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-amber-700 font-medium">Inicio:</span>
                  <span class="text-amber-900 ml-1 font-semibold">{{ diaSeleccionado.horaInicioColacion }}</span>
                </div>
                <div>
                  <span class="text-amber-700 font-medium">Fin:</span>
                  <span class="text-amber-900 ml-1 font-semibold">{{ diaSeleccionado.horaFinColacion }}</span>
                </div>
              </div>
            </div>

            <!-- Resumen de horas -->
            <div v-if="diaSeleccionado.horasTrabajadas" class="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
                Resumen de Tiempo
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Horas Trabajadas:</span>
                  <span class="text-xl font-bold text-gray-900">{{ diaSeleccionado.horasTrabajadas }}</span>
                </div>
                
                <!-- Horas Extras -->
                <div v-if="tieneHorasExtras(diaSeleccionado)" class="flex justify-between items-center bg-purple-100 -mx-4 px-4 py-2 rounded">
                  <span class="text-purple-700 font-medium flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"/>
                    </svg>
                    Horas Extras:
                  </span>
                  <span class="text-lg font-bold text-purple-900">{{ formatearMinutosAHoras(diaSeleccionado.minutosExtra) }}</span>
                </div>
              </div>
            </div>

            <!-- Incidente -->
            <div v-if="diaSeleccionado.incidente" class="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-6 h-6 mr-3 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="text-sm font-semibold text-red-900 mb-1">Incidente Detectado</h4>
                  <p class="text-red-700 font-medium">{{ diaSeleccionado.incidente }}</p>
                  <p class="text-xs text-red-600 mt-1">Tipo: {{ diaSeleccionado.tipoIncidente }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              v-if="puedeSolicitarMarcacion(diaSeleccionado)"
              @click="abrirModalSolicitudMarcacion"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Solicitar Marcación
            </button>
            <button
              v-if="puedeJustificar(diaSeleccionado)"
              @click="abrirModalJustificacion"
              class="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Justificar Día
            </button>
            <button
              @click="cerrarDetalleDia"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
          </div>

          <!-- VISTA 2: Justificación (Placeholder - se implementará después) -->
          <div v-else-if="vistaModal === 'justificacion'" key="justificacion" class="mt-3">
            <div class="flex items-center justify-between mb-6">
              <button
                @click="cerrarModalJustificacion"
                class="text-gray-600 hover:text-gray-800 transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Volver
              </button>
              <h3 class="text-xl font-bold text-gray-900 flex items-center">
                <svg class="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Justificar Ausencia
              </h3>
              <button 
                @click="cerrarDetalleDia"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Alerta si ya existe justificación -->
            <div v-if="justificacionExistente" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                <div class="text-sm text-blue-800">
                  <p class="font-medium mb-1">Ya existe una justificación para este día</p>
                  <p><strong>Estado:</strong> {{ justificacionExistente.estado }}</p>
                  <p><strong>Tipo:</strong> {{ getTipoJustificacionTexto(justificacionExistente.tipo_justificacion) }}</p>
                </div>
              </div>
            </div>

            <!-- Mensaje de éxito -->
            <div v-if="successMessage" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm text-green-800 font-medium">{{ successMessage }}</p>
              </div>
            </div>

            <!-- Mensaje de error -->
            <div v-if="errorJustificacion" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm text-red-800 font-medium">{{ errorJustificacion }}</p>
              </div>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="enviarJustificacion" v-if="!successMessage && !justificacionExistente">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Rango de Fechas a Justificar *
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="fecha_inicio" class="block text-xs text-gray-600 mb-1">Desde</label>
                    <input 
                      id="fecha_inicio"
                      type="date"
                      v-model="justificacionForm.fecha_inicio"
                      :max="hoyISO"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    >
                  </div>
                  <div>
                    <label for="fecha_fin" class="block text-xs text-gray-600 mb-1">Hasta</label>
                    <input 
                      id="fecha_fin"
                      type="date"
                      v-model="justificacionForm.fecha_fin"
                      :min="justificacionForm.fecha_inicio"
                      :max="hoyISO"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    >
                  </div>
                </div>
                <p v-if="diasSeleccionados > 0" class="text-sm text-gray-600 mt-2">
                  📅 Total de días: <strong>{{ diasSeleccionados }}</strong>
                </p>
              </div>

              <div class="mb-4">
                <label for="tipo_justificacion" class="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Justificación *
                </label>
                <select 
                  id="tipo_justificacion"
                  v-model="justificacionForm.tipo_justificacion"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                >
                  <option value="licencia_medica">Licencia Médica</option>
                  <option value="permiso_personal">Permiso Personal</option>
                  <option value="permiso_administrativo">Permiso Administrativo</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div class="mb-4">
                <label for="motivo" class="block text-sm font-medium text-gray-700 mb-2">
                  Motivo *
                </label>
                <textarea 
                  id="motivo"
                  v-model="justificacionForm.motivo"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Describa brevemente el motivo de su ausencia..."
                  required
                ></textarea>
              </div>

              <div class="mb-6">
                <label for="archivo" class="block text-sm font-medium text-gray-700 mb-2">
                  Documento de Respaldo
                  <span class="text-gray-500 text-xs ml-1">(Opcional - Max 5MB)</span>
                </label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-yellow-400 transition-colors">
                  <div class="space-y-1 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="flex text-sm text-gray-600">
                      <label for="archivo" class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                        <span>Subir archivo</span>
                        <input 
                          id="archivo" 
                          type="file" 
                          class="sr-only" 
                          accept=".jpg,.jpeg,.png,.pdf"
                          @change="handleFileChange"
                        >
                      </label>
                      <p class="pl-1">o arrastra y suelta</p>
                    </div>
                    <p class="text-xs text-gray-500">JPG, PNG o PDF hasta 5MB</p>
                    <p v-if="archivoNombre" class="text-sm text-green-600 font-medium mt-2">
                      📎 {{ archivoNombre }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  type="button"
                  @click="cerrarModalJustificacion"
                  class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 font-medium"
                  :disabled="isLoadingJustificacion"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  :disabled="isLoadingJustificacion"
                >
                  <svg v-if="isLoadingJustificacion" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isLoadingJustificacion ? 'Enviando...' : 'Enviar Justificación' }}
                </button>
              </div>
            </form>

            <!-- Botón de cerrar si hay justificación existente -->
            <div v-if="justificacionExistente" class="mt-4">
              <button
                @click="cerrarModalJustificacion"
                class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>

          <!-- VISTA 3: Solicitud de Marcación -->
          <div v-else-if="vistaModal === 'solicitud'" key="solicitud" class="mt-3">
            <div class="flex items-center justify-between mb-6">
              <button
                @click="cerrarModalSolicitud"
                class="text-gray-600 hover:text-gray-800 transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Volver
              </button>
              <h3 class="text-xl font-bold text-gray-900">Solicitar Marcación</h3>
              <button 
                @click="cerrarDetalleDia"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Información de ayuda -->
            <div class="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-start">
                <div class="p-1 bg-blue-100 rounded-full mr-2 mt-0.5">
                  <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-xs font-medium text-blue-800 mb-1">Solicitud de Marcación</h4>
                  <p class="text-xs text-blue-700">
                    Complete los campos para solicitar el registro de una marcación. 
                    Esta solicitud será revisada por el equipo de supervisión.
                  </p>
                </div>
              </div>
            </div>

            <!-- Formulario de solicitud -->
            <div class="space-y-3">
              <!-- Tipo de marcación -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Marcación *
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <label 
                    v-for="tipo in tiposMarcacion" 
                    :key="tipo.value"
                    class="relative flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    :class="{
                      'border-indigo-500 bg-indigo-50': solicitudForm.tipo_marcacion_correcta === tipo.value,
                      'border-gray-300': solicitudForm.tipo_marcacion_correcta !== tipo.value
                    }"
                  >
                    <input 
                      type="radio" 
                      v-model="solicitudForm.tipo_marcacion_correcta" 
                      :value="tipo.value"
                      class="sr-only"
                    />
                    <div class="flex items-center">
                      <span class="text-base mr-2">{{ tipo.icon }}</span>
                      <span class="text-sm font-medium text-gray-900">{{ tipo.label }}</span>
                    </div>
                    <div 
                      v-if="solicitudForm.tipo_marcacion_correcta === tipo.value" 
                      class="absolute top-1 right-1 text-indigo-600"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </label>
                </div>
                <p v-if="solicitudErrors.tipo" class="text-xs text-red-600 mt-1">{{ solicitudErrors.tipo }}</p>
              </div>

              <!-- Fecha y Hora -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                  <input 
                    type="date" 
                    v-model="solicitudForm.fecha"
                    :min="fechaMinima"
                    :max="fechaMaxima"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                  <p v-if="solicitudErrors.fecha" class="text-xs text-red-600 mt-1">{{ solicitudErrors.fecha }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                  <input 
                    type="time" 
                    v-model="solicitudForm.hora"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                  <p v-if="solicitudErrors.hora" class="text-xs text-red-600 mt-1">{{ solicitudErrors.hora }}</p>
                </div>
              </div>

              <!-- Botones para fecha y hora -->
              <div class="flex flex-wrap gap-1">
                <button 
                  @click="usarFechaActual"
                  type="button"
                  class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors duration-200"
                >
                  Hoy
                </button>
                <button 
                  @click="usarFechaAyer"
                  type="button"
                  class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors duration-200"
                >
                  Ayer
                </button>
                <button 
                  @click="usarHoraActual"
                  type="button"
                  class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors duration-200"
                >
                  Hora actual
                </button>
              </div>

              <!-- Motivo de la solicitud -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Motivo de la Solicitud *</label>
                <select 
                  v-model="solicitudForm.motivo" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  required
                >
                  <option value="">Selecciona el motivo</option>
                  <option 
                    v-for="motivo in motivosSolicitud" 
                    :key="motivo.value"
                    :value="motivo.value"
                  >
                    {{ motivo.label }} - {{ motivo.descripcion }}
                  </option>
                </select>
                <p v-if="solicitudErrors.motivo" class="text-xs text-red-600 mt-1">{{ solicitudErrors.motivo }}</p>
              </div>

              <!-- Descripción detallada -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada *</label>
                <textarea 
                  v-model="solicitudForm.descripcion" 
                  rows="2" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Explica el motivo de tu solicitud..."
                  maxlength="500"
                  required
                ></textarea>
                <div class="flex justify-between mt-1">
                  <p v-if="solicitudErrors.descripcion" class="text-xs text-red-600">{{ solicitudErrors.descripcion }}</p>
                  <p class="text-xs text-gray-500 ml-auto">{{ solicitudForm.descripcion?.length || 0 }}/500</p>
                </div>
              </div>

              <!-- Ubicación GPS -->
              <div class="border border-gray-200 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                  <label class="text-sm font-medium text-gray-700">Ubicación GPS (Opcional)</label>
                  <button 
                    @click="obtenerUbicacion"
                    :disabled="obteniendoUbicacion"
                    type="button"
                    class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors duration-200 disabled:opacity-50"
                  >
                    {{ obteniendoUbicacion ? 'Obteniendo...' : 'Obtener GPS' }}
                  </button>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Latitud</label>
                    <input 
                      type="number" 
                      v-model="solicitudForm.latitud"
                      step="any"
                      placeholder="-33.4489"
                      class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Longitud</label>
                    <input 
                      type="number" 
                      v-model="solicitudForm.longitud"
                      step="any"
                      placeholder="-70.6693"
                      class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>
                
                <!-- Información de ubicación -->
                <div v-if="solicitudForm.latitud && solicitudForm.longitud" class="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p class="text-xs text-green-700">
                    📍 GPS: {{ parseFloat(solicitudForm.latitud).toFixed(4) }}, {{ parseFloat(solicitudForm.longitud).toFixed(4) }}
                  </p>
                </div>
                
                <!-- Error de ubicación -->
                <div v-if="errorUbicacion" class="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p class="text-xs text-red-700">{{ errorUbicacion }}</p>
                </div>
              </div>
            </div>

            <!-- Estado de envío -->
            <div v-if="enviandoSolicitud" class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center">
                <svg class="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm text-blue-700">Enviando solicitud...</span>
              </div>
            </div>

            <!-- Mensaje de error general -->
            <div v-if="solicitudErrors.general" class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-700">{{ solicitudErrors.general }}</p>
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <button 
                @click="cerrarModalSolicitud" 
                :disabled="enviandoSolicitud"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                @click="enviarSolicitudMarcacion" 
                :disabled="enviandoSolicitud || !isFormSolicitudValid"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ enviandoSolicitud ? 'Enviando...' : 'Enviar Solicitud' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Modal antiguo de Justificación - TEMPORAL (se eliminará) -->
    <div 
      v-if="mostrarModalJustificacion" 
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="cerrarModalJustificacion"
    >
      <div 
        class="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-lg rounded-lg bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900 flex items-center">
              <svg class="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Justificar Ausencia
            </h3>
            <button 
              @click="cerrarModalJustificacion"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Alerta si ya existe justificación -->
          <div v-if="justificacionExistente" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">Ya existe una justificación para este día</p>
                <p><strong>Estado:</strong> {{ justificacionExistente.estado }}</p>
                <p><strong>Tipo:</strong> {{ getTipoJustificacionTexto(justificacionExistente.tipo_justificacion) }}</p>
              </div>
            </div>
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="successMessage" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-green-800 font-medium">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Mensaje de error -->
          <div v-if="errorJustificacion" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-800 font-medium">{{ errorJustificacion }}</p>
            </div>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="enviarJustificacion" v-if="!successMessage && !justificacionExistente">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rango de Fechas a Justificar *
              </label>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="fecha_inicio" class="block text-xs text-gray-600 mb-1">Desde</label>
                  <input 
                    id="fecha_inicio"
                    type="date"
                    v-model="justificacionForm.fecha_inicio"
                    :max="hoyISO"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                </div>
                <div>
                  <label for="fecha_fin" class="block text-xs text-gray-600 mb-1">Hasta</label>
                  <input 
                    id="fecha_fin"
                    type="date"
                    v-model="justificacionForm.fecha_fin"
                    :min="justificacionForm.fecha_inicio"
                    :max="hoyISO"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                </div>
              </div>
              <p v-if="diasSeleccionados > 0" class="text-sm text-gray-600 mt-2">
                📅 Total de días: <strong>{{ diasSeleccionados }}</strong>
              </p>
            </div>

            <div class="mb-4">
              <label for="tipo_justificacion" class="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Justificación *
              </label>
              <select 
                id="tipo_justificacion"
                v-model="justificacionForm.tipo_justificacion"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                required
              >
                <option value="licencia_medica">Licencia Médica</option>
                <option value="permiso_personal">Permiso Personal</option>
                <option value="permiso_administrativo">Permiso Administrativo</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div class="mb-4">
              <label for="motivo" class="block text-sm font-medium text-gray-700 mb-2">
                Motivo *
              </label>
              <textarea 
                id="motivo"
                v-model="justificacionForm.motivo"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Describa brevemente el motivo de su ausencia..."
                required
              ></textarea>
            </div>

            <div class="mb-6">
              <label for="archivo" class="block text-sm font-medium text-gray-700 mb-2">
                Documento de Respaldo
                <span class="text-gray-500 text-xs ml-1">(Opcional - Max 5MB)</span>
              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-yellow-400 transition-colors">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="archivo" class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                      <span>Subir archivo</span>
                      <input 
                        id="archivo" 
                        type="file" 
                        class="sr-only" 
                        accept=".jpg,.jpeg,.png,.pdf"
                        @change="handleFileChange"
                      >
                    </label>
                    <p class="pl-1">o arrastra y suelta</p>
                  </div>
                  <p class="text-xs text-gray-500">JPG, PNG o PDF hasta 5MB</p>
                  <p v-if="archivoNombre" class="text-sm text-green-600 font-medium mt-2">
                    📎 {{ archivoNombre }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                @click="cerrarModalJustificacion"
                class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 font-medium"
                :disabled="isLoadingJustificacion"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                :disabled="isLoadingJustificacion"
              >
                <svg v-if="isLoadingJustificacion" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoadingJustificacion ? 'Enviando...' : 'Enviar Justificación' }}
              </button>
            </div>
          </form>

          <!-- Botón de cerrar si hay justificación existente -->
          <div v-if="justificacionExistente" class="mt-4">
            <button
              @click="cerrarModalJustificacion"
              class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useDiasTrabajados } from '@/composables/use-dias-trabajados';
import { useJustificaciones } from '@/composables/use-justificaciones';
import { useMarcaciones } from '@/composables/use-marcaciones';
import diasTrabajadosService from '@/services/dias-trabajados-service';

// Composable
const {
  isLoading,
  isLoadingHorasExtras,
  error,
  mesActual,
  anioActual,
  nombreMes,
  diasCalendario,
  estadisticasMes,
  horasExtrasInfo,
  fetchDiasTrabajados,
  fetchHorasExtras,
  cambiarMes,
  irMesActual,
  getEstadoColor,
  getEstadoIcono,
  formatearMinutosAHoras,
  tieneHorasExtras,
  tieneRetraso
} = useDiasTrabajados();

// Composable de justificaciones
const {
  isLoading: isLoadingJustificacion,
  error: errorJustificacion,
  crearJustificacion,
  obtenerJustificacionPorFecha,
  limpiarError
} = useJustificaciones();

// Composable de marcaciones
const {
  getTiposMarcacion,
  getMotivosSolicitud,
  validarMarcacion,
  obtenerUbicacionGPS,
  getFechaMinima,
  getFechaMaxima,
  getHoraActual,
  solicitarMarcacion
} = useMarcaciones();

// Estado local
const diaSeleccionado = ref(null);
const vistaModal = ref('detalle'); // 'detalle', 'justificacion', 'solicitud'
const direccionAnimacion = ref('left'); // 'left' o 'right'
const notificacion = ref({
  mostrar: false,
  mensaje: '',
  tipo: 'info' // 'info', 'error', 'warning', 'success'
});
const exportMenuRef = ref(null);
const mostrarExportDropdown = ref(false);
const isExporting = ref(false);
const exportTipoEnProceso = ref('');
const exportRangeForm = ref({
  fechaInicio: '',
  fechaFin: ''
});
const justificacionForm = ref({
  fecha_inicio: '',
  fecha_fin: '',
  motivo: '',
  tipo_justificacion: 'licencia_medica',
  archivo: null
});
const archivoNombre = ref('');
const successMessage = ref('');
const justificacionExistente = ref(null);

// Estados para formulario de solicitud de marcación
const solicitudForm = ref({
  tipo_marcacion_correcta: '',
  fecha: '',
  hora: '',
  motivo: '',
  descripcion: '',
  latitud: '',
  longitud: ''
});
const solicitudErrors = ref({});
const enviandoSolicitud = ref(false);
const obteniendoUbicacion = ref(false);
const errorUbicacion = ref('');

// Datos auxiliares para solicitud
const tiposMarcacion = getTiposMarcacion();
const motivosSolicitud = getMotivosSolicitud();
const fechaMinima = getFechaMinima();
const fechaMaxima = getFechaMaxima();

// Fecha de hoy en formato ISO para validación
const hoyISO = computed(() => {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
});

// Calcular días seleccionados
const diasSeleccionados = computed(() => {
  if (!justificacionForm.value.fecha_inicio || !justificacionForm.value.fecha_fin) {
    return 0;
  }
  
  const inicio = new Date(justificacionForm.value.fecha_inicio);
  const fin = new Date(justificacionForm.value.fecha_fin);
  
  if (inicio > fin) return 0;
  
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 para incluir ambos días
});

// Funciones para notificaciones
const mostrarNotificacion = (mensaje, tipo = 'info') => {
  notificacion.value = { mostrar: true, mensaje, tipo };
  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    cerrarNotificacion();
  }, 5000);
};

const cerrarNotificacion = () => {
  notificacion.value.mostrar = false;
};

const formatearFechaYYYYMMDD = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const obtenerRangoMesVisible = () => {
  const inicio = new Date(anioActual.value, mesActual.value, 1);
  const fin = new Date(anioActual.value, mesActual.value + 1, 0);
  return {
    fechaInicio: formatearFechaYYYYMMDD(inicio),
    fechaFin: formatearFechaYYYYMMDD(fin)
  };
};

const inicializarRangoExportacion = () => {
  const rango = obtenerRangoMesVisible();
  exportRangeForm.value.fechaInicio = rango.fechaInicio;
  exportRangeForm.value.fechaFin = rango.fechaFin;
};

const toggleExportDropdown = () => {
  if (isLoading.value || isExporting.value) return;
  mostrarExportDropdown.value = !mostrarExportDropdown.value;
};

const cerrarExportDropdown = () => {
  mostrarExportDropdown.value = false;
};

const handleClickOutsideExport = (event) => {
  if (exportMenuRef.value && !exportMenuRef.value.contains(event.target)) {
    cerrarExportDropdown();
  }
};

const validarRangoExportacion = () => {
  if (!exportRangeForm.value.fechaInicio || !exportRangeForm.value.fechaFin) {
    mostrarNotificacion('Debes seleccionar fecha de inicio y fecha de fin', 'warning');
    return false;
  }

  if (exportRangeForm.value.fechaInicio > exportRangeForm.value.fechaFin) {
    mostrarNotificacion('La fecha de inicio no puede ser mayor a la fecha de fin', 'warning');
    return false;
  }

  return true;
};

const descargarArchivo = (blob, nombreArchivo) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const exportarAsistenciaTrabajador = async (formato) => {
  if (!validarRangoExportacion()) return;

  isExporting.value = true;
  exportTipoEnProceso.value = formato;

  try {
    const { fechaInicio, fechaFin } = exportRangeForm.value;
    const nombreBase = `asistencia_${fechaInicio}_${fechaFin}`;

    if (formato === 'csv') {
      const blob = await diasTrabajadosService.exportarAsistenciaTrabajadorCSV(fechaInicio, fechaFin);
      descargarArchivo(blob, `${nombreBase}.csv`);
    } else {
      const blob = await diasTrabajadosService.exportarAsistenciaTrabajadorExcel(fechaInicio, fechaFin);
      descargarArchivo(blob, `${nombreBase}.xlsx`);
    }

    mostrarNotificacion(`Asistencia exportada correctamente en formato ${formato.toUpperCase()}`, 'success');
    cerrarExportDropdown();
  } catch (error) {
    console.error(`Error al exportar asistencia en ${formato}:`, error);
    mostrarNotificacion('No se pudo exportar la asistencia. Intenta nuevamente.', 'error');
  } finally {
    isExporting.value = false;
    exportTipoEnProceso.value = '';
  }
};

// Cargar calendario al montar
onMounted(() => {
  cargarCalendario();
  inicializarRangoExportacion();
  document.addEventListener('click', handleClickOutsideExport);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideExport);
});

// Recargar cuando cambie el mes o año
watch([mesActual, anioActual], () => {
  cargarCalendario();
  inicializarRangoExportacion();
});

// Funciones
const cargarCalendario = async () => {
  await Promise.all([
    fetchDiasTrabajados(mesActual.value, anioActual.value),
    fetchHorasExtras(mesActual.value, anioActual.value)
  ]);
};

const recargarCalendario = () => {
  cargarCalendario();
};

const mostrarDetalleDia = (dia) => {
  diaSeleccionado.value = dia;
};

const cerrarDetalleDia = () => {
  diaSeleccionado.value = null;
  vistaModal.value = 'detalle';
  direccionAnimacion.value = 'left';
};

const formatearEstado = (estado) => {
  const estados = {
    'trabajado': 'Trabajado',
    'libre': 'Libre',
    'ausente': 'Ausente',
    'incidente': 'Incidente',
    'justificado': 'Justificado',
    'sin_turno': 'Sin Turno Asignado'
  };
  return estados[estado] || estado;
};

const getEstadoColorTexto = (estado) => {
  const colores = {
    'trabajado': 'text-green-600',
    'libre': 'text-blue-600',
    'ausente': 'text-red-600',
    'incidente': 'text-yellow-600',
    'justificado': 'text-purple-600',
    'sin_turno': 'text-gray-600'
  };
  return colores[estado] || 'text-gray-600';
};

const formatearFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split('-');
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${dia} de ${meses[parseInt(mes) - 1]} de ${anio}`;
};

// Funciones de justificación
const abrirModalJustificacion = async () => {
  // Inicializar formulario con la fecha del día seleccionado
  justificacionForm.value = {
    fecha_inicio: diaSeleccionado.value.fecha,
    fecha_fin: diaSeleccionado.value.fecha,
    motivo: '',
    tipo_justificacion: 'licencia_medica',
    archivo: null
  };
  archivoNombre.value = '';
  successMessage.value = '';
  limpiarError();
  
  // Verificar si ya existe una justificación para esta fecha
  justificacionExistente.value = await obtenerJustificacionPorFecha(diaSeleccionado.value.fecha);
  
  // Cambiar a vista de justificación con animación hacia la izquierda
  direccionAnimacion.value = 'left';
  vistaModal.value = 'justificacion';
};

const cerrarModalJustificacion = () => {
  // Volver a vista de detalle con animación hacia la derecha
  direccionAnimacion.value = 'right';
  vistaModal.value = 'detalle';
  
  justificacionForm.value = {
    fecha_inicio: '',
    fecha_fin: '',
    motivo: '',
    tipo_justificacion: 'licencia_medica',
    archivo: null
  };
  archivoNombre.value = '';
  successMessage.value = '';
  justificacionExistente.value = null;
  limpiarError();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      mostrarNotificacion('El archivo no debe superar los 5MB', 'warning');
      event.target.value = '';
      return;
    }
    
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      mostrarNotificacion('Solo se permiten archivos JPG, PNG o PDF', 'warning');
      event.target.value = '';
      return;
    }
    
    justificacionForm.value.archivo = file;
    archivoNombre.value = file.name;
  }
};

const enviarJustificacion = async () => {
  if (!justificacionForm.value.motivo || !justificacionForm.value.motivo.trim()) {
    mostrarNotificacion('Debe ingresar un motivo para la justificación', 'warning');
    return;
  }

  if (!justificacionForm.value.fecha_inicio || !justificacionForm.value.fecha_fin) {
    mostrarNotificacion('Debe seleccionar las fechas de la justificación', 'warning');
    return;
  }

  const data = {
    fecha_inicio: justificacionForm.value.fecha_inicio,
    fecha_fin: justificacionForm.value.fecha_fin,
    motivo: justificacionForm.value.motivo.trim(),
    tipo_justificacion: justificacionForm.value.tipo_justificacion
  };

  const result = await crearJustificacion(data, justificacionForm.value.archivo);

  if (result.success) {
    const dias = diasSeleccionados.value;
    successMessage.value = `Justificación de ${dias} día${dias > 1 ? 's' : ''} enviada correctamente. Será revisada por un administrador.`;
    
    // Esperar 2 segundos y volver a vista de detalle
    setTimeout(() => {
      successMessage.value = '';
      cerrarModalJustificacion();
      // Recargar el calendario
      cargarCalendario();
    }, 2500);
  }
};

const puedeSolicitarMarcacion = (dia) => {
  return dia && (dia.estado === 'ausente' || dia.estado === 'incidente' || dia.estado === 'sin_turno');
};

const abrirModalSolicitudMarcacion = () => {
  // Inicializar formulario con datos del día
  inicializarFormularioSolicitud();
  
  // Cambiar a vista de solicitud con animación hacia la izquierda
  direccionAnimacion.value = 'left';
  vistaModal.value = 'solicitud';
};

const cerrarModalSolicitud = () => {
  // Volver a vista de detalle con animación hacia la derecha
  direccionAnimacion.value = 'right';
  vistaModal.value = 'detalle';
};

const manejarSolicitudMarcacion = async (solicitudData) => {
  const result = await solicitarMarcacion(solicitudData);
  
  if (result.success) {
    // Mostrar mensaje de éxito
    console.log('Solicitud de marcación enviada exitosamente:', result.message);
    
    // Volver a vista de detalle
    cerrarModalSolicitud();
    
    // Mostrar notificación de éxito
    setTimeout(() => {
      mostrarNotificacion('Solicitud de marcación enviada correctamente. Será revisada por tu supervisor.', 'success');
    }, 300);
    
    // Recargar el calendario para reflejar cambios
    await cargarCalendario();
  } else {
    // Mostrar mensaje de error
    console.error('Error enviando solicitud:', result.error);
    mostrarNotificacion('Error al enviar la solicitud: ' + result.error, 'error');
  }
};

const puedeJustificar = (dia) => {
  return dia && (dia.estado === 'ausente' || dia.estado === 'incidente');
};

const getTipoJustificacionTexto = (tipo) => {
  const tipos = {
    'licencia_medica': 'Licencia Médica',
    'permiso_personal': 'Permiso Personal',
    'permiso_administrativo': 'Permiso Administrativo',
    'vacaciones': 'Vacaciones',
    'otro': 'Otro'
  };
  return tipos[tipo] || tipo;
};

// === Funciones del Formulario de Solicitud de Marcación ===

const inicializarFormularioSolicitud = () => {
  solicitudForm.value = {
    tipo_marcacion_correcta: '',
    fecha: diaSeleccionado.value?.fecha || '',
    hora: getHoraActual(),
    motivo: '',
    descripcion: '',
    latitud: '',
    longitud: ''
  };
  solicitudErrors.value = {};
  errorUbicacion.value = '';
};

const isFormSolicitudValid = computed(() => {
  return solicitudForm.value.tipo_marcacion_correcta.trim() !== '' && 
         solicitudForm.value.fecha.trim() !== '' &&
         solicitudForm.value.hora.trim() !== '' &&
         solicitudForm.value.motivo.trim() !== '' &&
         solicitudForm.value.descripcion.trim() !== '' &&
         solicitudForm.value.descripcion.trim().length >= 10;
});

const usarFechaActual = () => {
  const hoy = new Date();
  solicitudForm.value.fecha = hoy.toISOString().split('T')[0];
};

const usarFechaAyer = () => {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  solicitudForm.value.fecha = ayer.toISOString().split('T')[0];
};

const usarHoraActual = () => {
  solicitudForm.value.hora = getHoraActual();
};

const obtenerUbicacion = async () => {
  obteniendoUbicacion.value = true;
  errorUbicacion.value = '';
  
  try {
    const coords = await obtenerUbicacionGPS();
    if (coords) {
      solicitudForm.value.latitud = coords.latitud.toString();
      solicitudForm.value.longitud = coords.longitud.toString();
    } else {
      errorUbicacion.value = 'No se pudo obtener la ubicación';
    }
  } catch (error) {
    errorUbicacion.value = error.message || 'Error al obtener ubicación';
  } finally {
    obteniendoUbicacion.value = false;
  }
};

const validarFormularioSolicitud = () => {
  const validacion = validarMarcacion({
    ...solicitudForm.value,
    motivo: solicitudForm.value.descripcion
  });
  
  if (!validacion.esValido) {
    solicitudErrors.value = validacion.errores;
    return false;
  }
  
  solicitudErrors.value = {};
  return true;
};

const enviarSolicitudMarcacion = async () => {
  if (!validarFormularioSolicitud()) return;
  
  enviandoSolicitud.value = true;
  
  try {
    const solicitudData = {
      tipo_marcacion_correcta: solicitudForm.value.tipo_marcacion_correcta,
      fecha: solicitudForm.value.fecha,
      hora: solicitudForm.value.hora,
      motivo: solicitudForm.value.motivo,
      descripcion: solicitudForm.value.descripcion,
      geo_lat: solicitudForm.value.latitud ? parseFloat(solicitudForm.value.latitud) : null,
      geo_lon: solicitudForm.value.longitud ? parseFloat(solicitudForm.value.longitud) : null,
      estado: 'pendiente',
      fecha_solicitud: new Date().toISOString()
    };
    
    await manejarSolicitudMarcacion(solicitudData);
  } catch (error) {
    console.error('Error enviando solicitud:', error);
    mostrarNotificacion('Error al procesar la solicitud', 'error');
  } finally {
    enviandoSolicitud.value = false;
  }
};

</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.min-h-32 {
  min-height: 8rem;
}

/* Animaciones de deslizamiento hacia la izquierda */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Animaciones de deslizamiento hacia la derecha */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Animación para notificación toast */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
