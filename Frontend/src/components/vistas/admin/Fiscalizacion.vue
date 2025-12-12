<template>
  <AdminNavbar />

  <!-- Buscador -->
  <div class="mt-6 flex justify-center">
    <div
      class="flex items-center border border-gray-300 rounded-lg px-4 py-2 shadow-sm w-96"
    >
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

  <!-- Contenido -->
  <div class="mt-8 flex justify-center">
    <div v-if="loading" class="text-center py-8 text-gray-600">Cargando datos...</div>
    <div v-else-if="error" class="text-center py-8 text-red-600">
      Error al cargar los datos: {{ error }}
    </div>
    <div
      v-else-if="!Object.keys(registrosFiltrados).length"
      class="text-center py-8 text-gray-600"
    >
      No hay registros disponibles.
    </div>

    <div v-else class="max-w-7xl">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div
          v-for="(registrosUsuario, usuario) in registrosFiltrados"
          :key="usuario"
          class="p-5 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all duration-300 hover:border-green-300"
        >
          <h3 class="text-lg font-bold text-gray-800 mb-1">{{ usuario }}</h3>
          <p class="text-sm text-gray-600 mb-3">
            Registros:
            <span class="font-semibold">{{ registrosUsuario.length }}</span>
          </p>
          <button
            @click="abrirModalDetalles(usuario)"
            class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm font-medium"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de detalles -->
  <div
    v-if="mostrarModalDetalles"
    class="fixed inset-0 bg-transparent flex items-center justify-center z-50"
    style="align-items: center;"
  >
    <div class="bg-white bg-opacity-80 rounded-xl shadow-lg p-6 w-full max-w-5xl relative mt-0">
      <div class="flex justify-between items-center mb-4 border-b pb-3">
        <h3 class="text-xl font-bold text-gray-800 flex items-center">
          Detalles de {{ usuarioSeleccionado.nombre }}
        </h3>
        <button @click="cerrarModalDetalles" class="text-gray-500 hover:text-gray-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-4 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="seccionActiva = tab.id"
          :class="seccionActiva === tab.id ? tab.activo : tab.inactivo"
          class="px-5 py-2 rounded-lg text-sm font-medium shadow"
        >
          {{ tab.nombre }}
        </button>
      </div>

      <!-- Contenido dinámico -->
      <div class="overflow-y-auto max-h-[65vh]">
        <table class="w-full text-sm border-collapse rounded-lg overflow-hidden bg-white shadow-md">
          <thead class="bg-green-50 text-gray-700">
            <tr>
              <th class="px-4 py-3 font-semibold text-left">Fecha</th>
              <th class="px-4 py-3 font-semibold text-left">Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cambio in cambiosFiltrados"
              :key="cambio.id"
              class="border-b border-gray-100 hover:bg-green-50 transition text-sm"
            >
              <td class="px-4 py-2 text-gray-700">{{ cambio.fecha }}</td>
              <td class="px-4 py-2 text-gray-700">{{ cambio.descripcion }}</td>
            </tr>
            <tr v-if="!cambiosFiltrados.length">
              <td colspan="2" class="text-center py-4 text-gray-500 italic">
                Sin registros en esta sección.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuditoria } from '@/composables/useAuditoria.js'
import { useAuth } from '@/composables/useAuth.js'
import AdminNavbar from '@/components/shared/AdminNavbar.vue'

const { registros, loading, error, cargarRegistros, obtenerCambiosUsuario } = useAuditoria()

const mostrarModalDetalles = ref(false)
const usuarioSeleccionado = ref({ id: null, nombre: '', rol: '' })
const filtroBusqueda = ref('')
const cambiosUsuario = ref([])
const seccionActiva = ref('empresa')

// Tabs del modal
const tabs = [
  { id: 'empresa', nombre: 'Empresa', activo: 'bg-blue-600 text-white', inactivo: 'bg-blue-100 text-blue-600' },
  { id: 'marcaciones', nombre: 'Marcaciones', activo: 'bg-green-600 text-white', inactivo: 'bg-green-100 text-green-600' },
  { id: 'usuarios', nombre: 'Registro de Usuarios', activo: 'bg-yellow-600 text-white', inactivo: 'bg-yellow-100 text-yellow-600' },
  { id: 'edicion', nombre: 'Edición de Datos', activo: 'bg-red-600 text-white', inactivo: 'bg-red-100 text-red-600' }
]

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

const abrirModalDetalles = async (usuario) => {
  usuarioSeleccionado.value.nombre = usuario
  mostrarModalDetalles.value = true
  try {
    const registrosUsuario = registros.value.find(r =>
      `${r.nombre} ${r.apellido_pat} ${r.apellido_mat}`.trim().toLowerCase() === usuario.trim().toLowerCase()
    )
    if (registrosUsuario) {
      const resp = await obtenerCambiosUsuario(registrosUsuario.usuario_id)
      cambiosUsuario.value = resp.cambios || []
    } else {
      cambiosUsuario.value = []
    }
  } catch (e) {
    console.error('Error al cargar cambios:', e)
  }
}

const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false
  cambiosUsuario.value = []
}

const cambiosFiltrados = computed(() => {
  if (!cambiosUsuario.value.length) return []
  const seccion = seccionActiva.value
  if (seccion === 'empresa') return cambiosUsuario.value.filter(c => c.descripcion.includes('Empresa'))
  if (seccion === 'marcaciones') return cambiosUsuario.value.filter(c => c.descripcion.includes('Marcaciones'))
  if (seccion === 'usuarios') return cambiosUsuario.value.filter(c => c.descripcion.includes('Usuario'))
  if (seccion === 'edicion') return cambiosUsuario.value.filter(c => c.descripcion.includes('Edición'))
  return []
})

onMounted(() => {
  cargarRegistros()
})
</script>
