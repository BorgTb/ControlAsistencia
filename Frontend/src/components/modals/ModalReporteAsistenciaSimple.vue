<template>
  <!-- Modal de Reporte de Asistencia Simple -->
  <div v-if="mostrarModal" 
       class="fixed inset-0 z-50 flex items-center justify-center"
       style="background-color: rgba(0, 0, 0, 0.5);">
    
    <!-- Contenido del modal -->
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header del modal -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
        <div class="flex items-center space-x-3">
          <div class="text-2xl">📊</div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Reporte de Asistencia Semanal</h2>
            <p class="text-sm text-gray-600">{{ fechaInicio }} al {{ fechaFin }}</p>
          </div>
        </div>
        <button @click="cerrarModal" 
                class="text-gray-400 hover:text-gray-600 text-2xl font-bold">
          ×
        </button>
      </div>

      <!-- Contenido principal -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        
        <!-- Resumen General -->
        <div class="bg-blue-50 rounded-lg p-6 mb-6">
          <div class="flex items-center mb-4">
            <span class="text-2xl mr-3">📊</span>
            <h3 class="text-lg font-semibold text-gray-800">Resumen General</h3>
          </div>
          
          <div class="grid grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ totalTrabajadores }}</div>
              <div class="text-sm text-gray-600">Total Trabajadores</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ trabajadoresDentroLimite }}</div>
              <div class="text-sm text-gray-600">Dentro del Límite</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-red-600">{{ trabajadoresExcedenHoras }}</div>
              <div class="text-sm text-gray-600">Exceden Horas</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ promedioHorasSemana }}</div>
              <div class="text-sm text-gray-600">Promedio hrs/sem</div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Cargando datos...</p>
        </div>

        <!-- Lista de trabajadores tipo acordeón -->
        <div v-else class="space-y-4">
          
          <div v-for="trabajador in trabajadores" :key="trabajador.id" 
               class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            
            <!-- Header del trabajador (clickeable) -->
            <div @click="toggleTrabajador(trabajador.id)" 
                 class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
              
              <!-- Info del trabajador -->
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-semibold text-blue-600">{{ trabajador.iniciales }}</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ trabajador.nombre_completo }}</h4>
                  <p class="text-sm text-gray-500">RUT: {{ trabajador.rut }}</p>
                </div>
              </div>
              
              <!-- Indicadores y flecha -->
              <div class="flex items-center space-x-4">
                <!-- Horas laborales asignadas -->
                <div class="text-right min-w-[100px]">
                  <div class="flex items-baseline justify-end space-x-1">
                    <span class="text-2xl font-bold font-mono text-blue-600">
                      {{ trabajador.horas_trabajadas }}
                    </span>
                    <span class="text-sm font-medium text-gray-500">hrs</span>
                  </div>
                  <div class="text-xs text-blue-600">
                    💼 Horas asignadas
                  </div>
                </div>
                
                <!-- Flecha -->
                <div class="transform transition-transform duration-200" 
                     :class="trabajadoresExpandidos.has(trabajador.id) ? 'rotate-180' : ''">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Contenido expandible -->
            <div v-if="trabajadoresExpandidos.has(trabajador.id)" 
                 class="border-t border-gray-100 bg-gray-50">
              
              <div class="p-6 space-y-6">
                
                <!-- Estadísticas Semanales -->
                <div>
                  <div class="flex items-center mb-3">
                    <span class="text-blue-500 mr-2">📈</span>
                    <h5 class="text-lg font-semibold text-gray-800">Estadísticas Semanales</h5>
                  </div>
                  <div class="grid grid-cols-4 gap-4">
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                      <div class="text-3xl font-bold text-blue-600">
                        {{ trabajador.horas_trabajadas }}
                      </div>
                      <div class="text-sm text-gray-600 mt-1">Horas asignadas</div>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                      <div class="text-3xl font-bold text-red-600">
                        {{ trabajador.llegadas_tarde || 0 }}
                      </div>
                      <div class="text-sm text-gray-600 mt-1">Llegadas tarde</div>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                      <div class="text-3xl font-bold text-green-600">
                        {{ trabajador.dias_cumplidos || 5 }}
                      </div>
                      <div class="text-sm text-gray-600 mt-1">Días trabajados</div>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                      <div class="text-3xl font-bold text-purple-600">
                        {{ trabajador.promedio_diario || '9.0' }}
                      </div>
                      <div class="text-sm text-gray-600 mt-1">Promedio hrs/día</div>
                    </div>
                  </div>
                </div>

                <!-- Turnos Asignados -->
                <div>
                  <div class="flex items-center mb-3">
                    <span class="text-blue-500 mr-2">📅</span>
                    <h5 class="text-lg font-semibold text-gray-800">Turnos Asignados</h5>
                  </div>
                  <div class="space-y-3">
                    <div v-for="turno in trabajador.turnos || []" :key="turno.dia" 
                         class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div class="flex justify-between items-center">
                        <div>
                          <div class="font-semibold text-gray-900 text-lg">{{ turno.dia }}</div>
                          <div class="text-gray-700 text-base">{{ turno.horario }}</div>
                          <div class="text-gray-500 text-sm">{{ turno.tipo }}</div>
                        </div>
                        <div class="text-right">
                          <div class="text-2xl font-bold text-blue-600">{{ turno.horas_programadas }}h</div>
                          <div class="text-sm text-gray-500">Colación: {{ turno.colacion }}</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Si no hay turnos específicos -->
                    <div v-if="!trabajador.turnos || trabajador.turnos.length === 0" 
                         class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div class="flex justify-between items-center">
                        <div>
                          <div class="font-semibold text-gray-900 text-lg">Turno General</div>
                          <div class="text-gray-700 text-base">08:00 - 17:00</div>
                          <div class="text-gray-500 text-sm">Día</div>
                        </div>
                        <div class="text-right">
                          <div class="text-2xl font-bold text-blue-600">9.0h</div>
                          <div class="text-sm text-gray-500">Colación: 12:00 - 13:00</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del modal -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-600">
          {{ trabajadores.length }} trabajador(es) encontrado(s)
        </div>
        <div class="flex space-x-3">
          <button @click="exportarReporte" 
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <span>📄</span>
            <span>Exportar PDF</span>
          </button>
          <button @click="cerrarModal" 
                  class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useNotification } from '@/composables/useNotification';

// Props y emits
const props = defineProps({
  mostrarModal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['cerrar', 'exportar']);

// Composables
const authStore = useAuthStore();
const { mostrarNotificacion } = useNotification();

// Estado reactivo
const cargando = ref(false);
const trabajadores = ref([]);
const trabajadoresExpandidos = ref(new Set());
const fechaInicio = ref('');
const fechaFin = ref('');

// Computed properties
const totalTrabajadores = computed(() => trabajadores.value.length);

const trabajadoresDentroLimite = computed(() => {
  return trabajadores.value.filter(t => !t.excede_horas).length;
});

const trabajadoresExcedenHoras = computed(() => {
  return trabajadores.value.filter(t => t.excede_horas).length;
});

const promedioHorasSemana = computed(() => {
  if (trabajadores.value.length === 0) return '0.0';
  const totalHoras = trabajadores.value.reduce((sum, t) => sum + parseFloat(t.horas_trabajadas || 0), 0);
  return (totalHoras / trabajadores.value.length).toFixed(1);
});

// Métodos
const cerrarModal = () => {
  emit('cerrar');
};

const toggleTrabajador = (trabajadorId) => {
  if (trabajadoresExpandidos.value.has(trabajadorId)) {
    trabajadoresExpandidos.value.delete(trabajadorId);
  } else {
    trabajadoresExpandidos.value.add(trabajadorId);
  }
};

const cargarDatosReporte = async () => {
  console.log('🚀🚀🚀 MODAL REPORTE SIMPLE - INICIANDO CARGA DE DATOS DEL REPORTE 🚀🚀🚀');
  cargando.value = true;
  
  try {
    // Calcular fechas de la semana actual
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay());
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay() + 6);
    
    fechaInicio.value = primerDia.toLocaleDateString('es-CL');
    fechaFin.value = ultimoDia.toLocaleDateString('es-CL');
    
    console.log('Fechas calculadas:', fechaInicio.value, fechaFin.value);

    // Obtener token de autenticación
    const token = authStore.getToken;
    if (!token) {
      console.error('No se encontró token de autenticación');
      mostrarNotificacion('❌ Error de autenticación', 'error');
      return;
    }

    // Obtener trabajadores con sus horas laborales asignadas
    console.log('Obteniendo trabajadores desde la API...');
    const responseTrabajadores = await fetch(`${import.meta.env.VITE_API_URL}/api/userEmpresa/trabajadores`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!responseTrabajadores.ok) {
      const errorText = await responseTrabajadores.text();
      console.error('Error al obtener trabajadores:', errorText);
      mostrarNotificacion('❌ Error al cargar trabajadores', 'error');
      return;
    }

    const dataTrabajadores = await responseTrabajadores.json();
    console.log('✅ Datos de trabajadores obtenidos:', dataTrabajadores);

    if (!dataTrabajadores.data || dataTrabajadores.data.length === 0) {
      console.log('No se encontraron trabajadores en la base de datos');
      mostrarNotificacion('ℹ️ No hay trabajadores registrados', 'info');
      trabajadores.value = [];
      return;
    }

    // Procesar cada trabajador para mostrar sus horas laborales asignadas (SIN cálculos)
    const trabajadoresConHoras = dataTrabajadores.data.map((trabajador) => {
      console.log(`📋 Procesando trabajador: ${trabajador.usuario_nombre}`);
      console.log(`📋 Horas laborales en BD: ${trabajador.horas_laborales}`);
      
      // Obtener las horas laborales directamente de la base de datos
      const horasLaborales = trabajador.horas_laborales || 45;
      
      console.log(`✅ Mostrando: ${horasLaborales} hrs para ${trabajador.usuario_nombre}`);
      
      const nombreCompleto = `${trabajador.usuario_nombre || ''} ${trabajador.usuario_apellido_pat || ''} ${trabajador.usuario_apellido_mat || ''}`.trim();
      const iniciales = `${(trabajador.usuario_nombre || '').charAt(0)}${(trabajador.usuario_apellido_pat || '').charAt(0)}`;

      return {
        id: trabajador.id,
        nombre_completo: nombreCompleto || 'Sin nombre',
        rut: trabajador.usuario_rut || 'Sin RUT',
        iniciales: iniciales || '--',
        horas_trabajadas: horasLaborales.toString(), // Mostrar horas laborales de la BD
        horas_asignadas: horasLaborales,
        excede_horas: false,
        dias_cumplidos: 5,
        llegadas_tarde: 0,
        ausencias: 0,
        promedio_diario: (horasLaborales / 5).toFixed(1),
        turnos: [
          {
            dia: 'Lunes a Viernes',
            horario: '09:00 - 17:00',
            tipo: 'Día',
            horas_programadas: (horasLaborales / 5).toFixed(1),
            colacion: '14:00 - 15:00'
          }
        ],
        marcaciones_recientes: [
          {
            id: 1,
            fecha_relativa: 'Hoy',
            hora: '09:00',
            tipo: 'Entrada',
            estado: 'normal'
          },
          {
            id: 2,
            fecha_relativa: 'Ayer',
            hora: '17:30',
            tipo: 'Salida',
            estado: 'normal'
          }
        ]
      };
    });

    trabajadores.value = trabajadoresConHoras;
    console.log('🏁 DATOS FINALES - Horas laborales asignadas:', trabajadoresConHoras);
    
    // Verificar que los datos están llegando correctamente al template
    trabajadoresConHoras.forEach((t, index) => {
      console.log(`🔍 Trabajador ${index + 1}: ${t.nombre_completo} - ${t.horas_trabajadas} hrs (desde BD)`);
    });

  } catch (error) {
    console.error('Error al cargar datos del reporte:', error);
    mostrarNotificacion('❌ Error al cargar el reporte', 'error');
    trabajadores.value = [];
  } finally {
    console.log('Finalizando carga...');
    cargando.value = false;
  }
};

const exportarReporte = () => {
  emit('exportar', { trabajadores: trabajadores.value });
  mostrarNotificacion('📄 Exportando reporte...', 'info');
};

// Watchers
watch(() => props.mostrarModal, (nuevoValor) => {
  if (nuevoValor) {
    console.log('Modal abierto, cargando datos...');
    cargarDatosReporte();
    trabajadoresExpandidos.value.clear();
  }
});
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