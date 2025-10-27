<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Calendario {{ vista === 'mensual' ? 'Mensual' : 'Anual' }}</h3>
      <select v-model="mesSeleccionado" v-if="vista === 'mensual'" class="border rounded px-2 py-1">
        <option v-for="(mes, idx) in meses" :key="idx" :value="idx">{{ mes }}</option>
      </select>
      <select v-model="anioSeleccionado" class="border rounded px-2 py-1">
        <option v-for="anio in anios" :key="anio" :value="anio">{{ anio }}</option>
      </select>
    </div>
    <div v-if="vista === 'mensual'">
      <div class="grid grid-cols-7 gap-2">
        <div v-for="dia in diasSemana" :key="dia" class="text-center font-bold text-gray-600">{{ dia }}</div>
        <div v-for="n in primerDiaMes" :key="'empty-' + n"></div>
        <div v-for="dia in diasMes" :key="dia.fecha" class="h-16 w-full rounded-lg flex flex-col items-center justify-center cursor-pointer relative"
          :class="colorDia(dia.estado)"
          @mouseenter="mostrarTooltip(dia)"
          @mouseleave="ocultarTooltip"
        >
          <span class="font-semibold">{{ dia.dia }}</span>
          <div v-if="dia.estado === 'presente'" class="text-xs mt-1 text-gray-700 text-center">
          <div><b>Entrada:</b> {{ formatHora(dia.entrada) }}</div>
          <div><b>Salida:</b> {{ formatHora(dia.salida) }}</div>
          </div>
          <div v-else-if="dia.estado === 'justificada'" class="text-xs mt-1 text-yellow-700 text-center">
            Justificada
          </div>
          <div v-else-if="dia.estado === 'injustificada'" class="text-xs mt-1 text-red-700 text-center">
            Injustificada
          </div>
          <div v-else class="text-xs mt-1 text-gray-400 text-center">
            Sin registro
          </div>
          <div v-if="tooltipDia && tooltipDia.fecha === dia.fecha" class="absolute z-10 left-1/2 -translate-x-1/2 top-16 bg-white border rounded shadow-lg p-2 text-xs w-44">
            <div v-if="dia.estado === 'presente'">
              <div><b>Entrada:</b> {{ formatHora(tooltipDia.entrada) || '--:--' }}</div>
              <div><b>Salida:</b> {{ formatHora(tooltipDia.salida) || '--:--' }}</div>
              <div><b>Total Horas:</b> {{ tooltipDia.totalHoras || '-' }}</div>
              <div><b>Retraso:</b> {{ tooltipDia.retraso || '-' }}</div>
            </div>
            <div v-else>
              <div><b>Justificación:</b> {{ tooltipDia.justificacion || (dia.estado === 'justificada' ? 'Justificada' : dia.estado === 'injustificada' ? 'Injustificada' : 'Sin registro') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="grid grid-cols-12 gap-2">
        <div v-for="mes in meses" :key="mes" class="text-center font-bold text-gray-600">{{ mes }}</div>
        <div v-for="mes in meses" :key="'anual-' + mes" class="h-16 w-full rounded-lg flex flex-col items-center justify-center cursor-pointer"
          :class="colorDia(marcacionesAnual[mes])"
          @mouseenter="$emit('hover-dia', marcacionesAnual[mes])"
        >
          <span class="font-semibold">{{ resumenMes(marcacionesAnual[mes]) }}</span>
        </div>
      </div>
    </div>
    <!-- indicadores principales los maneja el componente padre (ReporteAsistencia) -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { calcularAusencias, fechaTieneTurno } from '../../../utils/ausencias.js';
const emit = defineEmits(['hover-dia']);



const props = defineProps({
  usuario: Object,
  vista: String,
  marcaciones: Array
});

// Configuración de horas semanales permitidas
const limiteHorasSemanales = computed(() => {
  const raw = props.usuario && props.usuario.horas_laborales ? props.usuario.horas_laborales : 45;
  const n = Number(parseFloat(raw));
  return isNaN(n) ? 45 : n;
});

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const anioActual = new Date().getFullYear();
const anios = [anioActual-1, anioActual, anioActual+1];
const mesSeleccionado = ref(new Date().getMonth());
const anioSeleccionado = ref(anioActual);

// Tolerancia para evitar falsos positivos por redondeo (en horas)
const TOLERANCIA_HORAS = 0.01;

// Helper: calcula horas entre dos HH:MM:SS o HH:MM strings
function horasEntre(inicioStr, finStr) {
  if (!inicioStr || !finStr) return 0;
  try {
    const [h1, m1, s1] = inicioStr.split(':').map(Number);
    const [h2, m2, s2] = finStr.split(':').map(Number);
    const inicio = new Date(0,0,0, h1 || 0, m1 || 0, s1 || 0);
    const fin = new Date(0,0,0, h2 || 0, m2 || 0, s2 || 0);
    let horas = (fin - inicio) / 1000 / 60 / 60;
    if (horas < 0) horas += 24; // cruza medianoche
    return Math.round(horas * 100) / 100;
  } catch (e) {
    return 0;
  }
}

// Calcular total de horas trabajadas en la semana seleccionada (robusto)
const totalHorasSemanales = computed(() => {
  // debug logs removed
  let total = 0;
  (props.marcaciones || []).forEach(m => {
    // Preferir totalHoras si viene desde backend
    let horasDia = 0;
    if (m && (m.totalHoras !== undefined && m.totalHoras !== null)) {
      const val = typeof m.totalHoras === 'string' ? parseFloat(m.totalHoras) : m.totalHoras;
      horasDia = isNaN(val) ? 0 : val;
    } else {
      // Intentar obtener entrada/salida directas
      let entrada = m && m.entrada ? m.entrada : undefined;
      let salida = m && m.salida ? m.salida : undefined;
      // Si no vienen como propiedades directas, buscar en registros agrupados
      if ((!entrada || !salida) && m && Array.isArray(m.registros)) {
        const regEntrada = m.registros.find(r => r.tipo === 'entrada');
        const regSalida = m.registros.find(r => r.tipo === 'salida');
        entrada = entrada || (regEntrada ? regEntrada.hora : undefined);
        salida = salida || (regSalida ? regSalida.hora : undefined);
      }
      horasDia = horasEntre(entrada, salida);
    }
    if (!isNaN(horasDia) && horasDia > 0) total += horasDia;
  });
  // Redondear total a 2 decimales
  return Math.round(total * 100) / 100;
});

// Computada para saber si se excedieron las horas (aplica tolerancia)
const excedeHorasSemanales = computed(() => {
  // debug logs removed
  return (totalHorasSemanales.value - limiteHorasSemanales.value) > TOLERANCIA_HORAS;
});

// Cuánto se excede en decimal y en formato HH:MM
const excesoHorasDecimal = computed(() => {
  const diff = totalHorasSemanales.value - limiteHorasSemanales.value;
  return diff > TOLERANCIA_HORAS ? Math.round(diff * 100) / 100 : 0;
});
function horasDecimalA_HHMM(decimalHoras) {
  const horas = Math.floor(decimalHoras);
  const minutos = Math.round((decimalHoras - horas) * 60);
  return `${String(horas).padStart(2,'0')}:${String(minutos).padStart(2,'0')}`;
}
const excesoFormato = computed(() => horasDecimalA_HHMM(excesoHorasDecimal.value));

const primerDiaMes = computed(() => {
  // getDay() devuelve 0 para domingo, 1 para lunes, etc.
  // Queremos que el calendario empiece en lunes (0 = lunes)
  const fecha = new Date(anioSeleccionado.value, mesSeleccionado.value, 1);
  let diaSemana = fecha.getDay();
  // Ajustar para que lunes sea 0, domingo sea 6
  diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;
  return diaSemana;
});
const diasMes = computed(() => {
  const dias = [];
  const totalDias = new Date(anioSeleccionado.value, mesSeleccionado.value+1, 0).getDate();
  // Usar directamente la estructura agrupada por día
  const marcacionesPorFecha = {};
  (props.marcaciones || []).forEach(m => {
    // Normaliza la clave a solo fecha (YYYY-MM-DD)
    const fechaKey = m.fecha ? m.fecha.split('T')[0] : '';
    marcacionesPorFecha[fechaKey] = m;
  });
  for(let d=1; d<=totalDias; d++) {
    const fechaStr = new Date(anioSeleccionado.value, mesSeleccionado.value, d).toISOString().split('T')[0];
    const registroDia = marcacionesPorFecha[fechaStr];
    let entrada = registroDia && registroDia.entrada ? registroDia.entrada : undefined;
    let salida = registroDia && registroDia.salida ? registroDia.salida : undefined;
    // Determinar si el trabajador tenía turno asignado ese día
    const assignedShiftsForUser = props.usuario ? (props.usuario.turnos_asignados || props.usuario.turnos || props.usuario.turnosAsignados || []) : [];
    const estaAsignado = fechaTieneTurno(fechaStr, assignedShiftsForUser);
    // Si no estaba asignado, mostramos "sin registro" visualmente pero NO lo contaremos como ausencia
    let estado = 'sinregistro';
    if (estaAsignado && (entrada || salida)) {
      estado = 'presente';
    }
    dias.push({
      dia: d,
      fecha: fechaStr,
      estado,
      entrada: entrada,
      salida: salida,
      marcacionesDia: registroDia ? registroDia.registros : [],
      // propagar flags si vienen
      justificada: registroDia && (registroDia.justificada || registroDia.estado === 'AUSENCIA_JUSTIFICADA'),
      injustificada: registroDia && (registroDia.injustificada || registroDia.estado === 'AUSENCIA_INJUSTIFICADA')
    });
  }
  // Determinar ausencias con el util: marcar días laborables sin registro como 'injustificada'
  try {
    const assignedShiftsForUser = props.usuario ? (props.usuario.turnos_asignados || props.usuario.turnos || props.usuario.turnosAsignados || []) : [];
    const ausInfo = calcularAusencias(dias, { workingDaysPerWeek: 5, excludeWeekends: true, assignedShifts: assignedShiftsForUser });
      const fechasAus = new Set(ausInfo.fechasAusentes || []);
      // Mapear los días y actualizar estado si corresponde
      const diasFinal = dias.map(d => {
      // Solo marcar como injustificada aquellos días que están asignados y aparecen en fechasAus
      if (d.estado === 'sinregistro' && fechasAus.has(d.fecha)) {
        return { ...d, estado: 'injustificada' };
      }
      // Si viene marcado como justificada en los datos, forzar estado
      if (d.justificada) return { ...d, estado: 'justificada' };
      return d;
      });
      return diasFinal;
    } catch (e) {
      return dias;
    }
});
// Ya no se usa estadoDia, el estado se calcula en diasMes

const tooltipDia = ref(null);
function mostrarTooltip(dia) {
  tooltipDia.value = dia;
  emit('hover-dia', dia);
}
function ocultarTooltip() {
  tooltipDia.value = null;
}
function colorDia(estado) {
  return {
    'bg-green-200': estado === 'presente',
    'bg-yellow-200': estado === 'justificada',
    'bg-red-200': estado === 'injustificada',
    'bg-gray-200': estado === 'sinregistro'
  };
}
const marcacionesAnual = computed(() => {
  const resumen = {};
  meses.forEach((mes, idx) => {
    const regs = props.marcaciones.filter(m => new Date(m.fecha).getMonth() === idx && new Date(m.fecha).getFullYear() === anioSeleccionado.value);
    let estado = 'sinregistro';
    if (regs.some(r => r.presente)) estado = 'presente';
    else if (regs.some(r => r.justificada)) estado = 'justificada';
    else if (regs.some(r => r.injustificada)) estado = 'injustificada';
    resumen[mes] = estado;
  });
  return resumen;
});
function resumenMes(estado) {
  if (estado === 'presente') return '✔';
  if (estado === 'justificada') return '!';
  if (estado === 'injustificada') return '✖';
  return '-';
}

function formatHora(hora) {
  if (!hora) return '--:--';
  // Si ya está en formato HH:mm, solo retorna los primeros 5 caracteres
  if (/^\d{2}:\d{2}/.test(hora)) return hora.slice(0,5);
  const [h, m, s] = hora.split(':');
  const date = new Date();
  date.setHours(h, m, s);
  let hour = date.getHours();
  const min = date.getMinutes().toString().padStart(2,'0');
  return `${hour.toString().padStart(2,'0')}:${min}`;
}
</script>
