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
          :class="colorDia(dia)"
          @mouseenter="mostrarTooltip(dia)"
          @mouseleave="ocultarTooltip"
          @click="onClickDia(dia)"
        >
          <span class="font-semibold">{{ dia.dia }}</span>
          <!-- Badge para feriado irrenunciable -->
          <div v-if="dia.justificacionDetalle && dia.justificacionDetalle.irrenunciable" class="absolute top-1 right-1 text-xxs bg-rose-700 text-white px-1 rounded">I</div>
          <div v-if="dia.estado === 'presente'" class="text-xs mt-1 text-gray-700 text-center">
          <div><b>Entrada:</b> {{ formatHora(dia.entrada) }}</div>
          <div><b>Salida:</b> {{ formatHora(dia.salida) }}</div>
          </div>
          <div v-else-if="dia.estado === 'justificada'" class="text-xs mt-1 text-center">
            <template v-if="dia.justificacionDetalle && (dia.justificacionDetalle.nombre || dia.justificacionDetalle.name || (dia.justificacionDetalle.items && dia.justificacionDetalle.items.length))">
              <div class="text-sm font-medium">{{ dia.justificacionDetalle.nombre || dia.justificacionDetalle.name || (dia.justificacionDetalle.items && dia.justificacionDetalle.items.map(i => i.nombre || i.name).join(' / ')) }}</div>
              <div v-if="dia.justificacionDetalle.irrenunciable || (dia.justificacionDetalle.items && dia.justificacionDetalle.items.some(it => it.irrenunciable))" class="text-xs text-rose-700 italic font-semibold">Irrenunciable</div>
            </template>
            <template v-else>
              <div class="text-xs text-yellow-700">Justificada</div>
            </template>
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
            <div v-else-if="dia.estado === 'justificada' && dia.justificacionDetalle">
              <div v-if="dia.justificacionDetalle.items && dia.justificacionDetalle.items.length">
                <div class="font-medium mb-1">Feriados registrados:</div>
                <ul class="text-xs space-y-1">
                  <li v-for="(it, idx) in dia.justificacionDetalle.items" :key="idx" class="flex justify-between items-center gap-2">
                    <span>{{ it.nombre || it.name || 'Feriado' }}</span>
                    <span v-if="it.irrenunciable" class="text-rose-700 text-xs font-semibold italic">Irrenunciable</span>
                  </li>
                </ul>
              </div>
              <div v-else>
                <div v-if="dia.justificacionDetalle.nombre || dia.justificacionDetalle.name"><b>Feriado:</b> {{ dia.justificacionDetalle.nombre || dia.justificacionDetalle.name }}</div>
                <div v-else><b>Estado:</b> Justificada</div>
                <div v-if="dia.justificacionDetalle.tipo_justificacion"><b>Tipo:</b> {{ dia.justificacionDetalle.tipo_justificacion }}</div>
                <div v-if="dia.justificacionDetalle.motivo"><b>Motivo:</b> {{ dia.justificacionDetalle.motivo }}</div>
                <div v-if="!dia.justificacionDetalle.tipo_justificacion && !dia.justificacionDetalle.motivo" class="text-xs text-gray-600">Sin motivo especificado</div>
              </div>
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
    
    <!-- Modal para mostrar feriados de una fecha -->
    <div v-if="showFeriadosModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black opacity-40" @click="closeFeriadosModal"></div>
      <div class="bg-white rounded-lg shadow-lg z-50 w-11/12 max-w-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold">Feriados para {{ selectedFecha }}</h3>
          <button @click="closeFeriadosModal" class="text-gray-600 hover:text-gray-900">✕</button>
        </div>
        <div v-if="selectedFeriados && selectedFeriados.length">
          <div class="mb-2 text-sm">
            <span class="font-medium">Irrenunciable:</span>
            <span :class="anySelectedIrr ? 'text-rose-700 font-semibold' : 'text-gray-600'">{{ anySelectedIrr ? 'Sí (al menos uno)' : 'No' }}</span>
          </div>
          <ul class="space-y-2">
            <li v-for="f in selectedFeriados" :key="f.id" class="flex items-center justify-between border rounded px-3 py-2">
              <div>
                <div class="font-medium">{{ f.nombre || 'Feriado' }}</div>
                <div class="text-xs text-gray-500">Fecha: {{ f.fecha }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm">
                  <span class="font-medium">Irrenunciable:</span>
                  <span :class="f.irrenunciable ? 'text-rose-700 font-semibold ml-1' : 'text-gray-600 ml-1'">{{ f.irrenunciable ? 'Sí' : 'No' }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="text-sm text-gray-600">No hay feriados registrados para esta fecha.</div>
        <div class="mt-4 flex justify-end">
          <button @click="closeFeriadosModal" class="px-4 py-2 bg-blue-600 text-white rounded">Cerrar</button>
        </div>
      </div>
    </div>
    <!-- indicadores principales los maneja el componente padre (ReporteAsistencia) -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import feriadosService from '../../../services/feriadosService.js';
import { calcularAusencias, fechaTieneTurno } from '../../../utils/ausencias.js';
const emit = defineEmits(['hover-dia', 'mes-change']);



const props = defineProps({
  usuario: Object,
  vista: String,
  marcaciones: Array,
  diasJustificados: {
    type: Array,
    default: () => []
  }
  ,
  ausencias: {
    type: Array,
    default: () => []
  }
});

// Feriados cargados desde la API (BD)
const feriados = ref([]);

async function loadFeriados() {
  try {
    const data = await feriadosService.list();
    feriados.value = (data || []).map(f => ({ id: f.id, fecha: f.fecha, nombre: f.nombre, irrenunciable: !!f.irrenunciable }));
  } catch (e) {
    console.error('Error cargando feriados en MarcacionesCalendario:', e);
    feriados.value = [];
  }
}

onMounted(() => {
  loadFeriados();
});

// Configuración de horas semanales permitidas
const limiteHorasSemanales = computed(() => {
  const raw = props.usuario && props.usuario.horas_laborales ? props.usuario.horas_laborales : 45;
  const n = Number(parseFloat(raw));
  return isNaN(n) ? 45 : n;
});


// Debug: Ver qué días justificados se están recibiendo
watch(() => props.diasJustificados, (newVal) => {
  
  console.log('MarcacionesCalendario recibió días justificados:', newVal);
  // Aquí puedes agregar más lógica si es necesario


}, { immediate: true });
const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const anioActual = new Date().getFullYear();
const anios = [anioActual-1, anioActual, anioActual+1];
const mesSeleccionado = ref(new Date().getMonth());
const anioSeleccionado = ref(anioActual);

// Emitir cuando el mes o año seleccionado cambian para que el padre pueda reaccionar
watch([mesSeleccionado, anioSeleccionado], ([m, a]) => {
  try {
    // emitir un evento con el mes (0-based) y año
    emit('mes-change', { mes: Number(m), anio: Number(a) });
  } catch (e) {
    console.warn('Error emitiendo mes-change:', e);
  }
});

// Tolerancia para evitar falsos positivos por redondeo (en horas)
const TOLERANCIA_HORAS = 0.01;
// Minutos de gracia desde la hora de inicio del turno para considerar ausencia en el mismo día
const GRACE_MINUTES = 15;

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
// Helper: buscar el turno que aplica para una fecha (devuelve el objeto turno o null)
function getTurnoParaFecha(fechaStr, assignedShifts = []) {
  if (!assignedShifts || !assignedShifts.length) return null;
  try {
    const parseLocalDate = (s) => {
      if (!s) return new Date(s);
      if (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date(s);
    };
    const target = parseLocalDate(fechaStr);
    const normalizeWeekday = (s) => {
      if (!s) return '';
      return String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    };
    for (const t of assignedShifts) {
      // comprobar rango de fechas
      const startKeys = ['fecha_inicio','fechaInicio','start','desde','fecha_desde'];
      const endKeys = ['fecha_fin','fechaFin','end','hasta','fecha_hasta','fechaFin'];
      let start = null;
      let end = null;
      for (const k of startKeys) { if (t[k]) { start = new Date(t[k]); break; } }
      for (const k of endKeys) { if (t[k]) { end = new Date(t[k]); break; } }
      if (t.dias && Array.isArray(t.dias) && t.dias.length) {
        const weekdayFull = target.toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
        const weekdayNorm = normalizeWeekday(weekdayFull).slice(0,3);
        const diasNorm = t.dias.map(dn => normalizeWeekday(dn).slice(0,3));
        if (!diasNorm.includes(weekdayNorm)) continue;
      }
      if (start && target < start) continue;
      if (end && target > end) continue;
      return t;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Helper: parsea una cadena "HH:MM - HH:MM" o "HH:MM" y devuelve la parte de inicio HH:MM (o null)
function parseHoraInicioDesdeHorario(horarioStr) {
  if (!horarioStr || typeof horarioStr !== 'string') return null;
  const parts = horarioStr.split('-').map(p => p.trim());
  if (!parts.length) return null;
  const h = parts[0];
  // Normalizar a HH:MM
  const m = h.match(/(\d{1,2}:\d{2})/);
  return m ? m[1] : null;
}

// Helper: diferencia en minutos entre horaReal - horaEsperada (ambas strings HH:MM o HH:MM:SS). Si real es antes, retorna 0
function minutosRetrasoEntre(horaEsperada, horaReal) {
  if (!horaEsperada || !horaReal) return 0;
  const toMinutes = (s) => {
    const [hh, mm] = s.split(':').map(Number);
    return (hh || 0) * 60 + (mm || 0);
  };
  try {
    const esperadoMin = toMinutes(horaEsperada);
    const realMin = toMinutes(horaReal);
    const diff = realMin - esperadoMin;
    return diff > 0 ? Math.round(diff) : 0;
  } catch (e) {
    return 0;
  }
}

// Helper: devuelve un Set con los días laborales (abreviados a 3 letras) según los turnos asignados.
// Si no hay información de días en los turnos, devuelve el conjunto por defecto: Lunes-Viernes.
function getWorkingDaysSet(assignedShifts = []) {
  const normalizeWeekday = (s) => {
    if (!s) return '';
    return String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').slice(0,3);
  };
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

  // Crear un set de fechas justificadas para búsqueda rápida
  const fechasJustificadas = new Set(
    (props.diasJustificados || []).map(dj => {
      // Normalizar la fecha: extraer solo YYYY-MM-DD del timestamp
      const fecha = dj.fecha ? dj.fecha.split('T')[0] : '';
      return fecha;
    })
  );

  // Crear un set/map de feriados cargados desde la BD
  const feriadosMap = new Map();
  (feriados.value || []).forEach(f => {
    const key = (f.fecha || '').split('T')[0];
    if (!feriadosMap.has(key)) feriadosMap.set(key, []);
    feriadosMap.get(key).push(f);
  });

  console.log('Fechas justificadas normalizadas:', Array.from(fechasJustificadas));
  console.log('Días justificados raw:', props.diasJustificados);

  console.log('Fechas justificadas (Set):', fechasJustificadas);
  console.log('Días justificados raw:', props.diasJustificados);

  for(let d=1; d<=totalDias; d++) {
    const fechaStr = new Date(anioSeleccionado.value, mesSeleccionado.value, d).toISOString().split('T')[0];
    const registroDia = marcacionesPorFecha[fechaStr];
  const esJustificado = fechasJustificadas.has(fechaStr);
  // Revisar si la fecha es un feriado registrado en la BD
  const feriadoBDs = feriadosMap.get(fechaStr) || [];
  const esFeriadoBD = feriadoBDs.length > 0;
    
    // Debug específico para días justificados
    if (esJustificado) {
      console.log(`✅ Día ${d} (${fechaStr}) está JUSTIFICADO`);
    }
    
    let entrada = registroDia && registroDia.entrada ? registroDia.entrada : undefined;
    let salida = registroDia && registroDia.salida ? registroDia.salida : undefined;
    // totalHoras y retraso: preferir valores provistos por backend, si no calcularlos localmente
    let totalHorasVal = null;
    if (registroDia && (registroDia.totalHoras !== undefined && registroDia.totalHoras !== null)) {
      const val = typeof registroDia.totalHoras === 'string' ? parseFloat(registroDia.totalHoras) : registroDia.totalHoras;
      totalHorasVal = isNaN(val) ? null : Math.round(val * 100) / 100;
    } else {
      // si tenemos entrada y salida calculamos horas entre
      if (entrada && salida) {
        const calc = horasEntre(entrada, salida);
        totalHorasVal = isNaN(calc) ? null : calc;
      }
    }

    // Retraso: buscar campo minutosRetraso o retraso en el registro; mostrar en minutos si viene como número
    let retrasoVal = null;
    if (registroDia && (registroDia.minutosRetraso !== undefined && registroDia.minutosRetraso !== null)) {
      const mr = typeof registroDia.minutosRetraso === 'string' ? parseInt(registroDia.minutosRetraso) : registroDia.minutosRetraso;
      retrasoVal = isNaN(mr) ? null : `${mr} min`;
    } else if (registroDia && (registroDia.retraso !== undefined && registroDia.retraso !== null)) {
      // si viene en otro formato, usarlo tal cual
      retrasoVal = registroDia.retraso;
    }
  // Determinar si el trabajador tenía turno asignado ese día
    const assignedShiftsForUser = props.usuario ? (props.usuario.turnos_asignados || props.usuario.turnos || props.usuario.turnosAsignados || []) : [];
    const estaAsignado = fechaTieneTurno(fechaStr, assignedShiftsForUser);
    // Calcular días laborales del usuario (ej: lun-vie) y solo calcular retraso si es día laboral
    const workingDaysSet = getWorkingDaysSet(assignedShiftsForUser);
    const weekdayFull = new Date(fechaStr).toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
    const weekdayNorm = weekdayFull.normalize('NFD').replace(/\p{Diacritic}/gu, '').slice(0,3);
    if (workingDaysSet.has(weekdayNorm)) {
      // Si no vino retraso desde backend y hay entrada, intentar calcular localmente comparando con el turno esperado
      if (!retrasoVal && entrada) {
        const turnoAplicable = getTurnoParaFecha(fechaStr, assignedShiftsForUser);
        let horaEsperada = null;
        if (turnoAplicable) {
          // diferentes nombres posibles
          horaEsperada = turnoAplicable.hora_inicio || turnoAplicable.horaInicio || parseHoraInicioDesdeHorario(turnoAplicable.horario || turnoAplicable.horario_turno || '');
        }
        if (horaEsperada) {
          const mins = minutosRetrasoEntre(horaEsperada, entrada);
          retrasoVal = mins > 0 ? `${mins} min` : '0 min';
        }
      }
    } else {
      // No es día laboral según la configuración del usuario; no calcular retraso
      retrasoVal = null;
    }
    // Si no estaba asignado, mostramos "sin registro" visualmente pero NO lo contaremos como ausencia
    let estado = 'sinregistro';
    if (estaAsignado) {
      if (entrada || salida) {
        estado = 'presente';
      } else if (esJustificado) {
        estado = 'justificada';
      } else {
        // Fecha actual vs pasada: solo marcar como injustificada si la fecha ya pasó
        const today = new Date();
        const fechaObj = new Date(fechaStr + 'T00:00:00');
        const isToday = fechaObj.toISOString().split('T')[0] === today.toISOString().split('T')[0];
        if (!isToday && fechaObj < new Date(today.toDateString())) {
          // día en el pasado => injustificada
          estado = 'injustificada';
        } else if (isToday) {
          // Si es hoy, marcar como injustificada sólo si ya pasó la hora esperada + tolerancia
          const turnoAplicable = getTurnoParaFecha(fechaStr, assignedShiftsForUser);
          let horaEsperada = null;
          if (turnoAplicable) {
            horaEsperada = turnoAplicable.hora_inicio || turnoAplicable.horaInicio || parseHoraInicioDesdeHorario(turnoAplicable.horario || turnoAplicable.horario_turno || '');
          }
          if (horaEsperada) {
            // construir datetime de hoy con horaEsperada
            const [hh, mm] = horaEsperada.split(':').map(Number);
            const expected = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hh || 0, mm || 0);
            const now = new Date();
            const cutoff = new Date(expected.getTime() + GRACE_MINUTES * 60000);
            if (now > cutoff) {
              estado = 'injustificada';
            } else {
              estado = 'sinregistro';
            }
          } else {
            // sin info de turno: mantener sin registro (no asumir ausencia durante el día)
            estado = 'sinregistro';
          }
        } else {
          // fecha en el futuro => sin registro
          estado = 'sinregistro';
        }
      }
    } else {
      estado = 'sinregistro';
    }

    dias.push({
      dia: d,
      fecha: fechaStr,
      estado,
      entrada: entrada,
      salida: salida,
      totalHoras: totalHorasVal,
      retraso: retrasoVal,
      marcacionesDia: registroDia ? registroDia.registros : [],
      // flags: preferimos marcar si viene desde registro o desde la lista de justificaciones
      justificado: !!(esJustificado || esFeriadoBD || (registroDia && (registroDia.justificada || registroDia.estado === 'AUSENCIA_JUSTIFICADA'))),
      injustificada: !!(registroDia && (registroDia.injustificada || registroDia.estado === 'AUSENCIA_INJUSTIFICADA')),
      // Si es feriado BD, preferir esa información como detalle de justificación
      // Si hay uno o varios feriados en BD, combinarlos para mostrar (y marcar irrenunciable si alguno lo es)
      justificacionDetalle: (esFeriadoBD ? (() => {
        const nombres = feriadoBDs.map(x => x.nombre).filter(Boolean);
        const combined = nombres.length ? nombres.join(' / ') : 'Feriado';
        const anyIrr = feriadoBDs.some(x => !!x.irrenunciable);
        return { nombre: combined, irrenunciable: anyIrr, items: feriadoBDs };
      })() : (esJustificado ? props.diasJustificados.find(dj => {
        const fechaNormalizada = dj.fecha ? dj.fecha.split('T')[0] : '';
        return fechaNormalizada === fechaStr;
      }) : null))
    });
  }
  // Determinar ausencias con el util: marcar días laborables sin registro como 'injustificada'
  try {
    const assignedShiftsForUser = props.usuario ? (props.usuario.turnos_asignados || props.usuario.turnos || props.usuario.turnosAsignados || []) : [];
    // No pasar días futuros al calculador de ausencias: construir array con fechas <= hoy
    const todayStr = new Date().toISOString().split('T')[0];
    const diasParaAusencias = dias.filter(d => d.fecha <= todayStr).map(d => ({
      fecha: d.fecha,
      hora_entrada: d.entrada,
      hora_salida: d.salida,
      presente: d.estado === 'presente',
      justificada: d.estado === 'justificada',
      injustificada: d.estado === 'injustificada'
    }));
    const ausInfo = calcularAusencias(diasParaAusencias, { workingDaysPerWeek: 5, excludeWeekends: true, assignedShifts: assignedShiftsForUser });
    const fechasAus = new Set(ausInfo.fechasAusentes || []);
    // Mapear los días y actualizar estado si corresponde
    const diasFinal = dias.map(d => {
      // Solo marcar como injustificada aquellos días pasados que están asignados y aparecen en fechasAus
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
  
  // Log para ver cómo se construye el arreglo de días
  console.log('diasMes con justificaciones:', dias);
  return dias;
});
// Ya no se usa estadoDia, el estado se calcula en diasMes

const tooltipDia = ref(null);
const showFeriadosModal = ref(false);
const selectedFeriados = ref([]);
const selectedFecha = ref('');
const anySelectedIrr = computed(() => (selectedFeriados.value || []).some(f => !!f.irrenunciable));
function mostrarTooltip(dia) {
  tooltipDia.value = dia;
  emit('hover-dia', dia);
}
function ocultarTooltip() {
  tooltipDia.value = null;
}
function onClickDia(dia) {
  // si tiene justificacionDetalle con items (feriados BD), mostrar modal con detalle
  const det = dia && dia.justificacionDetalle ? dia.justificacionDetalle : null;
  if (det && det.items && det.items.length) {
    selectedFeriados.value = det.items;
    selectedFecha.value = dia.fecha;
    showFeriadosModal.value = true;
    return;
  }
  // Si no hay items pero es justificada y hay detalle simple, mostrar también
  if (det && (det.nombre || det.name)) {
    selectedFeriados.value = [{ id: null, fecha: dia.fecha, nombre: det.nombre || det.name, irrenunciable: !!det.irrenunciable }];
    selectedFecha.value = dia.fecha;
    showFeriadosModal.value = true;
    return;
  }
}
function closeFeriadosModal() {
  showFeriadosModal.value = false;
  selectedFeriados.value = [];
  selectedFecha.value = '';
}
function colorDia(d) {
  // acepta tanto un objeto dia como un string estado
  let estado = typeof d === 'string' ? d : (d && d.estado ? d.estado : 'sinregistro');
  const detalle = (typeof d === 'object' && d && d.justificacionDetalle) ? d.justificacionDetalle : null;
  const isFeriado = !!(detalle && (detalle.nombre || detalle.name));
  const isIrrenunciable = !!(detalle && detalle.irrenunciable);
  return {
    'bg-green-200': estado === 'presente',
    // Feriado irrenunciable -> rosa; feriado normal -> celeste
    // usar color sólido y texto claro para irrenunciables para diferenciarlos de inasistencias
    'bg-rose-600 text-white': isFeriado && isIrrenunciable,
    'bg-sky-200': isFeriado && !isIrrenunciable,
    'bg-yellow-200': !isFeriado && estado === 'justificada',
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
