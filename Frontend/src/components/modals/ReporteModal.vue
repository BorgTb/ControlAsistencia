<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black opacity-50" @click="$emit('cancel')"></div>

    <div class="bg-white rounded-lg shadow-lg z-10 w-11/12 max-w-2xl p-6">
      <h3 class="text-lg font-semibold mb-4 text-gray-900">Reportar Marcación</h3>

      <!-- Información de la marcación -->
      <div class="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Marcación a reportar:</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-600">Fecha:</span>
            <span class="ml-2 font-medium">{{ formatearFecha(marcacion.fecha) }}</span>
          </div>
          <div>
            <span class="text-gray-600">Hora:</span>
            <span class="ml-2 font-medium">{{ formatearHora(marcacion.hora) }}</span>
          </div>
          <div>
            <span class="text-gray-600">Tipo:</span>
            <span class="ml-2 font-medium">{{ getTipoLabel(marcacion.tipo) }}</span>
          </div>
          <div>
            <span class="text-gray-600">ID:</span>
            <span class="ml-2 font-medium">#{{ marcacion.id }}</span>
          </div>
        </div>
      </div>

      <!-- Formulario de reporte -->
      <div class="space-y-4">
        <!-- Tipo de problema -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de problema *</label>
          <select 
            v-model="formData.tipoProblema" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Selecciona el tipo de problema</option>
            <option value="hora_incorrecta">Hora incorrecta</option>
            <option value="tipo_incorrecto">Tipo de marcación incorrecto</option>
            <option value="ubicacion_incorrecta">Ubicación incorrecta</option>
            <option value="otro">Otro</option>
          </select>
          <p v-if="errors.tipoProblema" class="text-xs text-red-600 mt-1">{{ errors.tipoProblema }}</p>
        </div>


        

        <!-- Descripción del problema -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Descripción del problema *</label>
          <textarea 
            v-model="formData.descripcion" 
            rows="4" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe detalladamente el problema encontrado..."
            required
          ></textarea>
          <p v-if="errors.descripcion" class="text-xs text-red-600 mt-1">{{ errors.descripcion }}</p>
        </div>

        <!-- Datos correctos (opcional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Datos correctos (opcional)</label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Fecha correcta</label>
              <input 
                type="date" 
                v-model="formData.fechaCorrecta"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Hora correcta</label>
              <input 
                type="time" 
                v-model="formData.horaCorrecta"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <!-- Archivos adjuntos -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Archivos adjuntos (opcional)</label>
          <input 
            type="file" 
            @change="handleFileUpload"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p class="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, PDF, DOC, DOCX (máximo 5MB por archivo)</p>
          
          <!-- Lista de archivos seleccionados -->
          <div v-if="formData.archivos.length > 0" class="mt-2">
            <p class="text-xs text-gray-600 mb-1">Archivos seleccionados:</p>
            <ul class="text-xs text-gray-500 space-y-1">
              <li v-for="(archivo, index) in formData.archivos" :key="index" class="flex items-center justify-between">
                <span>{{ archivo.name }} ({{ formatearTamanoArchivo(archivo.size) }})</span>
                <button @click="removerArchivo(index)" class="text-red-500 hover:text-red-700 ml-2">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Estado de envío -->
      <div v-if="enviando" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center">
          <svg class="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-blue-700">Enviando reporte...</span>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-if="errorGeneral" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">{{ errorGeneral }}</p>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 mt-6">
        <button 
          @click="$emit('cancel')" 
          :disabled="enviando"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          @click="enviarReporte" 
          :disabled="enviando || !isFormValid"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ enviando ? 'Enviando...' : 'Enviar Reporte' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue'

const props = defineProps({
  marcacion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

// Estado del formulario
const formData = ref({
  tipoProblema: '',
  descripcion: '',
  fechaCorrecta: '',
  horaCorrecta: '',
  archivos: []
})

// Estados de validación y envío
const errors = ref({})
const enviando = ref(false)
const errorGeneral = ref('')

// Computed para validación del formulario
const isFormValid = computed(() => {
  return formData.value.tipoProblema.trim() !== '' && 
         formData.value.descripcion.trim() !== ''
})

// Métodos
const validarFormulario = () => {
  errors.value = {}
  
  if (!formData.value.tipoProblema.trim()) {
    errors.value.tipoProblema = 'El tipo de problema es requerido'
  }
  
  if (!formData.value.descripcion.trim()) {
    errors.value.descripcion = 'La descripción es requerida'
  }
  
  if (formData.value.descripcion.trim().length < 10) {
    errors.value.descripcion = 'La descripción debe tener al menos 10 caracteres'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  files.forEach(file => {
    if (file.size <= maxSize) {
      formData.value.archivos.push(file)
    } else {
      errorGeneral.value = `El archivo ${file.name} es demasiado grande (máximo 5MB)`
    }
  })
  
  // Limpiar el input
  event.target.value = ''
}

const removerArchivo = (index) => {
  formData.value.archivos.splice(index, 1)
}

const formatearTamanoArchivo = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const enviarReporte = async () => {
  if (!validarFormulario()) return
  
  enviando.value = true
  errorGeneral.value = ''
  
  try {
    const reporteData = {
      marcacion_id: props.marcacion.id,
      tipo_problema: formData.value.tipoProblema,
      descripcion: formData.value.descripcion,
      fecha_correcta: formData.value.fechaCorrecta || null,
      hora_correcta: formData.value.horaCorrecta || null,
      archivos: formData.value.archivos
    }
    
    emit('confirm', reporteData)
  } catch (error) {
    errorGeneral.value = 'Error al procesar el reporte'
    console.error('Error enviando reporte:', error)
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

const formatearHora = (hora) => {
  if (typeof hora === 'string' && hora.includes(':')) {
    const [horas, minutos, segundos] = hora.split(':')
    return `${horas}:${minutos}:${segundos || '00'}`
  }
  
  return new Date(hora).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
