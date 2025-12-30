<template>
  <div v-if="hasMultipleRoles" class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
    >
      <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
      <span class="text-sm font-medium text-gray-700">{{ currentRoleLabel }}</span>
      <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div class="py-1">
        <div class="px-4 py-2 border-b border-gray-200">
          <p class="text-xs font-semibold text-gray-500 uppercase">Cambiar vista</p>
        </div>
        
        <button
          v-for="role in availableRoles"
          :key="role.slug"
          @click="switchRole(role.slug)"
          :class="[
            'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3',
            currentRole === role.slug ? 'bg-indigo-50' : ''
          ]"
        >
          <div
            :class="[
              'h-10 w-10 rounded-full flex items-center justify-center',
              role.color
            ]"
          >
            <component :is="role.icon" class="h-5 w-5 text-white" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ role.label }}</p>
            <p class="text-xs text-gray-500">{{ role.description }}</p>
          </div>
          <svg
            v-if="currentRole === role.slug"
            class="h-5 w-5 text-indigo-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const showDropdown = ref(false)

// Definir roles disponibles con sus configuraciones
const roleConfig = {
  admin: {
    slug: 'admin',
    label: 'Administrador',
    description: 'Panel de administración',
    route: '/admin/empresas',
    color: 'bg-red-500',
    icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
    ])
  },
  empleador: {
    slug: 'empleador',
    label: 'Empleador',
    description: 'Gestión de empresa',
    route: '/empresa/dashboard',
    color: 'bg-blue-500',
    icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
    ])
  },
  trabajador: {
    slug: 'trabajador',
    label: 'Trabajador',
    description: 'Mi área personal',
    route: '/usuario/dashboard',
    color: 'bg-green-500',
    icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
    ])
  },
  fiscalizador: {
    slug: 'fiscalizador',
    label: 'Fiscalizador',
    description: 'Panel de fiscalización',
    route: '/fiscalizador/dashboard',
    color: 'bg-purple-500',
    icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' })
    ])
  }
}

// Verificar si tiene múltiples roles
const hasMultipleRoles = computed(() => authStore.hasMultipleRoles)

// Obtener roles disponibles del usuario
const availableRoles = computed(() => {
  return authStore.userRoles
    .map(roleSlug => roleConfig[roleSlug])
    .filter(role => role !== undefined)
})

// Detectar el rol actual basado en la ruta
const currentRole = computed(() => {
  const path = route.path
  if (path.startsWith('/admin')) return 'admin'
  if (path.startsWith('/empresa')) return 'empleador'
  if (path.startsWith('/usuario')) return 'trabajador'
  if (path.startsWith('/fiscalizador')) return 'fiscalizador'
  return authStore.userRoles[0] || 'trabajador'
})

// Label del rol actual
const currentRoleLabel = computed(() => {
  const role = roleConfig[currentRole.value]
  return role ? role.label : 'Rol'
})

// Toggle dropdown
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Cambiar de rol
const switchRole = (roleSlug) => {
  const role = roleConfig[roleSlug]
  if (role && authStore.hasRole(roleSlug)) {
    router.push(role.route)
    showDropdown.value = false
  }
}

// Cerrar dropdown al hacer click fuera
const closeDropdown = (event) => {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Agregar listener para cerrar dropdown
if (typeof window !== 'undefined') {
  window.addEventListener('click', closeDropdown)
}
</script>
