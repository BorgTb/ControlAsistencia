<template>
  <!-- Modal overlay -->
  <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="cerrarModal"></div>
      
      <!-- Modal panel -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                Reporte de Asistencia Semanaladasdadaadsd
              </h3>
              <p class="text-sm text-gray-500">
                Semana del {{ fechaInicio }} al {{ fechaFin }}
              </p>
            </div>
            <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal content -->
        <div class="px-6 py-4">
          <!-- Debug info -->
          <div class="mb-4 p-4 bg-blue-50 rounded">
            <p class="text-sm text-blue-700">Debug: Modal cargado correctamente</p>
            <p class="text-sm text-blue-600">Cargando: {{ cargando }}</p>
            <p class="text-sm text-blue-600">Trabajadores: {{ trabajadores.length }}</p>
          </div>

          <!-- Loading State -->
          <div v-if="cargando" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-sm text-gray-500">Cargando reporte...</p>
          </div>

          <!-- Trabajadores -->
          <div v-else>
            <div v-if="trabajadores.length === 0" class="text-center py-8">
              <p class="text-gray-500">No hay trabajadores para mostrar</p>
            </div>

            <!-- Trabajadores -->
            <div v-else class="space-y-4">
              <div v-for="trabajador in trabajadores" :key="trabajador.id" 
                   class="border rounded-lg p-4 hover:bg-gray-50">
                
                <!-- Header del Trabajador -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-blue-600">
                          {{ trabajador.iniciales }}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 class="text-lg font-medium text-gray-900">
                        {{ trabajador.nombre_completo }}
                      </h4>
                      <p class="text-sm text-gray-500">RUT: {{ trabajador.rut }}</p>
                    </div>
                  </div>
                  
                  <!-- Horas Trabajadas -->
                  <div class="text-right">
                    <div class="flex items-center space-x-2">
                      <span class="text-2xl font-bold" 
                            :class="trabajador.excede_horas ? 'text-red-600' : 'text-green-600'">
                        {{ trabajador.horas_trabajadas }}
                      </span>
                      <span class="text-sm text-gray-500">hrs</span>
                    </div>
                    <div class="text-xs text-gray-400">
                      Límite: {{ trabajador.horas_asignadas || 45 }} hrs
                    </div>
                    <div v-if="trabajador.excede_horas" class="mt-1">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ Excede límite
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Detalle de Marcaciones -->
                <div class="bg-gray-50 rounded-lg p-3">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">Detalle de Marcaciones</h5>
                  
                  <div v-if="trabajador.marcaciones && trabajador.marcaciones.length > 0" 
                       class="space-y-2">
                    <div v-for="(dia, index) in trabajador.marcaciones" :key="index"
                         class="flex items-center justify-between py-2 px-3 bg-white rounded border">
                      <div class="flex items-center space-x-3">
                        <span class="text-sm font-medium text-gray-600">
                          {{ formatearFecha(dia.fecha) }}
                        </span>
                        <span class="text-xs text-gray-400">
                          {{ dia.dia_semana }}
                        </span>
                      </div>
                      
                      <div class="flex items-center space-x-4">
                        <!-- Entrada -->
                        <div class="text-center">
                          <div class="text-xs text-gray-500">Entrada</div>
                          <div class="text-sm font-medium" 
                               :class="dia.entrada_tardia ? 'text-red-600' : 'text-green-600'">
                            {{ dia.hora_entrada || '---' }}
                          </div>
                          <div v-if="dia.entrada_tardia" class="text-xs text-red-500">
                            {{ dia.minutos_tarde }}' tarde
                          </div>
                        </div>
                        
                        <!-- Salida -->
                        <div class="text-center">
                          <div class="text-xs text-gray-500">Salida</div>
                          <div class="text-sm font-medium" 
                               :class="dia.salida_anticipada ? 'text-orange-600' : 'text-green-600'">
                            {{ dia.hora_salida || '---' }}
                          </div>
                          <div v-if="dia.salida_anticipada" class="text-xs text-orange-500">
                            {{ dia.minutos_anticipados }}' antes
                          </div>
                        </div>
                        
                        <!-- Horas del Día -->
                        <div class="text-center">
                          <div class="text-xs text-gray-500">Horas</div>
                          <div class="text-sm font-bold text-blue-600">
                            {{ dia.horas_trabajadas || '0.00' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="text-center py-4 text-gray-500">
                    <p class="text-sm">Sin marcaciones registradas</p>
                  </div>
                </div>

                <!-- Resumen de Cumplimiento -->
                <div class="mt-3 grid grid-cols-3 gap-4 text-center">
                  <div class="bg-green-50 rounded-lg p-2">
                    <div class="text-lg font-bold text-green-600">{{ trabajador.dias_cumplidos || 0 }}</div>
                    <div class="text-xs text-green-600">Días completos</div>
                  </div>
                  <div class="bg-yellow-50 rounded-lg p-2">
                    <div class="text-lg font-bold text-yellow-600">{{ trabajador.llegadas_tarde || 0 }}</div>
                    <div class="text-xs text-yellow-600">Llegadas tarde</div>
                  </div>
                  <div class="bg-red-50 rounded-lg p-2">
                    <div class="text-lg font-bold text-red-600">{{ trabajador.ausencias || 0 }}</div>
                    <div class="text-xs text-red-600">Ausencias</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="exportarReporte" 
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
            📄 Exportar PDF
          </button>
          <button @click="cerrarModal" 
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useNotification } from '@/composables/use-notification.js';
import { calcularAusencias } from '../../utils/ausencias.js';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['cerrar', 'exportar']);

const { mostrarNotificacion } = useNotification();

// Estados reactivos
const cargando = ref(false);
const trabajadores = ref([]);

// Fechas de la semana actual
const fechaInicio = ref('');
const fechaFin = ref('');

// Computed
const fechaActual = computed(() => {
  return new Date().toLocaleDateString('es-CL');
});

// Watch para cargar datos cuando se abre el modal
watch(() => props.isVisible, async (newValue) => {
  if (newValue) {
    await cargarDatosReporte();
  }
});

// Métodos
const cerrarModal = () => {
  emit('cerrar');
};

const cargarDatosReporte = async () => {
  cargando.value = true;
  
  try {
    // Calcular fechas de la semana actual
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay());
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay() + 6);
    
    fechaInicio.value = primerDia.toLocaleDateString('es-CL');
    fechaFin.value = ultimoDia.toLocaleDateString('es-CL');
    

    // Temporalmente usar datos de ejemplo para debug
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    trabajadores.value = [
      {
        id: 1,
        nombre_completo: 'Juan Pérez González',
        rut: '12.345.678-9',
        iniciales: 'JP',
        horas_trabajadas: '47.5',
        horas_asignadas: 45,
        excede_horas: true,
        dias_cumplidos: 4,
        llegadas_tarde: 1,
        ausencias: 0,
        marcaciones: [
          {
            fecha: '2025-10-14',
            dia_semana: 'Lunes',
            hora_entrada: '08:00',
            hora_salida: '17:30',
            horas_trabajadas: '8.5',
            entrada_tardia: false,
            salida_anticipada: false
          }
        ]
      }
    ];
    

    // Comentamos temporalmente la llamada a la API
    /*

    // Hacer llamada a la API para obtener trabajadores y sus datos
    // NOTA: Ya NO necesitamos obtener token de localStorage
    // Las cookies HTTP-only se envían automáticamente con credentials: 'include'

    // Obtener trabajadores
    const responseTrabajadores = await fetch('/api/usuario-empresa/trabajadores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Enviar cookies automáticamente
    });

    if (!responseTrabajadores.ok) {
      throw new Error('Error al obtener trabajadores');
    }

    const dataTrabajadores = await responseTrabajadores.json();
    
    // Procesar datos de trabajadores y calcular estadísticas
    const trabajadoresConDatos = await Promise.all(
      dataTrabajadores.data.map(async (trabajador) => {
        // Obtener horas trabajadas en la semana
        const responseHoras = await fetch(`/api/marcaciones/horas-semanales/${trabajador.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let horasSemanales = 0;
        if (responseHoras.ok) {
          const dataHoras = await responseHoras.json();
          horasSemanales = dataHoras.totalHorasSemanales || 0;
        }

        // Obtener marcaciones detalladas
        const responseMarcaciones = await fetch(`/api/marcaciones/trabajador/${trabajador.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let marcacionesDetalle = [];
        let diasCumplidos = 0;
        let llegadasTarde = 0;
        let ausencias = 0;

        if (responseMarcaciones.ok) {
          const dataMarcaciones = await responseMarcaciones.json();
          
          // Procesar marcaciones para el reporte
          marcacionesDetalle = dataMarcaciones.data?.slice(0, 7).map(marcacion => {
            const fecha = new Date(marcacion.fecha);
            const esTarde = marcacion.entrada_tardia || false;
            const esSalidaAnticipacha = marcacion.salida_anticipada || false;
            
            if (esTarde) llegadasTarde++;
            if (marcacion.hora_entrada && marcacion.hora_salida) diasCumplidos++;
            
            return {
              fecha: marcacion.fecha,
              dia_semana: fecha.toLocaleDateString('es-CL', { weekday: 'long' }),
              hora_entrada: marcacion.hora_entrada,
              hora_salida: marcacion.hora_salida,
              horas_trabajadas: marcacion.horas_trabajadas || '0.00',
              entrada_tardia: esTarde,
              salida_anticipada: esSalidaAnticipacha,
              minutos_tarde: marcacion.minutos_tarde || 0,
              minutos_anticipados: marcacion.minutos_anticipados || 0
            };
          }) || [];

          // Calcular ausencias (días sin marcaciones en la semana)
          // Usamos el util para obtener fechas no trabajadas y conteos
          const resultadoAusencias = calcularAusencias(marcacionesDetalle, { workingDaysPerWeek: 5, excludeWeekends: true, assignedShifts: trabajador.turnos_asignados || trabajador.turnos || [] });
          ausencias = Math.max(0, resultadoAusencias.totalAusencias);
          // opcional: podríamos usar resultadoAusencias.fechasAusentes para mostrar detalle en la UI
        }

        const horasAsignadas = trabajador.horas_laborales ? parseInt(trabajador.horas_laborales) : 45;
        const excedeHoras = horasSemanales > horasAsignadas;

        return {
          id: trabajador.id,
          nombre_completo: `${trabajador.usuario_nombre} ${trabajador.usuario_apellido_pat} ${trabajador.usuario_apellido_mat}`,
          rut: trabajador.usuario_rut,
          iniciales: `${trabajador.usuario_nombre?.charAt(0) || ''}${trabajador.usuario_apellido_pat?.charAt(0) || ''}`,
          horas_trabajadas: horasSemanales.toFixed(1),
          horas_asignadas: horasAsignadas,
          excede_horas: excedeHoras,
          dias_cumplidos: diasCumplidos,
          llegadas_tarde: llegadasTarde,
          ausencias: Math.max(0, ausencias),
          marcaciones: marcacionesDetalle
    */

  } catch (error) {
    console.error('Error cargando reporte:', error);
    mostrarNotificacion('❌ Error al cargar el reporte', 'error');
  } finally {
    cargando.value = false;
  }
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  });
};

const exportarReporte = () => {
  emit('exportar', { trabajadores: trabajadores.value });
  mostrarNotificacion('📄 Exportando reporte...', 'info');
};
</script>

<style scoped>
/* Estilos personalizados para el modal */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>