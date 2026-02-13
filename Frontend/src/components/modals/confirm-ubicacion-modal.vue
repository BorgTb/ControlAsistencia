<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black opacity-50" @click="$emit('cancel')"></div>

    <div class="bg-white rounded-lg shadow-lg z-10 w-11/12 max-w-lg p-6">
      <h3 class="text-lg font-semibold mb-4">Confirmar ubicación de prestación</h3>

      <p class="text-sm mb-4">¿LA PRESTACIÓN DEL SERVICIO SERÁ EN LA MISMA UBICACIÓN DE MARCACIÓN?</p>

      <div class="mb-4">
        <label class="inline-flex items-center mr-4">
          <input type="radio" class="form-radio" value="si" v-model="respuesta" />
          <span class="ml-2">Sí</span>
        </label>
        <label class="inline-flex items-center">
          <input type="radio" class="form-radio" value="no" v-model="respuesta" />
          <span class="ml-2">No</span>
        </label>
      </div>

      <div v-if="respuesta === 'no'" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Domicilio de prestación efectiva</label>
        <textarea v-model="domicilio" rows="3" class="w-full border rounded p-2 text-sm" placeholder="Dirección donde se prestará el servicio"></textarea>
        <p v-if="showError" class="text-xs text-red-600 mt-1">Por favor ingresa el domicilio si seleccionaste "No".</p>
      </div>

      <div class="flex justify-end space-x-2">
        <button @click="$emit('cancel')" class="px-3 py-2 rounded bg-gray-100 text-sm">Cancelar</button>
        <button @click="confirm" class="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const respuesta = ref('si')
const domicilio = ref('')
const showError = ref(false)

const emit = defineEmits(['confirm','cancel'])

const confirm = () => {
  showError.value = false
  if (respuesta.value === 'no' && !domicilio.value.trim()) {
    showError.value = true
    return
  }

  // Emitir objeto con la decisión y el domicilio (si aplica)
  const payload = {
    sameLocation: respuesta.value === 'si',
    domicilio: respuesta.value === 'no' ? domicilio.value.trim() : null
  }

  // Resetear estado local por si se reusa el modal
  respuesta.value = 'si'
  domicilio.value = ''
  showError.value = false

  emit('confirm', payload)
}
</script>

<style scoped>
.form-radio { width: 1rem; height: 1rem }
</style>
