<template>
    <header>
        <Header v-if="showHeader" />
    </header>
    
    <div id="app">
        <RouterView />
    </div>

    <!-- Modal de Sesión Expirada -->
    <ModalSesionExpirada
      :is-visible="sessionManager.modalSesionVisible.value"
      :motivo="sessionManager.motivoExpiracion.value"
      :detalles="sessionManager.detallesExpiracion.value"
      :auto-redirect="true"
      :tiempo-auto-redirect="10"
      @close="sessionManager.cerrarModal"
      @redirect="sessionManager.handleRedirect"
    />
</template>


<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted, onUnmounted } from 'vue'
import Header from './components/component/header.vue'
import ModalSesionExpirada from './components/common/ModalSesionExpirada.vue'
import { useSessionManager } from './components/composables/useSessionManager.js'

const route = useRoute()
const sessionManager = useSessionManager()

const hiddenRoutes = ['/','/seleccionar-empresa']
const showHeader = computed(() => !hiddenRoutes.includes(route.path))

// Escuchar eventos de sesión expirada
const handleSessionExpired = (event) => {
  const { motivo, detalles } = event.detail
  sessionManager.cerrarSesionPorExpiracion(motivo, detalles)
}

onMounted(() => {
  window.addEventListener('session-expired', handleSessionExpired)
})

onUnmounted(() => {
  window.removeEventListener('session-expired', handleSessionExpired)
})
</script>


<style scoped>

</style>
