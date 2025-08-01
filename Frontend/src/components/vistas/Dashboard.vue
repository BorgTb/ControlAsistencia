<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-3xl font-bold text-gray-900">TeleMarcación</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Usuario info -->
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-700">Bienvenido, {{ user.nombre }}</span>
            </div>
            
            <!-- Logout button -->
            <button
              @click="handleLogout"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Saliendo...' : 'Cerrar Sesión' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Content area -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Panel de Control
            </h3>
            
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
                    :disabled="isRegistering || currentStatus === 'dentro'"
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
                    :disabled="isRegistering || currentStatus === 'fuera'"
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

                  <!-- Botones adicionales para colación y descanso -->
                  <div class="grid grid-cols-2 gap-2 mt-4">
                    <button
                      @click="registrarColacion"
                      :disabled="isRegistering || currentStatus === 'fuera'"
                      class="flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isRegistering && pendingAction === 'colacion'" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {{ isRegistering && pendingAction === 'colacion' ? '...' : 'Colación' }}
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

                <!-- Mensaje de resultado -->
                <div v-if="message" class="mt-4 p-3 rounded-lg" :class="messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  <p class="text-sm">{{ message }}</p>
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
                        <div class="w-3 h-3 rounded-full mr-3" :class="getColorByType(marcacion.tipo)"></div>
                        <div>
                          <p class="text-sm font-medium text-gray-900 capitalize">{{ getTipoLabel(marcacion.tipo) }}</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import AsistenciaService from '../../services/AsistenciaService.js'

// Composables
const router = useRouter()
const { user, token, isLoading, logout } = useAuth()

// Estado para el control de asistencia
const currentStatus = ref('fuera') // 'dentro' | 'fuera'
const isRegistering = ref(false)
const pendingAction = ref(null) // 'entrada' | 'salida'
const message = ref('')
const messageType = ref('success') // 'success' | 'error'
const currentDateTime = ref('')

// Estado para geolocalización
const ubicacionActual = ref(null)
const errorUbicacion = ref('')


// Estado para marcaciones del día
const marcacionesHoy = ref([])
const isLoadingMarcaciones = ref(false)

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
  
  console.log('=== CÁLCULO DE TIEMPO TRABAJADO ===')
  console.log('Marcaciones ordenadas:', marcacionesOrdenadas)
  
  // Procesar cada marcación en orden cronológico
  marcacionesOrdenadas.forEach((marcacion, index) => {
    try {
      // Mejorar el parsing de fechas
      const fechaLimpia = marcacion.fecha.includes('T') ? marcacion.fecha.split('T')[0] : marcacion.fecha
      const fechaHoraMarcacion = new Date(`${fechaLimpia}T${marcacion.hora}`)
      
      console.log(`[${index + 1}] Procesando: ${marcacion.tipo} a las ${fechaHoraMarcacion.toLocaleString()}`)
      
      if (marcacion.tipo === 'entrada') {
        ultimaEntrada = fechaHoraMarcacion
        console.log(`  ✓ Entrada registrada: ${fechaHoraMarcacion.toLocaleString()}`)
      } else if (marcacion.tipo === 'salida' && ultimaEntrada) {
        // Calcular tiempo trabajado desde la última entrada hasta esta salida
        const tiempoSegmento = fechaHoraMarcacion.getTime() - ultimaEntrada.getTime()
        tiempoTotal += tiempoSegmento
        
        const minutosSegmento = Math.floor(tiempoSegmento / (1000 * 60))
        const segundosSegmento = Math.floor((tiempoSegmento % (1000 * 60)) / 1000)
        
        console.log(`  ✓ Segmento calculado:`)
        console.log(`    Desde: ${ultimaEntrada.toLocaleString()}`)
        console.log(`    Hasta: ${fechaHoraMarcacion.toLocaleString()}`)
        console.log(`    Duración: ${minutosSegmento}m ${segundosSegmento}s`)
        
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
  
  console.log(`=== RESULTADO FINAL ===`)
  console.log(`Tiempo total trabajado: ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')} (${totalSegundos} segundos totales)`)
  console.log(`Milisegundos totales: ${tiempoTotal}`)
  
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
})

// Métodos
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
  if (isRegistering.value || currentStatus.value === 'dentro') return
  
  isRegistering.value = true
  pendingAction.value = 'entrada'
  
  try {
    // Intentar obtener ubicación (no es bloqueante)
    const ubicacion = await obtenerUbicacion()
    
    const result = await AsistenciaService.registrarEntrada(ubicacion)
    
    if (result.success) {
      currentStatus.value = 'dentro'
      showMessage('Entrada registrada correctamente', 'success')
      await cargarMarcacionesHoy()
      // El estado se actualiza automáticamente en cargarMarcacionesHoy()
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
  if (isRegistering.value || currentStatus.value === 'fuera') return
  
  isRegistering.value = true
  pendingAction.value = 'salida'
  
  try {
    // Intentar obtener ubicación (no es bloqueante)
    const ubicacion = await obtenerUbicacion()
    
    const result = await AsistenciaService.registrarSalida(ubicacion)
    
    if (result.success) {
      currentStatus.value = 'fuera'
      showMessage('Salida registrada correctamente', 'success')
      await cargarMarcacionesHoy()
      // El estado se actualiza automáticamente en cargarMarcacionesHoy()
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
  if (isRegistering.value || currentStatus.value === 'fuera') return
  
  isRegistering.value = true
  pendingAction.value = 'colacion'
  
  try {
    // Intentar obtener ubicación (no es bloqueante)
    const ubicacion = await obtenerUbicacion()
    
    const result = await AsistenciaService.registrarColacion(ubicacion)
    
    if (result.success) {
      showMessage('Colación registrada correctamente', 'success')
      await cargarMarcacionesHoy()
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
      
      console.log('Marcaciones cargadas:', marcacionesHoy.value)
      console.log('Estado calculado localmente:', estadoCalculado.value)
    } else {
      console.error('Error cargando marcaciones:', result.error)
    }
  } catch (error) {
    console.error('Error cargando marcaciones del día:', error)
  } finally {
    isLoadingMarcaciones.value = false
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

const getColorByType = (tipo) => {
  const colors = {
    'entrada': 'bg-green-500',
    'salida': 'bg-red-500',
    'colacion': 'bg-orange-500',
    'descanso': 'bg-blue-500'
  }
  return colors[tipo] || 'bg-gray-500'
}

const getTipoLabel = (tipo) => {
  const labels = {
    'entrada': 'Entrada',
    'salida': 'Salida',
    'colacion': 'Colación',
    'descanso': 'Descanso'
  }
  return labels[tipo] || tipo
}

// Handle logout
const handleLogout = async () => {
  try {
    const result = await logout()
    
    if (result.success) {
      // Redirigir al login
      router.push('/')
    }
  } catch (error) {
    console.error('Error en logout:', error)
    // Incluso si hay error, redirigir al login
    router.push('/')
  }
}

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
  // Solo cargar marcaciones - el estado se calcula automáticamente
  await cargarMarcacionesHoy()
})

onUnmounted(() => {
  if (dateTimeInterval) {
    clearInterval(dateTimeInterval)
  }
})
</script>
