<template>
    <header>
        <Header v-if="showHeader" />
    </header>
    
    <div id="app">
        <RouterView />
    </div>
  
</template>


<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import Header from './components/component/header.vue';


const route = useRoute()
const hiddenRoutes = ['/','/seleccionar-empresa']
const showHeader = computed(() => !hiddenRoutes.includes(route.path))
</script>


<style scoped>

</style>
