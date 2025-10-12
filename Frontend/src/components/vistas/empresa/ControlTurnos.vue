<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Notificación Toast -->
    <div v-if="notificacion.mostrar" 
         class="fixed top-4 right-4 z-50 max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 transform transition-all duration-300"
         :class="{
           'border-green-500': notificacion.tipo === 'success',
           'border-red-500': notificacion.tipo === 'error',
           'border-blue-500': notificacion.tipo === 'info',
           'border-yellow-500': notificacion.tipo === 'warning'
         }">
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <!-- Icono Success -->
            <svg v-if="notificacion.tipo === 'success'" class="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- Icono Error -->
            <svg v-else-if="notificacion.tipo === 'error'" class="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- Icono Info -->
            <svg v-else-if="notificacion.tipo === 'info'" class="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- Icono Warning -->
            <svg v-else class="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">
              {{ notificacion.mensaje }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button @click="cerrarNotificacion" class="inline-flex text-gray-400 hover:text-gray-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div v-if="modalConfirmacion.mostrar" class="fixed inset-0 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div class="mt-3 text-center">
            <h3 class="text-lg font-medium text-gray-900">{{ modalConfirmacion.titulo }}</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">{{ modalConfirmacion.mensaje }}</p>
            </div>
            <div class="flex gap-3 px-4 py-3">
              <button 
                @click="confirmarAccion"
                class="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Confirmar
              </button>
              <button 
                @click="cancelarAccion"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ver Motivo -->
    <div v-if="modalMotivo.mostrar" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between pb-3 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Motivo de Modificación</h3>
            <button @click="cerrarModalMotivo" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="mt-4 px-4 py-3">
            <p class="text-sm text-gray-700">{{ modalMotivo.mensaje }}</p>
          </div>
          <div class="flex justify-end px-4 py-3 border-t border-gray-200 mt-4">
            <button 
              @click="cerrarModalMotivo"
              class="px-4 py-2 bg-gray-200 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Control de Turnos</h1>
            <p class="text-gray-600 mt-2">Asignación, modificación y gestión de turnos de trabajo</p>
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
                  <div v-if="cargando" class="flex items-center py-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    <span class="text-sm text-gray-600">Cargando trabajadores...</span>
                  </div>
                  <select v-else v-model="formTurno.usuario_id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Seleccionar trabajador</option>
                    <option v-for="trabajador in trabajadores" :key="trabajador.id" :value="trabajador.id">
                      {{ trabajador.usuario_nombre }} 
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

                <!-- Día -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Día</label>
                  <select v-model="formTurno.dia" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Seleccionar día</option>
                    <option value="lunes">Lunes</option>
                    <option value="martes">Martes</option>
                    <option value="miercoles">Miércoles</option>
                    <option value="jueves">Jueves</option>
                    <option value="viernes">Viernes</option>
                    <option value="sabado">Sábado</option>
                    <option value="domingo">Domingo</option>
                  </select>
                </div>

                <!-- Hora de Inicio -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Inicio</label>
                  <input 
                    type="time" 
                    v-model="formTurno.inicio" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <!-- Hora de Fin -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Fin</label>
                  <input 
                    type="time" 
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
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dia</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Inicio</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Fin</th>
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
                          <span class="text-white font-medium">{{ turno.trabajador.iniciales }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ turno.trabajador.nombre }}</div>
                        <div class="text-sm text-gray-500">ID: {{ turno.trabajador.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getColorTipo(turno.tipo)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                      {{ turno.tipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ turno.dia }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatearHora(turno.inicio) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatearHora(turno.fin) }}
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
                      <button @click="eliminarTurnoAction(turno.id)" class="text-red-600 hover:text-red-900">Eliminar</button>
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
import EmpresaServices from '../../../services/EmpresaService.js';
import { useEmpresa } from '../../../composables/useEmpresa.js';

const { obtenerTrabajadores, obtenerTurnos, eliminarTurno} = useEmpresa();

// Estados reactivos
const filtroFecha = ref('');
const filtroTipo = ref('');
const trabajadores = ref([]);
const cargando = ref(false);

// Estados para notificaciones y modales
const notificacion = ref({
  mostrar: false,
  tipo: 'success', // 'success', 'error', 'info', 'warning'
  mensaje: ''
});

const modalConfirmacion = ref({
  mostrar: false,
  titulo: '',
  mensaje: '',
  accion: null
});

const modalMotivo = ref({
  mostrar: false,
  mensaje: ''
});

// Formulario para crear turnos
const formTurno = reactive({
  usuario_id: '',
  tipo: '',
  dia: '',
  inicio: '',
  fin: '',
  colacion_inicio: '',
  colacion_fin: ''
});

// Array de turnos asignados (inicialmente vacío)
const turnosAsignados = ref([
  // Estructura esperada:
  // {
  //   id: 1,
  //   usuario_id: 1,
  //   trabajador_nombre: 'Juan Pérez',
  //   trabajador_iniciales: 'JP',
  //   tipo: 'mañana',
  //   inicio: '08:00',
  //   fin: '16:00',
  //   colacion_inicio: '12:00',
  //   colacion_fin: '13:00',
  //   fecha_modificacion: null,
  //   modificado_por: null,
  //   motivo_modificacion: null
  // }
]);

// Funciones
const mostrarNotificacion = (tipo, mensaje) => {
  notificacion.value = {
    mostrar: true,
    tipo,
    mensaje
  };
  
  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    cerrarNotificacion();
  }, 5000);
};

const cerrarNotificacion = () => {
  notificacion.value.mostrar = false;
};

const mostrarModalConfirmacion = (titulo, mensaje, accion) => {
  modalConfirmacion.value = {
    mostrar: true,
    titulo,
    mensaje,
    accion
  };
};

const confirmarAccion = () => {
  if (modalConfirmacion.value.accion) {
    modalConfirmacion.value.accion();
  }
  modalConfirmacion.value.mostrar = false;
};

const cancelarAccion = () => {
  modalConfirmacion.value.mostrar = false;
};

const cerrarModalMotivo = () => {
  modalMotivo.value.mostrar = false;
};

const guardarTurno = async () => {
  try {
    // Validar campos requeridos
    if (!formTurno.usuario_id || !formTurno.tipo || !formTurno.dia || !formTurno.inicio || !formTurno.fin) {
      mostrarNotificacion('warning', 'Por favor complete todos los campos obligatorios');
      return;
    }
    
    // Crear nuevo turno usando el servicio
    console.log('Guardando turno:', formTurno);
    const response = await EmpresaServices.createTurno(formTurno);
    console.log('Turno creado:', response);
    
    mostrarNotificacion('success', 'Turno creado exitosamente');
    
    // Limpiar el formulario
    limpiarFormulario();
    
    // Recargar la lista de turnos
    await fetchTurnos();
    
  } catch (error) {
    console.error('Error al crear turno:', error);
    mostrarNotificacion('error', 'Error al crear el turno. Por favor intente nuevamente');
  }
};

const eliminarTurnoAction = async (id) => {
  mostrarModalConfirmacion(
    'Confirmar eliminación',
    '¿Está seguro de que desea eliminar este turno? Esta acción no se puede deshacer.',
    async () => {
      try {
        await eliminarTurno(id);
        const index = turnosAsignados.value.findIndex(t => t.id === id);
        if (index !== -1) {
          turnosAsignados.value.splice(index, 1);
        }
        mostrarNotificacion('success', 'Turno eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar turno:', error);
        mostrarNotificacion('error', 'Error al eliminar el turno. Por favor intente nuevamente');
      }
    }
  );
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
  modalMotivo.value = {
    mostrar: true,
    mensaje: motivo
  };
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
  // Si es solo hora (formato HH:MM), devolverla tal como está
  if (typeof fechaHora === 'string' && fechaHora.includes(':') && !fechaHora.includes('T')) {
    return fechaHora;
  }
  // Si es fecha completa, formatearla como antes
  return new Date(fechaHora).toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatearHora = (hora) => {
  // Formatear solo la hora
  return hora || 'No definido';
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL');
};

const obtenerNombreTrabajador = (usuarioId) => {
  const trabajador = trabajadores.value.find(t => (t.prov_id || t.id) == usuarioId);
  return trabajador ? `${trabajador.trab_nombre} ${trabajador.trab_ap_paterno}` : 'Trabajador Desconocido';
};

const obtenerIniciales = (usuarioId) => {
  const trabajador = trabajadores.value.find(t => (t.prov_id || t.id) == usuarioId);
  if (trabajador) {
    const inicial1 = trabajador.trab_nombre ? trabajador.trab_nombre.charAt(0).toUpperCase() : '';
    const inicial2 = trabajador.trab_ap_paterno ? trabajador.trab_ap_paterno.charAt(0).toUpperCase() : '';
    return inicial1 + inicial2;
  }
  return 'TD';
};


const cargarTrabajadores = async () => {
  try {
    cargando.value = true;
    const response = await obtenerTrabajadores(true);
    trabajadores.value = response || [];
    console.log(trabajadores.value)
  } catch (error) {
    console.error('Error al cargar trabajadores:', error);
    trabajadores.value = [];
  } finally {
    cargando.value = false;
  }
};


const fetchTurnos = async () => {
  try {
    const response = await obtenerTurnos();
    turnosAsignados.value = response;
  } catch (error) {
    console.error('Error al obtener turnos:', error);
  }
};

onMounted(async () => {
  await cargarTrabajadores();
  await fetchTurnos();
});


</script>
