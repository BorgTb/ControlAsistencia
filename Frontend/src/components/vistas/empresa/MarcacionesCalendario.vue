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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
const emit = defineEmits(['hover-dia']);



const props = defineProps({
  usuario: Object,
  vista: String,
  marcaciones: Array
});
const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const anioActual = new Date().getFullYear();
const anios = [anioActual-1, anioActual, anioActual+1];
const mesSeleccionado = ref(new Date().getMonth());
const anioSeleccionado = ref(anioActual);

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
    const estado = (entrada || salida) ? 'presente' : 'sinregistro';
    dias.push({
      dia: d,
      fecha: fechaStr,
      estado,
      entrada: entrada,
      salida: salida,
      marcacionesDia: registroDia ? registroDia.registros : []
    });
  }
  // Log para ver cómo se construye el arreglo de días
  console.log('diasMes:', dias);
  return dias;
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
