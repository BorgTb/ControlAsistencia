
<template>
  <div>
  <!-- Navbar tipo tabs moderno -->
  <div class="w-full bg-gray-50 border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4">
  <ul class="flex space-x-2">
        <li>
          <router-link
            to="/administrarempresa"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/administrarempresa' ? 'bg-white border-b-2 border-cyan-500 text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
            </svg>
            Administrar empresas
          </router-link>
        </li>
        <li>
          <router-link
            to="/RolAdministracion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/RolAdministracion' ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-indigo-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
            </svg>
            Administración
          </router-link>
        </li>
        <li>
          <router-link
            to="/usuarios-permisos"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/usuarios-permisos' ? 'bg-white border-b-2 border-amber-500 text-amber-600 shadow-sm' : 'text-gray-500 hover:text-amber-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m6 5.87a4 4 0 00-3-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            Usuarios y permisos
          </router-link>
        </li>
        <li>
          <router-link
            to="/fiscalizacion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/fiscalizacion' ? 'bg-white border-b-2 border-green-500 text-green-600 shadow-sm' : 'text-gray-500 hover:text-green-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fiscalización
          </router-link>
        </li>
        <li>
          <router-link
            to="/estadisticas"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/estadisticas' ? 'bg-white border-b-2 border-fuchsia-500 text-fuchsia-600 shadow-sm' : 'text-gray-500 hover:text-fuchsia-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19V6m4 13V10m4 9V4M7 19v-4M3 19v-2" />
            </svg>
            Estadísticas
          </router-link>
        </li>
        <li v-if="isAdmin">
          <router-link
            to="/empresa/reportes/domingos-festivos"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/empresa/reportes/domingos-festivos' ? 'bg-white border-b-2 border-cyan-500 text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-cyan-600 hover:bg-white'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
            </svg>
            Domingos/Festivos
          </router-link>
        </li>
      </ul>
    </nav>
  </div>

    <div class="min-h-screen bg-gray-50">
    <main class="mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Reporte: Domingos y Festivos Laborados</h1>
            <p class="text-sm text-gray-600 mt-1">Vista de calendario</p>
          </div>
          <div class="flex items-center gap-3">
            <button v-if="!showFeriadoPanel" @click="showFeriadoPanel = true" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">Añadir Feriado</button>
            <button v-else @click="showFeriadoPanel = false" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">Ocultar</button>
            <button @click="volverReportes" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium">
              ← Volver a Reportes
            </button>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <!-- Panel para agregar feriados manualmente (oculto por defecto, se muestra al presionar Añadir Feriado) -->
          <div v-show="showFeriadoPanel">
            <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha feriado</label>
              <input v-model="nuevoFeriadoFecha" type="date" class="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre (opcional)</label>
              <input v-model="nuevoFeriadoNombre" type="text" placeholder="Ej: Fiestas Patrias" class="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <button @click="addFeriado" class="w-full bg-blue-600 text-white px-4 py-2 rounded">➕ Agregar feriado</button>
            </div>
            </div>

            <div v-if="feriados.length" class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Feriados agregados</h4>
            <div class="flex flex-wrap gap-2">
              <div v-for="(f, idx) in feriados" :key="f.fecha" class="bg-gray-100 border rounded px-3 py-2 flex items-center gap-3">
                <div>
                  <div class="text-sm font-semibold">{{ formatFecha(f.fecha) }}</div>
                  <div class="text-xs text-gray-600">{{ f.nombre || 'Feriado' }}</div>
                </div>
                <button @click="removeFeriado(idx)" class="ml-2 text-red-600 hover:text-red-800">Eliminar</button>
              </div>
            </div>
            </div>
          </div>

          <!-- Renderizar el calendario pasando los feriados como "dias justificados" -->
          <MarcacionesCalendario :usuario="usuario" vista="mensual" :marcaciones="[]" :dias-justificados="feriados" />
        </div>
      </div>
    </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../../../composables/useAuth.js';
import { useRouter } from 'vue-router';
import MarcacionesCalendario from './MarcacionesCalendario.vue';

const router = useRouter();
function volverReportes() {
  router.push({ name: 'EmpresaReportes' });
}

// Pasamos un usuario vacío para evitar que el calendario intente leer turnos.
const usuario = ref({});

// Estado local para feriados añadidos manualmente
const feriados = ref([]);
const nuevoFeriadoFecha = ref('');
const nuevoFeriadoNombre = ref('');

const STORAGE_KEY = 'reportes-feriados';

// Mostrar/ocultar panel de feriados
const showFeriadoPanel = ref(false);

function saveFeriados() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feriados.value));
  } catch (e) {
    console.error('Error saving feriados to localStorage', e);
  }
}

function loadFeriados() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      feriados.value = JSON.parse(raw) || [];
    }
  } catch (e) {
    console.error('Error loading feriados from localStorage', e);
    feriados.value = [];
  }
}

onMounted(() => {
  loadFeriados();
});

// Auth helpers for the tabs fragment
const { esEst, hasRole } = useAuth();
const isAdmin = computed(() => hasRole('admin'));

function addFeriado() {
  if (!nuevoFeriadoFecha.value) {
    alert('Selecciona una fecha para el feriado');
    return;
  }
  const fecha = nuevoFeriadoFecha.value; // YYYY-MM-DD
  // evitar duplicados
  if (feriados.value.some(f => f.fecha === fecha)) {
    alert('Ese feriado ya fue agregado');
    return;
  }
  feriados.value.push({ fecha, nombre: nuevoFeriadoNombre.value || '' });
  // limpiar inputs
  nuevoFeriadoFecha.value = '';
  nuevoFeriadoNombre.value = '';
  saveFeriados();
}

function removeFeriado(idx) {
  feriados.value.splice(idx, 1);
  saveFeriados();
}

function formatFecha(fechaStr) {
  // fechaStr is YYYY-MM-DD, format to DD/MM/YYYY
  if (!fechaStr) return '';
  const parts = fechaStr.split('-');
  if (parts.length !== 3) return fechaStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
</script>

<style scoped>
</style>
