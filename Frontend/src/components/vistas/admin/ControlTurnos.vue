<template>
  <div class="min-h-screen bg-gray-100">


    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Control de Turnos</h1>
            <p class="text-gray-600 mt-2">Asignación, modificación y gestión de turnos de trabajo</p>
          </div>
          <div class="flex space-x-3">
            <button class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Nuevo Turno</span>
            </button>
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              <span>Asignar Masivo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Panel de Estadísticas de Turnos -->
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Turno Mañana</p>
                <p class="text-2xl font-bold text-gray-900">98 trabajadores</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Turno Tarde</p>
                <p class="text-2xl font-bold text-gray-900">72 trabajadores</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Turno Noche</p>
                <p class="text-2xl font-bold text-gray-900">45 trabajadores</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Cambios Hoy</p>
                <p class="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestión de Turnos -->
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Formulario de Turno -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Crear Nuevo Turno</h3>
            </div>
            <div class="p-6">
              <form @submit.prevent="guardarTurno" class="space-y-4">
                <!-- Trabajador -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
                  <select v-model="formTurno.usuario_id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Seleccionar trabajador</option>
                    <option v-for="trabajador in trabajadores" :key="trabajador.id" :value="trabajador.id">
                      {{ trabajador.nombre }}
                    </option>
                  </select>
                </div>

                <!-- Tipo de Turno -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Turno</label>
                  <select v-model="formTurno.tipo" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Seleccionar tipo</option>
                    <option value="mañana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                    <option value="especial">Especial</option>
                  </select>
                </div>

                <!-- Fecha y Hora de Inicio -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Inicio del Turno</label>
                  <input 
                    type="datetime-local" 
                    v-model="formTurno.inicio" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <!-- Fecha y Hora de Fin -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fin del Turno</label>
                  <input 
                    type="datetime-local" 
                    v-model="formTurno.fin" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <!-- Horario de Colación -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Inicio Colación</label>
                    <input 
                      type="time" 
                      v-model="formTurno.colacion_inicio" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fin Colación</label>
                    <input 
                      type="time" 
                      v-model="formTurno.colacion_fin" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <!-- Botones -->
                <div class="flex space-x-3">
                  <button 
                    type="submit" 
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Crear Turno
                  </button>
                  <button 
                    type="button" 
                    @click="limpiarFormulario"
                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Panel de Turnos Definidos -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Turnos Definidos</h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <!-- Turno Mañana -->
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <h4 class="font-medium text-gray-900">Turno Mañana</h4>
                      <p class="text-sm text-gray-500">08:00 - 16:00</p>
                      <p class="text-xs text-gray-400">Colación: 12:00 - 13:00</p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button @click="editarTipoTurno('mañana')" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</button>
                    <button class="text-green-600 hover:text-green-900 text-sm">Asignar</button>
                  </div>
                </div>

                <!-- Turno Tarde -->
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <h4 class="font-medium text-gray-900">Turno Tarde</h4>
                      <p class="text-sm text-gray-500">14:00 - 22:00</p>
                      <p class="text-xs text-gray-400">Colación: 18:00 - 18:45</p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button @click="editarTipoTurno('tarde')" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</button>
                    <button class="text-green-600 hover:text-green-900 text-sm">Asignar</button>
                  </div>
                </div>

                <!-- Turno Noche -->
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <h4 class="font-medium text-gray-900">Turno Noche</h4>
                      <p class="text-sm text-gray-500">22:00 - 06:00</p>
                      <p class="text-xs text-gray-400">Colación: 02:00 - 02:30</p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button @click="editarTipoTurno('noche')" class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</button>
                    <button class="text-green-600 hover:text-green-900 text-sm">Asignar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel de Cambios Recientes -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Cambios Recientes</h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <!-- Cambio 1 -->
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">
                      <span class="font-medium">Juan Pérez</span> cambió de turno tarde a turno mañana
                    </p>
                    <p class="text-xs text-gray-500">Solicitado por: Empleador - Hace 2 horas</p>
                  </div>
                </div>

                <!-- Cambio 2 -->
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">
                      <span class="font-medium">María González</span> solicitó cambio a turno noche
                    </p>
                    <p class="text-xs text-gray-500">Solicitado por: Trabajador - Pendiente aprobación</p>
                  </div>
                </div>

                <!-- Cambio 3 -->
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">
                      Turno especial creado para <span class="font-medium">Proyecto Urgente</span>
                    </p>
                    <p class="text-xs text-gray-500">6:00 - 14:00 - 15 trabajadores asignados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Turnos Asignados -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Turnos Asignados</h3>
            <div class="flex space-x-3">
              <input 
                type="date" 
                v-model="filtroFecha" 
                class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <select v-model="filtroTipo" class="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos los tipos</option>
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
                <option value="especial">Especial</option>
              </select>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colación</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modificado</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="turno in turnosAsignados" :key="turno.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ turno.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span class="text-white font-medium">{{ turno.trabajador_iniciales }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ turno.trabajador_nombre }}</div>
                        <div class="text-sm text-gray-500">ID: {{ turno.usuario_id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getColorTipo(turno.tipo)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                      {{ turno.tipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatearFechaHora(turno.inicio) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatearFechaHora(turno.fin) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div v-if="turno.colacion_inicio && turno.colacion_fin">
                      {{ turno.colacion_inicio }} - {{ turno.colacion_fin }}
                    </div>
                    <div v-else class="text-gray-400">Sin colación</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div v-if="turno.fecha_modificacion">
                      <div class="text-xs">{{ formatearFecha(turno.fecha_modificacion) }}</div>
                      <div class="text-xs text-gray-400">por {{ turno.modificado_por }}</div>
                      <div v-if="turno.motivo_modificacion" class="text-xs text-blue-600 cursor-pointer" 
                           @click="verMotivoModificacion(turno.motivo_modificacion)"
                           title="Ver motivo">
                        Ver motivo
                      </div>
                    </div>
                    <div v-else class="text-gray-400">Original</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button @click="eliminarTurno(turno.id)" class="text-red-600 hover:text-red-900">Eliminar</button>
                    </div>
                  </td>
                </tr>

                <!-- Mensaje cuando no hay turnos -->
                <tr v-if="turnosAsignados.length === 0">
                  <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay turnos asignados</h3>
                      <p class="text-gray-500">Comience creando un nuevo turno usando el formulario de la izquierda.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Paginación -->
          <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                <span v-if="turnosAsignados.length > 0">
                  Mostrando <span class="font-medium">1</span> a <span class="font-medium">{{ turnosAsignados.length }}</span> de <span class="font-medium">{{ turnosAsignados.length }}</span> turnos
                </span>
                <span v-else class="text-gray-500">No hay turnos para mostrar</span>
              </div>
              <div v-if="turnosAsignados.length > 0" class="flex space-x-2">
                <button class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Anterior</button>
                <button class="px-3 py-1 text-sm bg-purple-600 text-white rounded">1</button>
                <button class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Siguiente</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import HeaderAdmin from '../../components/headerAdmin.vue';
import AdminServices from '../../../services/AdminServices';

// Estados reactivos
const filtroFecha = ref('');
const filtroTipo = ref('');

// Formulario para crear turnos
const formTurno = reactive({
  usuario_id: '',
  tipo: '',
  inicio: '',
  fin: '',
  colacion_inicio: '',
  colacion_fin: ''
});

// Array de trabajadores (implementar con datos del backend)
const trabajadores = ref([
  // Estructura esperada:
  // {
  //   id: 1,
  //   nombre: 'Juan Pérez',
  //   iniciales: 'JP'
  // },
  // {
  //   id: 2,
  //   nombre: 'María González',
  //   iniciales: 'MG'
  // }
]);

// Array de turnos asignados (inicialmente vacío)
const turnosAsignados = ref([
  // Estructura esperada:
  // {
  //   id: 1,
  //   usuario_id: 1,
  //   trabajador_nombre: 'Juan Pérez',
  //   trabajador_iniciales: 'JP',
  //   tipo: 'mañana',
  //   inicio: '2024-12-15T08:00:00',
  //   fin: '2024-12-15T16:00:00',
  //   colacion_inicio: '12:00',
  //   colacion_fin: '13:00',
  //   fecha_modificacion: null,
  //   modificado_por: null,
  //   motivo_modificacion: null
  // }
]);

// Funciones
const guardarTurno = async () => {
  try {
    // Crear nuevo turno usando el servicio
    const response = await AdminServices.createTurno(formTurno);
    console.log('Turno creado:', response);
    
    // Limpiar el formulario
    limpiarFormulario();
    
    // Opcional: recargar la lista de turnos si tienes un método para eso
    // await obtenerTurnos();
    
  } catch (error) {
    console.error('Error al crear turno:', error);
    // Aquí podrías mostrar un mensaje de error al usuario
  }
};

const eliminarTurno = (id) => {
  if (confirm('¿Está seguro de eliminar este turno?')) {
    const index = turnosAsignados.value.findIndex(t => t.id === id);
    if (index !== -1) {
      turnosAsignados.value.splice(index, 1);
    }
  }
};

const limpiarFormulario = () => {
  Object.keys(formTurno).forEach(key => {
    formTurno[key] = '';
  });
};

const editarTipoTurno = (tipo) => {
  console.log('Editando tipo de turno:', tipo);
};

const verMotivoModificacion = (motivo) => {
  alert(motivo);
};

// Funciones auxiliares
const getColorTipo = (tipo) => {
  const colores = {
    'mañana': 'bg-blue-100 text-blue-800',
    'tarde': 'bg-orange-100 text-orange-800',
    'noche': 'bg-purple-100 text-purple-800',
    'especial': 'bg-green-100 text-green-800'
  };
  return colores[tipo] || 'bg-gray-100 text-gray-800';
};

const formatearFechaHora = (fechaHora) => {
  return new Date(fechaHora).toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL');
};

const obtenerNombreTrabajador = (usuarioId) => {
  const trabajador = trabajadores.value.find(t => t.id == usuarioId);
  return trabajador ? trabajador.nombre : 'Trabajador Desconocido';
};

const obtenerIniciales = (usuarioId) => {
  const trabajador = trabajadores.value.find(t => t.id == usuarioId);
  return trabajador ? trabajador.iniciales : 'TD';
};


const obtenerTrabajadores = async () => {
  try {
    const response = await AdminServices.obtenerTrabajadores();
    console.log('Trabajadores obtenidos:', response.data);
    trabajadores.value = response.data;
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
  }
};


const obtenerTurnos = async () => {
  try {
    const response = await AdminServices.obtenerTurnos();
    console.log('Turnos obtenidos:', response.data);
    turnosAsignados.value = response.data;
  } catch (error) {
    console.error('Error al obtener turnos:', error);
  }
};

onMounted(async () => {

  await obtenerTrabajadores();
  await obtenerTurnos();
});


</script>
