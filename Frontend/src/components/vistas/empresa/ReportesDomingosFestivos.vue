
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
            <div class="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha feriado</label>
              <input v-model="nuevoFeriadoFecha" type="date" class="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre (opcional)</label>
              <input v-model="nuevoFeriadoNombre" type="text" placeholder="Ej: Fiestas Patrias" class="w-full px-3 py-2 border rounded" />
            </div>
            <div class="flex items-center">
              <label class="inline-flex items-center">
                <input type="checkbox" v-model="nuevoFeriadoIrrenunciable" class="form-checkbox h-4 w-4 text-cyan-600" />
                <span class="ml-2 text-sm text-gray-700">Irrenunciable</span>
              </label>
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
                  <div v-if="f.irrenunciable" class="text-xs text-emerald-600 font-medium">Irrenunciable</div>
                </div>
                <button @click="removeFeriado(idx)" class="ml-2 text-red-600 hover:text-red-800">Eliminar</button>
              </div>
            </div>
            </div>
          </div>

          <!-- Nuevo calendario embebido (creado desde 0) -->
          <div class="mb-4 flex items-center justify-between">
            <h4 class="font-semibold">Calendario Mensual</h4>
            <div class="flex items-center gap-2">
              <select v-model="mesSeleccionado" class="border rounded px-2 py-1">
                <option v-for="(m, idx) in meses" :key="idx" :value="idx">{{ m }}</option>
              </select>
              <select v-model="anioSeleccionado" class="border rounded px-2 py-1">
                <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-2">
            <div v-for="d in diasSemana" :key="d" class="text-center font-bold text-gray-600">{{ d }}</div>

            <!-- espacios vacíos al inicio del mes -->
            <div v-for="n in primerDiaMes" :key="'empty-' + n"></div>

            <!-- días del mes -->
      <div v-for="dia in diasMes" :key="dia.fecha" class="h-16 w-full rounded-lg flex flex-col items-center justify-center relative bg-gray-100 px-3 py-2"
        :class="dayClasses(dia)">
              <span class="font-semibold">{{ dia.dia }}</span>
              <div v-if="dia.estado === 'feriado'" class="text-xs mt-1 text-teal-700 text-center">
                {{ dia.nombreFeriado ? dia.nombreFeriado : 'Feriado' }}
              </div>
              <div v-else-if="dia.estado === 'finsemana'" class="text-xs mt-1 text-transparent">&nbsp;</div>
              <div v-else class="text-xs mt-1 text-transparent">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import feriadosService from '@/services/feriadosService.js';
import { useRouter } from 'vue-router';

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
const nuevoFeriadoIrrenunciable = ref(false);

// Mostrar/ocultar panel de feriados
const showFeriadoPanel = ref(false);

// Cargar feriados desde API
async function loadFeriados() {
  try {
    const data = await feriadosService.list();
    // data = [{ id, fecha: 'YYYY-MM-DD', nombre }, ...]
  feriados.value = (data || []).map(f => ({ id: f.id, fecha: f.fecha, nombre: f.nombre, irrenunciable: !!f.irrenunciable }));
  } catch (e) {
    console.error('Error loading feriados from API', e);
    feriados.value = [];
  }
}

onMounted(() => {
  loadFeriados();
});

// Auth helpers for the tabs fragment
const { esEst, hasRole } = useAuth();
const isAdmin = computed(() => hasRole('admin'));

// Calendario embebido (variables y helpers)
const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const anioActual = new Date().getFullYear();
const anios = [anioActual-1, anioActual, anioActual+1];
const mesSeleccionado = ref(new Date().getMonth());
const anioSeleccionado = ref(anioActual);

const primerDiaMes = computed(() => {
  const fecha = new Date(anioSeleccionado.value, mesSeleccionado.value, 1);
  let diaSemana = fecha.getDay();
  // ajustar para que lunes sea 0
  diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;
  return diaSemana;
});

const diasMes = computed(() => {
  const totalDias = new Date(anioSeleccionado.value, mesSeleccionado.value + 1, 0).getDate();
  const arr = [];
  // Crear un map de feriados por fecha para soportar múltiples feriados el mismo día
  const feriadosMap = new Map();
  (feriados.value || []).forEach(f => {
    const k = (f.fecha || '').split('T')[0];
    if (!feriadosMap.has(k)) feriadosMap.set(k, []);
    feriadosMap.get(k).push(f);
  });
  for (let d = 1; d <= totalDias; d++) {
    const fechaObj = new Date(anioSeleccionado.value, mesSeleccionado.value, d);
    const fechaStr = fechaObj.toISOString().split('T')[0];
    const isWeekend = fechaObj.getDay() === 0 || fechaObj.getDay() === 6; // domingo=0, sabado=6
    const ferArr = feriadosMap.get(fechaStr) || [];
    const esFeriado = ferArr.length > 0;
    const anyIrr = ferArr.some(f => !!f.irrenunciable);
    const nombreComb = ferArr.map(f => f.nombre).filter(Boolean).join(' / ');
    const estado = esFeriado ? 'feriado' : (isWeekend ? 'finsemana' : 'normal');
    arr.push({ dia: d, fecha: fechaStr, estado, nombreFeriado: esFeriado ? (nombreComb || 'Feriado') : '', irrenunciable: anyIrr });
  }
  return arr;
});

function dayClasses(dia) {
  // Prioridad visual:
  // - Feriado irrenunciable -> color de alerta (rosa claro)
  // - Feriado normal -> celeste (sky)
  // - Fin de semana -> sutil gris
  // - Normal -> gris claro
  return {
    'bg-rose-200 text-rose-800 ring-2 ring-rose-300': dia.estado === 'feriado' && dia.irrenunciable,
    'bg-sky-200 text-sky-800 ring-2 ring-sky-300': dia.estado === 'feriado' && !dia.irrenunciable,
    'bg-gray-50 text-gray-400': dia.estado === 'finsemana',
    'bg-gray-100 text-gray-800': dia.estado === 'normal'
  };
}

// toggleFeriado removed — feriados solo se gestionan vía panel

async function addFeriado() {
  if (!nuevoFeriadoFecha.value) {
    alert('Selecciona una fecha para el feriado');
    return;
  }
  const fecha = nuevoFeriadoFecha.value; // YYYY-MM-DD
  // Allow multiple feriados on same date (DB may store several types). Only block exact duplicate name+date.
  if (feriados.value.some(f => f.fecha === fecha && (f.nombre || '') === (nuevoFeriadoNombre.value || ''))) {
    alert('Ese feriado ya fue agregado (mismo nombre y fecha)');
    return;
  }
  try {
  const created = await feriadosService.create({ fecha, nombre: nuevoFeriadoNombre.value || '', irrenunciable: nuevoFeriadoIrrenunciable.value ? 1 : 0 });
  if (created) feriados.value.push({ id: created.id, fecha: created.fecha, nombre: created.nombre, irrenunciable: created.irrenunciable });
  nuevoFeriadoFecha.value = '';
  nuevoFeriadoNombre.value = '';
  nuevoFeriadoIrrenunciable.value = false;
  } catch (e) {
    console.error('Error creando feriado via API', e);
    alert('Error creando el feriado');
  }
}

async function removeFeriado(idx) {
  const f = feriados.value[idx];
  if (!f) return;
  try {
    if (f.id) await feriadosService.removeById(f.id);
    else await feriadosService.removeByFecha(f.fecha);
    feriados.value.splice(idx, 1);
  } catch (e) {
    console.error('Error borrando feriado via API', e);
    alert('Error borrando el feriado');
  }
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
