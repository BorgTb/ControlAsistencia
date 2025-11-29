<template>
  <div class="min-h-screen bg-gray-100">
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 px-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Reporte de Marcaciones</h1>
          <p class="text-gray-600 mt-2">Visualiza la asistencia individual en calendario mensual o anual</p>
        </div>
        <div class="flex space-x-3">
          <button @click="mostrarJustificaciones" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Justificaciones</span>
          </button>
          <button @click="volverReportes" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-md font-medium flex items-center">
            <span>Volver a Reportes</span>
          </button>
          <button @click="exportarReporte" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center">
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <!-- Selector de empresa y listado de trabajadores -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <h2 class="text-lg font-semibold mb-2">Selecciona una empresa y un trabajador</h2>
        <div v-if="empresas.length > 1" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Empresa:</label>
          <select v-model="empresaSeleccionada" @change="cargarTrabajadoresEmpresa" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 transition">
            <option v-for="emp in empresas" :key="emp.empresa_id" :value="emp.emp_rut">{{ emp.emp_nombre }} ({{ emp.emp_rut }})</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador:</label>
          <div class="relative">
            <select v-model="trabajadorSeleccionado" @change="seleccionarTrabajador(trabajadorSeleccionado)"
              class="w-full px-4 py-3 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 font-semibold shadow-sm focus:ring-2 focus:ring-blue-500 transition appearance-none"
              :disabled="trabajadores.length === 0">
              <option disabled value="" class="text-gray-400" selected>
                Seleccione un trabajador
              </option>
              <option v-for="trab in trabajadores" :key="trab.id" :value="trab"
                class="text-blue-900 font-semibold">
                {{ trab.nombre }} {{ trab.apellido }} ({{ trab.rut }}) - {{ trab.rol }}
              </option>
            </select>
            <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- Tarjetas resumen y calendario solo si hay trabajador seleccionado -->
      <div v-if="trabajadorSeleccionado">
        <div class="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 px-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
            <div class="text-2xl font-bold text-blue-600">{{ resumen.totalDiasTrabajados }}</div>
            <div class="text-xs text-blue-700 font-medium mt-1">Días Trabajados</div>
          </div>
          <div class="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
            <div class="text-2xl font-bold text-yellow-600">{{ resumen.ausenciasJustificadas }}</div>
            <div class="text-xs text-yellow-700 font-medium mt-1">Ausencias Justificadas</div>
          </div>
          <div class="bg-red-50 rounded-lg p-4 text-center border border-red-200">
            <div class="text-2xl font-bold text-red-600">{{ resumen.ausenciasInjustificadas }}</div>
            <div class="text-xs text-red-700 font-medium mt-1">Ausencias Injustificadas</div>

            <!-- Toggle para mostrar/ocultar los días ausentes -->
            <div class="mt-2">
              <button
                @click="toggleVerAusencias"
                class="text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
                :aria-expanded="verAusencias.toString()"
                aria-controls="lista-ausencias"
              >
                {{ verAusencias ? 'Ocultar días' : `Mostrar días (${resumen.fechasNoTrabajadas ? resumen.fechasNoTrabajadas.length : 0})` }}
              </button>
            </div>

            <div v-if="verAusencias && resumen.fechasNoTrabajadas && resumen.fechasNoTrabajadas.length" class="mt-2">
              <div class="text-xs text-gray-600 mb-1">Días no trabajados:</div>
              <div class="flex flex-wrap items-center">
                <span
                  v-for="(f, idx) in fechasAusenciasVisibles"
                    :key="f + '-' + idx"
                    :title="formatFechaLong(f)"
                    class="inline-flex items-center bg-red-50 text-red-600 border border-red-100 text-xs rounded-full px-2 py-0.5 mr-2 mb-2"
                >
                  {{ formatFechaSimple(f) }}
                </span>

                <button
                  v-if="resumen.fechasNoTrabajadas.length > MAX_AUSENCIAS_VISIBLE"
                  @click="toggleMostrarTodasAusencias"
                  class="text-xs text-gray-500 hover:text-gray-700 ml-1 focus:outline-none"
                  :aria-expanded="mostrarTodasAusencias.toString()"
                >
                  {{ mostrarTodasAusencias ? 'Mostrar menos' : `Mostrar ${resumen.fechasNoTrabajadas.length - MAX_AUSENCIAS_VISIBLE} más` }}
                </button>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div class="text-2xl font-bold text-gray-600">{{ totalHorasDecimal.toFixed(2) }}</div>
            <div class="text-xs text-gray-700 font-medium mt-1">Total Horas (esta semana)</div>
            <div v-if="excedeHoras" class="text-xs text-red-600 mt-1">
              ¡Se excedieron las horas laborales permitidas esta semana! <strong>Exceso:</strong> {{ excesoFormato }} ({{ excesoDecimal }} h)
            </div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <div class="text-2xl font-bold text-green-600">{{ resumen.porcentajeAsistencia }}%</div>
            <div class="text-xs text-green-700 font-medium mt-1">% Asistencia</div>
          </div>
          <div class="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-200">
            <div class="text-2xl font-bold text-indigo-600">{{ resumen.promedioHoraEntrada }} / {{ resumen.promedioHoraSalida }}</div>
            <div class="text-xs text-indigo-700 font-medium mt-1">Prom. Entrada / Salida</div>
          </div>
        </div>
        <!-- Calendario -->
        <div class="px-4 mb-8">
          <div class="relative">
            <!-- Leyenda posicionada fuera del flujo para no reducir el ancho del calendario -->
            <aside class="absolute -left-72 top-6 hidden md:block">
              <div class="bg-white border rounded p-3 shadow-sm w-56">
                <h4 class="font-semibold mb-2">Leyenda</h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-green-200 border"></span>Presente</li>
                  <li class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-sky-200 border"></span>Feriado</li>
                  <li class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-rose-600 border"></span>Irrenunciable</li>
                  <li class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-yellow-200 border"></span>Justificada</li>
                  <li class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-red-200 border"></span>Injustificada</li>
                  <li class="flex items-center gap-2"><span class="w-4 h-4 rounded bg-gray-200 border"></span>Sin registro</li>
                </ul>
              </div>
            </aside>
            <div id="reporte-calendario" class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold mb-4">Calendario de Marcaciones</h2>
              <MarcacionesCalendario
                :usuario="trabajadorSeleccionado"
                :vista="vista"
                :marcaciones="marcaciones"
                :dias-justificados="diasJustificados"
                :ausencias="ausenciasParaCalendario"
                @hover-dia="mostrarTooltipDia"
                @mes-change="onMesChange"
              />
            </div>
          </div>
        </div>
        <!-- Tabla detalle diario -->
        <!-- Detalle Diario eliminado -->
      </div>

      <!-- Eliminado: componentes duplicados de calendario y detalle diario -->
    </main>

    <!-- Modal de Justificaciones -->
    <div v-if="mostrarModalJustificaciones" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black opacity-50" @click="cerrarJustificaciones"></div>
      <div class="relative h-full overflow-y-auto">
        <ListaJustificaciones @cerrar="cerrarJustificaciones" />
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification.js';
import { useEmpresa } from '@/composables/useEmpresa.js';
import { useAuthStore } from '@/stores/authStore.js';
import MarcacionesCalendario from './MarcacionesCalendario.vue';
import { calcularAusencias } from '@/utils/ausencias.js';
import ListaJustificaciones from './ListaJustificaciones.vue';
import justificacionesService from '@/services/JustificacionesService.js';
// import DetalleDiarioTable from './DetalleDiarioTable.vue';

const router = useRouter();
const { mostrarNotificacion } = useNotification();
const { obtenerTrabajadores } = useEmpresa();
const authStore = useAuthStore();

// Estados reactivos
const cargando = ref(false);
// Mes/año seleccionados por el usuario para filtrar la vista (0-based month)
const selectedMonth = ref(new Date().getMonth());
const selectedYear = ref(new Date().getFullYear());
const vista = ref('mensual');
const empresas = ref([]);
const empresaSeleccionada = ref('');
const trabajadores = ref([]);
const trabajadorSeleccionado = ref(null);
const marcaciones = ref([]);
const diasJustificados = ref([]);
const mostrarModalJustificaciones = ref(false);

// Control para mostrar/ocultar la lista completa de ausencias y utilidades de formato
const mostrarTodasAusencias = ref(false);
const MAX_AUSENCIAS_VISIBLE = 6; // número máximo de chips a mostrar antes de truncar
const fechasAusenciasVisibles = computed(() => {
  const arr = resumen.value.fechasNoTrabajadas || [];
  return mostrarTodasAusencias.value ? arr : arr.slice(0, MAX_AUSENCIAS_VISIBLE);
});
function toggleMostrarTodasAusencias() { mostrarTodasAusencias.value = !mostrarTodasAusencias.value; }

// Mostrar/ocultar por completo la sección de días (por defecto oculta)
const verAusencias = ref(false);
function toggleVerAusencias() { verAusencias.value = !verAusencias.value; }

function formatFechaSimple(f) {
  try {
    const d = new Date(f);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  } catch (e) {
    return f;
  }
}
function formatFechaLong(f) {
  try {
    const d = new Date(f);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch (e) {
    return f;
  }
}

// Mantener ausencias por trabajador para que cada trabajador tenga sus propias fechas calculadas
const ausenciasPorTrabajador = ref({});

function actualizarAusenciasParaTrabajador(usuarioEmpresaId) {
  try {
    if (!usuarioEmpresaId) return;
    // Determinar rango a evaluar: preferir la fecha de ingreso del trabajador si está disponible,
    // si no usar la primera marcación disponible; finalmente, fallback al inicio del mes actual.
    const trabajador = trabajadorSeleccionado.value || {};
    const possibleStartKeys = ['fecha_inicio','fechaInicio','fecha_ingreso','fechaIngreso','fecha_alta','fechaAlta','ingreso','created_at','createdAt'];
    function parseDateOnly(s) {
      if (!s) return null;
      if (typeof s === 'string') {
        const only = s.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(only)) {
          const [y,m,d] = only.split('-').map(Number);
          return new Date(y, m-1, d);
        }
        // try Date parse as fallback
        const parsed = new Date(s);
        if (!isNaN(parsed)) return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        return null;
      }
      if (s instanceof Date && !isNaN(s)) return new Date(s.getFullYear(), s.getMonth(), s.getDate());
      return null;
    }

  let inicioDate = null;
    for (const k of possibleStartKeys) {
      if (trabajador[k]) { inicioDate = parseDateOnly(trabajador[k]); break; }
    }
    // si no hay fecha de ingreso, intentar usar la primera marcación disponible
    if (!inicioDate && marcaciones.value && marcaciones.value.length) {
      // buscar la marcación con fecha mínima
      let minFecha = null;
      marcaciones.value.forEach(m => {
        const f = (m.fecha || m.fecha_marcacion || '').split('T')[0];
        if (!f) return;
        if (!minFecha || f < minFecha) minFecha = f;
      });
      if (minFecha) inicioDate = parseDateOnly(minFecha);
    }
    // fallback al primer día del mes actual si no hay otra referencia
    if (!inicioDate) {
      const hoy = new Date(); inicioDate = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }

    // Restringir el rango al mes seleccionado por el usuario (selectedMonth/selectedYear)
    const monthStart = new Date(selectedYear.value, selectedMonth.value, 1);
    const monthEnd = new Date(selectedYear.value, selectedMonth.value + 1, 0);

    // Inicio será el mayor entre la fecha de inicio conocida y el inicio del mes seleccionado
    if (inicioDate < monthStart) inicioDate = monthStart;
    // finDate: no considerar fechas futuras más allá de hoy
    const hoy = new Date();
    let finDate = monthEnd > hoy ? hoy : monthEnd;

    // Construir array completo de días desde inicioDate hasta finDate a partir de marcaciones actuales y justificaciones
    const diasMesArray = [];
    for (let d = new Date(inicioDate); d <= finDate; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0');
      const fechaStr = `${y}-${m}-${dd}`;
      const registro = (marcaciones.value || []).find(x => ((x.fecha || x.fecha_marcacion || '').split('T')[0]) === fechaStr);
      const entrada = registro ? (registro.entrada || registro.hora_entrada || registro.hora) : null;
      const salida = registro ? (registro.salida || registro.hora_salida || registro.hora) : null;
      const presente = !!(registro && (entrada || salida));
      const justificada = !!((diasJustificados.value || []).find(j => ((j.fecha || '').split('T')[0]) === fechaStr));
      diasMesArray.push({ fecha: fechaStr, hora_entrada: entrada, hora_salida: salida, presente, justificada });
    }

    const assignedShiftsForSelected = trabajadorSeleccionado.value ? (trabajadorSeleccionado.value.turnos_asignados || trabajadorSeleccionado.value.turnos || trabajadorSeleccionado.value.turnosAsignados || []) : [];
    const ausInfo = calcularAusencias(diasMesArray, { workingDaysPerWeek: 5, excludeWeekends: true, assignedShifts: assignedShiftsForSelected });
    ausenciasPorTrabajador.value = { ...(ausenciasPorTrabajador.value || {}), [usuarioEmpresaId]: ausInfo.fechasAusentes || [] };
  } catch (e) {
    console.error('Error actualizando ausencias por trabajador:', e);
  }
}

// Prop para pasar al calendario: ausencias precomputadas para el trabajador seleccionado
const ausenciasParaCalendario = computed(() => {
  if (!trabajadorSeleccionado.value) return [];
  return ausenciasPorTrabajador.value[trabajadorSeleccionado.value.id] || [];
});

const resumen = computed(() => {
  // Si no hay trabajador seleccionado, devolver valores por defecto
  if (!trabajadorSeleccionado.value) return {
    totalDiasTrabajados: 0,
    ausenciasJustificadas: 0,
    ausenciasInjustificadas: 0,
    totalHorasTrabajadas: '0.00',
    porcentajeAsistencia: 0,
    promedioHoraEntrada: '--:--',
    promedioHoraSalida: '--:--'
  };

  // Determinar mes/año a evaluar: usar el mes seleccionado por el usuario (selectedMonth/selectedYear)
  const mes = (typeof selectedMonth !== 'undefined' && selectedMonth !== null) ? selectedMonth.value : new Date().getMonth();
  const anio = (typeof selectedYear !== 'undefined' && selectedYear !== null) ? selectedYear.value : new Date().getFullYear();

  const inicio = new Date(anio, mes, 1);
  // fin del mes seleccionado
  const fin = new Date(anio, mes + 1, 0);

  // Construir array completo de días del mes
  const diasMesArray = [];
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const fechaStr = d.toISOString().split('T')[0];
    const registro = (marcaciones.value || []).find(x => ((x.fecha || x.fecha_marcacion || '').split('T')[0]) === fechaStr);
    const entrada = registro ? (registro.entrada || registro.hora_entrada) : null;
    const salida = registro ? (registro.salida || registro.hora_salida) : null;
    const presente = !!(registro && (entrada || salida));
    const justificada = !!((diasJustificados.value || []).find(j => ((j.fecha || '').split('T')[0]) === fechaStr));
    diasMesArray.push({ fecha: fechaStr, hora_entrada: entrada, hora_salida: salida, presente, justificada });
  }

  // Usar util para calcular ausencias en este rango completo
  const assignedShiftsForSelected = trabajadorSeleccionado.value ? (trabajadorSeleccionado.value.turnos_asignados || trabajadorSeleccionado.value.turnos || trabajadorSeleccionado.value.turnosAsignados || []) : [];
  const ausInfo = calcularAusencias(diasMesArray, { workingDaysPerWeek: 5, excludeWeekends: true, assignedShifts: assignedShiftsForSelected });

  // Calcular métricas de presencia y horas (filtradas por el mes seleccionado)
  let sumaHoras = 0;
  const entradasTotales = [];
  const salidasTotales = [];
  let diasTrabajados = 0;
  try {
    const startStr = inicio.toISOString().split('T')[0];
    const endStr = fin.toISOString().split('T')[0];
    (marcaciones.value || []).forEach(dia => {
      const fecha = (dia.fecha || dia.fecha_marcacion || '').split('T')[0];
      if (!fecha) return;
      if (fecha < startStr || fecha > endStr) return; // ignorar fuera del mes
      // contar sólo días con entrada y salida
      if (dia.entrada && dia.salida) {
        entradasTotales.push(dia.entrada);
        salidasTotales.push(dia.salida);
        const [h1, m1, s1] = (dia.entrada || '00:00').split(':').map(Number);
        const [h2, m2, s2] = (dia.salida || '00:00').split(':').map(Number);
        const minEntrada = (h1 || 0) * 60 + (m1 || 0) + (s1 || 0) / 60;
        const minSalida = (h2 || 0) * 60 + (m2 || 0) + (s2 || 0) / 60;
        let horas = (minSalida - minEntrada) / 60;
        if (horas < 0) horas = 0;
        sumaHoras += horas;
        diasTrabajados++;
      }
    });
  } catch (e) {
    console.warn('Error calculando métricas por mes:', e);
  }
  const totalHorasTrabajadas = sumaHoras.toFixed(2);
  const porcentajeAsistencia = diasMesArray.length ? Math.round((diasTrabajados / diasMesArray.length) * 100) : 0;

  function calcularPromedio(horasArray) {
    if (!horasArray.length) return '--:--';
    const minutos = horasArray.map(h => {
      const [hh, mm, ss] = h.split(':').map(Number);
      return hh * 60 + mm + (ss || 0) / 60;
    }).sort((a, b) => a - b);
    const medianaMin = minutos[Math.floor(minutos.length / 2)];
    const hh = Math.floor(medianaMin / 60).toString().padStart(2, '0');
    const mm = Math.floor(medianaMin % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  const promedioHoraEntrada = calcularPromedio(entradasTotales);
  const promedioHoraSalida = calcularPromedio(salidasTotales);

    // Determinar las fechas que se mostrarán (pueden venir desde el cache por trabajador)
    const fechasMostradas = (trabajadorSeleccionado.value && ausenciasPorTrabajador.value[trabajadorSeleccionado.value.id])
      ? ausenciasPorTrabajador.value[trabajadorSeleccionado.value.id]
      : ausInfo.fechasAusentes || [];

    return {
    totalDiasTrabajados: diasTrabajados,
    ausenciasJustificadas: ausInfo.ausenciasJustificadas,
    // Contar ausencias según las fechas que efectivamente se muestran en la UI
    ausenciasInjustificadas: (fechasMostradas || []).length,
    totalHorasTrabajadas,
    porcentajeAsistencia,
    promedioHoraEntrada,
    promedioHoraSalida,
    fechasNoTrabajadas: fechasMostradas
  };
});

// Cálculos para comparar con horas laborales del trabajador
const limiteHoras = computed(() => {
  if (!trabajadorSeleccionado.value) return 45;
  const raw = trabajadorSeleccionado.value.horas_laborales || trabajadorSeleccionado.value.horasLaborales || trabajadorSeleccionado.value.horas || 45;
  const n = Number(parseFloat(raw));
  return isNaN(n) ? 45 : n;
});

// Total horas trabajadas en la SEMANA ACTUAL (lunes-domingo) calculadas a partir de marcaciones cargadas
const totalHorasDecimal = computed(() => {
  try {
    if (!marcaciones.value || !marcaciones.value.length) return 0;
    // calcular inicio y fin de la semana actual
    const hoy = new Date();
    const dia = hoy.getDay();
    const diffToMonday = dia === 0 ? -6 : 1 - dia;
    const monday = new Date(hoy);
    monday.setDate(hoy.getDate() + diffToMonday);
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    const startStr = monday.toISOString().split('T')[0];
    const endStr = sunday.toISOString().split('T')[0];
    let suma = 0;
    marcaciones.value.forEach(d => {
      const fecha = (d.fecha || d.fecha_marcacion || '').split('T')[0];
      if (!fecha) return;
      if (fecha < startStr || fecha > endStr) return;
      if (d.entrada && d.salida) {
        const [h1, m1, s1] = d.entrada.split(':').map(Number);
        const [h2, m2, s2] = d.salida.split(':').map(Number);
        const minEntrada = (h1||0) * 60 + (m1||0) + ((s1||0)/60);
        const minSalida = (h2||0) * 60 + (m2||0) + ((s2||0)/60);
        let horas = (minSalida - minEntrada) / 60;
        if (horas < 0) horas = 0;
        suma += horas;
      } else if (d.totalHoras !== undefined && d.totalHoras !== null) {
        const val = typeof d.totalHoras === 'string' ? parseFloat(d.totalHoras) : d.totalHoras;
        if (!isNaN(val)) suma += val;
      }
    });
    return Math.round(suma * 100) / 100;
  } catch (e) {
    return 0;
  }
});

// Helpers para días laborales a partir de turnos asignados
function normalizeWeekday(s) {
  if (!s) return '';
  return String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').slice(0,3);
}
function getWorkingDaysSetFromShifts(assignedShifts = []) {
  const defaultDays = new Set(['lun','mar','mie','jue','vie']);
  if (!assignedShifts || !assignedShifts.length) return defaultDays;
  const days = new Set();
  let foundAny = false;
  for (const t of assignedShifts) {
    if (t.dias && Array.isArray(t.dias) && t.dias.length) {
      foundAny = true;
      t.dias.forEach(dn => days.add(normalizeWeekday(dn)));
    }
  }
  return foundAny ? days : defaultDays;
}

function countWorkingDaysBetween(startDateStr, endDateStr, workingDaysSet) {
  try {
    const parseLocal = (s) => {
      const [y,m,d] = s.split('-').map(Number);
      return new Date(y, m-1, d);
    };
    let start = parseLocal(startDateStr);
    let end = parseLocal(endDateStr);
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const weekdayFull = d.toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
      const wk = normalizeWeekday(weekdayFull);
      if (workingDaysSet.has(wk)) count++;
    }
    return count;
  } catch (e) {
    return 0;
  }
}

// Calcular límite de horas para la semana actual basado en los turnos del trabajador
const TOLERANCIA = 0.01;
const limiteHorasSemanaActual = computed(() => {
  if (!trabajadorSeleccionado.value) return limiteHoras.value;
  const assigned = trabajadorSeleccionado.value.turnos_asignados || trabajadorSeleccionado.value.turnos || trabajadorSeleccionado.value.turnosAsignados || [];
  const workingDaysSet = getWorkingDaysSetFromShifts(assigned);
  const diasPorSemana = workingDaysSet.size || 5;
  const horasSemanales = limiteHoras.value; // e.g., 45
  const horasDiariasEsperadas = horasSemanales / diasPorSemana;
  // calcular fecha inicio y fin de la semana actual (lunes-domingo)
  const hoy = new Date();
  const dia = hoy.getDay(); // 0 domingo, 1 lunes
  const diffToMonday = dia === 0 ? -6 : 1 - dia; // shift to Monday
  const monday = new Date(hoy);
  monday.setDate(hoy.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const startStr = monday.toISOString().split('T')[0];
  const endStr = sunday.toISOString().split('T')[0];
  const workingDaysThisWeek = countWorkingDaysBetween(startStr, endStr, workingDaysSet);
  return Math.round(horasDiariasEsperadas * workingDaysThisWeek * 100) / 100;
});

const excesoDecimal = computed(() => {
  const diff = totalHorasDecimal.value - limiteHorasSemanaActual.value;
  return diff > TOLERANCIA ? Math.round(diff * 100) / 100 : 0;
});

function decimalA_HHMM(decimalHoras) {
  const horas = Math.floor(decimalHoras);
  const minutos = Math.round((decimalHoras - horas) * 60);
  return `${String(horas).padStart(2,'0')}:${String(minutos).padStart(2,'0')}`;
}
const excesoFormato = computed(() => decimalA_HHMM(excesoDecimal.value));
const excedeHoras = computed(() => excesoDecimal.value > 0);

const filtros = ref({
  busqueda: '',
  asistencia: '',
  fechaInicio: ''
});

function mostrarTooltipDia(dia) {
  // Aquí podrías mostrar un tooltip con la info del día
}

function exportarReporte() {
  try {
    mostrarNotificacion('📄 Exportando reporte a PDF...', 'info');
    const node = document.getElementById('reporte-calendario');
    if (!node) {
      mostrarNotificacion('❌ No se encontró el contenido para exportar', 'error');
      return;
    }
    const trabajador = trabajadorSeleccionado.value || {};
    const titulo = `Reporte de Marcaciones - ${trabajador.nombre || trabajador.usuario_nombre || ''}`;
    const estilo = `
      body{ font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #111827 }
      .card{ background: #fff; border-radius: 8px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
      h1{ font-size:18px; margin-bottom:8px }
      .meta{ font-size:13px; color:#374151; margin-bottom:12px }
    `;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${titulo}</title><style>${estilo}</style></head><body><div class="card"><h1>${titulo}</h1><div class="meta">Generado: ${new Date().toLocaleString()}</div>${node.innerHTML}</div></body></html>`;
    const w = window.open('', '_blank');
    if (!w) {
      mostrarNotificacion('❌ El navegador bloqueó la apertura de la ventana para imprimir. Permite popups e inténtalo de nuevo.', 'error');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    // dar tiempo a que cargue
    setTimeout(() => { w.focus(); w.print(); /* opcional: w.close(); */ }, 700);
  } catch (e) {
    console.error('Error exportando PDF:', e);
    mostrarNotificacion('❌ Error al exportar el reporte', 'error');
  }
}

function volverReportes() {
  router.push({ name: 'EmpresaReportes' });
}

function mostrarJustificaciones() {
  mostrarModalJustificaciones.value = true;
}

function cerrarJustificaciones() {
  mostrarModalJustificaciones.value = false;
}

// Handler cuando el calendario cambia mes/año
function onMesChange(payload) {
  try {
    if (!payload) return;
    const { mes, anio } = payload;
    selectedMonth.value = typeof mes === 'number' ? mes : Number(mes);
    selectedYear.value = typeof anio === 'number' ? anio : Number(anio);
    // Recalcular ausencias para el trabajador seleccionado (si hay)
    if (trabajadorSeleccionado.value && trabajadorSeleccionado.value.id) {
      actualizarAusenciasParaTrabajador(trabajadorSeleccionado.value.id);
    }
  } catch (e) {
    console.warn('onMesChange error:', e);
  }
}


onMounted(async () => {
  cargando.value = true;
  try {
    // Simulación: obtener empresas del usuario autenticado (ajusta según tu backend)
    empresas.value = authStore.getUser?.empresas || [{ empresa_id: 4, emp_nombre: 'EmpresaPrincipal', emp_rut: '123' }];
    empresaSeleccionada.value = empresas.value[0]?.emp_rut || '';
    await cargarTrabajadoresEmpresa();
    trabajadorSeleccionado.value = null;
  } catch (e) {
    console.error('Error obteniendo empresas o trabajadores:', e);
  }
  cargando.value = false;
});

async function cargarTrabajadoresEmpresa() {
  cargando.value = true;
  try {
  // request logs removed
  const lista = await obtenerTrabajadores(empresaSeleccionada.value);
    // Normalizar el formato de los trabajadores para soportar ambos casos
    let arr = [];
    if (Array.isArray(lista)) {
      arr = lista;
    } else if (lista?.data && Array.isArray(lista.data)) {
      arr = lista.data;
    } else if (lista?.trabajadores && Array.isArray(lista.trabajadores)) {
      arr = lista.trabajadores;
    }
    // Adaptar cada trabajador al formato esperado por el template
    trabajadores.value = arr.map(t => ({
      id: t.id || t.usuario_id,
      nombre: t.nombre || t.usuario_nombre,
      apellido: t.apellido || t.apellido_pat || t.usuario_apellido_pat,
      rut: t.rut || t.usuario_rut,
      rol: t.rol || t.rol_en_empresa,
      email: t.email || t.usuario_email,
      ...t
    }));
  } catch (e) {
    console.error('Error obteniendo trabajadores:', e);
    trabajadores.value = [];
  }
  cargando.value = false;
}

async function seleccionarTrabajador(trabajador) {
  trabajadorSeleccionado.value = trabajador;
  // Usar el id de la relación usuario-empresa para la consulta de marcaciones
  await cargarMarcacionesTrabajador(trabajador.id);
  // Cargar días justificados
  await cargarDiasJustificados(trabajador.id);
  // Actualizar ausencias calculadas para este trabajador (se asocia por id)
  try { actualizarAusenciasParaTrabajador(trabajador.id); } catch (e) { /* noop */ }
}

watch(trabajadorSeleccionado, async (nuevoTrabajador) => {
  if (nuevoTrabajador) {
    // Usar el id de la relación usuario-empresa para la consulta de marcaciones
    await cargarMarcacionesTrabajador(nuevoTrabajador.id);
    // Cargar días justificados
    await cargarDiasJustificados(nuevoTrabajador.id);
    // Actualizar ausencias al cambiar trabajador
    try { actualizarAusenciasParaTrabajador(nuevoTrabajador.id); } catch (e) { /* noop */ }
  }
});

// trabajadorId ahora es usuario_empresa_id
async function cargarDiasJustificados(usuarioEmpresaId) {
  try {
    // Calcular rango de fechas para el año actual
    const ahora = new Date();
    const inicioAno = `${ahora.getFullYear()}-01-01`;
    const finAno = `${ahora.getFullYear()}-12-31`;
    
    const response = await justificacionesService.obtenerDiasJustificados(
      usuarioEmpresaId,
      inicioAno,
      finAno
    );
    
    if (response.success) {
      diasJustificados.value = response.data;
      console.log('Días justificados cargados:', diasJustificados.value);
      console.log('Estructura de cada día justificado:', response.data[0]); // Ver la estructura
    } else {
      diasJustificados.value = [];
    }
  } catch (error) {
    console.error('Error al cargar días justificados:', error);
    diasJustificados.value = [];
  }
}

// trabajadorId ahora es usuario_empresa_id
async function cargarMarcacionesTrabajador(usuarioEmpresaId) {
  cargando.value = true;
  try {
    // Puedes ajustar el límite según la vista (mensual/anual)
    const limite = vista.value === 'mensual' ? 31 : 365;
    // request/response logs removed
  const EmpresaService = await import('../../../services/EmpresaService.js').then(m => m.default);
  const response = await EmpresaService.obtenerMarcacionesTrabajador(usuarioEmpresaId, limite);
  
    // El backend devuelve { success, data: [...] }
    let rawMarcaciones = response.data;
    let lista = [];
    if (Array.isArray(rawMarcaciones)) {
      lista = rawMarcaciones;
    } else if (rawMarcaciones && typeof rawMarcaciones === 'object') {
      // Si viene agrupado por fecha (no debería en este endpoint, pero por si acaso)
      Object.values(rawMarcaciones).forEach(arr => {
        if (Array.isArray(arr)) {
          lista.push(...arr);
        }
      });
    }
    // Agrupar por fecha
    const agrupadas = {};
    lista.forEach(m => {
      const fecha = m.fecha_marcacion || m.fecha;
      if (!agrupadas[fecha]) agrupadas[fecha] = { fecha, entradas: [], salidas: [], registros: [] };
      const tipo = m.tipo_marcacion || m.tipo;
      if (tipo === 'entrada') agrupadas[fecha].entradas.push(m.hora_marcacion || m.hora);
      if (tipo === 'salida') agrupadas[fecha].salidas.push(m.hora_marcacion || m.hora);
      agrupadas[fecha].registros.push(m);
    });
    marcaciones.value = Object.values(agrupadas).map(dia => {
      const entrada = dia.entradas.length ? dia.entradas[0] : undefined;
      const salida = dia.salidas.length ? dia.salidas[dia.salidas.length - 1] : undefined;
      return {
        fecha: dia.fecha,
        entrada,
        salida,
        presente: !!(entrada || salida),
        registros: dia.registros,
        // Puedes agregar más campos si lo necesitas
      };
    });
    // Intentar obtener turnos asignados para el trabajador y adjuntarlos al objeto seleccionado
    try {
      const turnosResp = await EmpresaService.obtenerTurnosTrabajador(usuarioEmpresaId);
      // EmpresaService devuelve response.data en su implementación; si viene envuelto, normalizar
      const turnos = Array.isArray(turnosResp) ? turnosResp : (turnosResp?.data || turnosResp?.turnos || []);
      if (trabajadorSeleccionado.value) {
        trabajadorSeleccionado.value.turnos_asignados = turnos;
      }
    } catch (err) {
      console.warn('No se pudieron obtener turnos del trabajador:', err);
    }
  
  } catch (e) {
    marcaciones.value = [];
    console.error('Error obteniendo marcaciones:', e);
  }
  cargando.value = false;
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
