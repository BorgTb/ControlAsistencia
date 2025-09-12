<template>
  <!-- Modal de confirmación de borrado -->
  <transition name="fade">
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center" style="background:rgba(255,255,255,0.01);">
      <div class="relative bg-white rounded-2xl border-2 border-red-300 max-w-xl w-full mx-4 p-10 text-center animate-fadeInUp shadow-2xl" style="box-shadow:0 12px 48px 0 rgba(220,38,38,0.18),0 6px 16px 0 rgba(0,0,0,0.10);">
        <i class="fas fa-exclamation-triangle text-red-500 text-6xl mb-5"></i>
        <h3 class="text-3xl font-bold mb-4">¿Eliminar empresa?</h3>
        <p class="text-gray-700 text-lg mb-6">
          Esta acción no se puede deshacer.<br>
          ¿Estás seguro que deseas eliminar <span class="font-extrabold text-red-600 uppercase">{{ empresaAEliminar?.emp_nombre }}</span>?
        </p>
        <div class="flex justify-center gap-6 mt-6">
          <button @click="cancelDeleteEmpresa" class="px-6 py-3 border-2 rounded-lg text-lg text-gray-700 border-gray-300 hover:bg-gray-100 font-semibold">Cancelar</button>
          <button @click="confirmDeleteEmpresa" :disabled="submitting" class="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-bold">Eliminar</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Modal de edición/creación de empresa -->
  <transition name="fade">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center" style="background:rgba(255,255,255,0.01);">
      <div class="relative bg-white rounded-2xl border-2 border-blue-300 max-w-xl w-full mx-4 p-8 text-left animate-fadeInUp shadow-2xl">
        <h3 class="text-2xl font-bold mb-4">{{ empresaForm.empresa_id ? 'Editar Empresa' : 'Nueva Empresa' }}</h3>
        <form @submit.prevent="saveEmpresa" class="flex flex-col gap-4">
          <div>
            <label class="empresa-label">Nombre</label>
            <input v-model="empresaForm.emp_nombre" required class="input w-full px-2 py-1 mt-1" placeholder="Nombre de la empresa" />
          </div>
          <div>
            <label class="empresa-label">RUT</label>
            <input v-model="empresaForm.emp_rut" required class="input w-full px-2 py-1 mt-1" placeholder="RUT" />
          </div>
          <div>
            <label class="empresa-label">Teléfono</label>
            <input v-model="empresaForm.telefono" class="input w-full px-2 py-1 mt-1" placeholder="Teléfono" />
          </div>
          <div>
            <label class="empresa-label">Descripción</label>
            <textarea v-model="empresaForm.descripcion" class="textarea w-full px-2 py-1 mt-1" placeholder="Descripción"></textarea>
          </div>
          <div>
            <label class="empresa-label">Estado</label>
            <select v-model="empresaForm.estado" class="select w-full px-2 py-1 mt-1">
              <option :value="1">Activa</option>
              <option :value="0">Inactiva</option>
            </select>
          </div>
          <div v-if="error" class="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">{{ error }}</div>
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" @click="closeModal" class="px-4 py-2 border rounded-md text-base text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold">Cancelar</button>
            <button type="submit" :disabled="submitting" class="btn-primary px-6 py-2 rounded-md text-base font-semibold">{{ empresaForm.empresa_id ? 'Guardar Cambios' : 'Crear Empresa' }}</button>
          </div>
        </form>
      </div>
    </div>
  </transition>

  <!-- Modal de visualización de empresa -->
  <transition name="fade">
    <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center" style="background:rgba(255,255,255,0.01);">
      <div class="relative bg-white rounded-2xl border-2 border-blue-300 max-w-xl w-full mx-4 p-8 text-left animate-fadeInUp shadow-2xl">
        <h3 class="text-2xl font-bold mb-4">Detalle Empresa</h3>
        <div class="flex flex-col gap-2 mb-4">
          <div><span class="empresa-label">Nombre:</span> <span class="empresa-value">{{ empresaView.emp_nombre }}</span></div>
          <div><span class="empresa-label">RUT:</span> <span class="empresa-value">{{ empresaView.emp_rut }}</span></div>
          <div><span class="empresa-label">Teléfono:</span> <span class="empresa-value">{{ empresaView.telefono }}</span></div>
          <div><span class="empresa-label">Descripción:</span> <span class="empresa-value">{{ empresaView.descripcion }}</span></div>
          <div><span class="empresa-label">Estado:</span> <span class="empresa-value">{{ empresaView.estado === 1 ? 'Activa' : 'Inactiva' }}</span></div>
        </div>
        <div class="flex justify-end mt-4">
          <button type="button" @click="closeViewModal" class="px-4 py-2 border rounded-md text-base text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold">Cerrar</button>
        </div>
      </div>
    </div>
  </transition>

  <div>
    <!-- Botones de acción -->
    <div class="flex justify-end items-center gap-4 max-w-7xl mx-auto px-4 py-6">
      <button @click="exportToExcel" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-base font-semibold flex items-center shadow-sm">
        <i class="fas fa-file-excel mr-2"></i> Exportar Excel
      </button>
      <button @click="openModal" class="btn-primary px-5 py-2 rounded-lg text-base font-semibold flex items-center shadow-sm hover:scale-105 transition-transform">
        <i class="fas fa-plus mr-2"></i> Nueva Empresa
      </button>
      <button @click="openUnirTrabajadorModal" class="btn-primary px-5 py-2 rounded-lg text-base font-semibold flex items-center shadow-sm hover:scale-105 transition-transform bg-indigo-600 ml-2">
        <i class="fas fa-user-plus mr-2"></i> Unir trabajador
      </button>
    </div>

    <!-- Main -->
    <main class="max-w-5xl mx-auto px-4 py-8">
      <!-- Buscador -->
      <div class="mb-8 flex w-full">
        <div class="flex flex-row gap-3 items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg z-40" style="min-width:320px;">
          <input v-model="search.query" placeholder="Buscar empresa (nombre, RUT, estado, teléfono, descripción...)" class="px-3 py-2 border border-gray-300 rounded-lg text-base w-72 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
          <button @click="clearSearch" class="text-sm text-blue-600 hover:underline font-semibold">Limpiar</button>
        </div>
      </div>

      <!-- Empresas -->
      <div v-if="!loading">
        <div v-if="filteredEmpresas.length === 0" class="bg-white border rounded-lg p-6 text-center text-gray-500">No hay empresas registradas.</div>
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="empresa in filteredEmpresas" :key="empresa.empresa_id"
            :class="['card p-4 flex flex-col cursor-pointer hover:shadow-lg transition', empresa.estado === 0 ? 'bg-gray-200 text-gray-700' : 'bg-white']"
            @click="viewEmpresa(empresa)">
            <h2 class="text-lg font-bold text-blue-700 mb-1 tracking-tight">{{ empresa.emp_nombre }}</h2>
            <div class="flex flex-col gap-1 mb-2">
              <span class="empresa-label">RUT:</span> <span class="empresa-value">{{ empresa.emp_rut }}</span>
              <span class="empresa-label">Estado:</span> <span class="empresa-value">{{ empresa.estado === 1 ? 'Activa' : 'Inactiva' }}</span>
              <span class="empresa-label">Teléfono:</span> <span class="empresa-value">{{ empresa.telefono }}</span>
              <span class="empresa-label">Trabajadores:</span> <span class="empresa-value">{{ empresa.totalEmpleados ?? 0 }}</span>
            </div>
            <div class="flex gap-2 mt-3" @click.stop>
              <button @click="editEmpresa(empresa)" class="btn-primary flex items-center gap-1 px-3 py-1 rounded text-white text-xs shadow">
                <i class="fas fa-edit"></i>
                <span>Editar</span>
              </button>
              <button v-if="empresa.estado === 1" @click="openDeleteModal(empresa)" class="bg-red-500 hover:bg-red-600 flex items-center gap-1 text-white px-3 py-1 rounded text-xs shadow">
                <i class="fas fa-trash"></i>
                <span>Borrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal Unir Trabajador -->
  <div v-if="showUnirTrabajadorModal" class="fixed inset-0 flex items-center justify-center z-50" style="background:rgba(255,255,255,0.01);">
    <div class="modal-card max-w-lg w-full p-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold modal-title">Unir trabajador a empresa</h2>
        <button @click="closeUnirTrabajadorModal" class="text-gray-500 hover:text-blue-700 text-xl"><i class="fas fa-times"></i></button>
      </div>
      <div v-if="unirError" class="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">{{ unirError }}</div>
      <form @submit.prevent="unirTrabajador" class="flex flex-col gap-4">
        <div>
          <label class="empresa-label">Buscar por RUT</label>
          <input v-model="rutBusqueda" class="input w-full px-2 py-1 mt-1" placeholder="RUT del trabajador" />
          <button type="button" @click="buscarPorRut" class="btn-primary mt-2 px-4 py-1 rounded">Buscar</button>
        </div>
        <div>
          <label class="empresa-label">O seleccionar usuario</label>
          <select v-model="usuarioSeleccionado" class="select w-full px-2 py-1 mt-1">
            <option value="">Seleccione un usuario</option>
            <option v-for="usuario in listaUsuarios" :key="usuario.id" :value="usuario.id">
              {{ usuario.nombre }} {{ usuario.apellido_pat }} ({{ usuario.rut }})
            </option>
          </select>
        </div>
        <div>
          <label class="empresa-label">Empresa</label>
          <select v-model="empresaSeleccionada" class="select w-full px-2 py-1 mt-1">
            <option value="">Seleccione una empresa</option>
            <option v-for="empresa in empresas" :key="empresa.empresa_id" :value="empresa.empresa_id">
              {{ empresa.emp_nombre }}
            </option>
          </select>
        </div>
        <div class="flex justify-end mt-4 gap-2">
          <button type="button" @click="closeUnirTrabajadorModal" class="px-4 py-2 border rounded-md text-base text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold">Cancelar</button>
          <button type="submit" :disabled="submitting" class="btn-primary px-6 py-2 rounded-md text-base font-semibold">Unir</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_BASE_URL = 'http://localhost:3000/api/empresas'

// Estados reactivos
const empresas = ref([])
const loading = ref(false)
const submitting = ref(false)
const error = ref(null)
const search = ref({ query: '' })

const showModal = ref(false)
const showViewModal = ref(false)
const empresaView = ref({})
const empresaForm = ref({ empresa_id: null, emp_nombre: '', emp_rut: '', telefono: '', descripcion: '', estado: 1 })

const showDeleteModal = ref(false)
const empresaAEliminar = ref(null)

const showUnirTrabajadorModal = ref(false)
const unirError = ref(null)
const rutBusqueda = ref('')
const usuarioSeleccionado = ref('')
const empresaSeleccionada = ref('')
const listaUsuarios = ref([])

// --- Funciones de Empresas ---
async function fetchEmpresas() {
  loading.value = true
  try {
    const response = await axios.get(API_BASE_URL)
    console.log(response.data)  
    empresas.value = response.data.data || response.data
  } catch {
    error.value = 'Error al cargar empresas'
  } finally {
    loading.value = false
  }
}

function openModal() {
  showModal.value = true
  error.value = null
  empresaForm.value = { empresa_id: null, emp_nombre: '', emp_rut: '', telefono: '', descripcion: '', estado: 1 }
}
function closeModal() { showModal.value = false }
function viewEmpresa(empresa) { empresaView.value = { ...empresa }; showViewModal.value = true }
function closeViewModal() { showViewModal.value = false; empresaView.value = {} }
function editEmpresa(empresa) { empresaForm.value = { ...empresa }; showModal.value = true }

function openDeleteModal(empresa) { empresaAEliminar.value = empresa; showDeleteModal.value = true }
function cancelDeleteEmpresa() { showDeleteModal.value = false; empresaAEliminar.value = null }
async function confirmDeleteEmpresa() {
  submitting.value = true
  try {
    await axios.delete(`${API_BASE_URL}/${empresaAEliminar.value.empresa_id}`)
    await fetchEmpresas()
    showDeleteModal.value = false
    empresaAEliminar.value = null
  } catch {
    error.value = 'Error al eliminar'
  } finally {
    submitting.value = false
  }
}

async function saveEmpresa() {
  submitting.value = true
  try {
    const payload = {
      emp_nombre: empresaForm.value.emp_nombre,
      emp_rut: empresaForm.value.emp_rut,
      estado: Number(empresaForm.value.estado),
      telefono: empresaForm.value.telefono,
      descripcion: empresaForm.value.descripcion
    }
    if (empresaForm.value.empresa_id) {
      await axios.put(`${API_BASE_URL}/${empresaForm.value.empresa_id}`, payload)
    } else {
      await axios.post(API_BASE_URL, payload)
    }
    closeModal()
    await fetchEmpresas()
  } catch {
    error.value = 'Error al guardar'
  } finally {
    submitting.value = false
  }
}

// --- Filtro ---
const filteredEmpresas = computed(() => {
  const q = (search.value.query || '').toLowerCase().trim()
  if (!q) return empresas.value
  return empresas.value.filter(e => {
    return (
      (e.emp_nombre && e.emp_nombre.toLowerCase().includes(q)) ||
      (e.emp_rut && e.emp_rut.toLowerCase().includes(q)) ||
      (e.telefono && e.telefono.toLowerCase().includes(q)) ||
      (e.descripcion && e.descripcion.toLowerCase().includes(q)) ||
      (typeof e.estado !== 'undefined' && (
        (q === 'activa' && e.estado === 1) ||
        (q === 'inactiva' && e.estado === 0)
      ))
    )
  })
})
function clearSearch() { search.value.query = '' }

// --- Exportar Excel ---
function exportToExcel() {
  const data = filteredEmpresas.value.map(e => ({
    Nombre: e.emp_nombre,
    RUT: e.emp_rut,
    Estado: e.estado === 1 ? 'Activa' : 'Inactiva',
    Teléfono: e.telefono,
    Descripción: e.descripcion
  }))
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas')
  XLSX.writeFile(workbook, 'empresas.xlsx')
}

// --- Unir trabajador ---
function openUnirTrabajadorModal() {
  showUnirTrabajadorModal.value = true
  unirError.value = null
  rutBusqueda.value = ''
  usuarioSeleccionado.value = ''
  empresaSeleccionada.value = ''
  listaUsuarios.value = []
  // Aquí deberías llamar a tu API de usuarios
}
function closeUnirTrabajadorModal() { showUnirTrabajadorModal.value = false }

async function unirTrabajador() {
  if (!usuarioSeleccionado.value || !empresaSeleccionada.value) {
    unirError.value = 'Debe seleccionar usuario y empresa'
    return
  }
  try {
    await axios.post('http://localhost:3000/api/usuarios_empresas', {
      usuario_id: usuarioSeleccionado.value,
      empresa_id: empresaSeleccionada.value,
      rol_en_empresa: 'trabajador'
    })
    unirError.value = null
    closeUnirTrabajadorModal()
    await fetchEmpresas()
  } catch {
    unirError.value = 'Error al unir trabajador a empresa'
  }
}

onMounted(fetchEmpresas)
</script>

<style scoped>
/* Tus estilos tal cual */
body {
  background: linear-gradient(135deg, #e0e7ff 0%, #f9fafb 100%);
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.card {
  background: #fff;
  border-radius: 18px;
  border: 1.5px solid #d1d5db;
  box-shadow: 0 4px 24px 0 rgba(37, 99, 235, 0.07), 0 1.5px 4px 0 rgba(0,0,0,0.03);
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
  position: relative;
}
.card:hover {
  box-shadow: 0 8px 32px 0 rgba(37, 99, 235, 0.13), 0 3px 8px 0 rgba(0,0,0,0.06);
  transform: translateY(-2px) scale(1.015);
  border-color: #2563eb;
  background: #fff !important;
}
.btn-primary {
  background: linear-gradient(90deg, #2563eb 60%, #60a5fa 100%);
  color: white;
  box-shadow: 0 2px 8px 0 rgba(37,99,235,0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  background: linear-gradient(90deg, #1e40af 60%, #2563eb 100%);
  box-shadow: 0 4px 16px 0 rgba(37,99,235,0.13);
}
.modal-title { color: #2563eb; }
.input, .select, .textarea {
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
}
.input:focus, .select:focus, .textarea:focus {
  border-color: #2563eb;
  outline: none;
}
.empresa-label { color: #64748b; font-size: 0.95em; font-weight: 500; }
.empresa-value { color: #334155; font-size: 1.05em; font-weight: 600; }
.modal-card {
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(37, 99, 235, 0.13), 0 3px 8px 0 rgba(0,0,0,0.06);
  border: 1.5px solid #2563eb;
  background: #fff !important;
  color: #1e293b;
}
</style>
