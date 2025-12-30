<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Formularios en 2 columnas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        <!-- Bloque 1: Crear Tipo de Turno -->
        <div class="bg-white shadow-lg rounded-lg p-6 h-fit">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Crear Tipo de Turno</h3>
          <form @submit.prevent="guardarTipoTurno" class="space-y-3">
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Turno</label>
                <input 
                  type="text" 
                  v-model="formTipoTurno.nombre" 
                  placeholder="Ej: Turno Mañana, 4x3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  v-model="formTipoTurno.descripcion" 
                  rows="2"
                  placeholder="Descripción del turno..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Jornada</label>
                <select 
                  v-model="formTipoTurno.tipo_jornada" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  required
                >
                  <option value="">Seleccionar tipo de jornada</option>
                  <option 
                    v-for="tipoJornada in tiposJornada" 
                    :key="tipoJornada.value" 
                    :value="tipoJornada.value"
                  >
                    {{ tipoJornada.label }}
                  </option>
                </select>
                <p v-if="formTipoTurno.tipo_jornada" class="mt-2 text-xs text-gray-500">
                  {{ obtenerDescripcionJornada(formTipoTurno.tipo_jornada) }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.hora_inicio"
                    @change="validarHorarioBase"
                    :class="{'border-red-500': erroresValidacion.horario}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.hora_fin"
                    @change="validarHorarioBase"
                    :class="{'border-red-500': erroresValidacion.horario}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>
              <p v-if="erroresValidacion.horario" class="text-xs text-red-600 mt-1">
                {{ erroresValidacion.horario }}
              </p>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Colación Inicio</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.colacion_inicio"
                    @change="validarColacion"
                    :class="{'border-red-500': erroresValidacion.colacion}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Colación Fin</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.colacion_fin"
                    @change="validarColacion"
                    :class="{'border-red-500': erroresValidacion.colacion}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
              <p v-if="erroresValidacion.colacion" class="text-xs text-red-600 mt-1">
                {{ erroresValidacion.colacion }}
              </p>

              <!-- Días de la semana -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Días de Trabajo</label>
                <div class="space-y-2">
                  <div v-for="(dia, index) in diasSemana" :key="dia.value">
                    <div class="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <input 
                        type="checkbox" 
                        :id="`dia-${dia.value}`"
                        v-model="dia.trabaja"
                        @change="validarHorarioDia(dia)"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label :for="`dia-${dia.value}`" class="flex-1 text-xs font-medium text-gray-700 cursor-pointer">
                        {{ dia.label }}
                      </label>
                      <div v-if="dia.trabaja" class="flex space-x-1">
                        <input 
                          type="time" 
                          v-model="dia.hora_inicio"
                          @change="validarHorarioDia(dia)"
                          :class="{'border-red-500': erroresValidacion.dias[dia.value]}"
                          placeholder="Hora inicio"
                          class="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input 
                          type="time" 
                          v-model="dia.hora_fin"
                          @change="validarHorarioDia(dia)"
                          :class="{'border-red-500': erroresValidacion.dias[dia.value]}"
                          placeholder="Hora fin"
                          class="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <p v-if="erroresValidacion.dias[dia.value]" class="text-xs text-red-600 mt-1 ml-6">
                      {{ erroresValidacion.dias[dia.value] }}
                    </p>
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-500">
                  Deja los horarios vacíos para usar el horario base del turno
                </p>
              </div>

              <button 
                type="submit"
                :disabled="!hayAlMenosUnDiaSeleccionado"
                class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Crear Tipo de Turno
              </button>
            </form>
          </div>

          <!-- Bloque 2: Asignar Turno a Trabajador -->
          <div class="bg-white shadow-lg rounded-lg p-6 h-fit">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Asignar Turno</h3>
            <form @submit.prevent="guardarAsignacion" class="space-y-3">
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
                <select 
                  v-model="formAsignacion.usuario_empresa_id" 
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar trabajador</option>
                  <option 
                    v-for="trabajador in trabajadores" 
                    :key="trabajador.id" 
                    :value="trabajador.id"
                  >
                    {{ trabajador.usuario_nombre }} {{ trabajador.usuario_apellido_pat }}
                    <span v-if="trabajador.usuario_id === authStore.user?.id"> (Tú)</span>
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Turno</label>
                <select 
                  v-model="formAsignacion.tipo_turno_id"
                  @change="onTipoTurnoChange"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              <div v-if="turnoSeleccionado" class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <p class="font-medium text-blue-900 mb-2">Detalle del turno:</p>
                <p class="text-blue-700">Horario base: {{ turnoSeleccionado.hora_inicio }} - {{ turnoSeleccionado.hora_fin }}</p>
                <p class="text-blue-700 mt-1">Días laborables:</p>
                <ul class="list-disc list-inside text-blue-600 ml-2 mt-1">
                  <li v-for="dia in turnoSeleccionado.dias.filter(d => d.trabaja)" :key="dia.dia_semana">
                    {{ dia.dia_semana.charAt(0).toUpperCase() + dia.dia_semana.slice(1) }}
                    <span v-if="dia.hora_inicio"> ({{ dia.hora_inicio }} - {{ dia.hora_fin }})</span>
                  </li>
                </ul>
                <div class="mt-3 pt-3 border-t border-blue-300">
                  <p class="font-semibold text-blue-900">Total horas semanales: {{ calcularHorasTurno(turnoSeleccionado).toFixed(2) }} hrs</p>
                </div>
              </div>

              <!-- Alerta de horas laborales -->
              <div v-if="formAsignacion.usuario_empresa_id && formAsignacion.tipo_turno_id" class="p-3 rounded-lg text-xs">
                <div v-if="(() => {
                  const trabajador = trabajadores.find(t => t.id == formAsignacion.usuario_empresa_id);
                  const tipoTurno = tiposTurnos.find(t => t.id == formAsignacion.tipo_turno_id);
                  if (!trabajador || !tipoTurno || !trabajador.horas_laborales) return false;
                  const horasTurno = calcularHorasTurno(tipoTurno);
                  return horasTurno > parseFloat(trabajador.horas_laborales);
                })()" class="bg-yellow-50 border border-yellow-400 p-3 rounded">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-xs text-yellow-700 font-medium">
                        ⚠️ Este turno excede las horas laborales contratadas del trabajador
                      </p>
                      <p class="text-xs text-yellow-600 mt-1">
                        Turno: {{ calcularHorasTurno(tiposTurnos.find(t => t.id == formAsignacion.tipo_turno_id)).toFixed(2) }} hrs/semana | 
                        Contrato: {{ trabajadores.find(t => t.id == formAsignacion.usuario_empresa_id).horas_laborales }} hrs/semana
                      </p>
                    </div>
                  </div>
                </div>
                <div v-else-if="(() => {
                  const trabajador = trabajadores.find(t => t.id == formAsignacion.usuario_empresa_id);
                  return trabajador && trabajador.horas_laborales;
                })()" class="bg-green-50 border border-green-200 p-3 rounded">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-xs text-green-700 font-medium">
                        ✓ Las horas del turno están dentro del contrato laboral
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input 
                  type="date" 
                  v-model="formAsignacion.fecha_inicio" 
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (opcional)</label>
                <input 
                  type="date" 
                  v-model="formAsignacion.fecha_fin" 
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button 
                type="submit" 
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Asignar Turno
              </button>
            </form>
          </div>
        </div><!-- fin grid 2 columnas formularios -->

        <!-- Bloque 3: Tabs con tablas -->
        <div class="bg-white shadow-lg rounded-lg">
          
          <!-- Pestañas de navegación -->
          <div class="border-b border-gray-200">
              <nav class="flex -mb-px">
                <button
                  @click="tabActiva = 'asignaciones'"
                  :class="[
                    'flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                    tabActiva === 'asignaciones'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  <span class="flex items-center justify-center">
                    Turnos Activos
                    <span class="ml-2 px-2.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                      {{ turnosActivos.length }}
                    </span>
                  </span>
                </button>
                <button
                  @click="tabActiva = 'historial'"
                  :class="[
                    'flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                    tabActiva === 'historial'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  <span class="flex items-center justify-center">
                    Historial de Modificaciones
                    <span class="ml-2 px-2.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                      {{ turnosModificados.length }}
                    </span>
                  </span>
                </button>
                <button
                  @click="tabActiva = 'tipos'"
                  :class="[
                    'flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                    tabActiva === 'tipos'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  <span class="flex items-center justify-center">
                    Tipos de Turno
                    <span class="ml-2 px-2.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                      {{ tiposTurnos.length }}
                    </span>
                  </span>
                </button>
              </nav>
            </div>

            <!-- Contenido: Turnos Activos -->
            <div v-show="tabActiva === 'asignaciones'">
              <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Turnos Activos</h3>
                  <p class="text-sm text-gray-500 mt-1">Turnos actualmente vigentes</p>
                </div>
                <div class="flex space-x-3">
                  <input 
                    type="date" 
                    v-model="filtroFecha" 
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <select 
                    v-model="filtroTipo" 
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Turno</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Laborables</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="turno in turnosActivosFiltrados" :key="turno.id" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-5 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-12 w-12 flex-shrink-0">
                            <div class="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
                              <span class="text-white font-semibold">{{ turno.trabajador.iniciales }}</span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                              {{ turno.trabajador.nombre }}
                              <span v-if="turno.trabajador.usuario_id === authStore.user?.id" class="ml-2 text-xs font-semibold text-indigo-600">(Tú)</span>
                            </div>
                            <div class="text-sm text-gray-500">{{ turno.trabajador.rut }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div>
                          <span class="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {{ turno.tipo }}
                          </span>
                          <div class="text-xs text-gray-500 mt-2 flex items-center">
                            <svg class="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {{ turno.inicio }} - {{ turno.fin }}
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="flex flex-wrap gap-1">
                          <span v-for="(dia, idx) in turno.dias_laborables" :key="idx" 
                                class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            {{ dia.substr(0, 3).toUpperCase() }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                        <div class="flex flex-col space-y-1">
                          <span class="font-medium">{{ formatearFecha(turno.fecha_inicio) }}</span>
                          <span v-if="turno.fecha_fin" class="text-xs">hasta {{ formatearFecha(turno.fecha_fin) }}</span>
                          <span v-else class="text-green-600 text-xs font-medium">Indefinido</span>
                        </div>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap">
                        <span class="bg-green-100 text-green-800 inline-flex px-3 py-1 text-xs font-medium rounded-full">
                          Activo
                        </span>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          @click="abrirModalModificarTurno(turno)"
                          class="text-indigo-600 hover:text-indigo-900 mr-4 font-medium"
                        >
                          Modificar
                        </button>
                        <button 
                          @click="eliminarTurnoAction(turno.id)"
                          class="text-red-600 hover:text-red-900 font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    <tr v-if="turnosActivosFiltrados.length === 0">
                      <td colspan="6" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center">
                          <svg class="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p class="text-gray-500 text-base">No hay turnos activos</p>
                          <p class="text-gray-400 text-sm mt-2">Asigna un turno usando el formulario de la izquierda</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Contenido: Historial de Modificaciones -->
            <div v-show="tabActiva === 'historial'">
              <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Historial de Modificaciones</h3>
                  <p class="text-sm text-gray-500 mt-1">Turnos que han sido modificados o finalizados</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Turno</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Laborables</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="turno in turnosModificados" :key="turno.id" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-5 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-12 w-12 flex-shrink-0">
                            <div class="h-12 w-12 rounded-full bg-gray-400 flex items-center justify-center shadow-md">
                              <span class="text-white font-semibold">{{ turno.trabajador.iniciales }}</span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                              {{ turno.trabajador.nombre }}
                              <span v-if="turno.trabajador.usuario_id === authStore.user?.id" class="ml-2 text-xs font-semibold text-indigo-600">(Tú)</span>
                            </div>
                            <div class="text-sm text-gray-500">{{ turno.trabajador.rut }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div>
                          <span class="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {{ turno.tipo }}
                          </span>
                          <div class="text-xs text-gray-500 mt-2 flex items-center">
                            <svg class="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {{ turno.inicio }} - {{ turno.fin }}
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="flex flex-wrap gap-1">
                          <span v-for="(dia, idx) in turno.dias_laborables" :key="idx" 
                                class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                            {{ dia.substr(0, 3).toUpperCase() }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                        <div class="flex flex-col space-y-1">
                          <span class="font-medium">{{ formatearFecha(turno.fecha_inicio) }}</span>
                          <span v-if="turno.fecha_fin" class="text-xs">hasta {{ formatearFecha(turno.fecha_fin) }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap">
                        <span 
                          :class="{
                            'bg-gray-100 text-gray-800': turno.estado === 'finalizado',
                            'bg-yellow-100 text-yellow-800': turno.estado === 'suspendido',
                            'bg-red-100 text-red-800': turno.estado === 'modificado'
                          }"
                          class="inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize"
                        >
                          {{ turno.estado }}
                        </span>
                      </td>
                      <td class="px-6 py-5 text-sm text-gray-500">
                        <span v-if="turno.motivo_cambio" class="text-xs">{{ turno.motivo_cambio }}</span>
                        <span v-else class="text-xs italic text-gray-400">Sin especificar</span>
                      </td>
                    </tr>
                    <tr v-if="turnosModificados.length === 0">
                      <td colspan="6" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center">
                          <svg class="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <p class="text-gray-500 text-base">No hay historial de modificaciones</p>
                          <p class="text-gray-400 text-sm mt-2">Los turnos modificados o finalizados aparecerán aquí</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Contenido: Tipos de Turno Creados -->
            <div v-show="tabActiva === 'tipos'">
              <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h3 class="text-lg font-semibold text-gray-900">Tipos de Turno Creados</h3>
                <p class="text-sm text-gray-500 mt-1">Gestiona los tipos de turno disponibles para asignar</p>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Jornada</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario Base</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Laborables</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colación</th>
                      <th class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asignaciones</th>
                      <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="tipo in tiposTurnos" :key="tipo.id" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-5">
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ tipo.nombre }}</div>
                          <div v-if="tipo.descripcion" class="text-xs text-gray-500 mt-1">{{ tipo.descripcion }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap">
                        <span 
                          v-if="tipo.tipo_jornada_id"
                          :class="{
                            'bg-blue-100 text-blue-800': tipo.tipo_jornada == 1,
                            'bg-purple-100 text-purple-800': tipo.tipo_jornada == 2,
                            'bg-orange-100 text-orange-800': tipo.tipo_jornada == 3,
                            'bg-green-100 text-green-800': tipo.tipo_jornada == 4,
                            'bg-indigo-100 text-indigo-800': tipo.tipo_jornada == 5,
                            'bg-yellow-100 text-yellow-800': tipo.tipo_jornada == 6
                          }"
                          class="inline-flex px-3 py-1 text-xs font-medium rounded-full"
                        >
                          {{ obtenerLabelJornada(tipo.tipo_jornada_id) }}
                        </span>
                        <span v-else class="text-xs text-gray-400">Sin especificar</span>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span class="text-sm text-gray-900 font-medium">{{ tipo.hora_inicio }} - {{ tipo.hora_fin }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="flex flex-wrap gap-1.5">
                          <span 
                            v-for="dia in tipo.dias?.filter(d => d.trabaja)" 
                            :key="dia.dia_semana"
                            class="inline-flex px-2.5 py-1 text-xs font-medium rounded bg-green-100 text-green-800"
                          >
                            {{ dia.dia_semana.substr(0, 3).toUpperCase() }}
                          </span>
                          <span v-if="!tipo.dias || tipo.dias.filter(d => d.trabaja).length === 0" class="text-sm text-gray-400 italic">
                            Sin días configurados
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                        <div v-if="tipo.colacion_inicio && tipo.colacion_fin" class="flex items-center space-x-2">
                          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"></path>
                          </svg>
                          <span>{{ tipo.colacion_inicio }} - {{ tipo.colacion_fin }}</span>
                        </div>
                        <span v-else class="text-gray-400 italic">Sin colación</span>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap text-center">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {{ contarAsignaciones(tipo.id) }}
                        </span>
                      </td>
                      <td class="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          @click="verDetalleTipoTurno(tipo)"
                          class="text-indigo-600 hover:text-indigo-900 mr-4 font-medium"
                        >
                          Ver
                        </button>
                        <button 
                          @click="eliminarTipoTurnoAction(tipo.id)"
                          :disabled="contarAsignaciones(tipo.id) > 0"
                          :class="[
                            'transition-colors font-medium',
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
                      <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center">
                          <svg class="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p class="text-gray-500 text-base font-medium">No hay tipos de turno creados</p>
                          <p class="text-gray-400 text-sm mt-2">Crea uno usando el formulario de la izquierda</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div><!-- fin bg-white shadow-lg rounded-lg (tabs) -->
        </div><!-- fin bloque 3 -->

    </div><!-- fin max-w-7xl -->
      
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
                  <!-- Tipo de Jornada -->
                  <div v-if="modalDetalleTurno.turno?.tipo_jornada" class="border-l-4 border-blue-500 pl-4">
                    <p class="text-sm font-medium text-gray-700">Tipo de Jornada</p>
                    <div class="mt-1">
                      <span 
                        :class="{
                          'bg-blue-100 text-blue-800': modalDetalleTurno.turno.tipo_jornada == 1,
                          'bg-purple-100 text-purple-800': modalDetalleTurno.turno.tipo_jornada == 2,
                          'bg-orange-100 text-orange-800': modalDetalleTurno.turno.tipo_jornada == 3,
                          'bg-green-100 text-green-800': modalDetalleTurno.turno.tipo_jornada == 4,
                          'bg-indigo-100 text-indigo-800': modalDetalleTurno.turno.tipo_jornada == 5,
                          'bg-yellow-100 text-yellow-800': modalDetalleTurno.turno.tipo_jornada == 6
                        }"
                        class="inline-flex px-2 py-1 text-sm font-medium rounded-full"
                      >
                        {{ obtenerLabelJornada(modalDetalleTurno.turno.tipo_jornada_id) }}
                      </span>
                      <p class="text-xs text-gray-600 mt-1">
                        {{ obtenerDescripcionJornada(modalDetalleTurno.turno.tipo_jornada) }}
                      </p>
                    </div>
                  </div>

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

    <!-- Modal: Modificar Turno Asignado -->
    <div v-if="modalModificarTurno.mostrar" class="fixed inset-0 z-50 overflow-y-auto" style="background-color: rgba(0,0,0,0.5);">
      <div class="flex items-center justify-center min-h-screen px-4 py-6">
        <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Modificar Turno
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Trabajador: <span class="font-medium text-gray-900">{{ modalModificarTurno.trabajadorNombre }}</span>
                  </p>
                  <p class="text-sm text-gray-500 mt-1">
                    Turno actual: <span class="font-medium text-gray-900">{{ modalModificarTurno.tipoTurnoActual }}</span>
                  </p>
                </div>
                
                <form @submit.prevent="guardarModificacionTurno" class="mt-4 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nuevo Tipo de Turno</label>
                    <select 
                      v-model="formModificarTurno.tipo_turno_id" 
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

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio del Nuevo Turno</label>
                    <input 
                      type="date" 
                      v-model="formModificarTurno.fecha_inicio" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <p class="mt-1 text-xs text-gray-500">
                      El turno actual se invalidará y el nuevo comenzará en esta fecha
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (opcional)</label>
                    <input 
                      type="date" 
                      v-model="formModificarTurno.fecha_fin" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                          Esta acción invalidará el turno actual y creará uno nuevo. El cambio quedará registrado en el historial.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="guardarModificacionTurno"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Modificar Turno
            </button>
            <button
              type="button"
              @click="cerrarModalModificarTurno"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
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
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import EmpresaServices from '@/services/EmpresaService.js';
import { useEmpresa } from '@/composables/useEmpresa.js';
import { useAuthStore } from '@/stores/authStore.js';

const authStore = useAuthStore();
const { obtenerTrabajadores, obtenerTurnos, eliminarTurno, obtenerTiposTurnos, crearTipoTurno , eliminarTipoTurno, modificarTurno } = useEmpresa();

// Tipos de jornada disponibles
const tiposJornada = [
  { value: 1, label: 'Ordinaria', descripcion: 'Jornada fija con horario establecido' },
  { value: 2, label: 'Por Turnos', descripcion: 'Jornada rotativa o alternada' },
  { value: 3, label: 'Excepcional', descripcion: 'Faena o turno autorizado por DT' },
  { value: 4, label: 'Parcial', descripcion: 'Jornada inferior a 30 horas semanales' },
  { value: 5, label: 'Nocturna', descripcion: 'Turno que se realiza en horario nocturno' },
  { value: 6, label: 'Bisemanal', descripcion: 'Jornada acumulada o excepcional en faenas remotas' }
];

// Computed para obtener la etiqueta de un tipo de jornada por su valor
const obtenerLabelJornada = (value) => {
  console.log('Obteniendo label para tipo de jornada:', value);
  const tipo = tiposJornada.find(t => t.value == value);
  return tipo ? tipo.label : 'Sin especificar';
};

const obtenerDescripcionJornada = (value) => {
  const tipo = tiposJornada.find(t => t.value == value);
  return tipo ? tipo.descripcion : '';
};

// Estados reactivos
const tabActiva = ref('asignaciones');
const filtroFecha = ref('');
const filtroTipo = ref('');
const trabajadores = ref([]);
const tiposTurnos = ref([]);
const turnosAsignados = ref([]);
const cargando = ref(false);
const turnoSeleccionado = ref(null);

// Estados de validación
const erroresValidacion = reactive({
  horario: '',
  colacion: '',
  dias: {}
});

const modalDetalleTurno = ref({
  mostrar: false,
  turno: null
});

const modalModificarTurno = ref({
  mostrar: false,
  turnoId: null,
  trabajadorNombre: '',
  tipoTurnoActual: ''
});

const formModificarTurno = reactive({
  tipo_turno_id: '',
  fecha_inicio: '',
  fecha_fin: ''
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
  tipo_jornada: '',
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

// Filtrar solo turnos activos
const turnosActivos = computed(() => {
  return turnosAsignados.value.filter(t => t.estado === 'activo');
});

// Filtrar turnos modificados/finalizados
const turnosModificados = computed(() => {
  return turnosAsignados.value.filter(t => t.estado !== 'activo');
});

// Aplicar filtros sobre turnos activos
const turnosActivosFiltrados = computed(() => {
  let turnos = turnosActivos.value;

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
const validarHorarioBase = () => {
  erroresValidacion.horario = '';
  
  if (formTipoTurno.hora_inicio && formTipoTurno.hora_fin) {
    if (formTipoTurno.hora_inicio >= formTipoTurno.hora_fin) {
      erroresValidacion.horario = 'La hora de inicio debe ser menor que la hora de fin';
      return false;
    }
  }
  return true;
};

const validarColacion = () => {
  erroresValidacion.colacion = '';
  
  // Si hay alguna hora de colación, ambas deben estar presentes
  if (formTipoTurno.colacion_inicio || formTipoTurno.colacion_fin) {
    if (!formTipoTurno.colacion_inicio || !formTipoTurno.colacion_fin) {
      erroresValidacion.colacion = 'Debe especificar ambas horas de colación';
      return false;
    }

    // Validar que colación inicio < colación fin
    if (formTipoTurno.colacion_inicio >= formTipoTurno.colacion_fin) {
      erroresValidacion.colacion = 'La hora de inicio debe ser menor que la hora de fin';
      return false;
    }

    // Validar que la colación esté dentro del rango del turno
    if (formTipoTurno.hora_inicio && formTipoTurno.hora_fin) {
      if (formTipoTurno.colacion_inicio < formTipoTurno.hora_inicio || 
          formTipoTurno.colacion_fin > formTipoTurno.hora_fin) {
        erroresValidacion.colacion = 'La colación debe estar dentro del horario del turno';
        return false;
      }
    }
  }
  return true;
};

const validarHorarioDia = (dia) => {
  if (!dia.trabaja) {
    delete erroresValidacion.dias[dia.value];
    return true;
  }

  if (dia.hora_inicio && dia.hora_fin) {
    if (dia.hora_inicio >= dia.hora_fin) {
      erroresValidacion.dias[dia.value] = 'Hora de inicio debe ser menor que hora de fin';
      return false;
    }
  }

  // Si se ingresa una hora, debe ingresarse la otra
  if ((dia.hora_inicio && !dia.hora_fin) || (!dia.hora_inicio && dia.hora_fin)) {
    erroresValidacion.dias[dia.value] = 'Debe especificar ambas horas o dejarlas vacías';
    return false;
  }

  delete erroresValidacion.dias[dia.value];
  return true;
};

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

const validarHorarios = () => {
  // Validar que hora inicio sea menor que hora fin
  if (formTipoTurno.hora_inicio && formTipoTurno.hora_fin) {
    if (formTipoTurno.hora_inicio >= formTipoTurno.hora_fin) {
      mostrarNotificacion('error', 'La hora de inicio debe ser menor que la hora de fin');
      return false;
    }
  }

  // Validar colación
  if (formTipoTurno.colacion_inicio || formTipoTurno.colacion_fin) {
    // Si se ingresa una, debe ingresarse la otra
    if (!formTipoTurno.colacion_inicio || !formTipoTurno.colacion_fin) {
      mostrarNotificacion('error', 'Debe especificar tanto la hora de inicio como la hora de fin de la colación');
      return false;
    }

    // Validar que colación inicio < colación fin
    if (formTipoTurno.colacion_inicio >= formTipoTurno.colacion_fin) {
      mostrarNotificacion('error', 'La hora de inicio de colación debe ser menor que la hora de fin');
      return false;
    }

    // Validar que la colación esté dentro del rango del turno
    if (formTipoTurno.hora_inicio && formTipoTurno.hora_fin) {
      if (formTipoTurno.colacion_inicio < formTipoTurno.hora_inicio || 
          formTipoTurno.colacion_fin > formTipoTurno.hora_fin) {
        mostrarNotificacion('error', 'El horario de colación debe estar dentro del horario del turno');
        return false;
      }
    }
  }

  // Validar horarios personalizados de días
  for (const dia of diasSemana.value) {
    if (dia.trabaja && dia.hora_inicio && dia.hora_fin) {
      if (dia.hora_inicio >= dia.hora_fin) {
        mostrarNotificacion('error', `El horario del día ${dia.label} es inválido: la hora de inicio debe ser menor que la hora de fin`);
        return false;
      }
    }

    // Si se ingresa una hora, debe ingresarse la otra
    if (dia.trabaja && ((dia.hora_inicio && !dia.hora_fin) || (!dia.hora_inicio && dia.hora_fin))) {
      mostrarNotificacion('error', `Para el día ${dia.label} debe especificar tanto la hora de inicio como la hora de fin, o dejar ambas vacías para usar el horario base`);
      return false;
    }
  }

  return true;
};

const guardarTipoTurno = async () => {
  try {
    if (!hayAlMenosUnDiaSeleccionado.value) {
      mostrarNotificacion('error', 'Debe seleccionar al menos un día de trabajo');
      return;
    }

    // Validar horarios antes de guardar
    if (!validarHorarios()) {
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
    // Validar horas laborales antes de guardar
    if (!validarHorasLaborales()) {
      return; // El usuario canceló la asignación
    }

    console.log('Asignando turno con datos:', formAsignacion);
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

const abrirModalModificarTurno = (turno) => {
  modalModificarTurno.value = {
    mostrar: true,
    turnoId: turno.id,
    trabajadorNombre: turno.trabajador.nombre,
    tipoTurnoActual: turno.tipo
  };
  
  // Pre-cargar datos actuales
  formModificarTurno.tipo_turno_id = turno.tipo_turno_id;
  formModificarTurno.fecha_inicio = turno.fecha_inicio;
  formModificarTurno.fecha_fin = turno.fecha_fin || '';
};

const cerrarModalModificarTurno = () => {
  modalModificarTurno.value = {
    mostrar: false,
    turnoId: null,
    trabajadorNombre: '',
    tipoTurnoActual: ''
  };
  
  formModificarTurno.tipo_turno_id = '';
  formModificarTurno.fecha_inicio = '';
  formModificarTurno.fecha_fin = '';
};

const guardarModificacionTurno = async () => {
  try {
    if (!formModificarTurno.tipo_turno_id) {
      mostrarNotificacion('error', 'Debe seleccionar un tipo de turno');
      return;
    }

    if (!formModificarTurno.fecha_inicio) {
      mostrarNotificacion('error', 'Debe especificar la fecha de inicio');
      return;
    }

    await modificarTurno(modalModificarTurno.value.turnoId, formModificarTurno);
    mostrarNotificacion('success', 'Turno modificado exitosamente');
    cerrarModalModificarTurno();
    await fetchTurnos();
  } catch (error) {
    console.error('Error al modificar turno:', error);
    mostrarNotificacion('error', error.response?.data?.message || 'Error al modificar el turno');
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

  // Limpiar errores de validación
  erroresValidacion.horario = '';
  erroresValidacion.colacion = '';
  erroresValidacion.dias = {};
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
    console.log('Respuesta de trabajadores:', response);
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

const calcularHorasTurno = (tipoTurno) => {
  if (!tipoTurno || !tipoTurno.dias) return 0;

  let totalHorasSemanal = 0;

  // Calcular horas para cada día laboral
  tipoTurno.dias.filter(d => d.trabaja).forEach(dia => {
    const horaInicio = dia.hora_inicio || tipoTurno.hora_inicio;
    const horaFin = dia.hora_fin || tipoTurno.hora_fin;

    if (horaInicio && horaFin) {
      // Convertir horas a minutos
      const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
      const [finHoras, finMinutos] = horaFin.split(':').map(Number);

      const inicioEnMinutos = inicioHoras * 60 + inicioMinutos;
      const finEnMinutos = finHoras * 60 + finMinutos;

      // Calcular diferencia en horas
      let diferenciaMinutos = finEnMinutos - inicioEnMinutos;
      
      // Si el turno cruza la medianoche
      if (diferenciaMinutos < 0) {
        diferenciaMinutos += 24 * 60;
      }

      // Restar tiempo de colación si existe
      if (tipoTurno.colacion_inicio && tipoTurno.colacion_fin) {
        const [colInicioHoras, colInicioMinutos] = tipoTurno.colacion_inicio.split(':').map(Number);
        const [colFinHoras, colFinMinutos] = tipoTurno.colacion_fin.split(':').map(Number);

        const colInicioEnMinutos = colInicioHoras * 60 + colInicioMinutos;
        const colFinEnMinutos = colFinHoras * 60 + colFinMinutos;

        const colacionMinutos = colFinEnMinutos - colInicioEnMinutos;
        diferenciaMinutos -= colacionMinutos;
      }

      totalHorasSemanal += diferenciaMinutos / 60;
    }
  });

  return totalHorasSemanal;
};

const validarHorasLaborales = () => {
  if (!formAsignacion.usuario_empresa_id || !formAsignacion.tipo_turno_id) {
    return true;
  }

  // Obtener trabajador seleccionado
  const trabajador = trabajadores.value.find(t => t.id == formAsignacion.usuario_empresa_id);
  if (!trabajador || !trabajador.horas_laborales) {
    return true;
  }

  // Obtener tipo de turno seleccionado
  const tipoTurno = tiposTurnos.value.find(t => t.id == formAsignacion.tipo_turno_id);
  if (!tipoTurno) {
    return true;
  }

  // Calcular horas del turno
  const horasTurno = calcularHorasTurno(tipoTurno);
  const horasLaboralesContrato = parseFloat(trabajador.horas_laborales);

  console.log('Horas del turno:', horasTurno);
  console.log('Horas laborales contrato:', horasLaboralesContrato);

  // Si excede las horas laborales, mostrar alerta
  if (horasTurno > horasLaboralesContrato) {
    const diferencia = (horasTurno - horasLaboralesContrato).toFixed(2);
    const mensaje = `⚠️ ADVERTENCIA: El turno asignado contempla ${horasTurno.toFixed(2)} horas semanales, ` +
                   `pero el trabajador tiene contratadas ${horasLaboralesContrato} horas semanales. ` +
                   `Esto excede en ${diferencia} horas semanales el contrato del trabajador.\n\n` +
                   `¿Desea continuar con la asignación de todas formas?`;
    
    return confirm(mensaje);
  }

  return true;
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
