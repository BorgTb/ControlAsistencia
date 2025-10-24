<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center cursor-pointer" @click="home">
          <h1 class="text-3xl font-bold text-gray-900">
            TeleMarcación
            <span v-if="userData.empresa_nombre" class="text-lg font-medium text-gray-600">
              - {{ userData.empresa_nombre }}
            </span>
          </h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Dropdown de usuario -->
          <div class="relative" data-dropdown>
            <!-- Botón del dropdown -->
            <button
              @click="toggleUserDropdown"
              class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <!-- Avatar o icono de usuario -->
              <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              
              <!-- Nombre del usuario -->
              <span class="hidden sm:block">{{ userData.nombre || 'Usuario' }}</span>
              
              <!-- Icono de flecha -->
              <svg 
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': isUserDropdownOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <!-- Menú desplegable -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 scale-95 -translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-2"
            >
              <div
                v-show="isUserDropdownOpen"
                class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                <!-- Información del usuario -->
                <div class="px-4 py-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-900">{{ userData.nombre || 'Usuario' }}</p>
                  <p class="text-sm text-gray-500">{{ userData.email || 'usuario@empresa.com' }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ userData.cargo || 'Empleado' }}</p>
                  <p v-if="userData.empresa_nombre" class="text-xs text-indigo-600 mt-1 font-medium">
                    {{ userData.empresa_nombre }}
                  </p>
                </div>

                <!-- Opciones del menú -->
                <div class="py-1">
                  <!-- Mi Perfil -->
                  <button
                    @click="verPerfil"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Mi Perfil
                  </button>

                  <!-- Configuración -->
                  <button
                    @click="abrirConfiguracion"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Configuración
                  </button>

                  <!-- Historial -->
                  <button
                    @click="verHistorial"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Historial Marcaciones
                  </button>

                  <button
                    @click="verDiasTrabajados"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    Días Trabajados
                  </button>
                  
                  <button
                    @click="abrirSolicitudes"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Solicitudes
                  </button>

                  <!-- Ayuda -->
                  <button
                    @click="abrirAyuda"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Ayuda y Soporte
                  </button>

                  <!-- Divider -->
                  <div class="border-t border-gray-200 my-1"></div>

                  <!-- Cerrar Sesión -->
                  <button
                    @click="handleDropdownLogout"
                    :disabled="isLoading"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="isLoading" class="animate-spin w-4 h-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    {{ isLoading ? 'Saliendo...' : 'Cerrar Sesión' }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Click fuera del dropdown para cerrarlo -->
    <div
      v-if="isUserDropdownOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, isLoading, logout } = useAuth()

const userData = computed(() => {
  console.log('👤 Datos de usuario en header:', user.value)
  return user.value || {}
})

const isUserDropdownOpen = ref(false)

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

const closeDropdown = () => {
  isUserDropdownOpen.value = false
}

const verPerfil = () => {
  router.push('/perfil')
  closeDropdown()
}

const abrirConfiguracion = () => {
  router.push('/configuracion')
  closeDropdown()
}

const verHistorial = () => {
  router.push('/historial')
  closeDropdown()
}

const abrirAyuda = () => {
  router.push('/ayuda')
  closeDropdown()
}

const home = () => {
  router.push('/dashboard')
  closeDropdown()
}

const abrirSolicitudes = () => {
  router.push('/solicitudes')
  closeDropdown()
}

const verDiasTrabajados = () => {
  router.push('/dias-trabajados')
  closeDropdown()
}

const handleDropdownLogout = async () => {
  closeDropdown()
  try {
    const result = await logout()
    console.log('Resultado del logout:', result)
    router.push('/')
  } catch (error) {
    console.error('Error en logout:', error)
    router.push('/')
  }
}

onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') closeDropdown()
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>