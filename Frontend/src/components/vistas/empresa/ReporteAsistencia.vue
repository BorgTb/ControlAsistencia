<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Reporte de Asistencia Semanal</h1>
            <p class="text-gray-600 mt-2">
              Semana del {{ fechaInicio }} al {{ fechaFin }}
            </p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="volverReportes"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Volver a Reportes</span>
            </button>
            <button 
              @click="exportarReporte" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m2-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Barra de búsqueda y filtros -->
      <div class="px-4 pb-4 sm:px-0">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Búsqueda -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Trabajador</label>
              <div class="relative">
                <input
                  v-model="filtros.busqueda"
                  type="text"
                  placeholder="Nombre, RUT..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Filtro por estado de asistencia -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado Asistencia</label>
              <select v-model="filtros.asistencia" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">Todos</option>
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="justificada">Ausencia Justificada</option>
                <option value="injustificada">Ausencia Injustificada</option>
              </select>
            </div>

            <!-- Filtro por fecha específica -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Específica</label>
              <input 
                v-model="filtros.fecha" 
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Contenedor principal -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white rounded-lg shadow-xl">
          <!-- Loading State -->
          <div v-if="cargando" class="text-center py-16">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-lg text-gray-500">Cargando reporte...</p>
          </div>

          <!-- Contenido del Reporte -->
          <div v-else class="p-6">
            <!-- Sin trabajadores -->
            <div v-if="trabajadoresFiltrados.length === 0" class="text-center py-16">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <p class="mt-4 text-xl font-medium text-gray-500">No hay trabajadores para mostrar</p>
              <p class="mt-2 text-gray-400">No se encontraron datos de asistencia para el período seleccionado</p>
            </div>

            <!-- Tabla de Asistencia -->
            <div v-else>
              <!-- Resumen general -->
              <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                  <div class="text-2xl font-bold text-blue-600">{{ trabajadoresFiltrados.length }}</div>
                  <div class="text-xs text-blue-700 font-medium mt-1">Total Trabajadores</div>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <div class="text-2xl font-bold text-green-600">{{ totalPresentes }}</div>
                  <div class="text-xs text-green-700 font-medium mt-1">Total Presentes</div>
                </div>
                <div class="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                  <div class="text-2xl font-bold text-yellow-600">{{ totalAusenciasJustificadas }}</div>
                  <div class="text-xs text-yellow-700 font-medium mt-1">Ausencias Justificadas</div>
                </div>
                <div class="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                  <div class="text-2xl font-bold text-red-600">{{ totalAusenciasInjustificadas }}</div>
                  <div class="text-xs text-red-700 font-medium mt-1">Ausencias Injustificadas</div>
                </div>
              </div>

              <!-- Tabla compacta de asistencia -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Días Presente</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ausencias Justif.</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ausencias Injustif.</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Asistencia</th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <template v-for="trabajador in trabajadoresPaginados" :key="trabajador.id">
                      <!-- Fila principal -->
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-8 w-8">
                              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-xs font-medium text-blue-600">{{ trabajador.iniciales }}</span>
                              </div>
                            </div>
                            <div class="ml-3">
                              <div class="text-sm font-medium text-gray-900">{{ trabajador.nombre_completo }}</div>
                              <div class="text-xs text-gray-500">{{ trabajador.rut }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-center">
                          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {{ trabajador.dias_presente }}
                          </span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-center">
                          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            {{ trabajador.ausencias_justificadas }}
                          </span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-center">
                          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            {{ trabajador.ausencias_injustificadas }}
                          </span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-center">
                          <div class="flex flex-col items-center">
                            <span 
                              class="text-lg font-bold" 
                              :class="obtenerColorPorcentaje(trabajador.porcentaje_asistencia)"
                            >
                              {{ trabajador.porcentaje_asistencia }}%
                            </span>
                            <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                class="h-1.5 rounded-full transition-all duration-300"
                                :class="obtenerColorBarraPorcentaje(trabajador.porcentaje_asistencia)"
                                :style="{ width: trabajador.porcentaje_asistencia + '%' }"
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            @click="toggleDetalle(trabajador.id)"
                            class="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <span>{{ detalleExpandido[trabajador.id] ? 'Ocultar' : 'Ver Detalle' }}</span>
                            <svg 
                              class="ml-1 h-4 w-4 transition-transform duration-200" 
                              :class="{ 'rotate-180': detalleExpandido[trabajador.id] }"
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      
                      <!-- Fila de detalle expandible - REGISTRO DIARIO -->
                      <tr v-if="detalleExpandido[trabajador.id]" class="bg-gray-50">
                        <td colspan="6" class="px-4 py-4">
                          <div class="bg-white rounded-lg p-4 border border-gray-200">
                            <h6 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              Registro Diario de Asistencia
                            </h6>
                            
                            <div v-if="trabajador.asistencias && trabajador.asistencias.length > 0" class="space-y-3">
                              <div 
                                v-for="(dia, index) in trabajador.asistencias" 
                                :key="index"
                                class="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                :class="obtenerClaseDia(dia)"
                              >
                                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                                  <!-- Fecha -->
                                  <div>
                                    <div class="text-xs text-gray-500 mb-1">Fecha</div>
                                    <div class="text-sm font-semibold text-gray-900">{{ formatearFecha(dia.fecha) }}</div>
                                    <div class="text-xs text-gray-600">{{ dia.dia_semana }}</div>
                                  </div>
                                  
                                  <!-- Asistencia -->
                                  <div>
                                    <div class="text-xs text-gray-500 mb-1">Asistencia</div>
                                    <span 
                                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                      :class="dia.asistio ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                                    >
                                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path v-if="dia.asistio" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                        <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                      </svg>
                                      {{ dia.asistio ? 'Sí' : 'No' }}
                                    </span>
                                  </div>
                                  
                                  <!-- Tipo de Ausencia (solo si no asistió) -->
                                  <div v-if="!dia.asistio">
                                    <div class="text-xs text-gray-500 mb-1">Tipo Ausencia</div>
                                    <span 
                                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                      :class="dia.ausencia_justificada ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'"
                                    >
                                      {{ dia.ausencia_justificada ? 'Justificada' : 'Injustificada' }}
                                    </span>
                                  </div>
                                  <div v-else>
                                    <div class="text-xs text-gray-500 mb-1">Tipo Ausencia</div>
                                    <span class="text-xs text-gray-400">N/A</span>
                                  </div>
                                  
                                  <!-- Motivo/Observaciones -->
                                  <div class="md:col-span-2">
                                    <div class="text-xs text-gray-500 mb-1">Observaciones</div>
                                    <div class="text-sm text-gray-700">
                                      <div v-if="dia.motivo" class="flex items-start space-x-2">
                                        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" :class="obtenerColorIconoMotivo(dia.motivo_tipo)" fill="currentColor" viewBox="0 0 20 20">
                                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                                        </svg>
                                        <div>
                                          <span class="font-medium text-xs text-gray-600">{{ dia.motivo_tipo }}:</span>
                                          <span class="ml-1">{{ dia.motivo }}</span>
                                        </div>
                                      </div>
                                      <span v-else class="text-xs text-gray-400">Sin observaciones</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div v-else class="text-center py-8 text-gray-500">
                              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              <p class="mt-2 text-sm">Sin registros de asistencia</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

              <!-- Paginación -->
              <div class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div class="flex-1 flex justify-between sm:hidden">
                  <button 
                    @click="paginaActual--" 
                    :disabled="paginaActual === 1"
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button 
                    @click="paginaActual++" 
                    :disabled="paginaActual === totalPaginas"
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Mostrando 
                      <span class="font-medium">{{ indiceInicio + 1 }}</span> 
                      a 
                      <span class="font-medium">{{ Math.min(indiceFin, trabajadoresFiltrados.length) }}</span> 
                      de 
                      <span class="font-medium">{{ trabajadoresFiltrados.length }}</span> 
                      resultados
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <label class="text-sm text-gray-700">Por página:</label>
                    <select 
                      v-model="itemsPorPagina" 
                      class="px-2 py-1 border border-gray-300 rounded-md text-sm"
                      @change="paginaActual = 1"
                    >
                      <option :value="10">10</option>
                      <option :value="25">25</option>
                      <option :value="50">50</option>
                      <option :value="100">100</option>
                    </select>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px ml-4">
                      <button 
                        @click="paginaActual--" 
                        :disabled="paginaActual === 1"
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span class="sr-only">Anterior</span>
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {{ paginaActual }} / {{ totalPaginas }}
                      </span>
                      <button 
                        @click="paginaActual++" 
                        :disabled="paginaActual === totalPaginas"
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span class="sr-only">Siguiente</span>
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '../../../composables/useNotification.js';

const router = useRouter();
const { showSuccess, showError, showInfo } = useNotification();

// Estados reactivos
const cargando = ref(false);
const trabajadores = ref([]);
const detalleExpandido = ref({});

// Filtros
const filtros = ref({
  busqueda: '',
  asistencia: '',
  fecha: ''
});

// Paginación
const paginaActual = ref(1);
const itemsPorPagina = ref(10);

// Fechas de la semana actual
const fechaInicio = ref('');
const fechaFin = ref('');

// Computed - Trabajadores filtrados
const trabajadoresFiltrados = computed(() => {
  let resultado = trabajadores.value;

  // Filtro por búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase();
    resultado = resultado.filter(t => 
      t.nombre_completo.toLowerCase().includes(busqueda) ||
      t.rut.includes(busqueda)
    );
  }

  // Filtro por estado de asistencia
  if (filtros.value.asistencia) {
    switch (filtros.value.asistencia) {
      case 'presente':
        resultado = resultado.filter(t => t.dias_presente > 0);
        break;
      case 'ausente':
        resultado = resultado.filter(t => (t.ausencias_justificadas + t.ausencias_injustificadas) > 0);
        break;
      case 'justificada':
        resultado = resultado.filter(t => t.ausencias_justificadas > 0);
        break;
      case 'injustificada':
        resultado = resultado.filter(t => t.ausencias_injustificadas > 0);
        break;
    }
  }

  // Filtro por fecha específica
  if (filtros.value.fecha) {
    resultado = resultado.filter(t => {
      return t.asistencias.some(a => a.fecha === filtros.value.fecha);
    });
  }

  return resultado;
});

// Computed - Paginación
const totalPaginas = computed(() => {
  return Math.ceil(trabajadoresFiltrados.value.length / itemsPorPagina.value);
});

const indiceInicio = computed(() => {
  return (paginaActual.value - 1) * itemsPorPagina.value;
});

const indiceFin = computed(() => {
  return paginaActual.value * itemsPorPagina.value;
});

const trabajadoresPaginados = computed(() => {
  return trabajadoresFiltrados.value.slice(indiceInicio.value, indiceFin.value);
});

// Computed - Resúmenes
const totalPresentes = computed(() => {
  return trabajadoresFiltrados.value.reduce((total, t) => total + t.dias_presente, 0);
});

const totalAusenciasJustificadas = computed(() => {
  return trabajadoresFiltrados.value.reduce((total, t) => total + t.ausencias_justificadas, 0);
});

const totalAusenciasInjustificadas = computed(() => {
  return trabajadoresFiltrados.value.reduce((total, t) => total + t.ausencias_injustificadas, 0);
});

// Métodos auxiliares
const obtenerColorPorcentaje = (porcentaje) => {
  if (porcentaje >= 90) return 'text-green-600';
  if (porcentaje >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

const obtenerColorBarraPorcentaje = (porcentaje) => {
  if (porcentaje >= 90) return 'bg-green-500';
  if (porcentaje >= 75) return 'bg-yellow-500';
  return 'bg-red-500';
};

const obtenerClaseDia = (dia) => {
  if (dia.asistio) return 'bg-green-50 border-green-200';
  if (dia.ausencia_justificada) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
};

const obtenerColorIconoMotivo = (tipo) => {
  const colores = {
    'Licencia Médica': 'text-blue-500',
    'Vacaciones': 'text-purple-500',
    'Permiso': 'text-yellow-500',
    'Otro': 'text-gray-500'
  };
  return colores[tipo] || 'text-gray-500';
};

// Métodos
const volverReportes = () => {
  router.push({ name: 'EmpresaReportes' });
};

const toggleDetalle = (trabajadorId) => {
  detalleExpandido.value[trabajadorId] = !detalleExpandido.value[trabajadorId];
};

const cargarDatosReporte = async () => {
  console.log('Iniciando carga de datos del reporte de asistencia...');
  cargando.value = true;
  
  try {
    // Calcular fechas de la semana actual
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay());
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay() + 6);
    
    fechaInicio.value = primerDia.toLocaleDateString('es-CL');
    fechaFin.value = ultimoDia.toLocaleDateString('es-CL');
    
    console.log('Fechas calculadas:', fechaInicio.value, fechaFin.value);

    // Datos de ejemplo enfocados en ASISTENCIA
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    trabajadores.value = [
      {
        id: 1,
        nombre_completo: 'Juan Pérez González',
        rut: '12.345.678-9',
        iniciales: 'JP',
        dias_presente: 4,
        ausencias_justificadas: 1,
        ausencias_injustificadas: 0,
        porcentaje_asistencia: 80,
        asistencias: [
          {
            fecha: '2025-10-14',
            dia_semana: 'Lunes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-15',
            dia_semana: 'Martes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-16',
            dia_semana: 'Miércoles',
            asistio: false,
            ausencia_justificada: true,
            motivo: 'Consulta médica programada',
            motivo_tipo: 'Licencia Médica'
          },
          {
            fecha: '2025-10-17',
            dia_semana: 'Jueves',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-18',
            dia_semana: 'Viernes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          }
        ]
      },
      {
        id: 2,
        nombre_completo: 'María López Fernández',
        rut: '98.765.432-1',
        iniciales: 'ML',
        dias_presente: 5,
        ausencias_justificadas: 0,
        ausencias_injustificadas: 0,
        porcentaje_asistencia: 100,
        asistencias: [
          {
            fecha: '2025-10-14',
            dia_semana: 'Lunes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-15',
            dia_semana: 'Martes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-16',
            dia_semana: 'Miércoles',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-17',
            dia_semana: 'Jueves',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-18',
            dia_semana: 'Viernes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          }
        ]
      },
      {
        id: 3,
        nombre_completo: 'Carlos Rodríguez Silva',
        rut: '15.678.901-2',
        iniciales: 'CR',
        dias_presente: 2,
        ausencias_justificadas: 1,
        ausencias_injustificadas: 2,
        porcentaje_asistencia: 40,
        asistencias: [
          {
            fecha: '2025-10-14',
            dia_semana: 'Lunes',
            asistio: false,
            ausencia_justificada: false,
            motivo: 'Sin justificación presentada',
            motivo_tipo: 'Otro'
          },
          {
            fecha: '2025-10-15',
            dia_semana: 'Martes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-16',
            dia_semana: 'Miércoles',
            asistio: false,
            ausencia_justificada: true,
            motivo: 'Período de vacaciones',
            motivo_tipo: 'Vacaciones'
          },
          {
            fecha: '2025-10-17',
            dia_semana: 'Jueves',
            asistio: false,
            ausencia_justificada: false,
            motivo: 'Sin justificación presentada',
            motivo_tipo: 'Otro'
          },
          {
            fecha: '2025-10-18',
            dia_semana: 'Viernes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          }
        ]
      },
      {
        id: 4,
        nombre_completo: 'Ana Martínez Torres',
        rut: '16.234.567-8',
        iniciales: 'AM',
        dias_presente: 4,
        ausencias_justificadas: 1,
        ausencias_injustificadas: 0,
        porcentaje_asistencia: 80,
        asistencias: [
          {
            fecha: '2025-10-14',
            dia_semana: 'Lunes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-15',
            dia_semana: 'Martes',
            asistio: false,
            ausencia_justificada: true,
            motivo: 'Permiso administrativo aprobado',
            motivo_tipo: 'Permiso'
          },
          {
            fecha: '2025-10-16',
            dia_semana: 'Miércoles',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-17',
            dia_semana: 'Jueves',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          },
          {
            fecha: '2025-10-18',
            dia_semana: 'Viernes',
            asistio: true,
            ausencia_justificada: null,
            motivo: null,
            motivo_tipo: null
          }
        ]
      }
    ];
    
    console.log('Datos cargados:', trabajadores.value);

  } catch (error) {
    console.error('Error cargando reporte:', error);
    showError('Error al cargar el reporte de asistencia');
  } finally {
    cargando.value = false;
  }
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

const exportarReporte = () => {
  showInfo('Exportando reporte a PDF...');
  console.log('Exportando reporte:', { trabajadores: trabajadores.value });
};

onMounted(() => {
  console.log('Vista de Reporte de Asistencia montada');
  cargarDatosReporte();
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
