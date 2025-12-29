<template>
  <header class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-18 sm:h-20">
        <!-- Logo -->
        <div class="flex items-center cursor-pointer group" @click="home">
          <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-2.5 sm:p-3 mr-3 sm:mr-4 shadow-md group-hover:shadow-lg transition-shadow">
            <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">TeleMarcación</h1>
            <p v-if="userData.empresa_nombre" class="text-xs sm:text-sm text-gray-500">{{ userData.empresa_nombre }}</p>
          </div>
        </div>

        <!-- Navegación central -->
        <nav class="hidden xl:flex items-center space-x-1.5">
          <router-link
            to="/empresa/trabajadores"
            class="px-4 xl:px-5 py-2.5 text-sm xl:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            Trabajadores
          </router-link>

          <router-link v-show="!esEst"
            to="/empresa/turnos"
            class="px-4 xl:px-5 py-2.5 text-sm xl:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            Turnos
          </router-link>

          <router-link
            to="/empresa/marcaciones"
            class="px-4 xl:px-5 py-2.5 text-sm xl:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            Marcaciones
          </router-link>

          <router-link v-show="!esEst"
            to="/empresa/dispositivos"
            class="px-4 xl:px-5 py-2.5 text-sm xl:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            Dispositivos
          </router-link>

          <router-link v-show="!esEst"
            to="/empresa/lugares"
            class="px-4 xl:px-5 py-2.5 text-sm xl:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            Lugares
          </router-link>

          <router-link v-show="!esEst"
            to="/empresa/solicitudes-trabajadores"
            class="px-4 xl:px-5 py-2.5 text-sm xl:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            Solicitudes
          </router-link>

          <router-link
            to="/empresa/reportes"
            class="px-4 xl:px-5 py-2.5 text-sm xl:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            Reportes
          </router-link>
        </nav>

        <!-- Botones de acción derecha -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- Botón Menú móvil -->
          <button
            @click="toggleMobileMenu"
            class="xl:hidden p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <!-- Dropdown de usuario -->
          <div class="relative">
            <button
              @click="toggleUserDropdown"
              class="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
            >
              <div class="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <span class="hidden sm:block">{{ userData.nombre || 'Usuario' }}</span>
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
                class="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
              >
                <!-- Información del usuario -->
                <div class="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <p class="text-sm font-semibold text-gray-900">{{ userData.nombre || 'Administrador' }}</p>
                  <p class="text-xs text-gray-600">{{ userData.email || 'admin@empresa.com' }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ userData.rol || 'Administrador' }}</p>
                  <p v-if="userData.empresa_nombre" class="text-xs text-blue-600 mt-1 font-medium">
                    {{ userData.empresa_nombre }}
                  </p>
                </div>

                <!-- Opciones del menú -->
                <div class="py-1">
                  <button
                    @click="abrirPerfil"
                    class="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Mi Perfil
                  </button>

                  <button
                    @click="abrirConfiguracionSistema"
                    class="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Configuración
                  </button>

                  <button
                    @click="cambiarUsuario"
                    class="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                    Cambiar a usuario Trabajador
                  </button>

                  <button
                    @click="abrirAyuda"
                    class="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Ayuda y Soporte
                  </button>

                  <div class="border-t border-gray-200 my-1"></div>

                  <button
                    @click="handleDropdownLogout"
                    :disabled="authLoading"
                    class="flex items-center w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors disabled:opacity-50"
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

    <!-- Menú móvil -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isMobileMenuOpen" class="xl:hidden border-t border-gray-200 bg-gray-50">
        <div class="px-4 sm:px-6 py-4 space-y-1.5 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <router-link
            to="/empresa/trabajadores"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Trabajadores
          </router-link>
          <router-link v-if="esEst"
            to="/empresa/trabajadores/asociar"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Asociar Trabajador
          </router-link>
          <router-link v-show="!esEst"
            to="/empresa/turnos"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Turnos
          </router-link>
          <router-link
            to="/empresa/marcaciones"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Marcaciones
          </router-link>
          <router-link v-show="!esEst"
            to="/empresa/dispositivos"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Dispositivos
          </router-link>
          <router-link v-show="!esEst"
            to="/empresa/lugares"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Lugares
          </router-link>
          <router-link v-show="!esEst"
            to="/empresa/solicitudes-trabajadores"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Solicitudes
          </router-link>
          <router-link
            to="/empresa/reportes"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Reportes
          </router-link>
          <router-link v-if="isAdmin"
            to="/empresa/reportes/domingos-festivos"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Domingo/Festivos
          </router-link>
          <router-link
            to="/empresa/configuracion"
            @click="closeMobileMenu"
            class="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            active-class="bg-blue-50 text-blue-600"
          >
            Configuración
          </router-link>
        </div>
      </div>
    </Transition>

    <!-- Overlay para cerrar dropdowns -->
    <div
      v-if="isUserDropdownOpen || isMobileMenuOpen"
      @click="closeDropdowns"
      class="fixed inset-0 z-40"
    ></div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';

const router = useRouter();
const { user, logout, isLoading: authLoading, esEst, hasRole } = useAuth();

const isAdmin = computed(() => hasRole('admin'));

const userData = computed(() => {
  console.log('🏢 Datos de usuario en headerEmpresa:', user.value)
  return user.value || {}
})

const isUserDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
  isMobileMenuOpen.value = false;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  isUserDropdownOpen.value = false;
};

const closeDropdowns = () => {
  isUserDropdownOpen.value = false;
  isMobileMenuOpen.value = false;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
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

const cambiarUsuario = () => {
  alert('cambiar usuario en desarrollo');
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
