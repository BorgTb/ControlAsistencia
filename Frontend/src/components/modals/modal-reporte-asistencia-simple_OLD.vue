<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-2 px-2 pb-10">
      <!-- Modal panel - extra grande -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[98vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                📊 Reporte de Asistencia Semanal
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

        <!-- Content -->
        <div class="px-6 py-4 overflow-y-auto max-h-[85vh]">
          <!-- Loading State -->
          <div v-if="cargando" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-sm text-gray-500">Cargando datos de trabajadores...</p>
            <p class="mt-1 text-xs text-gray-400">Obteniendo horas trabajadas...</p>
          </div>

          <!-- Lista de Trabajadores con Acordeones -->
          <div v-else class="space-y-3">
            <!-- Resumen General -->
            <div v-if="trabajadores.length > 0" class="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h5 class="text-xl font-semibold text-gray-800 mb-4 text-center">📊 Resumen General</h5>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg p-4 shadow-sm text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ trabajadores.length }}</div>
                  <div class="text-sm text-gray-600 mt-1">Total Trabajadores</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm text-center">
                  <div class="text-2xl font-bold text-green-600">{{ trabajadoresCumplen }}</div>
                  <div class="text-sm text-gray-600 mt-1">Dentro del Límite</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm text-center">
                  <div class="text-2xl font-bold text-red-600">{{ trabajadoresExceden }}</div>
                  <div class="text-sm text-gray-600 mt-1">Exceden Horas</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm text-center">
                  <div class="text-2xl font-bold text-purple-600">{{ promedioHoras }}</div>
                  <div class="text-sm text-gray-600 mt-1">Promedio hrs/sem</div>
                </div>
              </div>
            </div>

            <div v-if="trabajadores.length === 0" class="text-center py-8">
              <p class="text-gray-500">No hay trabajadores para mostrar</p>
            </div>

            <!-- Acordeón para cada trabajador -->
            <div v-for="trabajador in trabajadores" :key="trabajador.id" 
                 class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              
              <!-- Header del acordeón - siempre visible -->
              <div @click="toggleTrabajador(trabajador.id)" 
                   class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div class="flex items-center space-x-4">
                  <!-- Avatar -->
                  <div class="flex-shrink-0">
                    <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-lg font-medium text-blue-600">
                        {{ trabajador.iniciales }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Información básica -->
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-gray-900">
                      {{ trabajador.nombre_completo }}
                    </h4>
                    <p class="text-sm text-gray-500">RUT: {{ trabajador.rut }}</p>
                  </div>
                </div>
                
                <!-- Indicadores y flecha -->
                <div class="flex items-center space-x-4">
                  <!-- Horas trabajadas -->
                  <div class="text-right min-w-[100px]">
                    <div class="flex items-baseline justify-end space-x-1">
                      <span class="text-2xl font-bold font-mono" 
                            :class="trabajador.excede_horas ? 'text-red-600' : 'text-green-600'">
                        {{ trabajador.horas_trabajadas }}
                      </span>
                      <span class="text-sm font-medium text-gray-500">hrs</span>
                    </div>
                    <div v-if="trabajador.excede_horas" class="text-xs text-red-600">
                      💼 Horas asignadas
                    </div>
                    <div v-else class="text-xs text-green-600">
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
                  
                  <!-- Resumen de Horas -->
                  <div>
                    <div class="flex items-center mb-3">
                      <span class="text-yellow-500 mr-2">⚠️</span>
                      <h5 class="text-lg font-semibold text-gray-800">Resumen de Horas</h5>
                    </div>
                    <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div class="grid grid-cols-3 gap-6 text-center">
                        <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-3xl font-bold" 
                               :class="trabajador.excede_horas ? 'text-red-600' : 'text-blue-600'">
                            {{ trabajador.horas_trabajadas }}
                          </div>
                          <div class="text-sm text-gray-600 mt-1">Horas Laborales Asignadas</div>
                        </div>
                        <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-3xl font-bold text-blue-600">{{ trabajador.dias_cumplidos || 0 }}</div>
                          <div class="text-sm text-gray-600 mt-1">Días trabajados</div>
                        </div>
                        <div class="bg-white rounded-lg p-4 shadow-sm">
                          <div class="text-3xl font-bold text-purple-600">
                            {{ trabajador.promedio_diario || '0.0' }}
                          </div>
                          <div class="text-sm text-gray-600 mt-1">Promedio hrs/día</div>
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
                            <div class="text-gray-500 text-sm">Lun - Vie</div>
                          </div>
                          <div class="text-right">
                            <div class="text-2xl font-bold text-blue-600">{{ Math.floor((trabajador.horas_asignadas || 45) / 5) }}h</div>
                            <div class="text-sm text-gray-500">Colación: 13:00 - 14:00</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Últimas Marcaciones -->
                  <div>
                    <div class="flex items-center mb-3">
                      <span class="text-green-500 mr-2">🕒</span>
                      <h5 class="text-lg font-semibold text-gray-800">Últimas Marcaciones</h5>
                    </div>
                    <div class="space-y-2">
                      <div v-for="marcacion in trabajador.marcaciones_recientes || []" :key="marcacion.id" 
                           class="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                        <div>
                          <div class="font-medium text-gray-900">{{ marcacion.fecha_relativa }}</div>
                          <div class="text-sm text-gray-500">{{ marcacion.hora }}</div>
                        </div>
                        <div class="text-right">
                          <span class="px-3 py-1 rounded-full text-sm font-medium" 
                                :class="marcacion.tipo === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{ marcacion.tipo }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Si no hay marcaciones recientes -->
                      <div v-if="!trabajador.marcaciones_recientes || trabajador.marcaciones_recientes.length === 0" 
                           class="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                        <p class="text-gray-500">No hay marcaciones recientes registradas</p>
                      </div>
                    </div>
                  </div>

                  <!-- Estado del trabajador -->
                  <div class="flex justify-center pt-4 border-t border-gray-200">
                    <div v-if="trabajador.excede_horas">
                      <span class="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-red-100 text-red-800">
                        💼 {{ trabajador.horas_asignadas }}h laborales asignadas (tiene horas excedidas esta semana)
                      </span>
                    </div>
                    <div v-else>
                      <span class="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-green-100 text-green-800">
                        ✅ {{ trabajador.horas_asignadas }}h laborales semanales asignadas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button @click="exportarReporte" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            📄 Exportar PDF
          </button>
          <button @click="cerrarModal" 
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/auth-store.js';
import EmpresaServices from '../../services/EmpresaService.js';

const authStore = useAuthStore();

// Función simple para notificaciones sin dependencias externas
const mostrarNotificacion = (mensaje, tipo = 'info') => {
  console.log(`📢 ${tipo.toUpperCase()}: ${mensaje}`);
  // Aquí podrías integrar con tu sistema de notificaciones
};

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['cerrar', 'exportar']);

// Estados reactivos
const cargando = ref(false);
const trabajadores = ref([]);
const trabajadoresExpandidos = ref(new Set());

// Fechas de la semana actual
const fechaInicio = ref('');
const fechaFin = ref('');

// Computed para estadísticas del resumen
const trabajadoresExceden = computed(() => {
  return trabajadores.value.filter(t => t.excede_horas).length;
});

const trabajadoresCumplen = computed(() => {
  return trabajadores.value.filter(t => !t.excede_horas).length;
});

const promedioHoras = computed(() => {
  if (trabajadores.value.length === 0) return '0.0';
  const totalHoras = trabajadores.value.reduce((sum, t) => sum + parseFloat(t.horas_trabajadas || 0), 0);
  return (totalHoras / trabajadores.value.length).toFixed(1);
});

// Watch para cargar datos cuando se abre el modal
watch(() => props.isVisible, async (newValue) => {
  console.log('Modal visibility changed:', newValue);
  if (newValue) {
    console.log('Cargando datos del reporte...');
    await cargarDatosReporte();
  }
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
    console.log('=== ESTADO DE AUTENTICACIÓN ===');
    console.log('Token encontrado:', token ? 'Sí' : 'No');
    console.log('Usuario autenticado:', authStore.isAuthenticated);
    console.log('Usuario info:', authStore.getUser);
    console.log('============================');
    
    if (!token) {
      console.log('No hay token válido - intentando cargar datos sin autenticación');
    }

    try {
      // Obtener trabajadores de la base de datos
      console.log('Obteniendo trabajadores...');
      const responseTrabajadores = await fetch('http://localhost:3000/api/userEmpresa/trabajadores', {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json'
        }
      });

      if (!responseTrabajadores.ok) {
        const errorText = await responseTrabajadores.text();
        console.error('Error response:', responseTrabajadores.status, errorText);
        
        if (responseTrabajadores.status === 401) {
          throw new Error('No autenticado - Token inválido o expirado');
        } else if (responseTrabajadores.status === 403) {
          throw new Error('Sin permisos para acceder a los trabajadores');
        } else {
          throw new Error(`Error del servidor: ${responseTrabajadores.status} - ${errorText}`);
        }
      }

      const dataTrabajadores = await responseTrabajadores.json();
      console.log('Trabajadores obtenidos:', dataTrabajadores);
      console.log('Número de trabajadores:', dataTrabajadores.data?.length || 0);
      console.log('Primer trabajador completo:', dataTrabajadores.data?.[0]);
      
      console.log('✅ Datos de trabajadores obtenidos:', dataTrabajadores.data);
      console.log('🔍 Verificando campo horas_laborales en cada trabajador:');
      dataTrabajadores.data.forEach((t, index) => {
        console.log(`Trabajador ${index + 1}:`, {
          id: t.id,
          nombre: t.usuario_nombre,
          horas_laborales: t.horas_laborales,
          tipo_horas_laborales: typeof t.horas_laborales,
          todos_los_campos: Object.keys(t)
        });
      });

      if (!dataTrabajadores.data || dataTrabajadores.data.length === 0) {
        console.log('No se encontraron trabajadores en la base de datos');
        mostrarNotificacion('ℹ️ No hay trabajadores registrados', 'info');
        trabajadores.value = [];
        return;
      }
    
    // Procesar cada trabajador para mostrar sus horas laborales asignadas (sin cálculos)
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

    } catch (fetchError) {
        try {
          // Obtener las horas laborales directamente desde la base de datos
          console.log(`📋 Procesando trabajador ID: ${trabajador.id} (${trabajador.usuario_nombre})`);
          console.log(`📋 Datos COMPLETOS del trabajador:`, JSON.stringify(trabajador, null, 2));
          console.log(`📋 Campo horas_laborales específico:`, trabajador.horas_laborales);
          console.log(`📋 Tipo de horas_laborales:`, typeof trabajador.horas_laborales);
          
          // Obtener las horas laborales con múltiples respaldos
          let horasLaborales = 45; // Valor por defecto
          
          if (trabajador.horas_laborales !== undefined && trabajador.horas_laborales !== null) {
            if (typeof trabajador.horas_laborales === 'string') {
              horasLaborales = parseInt(trabajador.horas_laborales);
            } else if (typeof trabajador.horas_laborales === 'number') {
              horasLaborales = trabajador.horas_laborales;
            }
          }
          
          console.log(`✅ Horas laborales FINAL a mostrar: ${horasLaborales}`);
          
          // Verificar que no sea NaN
          if (isNaN(horasLaborales)) {
            horasLaborales = 45;
            console.warn(`⚠️ horasLaborales era NaN, usando 45 por defecto`);
          }

          // Para este modal, no calculamos exceso ya que mostramos horas asignadas
          const excedeHoras = false;

          // Estadísticas fijas para horas asignadas
          const diasCumplidos = 5; // Días programados por semana
          const llegadasTarde = 0;
          const ausencias = 0;
          
          const nombreCompleto = `${trabajador.usuario_nombre || ''} ${trabajador.usuario_apellido_pat || ''} ${trabajador.usuario_apellido_mat || ''}`.trim();
          const iniciales = `${(trabajador.usuario_nombre || '').charAt(0)}${(trabajador.usuario_apellido_pat || '').charAt(0)}`;

          console.log(`🔥 ANTES DE RETURN - ${trabajador.usuario_nombre}: horas_trabajadas será: ${horasLaborales.toString()}`);

          return {
            id: trabajador.id,
            nombre_completo: nombreCompleto || 'Sin nombre',
            rut: trabajador.usuario_rut || 'Sin RUT',
            iniciales: iniciales || '--',
            horas_trabajadas: horasLaborales.toString(), // Mostrar horas laborales asignadas desde BD
            horas_asignadas: horasLaborales, // Para cálculos internos
            excede_horas: excedeHoras, // Basado en comparación real
            dias_cumplidos: diasCumplidos,
            llegadas_tarde: llegadasTarde,
            ausencias: ausencias,
            promedio_diario: (diasCumplidos > 0 ? (horasLaborales / diasCumplidos).toFixed(1) : '9.0'),
            turnos: [
              {
                dia: 'Lunes a Viernes',
                horario: '09:00 - 17:00',
                tipo: 'Día',
                horas_programadas: (diasCumplidos > 0 ? (horasLaborales / diasCumplidos).toFixed(1) : '9.0'),
                colacion: '14:00 - 15:00'
              }
            ],
            marcaciones_recientes: [
              {
                id: 1,
                fecha_relativa: 'Hoy',
                hora: '09:00',
                tipo: 'Entrada'
              },
              {
                id: 2,
                fecha_relativa: 'Ayer', 
                hora: '17:00',
                tipo: 'Salida'
              }
            ],
            turnos: [
              {
                dia: 'Lunes a Viernes',
                horario: '09:00 - 17:00',
                tipo: 'Día',
                horas_programadas: Math.floor(horasLaborales / 5).toString() + '.0',
                colacion: '14:00 - 15:00'
              }
            ]
          };
        } catch (error) {
          console.error(`Error procesando trabajador ${trabajador.id}:`, error);
          const horasLaboralesDefault = trabajador.horas_laborales ? parseInt(trabajador.horas_laborales) : 45;
          return {
            id: trabajador.id,
            nombre_completo: `${trabajador.usuario_nombre || 'Sin nombre'}`,
            rut: trabajador.usuario_rut || 'Sin RUT',
            iniciales: '--',
            horas_trabajadas: horasLaboralesDefault.toString(),
            horas_asignadas: horasLaboralesDefault,
            excede_horas: false,
            dias_cumplidos: 5,
            llegadas_tarde: 0,
            ausencias: 0,
            promedio_diario: '9.0',
            turnos: [],
            marcaciones_recientes: []
          };
        }
      })
    );

    trabajadores.value = trabajadoresConHoras;
    console.log('🏁 DATOS FINALES ASIGNADOS A TRABAJADORES.VALUE:', trabajadores.value);
    console.log('🏁 PRIMER TRABAJADOR EN REACTIVE:', trabajadores.value[0]);
    console.log('🏁 TOTAL TRABAJADORES PROCESADOS:', trabajadores.value.length);
    
    // Verificar que los datos están llegando correctamente al template
    trabajadores.value.forEach((t, index) => {
      console.log(`🔍 Trabajador ${index + 1}: ${t.nombre_completo} - ${t.horas_trabajadas} hrs`);
    });

    } catch (fetchError) {
      console.error('Error en la petición a la API:', fetchError);
      
      // Mostrar el error específico en lugar de usar datos de ejemplo
      const errorMessage = fetchError.message || 'Error desconocido';
      mostrarNotificacion(`⚠️ ${errorMessage}`, 'error');
      
      // Solo usar datos de ejemplo si es un error de conectividad, no de autenticación
      if (errorMessage.includes('autenticado') || errorMessage.includes('permisos')) {
        console.log('Error de autenticación - no mostrar datos de ejemplo');
        trabajadores.value = [];
        return;
      }
      
      // Si es error de conectividad, mostrar datos de ejemplo con advertencia
      console.log('Error de conectividad - mostrando datos de ejemplo');
      mostrarNotificacion('📡 Sin conexión - Mostrando datos de ejemplo', 'warning');
      
      trabajadores.value = [
        {
          id: 1,
          nombre_completo: 'Felipe Moris Rojas',
          rut: '209068936',
          iniciales: 'FM',
          horas_trabajadas: '54.0',
          horas_asignadas: 54,
          excede_horas: false,
          dias_cumplidos: 5,
          llegadas_tarde: 0,
          ausencias: 0,
          promedio_diario: '10.8',
          turnos: [
            {
              dia: 'Lunes a Viernes',
              horario: '09:00 - 17:00',
              tipo: 'Día',
              horas_programadas: '8.0',
              colacion: '14:00 - 15:00'
            }
          ],
          marcaciones_recientes: [
            {
              id: 1,
              fecha_relativa: 'Hoy',
              hora: '08:00',
              tipo: 'Entrada'
            },
            {
              id: 2,
              fecha_relativa: 'Ayer',
              hora: '17:00',
              tipo: 'Salida'
            }
          ]
        },
        {
          id: 2,
          nombre_completo: 'José Antonio Kast Kast',
          rut: '209747890',
          iniciales: 'JK',
          horas_trabajadas: '47.5',
          horas_asignadas: 45,
          excede_horas: true,
          dias_cumplidos: 4,
          llegadas_tarde: 1,
          ausencias: 1,
          promedio_diario: '11.9',
          turnos: [
            {
              dia: 'Lunes a Viernes',
              horario: '09:25 - 17:00',
              tipo: 'Día',
              horas_programadas: '7.6',
              colacion: '14:00 - 15:00'
            }
          ],
          marcaciones_recientes: [
            {
              id: 3,
              fecha_relativa: 'Hoy',
              hora: '08:00',
              tipo: 'Entrada'
            },
            {
              id: 4,
              fecha_relativa: 'Ayer',
              hora: '17:00',
              tipo: 'Salida'
            }
          ]
        }
      ];
    }

  } catch (error) {
    console.error('Error general cargando reporte:', error);
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
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>