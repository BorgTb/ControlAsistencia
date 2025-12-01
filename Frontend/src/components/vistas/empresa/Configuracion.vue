<template>
  <div class="min-h-screen bg-gray-100">


    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p class="text-gray-600 mt-2">Administre las reglas y configuraciones del sistema de control</p>
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
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-medium text-gray-900">Configuración General</h3>
                <button 
                  v-if="cambiosGeneral"
                  @click="guardarGeneral"
                  :disabled="guardandoGeneral"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg v-if="guardandoGeneral" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ guardandoGeneral ? 'Guardando...' : 'Guardar Cambios' }}</span>
                </button>
              </div>
              
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Información de la Empresa</h4>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    v-model="configuracion.general.emp_nombre"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                  <input 
                    type="text" 
                    v-model="configuracion.general.emp_rut"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <textarea 
                    rows="3" 
                    v-model="configuracion.general.direccion"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Marcaciones -->
            <div v-show="activeTab === 'marcaciones' && !esEst">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-medium text-gray-900">Configuración de Marcaciones</h3>
                <button 
                  v-if="cambiosMarcaciones"
                  @click="guardarMarcaciones"
                  :disabled="guardandoMarcaciones"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg v-if="guardandoMarcaciones" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ guardandoMarcaciones ? 'Guardando...' : 'Guardar Cambios' }}</span>
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Tolerancias -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Tolerancias y Límites</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tolerancia de entrada (minutos)</label>
                    <input 
                      type="number" 
                      v-model="configuracion.marcaciones.tolerancia_entrada"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tolerancia de salida (minutos)</label>
                    <input 
                      type="number" 
                      v-model="configuracion.marcaciones.tolerancia_salida"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tiempo mínimo entre marcaciones (minutos)</label>
                    <input 
                      type="number" 
                      v-model="configuracion.marcaciones.tiempo_min_entre_marcaciones"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Notificaciones -->
            <div v-show="activeTab === 'notificaciones'">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
                <button 
                  v-if="cambiosNotificaciones"
                  @click="guardarNotificaciones"
                  :disabled="guardandoNotificaciones"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg v-if="guardandoNotificaciones" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ guardandoNotificaciones ? 'Guardando...' : 'Guardar Cambios' }}</span>
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Email -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Configuración de Email</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Servidor SMTP</label>
                    <input 
                      type="text" 
                      v-model="configuracion.notificaciones.servidor_smtp"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
                    <input 
                      type="number" 
                      v-model="configuracion.notificaciones.puerto_smtp"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email de envío</label>
                    <input 
                      type="email" 
                      v-model="configuracion.notificaciones.email_envio"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                </div>

                <!-- Tipos de Notificaciones -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Tipos de Notificaciones</h4>
                  
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          v-model="configuracion.notificaciones.reporte_diario"
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        />
                        <span class="text-sm font-medium text-gray-900">Reporte diario de marcaciones</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          v-model="configuracion.notificaciones.alerta_fiscalizador"
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        />
                        <span class="text-sm font-medium text-gray-900">Alerta de acceso de fiscalizador</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          v-model="configuracion.notificaciones.email_tardanzas"
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        />
                        <span class="text-sm font-medium text-gray-900">Notificación de tardanzas</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          v-model="configuracion.notificaciones.email_incidentes"
                          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        />
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
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import EmpresaServices from '@/services/EmpresaService.js';

const { esEst } = useAuth();

// Estados reactivos
const activeTab = ref('general');

// Estados de guardado por sección
const guardandoGeneral = ref(false);
const guardandoMarcaciones = ref(false);
const guardandoNotificaciones = ref(false);

// Configuración general - datos reactivos para la empresa
const configuracion = ref({
  general: {
    emp_nombre: 'TeleMedios S.A.',
    emp_rut: '76.123.456-7',
    direccion: 'Av. Providencia 1234, Santiago, Chile'
  },
  marcaciones: {
    tolerancia_entrada: 15,
    tolerancia_salida: 10,
    tiempo_min_entre_marcaciones: 5,
  },
  notificaciones: {
    email_tardanzas: true,
    email_ausencias: true,
    email_incidentes: false,
    servidor_smtp: 'smtp.empresa.com',
    puerto_smtp: 587,
    email_envio: 'sistema@empresa.com',
    reporte_diario: true,
    alerta_fiscalizador: true
  }
});

// Configuración original para detectar cambios
const configuracionOriginal = ref({});

// Detectar cambios por sección
const cambiosGeneral = computed(() => {
  return JSON.stringify(configuracion.value.general) !== JSON.stringify(configuracionOriginal.value.general);
});

const cambiosMarcaciones = computed(() => {
  return JSON.stringify(configuracion.value.marcaciones) !== JSON.stringify(configuracionOriginal.value.marcaciones);
});

const cambiosNotificaciones = computed(() => {
  return JSON.stringify(configuracion.value.notificaciones) !== JSON.stringify(configuracionOriginal.value.notificaciones);
});

// Función para guardar configuración general
const guardarGeneral = async () => {
  try {
    guardandoGeneral.value = true;
    
    // Aquí harás la llamada al backend para guardar configuración general
    console.log('Guardando configuración general:', configuracion.value.general);
    // const response = await EmpresaServices.guardarConfiguracionGeneral(configuracion.value.general);
    
    

    // Actualizar configuración original después de guardar
    configuracionOriginal.value.general = JSON.parse(JSON.stringify(configuracion.value.general));
    
  } catch (error) {
    console.error('Error al guardar configuración general:', error);
    alert('Error al guardar la configuración general');
  } finally {
    guardandoGeneral.value = false;
  }
};

// Función para guardar configuración de marcaciones
const guardarMarcaciones = async () => {
  try {
    guardandoMarcaciones.value = true;
    
    // Aquí harás la llamada al backend para guardar configuración de marcaciones
    console.log('Guardando configuración de marcaciones:', configuracion.value.marcaciones);
    // const response = await EmpresaServices.guardarConfiguracionMarcaciones(configuracion.value.marcaciones);
    
    EmpresaServices.guardarConfiguracion(configuracion.value.marcaciones);
    
    // Actualizar configuración original después de guardar
    configuracionOriginal.value.marcaciones = JSON.parse(JSON.stringify(configuracion.value.marcaciones));
    
    alert('Configuración de marcaciones guardada exitosamente');
    
  } catch (error) {
    console.error('Error al guardar configuración de marcaciones:', error);
    alert('Error al guardar la configuración de marcaciones');
  } finally {
    guardandoMarcaciones.value = false;
  }
};

// Función para guardar configuración de notificaciones
const guardarNotificaciones = async () => {
  try {
    guardandoNotificaciones.value = true;
    
    // Aquí harás la llamada al backend para guardar configuración de notificaciones
    console.log('Guardando configuración de notificaciones:', configuracion.value.notificaciones);
    // const response = await EmpresaServices.guardarConfiguracionNotificaciones(configuracion.value.notificaciones);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Actualizar configuración original después de guardar
    configuracionOriginal.value.notificaciones = JSON.parse(JSON.stringify(configuracion.value.notificaciones));
    
    alert('Configuración de notificaciones guardada exitosamente');
    
  } catch (error) {
    console.error('Error al guardar configuración de notificaciones:', error);
    alert('Error al guardar la configuración de notificaciones');
  } finally {
    guardandoNotificaciones.value = false;
  }
};

const obtenerConfiguracionMarcaciones = async () => {
  try {
    const response = await EmpresaServices.obtenerConfiguracionMarcaciones();
    configuracion.value.marcaciones = response.data;
  } catch (error) {
    console.error('Error al obtener configuración de marcaciones:', error);
    alert('Error al cargar la configuración de marcaciones');
  }
};


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

const tabs = computed(() => {
  const baseTabs = [
    { id: 'general', name: 'General', icon: ConfigIcon },
    { id: 'marcaciones', name: 'Marcaciones', icon: CheckIcon },
    { id: 'notificaciones', name: 'Notificaciones', icon: BellIcon }
  ];
  
  return baseTabs;
});

onMounted( async () => {
  await obtenerConfiguracionMarcaciones();
});
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
