<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
    <div class="max-w-lg w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <!-- Icono 404 -->
        <div class="mb-6">
          <svg class="mx-auto h-24 w-24 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        <!-- Título -->
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Página no encontrada</h2>
        
        <!-- Descripción -->
        <p class="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            @click="goBack"
            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200"
          >
            ← Volver atrás
          </button>
          <button 
            @click="goHome"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg"
          >
            🏠 Ir al inicio
          </button>
        </div>

        <!-- Información adicional -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            Si crees que esto es un error, por favor contacta al administrador.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store.js'

const router = useRouter()
const authStore = useAuthStore()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  // Redirigir según el rol del usuario
  if (authStore.isAuthenticated) {
    const roles = authStore.userRoles
    
    if (roles.includes('admin')) {
      router.push('/admin/empresas')
    } else if (roles.includes('empleador')) {
      router.push('/empresa/dashboard')
    } else if (roles.includes('trabajador')) {
      router.push('/usuario/dashboard')
    } else {
      router.push('/')
    }
  } else {
    router.push('/')
  }
}
</script>
