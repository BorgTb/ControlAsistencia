<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <HeaderEmpresa />

    <div class="flex flex-1">
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import HeaderEmpresa from '@/components/components/header-empresa.vue'
</script>
