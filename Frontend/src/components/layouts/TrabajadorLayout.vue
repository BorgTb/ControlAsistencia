<template>
  <div class="min-h-screen bg-gray-100">
    <TrabajadorHeader />
    <main class="p-6 w-full mx-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import TrabajadorHeader from '@/components/components/header.vue'
</script>
