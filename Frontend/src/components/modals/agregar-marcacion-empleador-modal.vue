<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black opacity-50" @click="$emit('cancel')"></div>

    <div class="bg-white rounded-lg shadow-lg z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
      <h3 class="text-lg font-semibold mb-4 text-gray-900">Agregar Marcación a Trabajador</h3>

      <!-- Información de ayuda -->
      <div class="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-start">
          <div class="p-1 bg-blue-100 rounded-full mr-2 mt-0.5">
            <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h4 class="text-xs font-medium text-blue-800 mb-1">Agregar Marcación Manual</h4>
            <p class="text-xs text-blue-700">
              Complete los campos para agregar una marcación manual a un trabajador. 
              Esta acción quedará registrada en el sistema.
            </p>
          </div>
        </div>
      </div>

      <!-- Formulario de solicitud -->
      <div class="space-y-4">
        <!-- Selección de Trabajador -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Trabajador *
          </label>
          
          <!-- Búsqueda de trabajador -->
          <div class="relative mb-2">
            <input 
              type="text" 
              v-model="busquedaTrabajador"
              @input="filtrarTrabajadores"
              placeholder="Buscar por nombre o RUT..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <!-- Loading de trabajadores -->
          <div v-if="cargandoTrabajadores" class="p-4 text-center">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p class="text-sm text-gray-600 mt-2">Cargando trabajadores...</p>
          </div>

          <!-- Lista de trabajadores -->
          <div v-else-if="trabajadoresFiltrados.length > 0 && !formData.trabajadorSeleccionado" class="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
            <div 
              v-for="trabajador in trabajadoresFiltrados" 
              :key="trabajador.id"
              @click="seleccionarTrabajador(trabajador)"
              class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
              :class="{
                'bg-indigo-50 hover:bg-indigo-100': formData.trabajadorSeleccionado?.id === trabajador.id
              }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div :class="obtenerColorAvatar(trabajador.id)" class="h-10 w-10 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-white">
                        {{ obtenerIniciales(trabajador.usuario_nombre, trabajador.usuario_apellido_pat) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ trabajador.usuario_nombre }} {{ trabajador.usuario_apellido_pat }}
                      <span v-if="trabajador.id === authStore.user?.id" class="ml-2 text-xs font-semibold text-indigo-600">(Tú)</span>
                    </p>
                    <p class="text-xs text-gray-500">RUT: {{ trabajador.usuario_rut }}</p>
                  </div>
                </div>
                <div v-if="formData.trabajadorSeleccionado?.id === trabajador.id">
                  <svg class="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Sin resultados -->
          <div v-else-if="busquedaTrabajador && trabajadoresFiltrados.length === 0 && !formData.trabajadorSeleccionado" class="p-4 text-center text-sm text-gray-500 border border-gray-200 rounded-md">
            No se encontraron trabajadores
          </div>

          <!-- Trabajador seleccionado -->
          <div v-if="formData.trabajadorSeleccionado" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm font-medium text-green-800">
                  {{ formData.trabajadorSeleccionado.usuario_nombre }} {{ formData.trabajadorSeleccionado.usuario_apellido_pat }} - {{ formData.trabajadorSeleccionado.usuario_rut }}
                </span>
              </div>
              <button 
                @click="limpiarSeleccion"
                type="button"
                class="text-green-600 hover:text-green-800"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <p v-if="errors.trabajador" class="text-xs text-red-600 mt-1">{{ errors.trabajador }}</p>
        </div>

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
                'border-indigo-500 bg-indigo-50': formData.tipo === tipo.value,
                'border-gray-300': formData.tipo !== tipo.value
              }"
            >
              <input 
                type="radio" 
                v-model="formData.tipo" 
                :value="tipo.value"
                class="sr-only"
              />
              <div class="flex items-center">
                <span class="text-base mr-2">{{ tipo.icon }}</span>
                <span class="text-sm font-medium text-gray-900">{{ tipo.label }}</span>
              </div>
              <div 
                v-if="formData.tipo === tipo.value" 
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

        <!-- Motivo de la marcación -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
          <textarea 
            v-model="formData.motivo" 
            rows="2" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Explica el motivo de esta marcación manual..."
            maxlength="500"
            required
          ></textarea>
          <div class="flex justify-between mt-1">
            <p v-if="errors.motivo" class="text-xs text-red-600">{{ errors.motivo }}</p>
            <p class="text-xs text-gray-500 ml-auto">{{ formData.motivo?.length || 0 }}/500</p>
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
          <span class="text-sm text-blue-700">Agregando marcación...</span>
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
          @click="agregarMarcacion" 
          :disabled="enviando || !isFormValid"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ enviando ? 'Agregando...' : 'Agregar Marcación' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, onMounted } from 'vue'
import { useMarcaciones } from '@/composables/use-marcaciones.js'
import { useEmpresa } from '@/composables/use-empresa.js'
import { useAuthStore } from '@/stores/auth-store.js'

const emit = defineEmits(['confirm', 'cancel'])
const authStore = useAuthStore();

// Composables
const { 
  getTiposMarcacion, 
  getFechaActual,
  getFechaAyer,
  getFechaMinima,
  getFechaMaxima,
  getHoraActual
} = useMarcaciones()

const { obtenerTrabajadores } = useEmpresa()

// Estado del formulario
const formData = ref({
  trabajadorSeleccionado: null,
  tipo: '',
  fecha: '',
  hora: '',
  motivo: ''
})

// Estados de validación y envío
const errors = ref({})
const enviando = ref(false)
const errorGeneral = ref('')

// Estados para trabajadores
const trabajadores = ref([])
const trabajadoresFiltrados = ref([])
const busquedaTrabajador = ref('')
const cargandoTrabajadores = ref(false)

// Datos auxiliares
const tiposMarcacion = getTiposMarcacion()
const fechaMinima = getFechaMinima()
const fechaMaxima = getFechaMaxima()

// Computed para validación del formulario
const isFormValid = computed(() => {
  return formData.value.trabajadorSeleccionado !== null &&
         formData.value.tipo.trim() !== '' && 
         formData.value.fecha.trim() !== '' &&
         formData.value.hora.trim() !== '' &&
         formData.value.motivo.trim() !== '' &&
         formData.value.motivo.trim().length >= 10
})

// Métodos para trabajadores
const cargarTrabajadores = async () => {
  cargandoTrabajadores.value = true
  try {
    const response = await obtenerTrabajadores()
    trabajadores.value = response || []
    trabajadoresFiltrados.value = trabajadores.value
  } catch (error) {
    console.error('Error al cargar trabajadores:', error)
    errorGeneral.value = 'Error al cargar la lista de trabajadores'
  } finally {
    cargandoTrabajadores.value = false
  }
}

const filtrarTrabajadores = () => {
  const busqueda = busquedaTrabajador.value.toLowerCase().trim()
  
  if (!busqueda) {
    trabajadoresFiltrados.value = trabajadores.value
    return
  }
  
  trabajadoresFiltrados.value = trabajadores.value.filter(trabajador => {
    const nombreCompleto = `${trabajador.nombre} ${trabajador.apellido}`.toLowerCase()
    const rut = trabajador.rut.toLowerCase()
    return nombreCompleto.includes(busqueda) || rut.includes(busqueda)
  })
}

const seleccionarTrabajador = (trabajador) => {
  formData.value.trabajadorSeleccionado = trabajador
  errors.value.trabajador = ''
}

const limpiarSeleccion = () => {
  formData.value.trabajadorSeleccionado = null
  busquedaTrabajador.value = ''
  trabajadoresFiltrados.value = trabajadores.value
}

const obtenerIniciales = (nombre, apellido) => {
  const primerNombre = nombre ? nombre.charAt(0).toUpperCase() : ''
  const primerApellido = apellido ? apellido.charAt(0).toUpperCase() : ''
  return primerNombre + primerApellido
}

const obtenerColorAvatar = (id) => {
  const colores = [
    'bg-indigo-500',
    'bg-purple-500', 
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-gray-500'
  ]
  // Usar el ID del trabajador para generar un color consistente
  const index = id ? id % colores.length : 0
  return colores[index]
}

// Métodos de formulario
const validarFormulario = () => {
  errors.value = {}
  
  if (!formData.value.trabajadorSeleccionado) {
    errors.value.trabajador = 'Debe seleccionar un trabajador'
  }
  
  if (!formData.value.tipo) {
    errors.value.tipo = 'Debe seleccionar un tipo de marcación'
  }
  
  if (!formData.value.fecha) {
    errors.value.fecha = 'Debe seleccionar una fecha'
  }
  
  if (!formData.value.hora) {
    errors.value.hora = 'Debe seleccionar una hora'
  }
  
  if (!formData.value.motivo || formData.value.motivo.trim().length < 10) {
    errors.value.motivo = 'El motivo debe tener al menos 10 caracteres'
  }
  
  return Object.keys(errors.value).length === 0
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

const agregarMarcacion = async () => {
  if (!validarFormulario()) return
  
  enviando.value = true
  errorGeneral.value = ''
  
  try {
    const marcacionData = {
      usuario_id: formData.value.trabajadorSeleccionado.id,
      tipo: formData.value.tipo,
      fecha: formData.value.fecha,
      hora: formData.value.hora,
      motivo: formData.value.motivo,
      agregada_manualmente: true
    }
    
    emit('confirm', marcacionData)
  } catch (error) {
    errorGeneral.value = 'Error al procesar la marcación'
    console.error('Error agregando marcación:', error)
  } finally {
    enviando.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Inicializar con fecha actual y hora actual por defecto
  formData.value.fecha = getFechaActual()
  formData.value.hora = getHoraActual()
  
  // Cargar trabajadores
  cargarTrabajadores()
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

/* Personalizar scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
