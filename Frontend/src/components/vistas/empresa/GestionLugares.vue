<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestión de Lugares</h1>
            <p class="text-gray-600 mt-2">Administración de lugares de trabajo de la empresa</p>
          </div>
          <button 
            @click="abrirModalNuevo"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Nuevo Lugar</span>
          </button>
        </div>

        <!-- Filtros y búsqueda -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Búsqueda -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar lugar</label>
              <div class="relative">
                <input
                  v-model="filtros.busqueda"
                  type="text"
                  placeholder="Buscar por nombre, dirección, comuna o ciudad..."
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
              <select
                v-model="filtros.estado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todos</option>
                <option value="1">Activos</option>
                <option value="0">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tabla de lugares -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comuna/Ciudad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Región</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Indicador de carga -->
                <tr v-if="cargando">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span class="ml-3">Cargando lugares...</span>
                    </div>
                  </td>
                </tr>

                <!-- Lista de lugares -->
                <tr v-else-if="lugaresFiltrados.length > 0" v-for="lugar in lugaresFiltrados" :key="lugar.lugar_id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg class="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ lugar.nombre || 'Sin nombre' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ obtenerDireccionCompleta(lugar) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ lugar.comuna }}</div>
                    <div class="text-sm text-gray-500">{{ lugar.ciudad }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ lugar.region }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        lugar.estado === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ lugar.estado === 1 ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        @click="editarLugar(lugar)"
                        class="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        @click="toggleEstadoLugar(lugar)"
                        :class="[
                          lugar.estado === 1 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        ]"
                        :title="lugar.estado === 1 ? 'Desactivar' : 'Activar'"
                      >
                        <svg v-if="lugar.estado === 1" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                        </svg>
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Sin resultados -->
                <tr v-else>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay lugares registrados</h3>
                      <p class="text-gray-500 mb-4">Comienza agregando el primer lugar de trabajo</p>
                      <button 
                        @click="abrirModalNuevo"
                        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Agregar primer lugar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Crear/Editar Lugar -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ modoEdicion ? 'Editar Lugar' : 'Nuevo Lugar' }}
            </h3>
            <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="guardarLugar" class="space-y-4">
            <!-- Nombre del lugar -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Lugar *
              </label>
              <input
                v-model="formulario.nombre"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Oficina Central, Bodega Norte, etc."
              />
            </div>

            <!-- Dirección -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                <input
                  v-model="formulario.calle"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Av. Providencia"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  v-model="formulario.numero"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1234"
                />
              </div>
            </div>

            <!-- Piso y Oficina -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Piso</label>
                <input
                  v-model="formulario.piso"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="3"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Oficina/Depto</label>
                <input
                  v-model="formulario.oficina"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="301"
                />
              </div>
            </div>

            <!-- Comuna, Ciudad, Región -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                <input
                  v-model="formulario.comuna"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Providencia"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input
                  v-model="formulario.ciudad"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Santiago"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Región</label>
                <input
                  v-model="formulario.region"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Metropolitana"
                />
              </div>
            </div>

            <!-- Coordenadas -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                <input
                  v-model="formulario.lat"
                  type="number"
                  step="any"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="-33.4489"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                <input
                  v-model="formulario.lon"
                  type="number"
                  step="any"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="-70.6693"
                />
              </div>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                v-model="formulario.estado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option :value="1">Activo</option>
                <option :value="0">Inactivo</option>
              </select>
            </div>

            <!-- Mensaje de error -->
            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ error }}
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="cerrarModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="guardando"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../../composables/useAuth.js';
import LugarService from '../../../services/LugarService.js';

const { user } = useAuth();

// Estados reactivos
const lugares = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const error = ref(null);

// Filtros
const filtros = ref({
  busqueda: '',
  estado: ''
});

// Formulario
const formulario = ref({
  lugar_id: null,
  nombre: '',
  calle: '',
  numero: '',
  piso: '',
  oficina: '',
  comuna: '',
  ciudad: '',
  region: '',
  lat: null,
  lon: null,
  estado: 1
});

// Computed
const lugaresFiltrados = computed(() => {
  let resultado = lugares.value;

  // Filtrar por búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase();
    resultado = resultado.filter(lugar => 
      (lugar.nombre || '').toLowerCase().includes(busqueda) ||
      (lugar.calle || '').toLowerCase().includes(busqueda) ||
      (lugar.comuna || '').toLowerCase().includes(busqueda) ||
      (lugar.ciudad || '').toLowerCase().includes(busqueda)
    );
  }

  // Filtrar por estado
  if (filtros.value.estado !== '') {
    resultado = resultado.filter(lugar => lugar.estado === parseInt(filtros.value.estado));
  }

  return resultado;
});

// Métodos
const cargarLugares = async () => {
  try {
    cargando.value = true;
    error.value = null;

    // El backend usa el empresa_id del usuario autenticado, no necesitamos enviarlo
    const response = await LugarService.obtenerTodosLosLugares();
    lugares.value = response.data || [];
  } catch (err) {
    console.error('Error al cargar lugares:', err);
    error.value = 'Error al cargar los lugares';
    lugares.value = [];
  } finally {
    cargando.value = false;
  }
};

const abrirModalNuevo = () => {
  modoEdicion.value = false;
  formulario.value = {
    lugar_id: null,
    nombre: '',
    calle: '',
    numero: '',
    piso: '',
    oficina: '',
    comuna: '',
    ciudad: '',
    region: '',
    lat: null,
    lon: null,
    estado: 1
  };
  error.value = null;
  mostrarModal.value = true;
};

const editarLugar = (lugar) => {
  modoEdicion.value = true;
  formulario.value = {
    lugar_id: lugar.lugar_id,
    nombre: lugar.nombre || '',
    calle: lugar.calle || '',
    numero: lugar.numero || '',
    piso: lugar.piso || '',
    oficina: lugar.oficina || '',
    comuna: lugar.comuna || '',
    ciudad: lugar.ciudad || '',
    region: lugar.region || '',
    lat: lugar.lat,
    lon: lugar.lon,
    estado: lugar.estado
  };
  error.value = null;
  mostrarModal.value = true;
};

const guardarLugar = async () => {
  try {
    guardando.value = true;
    error.value = null;

    // No es necesario enviar empresa_id, el backend lo toma del usuario autenticado
    const datosLugar = {
      ...formulario.value
    };

    if (modoEdicion.value) {
      await LugarService.actualizarLugar(formulario.value.lugar_id, datosLugar);
    } else {
      await LugarService.crearLugar(datosLugar);
    }

    await cargarLugares();
    cerrarModal();
  } catch (err) {
    console.error('Error al guardar lugar:', err);
    error.value = err.response?.data?.message || 'Error al guardar el lugar';
  } finally {
    guardando.value = false;
  }
};

const toggleEstadoLugar = async (lugar) => {
  try {
    const nuevoEstado = lugar.estado === 1 ? 0 : 1;
    
    if (nuevoEstado === 0) {
      if (!confirm(`¿Está seguro de desactivar el lugar "${lugar.nombre}"?`)) {
        return;
      }
      await LugarService.desactivarLugar(lugar.lugar_id);
    } else {
      await LugarService.activarLugar(lugar.lugar_id);
    }
    
    await cargarLugares();
  } catch (err) {
    console.error('Error al cambiar estado del lugar:', err);
    error.value = 'Error al cambiar el estado del lugar';
  }
};

const cerrarModal = () => {
  mostrarModal.value = false;
  modoEdicion.value = false;
  error.value = null;
};

const obtenerDireccionCompleta = (lugar) => {
  const partes = [
    lugar.calle,
    lugar.numero,
    lugar.piso ? `Piso ${lugar.piso}` : null,
    lugar.oficina ? `Of. ${lugar.oficina}` : null
  ].filter(Boolean);
  
  return partes.length > 0 ? partes.join(', ') : 'Sin dirección';
};

// Lifecycle
onMounted(() => {
  cargarLugares();
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
