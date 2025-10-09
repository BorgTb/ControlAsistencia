<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
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
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Solicitud de Modificación de Marcación</h1>
          <p class="text-gray-600">Revisa los detalles y toma una decisión sobre esta solicitud.</p>
        </div>

        <!-- Información del Empleado -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Información del Empleado</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Empleado</label>
              <p class="text-base font-semibold text-gray-900">{{ solicitud.empleado }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
              <p class="text-base font-semibold text-gray-900">{{ solicitud.fecha }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <p class="text-base font-semibold text-gray-900">{{ solicitud.tipo || 'Modificación' }}</p>
            </div>
          </div>
        </div>

        <!-- Cambios Solicitados -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Cambios Solicitados</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <!-- Marcación Actual -->
            <div class="space-y-4">
              <h3 class="text-center font-semibold text-gray-700 mb-3">Marcación Actual</h3>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label class="block text-xs font-medium text-gray-600 mb-1">Hora Entrada</label>
                <p class="text-2xl font-bold text-gray-900">
                  {{ solicitud.horaEntradaActual || 'No registrada' }}
                </p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label class="block text-xs font-medium text-gray-600 mb-1">Hora Salida</label>
                <p class="text-2xl font-bold text-gray-900">
                  {{ solicitud.horaSalidaActual || 'No registrada' }}
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
              <h3 class="text-center font-semibold text-gray-700 mb-3">Marcación Solicitada</h3>
              <div class="bg-green-50 rounded-lg p-4 border-2 border-green-400">
                <label class="block text-xs font-medium text-green-700 mb-1">Hora Entrada</label>
                <p class="text-2xl font-bold text-green-900">
                  {{ solicitud.horaEntradaSolicitada }}
                </p>
              </div>
              <div class="bg-green-50 rounded-lg p-4 border-2 border-green-400">
                <label class="block text-xs font-medium text-green-700 mb-1">Hora Salida</label>
                <p class="text-2xl font-bold text-green-900">
                  {{ solicitud.horaSalidaSolicitada }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Motivo -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Motivo de la Solicitud</h2>
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p class="text-gray-800 leading-relaxed">{{ solicitud.motivo }}</p>
          </div>
        </div>

        <!-- Acciones -->
        <div v-if="!mostrarRechazo" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">¿Qué deseas hacer con esta solicitud?</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              @click="mostrarFormularioRechazo"
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

        <!-- Formulario de Rechazo -->
        <div v-if="mostrarRechazo" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Motivo del Rechazo</h2>
          <textarea 
            v-model="motivoRechazo"
            rows="4"
            placeholder="Ingrese el motivo del rechazo..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          ></textarea>
          <div class="flex gap-3 mt-4">
            <button 
              @click="mostrarRechazo = false"
              :disabled="procesando"
              class="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              @click="rechazarSolicitud"
              :disabled="procesando || !motivoRechazo.trim()"
              class="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ procesando ? 'Procesando...' : 'Confirmar Rechazo' }}
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

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSolicitudes } from '../../../composables/useSolicitudes'

export default {
  name: 'ModificacionMarcacion',
  setup() {
    const route = useRoute()
    
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
    const mostrarRechazo = ref(false)
    const motivoRechazo = ref('')
    const token = ref('')

    // Obtener token de la URL e inicializar
    const inicializar = async () => {
      token.value = route.query.token || ''
        
      if (!token.value) {
        error.value = 'Token no proporcionado en la URL'
        return
      }

      await cargarSolicitud(token.value)
    }

    // Mostrar formulario de rechazo
    const mostrarFormularioRechazo = () => {
      mostrarRechazo.value = true
      motivoRechazo.value = ''
    }

    // Confirmar aceptación
    const confirmarAceptar = () => {
      if (confirm('¿Está seguro de aceptar esta solicitud de modificación?')) {
        manejarAceptar()
      }
    }

    // Manejar aceptación de solicitud
    const manejarAceptar = async () => {
      try {
        await aceptarSolicitud(token.value)
      } catch (err) {
        alert('Error al procesar la solicitud. Por favor, intenta nuevamente.')
      }
    }

    // Manejar rechazo de solicitud
    const manejarRechazo = async () => {
      if (!motivoRechazo.value.trim()) {
        alert('Debe ingresar un motivo para el rechazo')
        return
      }

      try {
        await rechazarSolicitud(token.value, motivoRechazo.value)
        mostrarRechazo.value = false
      } catch (err) {
        alert('Error al procesar la solicitud. Por favor, intenta nuevamente.')
      }
    }

    // Inicializar al montar
    onMounted(() => {
      inicializar()
    })

    return {
      loading,
      error,
      solicitud,
      procesando,
      procesado,
      mensajeProcesado,
      mostrarRechazo,
      motivoRechazo,
      mostrarFormularioRechazo,
      confirmarAceptar,
      rechazarSolicitud: manejarRechazo
    }
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
@media (max-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>