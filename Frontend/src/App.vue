<template>
  <Header v-if="showHeader" />
  <HeaderAdmin v-else v-if="route.path !== '/'"/>
  <RouterView />
</template>

<script setup>
import Header from './components/components/header.vue'
import HeaderAdmin from './components/components/headerAdmin.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const hiddenRoutes = ['/','/administracion','/admin/turnos','/admin/dashboard','/admin/trabajadores','/admin/turnos','/admin/marcaciones','/admin/reportes','/admin/configuracion']
const showHeader = computed(() => !hiddenRoutes.includes(route.path))
</script>
