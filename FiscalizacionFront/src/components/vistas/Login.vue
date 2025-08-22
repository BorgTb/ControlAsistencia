<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo/Header -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Acceso Fiscalizador
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Ingresa tu correo y código de acceso, o solicita un código temporal
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
                :disabled="isLoading"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Código de acceso -->
          <div>
            <label for="codigo" class="block text-sm font-medium text-gray-700 mb-1">
              Código de Acceso
            </label>
            <div class="relative">
              <input
                id="codigo"
                v-model="form.codigo"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingresa tu código de acceso"
                :disabled="isLoading"
                autocomplete="off"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Si no tienes código, déjalo vacío y se enviará uno temporal a tu correo
            </p>
          </div>

          <!-- Success message when code is sent -->
          <div v-if="codigoEnviado" class="text-sm text-green-600 bg-green-50 p-3 rounded-md">
            <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Código temporal enviado a {{ form.email }}. Revisa tu bandeja de entrada.
          </div>

          <!-- Error message -->
          <div v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {{ error }}
          </div>

          <!-- Submit button -->
          <div class="space-y-3">
            <!-- Botón principal: Ingresar con código o solicitar nuevo -->
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              :disabled="isLoading"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ getButtonText() }}
            </button>

            <!-- Botón secundario: Solicitar nuevo código (solo si ya tiene código) -->
            <button
              v-if="form.codigo"
              type="button"
              @click="solicitarNuevoCodigo"
              class="w-full flex justify-center py-2 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              :disabled="isLoading"
            >
              Solicitar nuevo código temporal
            </button>
          </div>

          <!-- Reset form if code was sent -->
          <div v-if="codigoEnviado" class="text-center">
            <button
              type="button"
              @click="resetForm"
              class="text-sm text-green-600 hover:text-green-500 font-medium"
            >
              ← Limpiar formulario
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
            <li>• Puedes ingresar directamente con tu código de acceso</li>
            <li>• Si no tienes código, se enviará uno a tu correo</li>
            <li>• Los códigos temporales son válidos por 5 dias</li>
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
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { solicitarAcceso, validarCodigo, isLoading } = useAuth()

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

const getButtonText = () => {
  if (isLoading.value) {
    return form.codigo ? 'Verificando código...' : 'Enviando código...'
  }
  return form.codigo ? 'Ingresar con código' : 'Solicitar código temporal'
}

const solicitarNuevoCodigo = async () => {
  if (!form.email) {
    error.value = 'Ingresa tu correo electrónico'
    return
  }

  error.value = ''
  try {
    const response = await solicitarAcceso(form.email)
    if (response.success) {
      codigoEnviado.value = true
      form.codigo = '' // Limpiar el código actual
    } else {
      error.value = response.error || 'Error al solicitar el código'
    }
  } catch (e) {
    error.value = 'Error de conexión. Por favor, intenta de nuevo.'
  }
}

const handleSubmit = async () => {
  error.value = ''

  if (!form.email) {
    error.value = 'Ingresa tu correo electrónico'
    return
  }

  try {
    if (form.codigo) {
      // Intentar ingresar con el código proporcionado
      const response = await validarCodigo(form.email, form.codigo)
      if (response.success) {
        router.push('/seleccionar-empresa')
      } else {
        error.value = response.error || 'Código inválido'
      }
    } else {
      // Solicitar código temporal
      const response = await solicitarAcceso(form.email)
      if (response.success) {
        codigoEnviado.value = true
      } else {
        error.value = response.error || 'Error al solicitar el código'
      }
    }
  } catch (e) {
    error.value = 'Error de conexión. Por favor, intenta de nuevo.'
  }
}
</script>

