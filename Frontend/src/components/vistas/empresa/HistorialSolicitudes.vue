<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Historial de Solicitudes</h1>
            <p class="text-gray-600 mt-2">Historial completo de solicitudes de marcaciones</p>
          </div>
          <button 
            @click="volverAtras"
            class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Volver</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Búsqueda por trabajador -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Trabajador</label>
              <div class="relative">
                <input
                  v-model="filtros.busqueda"
                  type="text"
                  placeholder="Nombre del trabajador..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Filtro por estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select v-model="filtros.estado" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
                <option value="POR CONFIRMAR">Por Confirmar</option>
              </select>
            </div>

            <!-- Filtro por tipo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select v-model="filtros.tipo" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                <option value="agregar">Agregar Marcación</option>
                <option value="modificar">Modificar Marcación</option>
              </select>
            </div>

            <!-- Botón Limpiar -->
            <div class="flex items-end">
              <button @click="limpiarFiltros" class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Pendientes</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.pendientes }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Aprobadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.aprobadas }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Rechazadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.rechazadas }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Por Confirmar</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.porConfirmar }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Solicitudes -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">
                Solicitudes
              </h3>
              <div class="text-sm text-gray-500">
                {{ solicitudesFiltradas.length }} 
                {{ solicitudesFiltradas.length === 1 ? 'solicitud' : 'solicitudes' }}
              </div>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problema</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Solicitada</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Solicitada</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Reporte</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Indicador de carga -->
                <tr v-if="cargando">
                  <td colspan="9" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando solicitudes...
                    </div>
                  </td>
                </tr>
                
                <!-- Solicitudes -->
                <tr v-else v-for="solicitud in solicitudesFiltradas" :key="solicitud.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{{ solicitud.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ solicitud.nombreTrabajador }}</div>
                    <div class="text-sm text-gray-500">{{ solicitud.apellido_pat }} {{ solicitud.apellido_mat }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          :class="obtenerClaseTipo(solicitud.tipo)">
                      {{ formatearTipo(solicitud.tipo) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatearTipoProblema(solicitud.tipo_problema) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatearFecha(solicitud.fecha_correcta) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-sm text-gray-900">{{ solicitud.hora_correcta }}</span>
                    </div>
                    <div v-if="solicitud.tipo_marcacion_correcta" class="text-xs text-gray-500 ml-6">
                      {{ capitalizarTipo(solicitud.tipo_marcacion_correcta) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatearFechaHora(solicitud.fecha_reporte) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          :class="obtenerClaseEstado(solicitud.estado)">
                      {{ formatearEstado(solicitud.estado) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="verDetalles(solicitud)"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
                
                <!-- Mensaje cuando no hay solicitudes -->
                <tr v-if="!cargando && solicitudesFiltradas.length === 0">
                  <td colspan="9" class="px-6 py-8 text-center text-gray-500">
                    No hay solicitudes para mostrar
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Detalles -->
    <div v-if="mostrarModal" class="fixed inset-0 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header del Modal -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Detalles de la Solicitud #{{ solicitudSeleccionada?.id }}</h3>
            <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Contenido del Modal -->
          <div v-if="solicitudSeleccionada" class="mt-6 space-y-6">
            <!-- Información del Trabajador -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Información del Trabajador</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.nombreTrabajador }} {{ solicitudSeleccionada.apellido_pat }} {{ solicitudSeleccionada.apellido_mat }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">ID Usuario</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.usuario_id }}</p>
                </div>
              </div>
            </div>

            <!-- Información de la Solicitud -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Información de la Solicitud</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo de Solicitud</label>
                  <span class="inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full"
                        :class="obtenerClaseTipo(solicitudSeleccionada.tipo)">
                    {{ formatearTipo(solicitudSeleccionada.tipo) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Estado</label>
                  <span class="inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full"
                        :class="obtenerClaseEstado(solicitudSeleccionada.estado)">
                    {{ formatearEstado(solicitudSeleccionada.estado) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo de Problema</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatearTipoProblema(solicitudSeleccionada.tipo_problema) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fecha de Reporte</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatearFechaHora(solicitudSeleccionada.fecha_reporte) }}</p>
                </div>
                <div v-if="solicitudSeleccionada.tipo_marcacion_correcta">
                  <label class="block text-sm font-medium text-gray-700">Tipo de Marcación</label>
                  <p class="mt-1 text-sm text-gray-900">{{ capitalizarTipo(solicitudSeleccionada.tipo_marcacion_correcta) }}</p>
                </div>
                <div v-if="solicitudSeleccionada.marcacion_id">
                  <label class="block text-sm font-medium text-gray-700">ID Marcación</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.marcacion_id }}</p>
                </div>
              </div>
            </div>

            <!-- Descripción -->
            <div class="bg-yellow-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Descripción</h4>
              <p class="text-sm text-gray-700">{{ solicitudSeleccionada.descripcion }}</p>
            </div>

            <!-- Fecha y Hora Solicitada -->
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Fecha y Hora Solicitada</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fecha Correcta</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatearFecha(solicitudSeleccionada.fecha_correcta) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Hora Correcta</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.hora_correcta }}</p>
                </div>
              </div>
            </div>

            <!-- Botón Cerrar -->
            <div class="flex justify-end pt-4 border-t border-gray-200">
              <button @click="cerrarModal" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors duration-200">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import EmpresaServices from '../../../services/EmpresaService';

const router = useRouter();

// Estados reactivos
const solicitudes = ref([]);
const cargando = ref(false);
const mostrarModal = ref(false);
const solicitudSeleccionada = ref(null);

// Filtros
const filtros = ref({
  busqueda: '',
  estado: '',
  tipo: ''
});

// Estadísticas computadas
const estadisticas = computed(() => {
  return {
    pendientes: solicitudes.value.filter(s => s.estado === 'PENDIENTE').length,
    aprobadas: solicitudes.value.filter(s => s.estado === 'APROBADA').length,
    rechazadas: solicitudes.value.filter(s => s.estado === 'RECHAZADA').length,
    porConfirmar: solicitudes.value.filter(s => s.estado === 'POR CONFIRMAR').length
  };
});

// Solicitudes filtradas
const solicitudesFiltradas = computed(() => {
  let resultado = [...solicitudes.value];
  
  // Filtro por búsqueda
  if (filtros.value.busqueda.trim()) {
    const busqueda = filtros.value.busqueda.toLowerCase().trim();
    resultado = resultado.filter(s => 
      s.nombreTrabajador.toLowerCase().includes(busqueda) ||
      s.apellido_pat.toLowerCase().includes(busqueda) ||
      s.apellido_mat.toLowerCase().includes(busqueda)
    );
  }
  
  // Filtro por estado
  if (filtros.value.estado) {
    resultado = resultado.filter(s => s.estado === filtros.value.estado);
  }
  
  // Filtro por tipo
  if (filtros.value.tipo) {
    resultado = resultado.filter(s => s.tipo === filtros.value.tipo);
  }
  
  return resultado;
});

// Funciones de formato
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-CL');
};

const formatearFechaHora = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleString('es-CL');
};

const formatearTipo = (tipo) => {
  const tipos = {
    'agregar': 'Agregar Marcación',
    'modificar': 'Modificar Marcación'
  };
  return tipos[tipo] || tipo;
};

const formatearTipoProblema = (tipoProblema) => {
  const problemas = {
    'olvido_marcar': 'Olvidó Marcar',
    'hora_incorrecta': 'Hora Incorrecta',
    'ubicacion_incorrecta': 'Ubicación Incorrecta',
    'marcacion_faltante': 'Marcación Faltante',
    'error_sistema': 'Error del Sistema'
  };
  return problemas[tipoProblema] || tipoProblema.replace('_', ' ');
};

const capitalizarTipo = (tipo) => {
  const tipos = {
    'entrada': 'Entrada',
    'salida': 'Salida',
    'colacion': 'Colación',
    'descanso': 'Descanso'
  };
  return tipos[tipo] || tipo;
};

const formatearEstado = (estado) => {
  const estados = {
    'PENDIENTE': 'Pendiente',
    'APROBADA': 'Aprobada',
    'RECHAZADA': 'Rechazada',
    'POR CONFIRMAR': 'Por Confirmar'
  };
  return estados[estado] || estado;
};

const obtenerClaseEstado = (estado) => {
  const clases = {
    'PENDIENTE': 'bg-yellow-100 text-yellow-800',
    'APROBADA': 'bg-green-100 text-green-800',
    'RECHAZADA': 'bg-red-100 text-red-800',
    'POR CONFIRMAR': 'bg-blue-100 text-blue-800'
  };
  return clases[estado] || 'bg-gray-100 text-gray-800';
};

const obtenerClaseTipo = (tipo) => {
  const clases = {
    'agregar': 'bg-green-100 text-green-800',
    'modificar': 'bg-blue-100 text-blue-800'
  };
  return clases[tipo] || 'bg-gray-100 text-gray-800';
};

// Funciones de acciones
const verDetalles = (solicitud) => {
  solicitudSeleccionada.value = solicitud;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  solicitudSeleccionada.value = null;
};

const limpiarFiltros = () => {
  filtros.value = {
    busqueda: '',
    estado: '',
    tipo: ''
  };
};

const volverAtras = () => {
  router.back();
};

// Cargar solicitudes
const cargarSolicitudes = async () => {
  try {
    cargando.value = true;
    const response = await EmpresaServices.obtenerHistorialSolicitudes();
    console.log('Historial de solicitudes:', response.data);
    
    if (response.data && Array.isArray(response.data)) {
      solicitudes.value = response.data;
    } else {
      solicitudes.value = [];
    }
  } catch (error) {
    console.error('Error al cargar el historial de solicitudes:', error);
    solicitudes.value = [];
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarSolicitudes();
});
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
