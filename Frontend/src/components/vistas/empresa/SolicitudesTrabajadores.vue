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
                          {{ solicitud.usuario_nombre || 'Nombre del Trabajador' }}
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
                          <span class="font-medium">Tipo:</span> {{ obtenerNombreTipo(solicitud.subtipo) || 'Tipo de solicitud' }}
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
                      v-if="solicitud.estado === 'pendiente'"
                      @click="abrirModalAceptar(solicitud)"
                      :disabled="procesando"
                      class="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                    >
                      Aceptar
                    </button>

                    <button
                      v-if="solicitud.estado === 'pendiente'"
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
      @aceptar="manejarAceptarDelModal"
      @rechazar="manejarRechazarDelModal"
    />

    <!-- Modal Aceptar Solicitud -->
    <div v-if="mostrarModalAceptar" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Aceptar Solicitud</h3>
          <p class="mt-1 text-sm text-gray-500">
            <!-- TODO: Confirmar si se acepta la solicitud del trabajador -->
            ¿Deseas aceptar la solicitud de {{ solicitudSeleccionada?.usuario_nombre }}?
          </p>
        </div>
        
        <div class="px-6 py-4 space-y-4">
          <!-- Advertencia si la solicitud no es de tipo permiso, feriado o compensación -->
          <div 
            v-if="!esPermisoCambioOCompensacion(solicitudSeleccionada?.subtipo)"
            class="p-4 bg-red-50 border-l-4 border-red-500 rounded"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  ⚠️ ¡ATENCIÓN! Cambio Irreversible
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p class="font-semibold mb-2">Este cambio NO se puede deshacer</p>
                  <p>Estás a punto de aprobar una solicitud de tipo <strong>{{ obtenerNombreTipo(solicitudSeleccionada?.subtipo) }}</strong> que implica cambios significativos en el sistema.</p>
                  <p class="mt-2">Asegúrate de haber realizado y leído todos los cambios antes de confirmar.</p>
                </div>
              </div>
            </div>
            
            <!-- Checkbox de confirmación -->
            <div class="mt-4 flex items-center">
              <input 
                id="confirmacion-cambio"
                v-model="confirmarCambioIrreversible"
                type="checkbox"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label for="confirmacion-cambio" class="ml-2 block text-sm font-medium text-red-800">
                Confirmo que deseo realizar este cambio irreversible
              </label>
            </div>
          </div>

          <!-- TODO: Campo opcional para agregar observaciones/comentarios sobre la aceptación -->
          <div>
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
            :disabled="procesando || !puedoAceptarSolicitud()"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            Completa los detalles para rechazar la solicitud de {{ solicitudSeleccionada?.usuario_nombre }}
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

          <!-- TODO: Campo libre para especificar a quién va dirigida la apelación -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Apelación dirigida a <span class="text-red-500">*</span>
            </label>
            <input
              v-model="instanciaApelacion"
              type="text"
              placeholder="Ej: Departamento de RRHH, Gerencia, Dirección General, etc."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
            <p class="mt-1 text-xs text-gray-500">Especifica la instancia o persona a la que el trabajador puede dirigir su apelación</p>
            <!-- TODO: Validar que no esté vacío -->
            <p v-if="instanciaApelacion.trim() === ''" class="mt-1 text-xs text-red-500">Debes especificar una instancia de apelación</p>
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
            @click="rechazarSolicitudAction"
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
import { useEmpresa } from '@/composables/useEmpresa';
import ModalDetalleSolicitudTrabajador from '@/components/modals/ModalDetalleSolicitudTrabajador.vue';

// Composable
const {
  obtenerSolicitudesUsuarios,
  obtenerSolicitudesPendientes,
  aprobarSolicitud,
  rechazarSolicitud: rechazarSolicitudAPI
} = useEmpresa();

// Estado local
const loading = ref(false);
const error = ref(null);
const procesando = ref(false);
const solicitudes = ref([]);
const tiposSolicitudes = ref([
  { id: 'permiso_con_goce', nombre: 'Permiso con Goce' },
  { id: 'permiso_sin_goce', nombre: 'Permiso sin Goce' },
  { id: 'cambio_turno', nombre: 'Cambio de Turno' },
  { id: 'uso_feriado', nombre: 'Uso de Feriado' },
  { id: 'compensacion_horas', nombre: 'Compensación de Horas' }
]);

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
const confirmarCambioIrreversible = ref(false);

// Datos para rechazar
const razonRechazo = ref('');
const plazoApelacion = ref(null);
const instanciaApelacion = ref('');

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

// Computeds para estadísticas
const solicitudesPendientes = computed(() => {
  return solicitudes.value.filter(s => s.estado === 'pendiente').length;
});

const solicitudesAceptadas = computed(() => {
  return solicitudes.value.filter(s => s.estado === 'aceptada').length;
});

const solicitudesRechazadas = computed(() => {
  return solicitudes.value.filter(s => s.estado === 'rechazada').length;
});

const solicitudesEnApelacion = computed(() => {
  return solicitudes.value.filter(s => s.estado === 'cancelada').length;
});

// Estados para estadísticas
const estadosSolicitud = [
  { id: 'pendiente', nombre: 'Pendiente', color: 'yellow' },
  { id: 'aceptada', nombre: 'Aceptada', color: 'green' },
  { id: 'rechazada', nombre: 'Rechazada', color: 'red' },
  { id: 'cancelada', nombre: 'En Apelación', color: 'blue' }
];

const solicitudesPorEstado = computed(() => {
  return estadosSolicitud.map(estado => ({
    ...estado,
    cantidad: solicitudes.value.filter(s => s.estado === estado.id).length
  }));
});

// Métodos
const cargarSolicitudes = async () => {
  loading.value = true;
  error.value = null;

  try {
    const datos = await obtenerSolicitudesUsuarios();
    console.log('📋 Datos crudos del backend:', datos);
    solicitudes.value = Array.isArray(datos) ? datos : [];
    console.log('✅ Solicitudes cargadas:', solicitudes.value);
    console.log('📊 Total de solicitudes:', solicitudes.value.length);
    
    // Log detallado de la primera solicitud para debug
    if (solicitudes.value.length > 0) {
      console.log('🔍 Primera solicitud:', solicitudes.value[0]);
      console.log('🔑 ID de la primera solicitud:', solicitudes.value[0].id_solicitud);
    }
  } catch (err) {
    console.error('❌ Error al cargar solicitudes:', err);
    error.value = err.message || 'Error al cargar solicitudes';
    solicitudes.value = [];
  } finally {
    loading.value = false;
  }
};

const aplicarFiltros = async () => {
  loading.value = true;
  error.value = null;

  try {
    const filtros = {};
    if (filtroTipo.value) filtros.subtipo = filtroTipo.value;
    if (filtroEstado.value) filtros.estado = filtroEstado.value;

    const datos = await obtenerSolicitudesPendientes(filtros);
    solicitudes.value = Array.isArray(datos) ? datos : [];
    console.log('✅ Filtros aplicados, solicitudes:', solicitudes.value);
  } catch (err) {
    console.error('❌ Error al aplicar filtros:', err);
    error.value = err.message || 'Error al aplicar filtros';
  } finally {
    loading.value = false;
  }
};

const obtenerClaseEstado = (estado) => {
  const clases = {
    'PENDIENTE': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    'ACEPTADA': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    'RECHAZADA': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    'EN_APELACION': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
  };
  return clases[estado] || clases['PENDIENTE'];
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES');
};

const obtenerNombreTipo = (tipo) => {
  const tipoObj = tiposSolicitudes.value.find(t => t.id === tipo);
  return tipoObj?.nombre || tipo;
};

const verDetalleSolicitud = (solicitud) => {
  console.log('📋 Viendo detalle de solicitud:', solicitud);
  solicitudSeleccionada.value = solicitud;
  mostrarModalDetalle.value = true;
};

const cerrarModalDetalle = () => {
  mostrarModalDetalle.value = false;
  solicitudSeleccionada.value = null;
};

const abrirModalAceptar = (solicitud) => {
  solicitudSeleccionada.value = solicitud;
  observacionesAceptar.value = '';
  confirmarCambioIrreversible.value = false;
  mostrarModalAceptar.value = true;
};

const cerrarModalAceptar = () => {
  mostrarModalAceptar.value = false;
  observacionesAceptar.value = '';
  confirmarCambioIrreversible.value = false;
};

const esPermisoCambioOCompensacion = (subtipo) => {
  const tiposPermitidos = ['permiso_con_goce', 'permiso_sin_goce', 'compensacion_horas'];
  return tiposPermitidos.includes(subtipo);
};

const puedoAceptarSolicitud = () => {
  // Si es permiso, feriado o compensación, no requiere confirmación
  if (esPermisoCambioOCompensacion(solicitudSeleccionada.value?.subtipo)) {
    return true;
  }
  // Si NO es permiso/feriado/compensación, requiere que confirme
  return confirmarCambioIrreversible.value;
};

const aceptarSolicitud = async () => {
  try {
    procesando.value = true;
    console.log('🟢 ACEPTAR - Solicitud seleccionada:', solicitudSeleccionada.value);
    console.log('🟢 ACEPTAR - ID a enviar:', solicitudSeleccionada.value.id_solicitud);
    console.log('🟢 ACEPTAR - Observaciones:', observacionesAceptar.value);
    
    const resultado = await aprobarSolicitud(solicitudSeleccionada.value.id_solicitud, {
      observaciones: observacionesAceptar.value
    });
    
    console.log('🟢 ACEPTAR - Resultado del backend:', resultado);
    error.value = null;
    cerrarModalAceptar();
    await cargarSolicitudes();
  } catch (err) {
    console.error('❌ Error al aceptar solicitud:', err);
    error.value = err.message || 'Error al aceptar la solicitud';
  } finally {
    procesando.value = false;
  }
};

const abrirModalRechazar = (solicitud) => {
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
  return razonRechazo.value.trim().length > 0 && 
         plazoApelacion.value > 0 && 
         instanciaApelacion.value !== '';
};

const calcularFechaApelacion = (dias) => {
  if (dias <= 0) return '';
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toLocaleDateString('es-ES');
};

const rechazarSolicitudAction = async () => {
  try {
    if (!validarFormularioRechazo()) {
      error.value = 'Por favor completa todos los campos requeridos';
      return;
    }

    procesando.value = true;
    console.log('🔴 RECHAZAR - Solicitud seleccionada:', solicitudSeleccionada.value);
    console.log('🔴 RECHAZAR - ID a enviar:', solicitudSeleccionada.value.id_solicitud);
    console.log('🔴 RECHAZAR - Motivo:', razonRechazo.value);
    console.log('🔴 RECHAZAR - Plazo apelación:', plazoApelacion.value);
    console.log('🔴 RECHAZAR - Instancia apelación:', instanciaApelacion.value);
    
    const resultado = await rechazarSolicitudAPI(solicitudSeleccionada.value.id_solicitud, {
      motivo: razonRechazo.value,
      plazo_apelacion: plazoApelacion.value,
      instancia_apelacion: instanciaApelacion.value
    });
    
    console.log('🔴 RECHAZAR - Resultado del backend:', resultado);
    error.value = null;
    cerrarModalRechazar();
    await cargarSolicitudes();
  } catch (err) {
    console.error('❌ Error al rechazar solicitud:', err);
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

const manejarAceptarDelModal = (solicitud) => {
  console.log('📋 Aceptar desde modal:', solicitud);
  solicitudSeleccionada.value = solicitud;
  cerrarModalDetalle();
  abrirModalAceptar(solicitud);
};

const manejarRechazarDelModal = (solicitud) => {
  console.log('📋 Rechazar desde modal:', solicitud);
  solicitudSeleccionada.value = solicitud;
  cerrarModalDetalle();
  abrirModalRechazar(solicitud);
};

// Lifecycle
onMounted(async () => {
  await cargarSolicitudes();
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
