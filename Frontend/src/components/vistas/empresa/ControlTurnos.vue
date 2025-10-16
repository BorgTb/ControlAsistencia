<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Panel izquierdo: Formularios -->
        <div class="lg:col-span-1 space-y-6">
          
          <!-- Formulario: Crear Tipo de Turno -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Crear Tipo de Turno</h3>
            <form @submit.prevent="guardarTipoTurno" class="space-y-4">
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Turno</label>
                <input 
                  type="text" 
                  v-model="formTipoTurno.nombre" 
                  placeholder="Ej: Turno Mañana, 4x3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  v-model="formTipoTurno.descripcion" 
                  rows="2"
                  placeholder="Descripción del turno..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio (Base)</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.hora_inicio" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin (Base)</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.hora_fin" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Colación Inicio</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.colacion_inicio" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Colación Fin</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.colacion_fin" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <!-- Días de la semana -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Días de Trabajo</label>
                <div class="space-y-2">
                  <div v-for="(dia, index) in diasSemana" :key="dia.value" class="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <input 
                      type="checkbox" 
                      :id="`dia-${dia.value}`"
                      v-model="dia.trabaja"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label :for="`dia-${dia.value}`" class="flex-1 text-sm font-medium text-gray-700">
                      {{ dia.label }}
                    </label>
                    <div v-if="dia.trabaja" class="flex space-x-2">
                      <input 
                        type="time" 
                        v-model="dia.hora_inicio"
                        placeholder="Hora inicio"
                        class="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input 
                        type="time" 
                        v-model="dia.hora_fin"
                        placeholder="Hora fin"
                        class="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Deja los horarios vacíos para usar el horario base del turno
                </p>
              </div>

              <button 
                type="submit"
                :disabled="!hayAlMenosUnDiaSeleccionado"
                class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Crear Tipo de Turno
              </button>
            </form>
          </div>

          <!-- Formulario: Asignar Turno a Trabajador -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Asignar Turno</h3>
            <form @submit.prevent="guardarAsignacion" class="space-y-4">
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
                <select 
                  v-model="formAsignacion.usuario_empresa_id" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar trabajador</option>
                  <option 
                    v-for="trabajador in trabajadores" 
                    :key="trabajador.id" 
                    :value="trabajador.id"
                  >
                    {{ trabajador.usuario_nombre }} {{ trabajador.usuario_apellido_pat }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Turno</label>
                <select 
                  v-model="formAsignacion.tipo_turno_id"
                  @change="onTipoTurnoChange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar tipo de turno</option>
                  <option 
                    v-for="tipoTurno in tiposTurnos" 
                    :key="tipoTurno.id" 
                    :value="tipoTurno.id"
                  >
                    {{ tipoTurno.nombre }} - ({{tipoTurno.hora_inicio}} - {{tipoTurno.hora_fin}})
                  </option>
                </select>
              </div>

              <!-- Mostrar detalle del turno seleccionado -->
              <div v-if="turnoSeleccionado" class="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <p class="font-medium text-blue-900 mb-2">Detalle del turno:</p>
                <p class="text-blue-700">Horario base: {{ turnoSeleccionado.hora_inicio }} - {{ turnoSeleccionado.hora_fin }}</p>
                <p class="text-blue-700 mt-1">Días laborables:</p>
                <ul class="list-disc list-inside text-blue-600 ml-2">
                  <li v-for="dia in turnoSeleccionado.dias.filter(d => d.trabaja)" :key="dia.dia_semana">
                    {{ dia.dia_semana.charAt(0).toUpperCase() + dia.dia_semana.slice(1) }}
                    <span v-if="dia.hora_inicio"> ({{ dia.hora_inicio }} - {{ dia.hora_fin }})</span>
                  </li>
                </ul>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input 
                  type="date" 
                  v-model="formAsignacion.fecha_inicio" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (opcional)</label>
                <input 
                  type="date" 
                  v-model="formAsignacion.fecha_fin" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button 
                type="submit" 
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Asignar Turno
              </button>
            </form>
          </div>
        </div>

        <!-- Panel derecho: Tabs con tablas -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Pestañas de navegación -->
          <div class="bg-white shadow rounded-lg">
            <div class="border-b border-gray-200">
              <nav class="flex -mb-px">
                <button
                  @click="tabActiva = 'asignaciones'"
                  :class="[
                    'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                    tabActiva === 'asignaciones'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  Turnos Asignados
                </button>
                <button
                  @click="tabActiva = 'tipos'"
                  :class="[
                    'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                    tabActiva === 'tipos'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  Tipos de Turno
                  <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                    {{ tiposTurnos.length }}
                  </span>
                </button>
              </nav>
            </div>

            <!-- Contenido: Turnos Asignados -->
            <div v-show="tabActiva === 'asignaciones'">
              <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900">Turnos Asignados</h3>
                <div class="flex space-x-3">
                  <input 
                    type="date" 
                    v-model="filtroFecha" 
                    class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <select 
                    v-model="filtroTipo" 
                    class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Todos los tipos</option>
                    <option 
                      v-for="tipo in tiposTurnos" 
                      :key="tipo.id" 
                      :value="tipo.id"
                    >
                      {{ tipo.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Turno</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días Laborables</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="turno in turnosFiltrados" :key="turno.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-10 w-10 flex-shrink-0">
                            <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span class="text-white font-medium">{{ turno.trabajador.iniciales }}</span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ turno.trabajador.nombre }}</div>
                            <div class="text-sm text-gray-500">{{ turno.trabajador.rut }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div>
                          <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {{ turno.tipo }}
                          </span>
                          <div class="text-xs text-gray-500 mt-1">
                            {{ turno.inicio }} - {{ turno.fin }}
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-xs text-gray-600">
                          <span v-for="(dia, idx) in turno.dias_laborables" :key="idx" 
                                class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-1 mb-1">
                            {{ dia.substr(0, 3) }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ formatearFecha(turno.fecha_inicio) }}
                        <span v-if="turno.fecha_fin"> - {{ formatearFecha(turno.fecha_fin) }}</span>
                        <span v-else class="text-green-600"> - Indefinido</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          :class="{
                            'bg-green-100 text-green-800': turno.estado === 'activo',
                            'bg-gray-100 text-gray-800': turno.estado === 'finalizado',
                            'bg-yellow-100 text-yellow-800': turno.estado === 'suspendido'
                          }"
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                        >
                          {{ turno.estado }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          v-if="turno.estado === 'activo'"
                          @click="eliminarTurnoAction(turno.id)"
                          class="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    <tr v-if="turnosFiltrados.length === 0">
                      <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        No hay turnos asignados
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Contenido: Tipos de Turno Creados -->
            <div v-show="tabActiva === 'tipos'">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Tipos de Turno Creados</h3>
                <p class="text-sm text-gray-500 mt-1">Gestiona los tipos de turno disponibles para asignar</p>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario Base</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días Laborables</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Colación</th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Asignaciones</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="tipo in tiposTurnos" :key="tipo.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ tipo.nombre }}</div>
                          <div v-if="tipo.descripcion" class="text-xs text-gray-500 mt-1">{{ tipo.descripcion }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span class="text-sm text-gray-900">{{ tipo.hora_inicio }} - {{ tipo.hora_fin }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-1">
                          <span 
                            v-for="dia in tipo.dias?.filter(d => d.trabaja)" 
                            :key="dia.dia_semana"
                            class="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800"
                          >
                            {{ dia.dia_semana.substr(0, 3).toUpperCase() }}
                          </span>
                          <span v-if="!tipo.dias || tipo.dias.filter(d => d.trabaja).length === 0" class="text-sm text-gray-400">
                            Sin días configurados
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div v-if="tipo.colacion_inicio && tipo.colacion_fin" class="flex items-center space-x-1">
                          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"></path>
                          </svg>
                          <span>{{ tipo.colacion_inicio }} - {{ tipo.colacion_fin }}</span>
                        </div>
                        <span v-else class="text-gray-400">Sin colación</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {{ contarAsignaciones(tipo.id) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          @click="verDetalleTipoTurno(tipo)"
                          class="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Ver
                        </button>
                        <button 
                          @click="eliminarTipoTurnoAction(tipo.id)"
                          :disabled="contarAsignaciones(tipo.id) > 0"
                          :class="[
                            'transition-colors',
                            contarAsignaciones(tipo.id) > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900'
                          ]"
                          :title="contarAsignaciones(tipo.id) > 0 ? 'No se puede eliminar: tiene asignaciones activas' : 'Eliminar tipo de turno'"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    <tr v-if="tiposTurnos.length === 0">
                      <td colspan="6" class="px-6 py-8 text-center">
                        <div class="flex flex-col items-center">
                          <svg class="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p class="text-gray-500 text-sm">No hay tipos de turno creados</p>
                          <p class="text-gray-400 text-xs mt-1">Crea uno usando el formulario de la izquierda</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal: Detalle de Tipo de Turno -->
    <div v-if="modalDetalleTurno.mostrar" class="fixed inset-0 z-50 overflow-y-auto" style="background-color: rgba(0,0,0,0.5);">
      <div class="flex items-center justify-center min-h-screen px-4 py-6">
        <!-- Contenido del modal -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ modalDetalleTurno.turno?.nombre || 'Sin nombre' }}
                </h3>
                <div v-if="modalDetalleTurno.turno?.descripcion" class="mt-1">
                  <p class="text-sm text-gray-500">{{ modalDetalleTurno.turno.descripcion }}</p>
                </div>
                
                <div class="mt-4 space-y-4">
                  <!-- Horario Base -->
                  <div class="border-l-4 border-purple-500 pl-4">
                    <p class="text-sm font-medium text-gray-700">Horario Base</p>
                    <p class="text-sm text-gray-900 mt-1">
                      {{ modalDetalleTurno.turno?.hora_inicio || '--:--' }} - {{ modalDetalleTurno.turno?.hora_fin || '--:--' }}
                    </p>
                  </div>

                  <!-- Colación -->
                  <div v-if="modalDetalleTurno.turno?.colacion_inicio" class="border-l-4 border-orange-500 pl-4">
                    <p class="text-sm font-medium text-gray-700">Horario de Colación</p>
                    <p class="text-sm text-gray-900 mt-1">
                      {{ modalDetalleTurno.turno.colacion_inicio }} - {{ modalDetalleTurno.turno.colacion_fin }}
                    </p>
                  </div>

                  <!-- Días de Trabajo -->
                  <div class="border-l-4 border-green-500 pl-4">
                    <p class="text-sm font-medium text-gray-700 mb-2">Días Laborables</p>
                    <div v-if="modalDetalleTurno.turno?.dias && modalDetalleTurno.turno.dias.filter(d => d.trabaja).length > 0" class="grid grid-cols-2 gap-2">
                      <div 
                        v-for="dia in modalDetalleTurno.turno.dias.filter(d => d.trabaja)" 
                        :key="dia.dia_semana"
                        class="bg-gray-50 rounded p-2"
                      >
                        <p class="text-sm font-medium text-gray-900 capitalize">{{ dia.dia_semana }}</p>
                        <p v-if="dia.hora_inicio" class="text-xs text-gray-600">
                          {{ dia.hora_inicio }} - {{ dia.hora_fin }}
                        </p>
                        <p v-else class="text-xs text-gray-500 italic">
                          Usa horario base
                        </p>
                      </div>
                    </div>
                    <p v-else class="text-sm text-gray-500 italic">No hay días configurados</p>
                  </div>

                  <!-- Estadísticas -->
                  <div class="bg-blue-50 rounded p-3">
                    <p class="text-sm font-medium text-blue-900">Asignaciones activas</p>
                    <p class="text-2xl font-bold text-blue-600 mt-1">
                      {{ contarAsignaciones(modalDetalleTurno.turno?.id) || 0 }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="modalDetalleTurno.mostrar = false"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notificacion.mostrar" class="fixed bottom-4 right-4 z-50">
      <div 
        :class="{
          'bg-green-50 border-green-400': notificacion.tipo === 'success',
          'bg-red-50 border-red-400': notificacion.tipo === 'error',
          'bg-blue-50 border-blue-400': notificacion.tipo === 'info'
        }"
        class="border-l-4 p-4 rounded shadow-lg"
      >
        <div class="flex items-center">
          <p 
            :class="{
              'text-green-700': notificacion.tipo === 'success',
              'text-red-700': notificacion.tipo === 'error',
              'text-blue-700': notificacion.tipo === 'info'
            }"
            class="text-sm font-medium"
          >
            {{ notificacion.mensaje }}
          </p>
          <button @click="cerrarNotificacion" class="ml-4">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import EmpresaServices from '../../../services/EmpresaService.js';
import { useEmpresa } from '../../../composables/useEmpresa.js';

const { obtenerTrabajadores, obtenerTurnos, eliminarTurno, obtenerTiposTurnos, crearTipoTurno , eliminarTipoTurno } = useEmpresa();

// Estados reactivos
const tabActiva = ref('asignaciones');
const filtroFecha = ref('');
const filtroTipo = ref('');
const trabajadores = ref([]);
const tiposTurnos = ref([]);
const turnosAsignados = ref([]);
const cargando = ref(false);
const turnoSeleccionado = ref(null);

const modalDetalleTurno = ref({
  mostrar: false,
  turno: null
});

const notificacion = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
});

// Días de la semana
const diasSemana = ref([
  { value: 'lunes', label: 'Lunes', trabaja: false, hora_inicio: '', hora_fin: '' },
  { value: 'martes', label: 'Martes', trabaja: false, hora_inicio: '', hora_fin: '' },
  { value: 'miércoles', label: 'Miércoles', trabaja: false, hora_inicio: '', hora_fin: '' },
  { value: 'jueves', label: 'Jueves', trabaja: false, hora_inicio: '', hora_fin: '' },
  { value: 'viernes', label: 'Viernes', trabaja: false, hora_inicio: '', hora_fin: '' },
  { value: 'sábado', label: 'Sábado', trabaja: false, hora_inicio: '', hora_fin: '' },
  { value: 'domingo', label: 'Domingo', trabaja: false, hora_inicio: '', hora_fin: '' }
]);

// Formularios
const formTipoTurno = reactive({
  nombre: '',
  descripcion: '',
  hora_inicio: '',
  hora_fin: '',
  colacion_inicio: '',
  colacion_fin: '',
  dias_trabajo: 5,
  dias_descanso: 2
});

const formAsignacion = reactive({
  usuario_empresa_id: '',
  tipo_turno_id: '',
  fecha_inicio: '',
  fecha_fin: ''
});

// Computed
const hayAlMenosUnDiaSeleccionado = computed(() => {
  return diasSemana.value.some(dia => dia.trabaja);
});

const turnosFiltrados = computed(() => {
  let turnos = turnosAsignados.value;

  if (filtroTipo.value) {
    turnos = turnos.filter(t => t.tipo_turno_id == filtroTipo.value);
  }

  if (filtroFecha.value) {
    turnos = turnos.filter(t => {
      const fechaInicio = new Date(t.fecha_inicio);
      const fechaFin = t.fecha_fin ? new Date(t.fecha_fin) : new Date('2099-12-31');
      const filtro = new Date(filtroFecha.value);
      return filtro >= fechaInicio && filtro <= fechaFin;
    });
  }

  return turnos;
});

// Funciones
const contarAsignaciones = (tipoTurnoId) => {
  return turnosAsignados.value.filter(t => t.tipo_turno_id === tipoTurnoId && t.estado === 'activo').length;
};

const verDetalleTipoTurno = (turno) => {
  console.log('Abriendo modal con turno:', turno);
  modalDetalleTurno.value = {
    mostrar: true,
    turno: turno
  };
  console.log('Estado del modal:', modalDetalleTurno.value);
};

const eliminarTipoTurnoAction = async (id) => {
  if (contarAsignaciones(id) > 0) {
    mostrarNotificacion('error', 'No se puede eliminar un tipo de turno con asignaciones activas');
    return;
  }

  if (!confirm('¿Está seguro de que desea eliminar este tipo de turno?')) return;

  try {
    await eliminarTipoTurno(id);
    await cargarTiposTurnos();
    mostrarNotificacion('success', 'Tipo de turno eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar tipo de turno:', error);
    mostrarNotificacion('error', 'Error al eliminar el tipo de turno');
  }
};

const mostrarNotificacion = (tipo, mensaje) => {
  notificacion.value = {
    mostrar: true,
    tipo,
    mensaje
  };

  setTimeout(() => {
    cerrarNotificacion();
  }, 5000);
};

const cerrarNotificacion = () => {
  notificacion.value.mostrar = false;
};

const guardarTipoTurno = async () => {
  try {
    if (!hayAlMenosUnDiaSeleccionado.value) {
      mostrarNotificacion('error', 'Debe seleccionar al menos un día de trabajo');
      return;
    }

    const diasData = diasSemana.value
      .filter(dia => dia.trabaja)
      .map(dia => ({
        dia_semana: dia.value,
        trabaja: true,
        hora_inicio: dia.hora_inicio || null,
        hora_fin: dia.hora_fin || null
      }));

    const tipoTurnoData = {
      ...formTipoTurno,
      dias: diasData
    };

    await crearTipoTurno(tipoTurnoData);
    mostrarNotificacion('success', 'Tipo de turno creado exitosamente');
    limpiarFormTipoTurno();
    await cargarTiposTurnos();
    tabActiva.value = 'tipos'; // Cambiar a la pestaña de tipos después de crear
  } catch (error) {
    console.error('Error al crear tipo de turno:', error);
    mostrarNotificacion('error', error.response?.data?.message || 'Error al crear el tipo de turno');
  }
};

const guardarAsignacion = async () => {
  try {
    await EmpresaServices.createTurno(formAsignacion);
    mostrarNotificacion('success', 'Turno asignado exitosamente');
    limpiarFormAsignacion();
    await fetchTurnos();
  } catch (error) {
    console.error('Error al asignar turno:', error);
    mostrarNotificacion('error', error.response?.data?.message || 'Error al asignar el turno');
  }
};

const eliminarTurnoAction = async (id) => {
  if (!confirm('¿Está seguro de que desea eliminar esta asignación de turno?')) return;

  try {
    await eliminarTurno(id);
    const index = turnosAsignados.value.findIndex(t => t.id === id);
    if (index !== -1) {
      turnosAsignados.value.splice(index, 1);
    }
    mostrarNotificacion('success', 'Turno eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    mostrarNotificacion('error', 'Error al eliminar el turno');
  }
};

const limpiarFormTipoTurno = () => {
  Object.keys(formTipoTurno).forEach(key => {
    if (key === 'dias_trabajo') formTipoTurno[key] = 5;
    else if (key === 'dias_descanso') formTipoTurno[key] = 2;
    else formTipoTurno[key] = '';
  });
  
  diasSemana.value.forEach(dia => {
    dia.trabaja = false;
    dia.hora_inicio = '';
    dia.hora_fin = '';
  });
};

const limpiarFormAsignacion = () => {
  Object.keys(formAsignacion).forEach(key => {
    formAsignacion[key] = '';
  });
  turnoSeleccionado.value = null;
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL');
};

const cargarTrabajadores = async () => {
  try {
    cargando.value = true;
    const response = await obtenerTrabajadores(true);
    trabajadores.value = response || [];
  } catch (error) {
    console.error('Error al cargar trabajadores:', error);
    trabajadores.value = [];
  } finally {
    cargando.value = false;
  }
};

const cargarTiposTurnos = async () => {
  try {
    const response = await obtenerTiposTurnos();
    console.log('Respuesta de tipos de turnos:', response);
    tiposTurnos.value = response || [];
  } catch (error) {
    console.error('Error al cargar tipos de turnos:', error);
    tiposTurnos.value = [];
  }
};

const fetchTurnos = async () => {
  try {
    const response = await obtenerTurnos();

    // Procesar turnos para incluir días laborables
    turnosAsignados.value = (response || []).map(turno => {
      const tipoTurno = tiposTurnos.value.find(t => t.id === turno.tipo_turno_id);
      const diasLaborables = tipoTurno?.dias?.filter(d => d.trabaja).map(d => d.dia_semana) || [];
      
      return {
        ...turno,
        dias_laborables: diasLaborables
      };
    });
  } catch (error) {
    console.error('Error al obtener turnos:', error);
  }
};

const onTipoTurnoChange = () => {
  const turno = tiposTurnos.value.find(t => t.id == formAsignacion.tipo_turno_id);
  turnoSeleccionado.value = turno || null;
};

onMounted(async () => {
  await cargarTrabajadores();
  await cargarTiposTurnos();
  await fetchTurnos();
});
</script>
