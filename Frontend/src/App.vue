<template>
  <Header v-if="showHeader" />
  <RouterView />
</template>

<script setup>
import Header from './components/components/header.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const hiddenRoutes = ['/','/administracion']
const showHeader = computed(() => !hiddenRoutes.includes(route.path))
</script>
