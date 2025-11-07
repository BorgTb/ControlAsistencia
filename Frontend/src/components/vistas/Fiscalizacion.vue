<template>
  <!-- Navbar tipo tabs moderno -->
  <div class="w-full bg-gray-50 border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4">
      <ul class="flex space-x-2">
        <li>
          <router-link
            to="/administrarempresa"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/administrarempresa' ? 'text-cyan-600 border-b-2 border-cyan-400 bg-white' : 'text-gray-500 hover:text-cyan-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
            </svg>
            Administrar empresas
          </router-link>
        </li>
        <li>
          <router-link
            to="/RolAdministracion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/RolAdministracion' ? 'text-indigo-600 border-b-2 border-indigo-400 bg-white' : 'text-gray-500 hover:text-indigo-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
            </svg>
            Administración
          </router-link>
        </li>
        <li>
          <router-link
            to="/usuarios-permisos"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/usuarios-permisos' ? 'text-amber-600 border-b-2 border-amber-400 bg-white' : 'text-gray-500 hover:text-amber-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m6 5.87a4 4 0 00-3-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            Usuarios y permisos
          </router-link>
        </li>
        <li>
          <router-link
            to="/fiscalizacion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/fiscalizacion' ? 'text-green-600 border-b-2 border-green-400 bg-white' : 'text-gray-500 hover:text-green-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fiscalización
          </router-link>
        </li>
        <li>
          <router-link
            to="/estadisticas"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/estadisticas' ? 'text-fuchsia-600 border-b-2 border-fuchsia-400 bg-white' : 'text-gray-500 hover:text-fuchsia-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19V6m4 13V10m4 9V4M7 19v-4M3 19v-2" />
            </svg>
            Estadísticas
          </router-link>
        </li>
        <li v-if="isAdmin">
          <router-link
            to="/empresa/reportes/domingos-festivos"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/empresa/reportes/domingos-festivos' ? 'text-cyan-600 border-b-2 border-cyan-400 bg-white' : 'text-gray-500 hover:text-cyan-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
            </svg>
            Domingos/Festivos
          </router-link>
        </li>
      </ul>
    </nav>
  </div>

  <!-- Buscador único -->
  <div class="mt-6 flex justify-center">
    <div class="flex items-center border border-gray-300 rounded-lg px-4 py-2 shadow-sm w-96">
      <input
        v-model="filtroBusqueda"
        type="text"
        placeholder="Buscar usuario (nombre, apellido, RUT)"
        class="w-full focus:outline-none text-sm text-gray-600"
      />
      <button
        @click="limpiarBusqueda"
        class="text-blue-600 text-sm font-medium ml-4 hover:underline"
      >
        Limpiar
      </button>
    </div>
  </div>

  <!-- Contenido principal -->
  <div class="mt-8 flex justify-center">
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Cargando datos...</p>
    </div>
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">Error al cargar los datos: {{ error }}</p>
    </div>
    <div v-else-if="!registrosFiltrados || Object.keys(registrosFiltrados).length === 0" class="text-center py-8">
      <p class="text-gray-600">No hay registros disponibles.</p>
    </div>
    <div v-else class="max-w-7xl">
      <!-- Renderizar tarjetas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div
          v-for="(registrosUsuario, usuario) in registrosFiltrados"
          :key="usuario"
          class="p-5 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all duration-300 hover:border-green-300"
        >
          <h3 class="text-lg font-bold text-gray-800 mb-1">{{ usuario }}</h3>
          <p class="text-sm text-gray-600 mb-3">Registros: <span class="font-semibold">{{ registrosUsuario.length }}</span></p>
          <button
            @click="abrirModalDetalles(usuario)"
            class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm font-medium"
          >
            Ver Detalles
          </button>
        </div>
      </div>

      <!-- Modal Detalles por usuario -->
      <div v-if="mostrarModalDetalles" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-10 w-full max-w-6xl">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-2xl font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h11M9 21V3" />
              </svg>
              Detalles de {{ usuarioSeleccionado.nombre }}
            </h3>
            <button @click="cerrarModalDetalles" class="text-gray-600 hover:text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div v-if="mostrarCambios" class="overflow-y-auto max-h-[700px]">
            <h4 class="text-xl font-bold text-gray-800 mb-6">Cambios realizados por {{ usuarioSeleccionado.nombre }}</h4>
            <div class="space-y-8">
              <!-- Botones de navegación -->
              <div class="flex space-x-6 mb-6">
                <button
                  @click="seccionActiva = 'empresa'"
                  :class="seccionActiva === 'empresa' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'"
                  class="px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition text-lg font-medium"
                >
                  Empresa
                </button>
                <button
                  @click="seccionActiva = 'marcaciones'"
                  :class="seccionActiva === 'marcaciones' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'"
                  class="px-6 py-3 rounded-lg shadow hover:bg-green-700 transition text-lg font-medium"
                >
                  Marcaciones
                </button>
                <button
                  @click="seccionActiva = 'usuarios'"
                  :class="seccionActiva === 'usuarios' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-600'"
                  class="px-6 py-3 rounded-lg shadow hover:bg-yellow-700 transition text-lg font-medium"
                >
                  Registro de Usuarios
                </button>
                <button
                  @click="seccionActiva = 'edicion'"
                  :class="seccionActiva === 'edicion' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'"
                  class="px-6 py-3 rounded-lg shadow hover:bg-red-700 transition text-lg font-medium"
                >
                  Edición de Datos
                </button>
              </div>

              <!-- Apartado Empresa -->
              <div v-if="seccionActiva === 'empresa'">
                <h5 class="text-lg font-semibold text-blue-600 mb-4">Empresa</h5>
                <table class="w-full text-md border-separate border-spacing-0 rounded-2xl overflow-hidden bg-white shadow-md">
                  <thead class="sticky top-0 z-10 shadow-sm">
                    <tr class="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700">
                      <th class="px-6 py-4 font-semibold text-left">Fecha</th>
                      <th class="px-6 py-4 font-semibold text-left">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cambio in cambiosUsuario.filter(c => c.descripcion.includes('Empresa'))" :key="cambio.id" class="transition border-b border-gray-100 hover:bg-blue-100 text-md h-12 align-middle">
                      <td class="px-6 py-4 text-gray-600 align-middle">{{ cambio.fecha }}</td>
                      <td class="px-6 py-4 text-gray-600 align-middle">{{ cambio.descripcion }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Apartado Marcaciones -->
              <div v-if="seccionActiva === 'marcaciones'">
                <h5 class="text-lg font-semibold text-green-600 mb-4">Marcaciones</h5>
                <table class="w-full text-md border-separate border-spacing-0 rounded-2xl overflow-hidden bg-white shadow-md">
                  <thead class="sticky top-0 z-10 shadow-sm">
                    <tr class="bg-gradient-to-r from-green-50 to-green-100 text-gray-700">
                      <th class="px-6 py-4 font-semibold text-left">Fecha</th>
                      <th class="px-6 py-4 font-semibold text-left">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cambio in cambiosUsuario.filter(c => c.descripcion.includes('Marcaciones'))" :key="cambio.id" class="transition border-b border-gray-100 hover:bg-green-100 text-md h-12 align-middle">
                      <td class="px-6 py-4 text-gray-600 align-middle">{{ cambio.fecha }}</td>
                      <td class="px-6 py-4 text-gray-600 align-middle">{{ cambio.descripcion }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Apartado Registro de Usuarios -->
              <div v-if="seccionActiva === 'usuarios'">
                <h5 class="text-lg font-semibold text-yellow-600 mb-4">Registro de Usuarios</h5>
                <table class="w-full text-md border-separate border-spacing-0 rounded-2xl overflow-hidden bg-white shadow-md">
                  <thead class="sticky top-0 z-10 shadow-sm">
                    <tr class="bg-gradient-to-r from-yellow-50 to-yellow-100 text-gray-700">
                      <th class="px-6 py-4 font-semibold text-left">Fecha</th>
                      <th class="px-6 py-4 font-semibold text-left">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cambio in cambiosUsuario.filter(c => c.descripcion.includes('Usuario'))" :key="cambio.id" class="transition border-b border-gray-100 hover:bg-yellow-100 text-md h-12 align-middle">
                      <td class="px-6 py-4 text-gray-600 align-middle">{{ cambio.fecha }}</td>
                      <td class="px-6 py-4 text-gray-600 align-middle">{{ cambio.descripcion }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Apartado Edición de Datos -->
              <div v-if="seccionActiva === 'edicion'">
                <h5 class="text-lg font-semibold text-red-600 mb-4">Edición de Datos</h5>
                <table class="w-full text-md border-separate border-spacing-0 rounded-2xl overflow-hidden bg-white shadow-md">
                  <thead class="sticky top-0 z-10 shadow-sm">
                    <tr class="bg-gradient-to-r from-red-50 to-red-100 text-gray-700">
                      <th class="px-6 py-4 font-semibold text-left">Fecha</th>
                      <th class="px-6 py-4 font-semibold text-left">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cambio in cambiosUsuario.filter(c => c.descripcion.includes('Edición'))" :key="cambio.id" class="transition border-b border-gray-100 hover:bg-red-100 text-md h-12 align-middle">
                      <td class="px-6 py-4 text-gray-600 align-middle">{{ cambio.fecha }}</td>
                      <td class="px-6 py-4 text-gray-600 align-middle">{{ cambio.descripcion }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Cambios Usuario -->
  <ModalCambiosUsuario
    v-if="mostrarModalCambios"
    :usuario="usuarioSeleccionado"
    @close="mostrarModalCambios = false"
  />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuditoria } from '../../composables/useAuditoria.js'
import { useNotification } from '../../composables/useNotification.js'
import ModalCambiosUsuario from '../modals/ModalCambiosUsuario.vue'
import { useAuth } from '../../composables/useAuth.js'

const { registros, loading, error, cargarRegistros, cargarEstadisticas, obtenerCambiosUsuario, estadisticasCalculadas } = useAuditoria()
const { hasRole } = useAuth()
const isAdmin = computed(() => hasRole('admin'))

const mostrarModalCambios = ref(false)
const mostrarModalDetalles = ref(false)
const usuarioSeleccionado = ref({ id: null, nombre: '', rol: '' })
const cambiosUsuario = ref([])
const filtroBusqueda = ref('')
const mostrarCambios = ref(false)
const seccionActiva = ref('empresa')

const registrosAgrupados = computed(() =>
  registros.value.reduce((acc, registro) => {
    const nombreCompleto = `${registro.nombre} ${registro.apellido_pat} ${registro.apellido_mat}`
    if (!acc[nombreCompleto]) acc[nombreCompleto] = []
    acc[nombreCompleto].push(registro)
    return acc
  }, {})
)

const registrosFiltrados = computed(() => {
  if (!filtroBusqueda.value) return registrosAgrupados.value
  const filtro = filtroBusqueda.value.toLowerCase()
  return Object.keys(registrosAgrupados.value).reduce((acc, usuario) => {
    if (usuario.toLowerCase().includes(filtro)) acc[usuario] = registrosAgrupados.value[usuario]
    return acc
  }, {})
})

const limpiarBusqueda = () => (filtroBusqueda.value = '')
const abrirModalDetalles = (usuario) => {
  usuarioSeleccionado.value.nombre = usuario
  mostrarModalDetalles.value = true
}
const mostrarCambiosUsuario = async (usuarioId) => {
  mostrarCambios.value = true;
  console.log('Cargando cambios para usuario:', usuarioId);
  try {
    const respuesta = await obtenerCambiosUsuario(usuarioId);
    console.log('Respuesta de la API:', respuesta);
    cambiosUsuario.value = respuesta.cambios || [];
    console.log('Cambios cargados:', cambiosUsuario.value);
  } catch (error) {
    console.error('Error al cargar cambios:', error);
    cambiosUsuario.value = [];
  }
}

const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false
  mostrarCambios.value = false
}

onMounted(async () => {
  try {
    console.log('Cargando registros de auditoría...');
    await cargarRegistros();
    console.log('Registros cargados exitosamente:', registros.value);

    console.log('Cargando estadísticas del sistema...');
    await cargarEstadisticas();
    console.log('Estadísticas cargadas:', estadisticasCalculadas.value);
  } catch (error) {
    console.error('Error durante la carga inicial:', error);
  }
})
</script>
