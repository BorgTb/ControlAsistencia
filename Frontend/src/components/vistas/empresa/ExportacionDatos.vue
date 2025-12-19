<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Exportación de Datos</h2>
        <p class="text-gray-600">Configure el período y formato para exportar los datos de asistencia</p>
      </div>

      <!-- Card Principal -->
      <div class="bg-white rounded-xl shadow-lg p-8 space-y-8">
        
        <!-- Paso 1: Selección de Período -->
        <div class="border-b pb-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
            Seleccionar Período
          </h3>
          
          <div class="space-y-4">
            <!-- Selector de tipo de período -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de período</label>
              <div class="flex gap-4">
                <label class="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="tipoPeriodo" 
                    value="mes" 
                    class="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span class="text-gray-700">Por mes</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="tipoPeriodo" 
                    value="rango" 
                    class="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span class="text-gray-700">Rango de fechas</span>
                </label>
              </div>
            </div>

            <!-- Selector de mes -->
            <div v-if="tipoPeriodo === 'mes'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                <select 
                  v-model="mesSeleccionado" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un mes</option>
                  <option v-for="(mes, index) in meses" :key="index" :value="index + 1">
                    {{ mes }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <select 
                  v-model="añoSeleccionado" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="año in años" :key="año" :value="año">{{ año }}</option>
                </select>
              </div>
            </div>

            <!-- Selector de rango de fechas -->
            <div v-if="tipoPeriodo === 'rango'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha inicio</label>
                <input 
                  type="date" 
                  v-model="fechaInicio" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha fin</label>
                <input 
                  type="date" 
                  v-model="fechaFin" 
                  :min="fechaInicio"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Paso 2: Selección de Formato -->
        <div class="border-b pb-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
            Seleccionar Formato de Exportación
          </h3>
          
          <div class="space-y-3">
            <!-- Opción CSV -->
            <div 
              @click="formatoSeleccionado = 'csv'"
              :class="[
                'flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                formatoSeleccionado === 'csv' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              ]"
            >
              <div class="flex items-center">
                <div :class="[
                  'w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center',
                  formatoSeleccionado === 'csv' ? 'border-blue-600' : 'border-gray-300'
                ]">
                  <div v-if="formatoSeleccionado === 'csv'" class="w-3 h-3 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-gray-800">Exportar a CSV</h4>
                  <p class="text-sm text-gray-500">Formato compatible con hojas de cálculo y bases de datos</p>
                </div>
              </div>
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <!-- Opción Excel -->
            <div 
              @click="formatoSeleccionado = 'excel'"
              :class="[
                'flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                formatoSeleccionado === 'excel' 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
              ]"
            >
              <div class="flex items-center">
                <div :class="[
                  'w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center',
                  formatoSeleccionado === 'excel' ? 'border-green-600' : 'border-gray-300'
                ]">
                  <div v-if="formatoSeleccionado === 'excel'" class="w-3 h-3 rounded-full bg-green-600"></div>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-gray-800">Exportar a Excel</h4>
                  <p class="text-sm text-gray-500">Formato Excel con formato y fórmulas avanzadas</p>
                </div>
              </div>
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <!-- Opción Telegestor -->
            <div 
              @click="formatoSeleccionado = 'telegestor'"
              :class="[
                'flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                formatoSeleccionado === 'telegestor' 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
              ]"
            >
              <div class="flex items-center">
                <div :class="[
                  'w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center',
                  formatoSeleccionado === 'telegestor' ? 'border-purple-600' : 'border-gray-300'
                ]">
                  <div v-if="formatoSeleccionado === 'telegestor'" class="w-3 h-3 rounded-full bg-purple-600"></div>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-gray-800">Enviar a Telegestor</h4>
                  <p class="text-sm text-gray-500">Sincronizar datos con el sistema Telegestor</p>
                </div>
              </div>
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Botón de Exportación -->
        <div class="flex justify-end">
          <button 
            @click="procesarExportacion"
            :disabled="!puedeExportar || exportando"
            :class="[
              'px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2',
              puedeExportar && !exportando
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105' 
                : 'bg-gray-400 cursor-not-allowed'
            ]"
          >
            <svg v-if="exportando" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ exportando ? 'Exportando...' : 'Exportar Datos' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Alertas de Telegestor -->
    <transition name="fade">
      <div 
        v-if="mostrarModalTelegestor" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="cerrarModalTelegestor"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <!-- Header del Modal -->
          <div class="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 class="text-2xl font-bold">Días con Turnos Incompletos</h3>
              </div>
              <button 
                @click="cerrarModalTelegestor"
                class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="mt-2 text-orange-100">
              Se encontraron {{ diasIncompletos.length }} día(s) que requieren justificación antes de enviar a Telegestor
            </p>
          </div>

          <!-- Contenido del Modal -->
          <div class="p-6 overflow-y-auto max-h-96">
            <div v-if="cargandoValidacion" class="text-center py-12">
              <svg class="animate-spin h-12 w-12 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="mt-4 text-gray-600">Validando datos...</p>
            </div>

            <div v-else-if="diasIncompletos.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="mt-4 text-gray-600 font-medium">¡Todos los días tienen turnos completos!</p>
              <p class="text-sm text-gray-500 mt-2">Puede proceder con la exportación a Telegestor</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="(dia, index) in diasIncompletos" 
                :key="index"
                class="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-md transition"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 mt-1">
                    <div class="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      {{ index + 1 }}
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="text-lg font-semibold text-gray-800">{{ formatearFecha(dia.fecha) }}</h4>
                      <span class="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        {{ dia.tipo }}
                      </span>
                    </div>
                    <div class="space-y-1">
                      <p class="text-sm text-gray-700">
                        <span class="font-medium">Empleado:</span> {{ dia.empleado }}
                      </p>
                      <p class="text-sm text-gray-700">
                        <span class="font-medium">Motivo:</span> {{ dia.motivo }}
                      </p>
                      <p v-if="dia.turnoEsperado" class="text-sm text-gray-700">
                        <span class="font-medium">Turno esperado:</span> {{ dia.turnoEsperado }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer del Modal -->
          <div class="bg-gray-50 p-6 flex justify-between items-center border-t">
            <div class="text-sm text-gray-600">
              <span class="font-semibold">Nota:</span> Es necesario justificar estos días antes de exportar
            </div>
            <div class="flex gap-3">
              <button 
                @click="cerrarModalTelegestor"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition"
              >
                Cancelar
              </button>
              <button 
                v-if="diasIncompletos.length === 0"
                @click="confirmarEnvioTelegestor"
                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                Continuar Exportación
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useNotification } from '@/composables/useNotification';
import axios from 'axios';

const { showSuccess, showError, showWarning } = useNotification();

// Estado del componente
const tipoPeriodo = ref('mes');
const mesSeleccionado = ref(new Date().getMonth() + 1);
const añoSeleccionado = ref(new Date().getFullYear());
const fechaInicio = ref('');
const fechaFin = ref('');
const formatoSeleccionado = ref('');
const exportando = ref(false);
const mostrarModalTelegestor = ref(false);
const cargandoValidacion = ref(false);
const diasIncompletos = ref([]);

// Datos para los selectores
const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const años = computed(() => {
  const añoActual = new Date().getFullYear();
  const años = [];
  for (let i = añoActual; i >= añoActual - 5; i--) {
    años.push(i);
  }
  return años;
});

// Validación para habilitar el botón de exportación
const puedeExportar = computed(() => {
  if (!formatoSeleccionado.value) return false;
  
  if (tipoPeriodo.value === 'mes') {
    return mesSeleccionado.value && añoSeleccionado.value;
  } else {
    return fechaInicio.value && fechaFin.value && fechaInicio.value <= fechaFin.value;
  }
});

// Función principal de exportación
async function procesarExportacion() {
  if (!puedeExportar.value) {
    showWarning('Por favor complete todos los campos requeridos');
    return;
  }

  // Si es Telegestor, primero validar días incompletos
  if (formatoSeleccionado.value === 'telegestor') {
    await validarDiasIncompletos();
  } else {
    await exportarDatos();
  }
}

// Validar días incompletos para Telegestor
async function validarDiasIncompletos() {
  mostrarModalTelegestor.value = true;
  cargandoValidacion.value = true;
  diasIncompletos.value = [];

  try {
    const periodo = obtenerPeriodo();
    const response = await axios.post('/api/exportacion/validar-telegestor', {
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      empresaId: sessionStorage.getItem('empresa_id')
    });

    diasIncompletos.value = response.data.diasIncompletos || [];

    if (diasIncompletos.value.length === 0) {
      showSuccess('Validación exitosa. Todos los turnos están completos.');
    }
  } catch (error) {
    console.error('Error al validar días incompletos:', error);
    showError('Error al validar los datos. ' + (error.response?.data?.message || error.message));
    cerrarModalTelegestor();
  } finally {
    cargandoValidacion.value = false;
  }
}

// Exportar datos según el formato seleccionado
async function exportarDatos() {
  exportando.value = true;

  try {
    const periodo = obtenerPeriodo();
    const empresaId = sessionStorage.getItem('empresa_id');

    let response;
    
    if (formatoSeleccionado.value === 'csv') {
      response = await axios.post('/api/exportacion/csv', {
        ...periodo,
        empresaId
      }, { responseType: 'blob' });
      
      descargarArchivo(response.data, `exportacion_${periodo.fechaInicio}_${periodo.fechaFin}.csv`, 'text/csv');
      
    } else if (formatoSeleccionado.value === 'excel') {
      response = await axios.post('/api/exportacion/excel', {
        ...periodo,
        empresaId
      }, { responseType: 'blob' });
      
      descargarArchivo(response.data, `exportacion_${periodo.fechaInicio}_${periodo.fechaFin}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    showSuccess('Exportación completada exitosamente');
    
  } catch (error) {
    console.error('Error al exportar datos:', error);
    showError('Error al exportar los datos. ' + (error.response?.data?.message || error.message));
  } finally {
    exportando.value = false;
  }
}

// Confirmar y enviar a Telegestor
async function confirmarEnvioTelegestor() {
  cerrarModalTelegestor();
  exportando.value = true;

  try {
    const periodo = obtenerPeriodo();
    const empresaId = sessionStorage.getItem('empresa_id');

    const response = await axios.post('/api/exportacion/telegestor', {
      ...periodo,
      empresaId
    });

    showSuccess('Datos enviados a Telegestor exitosamente');
    
  } catch (error) {
    console.error('Error al enviar a Telegestor:', error);
    showError('Error al enviar a Telegestor. ' + (error.response?.data?.message || error.message));
  } finally {
    exportando.value = false;
  }
}

// Obtener el período seleccionado
function obtenerPeriodo() {
  if (tipoPeriodo.value === 'mes') {
    const año = añoSeleccionado.value;
    const mes = mesSeleccionado.value.toString().padStart(2, '0');
    const ultimoDia = new Date(año, mesSeleccionado.value, 0).getDate();
    
    return {
      fechaInicio: `${año}-${mes}-01`,
      fechaFin: `${año}-${mes}-${ultimoDia}`
    };
  } else {
    return {
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value
    };
  }
}

// Descargar archivo
function descargarArchivo(blob, nombreArchivo, tipo) {
  const url = window.URL.createObjectURL(new Blob([blob], { type: tipo }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// Formatear fecha para mostrar
function formatearFecha(fecha) {
  const date = new Date(fecha);
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', opciones);
}

// Cerrar modal de Telegestor
function cerrarModalTelegestor() {
  mostrarModalTelegestor.value = false;
  diasIncompletos.value = [];
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>