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
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.total }}</p>
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

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select v-model="filtros.estado" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                <option value="enrolado">Enrolado</option>
                <option value="no enrolado">No Enrolado</option>
                <option value="pendiente">Pendiente</option>
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
                <!-- Mensaje cuando no hay trabajadores -->
                <tr v-if="trabajadoresFiltrados.length === 0">
                  <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <p class="text-lg font-medium">No se encontraron trabajadores</p>
                      <p class="text-sm">{{ filtros.busqueda ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer trabajador' }}</p>
                    </div>
                  </td>
                </tr>

                <!-- Lista de trabajadores -->
                <tr v-for="trabajador in trabajadoresFiltrados" :key="trabajador.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span class="text-white font-medium">{{ getInitials(trabajador.usuario_nombre, trabajador.usuario_apellido) }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ trabajador.trab_nombre }} {{ trabajador.trab_ap_paterno }}</div>
                        <div class="text-sm text-gray-500">{{ trabajador.usuario_email || 'Sin email' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ trabajador.usuario_rut}}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ trabajador.departamento || 'Sin asignar' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getEstadoClass(trabajador)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getEstadoTrabajador(trabajador) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex space-x-1">
                      <span v-if="trabajador.tarjeta_asignada" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Tarjeta</span>
                      <span v-if="!trabajador.tarjeta_asignada" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Sin ID</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(trabajador.ultimo_acceso) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button @click="editarTrabajador(trabajador)" class="text-indigo-600 hover:text-indigo-900">Editar</button>
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
  </div>
</template>

<script setup>
import HeaderAdmin from '../../components/headerAdmin.vue';
import ModalNuevoTrabajador from '../../modals/ModalNuevoTrabajador.vue';
import ModalEnrolarTrabajador from '../../modals/ModalEnrolarTrabajador.vue';
import { ref, onMounted, computed } from 'vue';
import { useEmpresa } from '../../../composables/useEmpresa.js';


const { obtenerTrabajadores } = useEmpresa();

// Estados reactivos
const trabajadores = ref([]);
const modalNuevoAbierto = ref(false);
const modalEnrolarAbierto = ref(false);
const trabajadorSeleccionado = ref(null);
const cargando = ref(false);
const filtros = ref({
  busqueda: '',
  estado: '',
  departamento: ''
});

// Computed para filtrar trabajadores
const trabajadoresFiltrados = computed(() => {
  if (!trabajadores.value) return [];
  console.log(trabajadores.value);
  return trabajadores.value.filter(trabajador => {
    const matchBusqueda = !filtros.value.busqueda || 
      trabajador.trab_nombre.toLowerCase().includes(filtros.value.busqueda.toLowerCase()) ||
      trabajador.trab_ap_paterno.toLowerCase().includes(filtros.value.busqueda.toLowerCase()) ||
      trabajador.prov_rut.toString().toLowerCase().includes(filtros.value.busqueda.toLowerCase()) ||
      (trabajador.email && trabajador.email.toLowerCase().includes(filtros.value.busqueda.toLowerCase()));
    
    const estadoTrabajador = getEstadoTrabajador(trabajador);
    const matchEstado = !filtros.value.estado || estadoTrabajador === filtros.value.estado;
    const matchDepartamento = !filtros.value.departamento || trabajador.departamento === filtros.value.departamento;
    
    return matchBusqueda && matchEstado && matchDepartamento;
  });
});

// Computed para estadísticas
const estadisticas = computed(() => {
  if (!trabajadores.value) return { total: 0, enrolados: 0, noEnrolados: 0, pendientes: 0 };
  
  const total = trabajadores.value.length;
  const enrolados = trabajadores.value.filter(t => t.cuenta_creada === true).length;
  const noEnrolados = trabajadores.value.filter(t => t.cuenta_creada === false).length;
  const pendientes = trabajadores.value.filter(t => t.cuenta_creada === null || t.cuenta_creada === undefined).length;
  
  return { total, enrolados, noEnrolados, pendientes };
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

const cargarTrabajadores = async () => {
  try {
    cargando.value = true;
    const response = await obtenerTrabajadores(false);
    trabajadores.value = response || [];
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

// Métodos de acción
const editarTrabajador = (trabajador) => {
  console.log('Editar trabajador:', trabajador);
  // TODO: Implementar edición
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
