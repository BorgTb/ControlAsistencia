<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center cursor-pointer" @click="home">
          <h1 class="text-3xl font-bold text-gray-900">TeleMarcación - empresa</h1>
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
              <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              
              <!-- Nombre del usuario -->
              <span class="hidden sm:block">Administrador</span>
              
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
                  <p class="text-sm font-medium text-gray-900">{{ user?.name || 'Administrador' }}</p>
                  <p class="text-sm text-gray-500">{{ user?.email || 'admin@empresa.com' }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ user?.role || 'Administrador del Sistema' }}</p>
                </div>

                <!-- Opciones del menú -->
                <div class="py-1">
                  <!-- Configuración del Sistema -->
                  <button
                    @click="abrirConfiguracionSistema"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Configuración Sistema
                  </button>

                  <!-- Mi Perfil -->
                  <button
                    @click="abrirPerfil"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Mi Perfil
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3v1"></path>
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

    <!-- Navbar de navegación del administrador -->
    <nav class="bg-gray-50 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8 overflow-x-auto">
          <!-- Dashboard -->
          <router-link
            to="/empresa/dashboard"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Dashboard</span>
          </router-link>


          <!-- Gestión de Trabajadores -->
          <router-link
            to="/empresa/trabajadores"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <span>Trabajadores</span>
          </router-link>

          <!-- Gestión de Trabajadores -->
          <router-link
            to="/empresa/trabajadores/asociar"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
            <span>Asociar Trabajador</span>
          </router-link>
          

          <!-- Control de Turnos -->
          <router-link v-show="!esEst"
            to="/empresa/turnos"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Turnos</span>
          </router-link>

          <!-- Marcaciones -->
          <router-link
            to="/empresa/marcaciones"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7l2 2 4-4"></path>
            </svg>
            <span>Marcaciones</span>
          </router-link>

          <!-- Reportes -->
          <router-link
            to="/empresa/reportes"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Reportes</span>
          </router-link>

    

          <!-- Configuración -->
          <router-link
            to="/empresa/configuracion"
            class="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-600"
            active-class="text-indigo-600 bg-white border-indigo-600"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>Configuración</span>
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
import { useAuth } from '../../composables/useAuth.js';

const router = useRouter();
const { user, logout, isLoading: authLoading, esEst } = useAuth();

const isUserDropdownOpen = ref(false);

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
};

const closeDropdowns = () => {
  isUserDropdownOpen.value = false;
};

const home = () => {
  router.push('/empresa/dashboard');
  closeDropdowns();
};

const abrirConfiguracionSistema = () => {
  router.push('/empresa/configuracion');
  closeDropdowns();
};

const abrirPerfil = () => {
  router.push('/empresa/perfil');
  closeDropdowns();
};

const abrirAyuda = () => {
  router.push('/empresa/ayuda');
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
