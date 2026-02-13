<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click="closeOnBackdrop"
  >
    <!-- Overlay -->
    <div class="fixed inset-0 bg-opacity-50 transition-opacity modal-overlay"></div>
    
    <!-- Modal Container -->
    <div class="relative z-10 w-full max-w-lg lg:max-w-2xl mx-4">
      <!-- Modal Content -->
      <div 
        class="relative transform rounded-lg bg-white text-left shadow-2xl transition-all max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <!-- Header del Modal -->
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-900">
                Registrar Nuevo Usuario
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                Paso {{ currentStep }} de 5
              </p>
            </div>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Indicador de progreso -->
          <div class="mb-6">
            <div class="flex justify-between items-center">
              <div v-for="step in 5" :key="step" class="flex-1">
                <div class="flex items-center">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  ]">
                    {{ step }}
                  </div>
                  <div v-if="step < 5" :class="[
                    'flex-1 h-1 mx-2',
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  ]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Formulario -->
          <form @submit.prevent="submitForm" class="space-y-6">
            
            <!-- Contenedor de transiciones -->
            <transition :name="slideDirection" mode="out-in">
              <!-- PASO 1: Búsqueda de Trabajador por RUT -->
              <div v-if="currentStep === 1" key="step1" class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Buscar Trabajador</h4>
              
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Buscar por RUT *
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="rutBusqueda"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: 12.345.678-9"
                      :disabled="buscandoTrabajador"
                      @keypress.enter.prevent="buscarTrabajador"
                    />
                    <button
                      type="button"
                      @click="buscarTrabajador"
                      :disabled="buscandoTrabajador || !rutBusqueda.trim()"
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg v-if="buscandoTrabajador" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ buscandoTrabajador ? 'Buscando...' : 'Buscar' }}</span>
                    </button>
                    <button
                      type="button"
                      @click="limpiarBusqueda"
                      :disabled="buscandoTrabajador"
                      class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Limpiar</span>
                    </button>
                  </div>
                </div>
                
                <!-- Mensaje de resultado de búsqueda -->
                <div v-if="mensajeBusqueda" :class="[
                  'p-3 rounded-md flex items-start gap-2',
                  trabajadorEncontrado ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                ]">
                  <svg v-if="trabajadorEncontrado" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <div class="flex-1">
                    <p :class="trabajadorEncontrado ? 'text-green-700' : 'text-yellow-700'" class="text-sm font-medium">
                      {{ mensajeBusqueda }}
                    </p>
                    <p v-if="yaAsociadoEmpresa" class="text-sm text-red-600 mt-1">
                      El trabajador ya está asociado a su empresa. No es posible registrarlo nuevamente.
                    </p>
                  </div>
                </div>
              </div>
              </div>

              <!-- PASO 2: Información Básica del Usuario -->
              <div v-else-if="currentStep === 2" key="step2" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Información del Usuario</h4>
              
              <div class="space-y-4">
                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombres *
                  </label>
                  <input
                    v-model="trabajador.nombre"
                    type="text"
                    :disabled="camposBloqueados"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500',
                      errors.nombre ? 'border-red-500' : 'border-gray-300',
                      camposBloqueados ? 'bg-gray-100 cursor-not-allowed' : ''
                    ]"
                    placeholder="Ej: Juan Carlos"
                  />
                  <span v-if="errors.nombre" class="text-red-500 text-xs mt-1">{{ errors.nombre }}</span>
                </div>

                <!-- Apellido Paterno -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Paterno *
                  </label>
                  <input
                    v-model="trabajador.apellido_pat"
                    type="text"
                    :disabled="camposBloqueados"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500',
                      errors.apellido_pat ? 'border-red-500' : 'border-gray-300',
                      camposBloqueados ? 'bg-gray-100 cursor-not-allowed' : ''
                    ]"
                    placeholder="Ej: Pérez"
                  />
                  <span v-if="errors.apellido_pat" class="text-red-500 text-xs mt-1">{{ errors.apellido_pat }}</span>
                </div>

                <!-- Apellido Materno -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Apellido Materno *
                  </label>
                  <input
                    v-model="trabajador.apellido_mat"
                    type="text"
                    :disabled="camposBloqueados"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500',
                      errors.apellido_mat ? 'border-red-500' : 'border-gray-300',
                      camposBloqueados ? 'bg-gray-100 cursor-not-allowed' : ''
                    ]"
                    placeholder="Ej: González"
                  />
                  <span v-if="errors.apellido_mat" class="text-red-500 text-xs mt-1">{{ errors.apellido_mat }}</span>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    v-model="trabajador.email"
                    type="email"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500',
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    ]"
                    placeholder="Ej: juan.perez@empresa.com"
                  />
                  <span v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</span>
                  <p v-if="trabajadorEncontrado && !yaAsociadoEmpresa" class="text-xs text-blue-600 mt-1">
                    Si cambia el correo, se creará un nuevo usuario. Si usa el mismo correo, solo se asociará a su empresa.
                  </p>
                </div>
              </div>
              </div>

              <!-- PASO 3: Contraseña y Rol -->
              <div v-else-if="currentStep === 3" key="step3" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Acceso y Rol</h4>
              
              <div class="space-y-4">
                <!-- Password -->
                <div v-if="!trabajadorEncontrado || (trabajadorEncontrado && trabajador.email !== emailOriginal)">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    v-model="trabajador.password"
                    type="password"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500',
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    ]"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <span v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</span>
                  <p v-if="trabajadorEncontrado && trabajador.email !== emailOriginal" class="text-xs text-orange-600 mt-1">
                    Se creará un nuevo usuario porque el correo cambió
                  </p>
                </div>
                
                <div v-else class="bg-blue-50 border border-blue-200 p-3 rounded-md">
                  <p class="text-sm text-blue-700">
                    No es necesario ingresar contraseña porque se usará el usuario existente
                  </p>
                </div>

                <!-- Rol -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    v-model="trabajador.rol"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500',
                      errors.rol ? 'border-red-500' : 'border-gray-300'
                    ]"
                  >
                    <option value="trabajador">Trabajador</option>
                    <option value="empleador">Empleador</option>
                  </select>
                  <span v-if="errors.rol" class="text-red-500 text-xs mt-1">{{ errors.rol }}</span>
                  <p v-if="trabajadorEncontrado && !yaAsociadoEmpresa" class="text-xs text-blue-600 mt-1">
                    Puede asignar el rol para este trabajador en su empresa
                  </p>
                </div>

                <!-- Estado -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div class="flex items-center">
                    <input
                      v-model="trabajador.estado"
                      type="checkbox"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 block text-sm text-gray-900">
                      Activo
                    </label>
                  </div>
                </div>
              </div>
              </div>

              <!-- PASO 4: Sistema Excepcional de Jornada -->
              <div v-else-if="currentStep === 4" key="step4" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Sistema Excepcional de Jornada de Trabajo</h4>
              
              <div class="space-y-4">
                <!-- Pregunta principal -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    ¿Este trabajador está acogido al sistema excepcional de distribución de jornada de trabajo y descansos?
                  </label>
                  <div class="flex items-center">
                    <input
                      v-model="trabajador.sistemaExcepcional"
                      type="checkbox"
                      class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 block text-sm text-gray-900">
                      Sí, está acogido al sistema excepcional
                    </label>
                  </div>
                </div>

                <!-- Campos adicionales cuando está marcado -->
                <div v-if="trabajador.sistemaExcepcional" class="space-y-4 pl-6 border-l-2 border-yellow-300">
                  <!-- Número de Resolución -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Número de Resolución *
                    </label>
                    <input
                      v-model="trabajador.numeroResolucion"
                      type="text"
                      :class="[
                        'w-full px-3 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500',
                        errors.numeroResolucion ? 'border-red-500' : 'border-gray-300'
                      ]"
                      placeholder="Ej: RES-2024-001"
                    />
                    <span v-if="errors.numeroResolucion" class="text-red-500 text-xs mt-1">{{ errors.numeroResolucion }}</span>
                  </div>

                  <!-- Fecha de Resolución -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Resolución *
                    </label>
                    <input
                      v-model="trabajador.fechaResolucion"
                      type="date"
                      :class="[
                        'w-full px-3 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500',
                        errors.fechaResolucion ? 'border-red-500' : 'border-gray-300'
                      ]"
                    />
                    <span v-if="errors.fechaResolucion" class="text-red-500 text-xs mt-1">{{ errors.fechaResolucion }}</span>
                  </div>
                </div>
              </div>
              </div>

              <!-- PASO 5: Preferencias de Compensación -->
              <div v-else-if="currentStep === 5" key="step5" class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Preferencias de Compensación de Horas Extras</h4>
              
              <div class="space-y-4">
                <!-- Tipo de Compensación -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Compensación *
                  </label>
                  <select
                    v-model="trabajador.preferenciasCompensacion.tipo_compensacion"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500',
                      errors.preferenciasCompensacion.tipo_compensacion ? 'border-red-500' : 'border-gray-300'
                    ]"
                  >
                    <option value="PAGO">Pago (100% remunerado)</option>
                    <option value="TIEMPO_LIBRE">Tiempo Libre (100% descanso compensatorio)</option>
                    <option value="mixto">Mixto (combinación de pago y tiempo libre)</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Seleccione cómo prefiere compensar las horas extras de este trabajador
                  </p>
                  <span v-if="errors.preferenciasCompensacion.tipo_compensacion" class="text-red-500 text-xs mt-1">{{ errors.preferenciasCompensacion.tipo_compensacion }}</span>
                </div>

                <!-- Porcentaje de Pago (solo para mixto) -->
                <div v-if="trabajador.preferenciasCompensacion.tipo_compensacion === 'mixto'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje de Pago *
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="trabajador.preferenciasCompensacion.porcentaje_pago"
                      type="number"
                      min="0"
                      max="100"
                      :class="[
                        'flex-1 px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500',
                        errors.preferenciasCompensacion.porcentaje_pago ? 'border-red-500' : 'border-gray-300'
                      ]"
                    />
                    <span class="text-gray-600">%</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    El resto se compensará con tiempo libre
                  </p>
                  <span v-if="errors.preferenciasCompensacion.porcentaje_pago" class="text-red-500 text-xs mt-1">{{ errors.preferenciasCompensacion.porcentaje_pago }}</span>
                </div>

                <!-- Fecha de Inicio -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    v-model="trabajador.preferenciasCompensacion.fecha_inicio"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p class="text-xs text-gray-500 mt-1">A partir de cuándo será válida esta preferencia</p>
                </div>
              </div>
              </div>
            </transition>

            <!-- Mensaje de Error General -->
            <div v-if="errorGeneral" class="bg-red-50 border border-red-200 rounded-md p-3">
              <div class="flex">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-red-800">{{ errorGeneral }}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer del Modal -->
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:justify-between sm:px-6">
          <!-- Botón de Anterior a la izquierda (pasos 2-5) -->
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            :disabled="isLoading"
            type="button"
            class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Anterior
          </button>
          
          <!-- Espacio vacío cuando no hay botón anterior -->
          <div v-else></div>
          
          <!-- Botones de acción a la derecha -->
          <div class="flex gap-2 mt-3 sm:mt-0">
            <button
              @click="closeModal"
              :disabled="isLoading"
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            
            <!-- Botón de Finalizar (solo en paso 5) -->
            <button
              v-if="currentStep === 5"
              @click="submitForm"
              :disabled="isLoading"
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Registrando...' : 'Registrar Usuario' }}
            </button>
            
            <!-- Botón de Siguiente (pasos 1-4) -->
            <button
              v-else
              @click="nextStep"
              :disabled="isLoading"
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import EmpresaServices from '../../services/empresa-service.js'
import { useAuthStore } from '../../stores/auth-store.js'
import Swal from 'sweetalert2'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'success'])

// Estados reactivos
const isLoading = ref(false)
const errorGeneral = ref('')
const buscandoTrabajador = ref(false)
const trabajadorEncontrado = ref(false)
const yaAsociadoEmpresa = ref(false)
const camposBloqueados = ref(false)
const rutBusqueda = ref('')
const mensajeBusqueda = ref('')
const trabajadorIdExistente = ref(null)
const emailOriginal = ref('')
const currentStep = ref(1) // Control de pasos del formulario (1-5)
const slideDirection = ref('slide-right') // Dirección de la animación

// Datos del trabajador
const trabajador = reactive({
  nombre: '',
  apellido_pat: '',
  apellido_mat: '',
  email: '',
  password: '',
  rol: 'trabajador',
  rut: '',
  estado: true,
  sistemaExcepcional: false,
  numeroResolucion: '',
  fechaResolucion: '',
  preferenciasCompensacion: {
    tipo_compensacion: 'PAGO',
    porcentaje_pago: 0,
    fecha_inicio: new Date().toISOString().split('T')[0]
  }
})

// Errores de validación
const errors = reactive({
  nombre: '',
  apellido_pat: '',
  apellido_mat: '',
  email: '',
  password: '',
  rol: '',
  rut: '',
  numeroResolucion: '',
  fechaResolucion: '',
  preferenciasCompensacion: {
    tipo_compensacion: '',
    porcentaje_pago: ''
  }
})

// Métodos
const closeModal = () => {
  // Restaurar scroll del body
  const body = document.body
  const html = document.documentElement
  
  body.style.overflow = ''
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.bottom = ''
  body.classList.remove('modal-open')
  html.style.overflow = ''
  
  emit('close')
  resetForm()
}

const closeOnBackdrop = (event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const resetForm = () => {
  // Resetear datos del trabajador
  trabajador.nombre = ''
  trabajador.apellido_pat = ''
  trabajador.apellido_mat = ''
  trabajador.email = ''
  trabajador.password = ''
  trabajador.rol = 'trabajador'
  trabajador.rut = ''
  trabajador.estado = true
  trabajador.sistemaExcepcional = false
  trabajador.numeroResolucion = ''
  trabajador.fechaResolucion = ''
  trabajador.preferenciasCompensacion.tipo_compensacion = 'PAGO'
  trabajador.preferenciasCompensacion.porcentaje_pago = 0
  trabajador.preferenciasCompensacion.fecha_inicio = new Date().toISOString().split('T')[0]
  
  // Resetear estados de búsqueda
  rutBusqueda.value = ''
  trabajadorEncontrado.value = false
  yaAsociadoEmpresa.value = false
  camposBloqueados.value = false
  mensajeBusqueda.value = ''
  trabajadorIdExistente.value = null
  currentStep.value = 1 // Volver al paso 1
  
  // Resetear errores
  Object.keys(errors).forEach(key => {
    if (typeof errors[key] === 'object') {
      Object.keys(errors[key]).forEach(subKey => {
        errors[key][subKey] = ''
      })
    } else {
      errors[key] = ''
    }
  })
  
  errorGeneral.value = ''
}

const buscarTrabajador = async () => {
  if (!rutBusqueda.value.trim()) {
    mensajeBusqueda.value = 'Por favor, ingrese un RUT para buscar'
    return
  }
  
  buscandoTrabajador.value = true
  mensajeBusqueda.value = ''
  errorGeneral.value = ''
  
  try {
    console.log('🔍 Buscando trabajador con RUT:', rutBusqueda.value)
    const response = await EmpresaServices.buscarTrabajadorPorRut(rutBusqueda.value)
    
    console.log('📦 Respuesta de búsqueda:', response)
    
    if (response.success && response.encontrado) {
      // Trabajador encontrado
      trabajadorEncontrado.value = true
      trabajadorIdExistente.value = response.data.id
      yaAsociadoEmpresa.value = response.yaAsociado || false
      
      if (yaAsociadoEmpresa.value) {
        // Ya está asociado a la empresa - NO llenar datos, solo mostrar error
        camposBloqueados.value = true
        emailOriginal.value = ''
        mensajeBusqueda.value = `Trabajador encontrado: ${response.data.nombre} ${response.data.apellido_pat}`
      } else {
        // Trabajador existe pero NO está en esta empresa - Llenar datos y permitir editar rol y email
        camposBloqueados.value = true
        emailOriginal.value = response.data.email // Guardar email original
        
        // Llenar los datos del trabajador
        trabajador.nombre = response.data.nombre
        trabajador.apellido_pat = response.data.apellido_pat
        trabajador.apellido_mat = response.data.apellido_mat
        trabajador.email = response.data.email
        trabajador.rut = response.data.rut
        trabajador.rol = response.data.rol || 'trabajador'
        trabajador.estado = response.data.estado
        
        // Si tiene preferencias de compensación, llenarlas
        if (response.data.preferenciasCompensacion) {
          trabajador.preferenciasCompensacion.tipo_compensacion = response.data.preferenciasCompensacion.tipo_compensacion
          trabajador.preferenciasCompensacion.porcentaje_pago = response.data.preferenciasCompensacion.porcentaje_pago || 0
          trabajador.preferenciasCompensacion.fecha_inicio = response.data.preferenciasCompensacion.fecha_inicio || new Date().toISOString().split('T')[0]
        }
        
        mensajeBusqueda.value = `Trabajador encontrado: ${response.data.nombre} ${response.data.apellido_pat}. Puede asociarlo a su empresa.`
        
        // Avanzar automáticamente al siguiente paso
        currentStep.value = 2
      }
      
    } else {
      // Trabajador no encontrado
      trabajadorEncontrado.value = false
      yaAsociadoEmpresa.value = false
      camposBloqueados.value = false
      trabajadorIdExistente.value = null
      
      // Prellenar solo el RUT
      trabajador.rut = rutBusqueda.value
      
      mensajeBusqueda.value = 'No se encontró un trabajador con ese RUT. Puede crear uno nuevo.'
      
      // Avanzar automáticamente al siguiente paso
      currentStep.value = 2
    }
  } catch (error) {
    console.error('❌ Error buscando trabajador:', error)
    trabajadorEncontrado.value = false
    yaAsociadoEmpresa.value = false
    camposBloqueados.value = false
    
    // Prellenar el RUT de todos modos
    trabajador.rut = rutBusqueda.value
    
    mensajeBusqueda.value = 'No se encontró un trabajador con ese RUT. Puede crear uno nuevo.'
    
    // Avanzar automáticamente al siguiente paso
    currentStep.value = 2
  } finally {
    buscandoTrabajador.value = false
  }
}

const limpiarBusqueda = () => {
  rutBusqueda.value = ''
  trabajadorEncontrado.value = false
  yaAsociadoEmpresa.value = false
  camposBloqueados.value = false
  mensajeBusqueda.value = ''
  trabajadorIdExistente.value = null
  emailOriginal.value = ''
  currentStep.value = 1 // Volver al paso 1
  
  // Resetear solo los datos del trabajador, mantener preferencias
  trabajador.nombre = ''
  trabajador.apellido_pat = ''
  trabajador.apellido_mat = ''
  trabajador.email = ''
  trabajador.password = ''
  trabajador.rol = 'trabajador'
  trabajador.rut = ''
  trabajador.estado = true
}

// Navegación entre pasos
const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep.value < 5) {
      slideDirection.value = 'slide-right'
      currentStep.value++
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    slideDirection.value = 'slide-left'
    currentStep.value--
  }
}

const validateCurrentStep = () => {
  errorGeneral.value = ''
  
  switch (currentStep.value) {
    case 1:
      // Paso 1: Validar que se haya buscado el RUT
      if (!rutBusqueda.value.trim()) {
        errorGeneral.value = 'Por favor, ingrese un RUT para buscar'
        return false
      }
      if (yaAsociadoEmpresa.value) {
        errorGeneral.value = 'Este trabajador ya está asociado a su empresa'
        return false
      }
      return true
      
    case 2:
      // Paso 2: Validar datos básicos (nombre, apellidos, email)
      errors.nombre = ''
      errors.apellido_pat = ''
      errors.apellido_mat = ''
      errors.email = ''
      
      let isValid = true
      
      if (!trabajador.nombre.trim()) {
        errors.nombre = 'El nombre es requerido'
        isValid = false
      }
      
      if (!trabajador.apellido_pat.trim()) {
        errors.apellido_pat = 'El apellido paterno es requerido'
        isValid = false
      }
      
      if (!trabajador.apellido_mat.trim()) {
        errors.apellido_mat = 'El apellido materno es requerido'
        isValid = false
      }
      
      if (!trabajador.email.trim()) {
        errors.email = 'El email es requerido'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trabajador.email)) {
        errors.email = 'Formato de email inválido'
        isValid = false
      }
      
      return isValid
      
    case 3:
      // Paso 3: Validar contraseña y rol
      errors.password = ''
      errors.rol = ''
      
      let isValidStep3 = true
      
      // Solo validar password si no se encontró el trabajador o si cambió el email
      if (!trabajadorEncontrado.value || (trabajadorEncontrado.value && trabajador.email !== emailOriginal.value)) {
        if (!trabajador.password.trim()) {
          errors.password = 'La contraseña es requerida'
          isValidStep3 = false
        } else if (trabajador.password.length < 6) {
          errors.password = 'La contraseña debe tener al menos 6 caracteres'
          isValidStep3 = false
        }
      }
      
      if (!trabajador.rol) {
        errors.rol = 'El rol es requerido'
        isValidStep3 = false
      }
      
      return isValidStep3
      
    case 4:
      // Paso 4: Validar sistema excepcional
      errors.numeroResolucion = ''
      errors.fechaResolucion = ''
      
      if (trabajador.sistemaExcepcional) {
        let isValidStep4 = true
        
        if (!trabajador.numeroResolucion.trim()) {
          errors.numeroResolucion = 'El número de resolución es requerido'
          isValidStep4 = false
        }
        
        if (!trabajador.fechaResolucion.trim()) {
          errors.fechaResolucion = 'La fecha de resolución es requerida'
          isValidStep4 = false
        }
        
        return isValidStep4
      }
      return true
      
    case 5:
      // Paso 5: Validar preferencias de compensación
      errors.preferenciasCompensacion.tipo_compensacion = ''
      errors.preferenciasCompensacion.porcentaje_pago = ''
      
      let isValidStep5 = true
      
      if (!trabajador.preferenciasCompensacion.tipo_compensacion) {
        errors.preferenciasCompensacion.tipo_compensacion = 'El tipo de compensación es requerido'
        isValidStep5 = false
      }
      
      if (trabajador.preferenciasCompensacion.tipo_compensacion === 'mixto') {
        const porcentaje = parseFloat(trabajador.preferenciasCompensacion.porcentaje_pago)
        if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
          errors.preferenciasCompensacion.porcentaje_pago = 'El porcentaje debe estar entre 0 y 100'
          isValidStep5 = false
        }
      }
      
      return isValidStep5
      
    default:
      return true
  }
}

const validateForm = () => {
  let isValid = true
  
  // Resetear errores
  Object.keys(errors).forEach(key => {
    if (typeof errors[key] === 'object') {
      Object.keys(errors[key]).forEach(subKey => {
        errors[key][subKey] = ''
      })
    } else {
      errors[key] = ''
    }
  })
  
  // Validar que no intente asociar un trabajador ya asociado
  if (yaAsociadoEmpresa.value) {
    errorGeneral.value = 'Este trabajador ya está asociado a su empresa. No puede registrarlo nuevamente.'
    return false
  }
  
  // Validar campos requeridos
  if (!trabajador.nombre.trim()) {
    errors.nombre = 'El nombre es requerido'
    isValid = false
  }
  
  if (!trabajador.apellido_pat.trim()) {
    errors.apellido_pat = 'El apellido paterno es requerido'
    isValid = false
  }
  
  if (!trabajador.apellido_mat.trim()) {
    errors.apellido_mat = 'El apellido materno es requerido'
    isValid = false
  }
  
  if (!trabajador.email.trim()) {
    errors.email = 'El email es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trabajador.email)) {
    errors.email = 'Formato de email inválido'
    isValid = false
  }
  
  // Solo validar password si no se encontró el trabajador (nuevo usuario)
  // O si se encontró pero cambió el email (nuevo usuario con mismo RUT)
  if (!trabajadorEncontrado.value || (trabajadorEncontrado.value && trabajador.email !== emailOriginal.value)) {
    if (!trabajador.password.trim()) {
      errors.password = 'La contraseña es requerida'
      isValid = false
    } else if (trabajador.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
      isValid = false
    }
  }
  
  if (!trabajador.rut.trim()) {
    errors.rut = 'El RUT es requerido'
    isValid = false
  }
  
  if (!trabajador.rol) {
    errors.rol = 'El rol es requerido'
    isValid = false
  }
  
  // Validar sistema excepcional
  if (trabajador.sistemaExcepcional) {
    if (!trabajador.numeroResolucion.trim()) {
      errors.numeroResolucion = 'El número de resolución es requerido'
      isValid = false
    }
    
    if (!trabajador.fechaResolucion.trim()) {
      errors.fechaResolucion = 'La fecha de resolución es requerida'
      isValid = false
    }
  }

  // Validar preferencias de compensación
  if (!trabajador.preferenciasCompensacion.tipo_compensacion) {
    errors.preferenciasCompensacion.tipo_compensacion = 'El tipo de compensación es requerido'
    isValid = false
  }

  if (trabajador.preferenciasCompensacion.tipo_compensacion === 'mixto') {
    const porcentaje = parseFloat(trabajador.preferenciasCompensacion.porcentaje_pago)
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      errors.preferenciasCompensacion.porcentaje_pago = 'El porcentaje debe estar entre 0 y 100'
      isValid = false
    }
  }
  
  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  errorGeneral.value = ''
  
  try {
    // Debug: Verificar autenticación antes de enviar
    const authStore = useAuthStore()
    console.log('🔍 Debug auth antes de crear trabajador:')
    console.log('- Token existe:', !!authStore.getToken)
    console.log('- Usuario:', authStore.getUser)
    console.log('- Trabajador encontrado:', trabajadorEncontrado.value)
    console.log('- Email original:', emailOriginal.value)
    console.log('- Email actual:', trabajador.email)
    console.log('- Email cambió:', trabajadorEncontrado.value && trabajador.email !== emailOriginal.value)
    console.log('- Datos a enviar:', trabajador)
    
    // Agregar flag para indicar si el email cambió (para crear nuevo usuario)
    const datosEnviar = {
      ...trabajador,
      emailCambio: trabajadorEncontrado.value && emailOriginal.value && trabajador.email !== emailOriginal.value
    }
    
    const response = await EmpresaServices.crearTrabajador(datosEnviar)

    console.log('Usuario registrado exitosamente:', response)

    if (response.success) {
      // Verificar si se envió invitación en lugar de crear asociación directa
      if (response.invitacionEnviada) {
        // Mostrar mensaje de invitación enviada
        Swal.fire({
          icon: 'success',
          title: 'Invitación enviada',
          html: `
            <p>El trabajador <strong>${trabajador.nombre} ${trabajador.apellidos}</strong> ya está registrado en el sistema.</p>
            <p>Se ha enviado una invitación a su correo electrónico <strong>${trabajador.email}</strong> para que pueda aceptar unirse a la empresa.</p>
            <p class="text-sm text-gray-600 mt-2">El trabajador recibirá un correo con un enlace para aceptar o rechazar la invitación.</p>
          `,
          confirmButtonText: 'Entendido'
        })
      }
      
      emit('success', { ...trabajador })
      closeModal()
    } else {
      errorGeneral.value = response.message || 'Error al registrar el usuario. Por favor, intente nuevamente.'
    }

  } catch (error) {
    console.error('Error registrando usuario:', error)
    
    // Manejo específico de errores del servidor
    if (error.response) {
      const serverError = error.response.data
      console.error('📋 Detalles del error del servidor:', serverError)
      
      if (serverError.message) {
        errorGeneral.value = serverError.message
      } else if (error.response.status === 400) {
        errorGeneral.value = 'Los datos enviados no son válidos. Verifique que el RUT y email no estén ya registrados.'
      } else if (error.response.status === 401) {
        errorGeneral.value = 'Error de autenticación. Por favor, inicie sesión nuevamente.'
      } else {
        errorGeneral.value = `Error del servidor (${error.response.status}). Por favor, intente nuevamente.`
      }
    } else if (error.request) {
      errorGeneral.value = 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
    } else {
      errorGeneral.value = 'Error inesperado. Por favor, intente nuevamente.'
    }
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset form when modal opens
    resetForm()
    // Prevenir scroll del body de manera más agresiva
    const body = document.body
    const html = document.documentElement
    
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = '0'
    body.style.left = '0'
    body.style.right = '0'
    body.style.bottom = '0'
    body.classList.add('modal-open')
    html.style.overflow = 'hidden'
  } else {
    // Restaurar scroll del body
    const body = document.body
    const html = document.documentElement
    
    body.style.overflow = ''
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.bottom = ''
    body.classList.remove('modal-open')
    html.style.overflow = ''
  }
})
</script>

<style scoped>
/* Asegurar que el modal esté por encima de todo */
.modal-overlay {
  backdrop-filter: blur(2px);
}

/* Ocultar barra de scroll pero mantener funcionalidad */
.modal-content {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.modal-content::-webkit-scrollbar {
  display: none; /* WebKit */
}

/* Animaciones de entrada y salida */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Prevenir scroll del body cuando el modal está abierto */
body.modal-open {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* Animaciones de transición entre pasos - Deslizamiento a la derecha */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-out;
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Animaciones de transición entre pasos - Deslizamiento a la izquierda */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}

.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
