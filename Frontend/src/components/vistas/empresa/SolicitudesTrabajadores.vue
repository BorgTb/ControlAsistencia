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
              <h1 class="text-2xl font-bold text-gray-900">Solicitudes de Trabajadores</h1>
              <p class="text-sm text-gray-600">Revisa y gestiona las solicitudes de tus trabajadores</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        
        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <!-- Mostrar estadísticas de solicitudes por estado -->
          <!-- Pendientes: cantidad de solicitudes sin revisar -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Pendientes de Revisar</dt>
                    <!-- TODO: Traer cantidad de solicitudes con estado 'PENDIENTE' -->
                    <dd class="text-lg font-medium text-gray-900">{{ solicitudesPendientes }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Aceptadas: cantidad de solicitudes aprobadas -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Aceptadas</dt>
                    <!-- TODO: Traer cantidad de solicitudes con estado 'ACEPTADA' -->
                    <dd class="text-lg font-medium text-gray-900">{{ solicitudesAceptadas }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Rechazadas: cantidad de solicitudes rechazadas -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Rechazadas</dt>
                    <!-- TODO: Traer cantidad de solicitudes con estado 'RECHAZADA' -->
                    <dd class="text-lg font-medium text-gray-900">{{ solicitudesRechazadas }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Apeladas: cantidad de solicitudes en apelación -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">En Apelación</dt>
                    <!-- TODO: Traer cantidad de solicitudes con estado 'EN_APELACION' -->
                    <dd class="text-lg font-medium text-gray-900">{{ solicitudesEnApelacion }}</dd>
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
                  <!-- TODO: Mapear tipos de solicitudes disponibles (feriado, permiso_con_goce, etc.) -->
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
                  <!-- TODO: Estados disponibles: PENDIENTE, ACEPTADA, RECHAZADA, EN_APELACION -->
                  <option value="PENDIENTE">Pendientes de Revisar</option>
                  <option value="ACEPTADA">Aceptadas</option>
                  <option value="RECHAZADA">Rechazadas</option>
                  <option value="EN_APELACION">En Apelación</option>
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
            <p class="mt-1 text-sm text-gray-500">No hay solicitudes de trabajadores en este momento.</p>
          </div>
          
          <ul v-else class="divide-y divide-gray-200">
            <li v-for="solicitud in solicitudesFiltradas" :key="solicitud.id">
              <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center flex-1">
                    <div class="flex-shrink-0">
                      <!-- TODO: Icono según tipo de solicitud -->
                      <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4 flex-1">
                      <div class="flex items-center">
                        <!-- TODO: Mostrar nombre del trabajador -->
                        <p class="text-sm font-medium text-indigo-600">
                          {{ solicitud.nombre_trabajador || 'Nombre del Trabajador' }}
                        </p>
                        <!-- TODO: Badge con estado de la solicitud -->
                        <span 
                          :class="`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obtenerClaseEstado(solicitud.estado)}`"
                        >
                          {{ solicitud.estado }}
                        </span>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500">
                        <!-- TODO: Tipo de solicitud (Feriado, Permiso con goce, etc.) -->
                        <p class="mr-4">
                          <span class="font-medium">Tipo:</span> {{ solicitud.tipo_solicitud || 'Tipo de solicitud' }}
                        </p>
                        <!-- TODO: Período solicitado (fecha inicio - fecha fin) -->
                        <p>
                          <span class="font-medium">Período:</span> 
                          {{ formatearFecha(solicitud.fecha_inicio) }}
                          <span v-if="solicitud.fecha_fin"> - {{ formatearFecha(solicitud.fecha_fin) }}</span>
                        </p>
                      </div>
                      <!-- TODO: Mostrar motivo o descripción de la solicitud -->
                      <div v-if="solicitud.motivo" class="mt-2">
                        <p class="text-sm text-gray-700"><span class="font-medium">Motivo:</span> {{ solicitud.motivo }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2 ml-4">
                    <!-- TODO: Botón para ver detalles completos de la solicitud -->
                    <button
                      @click="verDetalleSolicitud(solicitud)"
                      class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Ver detalles
                    </button>
                    
                    <!-- TODO: Botones de acción (Aceptar/Rechazar) - solo mostrar si estado es PENDIENTE -->
                    <button
                      v-if="solicitud.estado === 'PENDIENTE'"
                      @click="abrirModalAceptar(solicitud)"
                      :disabled="procesando"
                      class="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                    >
                      Aceptar
                    </button>

                    <button
                      v-if="solicitud.estado === 'PENDIENTE'"
                      @click="abrirModalRechazar(solicitud)"
                      :disabled="procesando"
                      class="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>

    <!-- Modal Detalle Solicitud -->
    <ModalDetalleSolicitudTrabajador 
      :visible="mostrarModalDetalle"
      :solicitud="solicitudSeleccionada"
      @cerrar="cerrarModalDetalle"
    />

    <!-- Modal Aceptar Solicitud -->
    <div v-if="mostrarModalAceptar" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Aceptar Solicitud</h3>
          <p class="mt-1 text-sm text-gray-500">
            <!-- TODO: Confirmar si se acepta la solicitud del trabajador -->
            ¿Deseas aceptar la solicitud de {{ solicitudSeleccionada?.nombre_trabajador }}?
          </p>
        </div>
        
        <div class="px-6 py-4">
          <!-- TODO: Campo opcional para agregar observaciones/comentarios sobre la aceptación -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones (Opcional)</label>
            <textarea
              v-model="observacionesAceptar"
              placeholder="Agrega comentarios sobre la aprobación..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
          <button
            @click="cerrarModalAceptar"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="aceptarSolicitud"
            :disabled="procesando"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <!-- TODO: Enviar acción de aceptación al backend -->
            <span v-if="!procesando">Aceptar</span>
            <span v-else>Procesando...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Rechazar Solicitud -->
    <div v-if="mostrarModalRechazar" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Rechazar Solicitud</h3>
          <p class="mt-1 text-sm text-gray-500">
            <!-- TODO: Confirmar rechazo de la solicitud -->
            Completa los detalles para rechazar la solicitud de {{ solicitudSeleccionada?.nombre_trabajador }}
          </p>
        </div>
        
        <div class="px-6 py-4 space-y-4">
          <!-- TODO: Campo obligatorio para la razón del rechazo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Razón del Rechazo <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="razonRechazo"
              placeholder="Explica por qué se rechaza esta solicitud..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows="3"
              required
            ></textarea>
            <!-- TODO: Validar que no esté vacío antes de enviar -->
            <p v-if="razonRechazo.length === 0" class="mt-1 text-xs text-red-500">La razón es requerida</p>
          </div>

          <!-- TODO: Campo obligatorio para indicar el plazo en días para que el trabajador pueda apelar -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Plazo para Apelación (días) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="plazoApelacion"
              type="number"
              min="1"
              max="30"
              placeholder="Ej: 5, 10, 15..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
            <!-- TODO: Mostrar fecha límite para apelar basada en el plazo -->
            <p v-if="plazoApelacion > 0" class="mt-2 text-sm text-gray-600">
              <span class="font-medium">Vencimiento de apelación:</span> {{ calcularFechaApelacion(plazoApelacion) }}
            </p>
            <!-- TODO: Validar que sea un número válido -->
            <p v-if="plazoApelacion === 0 || plazoApelacion === null" class="mt-1 text-xs text-red-500">El plazo es requerido y debe ser mayor a 0</p>
          </div>

          <!-- TODO: Dropdown para seleccionar a quién va dirigida la apelación (supervisor, RH, director, etc.) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Apelación dirigida a <span class="text-red-500">*</span>
            </label>
            <select
              v-model="instanciaApelacion"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            >
              <option value="">-- Selecciona una opción --</option>
              <!-- TODO: Traer dinámicamente según la estructura organizacional -->
              <!-- Posibles opciones: Departamento de RRHH, Gerencia, Dirección, etc. -->
              <option value="rrhh">Departamento de RRHH</option>
              <option value="gerencia">Gerencia</option>
              <option value="direccion">Dirección General</option>
              <option value="comite_apelacion">Comité de Apelación</option>
            </select>
            <!-- TODO: Validar que se seleccione una opción -->
            <p v-if="instanciaApelacion === ''" class="mt-1 text-xs text-red-500">Debes seleccionar una instancia</p>
          </div>
        </div>

        <div class="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
          <button
            @click="cerrarModalRechazar"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="rechazarSolicitud"
            :disabled="procesando || !validarFormularioRechazo()"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <!-- TODO: Enviar acción de rechazo al backend con todos los datos -->
            <span v-if="!procesando">Rechazar</span>
            <span v-else>Procesando...</span>
          </button>
        </div>
      </div>
    </div>

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

    <!-- Overlay para modales -->
    <div 
      v-if="mostrarModalDetalle || mostrarModalAceptar || mostrarModalRechazar" 
      class="fixed inset-0 bg-gray-500 bg-opacity-75 z-40"
      @click="cerrarTodosLosModales"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// TODO: Importar composable para cargar solicitudes de trabajadores
// import { useSolicitudesTrabajadores } from '../../composables/useSolicitudesTrabajadores';
// TODO: Importar componente modal para detalles
// import ModalDetalleSolicitudTrabajador from '../modals/ModalDetalleSolicitudTrabajador.vue';

// TODO: Usar composable para lógica de datos
// const {
//   loading,
//   error,
//   solicitudes,
//   procesando,
//   tiposSolicitudes,
//   cargarSolicitudes,
//   aceptarSolicitud,
//   rechazarSolicitud,
//   formatearFecha
// } = useSolicitudesTrabajadores();

// Estado local
const loading = ref(false);
const error = ref(null);
const procesando = ref(false);
const solicitudes = ref([]);
const tiposSolicitudes = ref([]);

// Estadísticas
const solicitudesPendientes = ref(0);
const solicitudesAceptadas = ref(0);
const solicitudesRechazadas = ref(0);
const solicitudesEnApelacion = ref(0);

// Modales
const mostrarModalDetalle = ref(false);
const mostrarModalAceptar = ref(false);
const mostrarModalRechazar = ref(false);
const solicitudSeleccionada = ref(null);

// Filtros
const filtroTipo = ref('');
const filtroEstado = ref('');

// Datos para aceptar
const observacionesAceptar = ref('');

// Datos para rechazar
const razonRechazo = ref('');
const plazoApelacion = ref(null);
const instanciaApelacion = ref('');

// Computed
const solicitudesFiltradas = computed(() => {
  let resultado = [...solicitudes.value];
  
  if (filtroTipo.value) {
    // TODO: Filtrar por tipo de solicitud
    resultado = resultado.filter(s => s.tipo_solicitud === filtroTipo.value);
  }
  
  if (filtroEstado.value) {
    // TODO: Filtrar por estado de la solicitud
    resultado = resultado.filter(s => s.estado === filtroEstado.value);
  }
  
  // TODO: Ordenar por fecha de creación descendente
  return resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

// Métodos
const aplicarFiltros = () => {
  // TODO: Llamar al composable con los filtros
  console.log('Filtros aplicados:', { tipo: filtroTipo.value, estado: filtroEstado.value });
};

const obtenerClaseEstado = (estado) => {
  // TODO: Retornar clase CSS según el estado
  const clases = {
    'PENDIENTE': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    'ACEPTADA': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    'RECHAZADA': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    'EN_APELACION': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
  };
  return clases[estado] || clases['PENDIENTE'];
};

const formatearFecha = (fecha) => {
  // TODO: Formatear fecha según el formato local (ej: 15/11/2025)
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES');
};

const verDetalleSolicitud = (solicitud) => {
  // TODO: Abrir modal con detalles completos de la solicitud
  solicitudSeleccionada.value = solicitud;
  mostrarModalDetalle.value = true;
};

const cerrarModalDetalle = () => {
  mostrarModalDetalle.value = false;
  solicitudSeleccionada.value = null;
};

const abrirModalAceptar = (solicitud) => {
  // TODO: Abrir modal de aceptación
  solicitudSeleccionada.value = solicitud;
  observacionesAceptar.value = '';
  mostrarModalAceptar.value = true;
};

const cerrarModalAceptar = () => {
  mostrarModalAceptar.value = false;
  observacionesAceptar.value = '';
};

const aceptarSolicitud = async () => {
  try {
    procesando.value = true;
    // TODO: Llamar al servicio/composable para aceptar la solicitud
    // Parámetros a enviar:
    // - id de la solicitud
    // - observaciones (opcional)
    console.log('Aceptando solicitud:', {
      id: solicitudSeleccionada.value.id,
      observaciones: observacionesAceptar.value
    });
    
    // TODO: Mostrar mensaje de éxito
    cerrarModalAceptar();
    await aplicarFiltros();
  } catch (err) {
    console.error('Error al aceptar solicitud:', err);
    error.value = err.message || 'Error al aceptar la solicitud';
  } finally {
    procesando.value = false;
  }
};

const abrirModalRechazar = (solicitud) => {
  // TODO: Abrir modal de rechazo
  solicitudSeleccionada.value = solicitud;
  razonRechazo.value = '';
  plazoApelacion.value = null;
  instanciaApelacion.value = '';
  mostrarModalRechazar.value = true;
};

const cerrarModalRechazar = () => {
  mostrarModalRechazar.value = false;
  razonRechazo.value = '';
  plazoApelacion.value = null;
  instanciaApelacion.value = '';
};

const validarFormularioRechazo = () => {
  // TODO: Validar que todos los campos requeridos estén completos
  return razonRechazo.value.trim().length > 0 && 
         plazoApelacion.value > 0 && 
         instanciaApelacion.value !== '';
};

const calcularFechaApelacion = (dias) => {
  // TODO: Calcular la fecha límite para apelar sumando el plazo a la fecha actual
  if (dias <= 0) return '';
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toLocaleDateString('es-ES');
};

const rechazarSolicitud = async () => {
  try {
    if (!validarFormularioRechazo()) {
      error.value = 'Por favor completa todos los campos requeridos';
      return;
    }

    procesando.value = true;
    // TODO: Llamar al servicio/composable para rechazar la solicitud
    // Parámetros a enviar:
    // - id de la solicitud
    // - razón del rechazo
    // - plazo para apelación (en días)
    // - instancia a la que va dirigida la apelación
    console.log('Rechazando solicitud:', {
      id: solicitudSeleccionada.value.id,
      razon: razonRechazo.value,
      plazoApelacion: plazoApelacion.value,
      instanciaApelacion: instanciaApelacion.value,
      fechaVencimiento: calcularFechaApelacion(plazoApelacion.value)
    });
    
    // TODO: Mostrar mensaje de éxito
    cerrarModalRechazar();
    await aplicarFiltros();
  } catch (err) {
    console.error('Error al rechazar solicitud:', err);
    error.value = err.message || 'Error al rechazar la solicitud';
  } finally {
    procesando.value = false;
  }
};

const cerrarTodosLosModales = () => {
  cerrarModalDetalle();
  cerrarModalAceptar();
  cerrarModalRechazar();
};

// Lifecycle
onMounted(() => {
  // TODO: Cargar solicitudes de trabajadores al montar el componente
  console.log('Cargando solicitudes de trabajadores...');
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
