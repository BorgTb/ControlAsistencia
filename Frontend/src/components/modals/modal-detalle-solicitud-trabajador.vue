<template>
  <Teleport to="body" v-if="visible">
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="cerrar"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 px-6 py-4 border-b border-gray-200 bg-white">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              Detalle de Solicitud
            </h3>
            <button
              @click="cerrar"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div v-if="solicitud" class="px-6 py-4 space-y-6">
          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Trabajador</p>
              <p class="mt-1 text-sm text-gray-900">
                {{ solicitud.usuario_nombre }} {{ solicitud.apellido_pat }} {{ solicitud.apellido_mat }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Empresa</p>
              <p class="mt-1 text-sm text-gray-900">{{ solicitud.empresa_nombre }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Tipo de Solicitud</p>
              <p class="mt-1 text-sm text-gray-900">
                {{ formatearTipoSolicitud(solicitud.subtipo) }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Estado</p>
              <div class="mt-1">
                <span :class="obtenerClaseEstado(solicitud.estado)" class="text-sm">
                  {{ solicitud.estado }}
                </span>
              </div>
            </div>
          </div>

          <!-- Fechas -->
          <div class="border-t border-gray-200 pt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Período Solicitado</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Fecha Inicio</p>
                <p class="mt-1 text-sm text-gray-900">
                  {{ formatearFecha(solicitud.fecha_inicio) }}
                </p>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-500">Fecha Fin</p>
                <p class="mt-1 text-sm text-gray-900">
                  {{ formatearFecha(solicitud.fecha_fin) }}
                </p>
              </div>

              <div v-if="solicitud.dias_solicitados">
                <p class="text-sm font-medium text-gray-500">Días Solicitados</p>
                <p class="mt-1 text-sm text-gray-900">{{ solicitud.dias_solicitados }} días</p>
              </div>
            </div>
          </div>

          <!-- Descripción/Motivo -->
          <div class="border-t border-gray-200 pt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Motivo/Descripción</h4>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">
              {{ solicitud.motivo || solicitud.descripcion || 'Sin descripción' }}
            </p>
          </div>

          <!-- Documento Adjunto -->
          <div v-if="solicitud.documento_adjunto" class="border-t border-gray-200 pt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Documento Adjunto</h4>
            <div class="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <svg class="w-8 h-8 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ obtenerNombreArchivo(solicitud.documento_adjunto) }}
                </p>
                <p class="text-xs text-gray-500">PDF o documento adjunto</p>
              </div>
              <a
                @click.prevent="descargarArchivoSolicitud"
                :disabled="cargando"
                href="#"
                class="ml-4 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {{ cargando ? 'Descargando...' : 'Descargar' }}
              </a>
            </div>
          </div>

          <!-- Información de fechas del sistema -->
          <div class="border-t border-gray-200 pt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Información del Sistema</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Fecha de Emisión</p>
                <p class="mt-1 text-sm text-gray-900">
                  {{ formatearFechaHora(solicitud.fecha_emision) }}
                </p>
              </div>

              <div v-if="solicitud.fecha_respuesta">
                <p class="text-sm font-medium text-gray-500">Fecha de Respuesta</p>
                <p class="mt-1 text-sm text-gray-900">
                  {{ formatearFechaHora(solicitud.fecha_respuesta) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div v-if="solicitud.observaciones" class="border-t border-gray-200 pt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Observaciones</h4>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">
              {{ solicitud.observaciones }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="px-6 py-12 flex items-center justify-center">
          <div class="text-center">
            <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-600">Cargando información...</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <!-- Botones de acción si la solicitud está PENDIENTE -->
          <button
            v-if="solicitud && solicitud.estado === 'PENDIENTE'"
            @click="emitirAceptar"
            class="px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
          >
            ✓ Aceptar
          </button>

          <button
            v-if="solicitud && solicitud.estado === 'PENDIENTE'"
            @click="emitirRechazar"
            class="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            ✕ Rechazar
          </button>

          <button
            @click="cerrar"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { useDocumentos } from '@/composables/use-documentos';

const { descargarPorURL, cargando } = useDocumentos();
const descargandoDocumento = ref(false);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  solicitud: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['cerrar', 'aceptar', 'rechazar']);

const cerrar = () => {
  emit('cerrar');
};

const emitirAceptar = () => {
  emit('aceptar', props.solicitud);
};

const emitirRechazar = () => {
  emit('rechazar', props.solicitud);
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

const formatearFechaHora = (fecha) => {
  if (!fecha) return 'N/A';
  try {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

const formatearTipoSolicitud = (tipo) => {
  const tipos = {
    'permiso_con_goce': 'Permiso con Goce de Remuneración',
    'permiso_sin_goce': 'Permiso sin Goce de Remuneración',
    'cambio_turno': 'Cambio de Turno',
    'uso_feriado': 'Uso de Feriado',
    'compensacion_horas': 'Compensación de Horas Extras',
    'amonestacion': 'Amonestación'
  };
  return tipos[tipo] || tipo;
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

const obtenerNombreArchivo = (ruta) => {
  if (!ruta) return 'archivo.pdf';
  const partes = ruta.split('/');
  return partes[partes.length - 1] || 'archivo.pdf';
};

const descargarArchivoSolicitud = async () => {
  try {
    const nombreArchivo = obtenerNombreArchivo(props.solicitud.documento_adjunto);
    // Pasar 'solicitud' como tipo por defecto para solicitudes
    await descargarPorURL(props.solicitud.documento_adjunto, nombreArchivo, 'solicitud');
  } catch (error) {
    console.error('Error al descargar archivo:', error);
  }
};
</script>

<style scoped>
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
