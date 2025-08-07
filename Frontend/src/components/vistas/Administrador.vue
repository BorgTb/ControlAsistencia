<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Dashboard Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Panel de Administración</h2>
          <p class="text-gray-600 mb-6">Gestione el sistema de control de asistencia de manera integral</p>
        </div>
      </div>

      <!-- Grid de Funcionalidades -->
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- 1. Gestión de Trabajadores -->
          <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Enrolamiento y Registro</dt>
                    <dd class="text-lg font-medium text-gray-900">Gestión de Trabajadores</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-600 mb-4">
                  Registre trabajadores, configure métodos de identificación (biometría, tarjeta, clave) y gestione correos electrónicos.
                </p>
                <div class="flex space-x-2">
                  <button class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Nuevo Trabajador
                  </button>
                  <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Ver Lista
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Control de Turnos -->
          <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Asignación y Modificación</dt>
                    <dd class="text-lg font-medium text-gray-900">Control de Turnos</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-600 mb-4">
                  Asigne, modifique y gestione turnos de trabajo. Registre fechas de asignación y cambios de turno.
                </p>
                <div class="flex space-x-2">
                  <button class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Asignar Turno
                  </button>
                  <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Ver Turnos
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Modificación de Marcaciones -->
          <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Con Consentimiento</dt>
                    <dd class="text-lg font-medium text-gray-900">Modificar Marcaciones</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-600 mb-4">
                  Agregue o modifique marcaciones cuando sea necesario, con registro de cambios y consentimiento del trabajador.
                </p>
                <div class="flex space-x-2">
                  <button class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Modificar
                  </button>
                  <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Historial
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Reportes y Exportación -->
          <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">PDF, Excel, Word</dt>
                    <dd class="text-lg font-medium text-gray-900">Reportes Completos</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-600 mb-4">
                  Visualice y exporte reportes en múltiples formatos. Reporte diario automático de marcaciones.
                </p>
                <div class="flex space-x-2">
                  <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Ver Reportes
                  </button>
                  <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Capacitación -->
          <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Antes del Uso</dt>
                    <dd class="text-lg font-medium text-gray-900">Capacitación</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-600 mb-4">
                  Capacite a los trabajadores en el uso del sistema antes de que empiecen a utilizarlo.
                </p>
                <div class="flex space-x-2">
                  <button class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Programar
                  </button>
                  <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Historial
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 6. Configuración del Sistema -->
          <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Reglamento Interno</dt>
                    <dd class="text-lg font-medium text-gray-900">Configuración</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-600 mb-4">
                  Configure el sistema y administre reglas del Reglamento Interno de Orden, Higiene y Seguridad.
                </p>
                <div class="flex space-x-2">
                  <button class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Configurar
                  </button>
                  <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Ver Reglas
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Sección de Estadísticas Rápidas -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Estadísticas del Sistema</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <!-- Total Trabajadores -->
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">245</div>
                <div class="text-sm text-gray-500">Total Trabajadores</div>
              </div>
              <!-- Activos Hoy -->
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">198</div>
                <div class="text-sm text-gray-500">Activos Hoy</div>
              </div>
              <!-- Marcaciones Hoy -->
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">1,247</div>
                <div class="text-sm text-gray-500">Marcaciones Hoy</div>
              </div>
              <!-- Incidentes -->
              <div class="text-center">
                <div class="text-3xl font-bold text-red-600">3</div>
                <div class="text-sm text-gray-500">Incidentes Técnicos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas y Notificaciones -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Alertas Recientes</h3>
          </div>
          <div class="p-6">
            <!-- Alerta de Fiscalizador -->
            <div class="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50">
              <svg class="flex-shrink-0 inline w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <span class="sr-only">Info</span>
              <div>
                <span class="font-medium">Acceso de Fiscalizador:</span> Un fiscalizador accedió al sistema a las 14:30 hrs.
              </div>
            </div>
            <!-- Alerta de Reportes -->
            <div class="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50">
              <svg class="flex-shrink-0 inline w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <span class="sr-only">Info</span>
              <div>
                <span class="font-medium">Reporte Diario Enviado:</span> Reporte de marcaciones diarias enviado correctamente.
              </div>
            </div>
            <!-- Alerta de Mantenimiento -->
            <div class="flex items-center p-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50">
              <svg class="flex-shrink-0 inline w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span class="sr-only">Warning</span>
              <div>
                <span class="font-medium">Mantenimiento Programado:</span> Respaldo del sistema programado para las 02:00 hrs.
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import HeaderAdmin from '../components/headerAdmin.vue';
import { ref, onMounted } from 'vue';

// Estados reactivos para la vista
const estadisticas = ref({
  totalTrabajadores: 245,
  activosHoy: 198,
  marcacionesHoy: 1247,
  incidentesTecnicos: 3
});

const alertas = ref([
  {
    tipo: 'info',
    titulo: 'Acceso de Fiscalizador',
    mensaje: 'Un fiscalizador accedió al sistema a las 14:30 hrs.',
    fecha: new Date()
  },
  {
    tipo: 'success',
    titulo: 'Reporte Diario Enviado',
    mensaje: 'Reporte de marcaciones diarias enviado correctamente.',
    fecha: new Date()
  },
  {
    tipo: 'warning',
    titulo: 'Mantenimiento Programado',
    mensaje: 'Respaldo del sistema programado para las 02:00 hrs.',
    fecha: new Date()
  }
]);

onMounted(() => {
  // Aquí puedes cargar datos iniciales del dashboard
  console.log('Dashboard de Administrador cargado');
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.transition-shadow {
  transition: box-shadow 0.2s ease-in-out;
}
</style>