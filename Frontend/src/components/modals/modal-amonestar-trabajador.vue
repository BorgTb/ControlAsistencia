<template>
  <div v-if="isOpen" class="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center" @click="cerrarModal">
    <div class="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- Header del Modal -->
      <div class="flex justify-between items-center pb-4 border-b">
        <h3 class="text-2xl font-bold text-gray-900 flex items-center">
          <svg class="w-7 h-7 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          Amonestar Trabajador
        </h3>
        <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Contenido del Modal -->
      <div class="mt-6 space-y-6">
        <!-- 🔹 Sección 1: Datos del Trabajador -->
        <div class="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Datos del Trabajador
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Nombre trabajador -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input 
                v-model="formulario.nombreTrabajador"
                type="text"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
            
            <!-- RUT trabajador -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">RUT</label>
              <input 
                v-model="formulario.rutTrabajador"
                type="text"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
            
            <!-- Email trabajador -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                v-model="formulario.emailTrabajador"
                type="email"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
            
            <!-- Cargo/Rol -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cargo/Rol</label>
              <input 
                v-model="formulario.cargo"
                type="text"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
            
            <!-- Empresa Asignada -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Empresa Asignada</label>
              <input 
                v-model="formulario.empresaAsignada"
                type="text"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
            
            <!-- RUT Empresa Empleadora -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">RUT Empresa Empleadora</label>
              <input 
                v-model="formulario.empresaEmpleadoraRut"
                type="text"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
            
            <!-- Supervisor responsable -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Supervisor responsable</label>
              <input 
                v-model="formulario.supervisorResponsable"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del supervisor que emite la amonestación"
              />
            </div>
          </div>
        </div>

        <!-- 🔹 Sección 2: Detalle de la Falta -->
        <div class="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Detalle de la Falta
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tipo de falta -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de falta *</label>
              <select 
                v-model="formulario.tipoFalta"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                required
              >
                <option value="">Seleccione...</option>
                <option value="atraso">Atraso</option>
                <option value="inasistencia">Inasistencia injustificada</option>
                <option value="salida_anticipada">Salida anticipada</option>
                <option value="no_marcacion">No marcación</option>
                <option value="otra">Otra</option>
              </select>
            </div>
            
            <!-- Fecha(s) del hecho -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha(s) del hecho *</label>
              <input 
                v-model="formulario.fechaHecho"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                required
              />
            </div>
            
            <!-- Descripción detallada -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción detallada *</label>
              <textarea 
                v-model="formulario.descripcionDetallada"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Describa los hechos de forma clara y objetiva..."
                required
              ></textarea>
            </div>
            
            <!-- Norma infringida -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Norma infringida</label>
              <textarea 
                v-model="formulario.normaInfringida"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Ej: Art. 12 del Reglamento Interno de Orden, Higiene y Seguridad"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 🔹 Sección 3: Sanción Aplicada -->
        <div class="bg-red-50 rounded-lg p-5 border border-red-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Sanción Aplicada
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tipo de sanción -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de sanción *</label>
              <select 
                v-model="formulario.tipoSancion"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Seleccione...</option>
                <option value="verbal">Amonestación verbal</option>
                <option value="escrita">Amonestación escrita</option>
                <option value="multa">Multa</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Según art. 154 del Código del Trabajo</p>
            </div>
            
            <!-- Monto multa -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Monto multa (si aplica)</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input 
                  v-model="formulario.montoMulta"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                  :disabled="formulario.tipoSancion !== 'multa'"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1">Hasta 25% del sueldo diario</p>
            </div>
            
            <!-- Observaciones RRHH -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones RRHH</label>
              <textarea 
                v-model="formulario.observacionesRRHH"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder="Comentarios adicionales del área de RRHH o supervisor..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 🔹 Sección 4: Derecho a Descargos -->
        <div class="bg-green-50 rounded-lg p-5 border border-green-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Derecho a Descargos
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Plazo para descargos -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Plazo para descargos *</label>
              <input 
                v-model="formulario.plazoDescargos"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                required
              />
              <p class="text-xs text-gray-500 mt-1">Fecha límite para presentar descargos</p>
            </div>
            
            <!-- Descargos del trabajador -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descargos del trabajador</label>
              <textarea 
                v-model="formulario.descargosTrabajador"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="El trabajador podrá ingresar sus descargos aquí..."
              ></textarea>
            </div>
            
            <!-- Evidencias adjuntas -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Evidencias adjuntas</label>
              <input 
                type="file"
                @change="manejarArchivos"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              <p class="text-xs text-gray-500 mt-1">Justificativos, certificados médicos, etc. (PDF, Word, Imágenes)</p>
              
              <!-- Lista de archivos seleccionados -->
              <div v-if="archivosSeleccionados.length > 0" class="mt-2 space-y-1">
                <div v-for="(archivo, index) in archivosSeleccionados" :key="index" class="flex items-center justify-between bg-white p-2 rounded border">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-sm text-gray-700">{{ archivo.name }}</span>
                    <span class="text-xs text-gray-500 ml-2">({{ formatearTamano(archivo.size) }})</span>
                  </div>
                  <button @click="eliminarArchivo(index)" class="text-red-500 hover:text-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del Modal -->
      <div class="mt-6 pt-4 border-t flex justify-end space-x-3">
        <button 
          @click="cerrarModal"
          class="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded-md transition-colors duration-200"
          :disabled="guardando"
        >
          Cancelar
        </button>
        <button 
          @click="guardarAmonestacion"
          class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2"
          :disabled="guardando || !formularioValido"
        >
          <div v-if="guardando" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>{{ guardando ? 'Guardando...' : 'Guardar Amonestación' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useNotification } from '@/composables/use-notification.js';
import { useEmpresa } from '@/composables/use-empresa.js';

const { showSuccess, showError, showWarning } = useNotification();
const { agregarAmonestacion } = useEmpresa();

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  trabajador: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['close', 'success']);

// Estados reactivos
const guardando = ref(false);
const archivosSeleccionados = ref([]);

const formulario = ref({
  // Datos del trabajador (bloqueados)
  nombreTrabajador: '',
  rutTrabajador: '',
  emailTrabajador: '',
  cargo: '',
  empresaAsignada: '',
  empresaEmpleadoraRut: '',
  supervisorResponsable: '',
  
  // Detalle de la falta
  tipoFalta: '',
  fechaHecho: '',
  descripcionDetallada: '',
  normaInfringida: '',
  
  // Sanción aplicada
  tipoSancion: '',
  montoMulta: '',
  observacionesRRHH: '',
  
  // Derecho a descargos
  plazoDescargos: '',
  descargosTrabajador: '',
});

// Computed para validar formulario
const formularioValido = computed(() => {
  return (
    formulario.value.nombreTrabajador &&
    formulario.value.rutTrabajador &&
    formulario.value.tipoFalta &&
    formulario.value.fechaHecho &&
    formulario.value.descripcionDetallada &&
    formulario.value.tipoSancion &&
    formulario.value.plazoDescargos
  );
});

// Watch para cargar datos del trabajador cuando se abre el modal
watch(() => props.trabajador, (nuevoTrabajador) => {
  console.log('👀 props.trabajador cambiado:', nuevoTrabajador);

  if (nuevoTrabajador) {
    // Nombre completo del trabajador
    const nombreCompleto = [
      nuevoTrabajador.usuario_nombre,
      nuevoTrabajador.usuario_apellido_pat,
      nuevoTrabajador.usuario_apellido_mat
    ].filter(Boolean).join(' ');
    
    formulario.value.nombreTrabajador = nombreCompleto;
    formulario.value.rutTrabajador = nuevoTrabajador.usuario_rut || '';
    formulario.value.emailTrabajador = nuevoTrabajador.usuario_email || '';
    formulario.value.cargo = nuevoTrabajador.rol_en_empresa || 'trabajador';
    
    // Empresas
    formulario.value.empresaAsignada = nuevoTrabajador.empresa_asignada_nombre || '';
    formulario.value.empresaEmpleadoraRut = nuevoTrabajador.empresa_empleadora_rut || '';
    
    // Limpiar supervisor (campo editable)
    formulario.value.supervisorResponsable = '';
    
    // Establecer fecha actual como fecha del hecho por defecto
    const hoy = new Date().toISOString().split('T')[0];
    formulario.value.fechaHecho = hoy;
    
    // Establecer plazo de descargos (3 días hábiles por defecto)
    const fechaPlazo = new Date();
    fechaPlazo.setDate(fechaPlazo.getDate() + 3);
    formulario.value.plazoDescargos = fechaPlazo.toISOString().split('T')[0];
    
    console.log('✅ Formulario actualizado con datos del trabajador:', formulario.value);
  }
}, { immediate: true });

// Métodos
const cerrarModal = () => {
  if (!guardando.value) {
    limpiarFormulario();
    emit('close');
  }
};

const limpiarFormulario = () => {
  formulario.value = {
    nombreTrabajador: '',
    rutTrabajador: '',
    emailTrabajador: '',
    cargo: '',
    empresaAsignada: '',
    empresaEmpleadoraRut: '',
    supervisorResponsable: '',
    tipoFalta: '',
    fechaHecho: '',
    descripcionDetallada: '',
    normaInfringida: '',
    tipoSancion: '',
    montoMulta: '',
    observacionesRRHH: '',
    plazoDescargos: '',
    descargosTrabajador: '',
  };
  archivosSeleccionados.value = [];
};

const manejarArchivos = (event) => {
  const archivos = Array.from(event.target.files);
  archivosSeleccionados.value = [...archivosSeleccionados.value, ...archivos];
};

const eliminarArchivo = (index) => {
  archivosSeleccionados.value.splice(index, 1);
};

const formatearTamano = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const guardarAmonestacion = async () => {
  if (!formularioValido.value) {
    showWarning('Por favor complete todos los campos obligatorios');
    return;
  }

  guardando.value = true;

  try {
    console.log('📝 Guardando amonestación:', {
      trabajadorId: props.trabajador.id,
      formulario: formulario.value,
      archivos: archivosSeleccionados.value.map(a => a.name)
    });

    // Preparar datos para enviar al backend
    const amonestacionData = {
      trabajadorId: props.trabajador.id,
      usuarioId: props.trabajador.usuario_id,
      empresaId: props.trabajador.empresa_id,
      
      // Datos del trabajador
      nombreTrabajador: formulario.value.nombreTrabajador,
      rutTrabajador: formulario.value.rutTrabajador,
      emailTrabajador: formulario.value.emailTrabajador,
      cargo: formulario.value.cargo,
      empresaAsignada: formulario.value.empresaAsignada,
      empresaEmpleadoraRut: formulario.value.empresaEmpleadoraRut,
      supervisorResponsable: formulario.value.supervisorResponsable,
      
      // Detalle de la falta
      tipoFalta: formulario.value.tipoFalta,
      fechaHecho: formulario.value.fechaHecho,
      descripcionDetallada: formulario.value.descripcionDetallada,
      normaInfringida: formulario.value.normaInfringida,
      
      // Sanción aplicada
      tipoSancion: formulario.value.tipoSancion,
      montoMulta: formulario.value.montoMulta || null,
      observacionesRRHH: formulario.value.observacionesRRHH,
      
      // Derecho a descargos
      plazoDescargos: formulario.value.plazoDescargos,
      descargosTrabajador: formulario.value.descargosTrabajador,
      
      // Archivos adjuntos (por ahora solo nombres, después se implementará upload)
      archivosAdjuntos: archivosSeleccionados.value.map(a => a.name)
    };

    // Llamar al servicio para guardar la amonestación
    const response = await agregarAmonestacion(amonestacionData);
    console.log('✅ Respuesta del backend al guardar amonestación:', response);
    if (response.success) {
      guardando.value = false; // Establecer antes de cerrar el modal
      showSuccess('Amonestación registrada exitosamente');
      emit('success', {
        trabajadorId: props.trabajador.id,
        amonestacionId: response.data?.id,
        ...formulario.value
      });
      cerrarModal();
    } else {
      showError(response.message || 'Error al registrar la amonestación');
    }

  } catch (error) {
    console.error('❌ Error guardando amonestación:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error al registrar la amonestación';
    showError(errorMessage);
  } finally {
    guardando.value = false;
  }
};
</script>
