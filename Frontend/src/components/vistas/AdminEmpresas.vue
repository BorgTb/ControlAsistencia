<template>
  <!-- Navbar tipo tabs moderno -->
  <div class="w-full bg-gray-50 border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4">
  <ul class="flex space-x-2">
        <li>
          <router-link
            to="/administrarempresa"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/administrarempresa' ? 'bg-white border-b-2 border-cyan-500 text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-600 hover:bg-white'"
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
            :class="$route.path === '/RolAdministracion' ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-indigo-600 hover:bg-white'"
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
            :class="$route.path === '/usuarios-permisos' ? 'bg-white border-b-2 border-amber-500 text-amber-600 shadow-sm' : 'text-gray-500 hover:text-amber-600 hover:bg-white'"
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
            :class="$route.path === '/fiscalizacion' ? 'bg-white border-b-2 border-green-500 text-green-600 shadow-sm' : 'text-gray-500 hover:text-green-600 hover:bg-white'"
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
            :class="$route.path === '/estadisticas' ? 'bg-white border-b-2 border-fuchsia-500 text-fuchsia-600 shadow-sm' : 'text-gray-500 hover:text-fuchsia-600 hover:bg-white'"
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
            :class="$route.path === '/empresa/reportes/domingos-festivos' ? 'bg-white border-b-2 border-cyan-500 text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-600 hover:bg-white'"
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
          
          <!-- Checkbox para identificar si es EST -->
          <div class="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="es_est" 
              v-model="empresaForm.es_est" 
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="es_est" class="empresa-label cursor-pointer">¿Es una Empresa de Servicios Transitorios (EST)?</label>
          </div>
          
          <!-- Campos adicionales para EST (solo se muestran si es_est está marcado) -->
          <transition name="fade">
            <div v-if="empresaForm.es_est" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2 space-y-3">
              <h4 class="text-sm font-semibold text-blue-700 mb-2">Datos de Registro EST</h4>
              
              <div>
                <label class="empresa-label">Número de Registro</label>
                <input 
                  v-model="empresaForm.est_registro_numero" 
                  :required="empresaForm.es_est"
                  class="input w-full px-2 py-1 mt-1" 
                  placeholder="Ej: EST-2024-001234" 
                />
              </div>
              
              <div>
                <label class="empresa-label">Fecha de Registro</label>
                <input 
                  type="date" 
                  v-model="empresaForm.est_registro_fecha" 
                  :required="empresaForm.es_est"
                  class="input w-full px-2 py-1 mt-1" 
                />
              </div>
              
              <div>
                <label class="empresa-label">Vigencia</label>
                <input 
                  v-model="empresaForm.est_vigente" 
                  :required="empresaForm.es_est"
                  class="input w-full px-2 py-1 mt-1" 
                  placeholder="Ej: 2 años, Indefinida, etc." 
                />
              </div>
            </div>
          </transition>
          
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

  <!-- Modal 'Unir trabajador' eliminado por petición del usuario -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth.js';
// Se reemplaza el uso directo de axios por el servicio AdminServices
import AdminServices from '../../services/AdminService.js'
import * as XLSX from 'xlsx'


// Estados reactivos
const empresas = ref([])
const loading = ref(false)
const submitting = ref(false)
const error = ref(null)
const search = ref({ query: '' })

const showModal = ref(false)
const showViewModal = ref(false)
const empresaView = ref({})
const empresaForm = ref({
  empresa_id: null,
  emp_nombre: '',
  emp_rut: '',
  telefono: '',
  descripcion: '',
  estado: 1,
  grup_emp_idn: null, // Se deja null por defecto por ahora, para después configurarlo
  es_est: false, // Indica si es una Empresa de Servicios Transitorios
  est_registro_numero: '', // Número de registro EST
  est_registro_fecha: '', // Fecha de registro EST
  est_vigente: '' // Vigencia del registro EST
})

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
    // Usar el servicio para asegurar que el token JWT se envía correctamente
    const response = await AdminServices.obtenerEmpresas()
    // Mapear los datos del backend a los nombres usados en el template
    // Se agrega este mapeo porque los datos del backend venían con nombres distintos a los usados en el template,
    // lo que causaba que solo se renderizaran tarjetas vacías en la web. Así, los campos coinciden y se muestran correctamente.
    empresas.value = (response.data || response).map(e => ({
      empresa_id: e.id,
      emp_nombre: e.nombre,
      emp_rut: e.rut,
      estado: e.activa ? 1 : 0,
      telefono: e.telefono || '',
      descripcion: e.descripcion || '',
      totalEmpleados: e.totalEmpleados ?? 0,
      es_est: e.es_est || false,
      est_registro_numero: e.est_registro_numero || '',
      est_registro_fecha: e.est_registro_fecha || '',
      est_vigente: e.est_vigente || ''
    }))
  } catch {
    error.value = 'Error al cargar empresas'
  } finally {
    loading.value = false
  }
  // Comentario: Este cambio es necesario porque el uso directo de axios no incluye el token JWT,
  // mientras que el servicio AdminServices sí lo agrega automáticamente mediante un interceptor.
  // Así se evita el error 401 (Unauthorized) y se mantiene la consistencia de la autenticación.
}

// Roles
const { hasRole } = useAuth();
const isAdmin = computed(() => hasRole('admin'));

function openModal() {
  showModal.value = true
  error.value = null
  empresaForm.value = { 
    empresa_id: null, 
    emp_nombre: '', 
    emp_rut: '', 
    telefono: '', 
    descripcion: '', 
    estado: 1,
    es_est: false,
    est_registro_numero: '',
    est_registro_fecha: '',
    est_vigente: ''
  }
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
    // IMPORTANTE: Usar el servicio para que el token JWT se envíe correctamente
    // Si usas axios directo, el backend puede rechazar la petición por falta de autenticación
    await AdminServices.eliminarEmpresa(empresaAEliminar.value.empresa_id)
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
    // IMPORTANTE: El backend espera emp_telefono y emp_descripcion, no telefono ni descripcion
    // Por eso se mapean aquí los nombres correctamente
    const payload = {
      emp_nombre: empresaForm.value.emp_nombre,
      emp_rut: empresaForm.value.emp_rut,
      emp_telefono: empresaForm.value.telefono, // <-- nombre esperado por el backend
      emp_descripcion: empresaForm.value.descripcion, // <-- nombre esperado por el backend
      estado: Number(empresaForm.value.estado),
      grup_emp_idn: null, // Se deja null por defecto por ahora, para después configurarlo
      es_est: empresaForm.value.es_est,
      est_registro_numero: empresaForm.value.es_est ? empresaForm.value.est_registro_numero : null,
      est_registro_fecha: empresaForm.value.es_est ? empresaForm.value.est_registro_fecha : null,
      est_vigente: empresaForm.value.es_est ? empresaForm.value.est_vigente : null
    }
    // Usar el servicio para asegurar que el token JWT se envía correctamente
    if (empresaForm.value.empresa_id) {
      // Si se implementa updateEmpresa en AdminServices, usarlo aquí
      // await AdminServices.updateEmpresa(empresaForm.value.empresa_id, payload)
      await AdminServices.actualizarEmpresa(empresaForm.value.empresa_id, payload)
    } else {
      await AdminServices.createEmpresa(payload)
    }
    showModal.value = false
    empresaForm.value = { 
      empresa_id: null, 
      emp_nombre: '', 
      emp_rut: '', 
      telefono: '', 
      descripcion: '', 
      estado: 1,
      es_est: false,
      est_registro_numero: '',
      est_registro_fecha: '',
      est_vigente: ''
    }
    error.value = null
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
async function openUnirTrabajadorModal() {
  showUnirTrabajadorModal.value = true
  unirError.value = null
  rutBusqueda.value = ''
  usuarioSeleccionado.value = ''
  empresaSeleccionada.value = ''
  listaUsuarios.value = []
  
  // Cargar la lista de usuarios desde el backend
  // Se utiliza el servicio AdminServices para mantener consistencia con el token JWT
  try {
    console.log('Cargando usuarios para el modal...')
    unirError.value = 'Cargando usuarios...' // Mostrar feedback visual
    
    const response = await AdminServices.obtenerUsuarios()
    console.log('Respuesta completa:', response)
    
    // Mapear los usuarios para el select, priorizando trabajadores sin empresa
    const usuarios = response.users || response.data || response || []
    listaUsuarios.value = usuarios
    
    console.log('Usuarios cargados:', listaUsuarios.value.length)
    
    if (listaUsuarios.value.length === 0) {
      unirError.value = 'No se encontraron usuarios disponibles'
    } else {
      unirError.value = null // Limpiar error si todo está bien
    }
    
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    if (error.response?.status === 401) {
      unirError.value = 'Error de autenticación. Por favor, inicie sesión nuevamente.'
    } else if (error.response?.status === 403) {
      unirError.value = 'No tiene permisos para ver los usuarios.'
    } else if (error.code === 'ECONNREFUSED') {
      unirError.value = 'No se puede conectar al servidor.'
    } else {
      unirError.value = `Error al cargar usuarios: ${error.response?.data?.message || error.message}`
    }
    listaUsuarios.value = []
  }
}
function closeUnirTrabajadorModal() { showUnirTrabajadorModal.value = false }

/**
 * Busca un usuario por RUT y lo selecciona automáticamente si lo encuentra
 * Normaliza el RUT ingresado y busca coincidencias en la lista de usuarios cargados
 */
function buscarPorRut() {
  // Validar que se haya ingresado un RUT
  if (!rutBusqueda.value || rutBusqueda.value.trim() === '') {
    unirError.value = 'Por favor, ingrese un RUT para buscar'
    return
  }

  // Limpiar errores previos
  unirError.value = null
  
  // Normalizar el RUT ingresado (quitar puntos, guiones y espacios, convertir a mayúsculas)
  const rutIngresado = rutBusqueda.value.replace(/[.\-\s]/g, '').toUpperCase().trim()
  
  console.log('Buscando usuario con RUT:', rutIngresado)
  console.log('Lista de usuarios disponibles:', listaUsuarios.value.length)
  
  // Buscar el usuario en la lista cargada
  const usuarioEncontrado = listaUsuarios.value.find(usuario => {
    if (!usuario.rut) return false
    
    // Normalizar el RUT del usuario de la misma manera
    const rutUsuario = usuario.rut.toString().replace(/[.\-\s]/g, '').toUpperCase().trim()
    
    console.log(`Comparando: ${rutIngresado} === ${rutUsuario}`)
    return rutIngresado === rutUsuario
  })

  if (usuarioEncontrado) {
    // Usuario encontrado - seleccionarlo automáticamente
    usuarioSeleccionado.value = usuarioEncontrado.id.toString()
    
    // Mostrar mensaje de éxito temporal
    unirError.value = `✅ Usuario encontrado: ${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido_pat}`
    
    // Limpiar el mensaje después de 3 segundos
    setTimeout(() => {
      if (unirError.value && unirError.value.startsWith('✅')) {
        unirError.value = null
      }
    }, 3000)
    
    console.log('Usuario encontrado y seleccionado:', usuarioEncontrado)
    
    // Limpiar el campo de búsqueda
    rutBusqueda.value = ''
    
  } else {
    // Usuario no encontrado
    unirError.value = `❌ No se encontró ningún usuario con RUT: ${rutBusqueda.value}`
    usuarioSeleccionado.value = ''
    
    console.log('Usuario no encontrado para RUT:', rutIngresado)
    console.log('RUTs disponibles:', listaUsuarios.value.map(u => u.rut))
    
    // Limpiar el mensaje de error después de 5 segundos
    setTimeout(() => {
      if (unirError.value && unirError.value.startsWith('❌')) {
        unirError.value = null
      }
    }, 5000)
  }
}

async function unirTrabajador() {
  // Validar que se haya seleccionado usuario y empresa
  if (!usuarioSeleccionado.value || !empresaSeleccionada.value) {
    unirError.value = 'Debe seleccionar usuario y empresa'
    return
  }
  
  try {
    console.log('Iniciando unión trabajador-empresa...')
    console.log('Usuario ID:', usuarioSeleccionado.value)
    console.log('Empresa ID:', empresaSeleccionada.value)
    
    // Mostrar feedback visual de que se está procesando
    unirError.value = 'Uniendo trabajador a empresa...'
    
    // Usar el apiClient configurado correctamente con el token JWT
    const datosUnion = {
      usuario_id: parseInt(usuarioSeleccionado.value),
      empresa_id: parseInt(empresaSeleccionada.value),
      rol_en_empresa: 'trabajador',
      fecha_inicio: new Date().toISOString().split('T')[0] // Fecha actual YYYY-MM-DD
    }
    
    console.log('Datos a enviar:', datosUnion)
    
    const response = await AdminServices.unirTrabajadorEmpresa(datosUnion)
    console.log('Respuesta del servidor:', response)
    
    // Mostrar mensaje de éxito
    unirError.value = null
    alert('¡Trabajador unido exitosamente a la empresa!')
    
    // Cerrar modal y actualizar datos
    closeUnirTrabajadorModal()
    await fetchEmpresas()
    
  } catch (error) {
    console.error('Error completo:', error)
    console.error('Respuesta del error:', error.response?.data)
    
    // Mostrar mensaje de error específico basado en el tipo de error
    if (error.response?.status === 400) {
      unirError.value = error.response.data.message || 'Datos inválidos para la unión'
    } else if (error.response?.status === 401) {
      unirError.value = 'Error de autenticación. Por favor, inicie sesión nuevamente.'
    } else if (error.response?.status === 403) {
      unirError.value = 'No tiene permisos para realizar esta operación.'
    } else if (error.response?.status === 404) {
      unirError.value = 'Usuario o empresa no encontrada.'
    } else if (error.code === 'ECONNREFUSED') {
      unirError.value = 'No se puede conectar al servidor.'
    } else {
      unirError.value = `Error: ${error.response?.data?.message || error.message || 'Error desconocido al unir trabajador'}`
    }
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
