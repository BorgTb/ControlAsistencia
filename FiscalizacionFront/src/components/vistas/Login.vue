<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo/Header -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Acceso Fiscalizador
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ codigoEnviado ? 'Ingresa el código temporal recibido' : 'Ingresa tu correo para recibir acceso temporal' }}
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white p-8 rounded-xl shadow-lg">
        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <template v-if="!codigoEnviado">
            <!-- Email field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div class="relative">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ingresa tu correo electrónico"
                  :disabled="loading"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              <!-- Info message -->
              <p class="mt-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Se enviará una contraseña temporal a tu correo electrónico
              </p>
            </div>
          </template>

          <template v-else>
            <!-- Código temporal -->
            <div>
              <div class="text-sm text-gray-500 mb-4">
                Código enviado a:
                <span class="font-medium text-gray-700">{{ form.email }}</span>
              </div>
              <label for="codigo" class="block text-sm font-medium text-gray-700 mb-1">
                Código Temporal
              </label>
              <div class="relative">
                <input
                  id="codigo"
                  v-model="form.codigo"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ingresa el código recibido"
                  :disabled="loading"
                  autocomplete="off"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <!-- Error message -->
          <div v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {{ error }}
          </div>

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              :disabled="loading"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? (codigoEnviado ? 'Verificando...' : 'Enviando...') : (codigoEnviado ? 'Verificar código' : 'Enviar código') }}
            </button>
          </div>

          <!-- Opción para volver al paso anterior -->
          <div v-if="codigoEnviado" class="text-center">
            <button
              type="button"
              @click="resetForm"
              class="text-sm text-green-600 hover:text-green-500 font-medium"
            >
              ← Cambiar correo electrónico
            </button>
          </div>
        </form>

        <!-- Link back to regular login -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            ¿Eres usuario regular? 
            <a href="http://localhost:5173/" class="text-green-600 hover:text-green-500 font-medium">
              Ingresar como usuario
            </a>
          </p>
        </div>

        <!-- Additional info for fiscalizadores -->
        <div class="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 class="text-sm font-medium text-gray-800 mb-2">Información para Fiscalizadores:</h4>
          <ul class="text-xs text-gray-600 space-y-1">
            <li>• El código temporal será válido por 24 horas</li>
            <li>• Solo puedes solicitar un nuevo código cada 15 minutos</li>
            <li>• Revisa tu bandeja de entrada y carpeta de spam</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '../../services/authService.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const codigoEnviado = ref(false)

const form = reactive({
  email: '',
  codigo: ''
})

const resetForm = () => {
  form.email = ''
  form.codigo = ''
  codigoEnviado.value = false
  error.value = ''
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    if (!codigoEnviado.value) {
      // En el futuro, usar el servicio real:
      const response = await AuthService.solicitarAcceso(form.email)
      if (response.success) {
        codigoEnviado.value = true
      } else {
        error.value = response.error || 'Error al solicitar el código'
      }
    } else {
      // En el futuro, usar el servicio real:
      const response = await AuthService.validarCodigo(form.email, form.codigo)
      if (response.success) {
        router.push('/dashboard')
      } else {
        error.value = response.error || 'Código inválido'
      }
    }
  } catch (e) {
    error.value = 'Error de conexión. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

