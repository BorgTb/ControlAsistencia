<template>
  <HeaderAdmin v-if="isAdminRoute" />
  <RouterView />
</template>

<script setup>
import HeaderAdmin from './components/components/headerAdmin.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const adminRoutes = [
  '/administrarempresa',
  '/administracion',
  '/admin/dashboard',
  '/admin/trabajadores',
  '/admin/turnos',
  '/admin/marcaciones',
  '/admin/reportes',
  '/admin/configuracion'
]
const isAdminRoute = computed(() => adminRoutes.includes(route.path))
</script>


