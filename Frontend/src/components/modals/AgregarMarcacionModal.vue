<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black opacity-50" @click="$emit('cancel')"></div>

    <div class="bg-white rounded-lg shadow-lg z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
      <h3 class="text-lg font-semibold mb-4 text-gray-900">Solicitar Nueva Marcación</h3>

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
                'border-indigo-500 bg-indigo-50': formData.tipo_marcacion_correcta === tipo.value,
                'border-gray-300': formData.tipo_marcacion_correcta !== tipo.value
              }"
            >
              <input 
                type="radio" 
                v-model="formData.tipo_marcacion_correcta" 
                :value="tipo.value"
                class="sr-only"
              />
              <div class="flex items-center">
                <span class="text-base mr-2">{{ tipo.icon }}</span>
                <span class="text-sm font-medium text-gray-900">{{ tipo.label }}</span>
              </div>
              <div 
                v-if="formData.tipo_marcacion_correcta === tipo.value" 
                class="absolute top-1 right-1 text-indigo-600"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </label>
          </div>
          <p v-if="errors.tipo" class="text-xs text-red-600 mt-1">{{ errors.tipo }}</p>
        </div>

        <!-- Fecha y Hora -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input 
              type="date" 
              v-model="formData.fecha"
              :min="fechaMinima"
              :max="fechaMaxima"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
            <p v-if="errors.fecha" class="text-xs text-red-600 mt-1">{{ errors.fecha }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
            <input 
              type="time" 
              v-model="formData.hora"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
            <p v-if="errors.hora" class="text-xs text-red-600 mt-1">{{ errors.hora }}</p>
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
            v-model="formData.motivo" 
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
          <p v-if="errors.motivo" class="text-xs text-red-600 mt-1">{{ errors.motivo }}</p>
        </div>

        <!-- Descripción detallada -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada *</label>
          <textarea 
            v-model="formData.descripcion" 
            rows="2" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Explica el motivo de tu solicitud..."
            maxlength="500"
            required
          ></textarea>
          <div class="flex justify-between mt-1">
            <p v-if="errors.descripcion" class="text-xs text-red-600">{{ errors.descripcion }}</p>
            <p class="text-xs text-gray-500 ml-auto">{{ formData.descripcion?.length || 0 }}/500</p>
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
                v-model="formData.latitud"
                step="any"
                placeholder="-33.4489"
                class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Longitud</label>
              <input 
                type="number" 
                v-model="formData.longitud"
                step="any"
                placeholder="-70.6693"
                class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-xs"
              />
            </div>
          </div>
          
          <!-- Información de ubicación -->
          <div v-if="formData.latitud && formData.longitud" class="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <p class="text-xs text-green-700">
              📍 GPS: {{ parseFloat(formData.latitud).toFixed(4) }}, {{ parseFloat(formData.longitud).toFixed(4) }}
            </p>
          </div>
          
          <!-- Error de ubicación -->
          <div v-if="errorUbicacion" class="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <p class="text-xs text-red-700">{{ errorUbicacion }}</p>
          </div>
        </div>
      </div>

      <!-- Estado de envío -->
      <div v-if="enviando" class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center">
          <svg class="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-blue-700">Enviando solicitud...</span>
        </div>
      </div>

      <!-- Mensaje de error general -->
      <div v-if="errorGeneral" class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">{{ errorGeneral }}</p>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
        <button 
          @click="$emit('cancel')" 
          :disabled="enviando"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          @click="enviarSolicitud" 
          :disabled="enviando || !isFormValid"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ enviando ? 'Enviando...' : 'Enviar Solicitud' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps, onMounted } from 'vue'
import { useMarcaciones } from '@/composables/useMarcaciones.js'

const emit = defineEmits(['confirm', 'cancel'])

// Props
const props = defineProps({
  fechaInicial: {
    type: String,
    default: null
  }
})

// Composable de marcaciones
const { 
  getTiposMarcacion, 
  getMotivosSolicitud,
  validarMarcacion, 
  obtenerUbicacionGPS,
  getFechaActual,
  getFechaAyer,
  getFechaMinima,
  getFechaMaxima,
  getHoraActual
} = useMarcaciones()

// Estado del formulario
const formData = ref({
  tipo_marcacion_correcta: '',
  fecha: '',
  hora: '',
  motivo: '',
  descripcion: '',
  latitud: '',
  longitud: ''
})

// Estados de validación y envío
const errors = ref({})
const enviando = ref(false)
const errorGeneral = ref('')
const obteniendoUbicacion = ref(false)
const errorUbicacion = ref('')

// Datos auxiliares
const tiposMarcacion = getTiposMarcacion()
const motivosSolicitud = getMotivosSolicitud()
const fechaMinima = getFechaMinima()
const fechaMaxima = getFechaMaxima()

// Computed para validación del formulario
const isFormValid = computed(() => {
  return formData.value.tipo_marcacion_correcta.trim() !== '' && 
         formData.value.fecha.trim() !== '' &&
         formData.value.hora.trim() !== '' &&
         formData.value.motivo.trim() !== '' &&
         formData.value.descripcion.trim() !== '' &&
         formData.value.descripcion.trim().length >= 10
})

// Métodos
const validarFormulario = () => {
  const validacion = validarMarcacion({
    ...formData.value,
    motivo: formData.value.descripcion // Usar descripción como motivo para validación
  })
  errors.value = validacion.errores
  return validacion.esValido
}

const usarFechaActual = () => {
  formData.value.fecha = getFechaActual()
}

const usarFechaAyer = () => {
  formData.value.fecha = getFechaAyer()
}

const usarHoraActual = () => {
  formData.value.hora = getHoraActual()
}

const obtenerUbicacion = async () => {
  obteniendoUbicacion.value = true
  errorUbicacion.value = ''
  
  try {
    const ubicacion = await obtenerUbicacionGPS()
    
    if (ubicacion.success) {
      formData.value.latitud = ubicacion.latitud.toString()
      formData.value.longitud = ubicacion.longitud.toString()
    } else {
      errorUbicacion.value = ubicacion.error
    }
  } catch (error) {
    errorUbicacion.value = 'Error inesperado al obtener ubicación'
    console.error('Error obteniendo ubicación:', error)
  } finally {
    obteniendoUbicacion.value = false
  }
}

const enviarSolicitud = async () => {
  if (!validarFormulario()) return
  
  enviando.value = true
  errorGeneral.value = ''
  
  try {
    const solicitudData = {
      tipo_marcacion_correcta: formData.value.tipo_marcacion_correcta,
      fecha: formData.value.fecha,
      hora: formData.value.hora,
      motivo: formData.value.motivo,
      descripcion: formData.value.descripcion,
      geo_lat: formData.value.latitud ? parseFloat(formData.value.latitud) : null,
      geo_lon: formData.value.longitud ? parseFloat(formData.value.longitud) : null,
      estado: 'pendiente',
      fecha_solicitud: new Date().toISOString()
    }
    
    emit('confirm', solicitudData)
  } catch (error) {
    errorGeneral.value = 'Error al procesar la solicitud'
    console.error('Error enviando solicitud:', error)
  } finally {
    enviando.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Inicializar con fecha proporcionada o fecha de ayer por defecto
  formData.value.fecha = props.fechaInicial || getFechaAyer()
  formData.value.hora = getHoraActual()
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
