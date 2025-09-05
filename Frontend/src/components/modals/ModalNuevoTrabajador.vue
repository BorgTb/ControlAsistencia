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
              Registrar Nuevo Usuario
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
          
          <!-- Formulario -->
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Información del Usuario -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Información del Usuario</h4>
              
              <div class="space-y-4">
                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombres *
                  </label>
                  <input
                    v-model="trabajador.nombre"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Juan Carlos"
                  />
                  <span v-if="errors.nombre" class="text-red-500 text-xs mt-1">{{ errors.nombre }}</span>
                </div>

                <!-- Apellido Paterno -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Paterno *
                  </label>
                  <input
                    v-model="trabajador.apellido_pat"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Pérez"
                  />
                  <span v-if="errors.apellido_pat" class="text-red-500 text-xs mt-1">{{ errors.apellido_pat }}</span>
                </div>

                <!-- Apellido Materno -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Materno *
                  </label>
                  <input
                    v-model="trabajador.apellido_mat"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: González"
                  />
                  <span v-if="errors.apellido_mat" class="text-red-500 text-xs mt-1">{{ errors.apellido_mat }}</span>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    v-model="trabajador.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: juan.perez@empresa.com"
                  />
                  <span v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</span>
                </div>

                <!-- RUT -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    RUT *
                  </label>
                  <input
                    v-model="trabajador.rut"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: 12.345.678-9"
                  />
                  <span v-if="errors.rut" class="text-red-500 text-xs mt-1">{{ errors.rut }}</span>
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    v-model="trabajador.password"
                    type="password"
                    required
                    minlength="6"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <span v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</span>
                </div>

                <!-- Rol -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    v-model="trabajador.rol"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="trabajador">Trabajador</option>
                    <option value="empleador">Empleador</option>
                    <option value="fiscalizador">Fiscalizador</option>
                  </select>
                  <span v-if="errors.rol" class="text-red-500 text-xs mt-1">{{ errors.rol }}</span>
                </div>

                <!-- Estado -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div class="flex items-center">
                    <label class="flex items-center cursor-pointer">
                      <input
                        v-model="trabajador.estado"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Usuario activo</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sistema Excepcional de Jornada -->
            <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Sistema Excepcional de Jornada de Trabajo</h4>
              
              <div class="space-y-4">
                <!-- Pregunta principal -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    ¿Se encuentra afecto a un sistema excepcional de jornada de trabajo?
                  </label>
                  <div class="flex items-center">
                    <label class="flex items-center cursor-pointer">
                      <input
                        v-model="trabajador.sistemaExcepcional"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Sí, está afecto a sistema excepcional</span>
                    </label>
                  </div>
                </div>

                <!-- Campos adicionales cuando está marcado -->
                <div v-if="trabajador.sistemaExcepcional" class="space-y-4 pl-6 border-l-2 border-yellow-300">
                  <!-- Número de Resolución -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Número de la Resolución *
                    </label>
                    <input
                      v-model="trabajador.numeroResolucion"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: RES-2024-001"
                    />
                    <span v-if="errors.numeroResolucion" class="text-red-500 text-xs mt-1">{{ errors.numeroResolucion }}</span>
                  </div>

                  <!-- Fecha de Resolución -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de la Resolución *
                    </label>
                    <input
                      v-model="trabajador.fechaResolucion"
                      type="date"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span v-if="errors.fechaResolucion" class="text-red-500 text-xs mt-1">{{ errors.fechaResolucion }}</span>
                  </div>
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
            {{ isLoading ? 'Registrando...' : 'Registrar Usuario' }}
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
import AdminServices from '../../services/AdminServices.js'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'success'])

// Estados reactivos
const isLoading = ref(false)
const errorGeneral = ref('')

// Datos del trabajador
const trabajador = reactive({
  nombre: '',
  apellido_pat: '',
  apellido_mat: '',
  email: '',
  password: '',
  rol: 'trabajador',
  rut: '',
  estado: true,
  sistemaExcepcional: false,
  numeroResolucion: '',
  fechaResolucion: ''
})

// Errores de validación
const errors = reactive({
  nombre: '',
  apellido_pat: '',
  apellido_mat: '',
  email: '',
  password: '',
  rol: '',
  rut: '',
  numeroResolucion: '',
  fechaResolucion: ''
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
  // Resetear datos del trabajador
  trabajador.nombre = ''
  trabajador.apellido_pat = ''
  trabajador.apellido_mat = ''
  trabajador.email = ''
  trabajador.password = ''
  trabajador.rol = 'trabajador'
  trabajador.rut = ''
  trabajador.estado = true
  trabajador.sistemaExcepcional = false
  trabajador.numeroResolucion = ''
  trabajador.fechaResolucion = ''
  
  // Resetear errores
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  errorGeneral.value = ''
}



const validateForm = () => {
  let isValid = true
  
  // Resetear errores
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  // Validar campos requeridos
  if (!trabajador.nombre.trim()) {
    errors.nombre = 'El nombre es requerido'
    isValid = false
  }
  
  if (!trabajador.apellido_pat.trim()) {
    errors.apellido_pat = 'El apellido paterno es requerido'
    isValid = false
  }
  
  if (!trabajador.apellido_mat.trim()) {
    errors.apellido_mat = 'El apellido materno es requerido'
    isValid = false
  }
  
  if (!trabajador.email.trim()) {
    errors.email = 'El email es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trabajador.email)) {
    errors.email = 'Formato de email inválido'
    isValid = false
  }
  
  if (!trabajador.password.trim()) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (trabajador.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }
  
  if (!trabajador.rut.trim()) {
    errors.rut = 'El RUT es requerido'
    isValid = false
  }
  
  if (!trabajador.rol) {
    errors.rol = 'El rol es requerido'
    isValid = false
  }
  
  // Validar sistema excepcional
  if (trabajador.sistemaExcepcional) {
    if (!trabajador.numeroResolucion.trim()) {
      errors.numeroResolucion = 'El número de resolución es requerido'
      isValid = false
    }
    
    if (!trabajador.fechaResolucion.trim()) {
      errors.fechaResolucion = 'La fecha de resolución es requerida'
      isValid = false
    }
  }
  
  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  errorGeneral.value = ''
  
  try {
    // Aquí simularemos el envío - reemplazar con llamada real al API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simular éxito (puedes cambiar esto por una llamada real al servidor)
    console.log('Datos del usuario a enviar:', trabajador)
    const response = await AdminServices.crearTrabajador(trabajador)

    console.log('Usuario registrado exitosamente:', response)

    if (response.success) {
      emit('success', { ...trabajador })
      closeModal()
    } else {
      errorGeneral.value = response.message || 'Error al registrar el usuario. Por favor, intente nuevamente.'
    }

  } catch (error) {
    console.error('Error registrando usuario:', error)
    errorGeneral.value = 'Error al registrar el usuario. Por favor, intente nuevamente.'
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
