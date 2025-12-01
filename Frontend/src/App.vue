<template>
  <RouterView />
  <Footer v-if="!hideFooter" />
</template>

<script setup>
import Footer from '@/components/components/footer.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Oculta el footer en la ruta "/"
const hideFooter = computed(() => route.path === '/')
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>


  
