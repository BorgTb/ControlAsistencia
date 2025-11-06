<template>
  <div v-if="visible" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('cerrar')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal Panel -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh]"
        @click.stop
      >
        <div v-if="solicitud" class="flex flex-col max-h-[90vh]">
          <!-- Header - Fixed -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Detalle de Solicitud
            </h3>
            <button 
              @click="$emit('cerrar')"
              class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Body - Scrollable -->
          <div class="flex-1 overflow-y-auto px-6 py-4 modal-body">

          <!-- Información principal -->
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg mb-6">
            <div class="text-sm font-medium text-gray-500">
              Tipo de Solicitud
            </div>
            <div class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div class="flex items-center">
                <component 
                  :is="obtenerIconoTipo(solicitud.tipo_solicitud)" 
                  class="h-5 w-5 text-gray-400 mr-2"
                />
                {{ obtenerNombreTipo(solicitud.tipo_solicitud) }}
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200">
            <dl>
              <!-- Estado -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Estado</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span 
                    :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${obtenerColorEstado(solicitud.estado)}-100 text-${obtenerColorEstado(solicitud.estado)}-800`"
                  >
                    {{ solicitud.estado }}
                  </span>
                </dd>
              </div>

              <!-- Fechas de la solicitud -->
              <div v-if="solicitud.fecha_inicio" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Período Solicitado</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatearFecha(solicitud.fecha_inicio) }}
                  <span v-if="solicitud.fecha_fin && solicitud.fecha_fin !== solicitud.fecha_inicio">
                    - {{ formatearFecha(solicitud.fecha_fin) }}
                  </span>
                  <span v-if="solicitud.dias_solicitados" class="text-gray-500 ml-2">
                    ({{ solicitud.dias_solicitados }} día{{ solicitud.dias_solicitados !== 1 ? 's' : '' }})
                  </span>
                </dd>
              </div>

              <!-- Motivo -->
              <div v-if="solicitud.motivo" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Motivo</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ solicitud.motivo }}
                </dd>
              </div>

              <!-- Información específica según tipo -->
              <template v-if="solicitud.tipo_solicitud.includes('permiso')">
                <div v-if="solicitud.tipo_permiso" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Tipo de Permiso</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                    {{ solicitud.tipo_permiso }}
                  </dd>
                </div>
              </template>

              <template v-if="solicitud.tipo_solicitud === 'compensacion_horas'">
                <div v-if="solicitud.horas_extras_info" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Horas Extras a Compensar</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ solicitud.horas_extras_info.fecha }} - {{ solicitud.horas_extras_info.total_horas }}h
                  </dd>
                </div>
                <div v-if="solicitud.fecha_compensacion" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Fecha de Compensación</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatearFecha(solicitud.fecha_compensacion) }}
                  </dd>
                </div>
              </template>

              <template v-if="solicitud.tipo_solicitud === 'cambio_turno'">
                <div v-if="solicitud.fecha_inicio" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Turno Actual</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatearFecha(solicitud.fecha_inicio) }}
                    <span v-if="solicitud.turno_actual" class="text-gray-500 ml-2">
                      - {{ solicitud.turno_actual }}
                    </span>
                  </dd>
                </div>
                <div v-if="solicitud.fecha_nueva" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Nuevo Turno</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatearFecha(solicitud.fecha_fin) }}
                    <span v-if="solicitud.turno_nuevo" class="text-gray-500 ml-2">
                      - {{ solicitud.turno_nuevo }}
                    </span>
                  </dd>
                </div>
                <div v-if="solicitud.usuario_intercambio_info" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Intercambio con</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ solicitud.usuario_intercambio_info.nombre }} {{ solicitud.usuario_intercambio_info.apellido }}
                  </dd>
                </div>
              </template>

              <!-- Fechas de creación y actualización -->
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatearFechaHora(solicitud.created_at) }}
                </dd>
              </div>

              <div v-if="solicitud.updated_at !== solicitud.created_at" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Última Actualización</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatearFechaHora(solicitud.updated_at) }}
                </dd>
              </div>

              <!-- Información de aprobación/rechazo -->
              <div v-if="solicitud.aprobado_por_info" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  {{ solicitud.estado === 'APROBADA' ? 'Aprobado por' : 'Revisado por' }}
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ solicitud.aprobado_por_info.nombre }} {{ solicitud.aprobado_por_info.apellido }}
                  <div v-if="solicitud.fecha_aprobacion" class="text-xs text-gray-500">
                    {{ formatearFechaHora(solicitud.fecha_aprobacion) }}
                  </div>
                </dd>
              </div>

              <!-- Observaciones de aprobación/rechazo -->
              <div v-if="solicitud.observaciones" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Observaciones</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ solicitud.observaciones }}
                </dd>
              </div>

              <!-- Documentos adjuntos -->
              <div v-if="solicitud.documentos && solicitud.documentos.length > 0" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Documentos Adjuntos</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul class="border border-gray-200 rounded-md divide-y divide-gray-200">
                    <li v-for="documento in solicitud.documentos" :key="documento.id" class="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div class="w-0 flex-1 flex items-center">
                        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <span class="ml-2 flex-1 w-0 truncate">{{ documento.nombre_original }}</span>
                      </div>
                      <div class="ml-4 flex-shrink-0">
                        <button 
                          @click="descargarDocumento(documento)"
                          class="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Descargar
                        </button>
                      </div>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Historial de cambios -->
          <div v-if="solicitud.historial && solicitud.historial.length > 0" class="mt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Historial de Cambios</h4>
            <div class="flow-root">
              <ul class="-mb-8">
                <li v-for="(cambio, index) in solicitud.historial" :key="cambio.id" class="relative pb-8">
                  <div v-if="index < solicitud.historial.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                  <div class="relative flex space-x-3">
                    <div>
                      <span :class="`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-${obtenerColorCambio(cambio.accion)}-500`">
                        <component :is="obtenerIconoCambio(cambio.accion)" class="h-4 w-4 text-white" />
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">
                          {{ cambio.descripcion }}
                          <span v-if="cambio.usuario_info" class="font-medium text-gray-900">
                            por {{ cambio.usuario_info.nombre }} {{ cambio.usuario_info.apellido }}
                          </span>
                        </p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        {{ formatearFechaHora(cambio.created_at) }}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          </div>

          <!-- Footer - Fixed -->
          <div class="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div class="flex justify-end">
              <button
                @click="$emit('cerrar')"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
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
import { computed } from 'vue';
import { useSolicitudesGenerales } from '../../composables/useSolicitudesGenerales';

// Props
const props = defineProps({
  visible: Boolean,
  solicitud: Object
});

// Emits
const emit = defineEmits(['cerrar']);

// Composables
const {
  formatearFecha,
  formatearFechaHora,
  obtenerColorEstado,
  obtenerNombreTipo,
  descargarDocumento: descargarDoc
} = useSolicitudesGenerales();

// Métodos
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

const obtenerColorCambio = (accion) => {
  const colores = {
    'creada': 'blue',
    'aprobada': 'green',
    'rechazada': 'red',
    'cancelada': 'yellow',
    'modificada': 'purple'
  };
  
  return colores[accion] || 'gray';
};

const obtenerIconoCambio = (accion) => {
  const iconos = {
    'creada': 'PlusIcon',
    'aprobada': 'CheckIcon',
    'rechazada': 'XIcon',
    'cancelada': 'XCircleIcon',
    'modificada': 'PencilIcon'
  };
  
  return iconos[accion] || 'ClockIcon';
};

const descargarDocumento = async (documento) => {
  try {
    await descargarDoc(props.solicitud.id, documento.id);
  } catch (error) {
    console.error('Error al descargar documento:', error);
  }
};
</script>

<style scoped>
/* Asegurar que el scroll funcione correctamente */
.modal-body {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

/* Estilos para el scroll */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f7fafc;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

/* Mejorar la experiencia en mobile */
@media (max-width: 640px) {
  .modal-body {
    max-height: calc(100vh - 160px);
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
}
</style>