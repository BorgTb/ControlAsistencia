<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Mis Solicitudes</h1>
              <p class="text-sm text-gray-600">Gestiona tus solicitudes laborales</p>
            </div>
          </div>
          
          <button
            @click="mostrarModalNuevaSolicitud = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nueva Solicitud
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        
        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div 
            v-for="estado in solicitudesPorEstado" 
            :key="estado.id"
            class="bg-white overflow-hidden shadow rounded-lg"
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div 
                    :class="`w-8 h-8 rounded-full bg-${estado.color}-100 flex items-center justify-center`"
                  >
                    <div :class="`w-4 h-4 bg-${estado.color}-500 rounded-full`"></div>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">{{ estado.nombre }}</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ estado.cantidad }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros y búsqueda -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por tipo</label>
                <select 
                  v-model="filtroTipo" 
                  class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Todos los tipos</option>
                  <option v-for="tipo in tiposSolicitudes" :key="tipo.id" :value="tipo.id">
                    {{ tipo.nombre }}
                  </option>
                </select>
              </div>
              
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado</label>
                <select 
                  v-model="filtroEstado" 
                  class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Todos los estados</option>
                  <option v-for="estado in estadosSolicitud" :key="estado.id" :value="estado.id">
                    {{ estado.nombre }}
                  </option>
                </select>
              </div>
              
              <div class="flex items-end">
                <button
                  @click="aplicarFiltros"
                  :disabled="loading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Filtrar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de solicitudes -->
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div v-if="loading && solicitudes.length === 0" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span class="ml-3 text-gray-600">Cargando solicitudes...</span>
          </div>
          
          <div v-else-if="solicitudes.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
            <p class="mt-1 text-sm text-gray-500">Comienza creando tu primera solicitud.</p>
            <div class="mt-6">
              <button
                @click="mostrarModalNuevaSolicitud = true"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nueva Solicitud
              </button>
            </div>
          </div>
          
          <ul v-else class="divide-y divide-gray-200">
            <li v-for="solicitud in solicitudesFiltradas" :key="solicitud.id">
              <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <component 
                        :is="obtenerIconoTipo(solicitud.tipo_solicitud)" 
                        class="h-6 w-6 text-gray-400"
                      />
                    </div>
                    <div class="ml-4">
                      <div class="flex items-center">
                        <p class="text-sm font-medium text-indigo-600">
                          {{ obtenerNombreTipo(solicitud.tipo_solicitud) }}
                        </p>
                        <span 
                          :class="`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${obtenerColorEstado(solicitud.estado)}-100 text-${obtenerColorEstado(solicitud.estado)}-800`"
                        >
                          {{ solicitud.estado }}
                        </span>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500">
                        <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z"></path>
                        </svg>
                        <p>
                          Creada el {{ formatearFechaHora(solicitud.created_at) }}
                        </p>
                        <span v-if="solicitud.fecha_inicio" class="mx-2">•</span>
                        <p v-if="solicitud.fecha_inicio">
                          Período: {{ formatearFecha(solicitud.fecha_inicio) }} 
                          <span v-if="solicitud.fecha_fin">- {{ formatearFecha(solicitud.fecha_fin) }}</span>
                        </p>
                      </div>
                      <div v-if="solicitud.motivo" class="mt-1">
                        <p class="text-sm text-gray-700">{{ solicitud.motivo }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button
                      @click="verDetalleSolicitud(solicitud)"
                      class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Ver detalles
                    </button>
                    
                    <button
                      v-if="solicitud.estado === 'PENDIENTE'"
                      @click="confirmarCancelacion(solicitud)"
                      :disabled="procesando"
                      class="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>

    <!-- Modal Nueva Solicitud -->
    <ModalNuevaSolicitud 
      :visible="mostrarModalNuevaSolicitud"
      :tipos-solicitudes="tiposSolicitudes"
      @cerrar="mostrarModalNuevaSolicitud = false"
      @crear="crearNuevaSolicitud"
    />

    <!-- Modal Detalle Solicitud -->
    <ModalDetalleSolicitud 
      :visible="mostrarModalDetalle"
      :solicitud="solicitudSeleccionada"
      @cerrar="cerrarModalDetalle"
    />

    <!-- Modal Confirmación -->
    <ModalConfirmacion 
      :visible="mostrarModalConfirmacion"
      :titulo="tituloConfirmacion"
      :mensaje="mensajeConfirmacion"
      :tipo="tipoConfirmacion"
      @confirmar="ejecutarAccion"
      @cancelar="cerrarModalConfirmacion"
    />

    <!-- Toast de notificaciones -->
    <div v-if="error" class="fixed bottom-4 right-4 z-50">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
        <div class="flex">
          <div class="py-1">
            <svg class="fill-current h-4 w-4 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
            </svg>
          </div>
          <div>
            <p class="font-bold">Error</p>
            <p class="text-sm">{{ error }}</p>
          </div>
          <div class="ml-4">
            <button @click="error = null" class="text-red-500 hover:text-red-700">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSolicitudesGenerales } from '../../composables/useSolicitudesGenerales';
import ModalNuevaSolicitud from '../modals/ModalNuevaSolicitud.vue';
import ModalDetalleSolicitud from '../modals/ModalDetalleSolicitud.vue';
import ModalConfirmacion from '../modals/ModalConfirmacion.vue';

// Composables
const {
  loading,
  error,
  solicitudes,
  procesando,
  tiposSolicitudes,
  estadosSolicitud,
  solicitudesPorEstado,
  cargarSolicitudes,
  cancelarSolicitud,
  crearSolicitud,
  formatearFecha,
  formatearFechaHora,
  obtenerColorEstado,
  obtenerNombreTipo
} = useSolicitudesGenerales();

// Estado local
const mostrarModalNuevaSolicitud = ref(false);
const mostrarModalDetalle = ref(false);
const mostrarModalConfirmacion = ref(false);
const solicitudSeleccionada = ref(null);

// Filtros
const filtroTipo = ref('');
const filtroEstado = ref('');

// Confirmación
const tituloConfirmacion = ref('');
const mensajeConfirmacion = ref('');
const tipoConfirmacion = ref('warning');
const accionConfirmacion = ref(null);

// Computed
const solicitudesFiltradas = computed(() => {
  let resultado = [...solicitudes.value];
  
  if (filtroTipo.value) {
    resultado = resultado.filter(s => s.tipo_solicitud === filtroTipo.value);
  }
  
  if (filtroEstado.value) {
    resultado = resultado.filter(s => s.estado === filtroEstado.value);
  }
  
  return resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

// Métodos
const aplicarFiltros = () => {
  const filtros = {};
  
  if (filtroTipo.value) {
    filtros.tipo = filtroTipo.value;
  }
  
  if (filtroEstado.value) {
    filtros.estado = filtroEstado.value;
  }
  
  cargarSolicitudes(filtros);
};

const obtenerIconoTipo = (tipo) => {
  const iconos = {
    feriado: 'CalendarIcon',
    permiso_con_goce: 'UserCheckIcon',
    permiso_sin_goce: 'UserXIcon',
    compensacion_horas: 'ClockIcon',
    cambio_turno: 'RefreshCwIcon'
  };
  
  return iconos[tipo] || 'DocumentIcon';
};

const verDetalleSolicitud = (solicitud) => {
  solicitudSeleccionada.value = solicitud;
  mostrarModalDetalle.value = true;
};

const cerrarModalDetalle = () => {
  mostrarModalDetalle.value = false;
  solicitudSeleccionada.value = null;
};

const confirmarCancelacion = (solicitud) => {
  tituloConfirmacion.value = 'Cancelar Solicitud';
  mensajeConfirmacion.value = `¿Estás seguro de que deseas cancelar la solicitud de "${obtenerNombreTipo(solicitud.tipo_solicitud)}"? Esta acción no se puede deshacer.`;
  tipoConfirmacion.value = 'warning';
  accionConfirmacion.value = () => ejecutarCancelacion(solicitud.id);
  mostrarModalConfirmacion.value = true;
};

const ejecutarCancelacion = async (id) => {
  try {
    await cancelarSolicitud(id);
    cerrarModalConfirmacion();
    // Recargar la lista
    await aplicarFiltros();
  } catch (err) {
    console.error('Error al cancelar solicitud:', err);
  }
};

const crearNuevaSolicitud = async (datosSolicitud) => {
  try {
    await crearSolicitud(
      datosSolicitud.tipo, 
      datosSolicitud.datos, 
      datosSolicitud.archivo
    );
    mostrarModalNuevaSolicitud.value = false;
    // Recargar la lista
    await aplicarFiltros();
  } catch (err) {
    console.error('Error al crear solicitud:', err);
  }
};

const ejecutarAccion = () => {
  if (accionConfirmacion.value) {
    accionConfirmacion.value();
  }
};

const cerrarModalConfirmacion = () => {
  mostrarModalConfirmacion.value = false;
  accionConfirmacion.value = null;
};

// Lifecycle
onMounted(() => {
  cargarSolicitudes();
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
