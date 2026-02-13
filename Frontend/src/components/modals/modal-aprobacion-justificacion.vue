<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
    <div class="absolute inset-0 bg-black opacity-50" @click="$emit('cancelar')"></div>

    <div class="bg-white rounded-lg shadow-lg z-10 w-full max-w-4xl max-h-screen my-8 relative overflow-hidden">
      <!-- Header fijo -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ accion === 'APROBADA' ? 'Aprobar Justificación' : 'Rechazar Justificación' }}
        </h3>
        <button @click="$emit('cancelar')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Contenido con scroll -->
      <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <!-- Información de la justificación -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Detalles de la justificación:</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600 font-medium">Trabajador:</span>
              <div class="text-gray-900">{{ justificacion.usuario_nombre }}</div>
              <div class="text-gray-500 text-xs">{{ justificacion.usuario_rut }}</div>
            </div>
            <div>
              <span class="text-gray-600 font-medium">Empresa:</span>
              <div class="text-gray-900">{{ justificacion.empresa_nombre }}</div>
            </div>
            <div>
              <span class="text-gray-600 font-medium">Período:</span>
              <div class="text-gray-900">
                {{ formatearFecha(justificacion.fecha_inicio) }} - {{ formatearFecha(justificacion.fecha_fin) }}
              </div>
              <div class="text-blue-600 text-xs font-medium">{{ justificacion.dias_totales }} días</div>
            </div>
            <div>
              <span class="text-gray-600 font-medium">Tipo:</span>
              <div class="text-gray-900">{{ formatearTipo(justificacion.tipo_justificacion) }}</div>
            </div>
            <div class="col-span-1 md:col-span-2">
              <span class="text-gray-600 font-medium">Fecha de solicitud:</span>
              <div class="text-gray-900">{{ formatearFechaCompleta(justificacion.fecha_solicitud) }}</div>
            </div>
          </div>

          <div v-if="justificacion.motivo" class="mt-3">
            <span class="text-gray-600 font-medium text-sm">Motivo:</span>
            <div class="text-gray-900 text-sm mt-1 p-2 bg-white rounded border">{{ justificacion.motivo }}</div>
          </div>

          <div v-if="justificacion.archivo_url" class="mt-3">
            <span class="text-gray-600 font-medium text-sm">Archivo adjunto:</span>
            <div class="mt-1">
              <a 
                :href="getArchivoUrl(justificacion.archivo_url)" 
                target="_blank" 
                class="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
                {{ justificacion.archivo_nombre || 'Ver archivo adjunto' }}
              </a>
            </div>
          </div>
        </div>

        <!-- Formulario de decisión -->
        <div class="space-y-4">
          <!-- Mensaje de confirmación -->
          <div :class="accion === 'APROBADA' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'" 
               class="p-4 rounded-lg border">
            <div class="flex items-start">
              <div :class="accion === 'APROBADA' ? 'text-green-600' : 'text-red-600'" class="flex-shrink-0 mt-0.5">
                <svg v-if="accion === 'APROBADA'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h3 :class="accion === 'APROBADA' ? 'text-green-800' : 'text-red-800'" class="text-sm font-medium">
                  {{ accion === 'APROBADA' ? '¿Aprobar esta justificación?' : '¿Rechazar esta justificación?' }}
                </h3>
                <p :class="accion === 'APROBADA' ? 'text-green-700' : 'text-red-700'" class="text-sm mt-1">
                  {{ accion === 'APROBADA' 
                    ? 'Los días del período serán marcados como justificados automáticamente.' 
                    : 'La justificación será rechazada y los días no serán marcados como justificados.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Campo de observaciones -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Observaciones 
              <span v-if="accion === 'RECHAZADA'" class="text-red-500">*</span>
              <span v-else class="text-gray-500">(opcional)</span>
            </label>
            <textarea 
              v-model="observaciones" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              :placeholder="accion === 'APROBADA' 
                ? 'Comentarios adicionales sobre la aprobación...' 
                : 'Motivo del rechazo (requerido)...'"
              :required="accion === 'RECHAZADA'"
            ></textarea>
            <p v-if="errors.observaciones" class="text-xs text-red-600 mt-1">{{ errors.observaciones }}</p>
          </div>

          <!-- Información adicional para aprobación -->
          <div v-if="accion === 'APROBADA'" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-blue-800">Información importante</h4>
                <ul class="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• Se generarán automáticamente {{ justificacion.dias_totales }} días justificados</li>
                  <li>• Los días aparecerán marcados en el calendario de asistencia</li>
                  <li>• Esta acción no se puede deshacer fácilmente</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Información adicional para rechazo -->
          <div v-if="accion === 'RECHAZADA'" class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-orange-800">Considerar antes de rechazar</h4>
                <ul class="text-xs text-orange-700 mt-1 space-y-1">
                  <li>• El trabajador podrá ver el motivo del rechazo</li>
                  <li>• Los días del período no serán justificados</li>
                  <li>• El trabajador puede presentar una nueva solicitud</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Estado de envío -->
          <div v-if="enviando" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center">
              <svg class="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm text-blue-700">Procesando decisión...</span>
            </div>
          </div>

          <!-- Mensaje de error -->
          <div v-if="errorGeneral" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ errorGeneral }}</p>
          </div>
        </div>
      </div>

      <!-- Footer fijo con botones -->
      <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <button 
          @click="$emit('cancelar')" 
          :disabled="enviando"
          class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          @click="confirmar" 
          :disabled="enviando || !isFormValid"
          :class="accion === 'APROBADA' 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-red-600 hover:bg-red-700'"
          class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ enviando ? 'Procesando...' : (accion === 'APROBADA' ? 'Aprobar' : 'Rechazar') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue'

const props = defineProps({
  justificacion: {
    type: Object,
    required: true
  },
  accion: {
    type: String,
    required: true,
    validator: (value) => ['APROBADA', 'RECHAZADA'].includes(value)
  }
})

const emit = defineEmits(['confirmar', 'cancelar'])

// Estado del formulario
const observaciones = ref('')
const errors = ref({})
const enviando = ref(false)
const errorGeneral = ref('')

// Computed para validación del formulario
const isFormValid = computed(() => {
  if (props.accion === 'RECHAZADA') {
    return observaciones.value.trim() !== ''
  }
  return true // Para aprobación, las observaciones son opcionales
})

// Métodos
const validarFormulario = () => {
  errors.value = {}
  
  if (props.accion === 'RECHAZADA' && !observaciones.value.trim()) {
    errors.value.observaciones = 'Las observaciones son requeridas para rechazar una justificación'
  }
  
  return Object.keys(errors.value).length === 0
}

const confirmar = async () => {
  if (!validarFormulario()) return
  
  enviando.value = true
  errorGeneral.value = ''
  
  try {
    emit('confirmar', observaciones.value.trim())
  } catch (error) {
    errorGeneral.value = 'Error al procesar la decisión'
    console.error('Error procesando decisión:', error)
  } finally {
    enviando.value = false
  }
}

// Funciones auxiliares
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatearFechaCompleta = (fecha) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearTipo = (tipo) => {
  const tipos = {
    'MEDICA': 'Médica',
    'PERSONAL': 'Personal',
    'FAMILIAR': 'Familiar',
    'EDUCATIVA': 'Educativa',
    'OTRA': 'Otra'
  }
  return tipos[tipo] || tipo
}

const getArchivoUrl = (url) => {
  // Si la URL ya es completa, devolverla tal como está
  if (url.startsWith('http')) {
    return url
  }
  // Si es una URL relativa, agregar la base URL del servidor
  const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3000'
  return `${baseUrl}${url}`
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>