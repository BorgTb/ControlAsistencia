<template>
  <!-- Contenedor de notificaciones -->
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <TransitionGroup
        name="notification"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'transform transition-all duration-300 ease-in-out',
            'bg-white rounded-lg shadow-lg border-l-4 p-4 max-w-sm',
            'flex items-start space-x-3',
            {
              'border-green-500': notification.type === 'success',
              'border-red-500': notification.type === 'error',
              'border-blue-500': notification.type === 'info',
              'border-yellow-500': notification.type === 'warning'
            },
            notification.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          ]"
        >
          <!-- Icono -->
          <div class="flex-shrink-0">
            <!-- Icono de éxito -->
            <svg 
              v-if="notification.type === 'success'"
              class="w-6 h-6 text-green-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            
            <!-- Icono de error -->
            <svg 
              v-else-if="notification.type === 'error'"
              class="w-6 h-6 text-red-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            
            <!-- Icono de información -->
            <svg 
              v-else-if="notification.type === 'info'"
              class="w-6 h-6 text-blue-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            
            <!-- Icono de advertencia -->
            <svg 
              v-else-if="notification.type === 'warning'"
              class="w-6 h-6 text-yellow-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <p 
              :class="[
                'text-sm font-medium',
                {
                  'text-green-800': notification.type === 'success',
                  'text-red-800': notification.type === 'error',
                  'text-blue-800': notification.type === 'info',
                  'text-yellow-800': notification.type === 'warning'
                }
              ]"
            >
              {{ notification.message }}
            </p>
          </div>

          <!-- Botón de cerrar -->
          <button
            @click="removeNotification(notification.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotification } from '../../composables/useNotification.js'

const { notifications, removeNotification } = useNotification()
</script>

<style scoped>
/* Animaciones para las notificaciones */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>