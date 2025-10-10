<template>
  <div class="min-h-screen bg-gray-50">

    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Configuración del Sasdadsdistema</h1>
          <p class="mt-2 text-gray-600">Ajustes y parámetros del sistema de fiscalización</p>
        </div>

        <!-- Configuration Sections -->
        <div class="space-y-6">
          <!-- General Settings -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Configuración General</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="nombreEmpresa" class="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    id="nombreEmpresa"
                    v-model="config.general.nombreEmpresa"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label for="timezone" class="block text-sm font-medium text-gray-700">Zona Horaria</label>
                  <select 
                    id="timezone"
                    v-model="config.general.timezone"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC-5">UTC-5 (Colombia)</option>
                    <option value="UTC-3">UTC-3 (Argentina)</option>
                    <option value="UTC-6">UTC-6 (México)</option>
                  </select>
                </div>
                <div>
                  <label for="idioma" class="block text-sm font-medium text-gray-700">Idioma</label>
                  <select 
                    id="idioma"
                    v-model="config.general.idioma"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
                <div>
                  <label for="formatoFecha" class="block text-sm font-medium text-gray-700">Formato de Fecha</label>
                  <select 
                    id="formatoFecha"
                    v-model="config.general.formatoFecha"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance Settings -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Configuración de Asistencia</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="horaEntrada" class="block text-sm font-medium text-gray-700">Hora de Entrada Estándar</label>
                  <input 
                    type="time" 
                    id="horaEntrada"
                    v-model="config.asistencia.horaEntrada"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label for="horaSalida" class="block text-sm font-medium text-gray-700">Hora de Salida Estándar</label>
                  <input 
                    type="time" 
                    id="horaSalida"
                    v-model="config.asistencia.horaSalida"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label for="toleranciaTardanza" class="block text-sm font-medium text-gray-700">Tolerancia Tardanza (minutos)</label>
                  <input 
                    type="number" 
                    id="toleranciaTardanza"
                    v-model="config.asistencia.toleranciaTardanza"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label for="horasJornada" class="block text-sm font-medium text-gray-700">Horas de Jornada</label>
                  <input 
                    type="number" 
                    id="horasJornada"
                    v-model="config.asistencia.horasJornada"
                    step="0.5"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
              </div>
              <div class="mt-4">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="config.asistencia.permitirMarcacionRemota"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Permitir marcación remota</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Configuración de Notificaciones</h3>
              <div class="space-y-4">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="config.notificaciones.emailTardanzas"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Notificar tardanzas por email</span>
                </label>
                
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="config.notificaciones.emailAusencias"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Notificar ausencias por email</span>
                </label>
                
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="config.notificaciones.emailHorasExtras"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Notificar horas extras por email</span>
                </label>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label for="emailSupervisor" class="block text-sm font-medium text-gray-700">Email Supervisor</label>
                    <input 
                      type="email" 
                      id="emailSupervisor"
                      v-model="config.notificaciones.emailSupervisor"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                  </div>
                  <div>
                    <label for="emailRRHH" class="block text-sm font-medium text-gray-700">Email RRHH</label>
                    <input 
                      type="email" 
                      id="emailRRHH"
                      v-model="config.notificaciones.emailRRHH"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Configuración de Seguridad</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="tiempoSesion" class="block text-sm font-medium text-gray-700">Tiempo de Sesión (horas)</label>
                  <input 
                    type="number" 
                    id="tiempoSesion"
                    v-model="config.seguridad.tiempoSesion"
                    min="1"
                    max="24"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label for="intentosAcceso" class="block text-sm font-medium text-gray-700">Máx. Intentos de Acceso</label>
                  <input 
                    type="number" 
                    id="intentosAcceso"
                    v-model="config.seguridad.maxIntentosAcceso"
                    min="3"
                    max="10"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
              </div>
              <div class="mt-4 space-y-4">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="config.seguridad.requiere2FA"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Requerir autenticación de dos factores</span>
                </label>
                
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="config.seguridad.logActividad"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Registrar log de actividad</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Report Settings -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Configuración de Reportes</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="formatoExportacion" class="block text-sm font-medium text-gray-700">Formato de Exportación</label>
                  <select 
                    id="formatoExportacion"
                    v-model="config.reportes.formatoExportacion"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <label for="maxRegistros" class="block text-sm font-medium text-gray-700">Máx. Registros por Reporte</label>
                  <input 
                    type="number" 
                    id="maxRegistros"
                    v-model="config.reportes.maxRegistros"
                    min="100"
                    max="10000"
                    step="100"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
              </div>
              <div class="mt-4">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="config.reportes.incluirGraficos"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">Incluir gráficos en reportes</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Acciones del Sistema</h3>
                  <p class="mt-1 text-sm text-gray-600">Operaciones de mantenimiento y configuración</p>
                </div>
                <div class="flex space-x-3">
                  <button 
                    @click="resetearConfiguracion"
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Resetear
                  </button>
                  <button 
                    @click="exportarConfiguracion"
                    class="px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    Exportar Config
                  </button>
                  <button 
                    @click="guardarConfiguracion"
                    class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Guardar Cambios
                  </button>
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
import { ref, onMounted } from 'vue'
import Header from '../component/header.vue'

const config = ref({
  general: {
    nombreEmpresa: 'TELEMEDIOS S.A.',
    timezone: 'UTC-5',
    idioma: 'es',
    formatoFecha: 'DD/MM/YYYY'
  },
  asistencia: {
    horaEntrada: '08:00',
    horaSalida: '17:00',
    toleranciaTardanza: 15,
    horasJornada: 8,
    permitirMarcacionRemota: false
  },
  notificaciones: {
    emailTardanzas: true,
    emailAusencias: true,
    emailHorasExtras: false,
    emailSupervisor: 'supervisor@telemedios.com',
    emailRRHH: 'rrhh@telemedios.com'
  },
  seguridad: {
    tiempoSesion: 8,
    maxIntentosAcceso: 3,
    requiere2FA: false,
    logActividad: true
  },
  reportes: {
    formatoExportacion: 'xlsx',
    maxRegistros: 1000,
    incluirGraficos: true
  }
})

const loadConfiguracion = async () => {
  // Cargar configuración desde la API
  console.log('Cargando configuración del sistema...')
}

const guardarConfiguracion = async () => {
  try {
    // Simular guardado
    console.log('Guardando configuración:', config.value)
    alert('Configuración guardada exitosamente')
  } catch (error) {
    alert('Error al guardar la configuración')
  }
}

const resetearConfiguracion = () => {
  if (confirm('¿Está seguro de que desea resetear toda la configuración a los valores por defecto?')) {
    loadConfiguracion()
    alert('Configuración reseteada')
  }
}

const exportarConfiguracion = () => {
  const configData = JSON.stringify(config.value, null, 2)
  const blob = new Blob([configData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'configuracion-sistema.json'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadConfiguracion()
})
</script>
