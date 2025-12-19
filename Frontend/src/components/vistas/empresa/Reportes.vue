<template>
  <div class="min-h-screen bg-gray-100">


    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Reportes del Sistema</h1>
            <p class="text-gray-600 mt-2">Visualización y exportación de reportes en PDF, Excel y Word</p>
          </div>
          <div class="flex space-x-3">
            <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
            @click="irExportarDatos"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 16v-6m0 0l-3 3m3-3l3 3"></path>
                </svg>
              <span>Traspasar datos</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Panel de Resumen -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Resumen de Reportes - Hoy</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{{ resumenHoy.reportesGenerados }}</div>
                <div class="text-sm text-gray-500">Reportes Generados</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">{{ resumenHoy.enviadosEmail }}</div>
                <div class="text-sm text-gray-500">Enviados por Email</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">{{ resumenHoy.trabajadoresIncluidos }}</div>
                <div class="text-sm text-gray-500">Trabajadores Incluidos</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">{{ resumenHoy.marcacionesProcesadas }}</div>
                <div class="text-sm text-gray-500">Marcaciones Procesadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tipos de Reportes Disponibles -->
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          <!-- Reporte de Asistencia -->
          <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Reporte de Asistencia</h3>
                  <p class="text-sm text-gray-500">Control diario de presencia</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Registro completo de asistencia por trabajador, incluye ausencias, tardanzas y salidas anticipadas.
              </p>
              <div class="flex space-x-2">
                <button @click="irReporteAsistencia" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Generar
                </button>
                <button @click="irReporteAsistencia" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Vista Previa
                </button>
              </div>
            </div>
          </div>

          <!-- Reporte de Jornada Diaria -->
          <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Jornada Diaria</h3>
                  <p class="text-sm text-gray-500">Horas trabajadas por día</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Cálculo de horas efectivas trabajadas, horas extras y tiempo de descansos.
              </p>
              <div class="flex space-x-2">
                <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Generar
                </button>
                <button @click="irReporteJornadaDiaria" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Vista Previa
                </button>
              </div>
            </div>
          </div>

          <!-- Reporte de Domingos/Festivos -->
          <div v-if="isAdmin" class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Domingos/Festivos</h3>
                  <p class="text-sm text-gray-500">Trabajo en días especiales</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Registro de trabajo realizado en domingos y días festivos con cálculo de recargos.
              </p>
              <div class="flex space-x-2">
                <button @click="irReporteDomingosFestivos" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Generar
                </button>
                <button @click="irReporteDomingosFestivos" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Vista Previa
                </button>
              </div>
            </div>
          </div>

          <!-- Reporte de Modificaciones -->
          <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Modificaciones</h3>
                  <p class="text-sm text-gray-500">Cambios de turnos y marcaciones</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Historial completo de modificaciones realizadas en turnos y marcaciones con trazabilidad.
              </p>
              <div class="flex space-x-2">
                <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Generar
                </button>
                <button class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Vista Previa
                </button>
              </div>
            </div>
            
          </div>

          <!-- Reporte de Incidentes -->
          <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Incidentes Técnicos</h3>
                  <p class="text-sm text-gray-500">Problemas del sistema</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Registro de incidentes técnicos, fallos de sistema y problemas de conectividad.
              </p>
              <div class="flex space-x-2">
                <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Generar
                </button>
                <button class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Vista Previa
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Configuración de Reportes -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Configuración de Reportes</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Rango de Fechas -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <div class="space-y-2">
                  <input
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Fecha inicio"
                  />
                  <input
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Fecha fin"
                  />
                </div>
              </div>

              <!-- Formato de Exportación -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Formato de Exportación</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked />
                    <span class="ml-2 text-sm text-gray-700">PDF</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked />
                    <span class="ml-2 text-sm text-gray-700">Excel</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">Word</span>
                  </label>
                </div>
              </div>

              <!-- Filtros -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Filtros</label>
                <div class="space-y-2">
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Todos los departamentos</option>
                    <option v-for="departamento in departamentos" :key="departamento.id" :value="departamento.id">
                      {{ departamento.nombre }}
                    </option>
                  </select>
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Todos los turnos</option>
                    <option v-for="turno in turnos" :key="turno.id" :value="turno.id">
                      {{ turno.nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de Reportes -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Historial de Reportes Generados</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Reporte</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generado por</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="reporte in historialReportes" :key="reporte.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <svg class="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span class="text-sm font-medium text-gray-900">
                        {{ reporte.tipo }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ reporte.periodo }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ reporte.generadoPor }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ reporte.fechaGeneracion }}<br />
                    {{ reporte.horaGeneracion }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex space-x-1">
                      <span v-for="formato in reporte.formatos" :key="formato" 
                            :class="getFormatoClass(formato)"
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ formato.toUpperCase() }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getEstadoClass(reporte.estado)"
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ reporte.estado }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button class="text-blue-600 hover:text-blue-900">Descargar</button>
                      <button class="text-green-600 hover:text-green-900">Enviar</button>
                      <button class="text-indigo-600 hover:text-indigo-900">Ver</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import HeaderAdmin from '../../components/headerEmpresa.vue';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';

const router = useRouter();

// Auth / roles
const { hasRole } = useAuth();
const isAdmin = computed(() => hasRole('admin'));

// Estados reactivos
const reportes = ref([]);
const configuracion = ref({
  fechaInicio: '',
  fechaFin: '',
  formatos: ['pdf', 'excel'],
  departamento: '',
  turno: ''
});

// Resumen de reportes del día actual
// Debe recibir: { reportesGenerados: number, enviadosEmail: number, trabajadoresIncluidos: number, marcacionesProcesadas: number }
const resumenHoy = ref({
  reportesGenerados: 0,    // Número total de reportes generados hoy
  enviadosEmail: 0,        // Número de reportes enviados por email hoy
  trabajadoresIncluidos: 0, // Número total de trabajadores incluidos en reportes
  marcacionesProcesadas: 0  // Número total de marcaciones procesadas
});

// Lista de departamentos para filtros
// Debe recibir: [{ id: string|number, nombre: string }]
const departamentos = ref([]);

// Lista de turnos para filtros  
// Debe recibir: [{ id: string|number, nombre: string }]
const turnos = ref([]);

// Historial de reportes generados
// Debe recibir: [{ id: string|number, tipo: string, periodo: string, generadoPor: string, fechaGeneracion: string, horaGeneracion: string, formatos: string[], estado: string }]
const historialReportes = ref([]);

// Función para ir a la vista de Marcaciones Diarias (vista completa, no modal)
const irReporteMarcacionesDiarias = () => { router.push({ name: 'EmpresaReporteMarcacionesDiarias' }); };

// Funciones auxiliares para clases CSS
const getFormatoClass = (formato) => {
  const clases = {
    'pdf': 'bg-red-100 text-red-800',
    'excel': 'bg-green-100 text-green-800',
    'word': 'bg-blue-100 text-blue-800'
  };
  return clases[formato.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const getEstadoClass = (estado) => {
  const clases = {
    'completado': 'bg-green-100 text-green-800',
    'procesando': 'bg-yellow-100 text-yellow-800',
    'error': 'bg-red-100 text-red-800',
    'pendiente': 'bg-gray-100 text-gray-800'
  };
  return clases[estado.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Función para ir a la vista de Reporte de Asistencia
const irReporteAsistencia = () => {
  router.push({ name: 'EmpresaReporteAsistencia' });
};

// Función para ir a la vista de Reporte de Jornada Diaria
const irReporteJornadaDiaria = () => {
  router.push({ name: 'EmpresaReporteJornadaDiaria' });
};

// Función para ir a la vista de Reporte de Domingos/Festivos
const irReporteDomingosFestivos = () => {
  router.push({ name: 'EmpresaReporteDomingosFestivos' });
};

const irExportarDatos = () => {
  router.push({ name: 'EmpresaExportacionDatos' });
};

onMounted(() => {
  console.log('Vista Reportes cargada');
  // Aquí se deben cargar los datos desde el backend:
  // - cargarResumenHoy()
  // - cargarDepartamentos()
  // - cargarTurnos()
  // - cargarHistorialReportes()
});
</script>
