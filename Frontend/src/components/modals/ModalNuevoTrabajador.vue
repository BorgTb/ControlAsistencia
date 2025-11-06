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

            <!-- Preferencias de Compensación -->
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Preferencias de Compensación de Horas Extras</h4>
              
              <div class="space-y-4">
                <!-- Tipo de Compensación -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Compensación *
                  </label>
                  <select
                    v-model="trabajador.preferenciasCompensacion.tipo_compensacion"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="PAGO">Pago en dinero</option>
                    <option value="DESCANSO">Descanso compensatorio</option>
                    <option value="mixto">Mixto (Pago + Descanso)</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    • Pago en dinero: Recibe pago por horas extras
                    • Descanso: Recibe días de descanso equivalentes
                    • Mixto: Combinación de ambas opciones
                  </p>
                  <span v-if="errors.preferenciasCompensacion.tipo_compensacion" class="text-red-500 text-xs mt-1">{{ errors.preferenciasCompensacion.tipo_compensacion }}</span>
                </div>

                <!-- Porcentaje de Pago (solo para mixto) -->
                <div v-if="trabajador.preferenciasCompensacion.tipo_compensacion === 'mixto'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje en Pago % *
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="trabajador.preferenciasCompensacion.porcentaje_pago"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: 70"
                    />
                    <span class="text-sm text-gray-700">%</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    El resto ({{ 100 - (trabajador.preferenciasCompensacion.porcentaje_pago || 0) }}%) se recibirá como descanso
                  </p>
                  <span v-if="errors.preferenciasCompensacion.porcentaje_pago" class="text-red-500 text-xs mt-1">{{ errors.preferenciasCompensacion.porcentaje_pago }}</span>
                </div>

                <!-- Fecha de Inicio -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio de Preferencia
                  </label>
                  <input
                    v-model="trabajador.preferenciasCompensacion.fecha_inicio"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p class="text-xs text-gray-500 mt-1">A partir de cuándo será válida esta preferencia</p>
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
import EmpresaServices from '../../services/EmpresaService.js'
import { useAuthStore } from '../../stores/authStore.js'

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
  fechaResolucion: '',
  preferenciasCompensacion: {
    tipo_compensacion: 'PAGO',
    porcentaje_pago: 0,
    fecha_inicio: new Date().toISOString().split('T')[0]
  }
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
  fechaResolucion: '',
  preferenciasCompensacion: {
    tipo_compensacion: '',
    porcentaje_pago: ''
  }
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
  trabajador.preferenciasCompensacion.tipo_compensacion = 'PAGO'
  trabajador.preferenciasCompensacion.porcentaje_pago = 0
  trabajador.preferenciasCompensacion.fecha_inicio = new Date().toISOString().split('T')[0]
  
  // Resetear errores
  Object.keys(errors).forEach(key => {
    if (typeof errors[key] === 'object') {
      Object.keys(errors[key]).forEach(subKey => {
        errors[key][subKey] = ''
      })
    } else {
      errors[key] = ''
    }
  })
  
  errorGeneral.value = ''
}



const validateForm = () => {
  let isValid = true
  
  // Resetear errores
  Object.keys(errors).forEach(key => {
    if (typeof errors[key] === 'object') {
      Object.keys(errors[key]).forEach(subKey => {
        errors[key][subKey] = ''
      })
    } else {
      errors[key] = ''
    }
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

  // Validar preferencias de compensación
  if (!trabajador.preferenciasCompensacion.tipo_compensacion) {
    errors.preferenciasCompensacion.tipo_compensacion = 'El tipo de compensación es requerido'
    isValid = false
  }

  if (trabajador.preferenciasCompensacion.tipo_compensacion === 'mixto') {
    const porcentaje = parseFloat(trabajador.preferenciasCompensacion.porcentaje_pago)
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      errors.preferenciasCompensacion.porcentaje_pago = 'El porcentaje debe estar entre 0 y 100'
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
    // Debug: Verificar autenticación antes de enviar
    const authStore = useAuthStore()
    console.log('🔍 Debug auth antes de crear trabajador:')
    console.log('- Token existe:', !!authStore.getToken)
    console.log('- Usuario:', authStore.getUser)
    console.log('- Datos a enviar:', trabajador)
    
    if (!authStore.getToken) {
      errorGeneral.value = 'Error de autenticación. Por favor, inicie sesión nuevamente.'
      return
    }
    
    // Aquí simularemos el envío - reemplazar con llamada real al API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simular éxito (puedes cambiar esto por una llamada real al servidor)
    console.log('Datos del usuario a enviar:', trabajador)
    const response = await EmpresaServices.crearTrabajador(trabajador)

    console.log('Usuario registrado exitosamente:', response)

    if (response.success) {
      emit('success', { ...trabajador })
      closeModal()
    } else {
      errorGeneral.value = response.message || 'Error al registrar el usuario. Por favor, intente nuevamente.'
    }

  } catch (error) {
    console.error('Error registrando usuario:', error)
    
    // Manejo específico de errores del servidor
    if (error.response) {
      const serverError = error.response.data
      console.error('📋 Detalles del error del servidor:', serverError)
      
      if (serverError.message) {
        errorGeneral.value = serverError.message
      } else if (error.response.status === 400) {
        errorGeneral.value = 'Los datos enviados no son válidos. Verifique que el RUT y email no estén ya registrados.'
      } else if (error.response.status === 401) {
        errorGeneral.value = 'Error de autenticación. Por favor, inicie sesión nuevamente.'
      } else {
        errorGeneral.value = `Error del servidor (${error.response.status}). Por favor, intente nuevamente.`
      }
    } else if (error.request) {
      errorGeneral.value = 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
    } else {
      errorGeneral.value = 'Error inesperado. Por favor, intente nuevamente.'
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
