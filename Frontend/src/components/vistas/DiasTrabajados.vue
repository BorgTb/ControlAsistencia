<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Calendario de Asistencia</h1>
        <p class="mt-2 text-sm text-gray-600">
          Revisa tu historial de asistencia y marcaciones
        </p>
      </div>

      <!-- Tarjeta de estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Días Trabajados
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.trabajados }}
            </dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
              Días Libres
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.libres }}
            </dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              Ausencias
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.ausentes }}
            </dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Incidentes
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estadisticasMes.incidentes }}
            </dd>
          </div>
        </div>
      </div>

      <!-- Calendario -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Header del calendario -->
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <button 
              @click="cambiarMes('anterior')"
              class="text-white hover:bg-indigo-500 rounded-full p-2 transition-colors duration-200"
              :disabled="isLoading"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <div class="text-center">
              <h2 class="text-2xl font-bold text-white">
                {{ nombreMes }} {{ anioActual }}
              </h2>
              <button 
                @click="irMesActual"
                class="text-sm text-indigo-100 hover:text-white mt-1 transition-colors duration-200"
                :disabled="isLoading"
              >
                Ir al mes actual
              </button>
            </div>

            <button 
              @click="cambiarMes('siguiente')"
              class="text-white hover:bg-indigo-500 rounded-full p-2 transition-colors duration-200"
              :disabled="isLoading"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Días de la semana -->
        <div class="grid grid-cols-7 gap-px bg-gray-200">
          <div 
            v-for="dia in ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']" 
            :key="dia"
            class="bg-gray-50 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
          >
            {{ dia }}
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-gray-600">Cargando calendario...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="mt-4 text-red-600">{{ error }}</p>
          <button 
            @click="recargarCalendario"
            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>

        <!-- Grid del calendario -->
        <div v-else class="grid grid-cols-7 gap-px bg-gray-200">
          <div 
            v-for="(dia, index) in diasCalendario" 
            :key="index"
            class="bg-white min-h-24 p-2 relative transition-all duration-200 hover:shadow-lg"
            :class="[
              !dia.esMesActual && 'bg-gray-50',
              dia.esHoy && 'ring-2 ring-indigo-500 ring-inset'
            ]"
          >
            <!-- Día vacío -->
            <div v-if="!dia.esMesActual" class="h-full"></div>

            <!-- Día del mes -->
            <div v-else class="h-full flex flex-col">
              <!-- Número del día -->
              <div class="flex justify-between items-start mb-1">
                <span 
                  class="text-sm font-semibold"
                  :class="[
                    dia.esHoy ? 'bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-700',
                    !dia.estado && 'text-gray-400'
                  ]"
                >
                  {{ dia.dia }}
                </span>
                
                <!-- Icono de estado -->
                <span 
                  v-if="dia.estado"
                  class="text-lg font-bold"
                  :class="getEstadoColorTexto(dia.estado)"
                >
                  {{ getEstadoIcono(dia.estado) }}
                </span>
              </div>

              <!-- Badge de estado -->
              <div v-if="dia.estado" class="mt-auto">
                <span 
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                  :class="getEstadoColor(dia.estado)"
                >
                  {{ formatearEstado(dia.estado) }}
                </span>

                <!-- Horas si está trabajado -->
                <div v-if="dia.horaEntrada && dia.estado === 'trabajado'" class="mt-1 text-xs text-gray-600">
                  <div class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14"/>
                    </svg>
                    {{ dia.horaEntrada }}
                  </div>
                  <div v-if="dia.horaSalida" class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                    {{ dia.horaSalida }}
                  </div>
                </div>

                <!-- Indicador de incidente -->
                <div v-if="dia.incidente" class="mt-1">
                  <button 
                    @click="mostrarDetalleIncidente(dia)"
                    class="text-xs text-yellow-700 hover:text-yellow-900 underline"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="mt-8 bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Leyenda</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-green-100 border-green-300 flex items-center justify-center text-green-800 font-bold text-xl">
              ✓
            </div>
            <div>
              <div class="font-medium text-gray-900">Trabajado</div>
              <div class="text-xs text-gray-500">Marcaciones completas</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-blue-100 border-blue-300 flex items-center justify-center text-blue-800 font-bold text-xl">
              ○
            </div>
            <div>
              <div class="font-medium text-gray-900">Libre</div>
              <div class="text-xs text-gray-500">Día de descanso</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-red-100 border-red-300 flex items-center justify-center text-red-800 font-bold text-xl">
              ✗
            </div>
            <div>
              <div class="font-medium text-gray-900">Ausente</div>
              <div class="text-xs text-gray-500">Sin marcaciones</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded border-2 bg-yellow-100 border-yellow-300 flex items-center justify-center text-yellow-800 font-bold text-xl">
              ⚠
            </div>
            <div>
              <div class="font-medium text-gray-900">Incidente</div>
              <div class="text-xs text-gray-500">Marcación incompleta</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalle de incidente -->
    <div 
      v-if="incidenteSeleccionado" 
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="cerrarDetalleIncidente"
    >
      <div 
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 flex items-center">
              <svg class="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Detalle de Incidente
            </h3>
            <button 
              @click="cerrarDetalleIncidente"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatearFecha(incidenteSeleccionado.fecha) }}</p>
            </div>

            <div v-if="incidenteSeleccionado.horaEntrada">
              <label class="block text-sm font-medium text-gray-700">Hora de Entrada</label>
              <p class="mt-1 text-sm text-gray-900">{{ incidenteSeleccionado.horaEntrada }}</p>
            </div>

            <div v-if="incidenteSeleccionado.horaSalida">
              <label class="block text-sm font-medium text-gray-700">Hora de Salida</label>
              <p class="mt-1 text-sm text-gray-900">{{ incidenteSeleccionado.horaSalida }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Tipo de Incidente</label>
              <p class="mt-1 text-sm text-red-600 font-medium">{{ incidenteSeleccionado.incidente }}</p>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="cerrarDetalleIncidente"
              class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useDiasTrabajados } from '../../composables/useDiasTrabajados';

// Composable
const {
  isLoading,
  error,
  mesActual,
  anioActual,
  nombreMes,
  diasCalendario,
  estadisticasMes,
  fetchDiasTrabajados,
  cambiarMes,
  irMesActual,
  getEstadoColor,
  getEstadoIcono
} = useDiasTrabajados();

// Estado local
const incidenteSeleccionado = ref(null);

// ID del usuario (hardcodeado por ahora)
const userId = ref(1);

// Cargar calendario al montar
onMounted(() => {
  cargarCalendario();
});

// Recargar cuando cambie el mes o año
watch([mesActual, anioActual], () => {
  cargarCalendario();
});

// Funciones
const cargarCalendario = async () => {
  await fetchDiasTrabajados(userId.value, mesActual.value, anioActual.value);
};

const recargarCalendario = () => {
  cargarCalendario();
};

const mostrarDetalleIncidente = (dia) => {
  incidenteSeleccionado.value = dia;
};

const cerrarDetalleIncidente = () => {
  incidenteSeleccionado.value = null;
};

const formatearEstado = (estado) => {
  const estados = {
    'trabajado': 'Trabajado',
    'libre': 'Libre',
    'ausente': 'Ausente',
    'incidente': 'Incidente'
  };
  return estados[estado] || estado;
};

const getEstadoColorTexto = (estado) => {
  const colores = {
    'trabajado': 'text-green-600',
    'libre': 'text-blue-600',
    'ausente': 'text-red-600',
    'incidente': 'text-yellow-600'
  };
  return colores[estado] || 'text-gray-600';
};

const formatearFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split('-');
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${dia} de ${meses[parseInt(mes) - 1]} de ${anio}`;
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.min-h-24 {
  min-height: 6rem;
}
</style>
