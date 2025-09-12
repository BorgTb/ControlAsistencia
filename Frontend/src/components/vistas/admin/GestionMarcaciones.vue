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
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.marcacionesHoy || 0 }}</p>
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
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.modificadas || 0 }}</p>
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
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.agregadas || 0 }}</p>
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
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.conflictos || 0 }}</p>
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
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.pendientes || 0 }}</p>
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
                  v-model="filtros.busqueda"
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
                v-model="filtros.fecha"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Tipo de Marcación -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select v-model="filtros.tipo" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="colacion">Colación</option>
                <option value="descanso">Descanso</option>
              </select>
            </div>

            <!-- Botón Filtrar -->
            <div class="flex items-end">
              <button @click="aplicarFiltros" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                Filtrar
              </button>
            </div>

            <!-- Botón Limpiar -->
            <div class="flex items-end">
              <button @click="limpiarFiltros" class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Solicitudes Pendientes -->
      

      <!-- Tabla de Marcaciones -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">
                Registro de Marcaciones
                <span v-if="filtros.fecha" class="text-sm text-gray-500 ml-2">
                  - {{ new Date(filtros.fecha).toLocaleDateString('es-CL') }}
                </span>
                <span v-else class="text-sm text-gray-500 ml-2">- Todas</span>
              </h3>
              <div class="text-sm text-gray-500">
                {{ marcaciones.length }} 
                {{ marcaciones.length === 1 ? 'marcación' : 'marcaciones' }}
                {{ marcaciones.length !== marcacionesOriginales.length ? 'filtradas' : 'encontradas' }}
              </div>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Origen</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Indicador de carga -->
                <tr v-if="cargando">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando marcaciones...
                    </div>
                  </td>
                </tr>
                
                <!-- Marcaciones -->
                <tr v-else v-for="marcacion in marcaciones" :key="marcacion.id" class="hover:bg-gray-50" 
                    :class="{ 
                      'bg-yellow-50': marcacion.modificada, 
                      'bg-green-50': marcacion.agregada 
                    }">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full flex items-center justify-center"
                             :class="marcacion.avatarColor">
                          <span class="text-white font-medium">{{ marcacion.iniciales }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ marcacion.nombreTrabajador }}</div>
                        <div class="text-sm text-gray-500">RUT: {{ marcacion.rut }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ marcacion.fecha }}<br />
                    <span v-if="marcacion.horaOriginal" class="text-red-600 line-through">{{ marcacion.horaOriginal }}</span>
                    <span v-if="marcacion.horaOriginal"><br /></span>
                    <span class="text-green-600 font-medium">{{ marcacion.hora }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          :class="marcacion.tipoClase">
                      {{ marcacion.tipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div v-if="marcacion.geo_lat && marcacion.geo_lon" class="flex items-center">
                      <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-xs">GPS Registrado</span>
                    </div>
                    <div v-else class="flex items-center">
                      <svg class="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-xs text-gray-400">Sin ubicación</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ marcacion.ip_origen || 'No disponible' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button v-if="marcacion.modificada" 
                              class="text-purple-600 hover:text-purple-900">Historial</button>
                      <button v-else 
                              class="text-yellow-600 hover:text-yellow-900">Modificar</button>
                    </div>
                  </td>
                </tr>
                
                <!-- Mensaje cuando no hay marcaciones -->
                <tr v-if="!cargando && marcaciones.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No hay marcaciones para mostrar
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
                  Mostrando <span class="font-medium">{{ marcaciones.length > 0 ? 1 : 0 }}</span> al <span class="font-medium">{{ marcaciones.length }}</span> de{' '}
                  <span class="font-medium">{{ marcaciones.length }}</span> marcaciones
                  <span v-if="marcaciones.length !== marcacionesOriginales.length" class="text-indigo-600">
                    (filtradas de {{ marcacionesOriginales.length }} total)
                  </span>
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
        <div class="px-4 py-6 sm:px-0">
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Solicitudes Pendientes de Aprobación</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4" v-if="solicitudesPendientes.length > 0">
              <div 
                v-for="solicitud in solicitudesPendientes" 
                :key="solicitud.id"
                class="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <svg v-if="solicitud.tipo === 'modificacion'" class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <svg v-else class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ solicitud.nombreTrabajador }} - {{ solicitud.tipoDescripcion }}</h4>
                    <p class="text-sm text-gray-600">{{ solicitud.descripcion }}</p>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <p class="text-xs text-gray-500">Tipo: {{ solicitud.motivo }}</p>
                      <p class="text-xs text-gray-500">Marcación: {{ capitalizarTipo(solicitud.tipoMarcacion) }}</p>
                      <p v-if="solicitud.horaNueva" class="text-xs text-gray-500">
                        Hora solicitada: {{ solicitud.horaNueva }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Aprobar
                  </button>
                  <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Rechazar
                  </button>
                  <button @click="abrirModalDetalles(solicitud)" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Mensaje cuando no hay solicitudes -->
            <div v-else class="text-center py-8">
              <p class="text-gray-500">No hay solicitudes pendientes de aprobación</p>

            </div>
          </div>
        </div>
      </div>
      </div>
    </main>

    <!-- Modal de Detalles de Solicitud -->
    <div v-if="mostrarModalDetalles" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header del Modal -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Detalles de la Solicitud</h3>
            <button @click="cerrarModalDetalles" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Contenido del Modal -->
          <div v-if="solicitudSeleccionada" class="mt-6 space-y-6">
            <!-- Información del Trabajador -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Información del Trabajador</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.nombreTrabajador }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">ID Usuario</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.usuario_id }}</p>
                </div>
              </div>
            </div>

            <!-- Información de la Solicitud -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Información de la Solicitud</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo de Solicitud</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.tipoDescripcion }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Motivo</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.motivo }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fecha de Reporte</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.fecha }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">ID de Solicitud</label>
                  <p class="mt-1 text-sm text-gray-900">#{{ solicitudSeleccionada.id }}</p>
                </div>
              </div>
            </div>

            <!-- Descripción Detallada -->
            <div class="bg-yellow-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Descripción del Problema</h4>
              <p class="text-sm text-gray-700 leading-relaxed">{{ solicitudSeleccionada.descripcion }}</p>
            </div>

            <!-- Información de la Marcación -->
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Información de la Marcación</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">ID Marcación</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.marcacion_id }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo de Marcación</label>
                  <span class="inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full"
                        :class="obtenerClaseTipo(solicitudSeleccionada.tipoMarcacion)">
                    {{ capitalizarTipo(solicitudSeleccionada.tipoMarcacion) }}
                  </span>
                </div>
                <div v-if="solicitudSeleccionada.horaOriginal">
                  <label class="block text-sm font-medium text-gray-700">Hora Original</label>
                  <p class="mt-1 text-sm text-gray-900">{{ solicitudSeleccionada.horaOriginal }}</p>
                </div>
              </div>
              
              <!-- Hora Solicitada (si existe) -->
              <div v-if="solicitudSeleccionada.horaNueva" class="mt-4">
                <label class="block text-sm font-medium text-gray-700">Hora Solicitada</label>
                <p class="mt-1 text-sm text-green-600 font-medium">{{ solicitudSeleccionada.horaNueva }}</p>
              </div>

              <!-- Fecha Correcta (si existe) -->
              <div v-if="solicitudSeleccionada.fecha_correcta" class="mt-4">
                <label class="block text-sm font-medium text-gray-700">Fecha Correcta Solicitada</label>
                <p class="mt-1 text-sm text-green-600 font-medium">{{ new Date(solicitudSeleccionada.fecha_correcta).toLocaleDateString('es-CL') }}</p>
              </div>
            </div>

            <!-- Acciones del Modal -->
            <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button class="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Aprobar Solicitud</span>
              </button>
              <button class="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span>Rechazar Solicitud</span>
              </button>
              <button @click="cerrarModalDetalles" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors duration-200">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useEmpresa } from '../../../composables/useEmpresa.js';

// Composables
const { obtenerMarcacionesPorEmpresa, obtenerReportesMarcaciones} = useEmpresa();

// Estados reactivos
const marcaciones = ref([]);
const marcacionesOriginales = ref([]); // Para mantener los datos originales sin filtrar
/* Formato esperado para marcaciones:
{
  id: string | number,
  nombreTrabajador: string,
  departamento: string,
  iniciales: string, // Ej: "JP"
  avatarColor: string, // Clases CSS como "bg-indigo-500"
  fecha: string, // Formato: "07/08/2025"
  hora: string, // Formato: "08:00:15"
  horaOriginal?: string, // Solo para marcaciones modificadas
  tipo: string, // "entrada", "salida", "colacion", "descanso"
  tipoClase: string, // Clases CSS para el badge del tipo
  metodo: string, // "Biometría", "Tarjeta", "Manual", etc.
  modificada?: boolean, // true si fue modificada
  agregada?: boolean, // true si fue agregada manualmente
  modificadoPor?: string, // Solo si fue modificada
  fechaModificacion?: string // Solo si fue modificada, formato: "07/08 09:15"
}
*/

const solicitudesPendientes = ref([]);
/* Formato esperado para solicitudesPendientes:
{
  id: string | number,
  nombreTrabajador: string,
  tipo: string, // "modificacion" | "agregada"
  tipoDescripcion: string, // "Modificación de Entrada", "Agregar Marcación"
  descripcion: string, // Descripción detallada de la solicitud
  motivo: string, // Motivo de la solicitud
  fecha: string,
  horaOriginal?: string, // Para modificaciones
  horaNueva?: string, // Para modificaciones o nuevas marcaciones
  tipoMarcacion: string // "entrada", "salida", "colacion", "descanso"
}
*/

const estadisticas = ref({});
/* Formato esperado para estadisticas:
{
  marcacionesHoy: number,
  modificadas: number,
  agregadas: number,
  conflictos: number,
  pendientes: number
}
*/

const cargando = ref(false);

// Variables para filtros
const filtros = ref({
  busqueda: '',
  fecha: '',
  tipo: ''
});

// Variables para el modal de detalles
const mostrarModalDetalles = ref(false);
const solicitudSeleccionada = ref(null);

// Función para obtener las iniciales del nombre
const obtenerIniciales = (nombre, apellido) => {
  const primerNombre = nombre ? nombre.charAt(0).toUpperCase() : '';
  const primerApellido = apellido ? apellido.charAt(0).toUpperCase() : '';
  return primerNombre + primerApellido;
};

// Función para obtener color de avatar aleatorio
const obtenerColorAvatar = () => {
  const colores = [
    'bg-indigo-500',
    'bg-purple-500', 
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-gray-500'
  ];
  return colores[Math.floor(Math.random() * colores.length)];
};

// Función para obtener clases CSS del badge de tipo
const obtenerClaseTipo = (tipo) => {
  const clases = {
    'entrada': 'bg-green-100 text-green-800',
    'salida': 'bg-red-100 text-red-800',
    'colacion': 'bg-yellow-100 text-yellow-800',
    'descanso': 'bg-blue-100 text-blue-800'
  };
  return clases[tipo] || 'bg-gray-100 text-gray-800';
};

// Función para formatear fecha
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL');
};

// Función para capitalizar tipo
const capitalizarTipo = (tipo) => {
  const tipos = {
    'entrada': 'Entrada',
    'salida': 'Salida', 
    'colacion': 'Colación',
    'descanso': 'Descanso'
  };
  return tipos[tipo] || tipo;
};

// Función para calcular estadísticas
const calcularEstadisticas = (marcacionesData) => {
  const hoy = new Date().toISOString().split('T')[0];
  
  estadisticas.value = {
    marcacionesHoy: marcacionesData.filter(m => {
      const fechaMarcacion = new Date(m.fechaOriginal).toISOString().split('T')[0];
      return fechaMarcacion === hoy;
    }).length,
    modificadas: marcacionesData.filter(m => m.modificada).length,
    agregadas: marcacionesData.filter(m => m.agregada).length,
    conflictos: 0, // Por ahora en 0, se puede implementar lógica de conflictos
    pendientes: solicitudesPendientes.value.length
  };
};

// Función para cargar marcaciones
const cargarMarcaciones = async () => {
  try {
    cargando.value = true;
    const response = await obtenerMarcacionesPorEmpresa();
    
    console.log('Respuesta de marcaciones:', response);
    
    // Transformar el objeto agrupado por usuario_id a un array plano
    const marcacionesTransformadas = [];
    
    if (response && typeof response === 'object') {
      // Iterar sobre cada usuario_id
      Object.keys(response).forEach(usuarioId => {
        const marcacionesUsuario = response[usuarioId];
        
        if (Array.isArray(marcacionesUsuario)) {
          // Procesar cada marcación del usuario
          marcacionesUsuario.forEach((marcacion, index) => {
            const marcacionTransformada = {
              id: `${usuarioId}_${index}`, // ID único combinando usuario_id e índice
              nombreTrabajador: `${marcacion.nombre} ${marcacion.apellido}`,
              rut: marcacion.rut,
              iniciales: obtenerIniciales(marcacion.nombre, marcacion.apellido),
              avatarColor: obtenerColorAvatar(),
              fecha: formatearFecha(marcacion.fecha),
              fechaOriginal: marcacion.fecha, // Mantener fecha original para filtros
              hora: marcacion.hora,
              tipo: capitalizarTipo(marcacion.tipo),
              tipoOriginal: marcacion.tipo, // Mantener tipo original para filtros
              tipoClase: obtenerClaseTipo(marcacion.tipo),
              metodo: 'GPS/Web', // Asumir método basado en datos disponibles
              modificada: false, // Por defecto no modificada
              agregada: false, // Por defecto no agregada manualmente
              
              // Datos adicionales de la marcación
              geo_lat: marcacion.geo_lat,
              geo_lon: marcacion.geo_lon,
              ip_origen: marcacion.ip_origen,
              hash: marcacion.hash,
              usuario_id: marcacion.usuario_id,
              rol_en_empresa: marcacion.rol_en_empresa,
              created_at: marcacion.created_at
            };
            
            marcacionesTransformadas.push(marcacionTransformada);
          });
        }
      });
    }
    
    // Ordenar por fecha y hora más recientes primero
    marcacionesTransformadas.sort((a, b) => {
      const fechaHoraA = new Date(`${a.fechaOriginal}T${a.hora}`);
      const fechaHoraB = new Date(`${b.fechaOriginal}T${b.hora}`);
      return fechaHoraB.getTime() - fechaHoraA.getTime();
    });
    
    marcacionesOriginales.value = marcacionesTransformadas;
    marcaciones.value = marcacionesTransformadas;
    
    // Calcular estadísticas
    calcularEstadisticas(marcacionesTransformadas);
    
  } catch (error) {
    console.error('Error al cargar marcaciones:', error);
  } finally {
    cargando.value = false;
  }
};

// Función para aplicar filtros
const aplicarFiltros = () => {
  let marcacionesFiltradas = [...marcacionesOriginales.value];
  
  // Filtro por búsqueda (nombre o RUT)
  if (filtros.value.busqueda.trim()) {
    const busqueda = filtros.value.busqueda.toLowerCase().trim();
    marcacionesFiltradas = marcacionesFiltradas.filter(marcacion => 
      marcacion.nombreTrabajador.toLowerCase().includes(busqueda) ||
      marcacion.rut.toLowerCase().includes(busqueda)
    );
  }
  
  // Filtro por fecha
  if (filtros.value.fecha) {
    marcacionesFiltradas = marcacionesFiltradas.filter(marcacion => {
      // Convertir la fecha original a formato YYYY-MM-DD
      const fechaMarcacion = new Date(marcacion.fechaOriginal).toISOString().split('T')[0];
      return fechaMarcacion === filtros.value.fecha;
    });
  }
  
  // Filtro por tipo
  if (filtros.value.tipo) {
    marcacionesFiltradas = marcacionesFiltradas.filter(marcacion => 
      marcacion.tipoOriginal === filtros.value.tipo
    );
  }
  
  marcaciones.value = marcacionesFiltradas;
};

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtros.value = {
    busqueda: '',
    fecha: '',
    tipo: ''
  };
  marcaciones.value = [...marcacionesOriginales.value];
};

// Funciones para el modal de detalles
const abrirModalDetalles = (solicitud) => {
  solicitudSeleccionada.value = solicitud;
  mostrarModalDetalles.value = true;
};

const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false;
  solicitudSeleccionada.value = null;
};


const cargarSolicitudes = async () => {
  try {
    const response = await obtenerReportesMarcaciones();
    console.log('Respuesta de solicitudes pendientes:', response);
    
    // Verificar si hay datos en la respuesta
    if (response && Array.isArray(response)) {
      // Transformar los datos del servidor al formato esperado
      solicitudesPendientes.value = response.map(reporte => {
        // Determinar el tipo de descripción basado en el tipo_problema
        let tipoDescripcion = '';
        let tipo = 'modificacion';
        
        switch (reporte.tipo_problema) {
          case 'ubicacion_incorrecta':
            tipoDescripcion = 'Corrección de Ubicación';
            break;
          case 'hora_incorrecta':
            tipoDescripcion = 'Corrección de Hora';
            break;
          case 'marcacion_faltante':
            tipoDescripcion = 'Agregar Marcación';
            tipo = 'agregada';
            break;
          default:
            tipoDescripcion = 'Corrección de Marcación';
        }
        
        // Formatear fecha
        const fechaReporte = new Date(reporte.fecha_reporte).toLocaleDateString('es-CL');
        
        return {
          id: reporte.id,
          nombreTrabajador: reporte.nombreTrabajador,
          tipo: tipo,
          tipoDescripcion: tipoDescripcion,
          descripcion: reporte.descripcion,
          motivo: reporte.tipo_problema.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          fecha: fechaReporte,
          horaOriginal: reporte.horaOriginal,
          horaNueva: reporte.hora_correcta,
          tipoMarcacion: reporte.tipoMarcacion,
          marcacion_id: reporte.marcacion_id,
          usuario_id: reporte.usuario_id,
          fecha_correcta: reporte.fecha_correcta
        };
      });
    } else {
      solicitudesPendientes.value = [];
    }
    
    // Actualizar estadísticas
    calcularEstadisticas(marcacionesOriginales.value);
    
  } catch (error) {
    console.error('Error al cargar solicitudes pendientes:', error);
    solicitudesPendientes.value = [];
  }
};

onMounted(() => {
  
  
  cargarMarcaciones();
  cargarSolicitudes();

});
</script>
