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
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Calle
                  <span v-if="obteniendoDireccion" class="text-xs text-blue-600 ml-2">
                    (Obteniendo dirección...)
                  </span>
                </label>
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
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Latitud
                  <span v-if="obteniendoCoordenadas" class="text-xs text-purple-600 ml-2">
                    (Buscando...)
                  </span>
                </label>
                <input
                  v-model.number="formulario.lat"
                  type="number"
                  step="any"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="-33.4489"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                <input
                  v-model.number="formulario.lon"
                  type="number"
                  step="any"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="-70.6693"
                />
              </div>
            </div>

            <!-- Botones de geolocalización -->
            <div class="flex justify-between items-center">
              <button
                type="button"
                @click="obtenerCoordenadasDesdeDireccion"
                :disabled="obteniendoCoordenadas || !formulario.calle"
                class="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1 disabled:opacity-50"
                title="Buscar coordenadas basándose en la dirección ingresada"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span>{{ obteniendoCoordenadas ? 'Buscando coordenadas...' : 'Buscar coordenadas por dirección' }}</span>
              </button>
              
              <button
                type="button"
                @click="obtenerUbicacionActual"
                :disabled="obteniendoUbicacion"
                class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 disabled:opacity-50"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{{ obteniendoUbicacion ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual' }}</span>
              </button>
            </div>

            <!-- Mapa Interactivo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ubicación en el Mapa
                <span class="text-xs text-gray-500 ml-2">(Arrastra el marcador o haz clic en el mapa)</span>
              </label>
              
              <!-- Indicador de obtención de ubicación -->
              <div v-if="obteniendoUbicacion" class="mb-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span class="text-sm">Obteniendo tu ubicación actual...</span>
              </div>

              <!-- Indicador de obtención de dirección -->
              <div v-if="obteniendoDireccion" class="mb-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                <span class="text-sm">Obteniendo dirección aproximada...</span>
              </div>

              <!-- Indicador de búsqueda de coordenadas -->
              <div v-if="obteniendoCoordenadas" class="mb-3 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-md flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                <span class="text-sm">Buscando coordenadas de la dirección...</span>
              </div>
              
              <div id="map" class="w-full h-80 rounded-md border border-gray-300"></div>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useAuth } from '@/composables/use-auth.js';
import LugarService from '@/services/lugar-service.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { user } = useAuth();

// Estados reactivos
const lugares = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const error = ref(null);

// Estados para el mapa
let map = null;
let marker = null;
const mapReady = ref(false);
const obteniendoUbicacion = ref(false);
const obteniendoDireccion = ref(false);
const obteniendoCoordenadas = ref(false);
const busquedaDireccionTimeout = ref(null);

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

const abrirModalNuevo = async () => {
  modoEdicion.value = false;
  
  // Coordenadas por defecto (Santiago, Chile)
  let coordenadasIniciales = {
    lat: -33.45,
    lon: -70.66
  };

  // Intentar obtener ubicación actual del dispositivo
  if ('geolocation' in navigator) {
    obteniendoUbicacion.value = true;
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
      
      coordenadasIniciales = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      console.log('✓ Ubicación actual obtenida:', coordenadasIniciales);
    } catch (err) {
      console.log('⚠ No se pudo obtener la ubicación actual, usando coordenadas por defecto:', err.message);
    } finally {
      obteniendoUbicacion.value = false;
    }
  }

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
    lat: coordenadasIniciales.lat,
    lon: coordenadasIniciales.lon,
    estado: 1
  };
  error.value = null;
  mostrarModal.value = true;
  
  // Obtener dirección de las coordenadas iniciales
  if (coordenadasIniciales.lat !== -33.45 || coordenadasIniciales.lon !== -70.66) {
    // Solo si no son las coordenadas por defecto
    await obtenerDireccionDesdeCoordenadas(coordenadasIniciales.lat, coordenadasIniciales.lon);
  }
  
  // Inicializar mapa después de que el modal sea visible
  nextTick(() => {
    inicializarMapa();
  });
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
    lat: lugar.lat || -33.45,
    lon: lugar.lon || -70.66,
    estado: lugar.estado
  };
  error.value = null;
  mostrarModal.value = true;
  
  // Inicializar mapa después de que el modal sea visible
  nextTick(() => {
    inicializarMapa();
  });
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
  
  // Limpiar el mapa
  if (map) {
    map.remove();
    map = null;
    marker = null;
    mapReady.value = false;
  }
};

const obtenerUbicacionActual = async () => {
  if (!('geolocation' in navigator)) {
    error.value = 'Tu navegador no soporta geolocalización';
    return;
  }

  obteniendoUbicacion.value = true;
  error.value = null;

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });

    formulario.value.lat = position.coords.latitude;
    formulario.value.lon = position.coords.longitude;
    
    console.log('✓ Ubicación actualizada:', {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      precision: position.coords.accuracy
    });

    // Obtener dirección a partir de coordenadas (geocodificación inversa)
    await obtenerDireccionDesdeCoordenadas(position.coords.latitude, position.coords.longitude);

  } catch (err) {
    console.error('Error al obtener ubicación:', err);
    
    let mensajeError = 'No se pudo obtener la ubicación actual';
    
    switch (err.code) {
      case 1: // PERMISSION_DENIED
        mensajeError = 'Permiso de ubicación denegado. Por favor, habilita el acceso a tu ubicación en la configuración del navegador.';
        break;
      case 2: // POSITION_UNAVAILABLE
        mensajeError = 'Ubicación no disponible. Verifica tu conexión GPS.';
        break;
      case 3: // TIMEOUT
        mensajeError = 'Tiempo de espera agotado al obtener ubicación.';
        break;
    }
    
    error.value = mensajeError;
  } finally {
    obteniendoUbicacion.value = false;
  }
};

const obtenerDireccionDesdeCoordenadas = async (lat, lon) => {
  try {
    obteniendoDireccion.value = true;
    console.log('🔍 Obteniendo dirección para coordenadas:', { lat, lon });
    
    // Usar la API de Nominatim de OpenStreetMap (geocodificación inversa)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es-CL,es;q=0.9' // Preferir español chileno
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener la dirección');
    }

    const data = await response.json();
    console.log('📍 Datos de dirección obtenidos:', data);

    // Extraer información de la dirección
    const address = data.address || {};
    
    // Actualizar formulario con la información obtenida
    if (address.road) {
      formulario.value.calle = address.road;
    }
    
    if (address.house_number) {
      formulario.value.numero = address.house_number;
    }
    
    // Municipalidad/Comuna
    if (address.municipality || address.city_district || address.suburb) {
      formulario.value.comuna = address.municipality || address.city_district || address.suburb;
    }
    
    // Ciudad
    if (address.city || address.town || address.village) {
      formulario.value.ciudad = address.city || address.town || address.village;
    }
    
    // Región/Estado
    if (address.state || address.region) {
      formulario.value.region = address.state || address.region;
    }

    console.log('✓ Dirección actualizada en el formulario:', {
      calle: formulario.value.calle,
      numero: formulario.value.numero,
      comuna: formulario.value.comuna,
      ciudad: formulario.value.ciudad,
      region: formulario.value.region
    });

  } catch (err) {
    console.error('⚠ Error al obtener dirección:', err);
    // No mostrar error al usuario, solo log en consola
    // La geocodificación inversa es opcional
  } finally {
    obteniendoDireccion.value = false;
  }
};

const obtenerCoordenadasDesdeDireccion = async () => {
  // Construir la dirección completa
  const partesDireccion = [
    formulario.value.calle,
    formulario.value.numero,
    formulario.value.comuna,
    formulario.value.ciudad,
    formulario.value.region,
    'Chile'
  ].filter(Boolean);

  if (partesDireccion.length < 2) {
    // No hay suficiente información para buscar
    return;
  }

  const direccionCompleta = partesDireccion.join(', ');

  try {
    obteniendoCoordenadas.value = true;
    console.log('🔍 Buscando coordenadas para dirección:', direccionCompleta);

    // Usar la API de Nominatim de OpenStreetMap (geocodificación directa)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}&limit=1&countrycodes=cl`,
      {
        headers: {
          'Accept-Language': 'es-CL,es;q=0.9'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener coordenadas');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const resultado = data[0];
      const lat = parseFloat(resultado.lat);
      const lon = parseFloat(resultado.lon);

      console.log('📍 Coordenadas obtenidas:', { lat, lon, display_name: resultado.display_name });

      // Actualizar las coordenadas en el formulario
      formulario.value.lat = lat;
      formulario.value.lon = lon;

      // Actualizar el mapa si está listo
      if (map && marker && mapReady.value) {
        marker.setLatLng([lat, lon]);
        map.setView([lat, lon], 16); // Zoom más cercano al encontrar una dirección
      }

      console.log('✓ Coordenadas actualizadas en el formulario');
    } else {
      console.log('⚠ No se encontraron coordenadas para la dirección proporcionada');
    }

  } catch (err) {
    console.error('⚠ Error al obtener coordenadas:', err);
    // No mostrar error al usuario, solo log en consola
  } finally {
    obteniendoCoordenadas.value = false;
  }
};

const inicializarMapa = () => {
  // Si ya existe un mapa, destruirlo primero
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }

  // Esperar a que el contenedor del mapa esté en el DOM
  setTimeout(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Coordenadas por defecto (Santiago, Chile) o las del formulario
    const lat = formulario.value.lat || -33.45;
    const lng = formulario.value.lon || -70.66;

    // Crear el mapa
    map = L.map('map').setView([lat, lng], 13);

    // Agregar capa de tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Agregar marcador arrastrable
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    // Actualizar coordenadas cuando se arrastra el marcador
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      formulario.value.lat = pos.lat;
      formulario.value.lon = pos.lng;
      
      // Obtener dirección de la nueva posición
      await obtenerDireccionDesdeCoordenadas(pos.lat, pos.lng);
    });

    // Actualizar marcador al hacer clic en el mapa
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      formulario.value.lat = lat;
      formulario.value.lon = lng;
      
      // Obtener dirección de la nueva posición
      await obtenerDireccionDesdeCoordenadas(lat, lng);
    });

    mapReady.value = true;
  }, 100);
};

// Watch para actualizar el mapa cuando cambien las coordenadas manualmente
watch(() => [formulario.value.lat, formulario.value.lon], ([newLat, newLon]) => {
  if (map && marker && mapReady.value && newLat && newLon) {
    marker.setLatLng([newLat, newLon]);
    map.setView([newLat, newLon]);
  }
});

// Watch para detectar cambios en la dirección y obtener coordenadas automáticamente
watch(
  () => [
    formulario.value.calle,
    formulario.value.numero,
    formulario.value.comuna,
    formulario.value.ciudad,
    formulario.value.region
  ],
  () => {
    // Limpiar timeout anterior
    if (busquedaDireccionTimeout.value) {
      clearTimeout(busquedaDireccionTimeout.value);
    }

    // Esperar 1.5 segundos después de que el usuario deje de escribir
    busquedaDireccionTimeout.value = setTimeout(() => {
      if (mostrarModal.value && !obteniendoUbicacion.value && !obteniendoDireccion.value) {
        obtenerCoordenadasDesdeDireccion();
      }
    }, 1500);
  }
);

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
/* Estilos para el mapa de Leaflet */
#map {
  z-index: 0;
}

/* Asegurar que los controles del mapa sean visibles */
:deep(.leaflet-control-zoom) {
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 4px;
}

:deep(.leaflet-control-attribution) {
  font-size: 10px;
}

/* Fix para iconos de marcadores de Leaflet */
:deep(.leaflet-marker-icon) {
  margin-left: -12px !important;
  margin-top: -41px !important;
}
</style>
