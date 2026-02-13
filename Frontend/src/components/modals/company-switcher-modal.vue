<template>
  <!-- Modal Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <!-- Modal Content -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div
          v-show="isOpen"
          @click.stop
          class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">Cambiar de Empresa</h2>
                  <p class="text-blue-100 text-sm mt-1">Selecciona una empresa para cambiar</p>
                </div>
              </div>
              <button
                title="closemodal"
                @click.stop="closeModal"
                :disabled="isLoading"
                class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
            <!-- Current Company Info -->
            <div v-if="currentCompanyName" class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-blue-900">Empresa actual:</p>
                  <p class="text-blue-700 font-semibold">{{ currentCompanyName }}</p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-shake">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-red-700 text-sm font-medium">{{ errorMessage }}</p>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingCompanies" class="flex items-center justify-center py-12">
              <div class="text-center">
                <svg class="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600 font-medium">Cargando empresas...</p>
              </div>
            </div>

            <!-- No Companies -->
            <div v-else-if="companies.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p class="text-gray-600 font-medium">No se encontraron empresas disponibles</p>
            </div>

            <!-- Companies Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                v-for="company in companies"
                :key="company.id"
                @click="switchCompany(company)"
                :disabled="isLoading || company.es_actual"
                class="group relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-left"
                :class="company.es_actual ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
              >
                <!-- Current Badge -->
                <div v-if="company.es_actual" class="absolute top-3 right-3">
                  <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Actual
                  </span>
                </div>

                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors duration-200 truncate">
                      {{ company.nombre }}
                    </h3>
                    <p class="text-sm text-gray-500 font-medium">
                      RUT: {{ formatRut(company.rut) }}
                    </p>
                  </div>
                  <svg v-if="!company.es_actual" class="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <!-- Switching State -->
            <div v-if="isLoading" class="mt-6 flex items-center justify-center gap-3 text-blue-600">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="font-medium">Cambiando de empresa...</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth-store.js'
import AuthService from '@/services/auth-services.js'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'switched'])

// Store
const authStore = useAuthStore()

// Reactive data
const errorMessage = ref('')
const isLoading = ref(false)
const isLoadingCompanies = ref(false)
const companies = ref([])

// Computed
const currentCompanyName = computed(() => authStore.user?.empresa_nombre || '')

// Format RUT
const formatRut = (rut) => {
  if (!rut) return ''
  const cleaned = rut.replace(/[^0-9kK]/g, '')
  if (cleaned.length <= 1) return cleaned
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}

// Load companies when modal opens
const loadCompanies = async () => {
  errorMessage.value = ''
  isLoadingCompanies.value = true

  try {
    console.log('📋 Cargando empresas del usuario...')
    const result = await AuthService.getUserCompanies()

    if (result.success && result.data.empresas) {
      companies.value = result.data.empresas
      console.log('✅ Empresas cargadas:', companies.value.length)
    } else {
      errorMessage.value = result.error || 'Error al cargar las empresas'
      companies.value = []
    }
  } catch (error) {
    console.error('❌ Error al cargar empresas:', error)
    errorMessage.value = 'Error al cargar las empresas. Por favor, intenta nuevamente.'
    companies.value = []
  } finally {
    isLoadingCompanies.value = false
  }
}

// Switch company
const switchCompany = async (company) => {
  if (company.es_actual) {
    console.log('ℹ️ Ya estás en esta empresa')
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    console.log('🔄 Cambiando a empresa:', company.nombre)

    const result = await AuthService.switchCompany(company.id)

    if (result.success) {
      console.log('✅ Empresa cambiada exitosamente')
      
      // Actualizar usuario en el store
      if (result.data.user) {
        authStore.setUser(result.data.user)
      }

      // CONSIDERACIÓN 3: Refrescar la página completa para evitar inconsistencias
      // Los datos cacheados de la empresa anterior podrían causar problemas
      console.log('🔄 Refrescando página para actualizar contexto...')
      
      emit('switched', result.data.user)
      
      // Esperar un poco antes de refrescar para que se vea el mensaje de éxito
      setTimeout(() => {
        window.location.reload()
      }, 500)
      
    } else {
      errorMessage.value = result.error || 'Error al cambiar de empresa'
      isLoading.value = false
    }
  } catch (error) {
    console.error('❌ Error al cambiar de empresa:', error)
    errorMessage.value = 'Error inesperado. Por favor, intenta nuevamente.'
    isLoading.value = false
  }
}

// Close modal
const closeModal = () => {
  console.log('🚪 closeModal called, isLoading:', isLoading.value)
  if (!isLoading.value) {
    console.log('✅ Emitting close event')
    errorMessage.value = ''
    companies.value = []
    emit('close')
  } else {
    console.log('⚠️ Modal is loading, cannot close')
  }
}

// Watch for modal open/close
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadCompanies()
  } else {
    // Reset state when closing
    errorMessage.value = ''
    companies.value = []
  }
})
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
