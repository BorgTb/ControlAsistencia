<template>
  <RouterView />
  <Footer v-if="!hideFooter" />
</template>

<script setup>
import Footer from '@/components/components/footer.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth-store'

const route = useRoute()
const authStore = useAuthStore()

// Oculta el footer en la ruta "/"
const hideFooter = computed(() => route.path === '/')

// Asegurar que el store esté inicializado (Pinia con persistencia puede tardar)
onMounted(() => {
  if (authStore.user) {
    console.log('✅ Usuario autenticado:', authStore.user.nombre)
  } else {
    console.log('❌ No hay usuario autenticado')
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>


  
