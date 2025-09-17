<template>
  <Header v-if="showHeader" />
  <HeaderEmpresa v-else v-if="route.path !== '/'"/>
  <RouterView />
</template>

<script setup>
import Header from './components/components/header.vue'
import HeaderEmpresa from './components/components/headerEmpresa.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const hiddenRoutes = ['/','/administracion','/empresa/turnos','/empresa/dashboard','/empresa/trabajadores','/empresa/turnos','/empresa/marcaciones','/empresa/reportes','/empresa/configuracion','/empresa/trabajadores/asociar']
const showHeader = computed(() => !hiddenRoutes.includes(route.path))
</script>


