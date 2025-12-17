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
            <h2 class="text-xl font-bold text-gray-900">Reporte de Asistencia Detallado</h2>
            <p class="text-sm text-gray-600">{{ fechaInicio }} al {{ fechaFin }}</p>
          </div>
        </div>
        
        <!-- Controles de período -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Período:</label>
            <select v-model="periodoSeleccionado" @change="cambiarPeriodo" 
                    class="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white">
              <option value="semana_actual">Semana Actual</option>
              <option value="semana_anterior">Semana Anterior</option>
              <option value="mes_actual">Mes Actual</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        
        <!-- Resumen General -->
        <div class="bg-blue-50 rounded-lg p-6 mb-6">
          <div class="flex items-center mb-4">
            <span class="text-2xl mr-3">📊</span>
            <h3 class="text-lg font-semibold text-gray-800">Resumen General</h3>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ resumenGeneral?.total_trabajadores || totalTrabajadores }}</div>
              <div class="text-sm text-gray-600">Total Trabajadores</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ resumenGeneral?.trabajadores_dentro_limite || trabajadoresDentroLimite }}</div>
              <div class="text-sm text-gray-600">Dentro del Límite</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-red-600">{{ resumenGeneral?.trabajadores_exceden_horas || trabajadoresExcedenHoras }}</div>
              <div class="text-sm text-gray-600">Exceden Horas</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ resumenGeneral?.promedio_horas_semana || promedioHorasSemana }}</div>
              <div class="text-sm text-gray-600">Promedio hrs/sem</div>
            </div>
          </div>

          <!-- Fila adicional con nuevas métricas -->
          <div class="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-blue-200">
            <div class="text-center">
              <div class="text-2xl font-bold text-indigo-600">{{ resumenGeneral?.promedio_asistencia || 0 }}%</div>
              <div class="text-sm text-gray-600">Promedio Asistencia</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ resumenGeneral?.total_ausencias_injustificadas || 0 }}</div>
              <div class="text-sm text-gray-600">Ausencias Injustificadas</div>
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
                <!-- Horas trabajadas reales vs asignadas -->
                <div class="text-right min-w-[120px]">
                  <div class="flex items-baseline justify-end space-x-1">
                    <span class="text-2xl font-bold font-mono" 
                          :class="trabajador.excede_horas ? 'text-red-600' : 'text-blue-600'">
                      {{ trabajador.horas_trabajadas_reales || trabajador.horas_trabajadas }}
                    </span>
                    <span class="text-sm font-medium text-gray-400">/</span>
                    <span class="text-lg font-semibold text-gray-600">
                      {{ trabajador.horas_laborales_asignadas || trabajador.horas_trabajadas }}
                    </span>
                    <span class="text-sm font-medium text-gray-500">hrs</span>
                  </div>
                  <div class="text-xs" 
                       :class="trabajador.excede_horas ? 'text-red-600' : 'text-blue-600'">
                    {{ trabajador.excede_horas ? '⚠️ Excede límite' : '💼 Dentro del límite' }}
                  </div>
                </div>

                <!-- Porcentaje de asistencia -->
                <div class="text-right min-w-[80px]">
                  <div class="text-xl font-bold" 
                       :class="getAsistenciaColor(trabajador.porcentaje_asistencia)">
                    {{ trabajador.porcentaje_asistencia || 100 }}%
                  </div>
                  <div class="text-xs text-gray-600">
                    🎯 Asistencia
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
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                      <div class="text-3xl font-bold text-blue-600">
                        {{ trabajador.horas_trabajadas_reales || trabajador.horas_trabajadas }}
                      </div>
                      <div class="text-sm text-gray-600 mt-1">Horas trabajadas</div>
                      <div class="text-xs text-gray-500 mt-1">
                        de {{ trabajador.horas_laborales_asignadas || trabajador.horas_trabajadas }} asignadas
                      </div>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                      <div class="text-3xl font-bold" 
                           :class="getAsistenciaColor(trabajador.porcentaje_asistencia)">
                        {{ trabajador.porcentaje_asistencia || 100 }}%
                      </div>
                      <div class="text-sm text-gray-600 mt-1">Asistencia</div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ trabajador.dias_presente || 5 }}/{{ (trabajador.dias_presente || 5) + (trabajador.dias_ausente || 0) }} días
                      </div>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                      <div class="text-3xl font-bold text-red-600">
                        {{ trabajador.llegadas_tarde || 0 }}
                      </div>
                      <div class="text-sm text-gray-600 mt-1">Llegadas tarde</div>
                      <div class="text-xs text-gray-500 mt-1">
                        Salidas anticipadas: {{ trabajador.salidas_anticipadas || 0 }}
                      </div>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                      <div class="text-3xl font-bold text-purple-600">
                        {{ trabajador.porcentaje_cumplimiento || 100 }}%
                      </div>
                      <div class="text-sm text-gray-600 mt-1">Cumplimiento</div>
                      <div class="text-xs text-gray-500 mt-1">
                        vs horas asignadas
                      </div>
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
                    <div v-for="turno in (trabajador.turnos_asignados || trabajador.turnos || defaultTurnos)" :key="turno.nombre || turno.dia" 
                         class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div class="flex justify-between items-center">
                        <div>
                          <div class="font-semibold text-gray-900 text-lg">{{ turno.nombre || turno.dia }}</div>
                          <div class="text-gray-700 text-base">{{ turno.horario }}</div>
                          <div class="text-gray-500 text-sm">{{ turno.tipo_jornada || turno.tipo || 'Ordinaria' }}</div>
                        </div>
                        <div class="text-right">
                          <div class="text-2xl font-bold text-blue-600">{{ turno.horas_programadas || turno.horas_programadas }}h</div>
                          <div class="text-sm text-gray-500">{{ turno.dias_trabajo || 5 }} días/semana</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Nueva sección: Marcaciones Recientes -->
                <div v-if="trabajador.marcaciones_recientes && trabajador.marcaciones_recientes.length > 0">
                  <div class="flex items-center mb-3">
                    <span class="text-green-500 mr-2">🕐</span>
                    <h5 class="text-lg font-semibold text-gray-800">Marcaciones Recientes</h5>
                  </div>
                  <div class="bg-white rounded-lg border border-gray-200">
                    <div class="max-h-48 overflow-y-auto">
                      <div v-for="marcacion in trabajador.marcaciones_recientes" :key="`${marcacion.fecha}-${marcacion.hora}`" 
                           class="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                               :class="getMarcacionColor(marcacion.tipo)">
                            {{ getMarcacionIcon(marcacion.tipo) }}
                          </div>
                          <div>
                            <div class="font-medium text-gray-900">{{ formatearFecha(marcacion.fecha) }}</div>
                            <div class="text-sm text-gray-500">{{ formatearTipo(marcacion.tipo) }}</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="font-mono text-lg font-semibold text-gray-900">{{ marcacion.hora }}</div>
                          <div class="text-xs" :class="marcacion.estado === 'normal' ? 'text-green-600' : 'text-orange-600'">
                            {{ marcacion.estado === 'normal' ? '✓ Normal' : '⚠ Modificada' }}
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
const resumenGeneral = ref(null);
const periodoSeleccionado = ref('semana_actual');

// Turnos por defecto para fallback
const defaultTurnos = ref([{
  nombre: 'Turno General',
  horario: '09:00 - 17:00',
  tipo_jornada: 'Ordinaria',
  dias_trabajo: 5,
  horas_programadas: 8
}]);

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
  const totalHoras = trabajadores.value.reduce((sum, t) => sum + parseFloat(t.horas_trabajadas_reales || t.horas_trabajadas || 0), 0);
  return (totalHoras / trabajadores.value.length).toFixed(1);
});

// Funciones auxiliares para colores y formato
const getAsistenciaColor = (porcentaje) => {
  if (porcentaje >= 90) return 'text-green-600';
  if (porcentaje >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

const getMarcacionColor = (tipo) => {
  switch(tipo) {
    case 'entrada': return 'bg-green-100 text-green-800';
    case 'salida': return 'bg-blue-100 text-blue-800';
    case 'colacion': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getMarcacionIcon = (tipo) => {
  switch(tipo) {
    case 'entrada': return '→';
    case 'salida': return '←';
    case 'colacion': return '☕';
    default: return '•';
  }
};

const formatearTipo = (tipo) => {
  const tipos = {
    'entrada': 'Entrada',
    'salida': 'Salida',
    'colacion': 'Colación'
  };
  return tipos[tipo] || tipo;
};

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  
  if (date.toDateString() === hoy.toDateString()) return 'Hoy';
  if (date.toDateString() === ayer.toDateString()) return 'Ayer';
  
  return date.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
};

// Función para cambiar período
const cambiarPeriodo = () => {
  console.log('📅 Cambiando período a:', periodoSeleccionado.value);
  cargarDatosReporte();
};

// Función para calcular fechas según período
const calcularFechasPeriodo = () => {
  const hoy = new Date();
  let inicio, fin;

  switch (periodoSeleccionado.value) {
    case 'semana_actual':
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay());
      fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay() + 6);
      break;
      
    case 'semana_anterior':
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay() - 7);
      fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay() - 1);
      break;
      
    case 'mes_actual':
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      break;
      
    default: // semana_actual por defecto
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay());
      fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay() + 6);
  }

  return {
    fechaInicioDisplay: inicio.toLocaleDateString('es-CL'),
    fechaFinDisplay: fin.toLocaleDateString('es-CL'),
    fechaInicioAPI: inicio.toISOString().split('T')[0],
    fechaFinAPI: fin.toISOString().split('T')[0]
  };
};

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
  console.log('🚀 MODAL REPORTE MEJORADO - INICIANDO CARGA DE DATOS 🚀');
  cargando.value = true;
  
  try {
    // Calcular fechas según el período seleccionado
    const fechas = calcularFechasPeriodo();
    
    fechaInicio.value = fechas.fechaInicioDisplay;
    fechaFin.value = fechas.fechaFinDisplay;
    
    console.log('📅 Fechas calculadas:', { 
      periodo: periodoSeleccionado.value,
      fechaInicio: fechaInicio.value, 
      fechaFin: fechaFin.value 
    });

    // Usar el nuevo endpoint mejorado
    console.log('🔍 Obteniendo reporte detallado desde la API...');
    console.log('📡 URL del endpoint:', `${import.meta.env.VITE_API_URL}/userEmpresa/reportes-asistencia-detallado`);
    console.log('📋 Parámetros enviados:', { fechaInicio: fechas.fechaInicioAPI, fechaFin: fechas.fechaFinAPI });
    
    const response = await EmpresaServices.obtenerReporteAsistenciaDetallado(
      fechas.fechaInicioAPI, 
      fechas.fechaFinAPI
    );
    
    console.log('📥 RESPUESTA COMPLETA DEL SERVIDOR:', JSON.stringify(response, null, 2));
    
    if (!response.success) {
      console.error('❌ Error en respuesta del servidor:', response.message);
      mostrarNotificacion('❌ Error al cargar el reporte', 'error');
      return;
    }

    console.log('✅ Reporte detallado obtenido:', response.data);

    // Extraer datos del response
    const { resumen, trabajadores: trabajadoresData } = response.data;
    
    // Actualizar resumen general
    resumenGeneral.value = resumen;
    
    // Procesar trabajadores con datos reales
    const trabajadoresConDatos = trabajadoresData.map((trabajador) => {
      console.log(`📋 Procesando trabajador mejorado: ${trabajador.nombre_completo}`);
      
      return {
        id: trabajador.id,
        nombre_completo: trabajador.nombre_completo || 'Sin nombre',
        rut: trabajador.rut || 'Sin RUT',
        email: trabajador.email || 'Sin email',
        iniciales: trabajador.iniciales || '--',
        
        // Horas (datos reales)
        horas_laborales_asignadas: trabajador.horas_laborales_asignadas || 45,
        horas_trabajadas: trabajador.horas_laborales_asignadas || 45, // Para compatibilidad
        horas_trabajadas_reales: trabajador.horas_trabajadas_reales || 0,
        excede_horas: trabajador.excede_horas || false,
        porcentaje_cumplimiento: trabajador.porcentaje_cumplimiento || 0,
        
        // Asistencia (datos reales)
        dias_presente: trabajador.dias_presente || 0,
        dias_ausente: trabajador.dias_ausente || 0,
        porcentaje_asistencia: trabajador.porcentaje_asistencia || 0,
        llegadas_tarde: trabajador.llegadas_tarde || 0,
        salidas_anticipadas: trabajador.salidas_anticipadas || 0,
        
        // Turnos (datos reales)
        turnos_asignados: trabajador.turnos_asignados || defaultTurnos.value,
        tipo_jornada: trabajador.tipo_jornada || 'Ordinaria',
        
        // Marcaciones (datos reales)
        total_marcaciones: trabajador.total_marcaciones || 0,
        marcaciones_recientes: trabajador.marcaciones_recientes || [],
        
        // Campos adicionales para compatibilidad
        dias_cumplidos: trabajador.dias_presente || 5,
        promedio_diario: trabajador.horas_trabajadas_reales 
          ? (trabajador.horas_trabajadas_reales / Math.max(trabajador.dias_presente, 1)).toFixed(1)
          : '0.0',
        ausencias: trabajador.dias_ausente || 0,
        turnos: trabajador.turnos_asignados || defaultTurnos.value
      };
    });

    trabajadores.value = trabajadoresConDatos;
    console.log('🏁 DATOS FINALES MEJORADOS:', {
      resumen: resumenGeneral.value,
      trabajadores: trabajadoresConDatos.length,
      sample: trabajadoresConDatos[0]
    });
    
    // Mostrar notificación de éxito
    mostrarNotificacion(`✅ Reporte cargado: ${trabajadoresConDatos.length} trabajadores`, 'success');

  } catch (error) {
    console.error('❌ Error al cargar datos del reporte mejorado:', error);
    mostrarNotificacion('❌ Error al cargar el reporte', 'error');
    
    // ❌ FALLBACK DESHABILITADO: Forzar uso de datos reales solamente
    // await cargarDatosBasicos();
    
    // Si hay error, mostrar lista vacía en lugar de datos básicos
    trabajadores.value = [];
  } finally {
    console.log('🔚 Finalizando carga del reporte mejorado...');
    cargando.value = false;
  }
};

// Función de fallback para datos básicos (versión anterior)
const cargarDatosBasicos = async () => {
  console.log('� Usando fallback a datos básicos...');
  
  try {
    // Obtener trabajadores básicos - usando cookies HTTP-only
    const responseTrabajadores = await fetch(`${import.meta.env.VITE_API_URL}/api/userEmpresa/trabajadores`, {
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
    
    if (!dataTrabajadores.data || dataTrabajadores.data.length === 0) {
      trabajadores.value = [];
      return;
    }

    // Procesar con datos básicos
    const trabajadoresBasicos = dataTrabajadores.data.map((trabajador) => {
      const horasLaborales = parseInt(trabajador.horas_laborales || '45');
      const nombreCompleto = `${trabajador.usuario_nombre || ''} ${trabajador.usuario_apellido_pat || ''} ${trabajador.usuario_apellido_mat || ''}`.trim();
      const iniciales = `${(trabajador.usuario_nombre || '').charAt(0)}${(trabajador.usuario_apellido_pat || '').charAt(0)}`;

      return {
        id: trabajador.id,
        nombre_completo: nombreCompleto || 'Sin nombre',
        rut: trabajador.usuario_rut || 'Sin RUT',
        email: trabajador.usuario_email || 'Sin email',
        iniciales: iniciales || '--',
        horas_trabajadas: horasLaborales.toString(),
        horas_laborales_asignadas: horasLaborales,
        horas_trabajadas_reales: 0, // No disponible en modo básico
        excede_horas: false,
        porcentaje_asistencia: 100, // Valor por defecto
        dias_cumplidos: 5,
        llegadas_tarde: 0,
        ausencias: 0,
        promedio_diario: (horasLaborales / 5).toFixed(1),
        turnos: defaultTurnos.value,
        marcaciones_recientes: []
      };
    });

    trabajadores.value = trabajadoresBasicos;
    
  } catch (error) {
    console.error('❌ Error en carga básica:', error);
    trabajadores.value = [];
  }
};

const exportarReporte = () => {
  emit('exportar', { trabajadores: trabajadores.value });
  mostrarNotificacion('📄 Exportando reporte...', 'info');
};

// Watchers
watch(() => props.mostrarModal, (nuevoValor) => {
  if (nuevoValor) {
    console.log('📊 Modal de reporte abierto, cargando datos...');
    periodoSeleccionado.value = 'semana_actual'; // Reset al abrir
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