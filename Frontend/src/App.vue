<template>
  <div class="flex flex-col min-h-screen">
    <Header v-if="showHeader" />
    <HeaderEmpresa v-else-if="route.path !== '/'"/> 
    
    <main class="flex-grow">
      <RouterView />
    </main>
    
    <Footer v-if="showFooter" />
  </div>
</template>

<script setup>
import Header from './components/components/header.vue'
import HeaderEmpresa from './components/components/headerEmpresa.vue'
import Footer from './components/components/footer.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const hiddenRoutes = ['/','/empresa/turnos','/empresa/dashboard','/empresa/trabajadores','/empresa/turnos','/empresa/marcaciones','/empresa/reportes','/empresa/configuracion','/empresa/trabajadores/asociar','/administracion']
const showHeader = computed(() => !hiddenRoutes.includes(route.path))

// El footer se muestra en todas las rutas excepto el login
const showFooter = computed(() => route.path !== '/')
</script>

<style>
/* Aseguramos que el layout ocupe toda la altura */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>


  
