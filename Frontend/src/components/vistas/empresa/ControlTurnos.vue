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
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input 
                    type="time" 
                    v-model="formTipoTurno.hora_inicio" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
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

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Días Trabajo</label>
                  <input 
                    type="number" 
                    v-model.number="formTipoTurno.dias_trabajo" 
                    min="1"
                    max="7"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Días Descanso</label>
                  <input 
                    type="number" 
                    v-model.number="formTipoTurno.dias_descanso" 
                    min="0"
                    max="7"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                class="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
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
                    {{ trabajador }} {{ trabajador.usuario_apellido_pat }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Turno</label>
                <select 
                  v-model="formAsignacion.tipo_turno_id" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar tipo de turno</option>
                  <option 
                    v-for="tipoTurno in tiposTurnos" 
                    :key="tipoTurno.id" 
                    :value="tipoTurno.id"
                  >
                    {{ tipoTurno.nombre }} ({{ tipoTurno.hora_inicio }} - {{ tipoTurno.hora_fin }})
                  </option>
                </select>
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

        <!-- Panel derecho: Lista de turnos asignados -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
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
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
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
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {{ turno.tipo }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ turno.inicio }} - {{ turno.fin }}
                      <div v-if="turno.colacion_inicio" class="text-xs text-gray-500">
                        Colación: {{ turno.colacion_inicio }} - {{ turno.colacion_fin }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatearFecha(turno.fecha_inicio) }}
                      <span v-if="turno.fecha_fin"> - {{ formatearFecha(turno.fecha_fin) }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        :class="turno.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                        class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                      >
                        {{ turno.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        @click="eliminarTurnoAction(turno.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>

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

const { obtenerTrabajadores, obtenerTurnos, eliminarTurno, obtenerTiposTurnos, crearTipoTurno } = useEmpresa();

// Estados reactivos
const filtroFecha = ref('');
const filtroTipo = ref('');
const trabajadores = ref([]);
const tiposTurnos = ref([]);
const turnosAsignados = ref([]);
const cargando = ref(false);

const notificacion = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
});

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
    await crearTipoTurno(formTipoTurno);
    mostrarNotificacion('success', 'Tipo de turno creado exitosamente');
    limpiarFormTipoTurno();
    await cargarTiposTurnos();
  } catch (error) {
    console.error('Error al crear tipo de turno:', error);
    mostrarNotificacion('error', 'Error al crear el tipo de turno');
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
};

const limpiarFormAsignacion = () => {
  Object.keys(formAsignacion).forEach(key => {
    formAsignacion[key] = '';
  });
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
    tiposTurnos.value = response || [];
  } catch (error) {
    console.error('Error al cargar tipos de turnos:', error);
    tiposTurnos.value = [];
  }
};

const fetchTurnos = async () => {
  try {
    const response = await obtenerTurnos();
    turnosAsignados.value = response || [];
  } catch (error) {
    console.error('Error al obtener turnos:', error);
  }
};

onMounted(async () => {
  await cargarTrabajadores();
  await cargarTiposTurnos();
  await fetchTurnos();
});
</script>
