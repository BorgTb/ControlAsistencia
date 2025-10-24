<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo/Header -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Control de Asistencia
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white p-8 rounded-xl shadow-lg">
        <!-- Messages -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ successMessage }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Username field -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <div class="relative">
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa tu usuario"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Password field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember me -->
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <button
                type="button"
                @click="handleForgotPassword"
                class="font-medium text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </div>
        </form>

        <!-- Link to fiscalizador login -->
        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500">
            ¿Eres fiscalizador? 
            <a :href="appFiscalizador" class="text-blue-600 hover:text-blue-500 font-medium">
              Ingresar como fiscalizador
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.js'
import AuthService from '../../services/Authservices.js'

// Router
const router = useRouter()

// Store
const authStore = useAuthStore()

// Reactive data
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  username: '',
  password: '',
})


const appFiscalizador = import.meta.env.VITE_APP_FISCALIZADOR_URL || 'https://localhost:5000'

// Computed
const isLoading = computed(() => authStore.isLoading)

// Handle form submission
const handleSubmit = async () => {
  // Limpiar mensajes previos
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validaciones básicas
  if (!form.username.trim() || !form.password.trim()) {
    errorMessage.value = 'Por favor, completa todos los campos'
    return
  }
  
  try {
    // Preparar credenciales (ajusta según tu backend)
    const credentials = {
      email: form.username, // o username si tu backend usa username
      password: form.password,
    }
    
    // Realizar login
    const result = await AuthService.login(credentials)
    console.log('Resultado del login:', result)
    if (result.success) {
      successMessage.value = result.message
      // Guardar usuario y token en el store antes de redirigir
      if (result.data.token) authStore.setToken(result.data.token)
      if (result.data.user) authStore.setUser(result.data.user)
      // Verificar el rol y redirigir según corresponda
      setTimeout(() => {
        if (result.data.user && result.data.user.rol) {
          if (result.data.user.rol === 'admin') {
            // Si el usuario es administrador, lo redirige al CRUD de empresa
            router.push('/administrarempresa')
          } else if (result.data.user.rol === 'trabajador') {
            router.push('/dashboard')
          } else if (result.data.user.rol === 'empleador') {
            router.push('/empresa/dashboard')
          } else {
            // Rol desconocido, redirigir a una página por defecto o mostrar error
            errorMessage.value = 'Rol de usuario no reconocido'
          }
        } else {
          errorMessage.value = 'No se pudo determinar el rol del usuario'
        }
      }, 1000)
    } else {
      errorMessage.value = result.error
    }
    
  } catch (error) {
    console.error('Error inesperado en login:', error)
    errorMessage.value = 'Error inesperado. Por favor, intenta nuevamente.'
  }
}

// Método para manejar "Olvidé mi contraseña"
const handleForgotPassword = async () => {
  if (!form.username.trim()) {
    errorMessage.value = 'Por favor, ingresa tu email para recuperar la contraseña'
    return
  }
  
  try {
    const result = await AuthService.forgotPassword(form.username)
    
    if (result.success) {
      successMessage.value = result.message
    } else {
      errorMessage.value = result.error
    }
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error)
    errorMessage.value = 'Error al solicitar recuperación de contraseña'
  }
}
</script>