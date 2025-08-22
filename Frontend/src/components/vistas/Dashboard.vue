<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Content area -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Panel de Control
            </h3>
            
            <!-- Indicador de estado de conexión -->
            <div class="mb-4 p-4 rounded-lg" :class="getConnectionStatusClass()">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <!-- Spinner para sincronización -->
                  <svg v-if="isSyncing" class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <!-- Icono de offline -->
                  <svg v-else-if="isOffline" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <!-- Icono de online -->
                  <svg v-else class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium" :class="getConnectionTextClass()">
                    {{ getConnectionStatusText() }}
                  </p>
                  <p class="text-xs" :class="getConnectionSubTextClass()">
                    {{ getConnectionSubText() }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Mostrar acciones pendientes si las hay -->
            <div v-if="pendingActions.length > 0" class="mb-4 p-4 bg-blue-100 border border-blue-400 rounded-lg">
              <h4 class="text-sm font-medium text-blue-800 mb-2">
                Marcaciones pendientes de sincronización ({{ pendingActions.length }})
              </h4>
              <ul class="text-xs text-blue-600 space-y-1">
                <li v-for="action in pendingActions" :key="action.id" class="flex justify-between items-center">
                  <span>{{ action.userFriendlyName }} - {{ formatearFechaCompleta(action.timestamp) }}</span>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                    Pendiente
                  </span>
                </li>
              </ul>
            </div>
            
            <!-- Horario del Día -->
            <div class="mb-6 bg-white p-6 rounded-lg shadow border">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Mi Horario de Hoy
              </h3>
              
              <div v-if="isLoadingHorario" class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span class="ml-3 text-gray-600">Cargando horario...</span>
              </div>
              
              <div v-else-if="horarioHoy" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Turno -->
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div class="flex items-center mb-2">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0h2l-2 2-2-2h2z"></path>
                    </svg>
                    <span class="font-medium text-blue-900">Turno</span>
                  </div>
                  <p class="text-lg font-bold text-blue-800 capitalize">{{ horarioHoy.tipo || 'No asignado' }}</p>
                </div>
                
                <!-- Hora de Entrada -->
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div class="flex items-center mb-2">
                    <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    <span class="font-medium text-green-900">Entrada</span>
                  </div>
                  <p class="text-lg font-bold text-green-800">{{ formatearHora(horarioHoy.inicio) || '--:--' }}</p>
                </div>
                
                <!-- Horario de Colación -->
                <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div class="flex items-center mb-2">
                    <svg class="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="font-medium text-orange-900">Colación</span>
                  </div>
                  <p class="text-sm font-bold text-orange-800">
                    {{ formatearHora(horarioHoy.colacion_inicio) || '--:--' }} - {{ formatearHora(horarioHoy.colacion_fin) || '--:--' }}
                  </p>
                </div>
                
                <!-- Hora de Salida -->
                <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div class="flex items-center mb-2">
                    <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span class="font-medium text-red-900">Salida</span>
                  </div>
                  <p class="text-lg font-bold text-red-800">{{ formatearHora(horarioHoy.fin) || '--:--' }}</p>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-sm">No tienes horario asignado para hoy</p>
                <button
                  @click="cargarHorarioHoy"
                  class="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Recargar horario
                </button>
              </div>
            </div>
            
            <!-- Control de Asistencia -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Panel de Registro -->
              <div class="bg-white p-6 rounded-lg shadow border">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Control de Asistencia
                </h3>
                
                <!-- Estado actual -->
                <div class="mb-4 p-3 rounded-lg" :class="statusColor">
                  <p class="text-sm font-medium">{{ statusText }}</p>
                  <p class="text-xs opacity-75">{{ currentDateTime }}</p>
                  
                  <!-- Indicador de ubicación -->
                  <div class="mt-2 flex items-center text-xs">
                    <svg v-if="ubicacionActual" class="w-3 h-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                    <svg v-else class="w-3 h-3 mr-1 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span :class="ubicacionActual ? 'text-green-700' : 'text-yellow-700'">
                      {{ ubicacionActual ? 'Ubicación detectada' : (errorUbicacion || 'Obteniendo ubicación...') }}
                    </span>
                  </div>
                </div>

                <!-- Botones de Entrada/Salida -->
                <div class="space-y-3">
                  <button
                    @click="registrarEntrada"
                    :disabled="botonesMarcacionDeshabilitados || currentStatus === 'dentro'"
                    class="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="isRegistering && pendingAction === 'entrada'" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    {{ isRegistering && pendingAction === 'entrada' ? 'Registrando...' : 'Registrar Entrada' }}
                  </button>

                  <button
                    @click="registrarSalida"
                    :disabled="isRegistering || !puedeMarcarSalida"
                    class="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="isRegistering && pendingAction === 'salida'" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    {{ isRegistering && pendingAction === 'salida' ? 'Registrando...' : 'Registrar Salida' }}
                  </button>

                  <!-- Botones de colación actualizados -->
                  <div class="grid grid-cols-2 gap-2 mt-4">
                    <!-- Botón de Iniciar Colación -->
                    <button
                      v-if="!tieneColacionActiva"
                      @click="registrarColacion"
                      :disabled="isRegistering || !puedeMarcarColacion"
                      class="flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isRegistering && pendingAction === 'colacion'" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {{ isRegistering && pendingAction === 'colacion' ? '...' : 'Iniciar Colación' }}
                    </button>

                    <!-- Botón de Terminar Colación -->
                    <button
                      v-if="tieneColacionActiva"
                      @click="terminarColacion"
                      :disabled="isRegistering || !puedeTerminarColacion"
                      class="flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isRegistering && pendingAction === 'termino_colacion'" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      {{ isRegistering && pendingAction === 'termino_colacion' ? '...' : 'Terminar Colación' }}
                    </button>

                    <button
                      @click="registrarDescanso"
                      :disabled="isRegistering || currentStatus === 'fuera'"
                      class="flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isRegistering && pendingAction === 'descanso'" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      {{ isRegistering && pendingAction === 'descanso' ? '...' : 'Descanso' }}
                    </button>
                  </div>
                </div>

                <!-- Mensaje de resultado actualizado -->
                <div v-if="message" class="mt-4 p-3 rounded-lg" :class="getMessageClasses(messageType)">
                  <p class="text-sm">{{ message }}</p>
                </div>

                <!-- Mensaje informativo cuando ya tiene entrada y salida -->
                <div v-if="tieneEntradaYSalida" class="mt-4 p-3 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                  <p class="text-sm">✅ Jornada laboral completada. Ya tienes registradas tu entrada y salida del día.</p>
                </div>

                <!-- Mensaje informativo cuando está en colación -->
                <div v-if="tieneColacionActiva" class="mt-4 p-3 rounded-lg bg-orange-100 text-orange-700 border border-orange-200">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-sm font-medium">🍽️ Actualmente en colación</p>
                  </div>
                  <p class="text-xs mt-1 opacity-75">Recuerda terminar tu colación antes de marcar salida</p>
                </div>
              </div>

              <!-- Historial del Día -->
              <div class="bg-white p-6 rounded-lg shadow border">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Historial de Hoy
                </h3>

                <!-- Resumen del día -->
                <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600">Tiempo trabajado:</span>
                      <p class="font-semibold text-gray-900">{{ tiempoTrabajado }}</p>
                    </div>
                    <div>
                      <span class="text-gray-600">Registros:</span>
                      <p class="font-semibold text-gray-900">{{ marcacionesHoy.length }} eventos</p>
                    </div>
                  </div>
                </div>

                <!-- Lista de marcaciones -->
                <div class="max-h-64 overflow-y-auto">
                  <div v-if="marcacionesHoy.length === 0" class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p class="text-sm">No hay marcaciones para hoy</p>
                  </div>

                  <div v-else class="space-y-2">
                    <div
                      v-for="(marcacion, index) in marcacionesHoy"
                      :key="index"
                      class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div class="flex items-center">
                        <div class="w-3 h-3 rounded-full mr-3" :class="getColorByType(marcacion.tipo, marcacion)"></div>
                        <div>
                          <p class="text-sm font-medium text-gray-900 capitalize">{{ getTipoLabel(marcacion.tipo, marcacion) }}</p>
                          <p class="text-xs text-gray-500">{{ formatearFecha(marcacion.fecha) }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">{{ formatearHora(marcacion.hora) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botón para refrescar -->
                <button
                  @click="cargarMarcacionesHoy"
                  :disabled="isLoadingMarcaciones"
                  class="mt-4 w-full text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  <svg v-if="isLoadingMarcaciones" class="animate-spin inline w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isLoadingMarcaciones ? 'Actualizando...' : 'Actualizar marcaciones' }}
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AsistenciaService from '../../services/AsistenciaService.js'
import { useOffline } from '../../composables/useOffline.js'

// Agregar composable offline
const { isOnline, isOffline, pendingActions, processPendingActions, isSyncing } = useOffline()

// Estado para el control de asistencia
const currentStatus = ref('fuera') // 'dentro' | 'fuera'
const isRegistering = ref(false)
const pendingAction = ref(null) // 'entrada' | 'salida'
const message = ref('')
const messageType = ref('success') // 'success' | 'error' | 'info' | 'warning'
const currentDateTime = ref('')

// Estado para geolocalización
const ubicacionActual = ref(null)
const errorUbicacion = ref('')

// Estado para marcaciones del día
const marcacionesHoy = ref([])
const isLoadingMarcaciones = ref(false)

// Estado para horario del usuario
const horarioHoy = ref(null)
const isLoadingHorario = ref(false)

// Timer para actualizar la fecha/hora
let dateTimeInterval = null

// Computed properties
const statusText = computed(() => {
  return currentStatus.value === 'dentro' 
    ? 'Estás dentro del trabajo' 
    : 'Estás fuera del trabajo'
})

const statusColor = computed(() => {
  return currentStatus.value === 'dentro'
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800'
})

// Computed para calcular el estado actual basado en las marcaciones
const estadoCalculado = computed(() => {
  if (marcacionesHoy.value.length === 0) return 'fuera'
  
  // Ordenar marcaciones por hora (más reciente primero)
  const marcacionesOrdenadas = [...marcacionesHoy.value].sort((a, b) => {
    const horaA = a.hora || '00:00:00'
    const horaB = b.hora || '00:00:00'
    return horaB.localeCompare(horaA)
  })
  
  // La última marcación determina el estado
  const ultimaMarcacion = marcacionesOrdenadas[0]
  
  if (!ultimaMarcacion) return 'fuera'
  
  // Si la última marcación es entrada -> dentro
  // Si la última marcación es salida -> fuera
  // Colación y descanso no cambian el estado laboral
  if (ultimaMarcacion.tipo === 'entrada') {
    return 'dentro'
  } else if (ultimaMarcacion.tipo === 'salida') {
    return 'fuera'
  }
  
  // Para colación y descanso, buscar la última entrada/salida
  for (const marcacion of marcacionesOrdenadas) {
    if (marcacion.tipo === 'entrada') {
      return 'dentro'
    } else if (marcacion.tipo === 'salida') {
      return 'fuera'
    }
  }
  
  return 'fuera'
})

const tiempoTrabajado = computed(() => {
  if (marcacionesHoy.value.length === 0) return '00:00:00'
  
  // Ordenar marcaciones por fecha y hora cronológicamente
  const marcacionesOrdenadas = [...marcacionesHoy.value].sort((a, b) => {
    // Mejorar el parsing de fechas para manejar formatos del servidor
    let fechaHoraA, fechaHoraB
    
    try {
      // Si la fecha viene en formato ISO, extraer solo la fecha
      const fechaA = a.fecha.includes('T') ? a.fecha.split('T')[0] : a.fecha
      const fechaB = b.fecha.includes('T') ? b.fecha.split('T')[0] : b.fecha
      
      fechaHoraA = new Date(`${fechaA}T${a.hora}`)
      fechaHoraB = new Date(`${fechaB}T${b.hora}`)
    } catch (error) {
      console.warn('Error parseando fechas:', error)
      fechaHoraA = new Date(`${a.fecha}T${a.hora}`)
      fechaHoraB = new Date(`${b.fecha}T${b.hora}`)
    }
    
    return fechaHoraA.getTime() - fechaHoraB.getTime()
  })
  
  let tiempoTotal = 0
  let ultimaEntrada = null

  // Procesar cada marcación en orden cronológico
  marcacionesOrdenadas.forEach((marcacion, index) => {
    try {
      // Mejorar el parsing de fechas
      const fechaLimpia = marcacion.fecha.includes('T') ? marcacion.fecha.split('T')[0] : marcacion.fecha
      const fechaHoraMarcacion = new Date(`${fechaLimpia}T${marcacion.hora}`)
      
      
      if (marcacion.tipo === 'entrada') {
        ultimaEntrada = fechaHoraMarcacion
      } else if (marcacion.tipo === 'salida' && ultimaEntrada) {
        // Calcular tiempo trabajado desde la última entrada hasta esta salida
        const tiempoSegmento = fechaHoraMarcacion.getTime() - ultimaEntrada.getTime()
        tiempoTotal += tiempoSegmento
                
        ultimaEntrada = null // Resetear entrada
      }
      // Nota: colación y descanso no afectan el cálculo del tiempo trabajado
    } catch (error) {
      console.error('Error procesando marcación:', marcacion, error)
    }
  })
  
  // Si hay una entrada sin salida correspondiente (trabajando actualmente)
  if (ultimaEntrada && estadoCalculado.value === 'dentro') {
    const tiempoActual = new Date().getTime() - ultimaEntrada.getTime()
    tiempoTotal += tiempoActual
    const minutosActuales = Math.floor(tiempoActual / (1000 * 60))
    console.log(`  ⏰ Tiempo actual trabajando: ${minutosActuales} minutos desde ${ultimaEntrada.toLocaleString()}`)
  }
  
  // Convertir milisegundos a horas, minutos y segundos
  const totalSegundos = Math.floor(tiempoTotal / 1000)
  const horas = Math.floor(totalSegundos / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = totalSegundos % 60
  

  
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
})

// Computed para verificar si ya tiene entrada y salida completas
const tieneEntradaYSalida = computed(() => {
  if (marcacionesHoy.value.length === 0) return false
  
  const tieneEntrada = marcacionesHoy.value.some(m => m.tipo === 'entrada')
  const tieneSalida = marcacionesHoy.value.some(m => m.tipo === 'salida')
  
  return tieneEntrada && tieneSalida
})

// Computed para verificar si hay una colación activa
const tieneColacionActiva = computed(() => {
  if (marcacionesHoy.value.length === 0) return false
  
  // Filtrar solo las colaciones y contarlas
  const colaciones = marcacionesHoy.value.filter(m => m.tipo === 'colacion')
  
  // Si hay un número impar de colaciones, hay una activa
  // (1ª = inicio, 2ª = fin, 3ª = inicio, etc.)
  return colaciones.length % 2 === 1
})

// Computed para verificar si puede marcar entrada
const puedeMarcarEntrada = computed(() => {
  return currentStatus.value === 'fuera' && !tieneEntradaYSalida.value
})

// Computed para verificar si puede marcar salida
const puedeMarcarSalida = computed(() => {
  return currentStatus.value === 'dentro' && !tieneColacionActiva.value
})

// Computed para verificar si puede marcar colación
const puedeMarcarColacion = computed(() => {
  return currentStatus.value === 'dentro' && !tieneColacionActiva.value
})

// Computed para verificar si puede terminar colación
const puedeTerminarColacion = computed(() => {
  return currentStatus.value === 'dentro' && tieneColacionActiva.value
})

// Computed para determinar si los botones deben estar deshabilitados
const botonesMarcacionDeshabilitados = computed(() => {
  return isRegistering.value || tieneEntradaYSalida.value
})

// Función para recargar todos los datos
const recargarDatos = async () => {
  console.log('🔄 Recargando datos del dashboard...')
  try {
    // Recargar marcaciones
    await cargarMarcacionesHoy()
    
    // Recargar horario
    if (typeof cargarHorarioHoy === 'function') {
      await cargarHorarioHoy()
    }
    
    console.log('✅ Datos recargados exitosamente')
  } catch (error) {
    console.error('❌ Error recargando datos:', error)
  }
}

// Funciones para manejar el estado de conexión en el template
const getConnectionStatusClass = () => {
  if (isSyncing.value) return 'bg-blue-100 border border-blue-400'
  if (isOffline.value) return 'bg-yellow-100 border border-yellow-400'
  return 'bg-green-100 border border-green-400'
}

const getConnectionTextClass = () => {
  if (isSyncing.value) return 'text-blue-800'
  if (isOffline.value) return 'text-yellow-800'
  return 'text-green-800'
}

const getConnectionSubTextClass = () => {
  if (isSyncing.value) return 'text-blue-600'
  if (isOffline.value) return 'text-yellow-600'
  return 'text-green-600'
}

const getConnectionStatusText = () => {
  if (isSyncing.value) return 'Sincronizando...'
  if (isOffline.value) return 'Modo Offline'
  return 'Conectado'
}

const getConnectionSubText = () => {
  if (isSyncing.value) return `Procesando ${pendingActions.value.length} marcaciones pendientes`
  if (isOffline.value) return 'Las marcaciones se guardarán y sincronizarán automáticamente'
  return 'Todas las funciones disponibles'
}

// Resto de métodos existentes
const updateDateTime = () => {
  const now = new Date()
  currentDateTime.value = now.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  
  // Limpiar mensaje después de 5 segundos
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Función actualizada para clases de mensajes
const getMessageClasses = (type) => {
  const classes = {
    'success': 'bg-green-100 text-green-700 border border-green-200',
    'error': 'bg-red-100 text-red-700 border border-red-200',  
    'info': 'bg-blue-100 text-blue-700 border border-blue-200',
    'warning': 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  }
  return classes[type] || classes.info
}

// Función para obtener ubicación actual
const obtenerUbicacion = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada por este navegador'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubicacion = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precision: position.coords.accuracy
        }
        ubicacionActual.value = ubicacion
        errorUbicacion.value = ''
        resolve(ubicacion)
      },
      (error) => {
        let mensajeError = ''
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensajeError = 'Permiso de ubicación denegado'
            break
          case error.POSITION_UNAVAILABLE:
            mensajeError = 'Ubicación no disponible'
            break
          case error.TIMEOUT:
            mensajeError = 'Tiempo de espera agotado para obtener ubicación'
            break
          default:
            mensajeError = 'Error desconocido al obtener ubicación'
            break
        }
        errorUbicacion.value = mensajeError
        console.warn('Error de geolocalización:', mensajeError)
        // Resolvemos con null en lugar de rechazar para no bloquear el registro
        resolve(null)
      },
      {
        enableHighAccuracy: true, // Mayor precisión
        timeout: 10000, // 10 segundos de timeout
        maximumAge: 300000 // Cache de 5 minutos
      }
    )
  })
}

const registrarEntrada = async () => {
  if (isRegistering.value || !puedeMarcarEntrada.value) return
  
  isRegistering.value = true
  pendingAction.value = 'entrada'
  
  try {
    // Intentar obtener ubicación (no es bloqueante)
    const ubicacion = await obtenerUbicacion()
    
    const result = await AsistenciaService.registrarEntrada(ubicacion)
    
    if (result.success) {
      if (result.offline) {
        // Marcación offline
        currentStatus.value = 'dentro'
        showMessage(result.message, 'info')
        
        // Agregar marcación temporal a la lista local
        marcacionesHoy.value.push({
          id: result.actionId,
          tipo: 'entrada',
          fecha: result.data.fecha,
          hora: new Date().toLocaleTimeString('es-CL', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          offline: true,
          temporal: true
        })
      } else {
        // Marcación online normal
        currentStatus.value = 'dentro'
        showMessage('Entrada registrada correctamente', 'success')
        // Recargar datos inmediatamente para marcaciones online
        await recargarDatos()
      }
    } else {
      showMessage(result.error || 'Error al registrar entrada', 'error')
    }
  } catch (error) {
    console.error('Error registrando entrada:', error)
    showMessage('Error inesperado al registrar entrada', 'error')
  } finally {
    isRegistering.value = false
    pendingAction.value = null
  }
}

const registrarSalida = async () => {
  if (isRegistering.value || !puedeMarcarSalida.value) return
  
  // Validar que no hay colación activa
  if (tieneColacionActiva.value) {
    showMessage('No puedes marcar salida mientras tienes una colación activa. Termina la colación primero.', 'warning')
    return
  }
  
  isRegistering.value = true
  pendingAction.value = 'salida'
  
  try {
    // Intentar obtener ubicación (no es bloqueante)
    const ubicacion = await obtenerUbicacion()
    
    const result = await AsistenciaService.registrarSalida(ubicacion)
    
    if (result.success) {
      if (result.offline) {
        // Marcación offline
        currentStatus.value = 'fuera'
        showMessage(result.message, 'info')
        
        // Agregar marcación temporal a la lista local
        marcacionesHoy.value.push({
          id: result.actionId,
          tipo: 'salida',
          fecha: result.data.fecha,
          hora: new Date().toLocaleTimeString('es-CL', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          offline: true,
          temporal: true
        })
      } else {
        // Marcación online normal
        currentStatus.value = 'fuera'
        showMessage('Salida registrada correctamente', 'success')
        // Recargar datos inmediatamente para marcaciones online
        await recargarDatos()
      }
    } else {
      showMessage(result.error || 'Error al registrar salida', 'error')
    }
  } catch (error) {
    console.error('Error registrando salida:', error)
    showMessage('Error inesperado al registrar salida', 'error')
  } finally {
    isRegistering.value = false
    pendingAction.value = null
  }
}

const registrarColacion = async () => {
  if (isRegistering.value || !puedeMarcarColacion.value) return
  
  isRegistering.value = true
  pendingAction.value = 'colacion'
  
  try {
    // Intentar obtener ubicación (no es bloqueante)
    const ubicacion = await obtenerUbicacion()
    
    const result = await AsistenciaService.registrarColacion(ubicacion)
    
    if (result.success) {
      if (result.offline) {
        showMessage(result.message, 'info')
        
        // Para marcaciones offline, agregar marcación temporal
        marcacionesHoy.value.push({
          id: result.actionId,
          tipo: 'colacion',
          fecha: result.data.fecha,
          hora: new Date().toLocaleTimeString('es-CL', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          offline: true,
          temporal: true
        })
      } else {
        showMessage('Colación registrada correctamente', 'success')
        // Recargar datos inmediatamente para marcaciones online
        await recargarDatos()
      }
    } else {
      showMessage(result.error || 'Error al registrar colación', 'error')
    }
  } catch (error) {
    console.error('Error registrando colación:', error)
    showMessage('Error inesperado al registrar colación', 'error')
  } finally {
    isRegistering.value = false
    pendingAction.value = null
  }
}

const terminarColacion = async () => {
  if (isRegistering.value || !puedeTerminarColacion.value) return
  
  isRegistering.value = true
  pendingAction.value = 'termino_colacion'
  
  try {
    // Intentar obtener ubicación (no es bloqueante)
    const ubicacion = await obtenerUbicacion()
    
    const result = await AsistenciaService.registrarTerminoColacion(ubicacion)
    
    if (result.success) {
      if (result.offline) {
        showMessage(result.message, 'info')
        
        // Para marcaciones offline, agregar marcación temporal
        marcacionesHoy.value.push({
          id: result.actionId,
          tipo: 'colacion',
          fecha: result.data.fecha,
          hora: new Date().toLocaleTimeString('es-CL', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          offline: true,
          temporal: true
        })
      } else {
        showMessage('Término de colación registrado correctamente', 'success')
        // Recargar datos inmediatamente para marcaciones online
        await recargarDatos()
      }
    } else {
      showMessage(result.error || 'Error al terminar colación', 'error')
    }
  } catch (error) {
    console.error('Error terminando colación:', error)
    showMessage('Error inesperado al terminar colación', 'error')
  } finally {
    isRegistering.value = false
    pendingAction.value = null
  }
}

const registrarDescanso = async () => {
  if (isRegistering.value || currentStatus.value === 'fuera') return
  
  isRegistering.value = true
  pendingAction.value = 'descanso'
  
  try {
    // Intentar obtener ubicación (no es bloqueante)
    const ubicacion = await obtenerUbicacion()
    
    const result = await AsistenciaService.registrarDescanso(ubicacion)
    
    if (result.success) {
      showMessage('Descanso registrado correctamente', 'success')
      await cargarMarcacionesHoy()
    } else {
      showMessage(result.error || 'Error al registrar descanso', 'error')
    }
  } catch (error) {
    console.error('Error registrando descanso:', error)
    showMessage('Error inesperado al registrar descanso', 'error')
  } finally {
    isRegistering.value = false
    pendingAction.value = null
  }
}

const cargarMarcacionesHoy = async () => {
  isLoadingMarcaciones.value = true
  
  try {
    const result = await AsistenciaService.obtenerMarcacionesHoy()
    
    if (result.success) {
      marcacionesHoy.value = result.data || []
      
      // Actualizar el estado basado en las marcaciones cargadas
      currentStatus.value = estadoCalculado.value

    } else {
      console.error('Error cargando marcaciones:', result.error)
    }
  } catch (error) {
    console.error('Error cargando marcaciones del día:', error)
  } finally {
    isLoadingMarcaciones.value = false
  }
}

const cargarHorarioHoy = async () => {
  isLoadingHorario.value = true
  
  try {
    const result = await AsistenciaService.obtenerHorarioHoy()
    console.log('Resultado de obtenerHorarioHoy:', result)
    if (result.success) {
      horarioHoy.value = result.data
    } else {
      console.error('Error cargando horario:', result.error)
      horarioHoy.value = null
    }
  } catch (error) {
    console.error('Error cargando horario del día:', error)
    horarioHoy.value = null
  } finally {
    isLoadingHorario.value = false
  }
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatearHora = (hora) => {
  // Si es solo la hora (HH:MM:SS), crear una fecha temporal para formatear
  if (typeof hora === 'string' && hora.includes(':')) {
    const [horas, minutos, segundos] = hora.split(':')
    return `${horas}:${minutos}:${segundos || '00'}`
  }
  
  // Si es una fecha completa
  return new Date(hora).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getTipoLabel = (tipo, marcacion) => {
  if (tipo === 'colacion') {
    // Obtener todas las colaciones ordenadas cronológicamente
  
    const colacionesOrdenadas = marcacionesHoy.value
      .filter(m => m.tipo === 'colacion')
      .sort((a, b) => a.id - b.id)
    
    // Encontrar el índice de esta marcación específica en el array ordenado
    const indice = colacionesOrdenadas.findIndex(c => {
      // Usar una comparación más precisa
      return c.fecha === marcacion.fecha && 
             c.hora === marcacion.hora &&
             JSON.stringify(c) === JSON.stringify(marcacion)
    })
    
    // La lógica correcta: el primer registro es inicio (índice 0), segundo es fin (índice 1), etc.
    return indice % 2 === 0 ? 'Inicio Colación' : 'Fin Colación'
  }
  
  const labels = {
    'entrada': 'Entrada',
    'salida': 'Salida',
    'descanso': 'Descanso'
  }
  return labels[tipo] || tipo
}

const getColorByType = (tipo, marcacion) => {
  const colors = {
    'entrada': 'bg-green-500',
    'salida': 'bg-red-500',
    'colacion': 'bg-orange-500',  // Un solo color para todas las colaciones
    'descanso': 'bg-blue-500'
  }
  return colors[tipo] || 'bg-gray-500'
}

const formatearFechaCompleta = (timestamp) => {
  return new Date(timestamp).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Watcher mejorado para recargar cuando vuelve la conexión
watch(isOnline, async (newValue, oldValue) => {
  if (newValue && !oldValue) {
    showMessage('📶 Conexión restaurada', 'info')
    
    // Si hay acciones pendientes, mostrar mensaje de sincronización
    if (pendingActions.value.length > 0) {
      showMessage('🔄 Sincronizando marcaciones pendientes...', 'info')
    } else {
      // Si no hay acciones pendientes, solo recargar los datos
      await recargarDatos()
    }
  }
})

// Watcher para mostrar estado de sincronización
watch(isSyncing, (newValue) => {
  if (newValue) {
    showMessage('🔄 Sincronizando marcaciones...', 'info')
  }
})

// Lifecycle hooks
onMounted(async () => {
  // Inicializar fecha/hora
  updateDateTime()
  dateTimeInterval = setInterval(updateDateTime, 1000)
  
  // Intentar obtener ubicación inicial
  try {
    await obtenerUbicacion()
  } catch (error) {
    console.warn('No se pudo obtener ubicación inicial:', error)
  }
  
  // Cargar datos iniciales
  await cargarMarcacionesHoy()
  await cargarHorarioHoy()
  
  // Listener para cuando termina la sincronización offline
  const handleSyncCompleted = async (event) => {
    const { success, failed, total } = event.detail
    
    if (success > 0) {
      showMessage(`✅ ${success} marcaciones sincronizadas correctamente`, 'success')
      
      // Recargar datos automáticamente después de la sincronización
      await recargarDatos()
    }
    
    if (failed > 0) {
      showMessage(`⚠️ ${failed} marcaciones no se pudieron sincronizar`, 'warning')
    }
  }
  
  window.addEventListener('offlineSyncCompleted', handleSyncCompleted)
  
  // Cleanup en onUnmounted
  onUnmounted(() => {
    if (dateTimeInterval) {
      clearInterval(dateTimeInterval)
    }
    window.removeEventListener('offlineSyncCompleted', handleSyncCompleted)
  })
})
</script>
