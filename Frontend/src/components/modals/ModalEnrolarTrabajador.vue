<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click="closeOnBackdrop"
  >
    <!-- Overlay -->
    <div class="fixed inset-0 bg-opacity-50 transition-opacity modal-overlay"></div>
    
    <!-- Modal Container -->
    <div class="relative z-10 w-full max-w-lg lg:max-w-2xl mx-4">
      <!-- Modal Content -->
      <div 
        class="relative transform rounded-lg bg-white text-left shadow-2xl transition-all max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <!-- Header del Modal -->
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-gray-900">
              Enrolar Trabajador
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Información del Trabajador -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="text-sm font-medium text-blue-900 mb-3">Información del Trabajador</h4>
            <div class="flex items-center">
              <div class="h-12 w-12 flex-shrink-0">
                <div class="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <span class="text-white font-medium text-lg">{{ getInitials(trabajador?.trab_nombre, trabajador?.trab_ap_paterno) }}</span>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-900">{{ trabajador?.trab_nombre }} {{ trabajador?.trab_ap_paterno }}</p>
                <p class="text-sm text-gray-500">RUT: {{ trabajador?.prov_rut }}</p>
              </div>
            </div>
          </div>
          
          <!-- Formulario -->
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Información de la Cuenta -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Información de la Cuenta</h4>
              
              <div class="space-y-4">
                <!-- RUT (solo lectura) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    RUT *
                  </label>
                  <input 
                    type="text" 
                    :value="trabajador?.prov_rut"
                    readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <span class="text-gray-500 text-xs mt-1">El RUT no puede ser modificado</span>
                </div>

                <!-- Nombre (solo lectura) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input 
                    type="text" 
                    :value="`${trabajador?.trab_nombre || ''} ${trabajador?.trab_ap_paterno || ''}`"
                    readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <span class="text-gray-500 text-xs mt-1">El nombre se obtiene del sistema de proveedores</span>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: juan.perez@empresa.com"
                  />
                  <span v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</span>
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div class="relative">
                    <input
                      v-model="form.password"
                      :type="mostrarPassword ? 'text' : 'password'"
                      required
                      minlength="6"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button 
                      type="button"
                      @click="mostrarPassword = !mostrarPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg v-if="mostrarPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M21.536 15.536a9.97 9.97 0 01-1.563 3.029M15.121 14.121L21.536 8.464m-6.415 5.657L21.536 8.464"></path>
                      </svg>
                      <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                  </div>
                  <span v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</span>
                </div>

                <!-- Rol -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <input
                    type="text"
                    value="Trabajador"
                    readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <span class="text-gray-500 text-xs mt-1">El rol por defecto es trabajador y no puede ser modificado</span>
                </div>
              </div>
            </div>

            <!-- Mensaje de Error General -->
            <div v-if="errorGeneral" class="bg-red-50 border border-red-200 rounded-md p-3">
              <div class="flex">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-red-800">{{ errorGeneral }}</p>
                </div>
              </div>
            </div>

            <!-- Mensaje de Éxito -->
            <div v-if="mensajeExito" class="bg-green-50 border border-green-200 rounded-md p-3">
              <div class="flex">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-green-800">{{ mensajeExito }}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer del Modal -->
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            @click="submitForm"
            :disabled="isLoading"
            type="button"
            class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Enrolando...' : 'Enrolar Trabajador' }}
          </button>
          <button
            @click="closeModal"
            :disabled="isLoading"
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import EmpresaServices from '@/services/EmpresaService.js'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  trabajador: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'success'])

// Estados reactivos
const isLoading = ref(false)
const mostrarPassword = ref(false)
const errorGeneral = ref('')
const mensajeExito = ref('')

// Datos del formulario
const form = reactive({
  email: '',
  password: '',
  rol: 'trabajador' // Rol fijo, no cambiable
})

// Errores de validación
const errors = reactive({
  email: '',
  password: ''
})

// Métodos
const closeModal = () => {
  // Restaurar scroll del body
  const body = document.body
  const html = document.documentElement
  
  body.style.overflow = ''
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.bottom = ''
  body.classList.remove('modal-open')
  html.style.overflow = ''
  
  emit('close')
  resetForm()
}

const closeOnBackdrop = (event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const resetForm = () => {
  // Resetear datos del formulario
  form.email = ''
  form.password = ''
  // El rol siempre permanece como 'trabajador' y no se resetea
  
  // Resetear errores
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  errorGeneral.value = ''
  mensajeExito.value = ''
  mostrarPassword.value = false
}

// Función para obtener iniciales
const getInitials = (nombre, apellido) => {
  const initial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
  const initial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
  return initial1 + initial2;
}

const validateForm = () => {
  let isValid = true
  
  // Resetear errores
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  // Validar campos requeridos
  if (!form.email.trim()) {
    errors.email = 'El email es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Formato de email inválido'
    isValid = false
  }
  
  if (!form.password.trim()) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }
  
  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  errorGeneral.value = ''
  mensajeExito.value = ''
  
  try {
    // Preparar datos para enviar
    const datosEnrolamiento = {
      rut: props.trabajador.prov_rut,
      nombre: `${props.trabajador.trab_nombre} ${props.trabajador.trab_ap_paterno}`,
      email: form.email,
      password: form.password,
      rol: form.rol
    }

    console.log('Datos de enrolamiento a enviar:', datosEnrolamiento)
    const response = await EmpresaServices.enrolarTrabajador(datosEnrolamiento)

    console.log('Trabajador enrolado exitosamente:', response)

    if (response.success) {
      mensajeExito.value = 'Trabajador enrolado exitosamente'
      
      // Emitir evento de éxito con los datos del trabajador enrolado
      setTimeout(() => {
        emit('success', { ...props.trabajador, cuenta_creada: true, email: form.email, rol: form.rol })
        closeModal()
      }, 1500)
    } else {
      errorGeneral.value = response.message || 'Error al enrolar el trabajador. Por favor, intente nuevamente.'
    }

  } catch (error) {
    console.error('Error enrolando trabajador:', error)
    
    if (error.response && error.response.data && error.response.data.message) {
      errorGeneral.value = error.response.data.message
    } else {
      errorGeneral.value = 'Error al enrolar el trabajador. Por favor, intente nuevamente.'
    }
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset form when modal opens
    resetForm()
    // Prevenir scroll del body de manera más agresiva
    const body = document.body
    const html = document.documentElement
    
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = '0'
    body.style.left = '0'
    body.style.right = '0'
    body.style.bottom = '0'
    body.classList.add('modal-open')
    html.style.overflow = 'hidden'
  } else {
    // Restaurar scroll del body
    const body = document.body
    const html = document.documentElement
    
    body.style.overflow = ''
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.bottom = ''
    body.classList.remove('modal-open')
    html.style.overflow = ''
  }
})

// Watch para prellenar el email si el trabajador ya tiene uno
watch(() => props.trabajador, (newTrabajador) => {
  if (newTrabajador && newTrabajador.email) {
    form.email = newTrabajador.email
  }
}, { immediate: true })
</script>

<style scoped>
/* Asegurar que el modal esté por encima de todo */
.modal-overlay {
  backdrop-filter: blur(2px);
}

/* Ocultar barra de scroll pero mantener funcionalidad */
.modal-content {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.modal-content::-webkit-scrollbar {
  display: none; /* WebKit */
}

/* Animaciones de entrada y salida */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Prevenir scroll del body cuando el modal está abierto */
body.modal-open {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
  height: 100%;
}
</style>
