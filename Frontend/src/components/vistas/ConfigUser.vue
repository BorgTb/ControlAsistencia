<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Configuración de Usuario</h1>
        <p class="mt-2 text-gray-600">Administra tu información personal y configuración de seguridad</p>
      </div>

      <!-- Información Actual del Usuario -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Información Actual</h2>
        </div>
        <div class="px-6 py-4">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Nombre</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ userData.nombre || 'No especificado' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ userData.email || 'No especificado' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Último acceso</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(userData.ultimo_acceso) || 'No disponible' }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Cambiar Email -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Cambiar Email</h2>
            <p class="mt-1 text-sm text-gray-600">Actualiza tu dirección de correo electrónico</p>
          </div>
          <form @submit.prevent="changeEmail" class="px-6 py-4 space-y-4">
            <div>
              <label for="current-email" class="block text-sm font-medium text-gray-700">
                Email Actual
              </label>
              <input
                type="email"
                id="current-email"
                :value="userData.email"
                disabled
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label for="new-email" class="block text-sm font-medium text-gray-700">
                Nuevo Email
              </label>
              <input
                type="email"
                id="new-email"
                v-model="emailForm.newEmail"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                :class="{ 'border-red-300': emailForm.errors.newEmail }"
              />
              <p v-if="emailForm.errors.newEmail" class="mt-1 text-sm text-red-600">
                {{ emailForm.errors.newEmail }}
              </p>
            </div>
            
            <div>
              <label for="confirm-email" class="block text-sm font-medium text-gray-700">
                Confirmar Nuevo Email
              </label>
              <input
                type="email"
                id="confirm-email"
                v-model="emailForm.confirmEmail"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                :class="{ 'border-red-300': emailForm.errors.confirmEmail }"
              />
              <p v-if="emailForm.errors.confirmEmail" class="mt-1 text-sm text-red-600">
                {{ emailForm.errors.confirmEmail }}
              </p>
            </div>
            
            <div>
              <label for="email-password" class="block text-sm font-medium text-gray-700">
                Confirmar con tu Contraseña
              </label>
              <input
                type="password"
                id="email-password"
                v-model="emailForm.password"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                :class="{ 'border-red-300': emailForm.errors.password }"
              />
              <p v-if="emailForm.errors.password" class="mt-1 text-sm text-red-600">
                {{ emailForm.errors.password }}
              </p>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="emailForm.isLoading"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="emailForm.isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ emailForm.isLoading ? 'Actualizando...' : 'Actualizar Email' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Cambiar Contraseña -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Cambiar Contraseña</h2>
            <p class="mt-1 text-sm text-gray-600">Actualiza tu contraseña para mayor seguridad</p>
          </div>
          <form @submit.prevent="changePassword" class="px-6 py-4 space-y-4">
            <div>
              <label for="current-password" class="block text-sm font-medium text-gray-700">
                Contraseña Actual
              </label>
              <div class="mt-1 relative">
                <input
                  :type="passwordForm.showCurrentPassword ? 'text' : 'password'"
                  id="current-password"
                  v-model="passwordForm.currentPassword"
                  required
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                  :class="{ 'border-red-300': passwordForm.errors.currentPassword }"
                />
                <button
                  type="button"
                  @click="passwordForm.showCurrentPassword = !passwordForm.showCurrentPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="passwordForm.showCurrentPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a9.945 9.945 0 00-3.982 2.414M14.12 14.12l1.414 1.414a9.945 9.945 0 003.982-2.414M9.878 9.878L8.05 8.05M14.12 14.12l1.88 1.88"></path>
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
              <p v-if="passwordForm.errors.currentPassword" class="mt-1 text-sm text-red-600">
                {{ passwordForm.errors.currentPassword }}
              </p>
            </div>
            
            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div class="mt-1 relative">
                <input
                  :type="passwordForm.showNewPassword ? 'text' : 'password'"
                  id="new-password"
                  v-model="passwordForm.newPassword"
                  required
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                  :class="{ 'border-red-300': passwordForm.errors.newPassword }"
                />
                <button
                  type="button"
                  @click="passwordForm.showNewPassword = !passwordForm.showNewPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="passwordForm.showNewPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a9.945 9.945 0 00-3.982 2.414M14.12 14.12l1.414 1.414a9.945 9.945 0 003.982-2.414M9.878 9.878L8.05 8.05M14.12 14.12l1.88 1.88"></path>
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
              <p v-if="passwordForm.errors.newPassword" class="mt-1 text-sm text-red-600">
                {{ passwordForm.errors.newPassword }}
              </p>
              <p class="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números
              </p>
            </div>
            
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                Confirmar Nueva Contraseña
              </label>
              <div class="mt-1 relative">
                <input
                  :type="passwordForm.showConfirmPassword ? 'text' : 'password'"
                  id="confirm-password"
                  v-model="passwordForm.confirmPassword"
                  required
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                  :class="{ 'border-red-300': passwordForm.errors.confirmPassword }"
                />
                <button
                  type="button"
                  @click="passwordForm.showConfirmPassword = !passwordForm.showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="passwordForm.showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a9.945 9.945 0 00-3.982 2.414M14.12 14.12l1.414 1.414a9.945 9.945 0 003.982-2.414M9.878 9.878L8.05 8.05M14.12 14.12l1.88 1.88"></path>
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
              <p v-if="passwordForm.errors.confirmPassword" class="mt-1 text-sm text-red-600">
                {{ passwordForm.errors.confirmPassword }}
              </p>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="passwordForm.isLoading"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="passwordForm.isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ passwordForm.isLoading ? 'Actualizando...' : 'Actualizar Contraseña' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Notificaciones -->
      <div v-if="notification.show" class="fixed top-4 right-4 z-50">
        <div 
          class="min-w-96 max-w-lg w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
          :class="{
            'ring-green-500': notification.type === 'success',
            'ring-red-500': notification.type === 'error',
            'ring-yellow-500': notification.type === 'warning'
          }"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg v-if="notification.type === 'success'" class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-else-if="notification.type === 'error'" class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3 w-0 flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ notification.message }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  @click="hideNotification"
                  class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import AuthService from '../../services/Authservices'

const { user } = useAuth()
const userData = computed(() => user.value || {})

// Estado de notificaciones
const notification = reactive({
  show: false,
  type: 'success', // 'success', 'error', 'warning'
  message: ''
})

// Formulario para cambiar email
const emailForm = reactive({
  newEmail: '',
  confirmEmail: '',
  password: '',
  isLoading: false,
  errors: {}
})

// Formulario para cambiar contraseña
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  showCurrentPassword: false,
  showNewPassword: false,
  showConfirmPassword: false,
  isLoading: false,
  errors: {}
})

// Funciones de utilidad
const showNotification = (type, message) => {
  notification.type = type
  notification.message = message
  notification.show = true
  
  setTimeout(() => {
    hideNotification()
  }, 5000)
}

const hideNotification = () => {
  notification.show = false
}

const formatDate = (dateString) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Cambiar email
const changeEmail = async () => {
  // Limpiar errores previos
  emailForm.errors = {}
  
  // Validaciones del lado cliente
  if (!AuthService.validateEmail(emailForm.newEmail)) {
    emailForm.errors.newEmail = 'Por favor ingresa un email válido'
    return
  }
  
  if (emailForm.newEmail !== emailForm.confirmEmail) {
    emailForm.errors.confirmEmail = 'Los emails no coinciden'
    return
  }
  
  if (emailForm.newEmail === userData.value.email) {
    emailForm.errors.newEmail = 'El nuevo email debe ser diferente al actual'
    return
  }
  
  if (!emailForm.password) {
    emailForm.errors.password = 'La contraseña es requerida'
    return
  }
  
  emailForm.isLoading = true
  
  try {
    const result = await AuthService.changeEmail({
      newEmail: emailForm.newEmail,
      password: emailForm.password
    })
    
    if (result.success) {
      showNotification('success', result.message)
      // Limpiar formulario
      emailForm.newEmail = ''
      emailForm.confirmEmail = ''
      emailForm.password = ''
      


    } else {
      // Manejar errores específicos por campo
      if (result.errorField) {
        emailForm.errors[result.errorField] = result.error
      } else {
        showNotification('error', result.error)
      }
    }
  } catch (error) {
    console.error('Error inesperado cambiando email:', error)
    showNotification('error', 'Error inesperado al actualizar el email')
  } finally {
    emailForm.isLoading = false
  }
}

// Cambiar contraseña
const changePassword = async () => {
  // Limpiar errores previos
  passwordForm.errors = {}
  
  // Validaciones del lado cliente
  if (!passwordForm.currentPassword) {
    passwordForm.errors.currentPassword = 'La contraseña actual es requerida'
    return
  }
  
  const passwordValidation = AuthService.validatePassword(passwordForm.newPassword)
  if (!passwordValidation.isValid) {
    passwordForm.errors.newPassword = passwordValidation.message
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordForm.errors.confirmPassword = 'Las contraseñas no coinciden'
    return
  }
  
  if (passwordForm.currentPassword === passwordForm.newPassword) {
    passwordForm.errors.newPassword = 'La nueva contraseña debe ser diferente a la actual'
    return
  }
  
  passwordForm.isLoading = true
  
  try {
    const result = await AuthService.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    if (result.success) {
      showNotification('success', result.message)
      // Limpiar formulario
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      // Manejar errores específicos por campo
      if (result.errorField) {
        passwordForm.errors[result.errorField] = result.error
      } else {
        showNotification('error', result.error)
      }
    }
  } catch (error) {
    console.error('Error inesperado cambiando contraseña:', error)
    showNotification('error', 'Error inesperado al actualizar la contraseña')
  } finally {
    passwordForm.isLoading = false
  }
}
</script>