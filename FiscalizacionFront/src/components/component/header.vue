<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center cursor-pointer" @click="home">
          <h1 class="text-3xl font-bold text-gray-900">TeleMarcación - Fiscalización</h1>
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
              <span class="hidden sm:block">Fiscalizador</span>
              
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

            <!-- Menú desplegable de usuario -->
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
                  <p class="text-sm font-medium text-gray-900">{{ user?.name || 'Fiscalizador' }}</p>
                  <p class="text-sm text-gray-500">{{ user?.email || 'fiscalizador@empresa.com' }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ user?.role || 'Control y Supervisión' }}</p>
                </div>

                <!-- Opciones del menú -->
                <div class="py-1">
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
                    :disabled="authLoading"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="authLoading" class="animate-spin w-4 h-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"></path>
                    </svg>
                    {{ authLoading ? 'Saliendo...' : 'Cerrar Sesión' }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Navbar de navegación -->
    <nav class="bg-gray-50 border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8 overflow-x-auto">
          <!-- Reporte de asistencia -->
          <router-link
            to="/reportes/asistencia"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Asistencia</span>
          </router-link>

          <!-- Reporte de jornada diaria -->
          <router-link
            to="/reportes/jornada-diaria"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Jornada Diaria</span>
          </router-link>

          <!-- Reporte de domingos/festivos -->
          <router-link
            to="/reportes/domingos-festivos"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>Domingos/Festivos</span>
          </router-link>

          <!-- Reporte de modificaciones de turnos -->
          <router-link
            to="/reportes/modificaciones-turnos"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            <span>Modificaciones</span>
          </router-link>

          <!-- Reporte diario de marcaciones -->
          <router-link
            to="/reportes/marcaciones-diarias"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <span>Marcaciones</span>
          </router-link>

          <!-- Reporte de incidentes técnicos -->
          <router-link
            to="/reportes/incidentes-tecnicos"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span>Incidentes</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Click fuera del dropdown para cerrarlo -->
    <div
      v-if="isUserDropdownOpen"
      @click="closeDropdowns"
      class="fixed inset-0 z-40"
    ></div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

const router = useRouter();
const { user, logout, isLoading: authLoading } = useAuth();

const isUserDropdownOpen = ref(false);

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
};

const closeDropdowns = () => {
  isUserDropdownOpen.value = false;
};

const home = () => {
  router.push('/dashboard');
  closeDropdowns();
};

const abrirConfiguracion = () => {
  router.push('/configuracion');
  closeDropdowns();
};

const abrirAyuda = () => {
  router.push('/ayuda');
  closeDropdowns();
};

const handleDropdownLogout = async () => {
  closeDropdowns();
  
  try {
    const response = await logout();
    if (response.success) {
      router.push('/');
    } else {
      console.error('Logout failed:', response.message);
      router.push('/'); // Redirigir de todas formas
    }
  } catch (error) {
    console.error('Error during logout:', error);
    router.push('/'); // Redirigir de todas formas
  }
};
</script>