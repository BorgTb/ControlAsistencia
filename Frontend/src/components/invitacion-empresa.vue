<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Cargando información de la invitación...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Error al cargar la invitación</h2>
        <p class="text-gray-600">{{ error }}</p>
        <button
          @click="$router.push('/')"
          class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir al inicio de sesión
        </button>
      </div>

      <!-- Success State (after accept/reject) -->
      <div v-else-if="processCompleted" class="text-center py-12">
        <div :class="actionSuccess ? 'text-green-600' : 'text-red-600'" class="mb-4">
          <svg v-if="actionSuccess" class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          {{ actionSuccess ? '¡Invitación aceptada!' : 'Invitación rechazada' }}
        </h2>
        <p class="text-gray-600 mb-6">{{ resultMessage }}</p>
        <button
          v-if="!actionSuccess"
          @click="$router.push('/dashboard')"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir al panel de control
        </button>
        <div v-else class="text-sm text-gray-500 mt-4">
          Serás redirigido automáticamente en unos segundos...
        </div>
      </div>

      <!-- Invitation Details -->
      <div v-else-if="solicitud">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Invitación a Empresa</h1>
          <p class="text-gray-600">Has sido invitado a unirte a una empresa</p>
        </div>

        <!-- Invitation Information -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <p class="text-lg font-semibold text-gray-900">{{ solicitud.empresa_solicitante.nombre_empresa }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
              <p class="text-gray-900">{{ solicitud.usuario.nombre }} {{ solicitud.usuario.apellidos }}</p>
              <p class="text-sm text-gray-600">RUT: {{ solicitud.usuario.rut }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <p class="text-gray-900">{{ solicitud.descripcion }}</p>
            </div>

            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de emisión</label>
                <p class="text-gray-900">{{ formatDate(solicitud.fecha_emision) }}</p>
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Válida hasta</label>
                <p class="text-gray-900">{{ formatDate(solicitud.fecha_expiracion) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Not logged in notice -->
        <div v-if="!isAuthenticated" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                Debes iniciar sesión para aceptar o rechazar esta invitación.
              </p>
            </div>
          </div>
        </div>

        <!-- Reject reason (only when authenticated) -->
        <div v-if="isAuthenticated && showRejectReason" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Motivo del rechazo (opcional)
          </label>
          <textarea
            v-model="motivoRechazo"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Indica por qué rechazas esta invitación..."
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            v-if="!isAuthenticated"
            @click="$router.push({ path: '/', query: { redirect: $route.fullPath } })"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Iniciar sesión para continuar
          </button>

          <template v-else>
            <button
              v-if="!showRejectReason"
              @click="showRejectReason = true"
              :disabled="processingAction"
              class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rechazar
            </button>
            <button
              v-else
              @click="rechazarSolicitud"
              :disabled="processingAction"
              class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ processingAction ? 'Procesando...' : 'Confirmar rechazo' }}
            </button>

            <button
              v-if="showRejectReason"
              @click="showRejectReason = false; motivoRechazo = ''"
              :disabled="processingAction"
              class="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              v-else
              @click="aceptarSolicitud"
              :disabled="processingAction"
              class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ processingAction ? 'Procesando...' : 'Aceptar invitación' }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth-store';
import SolicitudesService from '@/services/solicitudes-service';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);
const solicitud = ref(null);
const processingAction = ref(false);
const processCompleted = ref(false);
const actionSuccess = ref(false);
const resultMessage = ref('');
const showRejectReason = ref(false);
const motivoRechazo = ref('');

const isAuthenticated = computed(() => authStore.isAuthenticated);

onMounted(async () => {
  // Pequeño delay para asegurar que Pinia haya restaurado el estado desde localStorage
  await new Promise(resolve => setTimeout(resolve, 100));
  await cargarSolicitud();
});

const cargarSolicitud = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = route.params.token;
    
    if (!token) {
      error.value = 'Token de invitación no válido';
      return;
    }

    const response = await SolicitudesService.obtenerInvitacionPorToken(token);
    solicitud.value = response;

  } catch (err) {
    console.error('Error al cargar solicitud:', err);
    error.value = err.response?.data?.error || 'No se pudo cargar la información de la invitación';
  } finally {
    loading.value = false;
  }
};

const aceptarSolicitud = async () => {
  try {
    processingAction.value = true;
    
    const token = route.params.token;
    const response = await SolicitudesService.aceptarInvitacionEmpresa(token);

    actionSuccess.value = true;
    resultMessage.value = 'Invitación aceptada exitosamente. Serás redirigido al inicio de sesión para actualizar tu sesión.';
    processCompleted.value = true;

    // Cerrar sesión actual y redirigir al login
    await authStore.logout();
    
    // Redirigir al login después de 3 segundos con un mensaje
    setTimeout(() => {
      router.push({ 
        path: '/', 
        query: { 
          message: 'Por favor inicia sesión nuevamente con tu empresa asignada' 
        } 
      });
    }, 3000);

  } catch (err) {
    console.error('Error al aceptar solicitud:', err);
    error.value = err.response?.data?.error || 'No se pudo aceptar la invitación';
  } finally {
    processingAction.value = false;
  }
};

const rechazarSolicitud = async () => {
  try {
    processingAction.value = true;
    
    const token = route.params.token;
    const response = await SolicitudesService.rechazarInvitacionEmpresa(token, motivoRechazo.value);

    actionSuccess.value = false;
    resultMessage.value = response.mensaje || 'Has rechazado la invitación.';
    processCompleted.value = true;

  } catch (err) {
    console.error('Error al rechazar solicitud:', err);
    error.value = err.response?.data?.error || 'No se pudo rechazar la invitación';
  } finally {
    processingAction.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
