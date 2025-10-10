<template>
  <footer class="bg-gray-800 text-gray-300 py-6 mt-auto">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <!-- Información del sistema -->
        <div class="text-center md:text-left">
          <h3 class="text-white font-semibold text-lg mb-1">Telemarcación</h3>
          <p class="text-sm text-gray-400">Servicio de Control de Asistencia</p>
        </div>

        <!-- Versión -->
        <div class="text-center">
          <p class="text-sm">
            <span class="text-gray-400">Versión</span>
            <span class="ml-2 text-white font-medium">{{ version }}</span>
          </p>
        </div>

        <!-- Créditos -->
        <div class="text-center md:text-right">
          <p class="text-sm text-gray-400">Desarrollado por</p>
          <p class="text-white font-semibold">Telemedios</p>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-4 pt-4 border-t border-gray-700 text-center">
        <p class="text-xs text-gray-500">
          © {{ currentYear }} Telemedios. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

// Versión del sistema (puedes cambiarla según tu versionado)
const version = '1.0.0'

// Año actual
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
footer {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}
</style>
