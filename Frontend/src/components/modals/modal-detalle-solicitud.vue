<template>
  <Teleport to="body" v-if="visible">
    <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="$emit('cerrar')"></div>

      <!-- Modal Panel -->
      <div class="flex items-center justify-center min-h-screen">
        <div 
          class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <h3 class="text-lg font-semibold text-gray-900">
              Detalle de Solicitud <span v-if="solicitud" class="text-indigo-600">#{{ solicitud.id_solicitud }}</span>
            </h3>
            <button 
              @click="$emit('cerrar')"
              class="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div v-if="solicitud" class="p-6 space-y-6">
            
            <!-- Información principal -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo de Solicitud</label>
                <p class="mt-1 text-sm text-gray-900">{{ obtenerNombreTipo(solicitud.tipo_solicitud) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Estado</label>
                <span :class="`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-${obtenerColorEstado(solicitud.estado)}-100 text-${obtenerColorEstado(solicitud.estado)}-800`">
                  {{ solicitud.estado }}
                </span>
              </div>
            </div>

            <!-- Período -->
            <div v-if="solicitud.fecha_inicio" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatearFecha(solicitud.fecha_inicio) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Fecha Fin</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ solicitud.fecha_fin ? formatearFecha(solicitud.fecha_fin) : 'N/A' }}
                </p>
              </div>
            </div>

            <!-- Días solicitados -->
            <div v-if="solicitud.dias_solicitados" class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Días Solicitados</label>
                <p class="mt-1 text-sm text-gray-900">{{ solicitud.dias_solicitados }} día(s)</p>
              </div>
            </div>

            <!-- Motivo -->
            <div v-if="solicitud.motivo" class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Motivo</label>
                <p class="mt-1 text-sm text-gray-900">{{ solicitud.motivo }}</p>
              </div>
            </div>

            <!-- Observaciones -->
            <div v-if="solicitud.observaciones" class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Observaciones</label>
                <p class="mt-1 text-sm text-gray-900">{{ solicitud.observaciones }}</p>
              </div>
            </div>

            <!-- Documentos -->
            <div v-if="solicitud.documentos && solicitud.documentos.length > 0" class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Documentos Adjuntos</label>
                <div class="space-y-2">
                  <div v-for="doc in solicitud.documentos" :key="doc.id" class="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div class="flex items-center">
                      <svg class="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span class="text-sm text-gray-900">{{ doc.nombre_original }}</span>
                    </div>
                    <button 
                      @click="descargarDocumento(doc)"
                      class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Descargar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fechas -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label class="block text-sm font-medium text-gray-700">Creado</label>
                <p class="mt-1 text-sm text-gray-500">{{ formatearFechaHora(solicitud.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Actualizado</label>
                <p class="mt-1 text-sm text-gray-500">{{ formatearFechaHora(solicitud.updated_at) }}</p>
              </div>
            </div>

          </div>

          <!-- Empty state -->
          <div v-else class="p-6 text-center">
            <p class="text-gray-500">Cargando información...</p>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end">
            <button
              @click="$emit('cerrar')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue';
import { useSolicitudesGenerales } from '@/composables/use-solicitudes-generales';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  solicitud: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['cerrar']);

// Watcher para debug
watch(() => props.solicitud, (newVal) => {
  console.log('ModalDetalleSolicitud: solicitud actualizada', newVal);
}, { deep: true });

watch(() => props.visible, (newVal) => {
  console.log('ModalDetalleSolicitud: visible =', newVal);
});

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
    permiso_con_goce: 'UserCheckIcon',
    permiso_sin_goce: 'UserXIcon',
    compensacion_horas: 'ClockIcon',
    cambio_turno: 'RefreshCwIcon',
    amonestacion: 'AlertCircleIcon',
    feriado: 'CalendarIcon',
    uso_feriado: 'CalendarIcon'
  };
  
  return iconos[tipo] || 'DocumentIcon';
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
/* Sin estilos especiales necesarios, usando clases de Tailwind */
</style>