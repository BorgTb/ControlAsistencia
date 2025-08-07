<template>
  <div class="min-h-screen bg-gray-100">


    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestión de Marcaciones</h1>
            <p class="text-gray-600 mt-2">Modificación y supervisión de registros de asistencia</p>
          </div>
          <div class="flex space-x-3">
            <button class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              <span>Modificar Marcación</span>
            </button>
            <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Agregar Marcación</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Panel de Estadísticas -->
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7l2 2 4-4"></path>
              </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Marcaciones Hoy</p>
                <p class="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Modificadas</p>
                <p class="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Agregadas</p>
                <p class="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Conflictos</p>
                <p class="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Pendientes</p>
                <p class="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <!-- Búsqueda -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Trabajador</label>
              <div class="relative">
                <input
                  type="text"
                  placeholder="Nombre o RUT..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Fecha -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Tipo de Marcación -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="almuerzo_salida">Salida Almuerzo</option>
                <option value="almuerzo_entrada">Entrada Almuerzo</option>
              </select>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                <option value="normal">Normal</option>
                <option value="modificada">Modificada</option>
                <option value="agregada">Agregada</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <!-- Botón Filtrar -->
            <div class="flex items-end">
              <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Solicitudes Pendientes -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Solicitudes Pendientes de Aprobación</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <!-- Solicitud 1 -->
              <div class="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">Juan Pérez - Modificación de Entrada</h4>
                    <p class="text-sm text-gray-600">
                      Solicita modificar entrada del 07/08/2025 de 08:30 a 08:00
                    </p>
                    <p class="text-xs text-gray-500">Motivo: Problema con transporte público</p>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Aprobar
                  </button>
                  <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Rechazar
                  </button>
                  <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                    Ver Detalles
                  </button>
                </div>
              </div>

              <!-- Solicitud 2 -->
              <div class="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">María González - Agregar Marcación</h4>
                    <p class="text-sm text-gray-600">
                      Solicita agregar marcación de salida para el 06/08/2025 a las 17:00
                    </p>
                    <p class="text-xs text-gray-500">Motivo: Olvidó marcar al salir</p>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Aprobar
                  </button>
                  <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Rechazar
                  </button>
                  <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Marcaciones -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Registro de Marcaciones - Hoy</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modificado por</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Marcación Normal -->
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span class="text-white font-medium">JP</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">Juan Pérez</div>
                        <div class="text-sm text-gray-500">Administración</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    07/08/2025<br />
                    <span class="text-green-600 font-medium">08:00:15</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Entrada
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Biometría</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Normal
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button class="text-yellow-600 hover:text-yellow-900">Modificar</button>
                      <button class="text-indigo-600 hover:text-indigo-900">Ver</button>
                    </div>
                  </td>
                </tr>

                <!-- Marcación Modificada -->
                <tr class="hover:bg-gray-50 bg-yellow-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                          <span class="text-white font-medium">MG</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">María González</div>
                        <div class="text-sm text-gray-500">Ventas</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    07/08/2025<br />
                    <span class="text-red-600 line-through">08:25:30</span><br />
                    <span class="text-green-600 font-medium">08:00:00</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Entrada
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Tarjeta</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Modificada
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Admin<br />
                    <span class="text-xs">07/08 09:15</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button class="text-purple-600 hover:text-purple-900">Historial</button>
                      <button class="text-indigo-600 hover:text-indigo-900">Ver</button>
                    </div>
                  </td>
                </tr>

                <!-- Marcación Agregada -->
                <tr class="hover:bg-gray-50 bg-green-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                          <span class="text-white font-medium">CR</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">Carlos Rodríguez</div>
                        <div class="text-sm text-gray-500">Producción</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    06/08/2025<br />
                    <span class="text-green-600 font-medium">17:00:00</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Salida
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Manual</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Agregada
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Admin<br />
                    <span class="text-xs">07/08 08:30</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button class="text-yellow-600 hover:text-yellow-900">Modificar</button>
                      <button class="text-indigo-600 hover:text-indigo-900">Ver</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Anterior
              </button>
              <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Siguiente
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Mostrando <span class="font-medium">1</span> al <span class="font-medium">20</span> de{' '}
                  <span class="font-medium">1,247</span> marcaciones
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">Anterior</span>
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</button>
                  <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</button>
                  <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</button>
                  <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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
    </main>
  </div>
</template>

<script setup>
import HeaderAdmin from '../../components/headerAdmin.vue';
import { ref, onMounted } from 'vue';

// Estados reactivos
const marcaciones = ref([]);
const solicitudesPendientes = ref([]);

onMounted(() => {
  console.log('Vista Gestión de Marcaciones cargada');
});
</script>
