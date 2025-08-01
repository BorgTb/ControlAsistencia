<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo/Header -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Acceso Fiscalizador
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Ingresa tu correo para recibir acceso temporal
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white p-8 rounded-xl shadow-lg">
        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
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

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Enviando...' : 'Enviar Contraseña' }}
            </button>
          </div>
        </form>

        <!-- Success message -->
        <div v-if="passwordSent" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                ¡Contraseña enviada!
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>
                  Se ha enviado una contraseña temporal a <strong>{{ form.email }}</strong>. 
                  Revisa tu bandeja de entrada y carpeta de spam.
                </p>
              </div>
              <div class="mt-3 space-y-2">
                <button
                  @click="resetForm"
                  class="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200 transition-colors duration-200 mr-2"
                >
                  Enviar a otro correo
                </button>
              </div>
            </div>
          </div>
        </div>

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
            <li>• La contraseña temporal será válida por 24 horas</li>
            <li>• Solo puedes solicitar una nueva contraseña cada 15 minutos</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Reactive data
const isLoading = ref(false)
const passwordSent = ref(false)

const form = reactive({
  email: ''
})

// Reset form
const resetForm = () => {
  form.email = ''
  passwordSent.value = false
}

// Handle form submission
const handleSubmit = async () => {
  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Solicitud de contraseña para fiscalizador:', {
      email: form.email
    })
    
    // Here you would make an API call to send the password to the email
    // For now, we'll just show a success message
    passwordSent.value = true
    
  } catch (error) {
    console.error('Error al enviar contraseña:', error)
    // Here you would handle errors (email not found, rate limiting, etc.)
  } finally {
    isLoading.value = false
  }
}
</script>
