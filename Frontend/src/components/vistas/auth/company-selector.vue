<template>
  <!-- Animated background elements -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>

  <div class="max-w-2xl w-full relative z-10">
    <!-- Header -->
    <div class="text-center mb-8 animate-fade-in-down">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h2 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        Selecciona una Empresa
      </h2>
      <p class="mt-3 text-gray-500 font-medium">
        Tienes acceso a múltiples empresas. Selecciona una para continuar.
      </p>
    </div>

    <!-- User Info Card -->
    <div v-if="user" class="bg-white/80 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-white/20 mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
          <span class="text-white font-bold text-lg">{{ getUserInitials() }}</span>
        </div>
        <div>
          <p class="font-semibold text-gray-800">{{ user.nombre }} {{ user.apellido_pat }}</p>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
        </div>
      </div>
    </div>

    <!-- Companies Grid -->
    <div class="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 animate-fade-in-up">
      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-shake">
        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-700 text-sm font-medium">{{ errorMessage }}</p>
      </div>

      <!-- Companies List -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          v-for="company in companies"
          :key="company.id"
          @click="selectCompany(company)"
          :disabled="isLoading"
          class="group relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-left"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors duration-200 truncate">
                {{ company.nombre }}
              </h3>
              <p class="text-sm text-gray-500 font-medium">
                RUT: {{ formatRut(company.rut) }}
              </p>
            </div>
            <svg class="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="mt-6 flex items-center justify-center gap-3 text-blue-600">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="font-medium">Cargando...</span>
      </div>

      <!-- Back to Login -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <button
          @click="backToLogin"
          :disabled="isLoading"
          class="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200 disabled:opacity-50"
        >
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>

    <!-- Footer -->
    <p class="mt-8 text-center text-sm text-gray-400 animate-fade-in">
      © 2024 Control de Asistencia. Todos los derechos reservados.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store.js'
import AuthService from '@/services/auth-services.js'

// Router
const router = useRouter()

// Store
const authStore = useAuthStore()

// Reactive data
const errorMessage = ref('')
const isLoading = ref(false)
const companies = ref([])
const user = ref(null)

// Get user initials for avatar
const getUserInitials = () => {
  if (!user.value) return '?'
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido_pat || ''
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
}

// Format RUT
const formatRut = (rut) => {
  if (!rut) return ''
  // Simple formatting: add dots and dash
  const cleaned = rut.replace(/[^0-9kK]/g, '')
  if (cleaned.length <= 1) return cleaned
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}

// Select company
const selectCompany = async (company) => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    console.log('🏢 Seleccionando empresa:', company)

    const result = await AuthService.selectCompany({
      userId: user.value.id,
      empresaId: company.id
    })

    if (result.success) {
      console.log('✅ Empresa seleccionada exitosamente')
      
      // Guardar usuario en el store
      if (result.data.user) {
        authStore.setUser(result.data.user)
      }

      // Redirigir según rol
      setTimeout(() => {
        if (result.data.user && result.data.user.roles) {
          const userRoles = result.data.user.roles

          console.log('🎭 Roles del usuario:', userRoles)

          if (userRoles.includes('admin')) {
            router.push('/admin/empresas')
          } else if (userRoles.includes('empleador')) {
            router.push('/empresa/dashboard')
          } else if (userRoles.includes('trabajador')) {
            router.push('/usuario/dashboard')
          } else if (userRoles.includes('fiscalizador')) {
            router.push('/fiscalizador/dashboard')
          } else {
            errorMessage.value = 'Rol de usuario no reconocido'
          }
        } else {
          errorMessage.value = 'No se pudo determinar los roles del usuario'
        }
      }, 500)
    } else {
      errorMessage.value = result.error || 'Error al seleccionar empresa'
    }
  } catch (error) {
    console.error('❌ Error al seleccionar empresa:', error)
    errorMessage.value = 'Error inesperado. Por favor, intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

// Back to login
const backToLogin = () => {
  authStore.clearCompanySelection()
  router.push('/login')
}

// Load data on mount
onMounted(() => {
  const companyData = authStore.getPendingCompanySelection()
  
  if (!companyData || !companyData.companies || !companyData.user) {
    console.warn('⚠️ No hay datos de selección de empresa, redirigiendo a login')
    router.push('/login')
    return
  }

  companies.value = companyData.companies
  user.value = companyData.user

  console.log('📋 Empresas disponibles:', companies.value)
  console.log('👤 Usuario:', user.value)
})
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
</style>
