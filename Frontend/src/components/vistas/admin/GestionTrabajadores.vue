<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestión de Trabajadores</h1>
            <p class="text-gray-600 mt-2">Enrolamiento, registro y administración de trabajadores</p>
          </div>
          <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>Nuevo Trabajador</span>
          </button>
        </div>
      </div>

      <!-- Panel de Estadísticas -->
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Total Trabajadores</p>
                <p class="text-2xl font-bold text-gray-900">245</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Activos</p>
                <p class="text-2xl font-bold text-gray-900">198</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Pendientes</p>
                <p class="text-2xl font-bold text-gray-900">47</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Inactivos</p>
                <p class="text-2xl font-bold text-gray-900">15</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Búsqueda -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Trabajador</label>
              <div class="relative">
                <input
                  type="text"
                  placeholder="Nombre, RUT, email..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <!-- Departamento -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                <option value="admin">Administración</option>
                <option value="ventas">Ventas</option>
                <option value="produccion">Producción</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Trabajadores -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Lista de Trabajadores</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Ejemplo de fila -->
                <tr v-for="n in 10" :key="n" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span class="text-white font-medium">JD</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">Juan Pérez</div>
                        <div class="text-sm text-gray-500">juan.perez@empresa.com</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12.345.678-9</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Administración</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Activo
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex space-x-1">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Biometría</span>
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Tarjeta</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Hace 2 horas</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button class="text-indigo-600 hover:text-indigo-900">Editar</button>
                      <button class="text-green-600 hover:text-green-900">Biometría</button>
                      <button class="text-red-600 hover:text-red-900">Desactivar</button>
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
                  Mostrando <span class="font-medium">1</span> al <span class="font-medium">10</span> de{' '}
                  <span class="font-medium">245</span> resultados
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
const trabajadores = ref([]);
const filtros = ref({
  busqueda: '',
  estado: '',
  departamento: ''
});

onMounted(() => {
  console.log('Vista Gestión de Trabajadores cargada');
});
</script>
