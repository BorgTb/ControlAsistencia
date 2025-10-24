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
          </div>
          <div class="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div class="text-2xl font-bold text-gray-600">{{ resumen.totalHorasTrabajadas }}</div>
            <div class="text-xs text-gray-700 font-medium mt-1">Total Horas Trabajadas</div>
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
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Calendario de Marcaciones</h2>
            <MarcacionesCalendario
              :usuario="trabajadorSeleccionado"
              :vista="vista"
              :marcaciones="marcaciones"
              @hover-dia="mostrarTooltipDia"
            />
          </div>
        </div>
        <!-- Tabla detalle diario -->
        <!-- Detalle Diario eliminado -->
      </div>

      <!-- Eliminado: componentes duplicados de calendario y detalle diario -->
    </main>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '../../../composables/useNotification.js';
import { useEmpresa } from '../../../composables/useEmpresa.js';
import { useAuthStore } from '../../../stores/authStore.js';
import MarcacionesCalendario from './MarcacionesCalendario.vue';
// import DetalleDiarioTable from './DetalleDiarioTable.vue';

const router = useRouter();
const { mostrarNotificacion } = useNotification();
const { obtenerTrabajadores } = useEmpresa();
const authStore = useAuthStore();

// Estados reactivos
const cargando = ref(false);
const vista = ref('mensual');
const empresas = ref([]);
const empresaSeleccionada = ref('');
const trabajadores = ref([]);
const trabajadorSeleccionado = ref(null);
const marcaciones = ref([]);

const resumen = computed(() => {
  // console.log('Marcaciones para cálculo:', JSON.stringify(marcaciones.value, null, 2));
  if (!marcaciones.value.length) return {
    totalDiasTrabajados: 0,
    ausenciasJustificadas: 0,
    ausenciasInjustificadas: 0,
    totalHorasTrabajadas: '0.00',
    porcentajeAsistencia: 0,
    promedioHoraEntrada: '--:--',
    promedioHoraSalida: '--:--'
  };
  // Usar directamente los campos entrada/salida de cada día
  let sumaHoras = 0;
  let entradasTotales = [];
  let salidasTotales = [];
  let diasTrabajados = 0;
  marcaciones.value.forEach(dia => {
    if (dia.entrada && dia.salida) {
      entradasTotales.push(dia.entrada);
      salidasTotales.push(dia.salida);
      // Calcular diferencia en horas
      const [h1, m1, s1] = dia.entrada.split(':').map(Number);
      const [h2, m2, s2] = dia.salida.split(':').map(Number);
      const minEntrada = h1 * 60 + m1 + (s1 || 0) / 60;
      const minSalida = h2 * 60 + m2 + (s2 || 0) / 60;
      let horas = (minSalida - minEntrada) / 60;
      if (horas < 0) horas = 0;
      sumaHoras += horas;
      diasTrabajados++;
    }
  });
  const totalHorasTrabajadas = sumaHoras.toFixed(2);
  const porcentajeAsistencia = marcaciones.value.length ? Math.round((diasTrabajados / marcaciones.value.length) * 100) : 0;
  // Promedio de entrada/salida (mediana)
  function calcularPromedio(horasArray) {
    if (!horasArray.length) return '--:--';
    // Convertir a minutos para ordenar
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
  // Ausencias (si tuvieras flags de justificada/injustificada a nivel de día)
  const ausenciasJustificadas = marcaciones.value.filter(m => m.justificada).length;
  const ausenciasInjustificadas = marcaciones.value.filter(m => m.injustificada).length;
  return {
    totalDiasTrabajados: diasTrabajados,
    ausenciasJustificadas,
    ausenciasInjustificadas,
    totalHorasTrabajadas,
    porcentajeAsistencia,
    promedioHoraEntrada,
    promedioHoraSalida
  };
});

const filtros = ref({
  busqueda: '',
  asistencia: '',
  fechaInicio: ''
});

function mostrarTooltipDia(dia) {
  // Aquí podrías mostrar un tooltip con la info del día
}

function exportarReporte() {
  mostrarNotificacion('📄 Exportando reporte a PDF...', 'info');
}

function volverReportes() {
  router.push({ name: 'EmpresaReportes' });
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
    console.log('Rut de empresa usado para la petición:', empresaSeleccionada.value);
    const lista = await obtenerTrabajadores(empresaSeleccionada.value);
    console.log('Respuesta de la API de trabajadores:', lista);
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
}

watch(trabajadorSeleccionado, async (nuevoTrabajador) => {
  if (nuevoTrabajador) {
    // Usar el id de la relación usuario-empresa para la consulta de marcaciones
    await cargarMarcacionesTrabajador(nuevoTrabajador.id);
  }
});

// trabajadorId ahora es usuario_empresa_id
async function cargarMarcacionesTrabajador(usuarioEmpresaId) {
  cargando.value = true;
  try {
    // Puedes ajustar el límite según la vista (mensual/anual)
    const limite = vista.value === 'mensual' ? 31 : 365;
    console.log('[Marcaciones] usuario_empresa_id usado en consulta:', usuarioEmpresaId);
  const response = await import('../../../services/EmpresaService.js').then(m => m.default.obtenerMarcacionesTrabajador(usuarioEmpresaId, limite));
  console.log('[Marcaciones] Respuesta cruda del backend:', response);
  // console.log('Marcaciones crudas recibidas:', response.data);
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
  // console.log('[Marcaciones] Array final para calendario:', marcaciones.value);
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
