<template>
  <div class="w-full bg-gray-50 border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4">
      <ul class="flex space-x-2">
        <li>
          <router-link
            to="/admin/empresas"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="isActive('/admin/empresas') ? 'bg-white border-b-2 border-cyan-500 text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
            </svg>
            Administrar empresas
          </router-link>
        </li>
        <li>
          <router-link
            to="/admin/roles"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="isActive('/admin/roles') ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-indigo-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
            </svg>
            Administración
          </router-link>
        </li>
        <li>
          <router-link
            to="/admin/usuarios"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="isActive('/admin/usuarios') ? 'bg-white border-b-2 border-amber-500 text-amber-600 shadow-sm' : 'text-gray-500 hover:text-amber-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m6 5.87a4 4 0 00-3-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            Usuarios y permisos
          </router-link>
        </li>
        <li>
          <router-link
            to="/admin/fiscalizacion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="isActive('/admin/fiscalizacion') ? 'bg-white border-b-2 border-green-500 text-green-600 shadow-sm' : 'text-gray-500 hover:text-green-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fiscalización
          </router-link>
        </li>
        <li>
          <router-link
            to="/admin/estadisticas"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="isActive('/admin/estadisticas') ? 'bg-white border-b-2 border-fuchsia-500 text-fuchsia-600 shadow-sm' : 'text-gray-500 hover:text-fuchsia-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19V6m4 13V10m4 9V4M7 19v-4M3 19v-2" />
            </svg>
            Estadísticas
          </router-link>
        </li>
        <li v-if="isAdmin">
          <router-link
            to="/admin/reportes-domingos"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="isActive('/admin/reportes-domingos') ? 'bg-white border-b-2 border-cyan-500 text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
            </svg>
            Domingos/Festivos
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const { hasRole } = useAuth();

// Computed para verificar si el usuario es admin
const isAdmin = computed(() => hasRole('admin'));

// Función auxiliar para verificar si una ruta está activa
const isActive = (path) => {
  // Normalizar las rutas para la comparación
  const currentPath = route.path.toLowerCase();
  const checkPath = path.toLowerCase();
  
  // Verificar coincidencia exacta o con variantes
  return currentPath === checkPath || 
         currentPath === checkPath.replace('/admin/', '/') ||
         currentPath === '/admin' + checkPath;
};
</script>

<style scoped>
/* Animación opcional para los tabs */
.router-link-active {
  transition: all 0.2s ease-in-out;
}
</style>
