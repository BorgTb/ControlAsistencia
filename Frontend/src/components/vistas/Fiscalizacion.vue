

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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
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
      </ul>
    </nav>
  </div>

  <!-- Contenido Principal: Historial de Cambios del Sistema -->
  <div class="p-6 shadow-lg rounded-2xl bg-white mt-8">
    <div class="w-full max-w-[1800px] mx-auto bg-white rounded-2xl shadow-lg p-8 lg:p-12 mt-8 lg:mt-14 px-4">
      
      <!-- Header con título y controles -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Historial de Cambios del Sistema</h2>
          <p class="text-gray-600 text-sm mt-1">Seguimiento de actividades y modificaciones realizadas</p>
        </div>
        
        <!-- Controles de filtros y acciones -->
        <div class="flex flex-col sm:flex-row gap-3">
          <select 
            v-model="filtros.estado"
            @change="actualizarFiltros({ estado: filtros.estado })"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Sesiones Activas</option>
            <option value="cerrado">Sesiones Cerradas</option>
            <option value="expirado">Sesiones Expiradas</option>
          </select>
          
          <select 
            v-model="filtros.limite"
            @change="actualizarFiltros({ limite: parseInt(filtros.limite) })"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="10">10 registros</option>
            <option value="25">25 registros</option>
            <option value="50">50 registros</option>
            <option value="100">100 registros</option>
            <option value="200">200 registros</option>
          </select>
          
          <button
            @click="cargarRegistros(filtros.limite)"
            :disabled="loading"
            class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
          >
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg v-else class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ loading ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="p-2 bg-green-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-green-600">Total Registros</p>
              <p class="text-2xl font-bold text-green-900">{{ estadisticasCalculadas.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="p-2 bg-blue-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-blue-600">Sesiones Activas</p>
              <p class="text-2xl font-bold text-blue-900">{{ estadisticasCalculadas.activos }}</p>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="p-2 bg-gray-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Sesiones Cerradas</p>
              <p class="text-2xl font-bold text-gray-900">{{ estadisticasCalculadas.cerrados }}</p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="p-2 bg-purple-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-purple-600">% Activas</p>
              <p class="text-2xl font-bold text-purple-900">{{ estadisticasCalculadas.porcentajeActivos }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Buscador de usuarios -->
      <div class="mb-4">
        <div class="relative">
          <input
            v-model="filtros.usuario"
            type="text"
            placeholder="Buscar por nombre o email..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>


      <!-- Tabla de registros de auditoría -->
      <div v-if="error && !loading" class="p-8 text-center">
        <div class="flex flex-col items-center justify-center">
          <svg class="h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-xl font-bold text-red-700 mb-2">Error al cargar registros</h3>
          <p class="text-red-600 text-base">{{ error }}</p>
        </div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs border-separate border-spacing-0 rounded-2xl overflow-hidden bg-white shadow-md">
          <thead class="sticky top-0 z-10 shadow-sm">
            <tr class="bg-gradient-to-r from-green-50 to-green-100 text-gray-700">
              <th class="px-3 py-2 font-semibold text-left rounded-tl-2xl">Usuario</th>
              <th class="px-3 py-2 font-semibold text-left">Email</th>
              <th class="px-3 py-2 font-semibold text-left">Rol</th>
              <!-- <th class="px-3 py-2 font-semibold text-left">Estado</th> -->
              <th class="px-3 py-2 font-semibold text-center rounded-tr-2xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Mostrar registros si existen -->
            <template v-if="registrosPaginados.length > 0">
              <tr
                v-for="(registro, idx) in registrosPaginados"
                :key="registro.id"
                :class="[
                  'transition border-b border-gray-100',
                  idx % 2 === 0 ? 'bg-white' : 'bg-green-50',
                  'hover:bg-green-100',
                  'text-xs',
                  'h-8',
                  'align-middle'
                ]"
              >
                <td class="px-3 py-1 align-middle">
                  <div class="font-medium text-gray-900">
                    {{ registro.nombre }} {{ registro.apellido_pat }} {{ registro.apellido_mat }}
                  </div>
                </td>
                <td class="px-3 py-1 text-gray-600 align-middle">{{ registro.email }}</td>
                <td class="px-3 py-1 align-middle">
                  <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                    {{ registro.rol }}
                  </span>
                </td>
                <!-- Estado eliminado -->
                <td class="px-3 py-1 text-center align-middle">
                  <button
                    @click="abrirModalCambios(registro.usuario_id, registro.nombre, registro.apellido_pat, registro.rol)"
                    class="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 hover:bg-blue-100 transition text-xs shadow-sm mx-auto"
                    title="Ver cambios realizados por este usuario"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <span class="hidden sm:inline">Ver Cambios</span>
                  </button>
                </td>
              </tr>
            </template>
            <!-- Mensaje cuando no hay registros -->
            <tr v-else-if="!loading">
              <td colspan="5" class="py-8 text-center text-gray-400 text-lg">
                <div class="flex flex-col items-center">
                  <svg class="h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  No hay registros de auditoría disponibles
                </div>
              </td>
            </tr>
            <!-- Indicador de carga -->
            <tr v-else>
              <td colspan="5" class="py-8 text-center">
                <div class="flex items-center justify-center">
                  <svg class="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span class="ml-2 text-gray-600">Cargando registros...</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación mejorada -->
      <div class="flex justify-center items-center py-4">
        <nav class="inline-flex rounded-lg shadow-sm border border-gray-200 bg-white overflow-hidden">
          <button
            @click="paginaActual > 1 && cambiarPagina(paginaActual - 1)"
            :disabled="paginaActual === 1"
            class="px-3 py-1 text-gray-500 hover:text-green-600 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-green-200"
            aria-label="Anterior"
          >
            &lt;
          </button>
          <template v-for="n in totalPaginas" :key="n">
            <button
              @click="cambiarPagina(n)"
              :class="[
                'px-3 py-1 mx-0.5 font-medium',
                paginaActual === n ? 'bg-green-100 text-green-700 border-b-2 border-green-500' : 'text-gray-700 hover:bg-green-50',
                'rounded-none focus:outline-none focus:ring-2 focus:ring-green-200'
              ]"
            >
              {{ n }}
            </button>
          </template>
          <button
            @click="paginaActual < totalPaginas && cambiarPagina(paginaActual + 1)"
            :disabled="paginaActual === totalPaginas"
            class="px-3 py-1 text-gray-500 hover:text-green-600 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-green-200"
            aria-label="Siguiente"
          >
            &gt;
          </button>
        </nav>
      </div>

      <!-- Info de registros -->
      <div class="text-xs text-gray-500 text-center pb-2">
        Mostrando {{ inicioRegistro }} al {{ finRegistro }} de {{ totalRegistros }} resultados
      </div>
    </div>
  </div>

  <!-- Modal de cambios de usuario -->
  <ModalCambiosUsuario
    :mostrar="mostrarModalCambios"
    :usuario-id="usuarioSeleccionado.id"
    :usuario-nombre="usuarioSeleccionado.nombre"
    :usuario-rol="usuarioSeleccionado.rol"
    @cerrar="cerrarModalCambios"
  />
</template>

<script setup>
// Importaciones necesarias para el componente de auditoría
import { computed, onMounted, ref, watch } from 'vue'
import { useAuditoria } from '../../composables/useAuditoria.js'
import { useNotification } from '../../composables/useNotification.js'
import ModalCambiosUsuario from '../modals/ModalCambiosUsuario.vue'

// ========== COMPOSABLE DE AUDITORÍA ==========
// Utiliza el composable personalizado para gestionar datos de auditoría
const {
  // Estados reactivos
  registros,                    // Lista de registros de auditoría filtrados
  estadisticasCalculadas,       // Estadísticas calculadas (total, activos, cerrados, etc.)
  loading,                      // Indicador de carga
  error,                        // Mensaje de error si existe
  filtros,                      // Filtros aplicables (límite, usuario, estado, etc.)
  
  // Métodos principales
  cargarRegistros,              // Carga registros desde el servidor
  cargarEstadisticas,           // Carga estadísticas del sistema
  cerrarSesionUsuario,          // Cierra sesión de un usuario específico
  actualizarFiltros,            // Actualiza filtros y recarga datos
  
  // Utilidades de formato
  formatearFecha,               // Formatea fechas a zona horaria de Chile
  formatearDuracion,            // Formatea duración de sesiones (min/horas)
  obtenerColorEstado            // Obtiene clases CSS según estado de sesión
} = useAuditoria()

// ========== COMPOSABLE DE NOTIFICACIONES ==========
const { showSuccess, showError } = useNotification()

// ========== ESTADO PARA MODAL DE CAMBIOS ==========
// Variables reactivas para controlar el modal de cambios de usuario
const mostrarModalCambios = ref(false)

const usuarioSeleccionado = ref({
  id: null,
  nombre: '',
  rol: ''
});

// PAGINACIÓN REACTIVA
const paginaActual = ref(1);
const registrosPorPagina = ref(Number(filtros.limite) || 10);

watch(() => filtros.limite, (nuevoLimite) => {
  registrosPorPagina.value = Number(nuevoLimite) || 15;
  paginaActual.value = 1;
});

const totalRegistros = computed(() => registros.value.length);
const totalPaginas = computed(() => Math.ceil(totalRegistros.value / registrosPorPagina.value) || 1);
const inicioRegistro = computed(() => (totalRegistros.value === 0 ? 0 : (paginaActual.value - 1) * registrosPorPagina.value + 1));
const finRegistro = computed(() => Math.min(paginaActual.value * registrosPorPagina.value, totalRegistros.value));

function cambiarPagina(nuevaPagina) {
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas.value) {
    paginaActual.value = nuevaPagina;
  }
}

const registrosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * registrosPorPagina.value;
  return registros.value.slice(start, start + registrosPorPagina.value);
});



// Asegurar valor por defecto para filtros.limite
if (!filtros.limite) {
  filtros.limite = 10;
}

// ========== FUNCIONES DEL COMPONENTE ==========

/**
 * Maneja el cierre de sesión de un usuario específico
 * Muestra confirmación antes de proceder con el cierre
 * @param {number} usuarioId - ID del usuario
 * @param {number} sesionId - ID de la sesión a cerrar
 */
const manejarCierreSesion = async (usuarioId, sesionId) => {
  // Solicitar confirmación antes de cerrar la sesión
  const confirmar = confirm('¿Está seguro de que desea cerrar esta sesión?')
  
  if (confirmar) {
    const resultado = await cerrarSesionUsuario(usuarioId, sesionId)
    
    if (resultado) {
      // Mostrar mensaje de éxito con notificación personalizada
      showSuccess('Sesión cerrada exitosamente')
    } else {
      // Mostrar mensaje de error con notificación personalizada
      showError('Error al cerrar la sesión')
    }
  }
}

/**
 * Abre el modal de cambios para mostrar el historial de un usuario específico
 * Permite ver todas las acciones realizadas por el usuario seleccionado
 * @param {number} usuarioId - ID del usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} apellido - Apellido del usuario
 * @param {string} rol - Rol del usuario
 */
const abrirModalCambios = (usuarioId, nombre, apellido, rol) => {
  // Configurar datos del usuario seleccionado
  usuarioSeleccionado.value = {
    id: usuarioId,
    nombre: `${nombre} ${apellido}`,
    rol: rol
  }
  
  // Mostrar el modal de cambios
  mostrarModalCambios.value = true
  
  console.log('🔍 Abriendo modal de cambios para usuario:', usuarioSeleccionado.value)
}

/**
 * Cierra el modal de cambios de usuario
 * Limpia los datos del usuario seleccionado
 */
const cerrarModalCambios = () => {
  mostrarModalCambios.value = false
  usuarioSeleccionado.value = {
    id: null,
    nombre: '',
    rol: ''
  }
}

// ========== INICIALIZACIÓN DEL COMPONENTE ==========

/**
 * Hook que se ejecuta cuando el componente se monta
 * Carga los datos iniciales de auditoría del sistema
 */
onMounted(async () => {
  try {
    console.log('🔍 Cargando datos de auditoría del sistema...')
    
    // Cargar registros de auditoría (por defecto los últimos 50)
    await cargarRegistros()
    
    // Cargar estadísticas adicionales del sistema
    await cargarEstadisticas()
    
    console.log('✅ Datos de auditoría cargados correctamente')
  } catch (err) {
    console.error('❌ Error al cargar datos iniciales de auditoría:', err)
  }
})
</script>
})
