<template>
  <div class="min-h-screen bg-gray-100">


    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
            <p class="text-gray-600 mt-2">Administre las reglas y configuraciones del sistema de control</p>
          </div>
          <div class="flex space-x-3">
            <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Guardar Cambios</span>
            </button>
            <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              <span>Exportar Config</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs de Configuración -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white rounded-lg shadow">
          <!-- Tab Headers -->
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                <div class="flex items-center space-x-2">
                  <component :is="tab.icon" class="w-5 h-5" />
                  <span>{{ tab.name }}</span>
                </div>
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            
            <!-- General -->
            <div v-show="activeTab === 'general'">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Configuración General</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Información de la Empresa -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Información de la Empresa</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                    <input type="text" value="TeleMedios S.A." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                    <input type="text" value="76.123.456-7" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">Av. Providencia 1234, Santiago, Chile</textarea>
                  </div>
                </div>

                <!-- Configuración del Sistema -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Configuración del Sistema</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="America/Santiago">América/Santiago (UTC-3)</option>
                      <option value="America/Buenos_Aires">América/Buenos_Aires (UTC-3)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Idioma del Sistema</label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Formato de Fecha</label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reglamento Interno -->
            <div v-show="activeTab === 'reglamento'">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Reglamento Interno de Orden, Higiene y Seguridad</h3>
              
              <div class="space-y-6">
                <!-- Reglas de Uso -->
                <div class="bg-gray-50 p-6 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-4">Reglas de Uso del Sistema</h4>
                  
                  <div class="space-y-4">
                    <div class="flex items-start space-x-3">
                      <input type="checkbox" checked class="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <div>
                        <p class="text-sm font-medium text-gray-900">Uso obligatorio de métodos de identificación</p>
                        <p class="text-sm text-gray-500">Los trabajadores deben usar los métodos asignados para registrar su asistencia</p>
                      </div>
                    </div>
                    
                    <div class="flex items-start space-x-3">
                      <input type="checkbox" checked class="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <div>
                        <p class="text-sm font-medium text-gray-900">Prohibición de compartir credenciales</p>
                        <p class="text-sm text-gray-500">Está prohibido compartir tarjetas, claves o datos biométricos con otros trabajadores</p>
                      </div>
                    </div>
                    
                    <div class="flex items-start space-x-3">
                      <input type="checkbox" checked class="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <div>
                        <p class="text-sm font-medium text-gray-900">Responsabilidad por el uso correcto</p>
                        <p class="text-sm text-gray-500">Cada trabajador es responsable del uso correcto de su método de identificación</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sanciones -->
                <div class="bg-red-50 p-6 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-4">Sanciones por Incumplimiento</h4>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Uso indebido del sistema</label>
                      <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="amonestacion">Amonestación verbal</option>
                        <option value="amonestacion_escrita">Amonestación escrita</option>
                        <option value="suspension">Suspensión</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Compartir credenciales</label>
                      <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="amonestacion_escrita">Amonestación escrita</option>
                        <option value="suspension">Suspensión</option>
                        <option value="despido">Despido</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Marcaciones -->
            <div v-show="activeTab === 'marcaciones'">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Configuración de Marcaciones</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Tolerancias -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Tolerancias y Límites</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tolerancia de entrada (minutos)</label>
                    <input type="number" value="15" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tolerancia de salida (minutos)</label>
                    <input type="number" value="10" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tiempo mínimo entre marcaciones (minutos)</label>
                    <input type="number" value="5" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>

                <!-- Métodos de Identificación -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Métodos de Identificación</h4>
                  
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input type="checkbox" checked class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm font-medium text-gray-900">Biometría (Huella dactilar)</span>
                      </div>
                      <span class="text-sm text-gray-500">Primario</span>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input type="checkbox" checked class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm font-medium text-gray-900">Tarjeta RFID</span>
                      </div>
                      <span class="text-sm text-gray-500">Secundario</span>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm font-medium text-gray-900">Código PIN</span>
                      </div>
                      <span class="text-sm text-gray-500">Backup</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Configuración de Modificaciones -->
              <div class="mt-8 bg-yellow-50 p-6 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-4">Modificaciones de Marcaciones</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Requiere consentimiento del trabajador</label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="siempre">Siempre</option>
                      <option value="solo_correcciones">Solo correcciones</option>
                      <option value="nunca">Nunca</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tiempo límite para modificar (horas)</label>
                    <input type="number" value="24" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Turnos -->
            <div v-show="activeTab === 'turnos'">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Configuración de Turnos</h3>
              
              <div class="space-y-6">
                <!-- Turnos Disponibles -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-4">Turnos Disponibles</h4>
                  
                  <div class="space-y-4">
                    <!-- Turno Mañana -->
                    <div class="border border-gray-200 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <h5 class="font-medium text-gray-900">Turno Mañana</h5>
                        <div class="flex space-x-2">
                          <button class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</button>
                          <button class="text-red-600 hover:text-red-900 text-sm">Eliminar</button>
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Hora de entrada</label>
                          <input type="time" value="08:00" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Hora de salida</label>
                          <input type="time" value="16:00" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Descanso (minutos)</label>
                          <input type="number" value="60" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>
                    </div>

                    <!-- Turno Tarde -->
                    <div class="border border-gray-200 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <h5 class="font-medium text-gray-900">Turno Tarde</h5>
                        <div class="flex space-x-2">
                          <button class="text-indigo-600 hover:text-indigo-900 text-sm">Editar</button>
                          <button class="text-red-600 hover:text-red-900 text-sm">Eliminar</button>
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Hora de entrada</label>
                          <input type="time" value="14:00" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Hora de salida</label>
                          <input type="time" value="22:00" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Descanso (minutos)</label>
                          <input type="number" value="45" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                    Agregar Nuevo Turno
                  </button>
                </div>
              </div>
            </div>

            <!-- Notificaciones -->
            <div v-show="activeTab === 'notificaciones'">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Configuración de Notificaciones</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Email -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Configuración de Email</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Servidor SMTP</label>
                    <input type="text" value="smtp.empresa.com" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
                    <input type="number" value="587" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email de envío</label>
                    <input type="email" value="sistema@empresa.com" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>

                <!-- Tipos de Notificaciones -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Tipos de Notificaciones</h4>
                  
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input type="checkbox" checked class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm font-medium text-gray-900">Reporte diario de marcaciones</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input type="checkbox" checked class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm font-medium text-gray-900">Alerta de acceso de fiscalizador</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm font-medium text-gray-900">Notificación de tardanzas</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm font-medium text-gray-900">Alertas de incidentes técnicos</span>
                      </div>
                    </div>
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
import HeaderAdmin from '../../components/headerEmpresa.vue';
import { ref, onMounted } from 'vue';

// Estados reactivos
const activeTab = ref('general');

// Iconos para las tabs
const ConfigIcon = {
  template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
};

const DocumentIcon = {
  template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`
};

const ClockIcon = {
  template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
};

const CheckIcon = {
  template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7l2 2 4-4"></path></svg>`
};

const BellIcon = {
  template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5 5-5h-5m-6 0L9 7l-5 5 5 5h5m0 0v-5"></path></svg>`
};

const tabs = ref([
  { id: 'general', name: 'General', icon: ConfigIcon },
  { id: 'reglamento', name: 'Reglamento', icon: DocumentIcon },
  { id: 'marcaciones', name: 'Marcaciones', icon: CheckIcon },
  { id: 'turnos', name: 'Turnos', icon: ClockIcon },
  { id: 'notificaciones', name: 'Notificaciones', icon: BellIcon }
]);

onMounted(() => {
  console.log('Vista Configuración cargada');
});
</script>
