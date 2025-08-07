<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isVisible" 
        class="fixed inset-0 z-50 overflow-y-auto"
        @keydown.esc="cerrarModal"
      >
        <!-- Backdrop con blur -->
        <div 
          class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
          @click="cerrarModal"
        ></div>
        
        <!-- Modal container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div 
              v-if="isVisible"
              class="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black ring-opacity-5"
              @click.stop
              tabindex="-1"
              ref="modalRef"
            >
              <!-- Header -->
              <div class="flex items-center justify-center mb-6">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <div class="text-center">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Sesión Expirada</h3>
                <p class="text-sm text-gray-600 mb-6">
                  Su sesión ha expirado por {{ getMotivoTexto(motivo) }}. Por favor, inicie sesión nuevamente para continuar.
                </p>

                <!-- Timer si está configurado -->
                <div v-if="mostrarTimer && tiempoRestante > 0" class="mb-6">
                  <p class="text-xs text-gray-500 mb-2">
                    Redirigiendo automáticamente en {{ tiempoRestante }} segundos...
                  </p>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                      :style="{ width: `${(tiempoRestante / tiempoTotal) * 100}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Detalles adicionales si están disponibles -->
                <div v-if="detalles && detalles.length > 0" class="bg-gray-50 rounded-lg p-4 mb-6">
                  <div class="text-left">
                    <h4 class="text-xs font-medium text-gray-700 mb-2 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Detalles técnicos:
                    </h4>
                    <ul class="text-xs text-gray-600 space-y-1">
                      <li v-for="detalle in detalles" :key="detalle" class="flex items-start">
                        <span class="text-gray-400 mr-1">•</span>
                        <span>{{ detalle }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-3">
                  <button
                    @click="recargarPagina"
                    class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    :disabled="isLoading"
                  >
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Recargar Página
                  </button>
                  <button
                    @click="irAlLogin"
                    class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    :disabled="isLoading"
                  >
                    <svg v-if="isLoading" class="animate-spin w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    {{ isLoading ? 'Redirigiendo...' : 'Ir al Login' }}
                  </button>
                </div>

                <!-- Footer info -->
                <div class="mt-6 pt-4 border-t border-gray-100">
                  <p class="text-xs text-gray-400 flex items-center justify-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Si este problema persiste, contacte al administrador del sistema
                  </p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  motivo: {
    type: String,
    default: 'inactividad'
  },
  detalles: {
    type: Array,
    default: () => []
  },
  autoRedirect: {
    type: Boolean,
    default: true
  },
  tiempoAutoRedirect: {
    type: Number,
    default: 10 // segundos
  }
})

const emit = defineEmits(['close', 'redirect'])

const isLoading = ref(false)
const tiempoRestante = ref(props.tiempoAutoRedirect)
const tiempoTotal = ref(props.tiempoAutoRedirect)
const mostrarTimer = ref(props.autoRedirect)
const modalRef = ref(null)
let intervalTimer = null

const getMotivoTexto = (motivo) => {
  const motivos = {
    'inactividad': 'inactividad prolongada',
    'token_expirado': 'expiración del token de seguridad',
    'token_invalido': 'token de seguridad inválido',
    'error_servidor': 'error del servidor',
    'acceso_no_autorizado': 'acceso no autorizado'
  }
  return motivos[motivo] || motivo
}

const iniciarTimer = () => {
  if (!props.autoRedirect) return

  tiempoRestante.value = props.tiempoAutoRedirect
  tiempoTotal.value = props.tiempoAutoRedirect

  intervalTimer = setInterval(() => {
    tiempoRestante.value--
    
    if (tiempoRestante.value <= 0) {
      clearInterval(intervalTimer)
      irAlLogin()
    }
  }, 1000)
}

const detenerTimer = () => {
  if (intervalTimer) {
    clearInterval(intervalTimer)
    intervalTimer = null
  }
}

const cerrarModal = () => {
  detenerTimer()
  emit('close')
}

const recargarPagina = () => {
  isLoading.value = true
  detenerTimer()
  window.location.reload()
}

const irAlLogin = async () => {
  isLoading.value = true
  detenerTimer()
  
  emit('redirect')
  
  try {
    await router.push({ name: 'Login' })
  } catch (error) {
    console.warn('Error al navegar al login:', error)
    window.location.href = '/'
  }
}

// Watch para reiniciar timer cuando el modal se hace visible
watch(() => props.isVisible, async (newValue) => {
  if (newValue) {
    iniciarTimer()
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'
    // Enfocar el modal para accesibilidad
    await nextTick()
    modalRef.value?.focus()
  } else {
    detenerTimer()
    // Restaurar scroll del body
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  if (props.isVisible && props.autoRedirect) {
    iniciarTimer()
  }
})

onUnmounted(() => {
  detenerTimer()
  // Asegurar que se restaure el scroll
  document.body.style.overflow = ''
})
</script>
