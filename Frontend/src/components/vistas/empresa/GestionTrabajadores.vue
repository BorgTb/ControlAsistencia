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
          <button 
            @click="abrirModalNuevo"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>Nuevo Trabajador</span>
          </button>
        </div>
      </div>

      <!-- Panel de Estadísticas -->
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div 
            @click="abrirModalTotalTrabajadores" 
            class="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Total Trabajadores</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.total }}</p>
                <p class="text-xs text-blue-600 mt-1">Click para ver lista</p>
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
                <p class="text-sm font-medium text-gray-500">Enrolados</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.enrolados }}</p>
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
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.pendientes }}</p>
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
                <p class="text-sm font-medium text-gray-500">No Enrolados</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.noEnrolados }}</p>
              </div>
            </div>
          </div>

          <!-- Nueva tarjeta: Horas Excedidas -->
          <div class="bg-white p-6 rounded-lg shadow border-l-4" :class="estadisticas.horasExcedidas > 0 ? 'border-orange-500' : 'border-gray-300'">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8" :class="estadisticas.horasExcedidas > 0 ? 'text-orange-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-5">
                  <p class="text-sm font-medium text-gray-500">Horas Excedidas</p>
                  <p class="text-2xl font-bold" :class="estadisticas.horasExcedidas > 0 ? 'text-orange-600' : 'text-gray-900'">
                    {{ estadisticas.horasExcedidas }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">Exceden límite asignado</p>
                </div>
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
                  v-model="filtros.busqueda"
                  type="text"
                  placeholder="Nombre, RUT, email..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Filtro por horas -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Filtro de Horas</label>
              <select v-model="filtros.tipoHoras" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todas las horas</option>
                <option value="normales">Horas normales (dentro de límite)</option>
                <option value="excedidas">Horas excedidas (sobre límite)</option>
                <option value="20">20+ horas</option>
                <option value="30">30+ horas</option>
                <option value="40">40+ horas</option>
              </select>
            </div>

            <!-- Departamento -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <select v-model="filtros.departamento" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
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
            <!-- Indicador de carga -->
            <div v-if="cargando" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span class="ml-3 text-gray-600">Cargando trabajadores...</span>
            </div>

            <table v-else class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Usuario</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas Laborales</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Mensaje cuando no hay trabajadores -->
                <tr v-if="trabajadoresFiltrados.length === 0">
                  <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <p class="text-lg font-medium">No se encontraron trabajadores con rol "Trabajador"</p>
                      <p class="text-sm">{{ filtros.busqueda ? 'Intenta con otros términos de búsqueda o verifica que existan usuarios con rol trabajador' : 'No hay usuarios con rol trabajador registrados' }}</p>
                    </div>
                  </td>
                </tr>

                <!-- Lista de trabajadores -->
                <tr 
                  v-for="trabajador in trabajadoresFiltrados" 
                  :key="trabajador.id" 
                  :class="[
                    'hover:bg-gray-50 transition-colors duration-200',
                    excedeHorasAsignadas(trabajador) 
                      ? 'bg-red-50 border-l-4 border-red-500' 
                      : ''
                  ]"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex px-3 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-800">
                      ID: {{ trabajador.id }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ trabajador.usuario_nombre }} {{ trabajador.usuario_apellido_pat }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ trabajador.usuario_rut }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ trabajador.usuario_email || 'Sin email' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span 
                      :class="[
                        'inline-flex items-center px-3 py-2 text-sm font-bold rounded-lg transition-all duration-300',
                        excedeHorasAsignadas(trabajador) 
                          ? 'text-white bg-red-600 border-2 border-red-700 shadow-lg' 
                          : 'text-gray-900 bg-gray-100'
                      ]"
                    >
                      {{ trabajador.horas_laborales || '45' }} hrs
                      <span v-if="excedeHorasAsignadas(trabajador)" class="ml-2 text-lg">🚨</span>
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(trabajador.ultimo_acceso) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="abrirModalDetalles(trabajador)" 
                      class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Detalles
                    </button>
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
                  Mostrando <span class="font-medium">{{ Math.min(1, trabajadoresFiltrados.length) }}</span> al <span class="font-medium">{{ trabajadoresFiltrados.length }}</span> de{' '}
                  <span class="font-medium">{{ trabajadoresFiltrados.length }}</span> resultados
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

    <!-- Modal Nuevo Trabajador -->
    <ModalNuevoTrabajador 
      :is-open="modalNuevoAbierto"
      @close="cerrarModalNuevo"
      @success="onTrabajadorCreado"
    />

    <!-- Modal Enrolar Trabajador -->
    <ModalEnrolarTrabajador 
      :is-open="modalEnrolarAbierto"
      :trabajador="trabajadorSeleccionado"
      @close="cerrarModalEnrolar"
      @success="onTrabajadorEnrolado"
    />

    <!-- Modal Lista Total de Trabajadores -->
    <div v-if="modalTotalTrabajadoresAbierto" class="fixed inset-0 bg-transparent overflow-y-auto h-full w-full z-50 flex items-center justify-center" @click="cerrarModalTotalTrabajadores">
      <div class="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
        <!-- Header del Modal -->
        <div class="flex justify-between items-center pb-4 border-b">
          <h3 class="text-xl font-bold text-gray-900">Lista Completa de Trabajadores</h3>
          <button @click="cerrarModalTotalTrabajadores" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="mt-4">
          <!-- Estadística rápida -->
          <div class="rounded-lg p-4 mb-4">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <div>
                <p class="text-lg font-semibold text-gray-800">Total: {{ estadisticas.total }} trabajadores</p>
                <p class="text-sm text-gray-600">Información básica de todos los trabajadores registrados</p>
              </div>
            </div>
          </div>

          <!-- Lista de trabajadores -->
          <div class="max-h-96 overflow-y-auto">
            <div v-if="cargando" class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span class="ml-3 text-gray-600">Cargando trabajadores...</span>
            </div>
            
            <div v-else-if="trabajadores.length === 0" class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <p class="text-lg font-medium">No hay trabajadores registrados</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="trabajador in trabajadores" 
                :key="trabajador.id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <!-- Avatar con iniciales -->
                      <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {{ (trabajador.usuario_nombre?.[0] || '') + (trabajador.usuario_apellido_pat?.[0] || '') }}
                      </div>
                      
                      <!-- Información del trabajador -->
                      <div class="flex-1">
                        <h4 class="text-sm font-semibold text-gray-900">
                          {{ trabajador.usuario_nombre }} {{ trabajador.usuario_apellido_pat }}
                        </h4>
                        <div class="text-xs text-gray-600 space-y-1">
                          <p><span class="font-medium">RUT:</span> {{ trabajador.usuario_rut }}</p>
                          <p><span class="font-medium">Email:</span> {{ trabajador.usuario_email || 'Sin email registrado' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Estado del trabajador -->
                  <div class="flex flex-col items-end space-y-1">
                    <span v-if="trabajador.tarjeta_asignada" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Enrolado
                    </span>
                    <span v-else class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Sin ID
                    </span>
                    
                    <!-- Horas laborales asignadas -->
                    <span 
                      class="text-xs px-2 py-1 rounded font-medium"
                      :class="excedeHorasAsignadas(trabajador) 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-700'"
                    >
                      {{ trabajador.horas_laborales || '45' }} hrs/sem
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="mt-6 pt-4 border-t flex justify-end">
          <button 
            @click="cerrarModalTotalTrabajadores"
            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded-md transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detalles del Trabajador -->
    <div v-if="modalDetallesAbierto" class="fixed inset-0 bg-transparent overflow-y-auto h-full w-full z-50 flex items-center justify-center" @click="cerrarModalDetalles">
      <div class="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto" @click.stop>
        <!-- Header del Modal -->
        <div class="flex justify-between items-center pb-4 border-b">
          <h3 class="text-xl font-bold text-gray-900">Detalles del Trabajador</h3>
          <button @click="cerrarModalDetalles" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="mt-6" v-if="trabajadorSeleccionado">
          <!-- Información Personal -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Información Personal
              </div>
              <span v-if="modoEdicion" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Modo Edición
              </span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                <input 
                  v-if="modoEdicion"
                  v-model="datosEdicion.nombre"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Nombre del trabajador"
                />
                <p v-else class="mt-1 text-sm text-gray-900">{{ trabajadorSeleccionado.usuario_nombre }}</p>
              </div>
              
              <!-- Apellido -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Apellido</label>
                <input 
                  v-if="modoEdicion"
                  v-model="datosEdicion.apellido"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Apellido del trabajador"
                />
                <p v-else class="mt-1 text-sm text-gray-900">{{ trabajadorSeleccionado.usuario_apellido_pat }}</p>
              </div>
              
              <!-- ID de Usuario -->
              <div>
                <label class="block text-sm font-medium text-gray-700">ID de Usuario</label>
                <p class="mt-1 text-sm font-bold text-blue-600">{{ trabajadorSeleccionado.id }}</p>
              </div>
              
              <!-- RUT -->
              <div>
                <label class="block text-sm font-medium text-gray-700">RUT</label>
                <input 
                  v-if="modoEdicion"
                  v-model="datosEdicion.rut"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="12345678-9"
                />
                <p v-else class="mt-1 text-sm text-gray-900">{{ trabajadorSeleccionado.usuario_rut }}</p>
              </div>
              
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  v-if="modoEdicion"
                  v-model="datosEdicion.email"
                  type="email"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="correo@ejemplo.com"
                />
                <p v-else class="mt-1 text-sm text-gray-900">{{ trabajadorSeleccionado.usuario_email || 'Sin email registrado' }}</p>
              </div>
              
              <!-- Horas Laborales Semanales -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Horas Laborales Semanales</label>
                <div class="flex items-center space-x-2">
                  <select 
                    v-model="horasLaboralesSeleccionadas" 
                    @change="actualizarHorasLaborales"
                    class="block w-32 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    :disabled="guardandoHoras || modoEdicion"
                  >
                    <option value="44">44 horas</option>
                    <option value="45">45 horas</option>
                    <option value="54">54 horas</option>
                  </select>
                  <button 
                    @click="actualizarHorasLaborales" 
                    class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-400"
                    :disabled="guardandoHoras || modoEdicion"
                  >
                    💾 Guardar
                  </button>
                  <div v-if="guardandoHoras" class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <span class="ml-2 text-sm text-gray-600">Guardando...</span>
                  </div>
                  <span v-else-if="horasActualizadas" class="text-sm text-green-600 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Actualizado
                  </span>
                </div>
                <p class="mt-1 text-xs text-gray-500">Selecciona las horas laborales semanales para este trabajador</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="mt-6 pt-4 border-t flex justify-end space-x-3">
          <!-- Modo Normal -->
          <template v-if="!modoEdicion">
            <button 
              @click="cerrarModalDetalles"
              class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded-md transition-colors duration-200"
            >
              Cerrar
            </button>
            <button v-show="!trabajadorSeleccionado.esDeEst"
              @click="editarTrabajador(trabajadorSeleccionado)"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              <span>Editar Trabajador</span>
            </button>
          </template>
          
          <!-- Modo Edición -->
          <template v-else>
            <button 
              @click="cancelarEdicion"
              class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded-md transition-colors duration-200"
              :disabled="guardandoCambios"
            >
              Cancelar
            </button>
            <button 
              @click="guardarCambiosTrabajador"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2"
              :disabled="guardandoCambios"
            >
              <div v-if="guardandoCambios" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>{{ guardandoCambios ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderAdmin from '../../components/headerEmpresa.vue';
import ModalNuevoTrabajador from '../../modals/ModalNuevoTrabajador.vue';
import ModalEnrolarTrabajador from '../../modals/ModalEnrolarTrabajador.vue';
import EmpresaServices from '../../../services/EmpresaService.js';
import { ref, onMounted, computed, nextTick } from 'vue';
import { useEmpresa } from '../../../composables/useEmpresa.js';
import { useNotification } from '../../../composables/useNotification.js';


const { obtenerTrabajadores, obtenerHorasSemanales } = useEmpresa();
const { showWarning, showError, showSuccess } = useNotification();

// Función auxiliar para mostrar notificaciones
const mostrarNotificacion = (mensaje, tipo = 'info') => {
  switch (tipo) {
    case 'error':
      showError(mensaje);
      break;
    case 'success':
      showSuccess(mensaje);
      break;
    case 'warning':
      showWarning(mensaje);
      break;
    default:
      showWarning(mensaje);
  }
};

// Estados reactivos
const trabajadores = ref([]);
const modalNuevoAbierto = ref(false);
const modalEnrolarAbierto = ref(false);
const modalTotalTrabajadoresAbierto = ref(false);
const modalDetallesAbierto = ref(false);
const trabajadorSeleccionado = ref(null);
const cargando = ref(false);
const cargandoTurnos = ref(false);
const cargandoMarcaciones = ref(false);
const turnosTrabajador = ref([]);
const marcacionesTrabajador = ref([]);
const diasTrabajados = ref({});
const promedioHorasDiarias = ref({});
const horasLaboralesSeleccionadas = ref('45');
const guardandoHoras = ref(false);
const horasActualizadas = ref(false);
const modoEdicion = ref(false);
const datosEdicion = ref({});
const guardandoCambios = ref(false);
const filtros = ref({
  busqueda: '',
  tipoHoras: '',
  departamento: ''
});

// Computed para filtrar trabajadores
const trabajadoresFiltrados = computed(() => {
  if (!trabajadores.value) return [];

  
  return trabajadores.value.filter(trabajador => {
    // Verificar diferentes campos de rol (incluir EST y trabajadores normales)
    // Aceptar: trabajador, est, o cualquier rol que no sea admin/empresa
    const esPersonalValido = !trabajador.rol || 
                            trabajador.rol === 'trabajador' || 
                            trabajador.rol === 'est' ||
                            trabajador.usuario_rol === 'trabajador' || 
                            trabajador.usuario_rol === 'est' ||
                            trabajador.rol_en_empresa === 'trabajador' ||
                            trabajador.rol_en_empresa === 'est';
    

    
    // Filtro de búsqueda - buscar en nombre, RUT y email
    const termiBusqueda = filtros.value.busqueda.toLowerCase();
    const matchBusqueda = !filtros.value.busqueda || 
      (trabajador.usuario_nombre && trabajador.usuario_nombre.toLowerCase().includes(termiBusqueda)) ||
      (trabajador.usuario_apellido_pat && trabajador.usuario_apellido_pat.toLowerCase().includes(termiBusqueda)) ||
      (trabajador.usuario_rut && trabajador.usuario_rut.toString().includes(termiBusqueda)) ||
      (trabajador.usuario_email && trabajador.usuario_email.toLowerCase().includes(termiBusqueda));
    
    const matchDepartamento = !filtros.value.departamento || trabajador.departamento === filtros.value.departamento;
    const horasSemanales = horasSemanalesCache.value[trabajador.id] || 0;
    const horasAsignadas = parseInt(trabajador.horas_laborales || '45');
    
    // Filtro de horas mejorado
    let matchHoras = true;
    if (filtros.value.tipoHoras) {
      switch (filtros.value.tipoHoras) {
        case 'normales':
          matchHoras = horasSemanales <= horasAsignadas;
          break;
        case 'excedidas':
          matchHoras = horasSemanales > horasAsignadas;
          break;
        case '20':
        case '30':
        case '40':
          matchHoras = horasSemanales >= parseInt(filtros.value.tipoHoras);
          break;
        default:
          matchHoras = true;
      }
    }
    
    return esPersonalValido && matchBusqueda && matchDepartamento && matchHoras;
  });
});

// Computed para estadísticas
const estadisticas = computed(() => {
  if (!trabajadores.value) return { total: 0, enrolados: 0, noEnrolados: 0, pendientes: 0, horasExcedidas: 0 };
  
  const total = trabajadores.value.length;
  const enrolados = trabajadores.value.filter(t => t.cuenta_creada === true).length;
  const noEnrolados = trabajadores.value.filter(t => t.cuenta_creada === false).length;
  const pendientes = trabajadores.value.filter(t => t.cuenta_creada === null || t.cuenta_creada === undefined).length;
  
  // Contar trabajadores que excedieron sus horas asignadas
  const horasExcedidas = trabajadores.value.filter(t => {
    const horas = horasSemanalesCache.value[t.id] || 0;
    const horasAsignadas = parseInt(t.horas_laborales || '45');
    return horas > horasAsignadas;
  }).length;
  
  return { total, enrolados, noEnrolados, pendientes, horasExcedidas };
});

// Métodos para el modal
const abrirModalNuevo = () => {
  modalNuevoAbierto.value = true;
};

const cerrarModalNuevo = () => {
  modalNuevoAbierto.value = false;
};

const onTrabajadorCreado = (nuevoTrabajador) => {
  console.log('Nuevo trabajador creado:', nuevoTrabajador);
  // Recargar la lista de trabajadores
  cargarTrabajadores();
};

// Métodos para el modal de enrolamiento
const abrirModalEnrolar = (trabajador) => {
  trabajadorSeleccionado.value = trabajador;
  modalEnrolarAbierto.value = true;
};

const cerrarModalEnrolar = () => {
  modalEnrolarAbierto.value = false;
  trabajadorSeleccionado.value = null;
};

const onTrabajadorEnrolado = (trabajadorEnrolado) => {
  console.log('Trabajador enrolado:', trabajadorEnrolado);
  // Recargar la lista de trabajadores
  cargarTrabajadores();
};

// Métodos para el modal de total de trabajadores
const abrirModalTotalTrabajadores = () => {
  modalTotalTrabajadoresAbierto.value = true;
};

const cerrarModalTotalTrabajadores = () => {
  modalTotalTrabajadoresAbierto.value = false;
};

// Métodos para el modal de detalles del trabajador
const abrirModalDetalles = async (trabajador) => {
  trabajadorSeleccionado.value = trabajador;
  modalDetallesAbierto.value = true;
  
  // Cargar las horas laborales actuales del trabajador
  horasLaboralesSeleccionadas.value = trabajador.horas_laborales || '45';
  horasActualizadas.value = false;
};

const cerrarModalDetalles = () => {
  modalDetallesAbierto.value = false;
  trabajadorSeleccionado.value = null;
  horasActualizadas.value = false;
  modoEdicion.value = false;
  datosEdicion.value = {};
};

// Función para actualizar las horas laborales del trabajador
const actualizarHorasLaborales = async () => {
  console.log('🚀 Función actualizarHorasLaborales llamada');
  console.log('👤 Trabajador seleccionado:', trabajadorSeleccionado.value);
  console.log('⏰ Horas seleccionadas:', horasLaboralesSeleccionadas.value);
  
  if (!trabajadorSeleccionado.value) {
    console.error('❌ No hay trabajador seleccionado');
    return;
  }
  
  guardandoHoras.value = true;
  horasActualizadas.value = false;
  
  try {
    console.log('🔄 Actualizando horas laborales:', {
      trabajadorId: trabajadorSeleccionado.value.id,
      horasNuevas: horasLaboralesSeleccionadas.value
    });
    
    // Llamar al servicio para actualizar las horas laborales
    const response = await EmpresaServices.actualizarHorasLaborales(
      trabajadorSeleccionado.value.id, 
      horasLaboralesSeleccionadas.value
    );
    
    if (response.success) {
      console.log('✅ Horas laborales actualizadas exitosamente');
      horasActualizadas.value = true;
      
      // Actualizar el trabajador en la lista local
      const trabajadorIndex = trabajadores.value.findIndex(t => t.id === trabajadorSeleccionado.value.id);
      if (trabajadorIndex !== -1) {
        trabajadores.value[trabajadorIndex].horas_laborales = horasLaboralesSeleccionadas.value;
        console.log('🔄 Trabajador actualizado en lista local:', trabajadores.value[trabajadorIndex]);
      }
      
      // Actualizar también el trabajador seleccionado
      if (trabajadorSeleccionado.value) {
        trabajadorSeleccionado.value.horas_laborales = horasLaboralesSeleccionadas.value;
        console.log('🔄 Trabajador seleccionado actualizado:', trabajadorSeleccionado.value);
      }
      
      // Limpiar cache de horas semanales para forzar recálculo de alarmas
      if (horasSemanalesCache.value[trabajadorSeleccionado.value.id]) {
        console.log('🧹 Limpiando cache para recalcular alarmas');
        // No eliminar la cache, solo forzar recálculo de alarmas
        const horasActuales = horasSemanalesCache.value[trabajadorSeleccionado.value.id];
        const nuevasHorasAsignadas = parseInt(horasLaboralesSeleccionadas.value);
        
        // Recalcular si debe mostrar alarma
        if (horasActuales > nuevasHorasAsignadas) {
          console.log(`🚨 NUEVA ALARMA: ${horasActuales}h > ${nuevasHorasAsignadas}h asignadas`);
        } else {
          console.log(`✅ SIN ALARMA: ${horasActuales}h <= ${nuevasHorasAsignadas}h asignadas`);
        }
      }
      
      mostrarNotificacion('Horas laborales actualizadas correctamente', 'success');
      
      // Forzar reactividad de Vue para que se actualicen las vistas
      await nextTick();
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        horasActualizadas.value = false;
      }, 3000);
    } else {
      mostrarNotificacion('Error al actualizar las horas laborales', 'error');
    }
  } catch (error) {
    console.error('❌ Error actualizando horas laborales:', error);
    mostrarNotificacion('Error al actualizar las horas laborales', 'error');
  } finally {
    guardandoHoras.value = false;
  }
};

const cargarTurnosTrabajador = async (trabajadorId) => {
  cargandoTurnos.value = true;
  try {
    console.log('🔄 Cargando turnos reales para trabajador:', trabajadorId)
    const response = await EmpresaServices.obtenerTurnosTrabajador(trabajadorId);
    
    console.log('📦 Respuesta completa del servidor:', response);
    console.log('📋 Datos de turnos recibidos:', response.data);
    console.log('📏 Cantidad de turnos:', response.data?.length);
    
    if (response.success && response.data) {
      turnosTrabajador.value = response.data;
      console.log('✅ Turnos asignados al estado:', turnosTrabajador.value)
      
      // Debug adicional: mostrar cada turno
      response.data.forEach((turno, index) => {
        console.log(`🔍 Turno ${index + 1}:`, turno);
      });
    } else {
      console.log('⚠️ No se encontraron turnos para el trabajador')
      turnosTrabajador.value = [];
    }
  } catch (error) {
    console.error('❌ Error cargando turnos:', error);
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    turnosTrabajador.value = [];
    
    // Si es un error 404, significa que no tiene turnos asignados
    if (error.response?.status === 404) {
      console.log('ℹ️ Trabajador sin turnos asignados')
    } else {
      mostrarNotificacion('Error al cargar turnos del trabajador', 'error');
    }
  } finally {
    cargandoTurnos.value = false;
  }
};

const cargarMarcacionesTrabajador = async (trabajadorId) => {
  cargandoMarcaciones.value = true;
  try {
    console.log('🔄 Cargando marcaciones reales para trabajador:', trabajadorId)
    const response = await EmpresaServices.obtenerMarcacionesTrabajador(trabajadorId, 10);
    
    console.log('📦 Respuesta completa de marcaciones:', response);
    console.log('📋 Datos de marcaciones recibidos:', response.data);
    console.log('📏 Cantidad de marcaciones:', response.data?.length);
    
    if (response.success && response.data) {
      marcacionesTrabajador.value = response.data;
      console.log('✅ Marcaciones asignadas al estado:', marcacionesTrabajador.value)
      
      // Debug adicional: mostrar cada marcación
      response.data.forEach((marcacion, index) => {
        console.log(`🔍 Marcación ${index + 1}:`, marcacion);
      });
    } else {
      console.log('⚠️ No se encontraron marcaciones para el trabajador')
      marcacionesTrabajador.value = [];
    }
  } catch (error) {
    console.error('❌ Error cargando marcaciones:', error);
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    marcacionesTrabajador.value = [];
    
    // Si es un error 404, significa que no tiene marcaciones
    if (error.response?.status === 404) {
      console.log('ℹ️ Trabajador sin marcaciones registradas')
    } else {
      mostrarNotificacion('Error al cargar marcaciones del trabajador', 'error');
    }
  } finally {
    cargandoMarcaciones.value = false;
  }
};

const calcularEstadisticasTrabajador = async (trabajadorId) => {
  try {
    // Calcular días trabajados (simulación)
    diasTrabajados.value[trabajadorId] = 5;
    
    // Calcular promedio de horas diarias
    const horasSemanales = horasSemanalesCache.value[trabajadorId] || 0;
    const dias = diasTrabajados.value[trabajadorId] || 1;
    promedioHorasDiarias.value[trabajadorId] = (horasSemanales / dias).toFixed(1);
  } catch (error) {
    console.error('Error calculando estadísticas:', error);
  }
};

// Funciones auxiliares para formateo
const formatearHora = (hora) => {
  if (!hora) return '--:--';
  return hora;
};

const calcularDuracionTurno = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return 0;
  
  const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
  const [finHoras, finMinutos] = horaFin.split(':').map(Number);
  
  const inicioEnMinutos = inicioHoras * 60 + inicioMinutos;
  const finEnMinutos = finHoras * 60 + finMinutos;
  
  const diferenciaMinutos = finEnMinutos - inicioEnMinutos;
  return (diferenciaMinutos / 60).toFixed(1);
};

const cargarTrabajadores = async () => {
  try {
    cargando.value = true;
    const response = await obtenerTrabajadores(false);
    console.log('📦 Respuesta completa de trabajadores:', response);
    trabajadores.value = response || [];
    
    // Debug: verificar horas laborales en frontend
    console.log('FRONTEND - Horas laborales recibidas:');
    trabajadores.value.forEach(trabajador => {
      console.log(`- ${trabajador.usuario_nombre} (ID: ${trabajador.id}): ${trabajador.horas_laborales || 'SIN HORAS LABORALES'}`);
    });
    console.log('� Trabajadores cargados:', trabajadores.value.length);
    
  } catch (error) {
    console.error('Error al cargar trabajadores:', error);
    trabajadores.value = [];
  } finally {
    cargando.value = false;
  }
};

// Métodos auxiliares
const getInitials = (nombre, apellido) => {
  const initial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
  const initial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
  return initial1 + initial2;
};

const getEstadoTrabajador = (trabajador) => {
  if (trabajador.cuenta_creada === true) {
    return 'enrolado';
  } else if (trabajador.cuenta_creada === false) {
    return 'no enrolado';
  } else {
    return 'pendiente';
  }
};

const getEstadoClass = (trabajador) => {
  const estado = getEstadoTrabajador(trabajador);
  switch (estado) {
    case 'enrolado':
      return 'bg-green-100 text-green-800';
    case 'no enrolado':
      return 'bg-red-100 text-red-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Sin acceso';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return 'Hace menos de 1 hora';
};

const horasSemanalesCache = ref({});

const calcularHorasSemana = async (trabajador) => {
  try {
    console.log('🧮 Calculando horas para:', {
      id: trabajador.id,
      nombre: trabajador.usuario_nombre,
      horasLaborales: trabajador.horas_laborales,
      trabajador: trabajador
    });

    // Si ya tenemos el dato en cache, lo retornamos
    if (horasSemanalesCache.value[trabajador.id] !== undefined) {
      console.log(`✅ Cache hit para ${trabajador.id}: ${horasSemanalesCache.value[trabajador.id]} horas`);
      return horasSemanalesCache.value[trabajador.id];
    }

    // Si el trabajador tiene ID, obtener horas reales
    if (trabajador.id) {
      console.log(`🔍 Obteniendo horas semanales para usuario_empresa_id: ${trabajador.id}`);
      const resultado = await obtenerHorasSemanales(trabajador.id);
      console.log('📊 Resultado del cálculo:', resultado);
      
      if (resultado.success) {
        const horas = resultado.totalHorasSemanales || 0;
        horasSemanalesCache.value[trabajador.id] = Math.round(horas * 100) / 100; // 2 decimales
        console.log(`✅ Horas calculadas para ${trabajador.usuario_nombre}: ${horas}`);
        
        // Obtener las horas laborales asignadas al trabajador (por defecto 45)
        const horasLaboralesAsignadas = parseInt(trabajador.horas_laborales || '45');
        
        // Verificar si se exceden las horas laborales asignadas
        if (horas > horasLaboralesAsignadas) {
          console.log(`🚨 ALARMA: ${trabajador.usuario_nombre} excedió las ${horasLaboralesAsignadas}h asignadas`);
          showWarning(
            `🚨 ${trabajador.usuario_nombre} ha excedido las ${horasLaboralesAsignadas} horas semanales asignadas (${Math.round(horas * 100) / 100} hrs trabajadas)`,
            10000 // Duración de 10 segundos para alertas críticas
          );
        }
        
        return Math.round(horas * 100) / 100;
      } else {
        console.error(`❌ Error en resultado para ${trabajador.id}:`, resultado);
      }
    }
    
    // Fallback: valor por defecto
    console.log(`⚠️ Fallback a 0 horas para ${trabajador.usuario_nombre}`);
    horasSemanalesCache.value[trabajador.id] = 0;
    return 0;
    
  } catch (error) {
    console.error(`❌ Error al calcular horas semanales para ${trabajador.usuario_nombre}:`, error);
    horasSemanalesCache.value[trabajador.id] = 0;
    return 0;
  }
};

// Función síncrona para mostrar en la tabla (usa el cache)
const mostrarHorasSemana = (trabajador) => {
  // Si no está en cache, calcular de forma asíncrona
  if (horasSemanalesCache.value[trabajador.id] === undefined) {
    console.log(`🔍 Calculando horas para trabajador ID: ${trabajador.id}`);
    calcularHorasSemana(trabajador);
    return '...'; // Mostrar loading
  }
  return horasSemanalesCache.value[trabajador.id] || 0;
};

// Función helper para verificar si un trabajador excede sus horas asignadas
const excedeHorasAsignadas = (trabajador) => {
  const horasTrabajadas = horasSemanalesCache.value[trabajador.id] || 0;
  const horasAsignadas = parseInt(trabajador.horas_laborales || '45');
  const excede = horasTrabajadas > horasAsignadas;
  
  // Debug log para ver las comparaciones
  if (trabajador.id === trabajadorSeleccionado.value?.id) {
    console.log('🔍 Verificando alarma para trabajador seleccionado:', {
      trabajadorId: trabajador.id,
      horasTrabajadas,
      horasAsignadas,
      excede,
      trabajador
    });
  }
  
  return excede;
};

// Función para obtener las horas asignadas de un trabajador
const obtenerHorasAsignadas = (trabajador) => {
  return parseInt(trabajador.horas_laborales || '45');
};

// Métodos de acción
const editarTrabajador = (trabajador) => {
  console.log('Editar trabajador:', trabajador);
  modoEdicion.value = true;
  datosEdicion.value = {
    nombre: trabajador.usuario_nombre,
    apellido: trabajador.usuario_apellido_pat,
    rut: trabajador.usuario_rut,
    email: trabajador.usuario_email
  };
};

const cancelarEdicion = () => {
  modoEdicion.value = false;
  datosEdicion.value = {};
};

const guardarCambiosTrabajador = async () => {
  if (!trabajadorSeleccionado.value) {
    mostrarNotificacion('No hay trabajador seleccionado', 'error');
    return;
  }

  // Validaciones básicas
  if (!datosEdicion.value.nombre || !datosEdicion.value.apellido) {
    mostrarNotificacion('El nombre y apellido son obligatorios', 'error');
    return;
  }

  if (!datosEdicion.value.rut) {
    mostrarNotificacion('El RUT es obligatorio', 'error');
    return;
  }

  guardandoCambios.value = true;

  try {
    console.log('💾 Guardando cambios del trabajador:', {
      id: trabajadorSeleccionado.value.id,
      datosNuevos: datosEdicion.value
    });

    // Llamar al servicio para actualizar el trabajador
    const response = await EmpresaServices.actualizarTrabajador(
      trabajadorSeleccionado.value.id,
      datosEdicion.value
    );

    if (response.success) {
      console.log('✅ Trabajador actualizado exitosamente');
      
      // Actualizar el trabajador en la lista local
      const trabajadorIndex = trabajadores.value.findIndex(t => t.id === trabajadorSeleccionado.value.id);
      if (trabajadorIndex !== -1) {
        trabajadores.value[trabajadorIndex].usuario_nombre = datosEdicion.value.nombre;
        trabajadores.value[trabajadorIndex].usuario_apellido_pat = datosEdicion.value.apellido;
        trabajadores.value[trabajadorIndex].usuario_rut = datosEdicion.value.rut;
        trabajadores.value[trabajadorIndex].usuario_email = datosEdicion.value.email;
      }

      // Actualizar también el trabajador seleccionado
      if (trabajadorSeleccionado.value) {
        trabajadorSeleccionado.value.usuario_nombre = datosEdicion.value.nombre;
        trabajadorSeleccionado.value.usuario_apellido_pat = datosEdicion.value.apellido;
        trabajadorSeleccionado.value.usuario_rut = datosEdicion.value.rut;
        trabajadorSeleccionado.value.usuario_email = datosEdicion.value.email;
      }

      mostrarNotificacion('Trabajador actualizado correctamente', 'success');
      modoEdicion.value = false;
      datosEdicion.value = {};
      
      // Forzar reactividad
      await nextTick();
    } else {
      mostrarNotificacion(response.message || 'Error al actualizar el trabajador', 'error');
    }
  } catch (error) {
    console.error('❌ Error actualizando trabajador:', error);
    mostrarNotificacion(error.response?.data?.message || 'Error al actualizar el trabajador', 'error');
  } finally {
    guardandoCambios.value = false;
  }
};

// Acciones específicas para horas excedidas
const generarReporteExceso = async (trabajador) => {
  try {
    const horas = horasSemanalesCache.value[trabajador.id] || 0;
    const horasAsignadas = parseInt(trabajador.horas_laborales || '45');
    const exceso = horas - horasAsignadas;
    
    mostrarNotificacion(`📊 Generando reporte de exceso para ${trabajador.nombres}. Exceso: ${exceso.toFixed(1)} horas sobre ${horasAsignadas}h asignadas`, 'warning');
    
    // Crear reporte detallado (aquí puedes implementar la lógica específica)
    const reporteData = {
      trabajador: trabajador.nombres,
      rut: trabajador.rut,
      horasSemanales: horas,
      exceso: exceso,
      fecha: new Date().toLocaleDateString(),
      recomendaciones: [
        'Reducir horas siguiente semana',
        'Verificar registros de marcación',
        'Considerar compensación en tiempo libre'
      ]
    };
    
    // Simular generación de reporte
    setTimeout(() => {
      mostrarNotificacion(`✅ Reporte generado para ${trabajador.nombres}`, 'success');
    }, 1500);
    
  } catch (error) {
    console.error('Error generando reporte:', error);
    mostrarNotificacion('❌ Error al generar reporte', 'error');
  }
};

const notificarSupervisor = async (trabajador) => {
  try {
    const horas = horasSemanalesCache.value[trabajador.id] || 0;
    
    mostrarNotificacion(`🚨 Notificando supervisor sobre ${trabajador.nombres}`, 'warning');
    
    // Aquí implementarías la lógica de notificación real
    // Por ejemplo, enviar email al supervisor o crear alerta en sistema
    
    setTimeout(() => {
      mostrarNotificacion(`📧 Supervisor notificado sobre exceso de horas de ${trabajador.nombres}`, 'success');
    }, 1000);
    
  } catch (error) {
    console.error('Error notificando supervisor:', error);
    mostrarNotificacion('❌ Error al notificar supervisor', 'error');
  }
};

const ajustarHorario = async (trabajador) => {
  try {
    const horas = horasSemanalesCache.value[trabajador.id] || 0;
    const horasAsignadas = parseInt(trabajador.horas_laborales || '45');
    const exceso = horas - horasAsignadas;
    const ajusteSugerido = Math.min(exceso, 8); // Máximo 8 horas de ajuste por día
    
    mostrarNotificacion(`⏰ Calculando ajuste de horario para ${trabajador.nombres}`, 'info');
    
    // Crear sugerencia de ajuste
    const ajuste = {
      trabajador: trabajador.nombres,
      horasActuales: horas,
      exceso: exceso,
      ajusteSugerido: ajusteSugerido,
      horasObjetivo: horasAsignadas,
      accion: `Reducir ${ajusteSugerido.toFixed(1)} horas en próxima semana para cumplir ${horasAsignadas}h asignadas`
    };
    
    setTimeout(() => {
      mostrarNotificacion(`📋 Ajuste programado: -${ajusteSugerido.toFixed(1)}h para ${trabajador.nombres}`, 'success');
    }, 1000);
    
  } catch (error) {
    console.error('Error ajustando horario:', error);
    mostrarNotificacion('❌ Error al ajustar horario', 'error');
  }
};

// Acciones rápidas generales
const generarReporteGeneral = async () => {
  try {
    mostrarNotificacion('📊 Generando reporte general de excesos...', 'info');
    
    const trabajadoresExcedidos = trabajadoresFiltrados.value.filter(t => {
      const horas = horasSemanalesCache.value[t.id] || 0;
      return horas > 45;
    });
    
    const reporteGeneral = {
      fecha: new Date().toLocaleDateString(),
      totalExcedidos: trabajadoresExcedidos.length,
      trabajadores: trabajadoresExcedidos.map(t => ({
        nombre: t.nombres,
        rut: t.rut,
        horas: horasSemanalesCache.value[t.id] || 0,
        exceso: (horasSemanalesCache.value[t.id] || 0) - 45
      })),
      totalExcesoHoras: trabajadoresExcedidos.reduce((total, t) => {
        const horas = horasSemanalesCache.value[t.id] || 0;
        return total + Math.max(0, horas - 45);
      }, 0)
    };
    
    setTimeout(() => {
      mostrarNotificacion(`✅ Reporte generado: ${trabajadoresExcedidos.length} trabajadores con exceso`, 'success');
      console.log('Reporte General:', reporteGeneral);
    }, 1500);
    
  } catch (error) {
    console.error('Error generando reporte general:', error);
    mostrarNotificacion('❌ Error al generar reporte general', 'error');
  }
};

const notificarTodosExcesos = async () => {
  try {
    const trabajadoresExcedidos = trabajadoresFiltrados.value.filter(t => {
      const horas = horasSemanalesCache.value[t.id] || 0;
      return horas > 45;
    });
    
    if (trabajadoresExcedidos.length === 0) {
      mostrarNotificacion('✅ No hay trabajadores con exceso de horas', 'info');
      return;
    }
    
    mostrarNotificacion(`🚨 Notificando supervisor sobre ${trabajadoresExcedidos.length} casos de exceso...`, 'warning');
    
    // Simular notificación masiva
    setTimeout(() => {
      mostrarNotificacion(`📧 Supervisor notificado sobre ${trabajadoresExcedidos.length} casos de exceso de horas`, 'success');
    }, 2000);
    
  } catch (error) {
    console.error('Error notificando excesos:', error);
    mostrarNotificacion('❌ Error al notificar excesos', 'error');
  }
};

const toggleEstadoTrabajador = (trabajador) => {
  const estadoActual = getEstadoTrabajador(trabajador);
  
  if (estadoActual === 'enrolado') {
    // TODO: Implementar desenrolamiento
    console.log('Desenrolar trabajador:', trabajador);
    // Aquí iría la lógica para desenrolar (cambiar cuenta_creada a false)
  } else {
    // Abrir modal para enrolar
    abrirModalEnrolar(trabajador);
  }
};


onMounted(async () => {
   await cargarTrabajadores();
});
</script>
