<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center cursor-pointer" @click="home">
          <h1 class="text-3xl font-bold text-gray-900">
            TeleMarcación
            <span v-if="userData.empresa_nombre" class="text-3xl font-bold text-gray-900">
              - {{ userData.empresa_nombre }}
            </span>
            <span v-else class="text-3xl font-bold text-gray-900">
              - empresa
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
                  <p class="text-sm font-medium text-gray-900">{{ userData.nombre || 'Administrador' }}</p>
                  <p class="text-sm text-gray-500">{{ userData.email || 'admin@empresa.com' }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ userData.rol || 'Administrador del Sistema' }}</p>
                  <p v-if="userData.empresa_nombre" class="text-xs text-indigo-600 mt-1 font-medium">
                    {{ userData.empresa_nombre }}
                  </p>
                </div>

                <!-- Opciones del menú -->
                <div class="py-1">
                  <!-- Cambiar de Empresa -->
                  <button
                    v-if="tieneMasDeUnaEmpresa"
                    @click="abrirCambioEmpresa"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                    Cambiar de Empresa
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

   
    <!-- Click fuera del dropdown para cerrarlo -->
    <div
      v-if="isUserDropdownOpen"
      @click="closeDropdowns"
      class="fixed inset-0 z-40"
    ></div>

    <!-- Modal de cambio de empresa -->
    <CompanySwitcherModal
      :is-open="isCompanySwitcherOpen"
      @close="cerrarCambioEmpresa"
      @switched="onEmpresaCambiada"
    />
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import { useAuthStore } from '@/stores/authStore.js';
import CompanySwitcherModal from '@/components/modals/CompanySwitcherModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const { user, logout, isLoading: authLoading, esEst, hasRole } = useAuth();

const isAdmin = computed(() => hasRole('admin'));

const userData = computed(() => {
  console.log('🏢 Datos de usuario en headerAdmin:', user.value)
  return user.value || {}
})

const isUserDropdownOpen = ref(false);
const isCompanySwitcherOpen = ref(false);
const tieneMasDeUnaEmpresa = ref(false);

// Verificar si el usuario tiene más de una empresa
onMounted(async () => {
  try {
    await authStore.loadUserCompanies();
    tieneMasDeUnaEmpresa.value = authStore.availableCompanies.length > 1;
    console.log('🏢 Empresas disponibles:', authStore.availableCompanies.length);
  } catch (error) {
    console.error('❌ Error al cargar empresas:', error);
  }
});

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

const abrirCambioEmpresa = () => {
  closeDropdowns();
  isCompanySwitcherOpen.value = true;
};

const cerrarCambioEmpresa = () => {
  isCompanySwitcherOpen.value = false;
};

const onEmpresaCambiada = (userData) => {
  console.log('✅ Empresa cambiada:', userData);
  cerrarCambioEmpresa();
  // El modal se encarga de refrescar la página
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
