<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true" @click="cerrarAlHacerClickEnBackdrop">
    <!-- Backdrop -->
    <div class="absolute inset-0 transition-opacity"></div>

    <!-- Modal Panel -->
    <div 
      class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh]"
      @click.stop
    >
      <!-- Modal Content with Scroll -->
      <div class="flex flex-col max-h-[90vh]">
        <!-- Header - Fixed -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Nueva Solicitud
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
          <form @submit.prevent="enviarSolicitud" class="space-y-6">
            <!-- Selección de tipo de solicitud -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Solicitud *
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  v-for="tipo in tiposSolicitudes" 
                  :key="tipo.id"
                  @click="seleccionarTipo(tipo)"
                  :class="[
                    'relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                    tipoSeleccionado?.id === tipo.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300'
                  ]"
                >
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        :id="tipo.id"
                        :value="tipo.id"
                        v-model="formulario.tipo_solicitud"
                        name="tipo_solicitud"
                        type="radio"
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                    </div>
                    <div class="ml-3">
                      <label :for="tipo.id" class="font-medium text-gray-900 cursor-pointer">
                        {{ tipo.nombre }}
                      </label>
                      <p class="text-sm text-gray-500">{{ tipo.descripcion }}</p>
                      <p v-if="tipo.requiereDocumento" class="text-xs text-amber-600 mt-1">
                        * Requiere documento adjunto
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campos específicos según el tipo -->
            <div v-if="tipoSeleccionado" class="space-y-4">
              
              <!-- Campos para Feriado -->
              <template v-if="tipoSeleccionado.id === 'uso_feriado'">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de inicio *
                    </label>
                    <input
                      v-model="formulario.fecha_inicio"
                      type="date"
                      required
                      :min="fechaMinima"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de fin *
                    </label>
                    <input
                      v-model="formulario.fecha_fin"
                      type="date"
                      required
                      :min="formulario.fecha_inicio || fechaMinima"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <p class="text-sm text-gray-600" v-if="diasSolicitados > 0">
                    Días solicitados: {{ diasSolicitados }}
                  </p>
                </div>
              </template>

              <!-- Campos para Permisos -->
              <template v-if="tipoSeleccionado.id.includes('permiso')">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de inicio *
                    </label>
                    <input
                      v-model="formulario.fecha_inicio"
                      type="date"
                      required
                      :min="fechaMinima"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de fin *
                    </label>
                    <input
                      v-model="formulario.fecha_fin"
                      type="date"
                      required
                      :min="formulario.fecha_inicio || fechaMinima"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de permiso *
                  </label>
                  <select
                    v-model="formulario.tipo_permiso"
                    required
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="medico">Médico</option>
                    <option value="familiar">Familiar</option>
                    <option value="personal">Personal</option>
                    <option value="capacitacion">Capacitación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </template>

              <!-- Campos para Compensación de Horas -->
              <template v-if="tipoSeleccionado.id === 'compensacion_horas'">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Horas extras a compensar *
                  </label>
                  <select
                    v-model="formulario.horas_extras_id"
                    required
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar horas extras</option>
                    <option 
                      v-for="he in horasExtrasDisponibles" 
                      :key="he.id" 
                      :value="he.id"
                    >
                      {{ he.fecha }} - {{ he.total_horas }}h ({{ he.motivo }})
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de compensación *
                  </label>
                  <input
                    v-model="formulario.fecha_compensacion"
                    type="date"
                    required
                    :min="fechaMinima"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </template>

              <!-- Campos para Cambio de Turno -->
              <template v-if="tipoSeleccionado.id === 'cambio_turno'">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha actual *
                    </label>
                    <input
                      v-model="formulario.fecha_inicio"
                      type="date"
                      required
                      :min="fechaMinima"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha nueva *
                    </label>
                    <input
                      v-model="formulario.fecha_fin"
                      type="date"
                      required
                      :min="fechaMinima"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Usuario para intercambio
                  </label>
                  <select
                    v-model="formulario.usuario_intercambio"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar compañero (opcional)</option>
                    <option 
                      v-for="usuario in usuariosIntercambio" 
                      :key="usuario.id" 
                      :value="usuario.id"
                    >
                      {{ usuario.nombre }} {{ usuario.apellido }}
                    </option>
                  </select>
                </div>
              </template>

              <!-- Motivo (común para todos) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Motivo *
                </label>
                <textarea
                  v-model="formulario.motivo"
                  required
                  rows="3"
                  placeholder="Describe el motivo de tu solicitud..."
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>

              <!-- Subir documento -->
              <div v-if="tipoSeleccionado.requiereDocumento">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Documento adjunto *
                </label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div class="space-y-1 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="flex text-sm text-gray-600">
                      <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Subir archivo</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          class="sr-only" 
                          @change="manejarArchivo"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          :required="tipoSeleccionado.requiereDocumento"
                        />
                      </label>
                      <p class="pl-1">o arrastra aquí</p>
                    </div>
                    <p class="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG hasta 10MB
                    </p>
                  </div>
                </div>
                <div v-if="archivoSeleccionado" class="mt-2 text-sm text-green-600">
                  Archivo seleccionado: {{ archivoSeleccionado.name }}
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer - Fixed -->
        <div class="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('cerrar')"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              @click="enviarSolicitud"
              :disabled="!formularioValido || enviando"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="enviando" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ enviando ? 'Enviando...' : 'Crear Solicitud' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useSolicitudesGenerales } from '../../composables/useSolicitudesGenerales';

// Props
const props = defineProps({
  visible: Boolean,
  tiposSolicitudes: Array
});

// Emits
const emit = defineEmits(['cerrar', 'crear']);

// Composables
const {
  obtenerHorasExtrasDisponibles,
  obtenerUsuariosParaIntercambio,
  validarDiasFeriado
} = useSolicitudesGenerales();

// Estado local
const formulario = ref({
  tipo_solicitud: '',
  fecha_inicio: '',
  fecha_fin: '',
  motivo: '',
  tipo_permiso: '',
  horas_extras_id: '',
  fecha_compensacion: '',
  usuario_intercambio: ''
});

const archivoSeleccionado = ref(null);
const enviando = ref(false);
const horasExtrasDisponibles = ref([]);
const usuariosIntercambio = ref([]);

// Computed
const tipoSeleccionado = computed(() => {
  return props.tiposSolicitudes?.find(t => t.id === formulario.value.tipo_solicitud);
});

const fechaMinima = computed(() => {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
});

const diasSolicitados = computed(() => {
  if (!formulario.value.fecha_inicio || !formulario.value.fecha_fin) return 0;
  
  const inicio = new Date(formulario.value.fecha_inicio);
  const fin = new Date(formulario.value.fecha_fin);
  const diferencia = fin.getTime() - inicio.getTime();
  const dias = Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
  
  return dias > 0 ? dias : 0;
});

const formularioValido = computed(() => {
  if (!tipoSeleccionado.value) return false;
  
  const requeridos = ['motivo'];
  
  // Validar campos específicos según el tipo
  if (tipoSeleccionado.value.id === 'uso_feriado') {
    requeridos.push('fecha_inicio', 'fecha_fin');
  }
  
  if (tipoSeleccionado.value.id.includes('permiso')) {
    requeridos.push('fecha_inicio', 'fecha_fin', 'tipo_permiso');
  }
  
  if (tipoSeleccionado.value.id === 'compensacion_horas') {
    requeridos.push('horas_extras_id', 'fecha_compensacion');
  }
  
  if (tipoSeleccionado.value.id === 'cambio_turno') {
    requeridos.push('fecha_inicio', 'fecha_fin');
  }
  
  // Verificar que todos los campos requeridos estén llenos
  const camposCompletos = requeridos.every(campo => formulario.value[campo]);
  
  // Verificar archivo si es requerido
  const archivoOk = !tipoSeleccionado.value.requiereDocumento || archivoSeleccionado.value;
  
  return camposCompletos && archivoOk;
});

// Métodos
const cerrarAlHacerClickEnBackdrop = (event) => {
  // Solo cerrar si el clic es directamente en el contenedor externo (backdrop), no en el modal
  if (event.target === event.currentTarget) {
    emit('cerrar');
  }
};

const seleccionarTipo = (tipo) => {
  formulario.value.tipo_solicitud = tipo.id;
  
  // Cargar datos específicos según el tipo
  if (tipo.id === 'compensacion_horas') {
    cargarHorasExtras();
  }
  
  if (tipo.id === 'cambio_turno') {
    cargarUsuariosIntercambio();
  }
};

const manejarArchivo = (event) => {
  const archivo = event.target.files[0];
  if (archivo) {
    // Validar tamaño (10MB)
    if (archivo.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }
    
    archivoSeleccionado.value = archivo;
  }
};

const cargarHorasExtras = async () => {
  try {
    horasExtrasDisponibles.value = await obtenerHorasExtrasDisponibles();
  } catch (error) {
    console.error('Error al cargar horas extras:', error);
  }
};

const cargarUsuariosIntercambio = async () => {
  try {
    usuariosIntercambio.value = await obtenerUsuariosParaIntercambio();
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const enviarSolicitud = async () => {
  if (!formularioValido.value) return;
  
  enviando.value = true;
  
  try {
    const datosSolicitud = {
      tipo: formulario.value.tipo_solicitud,
      datos: { ...formulario.value },
      archivo: archivoSeleccionado.value
    };
    
    emit('crear', datosSolicitud);
    limpiarFormulario();
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
  } finally {
    enviando.value = false;
  }
};

const limpiarFormulario = () => {
  formulario.value = {
    tipo_solicitud: '',
    fecha_inicio: '',
    fecha_fin: '',
    motivo: '',
    tipo_permiso: '',
    horas_extras_id: '',
    fecha_compensacion: '',
    usuario_intercambio: ''
  };
  archivoSeleccionado.value = null;
};

// Watchers
watch(() => props.visible, (visible) => {
  if (!visible) {
    limpiarFormulario();
  }
});

// Validación de feriados
watch([() => formulario.value.fecha_inicio, () => formulario.value.fecha_fin], 
  async ([fechaInicio, fechaFin]) => {
    if (tipoSeleccionado.value?.id === 'uso_feriado' && fechaInicio && fechaFin) {
      try {
        await validarDiasFeriado(fechaInicio, fechaFin);
      } catch (error) {
        console.warn('Validación de feriado:', error.message);
      }
    }
  }
);
</script>

<style scoped>
/* Asegurar que el scroll funcione correctamente en mobile */
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

/* Prevenir que el modal se cierre al hacer clic en inputs */
input, select, textarea, button {
  pointer-events: auto;
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
