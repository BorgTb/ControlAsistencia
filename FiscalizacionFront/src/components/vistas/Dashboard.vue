<template>
  <div class="min-h-screen bg-gray-50">

    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Welcome Section -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-gray-900">Sistema de Fiscalización Laboral</h1>
          <p class="mt-2 text-lg text-gray-600">Acceso permanente e irrestricto según Art. 22.4</p>
          <p class="mt-1 text-sm text-blue-600 font-medium">Perfil: Solo Lectura | Acceso a todos los reportes exigidos</p>
          
          <!-- Empresa seleccionada -->
          <div v-if="empresaSeleccionada" class="mt-4 inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <div class="text-left">
              <div class="font-semibold">{{ empresaSeleccionada.nombre }}</div>
              <div class="text-xs">RUT: {{ empresaSeleccionada.rut }}</div>
            </div>
            <button 
              @click="cambiarEmpresa"
              class="ml-3 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Cambiar
            </button>
          </div>
        </div>

        <!-- Legal Notice -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div class="flex">
            <svg class="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">Información Legal</h3>
              <p class="text-sm text-blue-700 mt-1">
                Este sistema cumple con las disposiciones del Art. 25 sobre reportes exigidos. 
                Todos los datos son de solo lectura y pueden ser exportados en PDF, Word o Excel.
              </p>
            </div>
          </div>
        </div>

        <!-- Reportes Exigidos por Ley -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-xl leading-6 font-medium text-gray-900">📋 Reportes Exigidos (Art. 25)</h3>
            <p class="mt-1 text-sm text-gray-500">Seleccione el reporte que desea consultar</p>
          </div>
          
          <div class="px-6 py-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- 1. Reporte de Asistencia -->
              <router-link 
                to="/reportes/asistencia" 
                class="group block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                      <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600">1. Reporte de Asistencia</h4>
                  </div>
                </div>
                <p class="text-sm text-gray-600">Control diario de presencias, ausencias y tardanzas del personal</p>
                <div class="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  Acceder <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </router-link>

              <!-- 2. Reporte de Jornada Diaria -->
              <router-link 
                to="/reportes/jornada-diaria" 
                class="group block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                      <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600">2. Reporte de Jornada Diaria</h4>
                  </div>
                </div>
                <p class="text-sm text-gray-600">Horas trabajadas, cumplimiento de jornada y horas extras</p>
                <div class="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  Acceder <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </router-link>

              <!-- 3. Reporte de Domingos y Festivos -->
              <router-link 
                to="/reportes/domingos-festivos" 
                class="group block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                      <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600">3. Domingos y Festivos</h4>
                  </div>
                </div>
                <p class="text-sm text-gray-600">Trabajo realizado en días no laborales y cálculo de sobrepagos</p>
                <div class="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  Acceder <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </router-link>

              <!-- 4. Modificaciones de Turnos -->
              <router-link 
                to="/reportes/modificaciones-turnos" 
                class="group block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200">
                      <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600">4. Modificaciones de Turnos</h4>
                  </div>
                </div>
                <p class="text-sm text-gray-600">Alteraciones y cambios en horarios de trabajo del personal</p>
                <div class="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  Acceder <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </router-link>

              <!-- 5. Marcaciones Diarias -->
              <router-link 
                to="/reportes/marcaciones-diarias" 
                class="group block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200">
                      <svg class="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600">5. Marcaciones Diarias</h4>
                  </div>
                </div>
                <p class="text-sm text-gray-600">Registro detallado de entradas, salidas y descansos</p>
                <div class="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  Acceder <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </router-link>

              <!-- 6. Incidentes Técnicos -->
              <router-link 
                to="/reportes/incidentes-tecnicos" 
                class="group block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200">
                      <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600">6. Incidentes Técnicos</h4>
                  </div>
                </div>
                <p class="text-sm text-gray-600">Problemas técnicos que afecten el sistema de control</p>
                <div class="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  Acceder <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Footer Legal -->
        <div class="mt-8 text-center text-sm text-gray-500">
          <p>Sistema de Fiscalización Laboral - Cumplimiento normativo según legislación vigente</p>
          <p class="mt-1">Acceso permanente e irrestricto | Solo lectura | Exportación completa disponible</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../../store/dataStorage.js'

const router = useRouter()
const dataStore = useDataStore()

// Computed
const empresaSeleccionada = computed(() => dataStore.getEmpresaSeleccionada)

// Methods
const cambiarEmpresa = () => {
  dataStore.clearEmpresaSeleccionada()
  router.push('/seleccionar-empresa')
}

onMounted(() => {
  // Verificar si hay empresa seleccionada
  if (!empresaSeleccionada.value) {
    router.push('/seleccionar-empresa')
  } else {
    console.log('Dashboard de Fiscalizador cargado - Empresa:', empresaSeleccionada.value.nombre)
  }
})
</script>