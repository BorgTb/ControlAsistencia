<template>
  <div v-if="visible" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('cancelar')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div 
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        @click.stop
      >
        <div class="sm:flex sm:items-start">
          <div :class="`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${colorIcono}-100 sm:mx-0 sm:h-10 sm:w-10`">
            <component :is="icono" :class="`h-6 w-6 text-${colorIcono}-600`" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ titulo }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ mensaje }}
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="$emit('confirmar')"
            :class="`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-${colorBoton}-600 text-base font-medium text-white hover:bg-${colorBoton}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${colorBoton}-500 sm:ml-3 sm:w-auto sm:text-sm`"
          >
            {{ textoConfirmar }}
          </button>
          <button
            type="button"
            @click="$emit('cancelar')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  titulo: {
    type: String,
    default: 'Confirmar acción'
  },
  mensaje: {
    type: String,
    default: '¿Estás seguro de que deseas realizar esta acción?'
  },
  tipo: {
    type: String,
    default: 'warning',
    validator: (value) => ['success', 'warning', 'error', 'info'].includes(value)
  },
  textoConfirmar: {
    type: String,
    default: 'Confirmar'
  }
});

// Emits
const emit = defineEmits(['confirmar', 'cancelar']);

// Computed
const icono = computed(() => {
  const iconos = {
    success: 'CheckIcon',
    warning: 'ExclamationIcon',
    error: 'XIcon',
    info: 'InformationCircleIcon'
  };
  
  return iconos[props.tipo] || 'ExclamationIcon';
});

const colorIcono = computed(() => {
  const colores = {
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue'
  };
  
  return colores[props.tipo] || 'yellow';
});

const colorBoton = computed(() => {
  const colores = {
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue'
  };
  
  return colores[props.tipo] || 'yellow';
});
</script>