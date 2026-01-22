<template>
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Header -->
      <div class="text-center mb-8 animate-fade-in-down">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Control de Asistencia
        </h2>
        <p class="mt-3 text-gray-500 font-medium">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 animate-fade-in-up">
        <!-- Messages -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-shake">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-700 text-sm font-medium">{{ errorMessage }}</p>
        </div>
        
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3 animate-slide-in">
          <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-green-700 text-sm font-medium">{{ successMessage }}</p>
        </div>

        <!-- Form -->
        <div class="space-y-6">
          <!-- Username -->
          <div class="group">
            <label for="username" class="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-hover:text-blue-600">
              Usuario
            </label>
            <div class="relative">
              <div :class="[
                'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200',
                focusedField === 'username' ? 'text-blue-600' : 'text-gray-400'
              ]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                @focus="focusedField = 'username'"
                @blur="focusedField = null"
                class="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-gray-300"
                placeholder="Ingresa tu usuario"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="group">
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-hover:text-blue-600">
              Contraseña
            </label>
            <div class="relative">
              <div :class="[
                'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200',
                focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'
              ]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                @focus="focusedField = 'password'"
                @blur="focusedField = null"
                @keydown.enter="handleSubmit"
                class="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-gray-300"
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Forgot Password -->
          <div class="flex justify-end">
            <button
              type="button"
              @click="handleForgotPassword"
              class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <!-- Submit Button -->
          <button
            @click="handleSubmit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Ingresando...' : 'Ingresar' }}</span>
          </button>
        </div>

        <!-- Fiscalizador Link -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-center text-sm text-gray-600">
            ¿Eres fiscalizador? 
            <a
              :href="appFiscalizador"
              class="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
            >
              Ingresar como fiscalizador
            </a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="mt-8 text-center text-sm text-gray-400 animate-fade-in">
        © 2024 Control de Asistencia. Todos los derechos reservados.
      </p>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import AuthService from '@/services/Authservices.js'

// Router
const router = useRouter()
const route = useRoute()

// Store
const authStore = useAuthStore()

// Reactive data
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const focusedField = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)

const form = reactive({
  username: '',
  password: '',
})

const appFiscalizador = import.meta.env.VITE_APP_FISCALIZADOR_URL || 'https://localhost:5000'

// Computed
const isLoading = computed(() => authStore.isLoading)

// Mouse tracking
const handleMouseMove = (e) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

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
    // Preparar credenciales
    const credentials = {
      email: form.username,
      password: form.password,
    }
    
    // Realizar login
    const result = await AuthService.login(credentials)
    console.log('Resultado del login:', result)
    
    if (result.success) {
      // MULTI-EMPRESA: Verificar si requiere selección de empresa
      if (result.data.requiresCompanySelection) {
        console.log('👥 Usuario multi-empresa detectado')
        
        // Guardar datos de empresas en el store
        authStore.setPendingCompanySelection({
          companies: result.data.companies,
          user: result.data.user
        })
        
        // Redirigir a selección de empresas
        router.push('/select-company')
        return
      }
      
      // Usuario con empresa única - flujo normal
      successMessage.value = result.message
      // Guardar usuario y token en el store antes de redirigir
      if (result.data.token) authStore.setToken(result.data.token)
      if (result.data.user) authStore.setUser(result.data.user)
      
      // MULTI-ROL: Verificar roles y redirigir según prioridad o redirect
      setTimeout(() => {
        // Si hay un redirect en la query, usar ese
        const redirectPath = route.query.redirect
        if (redirectPath) {
          console.log('→ Redirigiendo a ruta guardada:', redirectPath)
          router.push(redirectPath)
          return
        }
        
        if (result.data.user && result.data.user.roles) {
          const userRoles = result.data.user.roles
          
          console.log('🎭 Roles del usuario:', userRoles)
          
          // Prioridad de redirección:
          // 1. Admin (más alto privilegio)
          // 2. Empleador (gestión)
          // 3. Trabajador (usuario final)
          // 4. Fiscalizador
          
          if (userRoles.includes('admin')) {
            console.log('→ Redirigiendo a panel de admin')
            router.push('/admin/empresas')
          } else if (userRoles.includes('empleador')) {
            console.log('→ Redirigiendo a panel de empleador')
            router.push('/empresa/dashboard')
          } else if (userRoles.includes('trabajador')) {
            console.log('→ Redirigiendo a panel de trabajador')
            router.push('/usuario/dashboard')
          } else if (userRoles.includes('fiscalizador')) {
            console.log('→ Redirigiendo a panel de fiscalizador')
            router.push('/fiscalizador/dashboard')
          } else {
            errorMessage.value = 'Rol de usuario no reconocido'
          }
        } else {
          errorMessage.value = 'No se pudo determinar los roles del usuario'
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

<style scoped>
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out 0.2s both;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out 0.4s both;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.animate-slide-in {
  animation: slide-in 0.4s ease-out;
}
</style>