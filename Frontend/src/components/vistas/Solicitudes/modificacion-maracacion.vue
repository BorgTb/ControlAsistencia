<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Notificación Toast -->
      <transition name="slide-down">
        <div v-if="notificacion.mostrar" 
             :class="[
               'fixed top-4 right-4 z-50 max-w-md w-full rounded-lg shadow-lg p-4 border-l-4',
               notificacion.tipo === 'error' ? 'bg-red-50 border-red-500' : 
               notificacion.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500' : 
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
              <svg v-else class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <p :class="[
                'text-sm font-medium',
                notificacion.tipo === 'error' ? 'text-red-800' : 
                notificacion.tipo === 'warning' ? 'text-yellow-800' : 
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

      <!-- Modal de Confirmación -->
      <transition name="fade">
        <div v-if="modalConfirmacion.mostrar" class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Overlay -->
            <div class="fixed inset-0 backdrop-blur-sm bg-opacity-75 transition-opacity z-40" @click="cerrarModal"></div>

            <!-- Modal -->
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50" @click.stop>
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div :class="[
                    'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10',
                    modalConfirmacion.tipo === 'aceptar' ? 'bg-green-100' : 'bg-red-100'
                  ]">
                    <svg v-if="modalConfirmacion.tipo === 'aceptar'" class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                      {{ modalConfirmacion.tipo === 'aceptar' ? 'Aceptar Solicitud' : 'Rechazar Solicitud' }}
                    </h3>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        {{ modalConfirmacion.mensaje }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button 
                  @click="ejecutarAccion"
                  :disabled="procesando"
                  :class="[
                    'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed',
                    modalConfirmacion.tipo === 'aceptar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  ]">
                  <svg v-if="procesando" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ procesando ? 'Procesando...' : 'Confirmar' }}
                </button>
                <button 
                  @click="cerrarModal"
                  :disabled="procesando"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-lg font-medium text-red-800 mb-2">Error al cargar la solicitud</h3>
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Success State -->
      <div v-else-if="procesado" class="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <svg class="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-2xl font-bold text-green-800 mb-2">Solicitud procesada exitosamente</h3>
        <p class="text-green-600">{{ mensajeProcesado }}</p>
      </div>

      <!-- Main Content -->
      <div v-else-if="solicitud" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Solicitud de {{ solicitud.tipo === 'agregar' ? 'Adición' : 'Modificación' }} de Marcación</h1>
          <p class="text-gray-600">Revisa los detalles y toma una decisión sobre esta solicitud.</p>
        </div>

        <!-- Información del Empleado -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Información del Empleado</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Empleado</label>
              <p class="text-base font-semibold text-gray-900">
                {{ solicitud.user_nombre }} {{ solicitud.user_apellido_pat }} {{ solicitud.user_apellido_mat }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">RUT</label>
              <p class="text-base font-semibold text-gray-900">{{ solicitud.user_rut }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p class="text-base font-semibold text-gray-900">{{ solicitud.user_email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Empresa</label>
              <p class="text-base font-semibold text-gray-900">{{ solicitud.user_empresa }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
              <p class="text-base font-semibold text-gray-900">{{ formatearFecha(solicitud.fecha_correcta) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Tipo de Problema</label>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    :class="solicitud.tipo_problema === 'olvido_marcar' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'">
                {{ solicitud.tipo_problema === 'olvido_marcar' ? 'Olvidó Marcar' : 'Hora Incorrecta' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Cambios Solicitados -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            {{ solicitud.tipo === 'agregar' ? 'Marcación a Agregar' : 'Cambios Solicitados' }}
          </h2>
          
          <!-- Tipo: AGREGAR (olvido_marcar) -->
          <div v-if="solicitud.tipo === 'agregar'" class="max-w-md mx-auto">
            <div class="bg-green-50 rounded-lg p-6 border-2 border-green-400">
              <h3 class="text-center font-semibold text-green-800 mb-4">Nueva Marcación</h3>
              <div class="space-y-3">
                <div class="bg-white rounded-lg p-4">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                  <p class="text-xl font-bold text-gray-900">{{ formatearFecha(solicitud.fecha_correcta) }}</p>
                </div>
                <div class="bg-white rounded-lg p-4">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Hora</label>
                  <p class="text-2xl font-bold text-green-900">{{ solicitud.hora_correcta }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tipo: MODIFICAR (hora_incorrecta) -->
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <!-- Marcación Actual -->
            <div class="space-y-4">
              <h3 class="text-center font-semibold text-gray-700 mb-3">Marcación Actual</h3>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label class="block text-xs font-medium text-gray-600 mb-1">Fecha Original</label>
                <p class="text-lg font-bold text-gray-900">
                  {{ formatearFecha(solicitud.fecha_original) }}
                </p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label class="block text-xs font-medium text-gray-600 mb-1">Hora Original</label>
                <p class="text-2xl font-bold text-gray-900">
                  {{ solicitud.hora_original || 'No registrada' }}
                </p>
              </div>
            </div>

            <!-- Arrow -->
            <div class="flex justify-center">
              <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            <!-- Marcación Solicitada -->
            <div class="space-y-4">
              <h3 class="text-center font-semibold text-gray-700 mb-3">Marcación Correcta</h3>
              <div class="bg-green-50 rounded-lg p-4 border-2 border-green-400">
                <label class="block text-xs font-medium text-green-700 mb-1">Fecha Correcta</label>
                <p class="text-lg font-bold text-green-900">
                  {{ formatearFecha(solicitud.fecha_correcta) }}
                </p>
              </div>
              <div class="bg-green-50 rounded-lg p-4 border-2 border-green-400">
                <label class="block text-xs font-medium text-green-700 mb-1">Hora Correcta</label>
                <p class="text-2xl font-bold text-green-900">
                  {{ solicitud.hora_correcta }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">¿Qué deseas hacer con esta solicitud?</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              @click="confirmarRechazo"
              :disabled="procesando"
              class="flex items-center justify-center px-6 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rechazar Solicitud
            </button>
            <button 
              @click="confirmarAceptar"
              :disabled="procesando"
              class="flex items-center justify-center px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Aceptar Solicitud
            </button>
          </div>
        </div>

        <!-- Procesando -->
        <div v-if="procesando" class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <p class="text-blue-800">Procesando solicitud...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSolicitudes } from '@/composables/use-solicitudes'
import { useAuthStore } from '@/stores/auth-store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Usar el composable de solicitudes
const {
  loading,
  error,
  solicitud,
  procesando,
  procesado,
  mensajeProcesado,
  cargarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud
} = useSolicitudes()

// Estado local del componente
const token = ref('')
const notificacion = ref({
  mostrar: false,
  mensaje: '',
  tipo: 'info' // 'info', 'error', 'warning'
})
const modalConfirmacion = ref({
  mostrar: false,
  tipo: '', // 'aceptar' o 'rechazar'
  mensaje: ''
})

// Función para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  const date = new Date(fecha)
  const opciones = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Santiago' }
  return date.toLocaleDateString('es-CL', opciones)
}

// Mostrar notificación
const mostrarNotificacion = (mensaje, tipo = 'info') => {
  notificacion.value = { mostrar: true, mensaje, tipo }
  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    cerrarNotificacion()
  }, 5000)
}

// Cerrar notificación
const cerrarNotificacion = () => {
  notificacion.value.mostrar = false
}

// Abrir modal de confirmación
const abrirModal = (tipo, mensaje) => {
  modalConfirmacion.value = { mostrar: true, tipo, mensaje }
}

// Cerrar modal
const cerrarModal = () => {
  if (!procesando.value) {
    modalConfirmacion.value.mostrar = false
  }
}

// Ejecutar acción confirmada
const ejecutarAccion = async () => {
  let exitoso = false
  
  if (modalConfirmacion.value.tipo === 'aceptar') {
    exitoso = await manejarAceptar()
  } else {
    exitoso = await manejarRechazo()
  }
  
  // Solo cerrar el modal si la operación fue exitosa
  if (exitoso) {
    cerrarModal()
  }
}

// Obtener token de la URL e inicializar
const inicializar = async () => {
  // Validar autenticación
  if (!authStore.isAuthenticated) {
    error.value = 'Debes iniciar sesión para aprobar tu solicitud'
    router.push('/')
    return
  }

  token.value = route.query.token || ''
    
  if (!token.value) {
    error.value = 'Token no proporcionado en la URL'
    return
  }

  try {
    await cargarSolicitud(token.value)
  } catch (err) {
    // Si hay error de autenticación (401/403), redirigir al login
    if (err.response?.status === 401) {
      error.value = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permiso para ver esta solicitud. Debes estar logueado como el trabajador que hizo la solicitud.'
    }
  }
}

// Confirmar rechazo
const confirmarRechazo = () => {
  abrirModal('rechazar', '¿Está seguro de rechazar esta solicitud de modificación? Esta acción no se puede deshacer.')
}

// Confirmar aceptación
const confirmarAceptar = () => {
  abrirModal('aceptar', '¿Está seguro de aceptar esta solicitud de modificación? Los cambios se aplicarán inmediatamente.')
}

// Manejar aceptación de solicitud
const manejarAceptar = async () => {
  try {
    await aceptarSolicitud(token.value)
    return true // Operación exitosa
  } catch (err) {
    // Manejar errores de autenticación
    if (err.response?.status === 401) {
      error.value = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permiso para aprobar esta solicitud'
    } else {
      mostrarNotificacion('Error al procesar la solicitud. Por favor, intenta nuevamente.', 'error')
    }
    return false // Operación falló
  }
}

// Manejar rechazo de solicitud
const manejarRechazo = async () => {
  try {
    await rechazarSolicitud(token.value, '')
    return true // Operación exitosa
  } catch (err) {
    // Manejar errores de autenticación
    if (err.response?.status === 401) {
      error.value = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permiso para rechazar esta solicitud'
    } else {
      mostrarNotificacion('Error al procesar la solicitud. Por favor, intenta nuevamente.', 'error')
    }
    return false // Operación falló
  }
}

// Inicializar al montar
onMounted(() => {
  inicializar()
})
</script>

<style scoped>
/* Animaciones */
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Estilos adicionales si son necesarios */
@media (max-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>