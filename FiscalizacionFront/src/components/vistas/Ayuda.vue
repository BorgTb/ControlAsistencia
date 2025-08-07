<template>
  <div class="min-h-screen bg-gray-50">

    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
          <p class="mt-2 text-gray-600">Guías, documentación y soporte para el sistema de fiscalización</p>
        </div>

        <!-- Search Bar -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Buscar en la ayuda..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Acceso Rápido</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                @click="scrollToSection('getting-started')"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <svg class="h-8 w-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Guía de Inicio</h4>
                  <p class="text-sm text-gray-500">Primeros pasos</p>
                </div>
              </button>

              <button 
                @click="scrollToSection('reports-guide')"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <svg class="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Guía de Reportes</h4>
                  <p class="text-sm text-gray-500">Cómo generar reportes</p>
                </div>
              </button>

              <button 
                @click="contactarSoporte"
                class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <svg class="h-8 w-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Soporte Técnico</h4>
                  <p class="text-sm text-gray-500">Contactar ayuda</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Help Sections -->
        <div class="space-y-6">
          <!-- Getting Started -->
          <div id="getting-started" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">🚀 Guía de Inicio Rápido</h3>
              <div class="prose max-w-none">
                <h4 class="text-md font-medium text-gray-900 mb-2">1. Acceso al Sistema</h4>
                <p class="text-sm text-gray-700 mb-4">
                  Para acceder al sistema de fiscalización, necesita solicitar un código temporal que será enviado a su email corporativo.
                </p>
                
                <h4 class="text-md font-medium text-gray-900 mb-2">2. Panel de Control</h4>
                <p class="text-sm text-gray-700 mb-4">
                  Una vez dentro, encontrará el dashboard principal con estadísticas en tiempo real y accesos rápidos a los reportes más importantes.
                </p>

                <h4 class="text-md font-medium text-gray-900 mb-2">3. Navegación</h4>
                <p class="text-sm text-gray-700 mb-4">
                  Use la barra de navegación superior para acceder a diferentes tipos de reportes: Asistencia, Jornada Diaria, Domingos y Festivos, etc.
                </p>

                <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                  <div class="flex">
                    <svg class="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div class="ml-3">
                      <h4 class="text-sm font-medium text-blue-800">Consejo</h4>
                      <p class="text-sm text-blue-700">
                        Marque esta página como favorita para acceso rápido futuro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reports Guide -->
          <div id="reports-guide" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">📊 Guía de Reportes</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="text-md font-medium text-gray-900 mb-2">Reporte de Asistencia</h4>
                  <ul class="text-sm text-gray-700 space-y-1 mb-4">
                    <li>• Ver empleados presentes/ausentes del día</li>
                    <li>• Filtrar por departamento o estado</li>
                    <li>• Exportar datos a Excel</li>
                    <li>• Estadísticas de tardanzas</li>
                  </ul>
                </div>

                <div>
                  <h4 class="text-md font-medium text-gray-900 mb-2">Jornada Diaria</h4>
                  <ul class="text-sm text-gray-700 space-y-1 mb-4">
                    <li>• Control de horas trabajadas</li>
                    <li>• Identificar horas extras</li>
                    <li>• Verificar cumplimiento de jornada</li>
                    <li>• Análisis por turnos</li>
                  </ul>
                </div>

                <div>
                  <h4 class="text-md font-medium text-gray-900 mb-2">Domingos y Festivos</h4>
                  <ul class="text-sm text-gray-700 space-y-1 mb-4">
                    <li>• Personal que trabajó en días no laborales</li>
                    <li>• Cálculo de pagos extras</li>
                    <li>• Vista de calendario</li>
                    <li>• Resumen por departamento</li>
                  </ul>
                </div>

                <div>
                  <h4 class="text-md font-medium text-gray-900 mb-2">Marcaciones Diarias</h4>
                  <ul class="text-sm text-gray-700 space-y-1 mb-4">
                    <li>• Registro detallado de entradas/salidas</li>
                    <li>• Línea de tiempo de marcaciones</li>
                    <li>• Detección de irregularidades</li>
                    <li>• Ubicación de dispositivos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Troubleshooting -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">🔧 Resolución de Problemas</h3>
              
              <div class="space-y-4">
                <div class="border border-gray-200 rounded-lg">
                  <button 
                    @click="toggleFAQ(1)"
                    class="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 rounded-t-lg"
                  >
                    <div class="flex justify-between items-center">
                      <span>No puedo acceder al sistema</span>
                      <svg :class="{ 'rotate-180': openFAQ === 1 }" class="h-5 w-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>
                  <div v-show="openFAQ === 1" class="px-4 py-3 text-sm text-gray-700">
                    <p class="mb-2">Si no puede acceder:</p>
                    <ul class="list-disc ml-6 space-y-1">
                      <li>Verifique que esté usando el email corporativo correcto</li>
                      <li>Revise la carpeta de spam/junk mail</li>
                      <li>Asegúrese de que el código no haya expirado (válido por 5 días)</li>
                      <li>Contacte al administrador si persiste el problema</li>
                    </ul>
                  </div>
                </div>

                <div class="border border-gray-200 rounded-lg">
                  <button 
                    @click="toggleFAQ(2)"
                    class="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 rounded-t-lg"
                  >
                    <div class="flex justify-between items-center">
                      <span>Los reportes no cargan datos</span>
                      <svg :class="{ 'rotate-180': openFAQ === 2 }" class="h-5 w-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>
                  <div v-show="openFAQ === 2" class="px-4 py-3 text-sm text-gray-700">
                    <p class="mb-2">Posibles soluciones:</p>
                    <ul class="list-disc ml-6 space-y-1">
                      <li>Actualice la página (F5 o Ctrl+R)</li>
                      <li>Verifique su conexión a internet</li>
                      <li>Ajuste los filtros de fecha</li>
                      <li>Reporte el problema si continúa</li>
                    </ul>
                  </div>
                </div>

                <div class="border border-gray-200 rounded-lg">
                  <button 
                    @click="toggleFAQ(3)"
                    class="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 rounded-t-lg"
                  >
                    <div class="flex justify-between items-center">
                      <span>Error al exportar reportes</span>
                      <svg :class="{ 'rotate-180': openFAQ === 3 }" class="h-5 w-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>
                  <div v-show="openFAQ === 3" class="px-4 py-3 text-sm text-gray-700">
                    <p class="mb-2">Para resolver problemas de exportación:</p>
                    <ul class="list-disc ml-6 space-y-1">
                      <li>Verifique que tiene permisos de descarga</li>
                      <li>Asegúrese de que no hay bloqueadores de pop-ups activos</li>
                      <li>Intente con un rango de fechas más pequeño</li>
                      <li>Use un navegador actualizado</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Support -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">📞 Contactar Soporte</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Email</h4>
                  <p class="text-sm text-gray-700">soporte@telemedios.com</p>
                </div>

                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Teléfono</h4>
                  <p class="text-sm text-gray-700">+57 (1) 234-5678</p>
                </div>

                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-purple-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Horario</h4>
                  <p class="text-sm text-gray-700">Lun - Vie: 8:00 - 18:00</p>
                </div>
              </div>

              <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div class="flex">
                  <svg class="h-5 w-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-yellow-800">Información Importante</h4>
                    <p class="text-sm text-yellow-700 mt-1">
                      Para reportes de problemas críticos o emergencias fuera del horario laboral, 
                      contacte directamente al administrador del sistema.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../component/header.vue'

const searchQuery = ref('')
const openFAQ = ref(null)

const toggleFAQ = (faqNumber) => {
  openFAQ.value = openFAQ.value === faqNumber ? null : faqNumber
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const contactarSoporte = () => {
  window.location.href = 'mailto:soporte@telemedios.com?subject=Consulta Sistema Fiscalización'
}
</script>
