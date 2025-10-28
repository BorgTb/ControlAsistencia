<template>
  <!-- Navbar tipo tabs moderno -->
  <div class="w-full bg-gray-50 border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4">
      <ul class="flex space-x-2">
        <li>
          <router-link
            to="/administrarempresa"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/administrarempresa' ? 'text-cyan-600 border-b-2 border-cyan-400 bg-white' : 'text-gray-500 hover:text-cyan-600'"
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
            to="/RolAdministracion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/RolAdministracion' ? 'text-indigo-600 border-b-2 border-indigo-400 bg-white' : 'text-gray-500 hover:text-indigo-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 5 0 00-10 0v2" />
            </svg>
            Administración
          </router-link>
        </li>
        <li>
          <router-link
            to="/usuarios-permisos"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/usuarios-permisos' ? 'text-amber-600 border-b-2 border-amber-400 bg-white' : 'text-gray-500 hover:text-amber-600'"
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
            to="/fiscalizacion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/fiscalizacion' ? 'text-green-600 border-b-2 border-green-400 bg-white' : 'text-gray-500 hover:text-green-600'"
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
            to="/estadisticas"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/estadisticas' ? 'text-fuchsia-600 border-b-2 border-fuchsia-400 bg-white' : 'text-gray-500 hover:text-fuchsia-600'"
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
            to="/empresa/reportes/domingos-festivos"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/empresa/reportes/domingos-festivos' ? 'text-cyan-600 border-b-2 border-cyan-400 bg-white' : 'text-gray-500 hover:text-cyan-600'"
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

  <!-- Contenido Principal -->
  <div class="p-6 shadow-lg rounded-2xl bg-white mt-8">
    <div class="w-full max-w-[1800px] mx-auto bg-white rounded-2xl shadow-lg p-8 lg:p-12 mt-8 lg:mt-14 px-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Estadísticas del Sistema</h2>
          <div class="flex items-center gap-4">
            <p class="text-gray-600">Análisis y métricas del sistema de control de asistencia</p>
            <p v-if="ultimaActualizacion" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Última actualización: {{ ultimaActualizacion }}
            </p>
          </div>
        </div>
        <div class="flex gap-4">
          <button
            @click="actualizarEstadisticas"
            class="flex items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white rounded-lg shadow hover:bg-fuchsia-700 transition text-base font-medium"
            :disabled="cargando"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ cargando ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <!-- Grid de Estadísticas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- Total de Usuarios -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div class="flex items-center">
            <div class="p-3 bg-blue-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-blue-600 text-sm font-medium">Total Usuarios</p>
              <p class="text-2xl font-bold text-blue-800">{{ estadisticas.totalUsuarios || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Total de Empresas -->
        <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-green-600 text-sm font-medium">Total Empresas</p>
              <p class="text-2xl font-bold text-green-800">{{ estadisticas.totalEmpresas || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Marcaciones Hoy -->
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div class="flex items-center">
            <div class="p-3 bg-purple-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-purple-600 text-sm font-medium">Marcaciones Hoy</p>
              <p class="text-2xl font-bold text-purple-800">{{ estadisticas.marcacionesHoy || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Sesiones Activas -->
        <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div class="flex items-center">
            <div class="p-3 bg-orange-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-orange-600 text-sm font-medium">Sesiones Activas</p>
              <p class="text-2xl font-bold text-orange-800">{{ estadisticas.sesionesActivas || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos y Análisis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        <!-- Distribución por Roles -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Distribución de Usuarios por Rol</h3>
          <div class="space-y-4">
            <div v-for="(cantidad, rol) in estadisticas.usuariosPorRol" :key="rol" class="flex items-center justify-between">
              <div class="flex items-center">
                <div :class="`w-4 h-4 rounded-full mr-3 ${getRolColor(rol)}`"></div>
                <span class="text-sm font-medium text-gray-700 capitalize">{{ rol }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm font-bold text-gray-900 mr-2">{{ cantidad }}</span>
                <div class="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    :class="`h-2 rounded-full ${getRolColor(rol)}`"
                    :style="`width: ${(cantidad / Math.max(...Object.values(estadisticas.usuariosPorRol || {}))) * 100}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actividad Reciente -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Actividad de la Última Semana</h3>
          <div class="space-y-3">
            <div v-for="actividad in estadisticas.actividadReciente" :key="actividad.fecha" 
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-800">{{ actividad.fecha }}</p>
                <p class="text-xs text-gray-600">{{ actividad.descripcion }}</p>
              </div>
              <span class="text-sm font-bold text-fuchsia-600">{{ actividad.cantidad }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Resumen -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-800">Resumen General</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Métrica</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Actual</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes Anterior</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cambio</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="metrica in estadisticas.resumen" :key="metrica.nombre" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ metrica.nombre }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ metrica.valorActual }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ metrica.valorAnterior }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="metrica.cambio >= 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                    {{ metrica.cambio >= 0 ? '+' : '' }}{{ metrica.cambio }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuth } from '../../composables/useAuth.js';
import axios from "axios";

// Estados reactivos
const estadisticas = ref({
  totalUsuarios: 0,
  totalEmpresas: 0,
  marcacionesHoy: 0,
  sesionesActivas: 0,
  usuariosPorRol: {},
  actividadReciente: [],
  resumen: []
});
const cargando = ref(false);
const ultimaActualizacion = ref(null);
let intervaloActualizacion = null;

// Funciones auxiliares
const getRolColor = (rol) => {
  const colores = {
    'admin': 'bg-purple-500',
    'empleador': 'bg-orange-500',
    'fiscalizador': 'bg-red-500',
    'trabajador': 'bg-blue-500'
  };
  return colores[rol] || 'bg-gray-500';
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Función para obtener estadísticas
const obtenerEstadisticas = async () => {
  try {
    cargando.value = true;
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.token;
    
    console.log('📊 Obteniendo estadísticas generales del sistema...');
    console.log('🔑 Token disponible:', !!token);
    
    // Obtener estadísticas generales desde el backend
    const response = await axios.get("/api/estadisticas/general", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📈 Respuesta del servidor:', response.data);
    
    if (response.data.success) {
      estadisticas.value = response.data.data;
      ultimaActualizacion.value = new Date().toLocaleTimeString('es-CL');
      console.log('✅ Estadísticas cargadas exitosamente:', estadisticas.value);
    } else {
      console.error('❌ Error al obtener estadísticas:', response.data.message);
      // Usar datos por defecto si hay error
      cargarEstadisticasPorDefecto();
    }
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    console.error('❌ Status del error:', error.response?.status);
    console.error('❌ Detalles del error:', error.response?.data);
    // Usar datos por defecto si hay error de conexión
    cargarEstadisticasPorDefecto();
  } finally {
    cargando.value = false;
  }
};

// Roles
const { hasRole } = useAuth();
const isAdmin = computed(() => hasRole('admin'));

// Función para cargar estadísticas por defecto en caso de error
const cargarEstadisticasPorDefecto = () => {
  estadisticas.value = {
    totalUsuarios: 0,
    totalEmpresas: 0,
    marcacionesHoy: 0,
    sesionesActivas: 0,
    usuariosPorRol: {
      admin: 0,
      empleador: 0,
      fiscalizador: 0,
      trabajador: 0
    },
    actividadReciente: [],
    resumen: [
      { metrica: 'Usuarios Activos', valorActual: 0, mesAnterior: 0, cambio: '0.0' },
      { metrica: 'Marcaciones Diarias', valorActual: 0, mesAnterior: 0, cambio: '0.0' },
      { metrica: 'Empresas Activas', valorActual: 0, mesAnterior: 0, cambio: '0.0' },
      { metrica: 'Sesiones Promedio', valorActual: 0, mesAnterior: 0, cambio: '0.0' }
    ]
  };
};

const actualizarEstadisticas = () => {
  obtenerEstadisticas();
};

// Cargar estadísticas al montar el componente
onMounted(() => {
  obtenerEstadisticas();
  
  // Actualizar automáticamente cada 30 segundos
  intervaloActualizacion = setInterval(() => {
    console.log('🔄 Actualizando estadísticas automáticamente...');
    obtenerEstadisticas();
  }, 30000);
  
  // Escuchar eventos de actualización manual
  window.addEventListener('actualizarEstadisticas', obtenerEstadisticas);
});

// Limpiar intervalo al desmontar el componente
onUnmounted(() => {
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion);
  }
  window.removeEventListener('actualizarEstadisticas', obtenerEstadisticas);
});
</script>