<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-4xl w-full space-y-8">
      <div class="bg-white p-8 rounded-xl shadow-lg">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Selección de Empresa</h1>
          <p class="mt-2 text-gray-600">Seleccione la empresa que desea fiscalizar</p>
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700">
              <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Su selección se mantendrá hasta que cambie de empresa o cierre sesión
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando empresas...
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex justify-center">
              <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="mt-2 text-sm font-medium text-red-800">Error al cargar empresas</h3>
            <p class="mt-1 text-sm text-red-600">{{ error }}</p>
            <button 
              @click="cargarEmpresas"
              class="mt-4 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>

        <!-- Empresas List -->
        <div v-else-if="empresas.length > 0" class="space-y-4">
          <!-- Search/Filter -->
          <div class="mb-6">
            <label for="buscar" class="block text-sm font-medium text-gray-700 mb-2">
              Buscar empresa
            </label>
            <input
              id="buscar"
              v-model="filtroEmpresa"
              type="text"
              placeholder="Nombre de la empresa..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Empresa seleccionada actual -->
          <div v-if="empresaActual" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-green-800">Empresa seleccionada actualmente:</h3>
                <p class="text-sm text-green-600 font-semibold">{{ empresaActual.nombre }}</p>
                <p class="text-xs text-green-500">RUT: {{ empresaActual.rut }}</p>
              </div>
              <button 
                @click="continuarConEmpresaActual"
                class="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>

          <!-- Lista de empresas -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            <div
              v-for="empresa in empresasFiltradas"
              :key="empresa.rut"
              @click="seleccionarEmpresa(empresa)"
              class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
              :class="{ 'border-blue-500 bg-blue-50': empresaActual?.rut === empresa.rut }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {{ empresa.nombre }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">RUT: {{ empresa.rut }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ empresa.direccion }}</p>
                  <div class="mt-2 flex items-center text-xs">
                    <span 
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="empresa.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    >
                      {{ empresa.activa ? 'Activa' : 'Inactiva' }}
                    </span>
                    <span class="ml-2 text-gray-400">{{ empresa.totalEmpleados || 0 }} empleados</span>
                  </div>
                </div>
                <div class="ml-2">
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- No hay resultados de búsqueda -->
          <div v-if="empresasFiltradas.length === 0 && filtroEmpresa" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron empresas</h3>
            <p class="mt-1 text-sm text-gray-500">Intenta con otro término de búsqueda</p>
          </div>
        </div>

        <!-- No hay empresas -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay empresas disponibles</h3>
          <p class="mt-1 text-sm text-gray-500">Contacte al administrador del sistema</p>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex justify-between">
          <button 
            @click="logout"
            class="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3v1"></path>
            </svg>
            Cerrar sesión
          </button>
          
          <button 
            @click="cargarEmpresas"
            class="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Actualizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useDataStore } from '../../store/dataStorage.js'
import ReporteService from '../../services/reporteService.js'

const router = useRouter()
const { logout } = useAuth()
const dataStore = useDataStore()

// State
const isLoading = ref(false)
const error = ref('')
const empresas = ref([])
const filtroEmpresa = ref('')

// Computed
const empresaActual = computed(() => dataStore.getEmpresaSeleccionada)

const empresasFiltradas = computed(() => {
  if (!filtroEmpresa.value) return empresas.value
  
  const filtro = filtroEmpresa.value.toLowerCase()
  return empresas.value.filter(empresa => 
    empresa.nombre.toLowerCase().includes(filtro) ||
    empresa.rut.toString().toLowerCase().includes(filtro)
  )
})

// Methods
const cargarEmpresas = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await ReporteService.obtenerEmpresas()
    if (response.success) {
      empresas.value = response.data
      dataStore.setEmpresas(response.data)
    } else {
      error.value = response.error
    }
  } catch (e) {
    error.value = 'Error de conexión. Por favor, intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const seleccionarEmpresa = async (empresa) => {
  dataStore.setEmpresaSeleccionada(empresa)
  await ReporteService.emitirCorreoAEmpleador(empresa.id);
  router.push('/dashboard')
}

const continuarConEmpresaActual = () => {
  router.push('/dashboard')
}

// Lifecycle
onMounted(() => {
  cargarEmpresas()
})
</script>