<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <header-admin />
    <div class="flex flex-1">
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import headerAdmin from '@/components/components/header-admin.vue';
</script>
