<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Header simple para probar -->
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Estadísticas del Sistema - Versión de Prueba</h1>
        <p class="text-gray-600">Probando si el componente se renderiza correctamente</p>
        <p v-if="ultimaActualizacion" class="text-sm text-gray-500 mt-2">
          Última actualización: {{ ultimaActualizacion }}
        </p>
      </div>
      
      <!-- Mostrar estado de carga -->
      <div v-if="cargando" class="text-center py-8">
        <p class="text-gray-600">Cargando estadísticas...</p>
      </div>
      
      <!-- Mostrar datos básicos -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-blue-600">Total Usuarios</h3>
          <p class="text-2xl font-bold">{{ estadisticas.totalUsuarios || 0 }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-green-600">Total Empresas</h3>
          <p class="text-2xl font-bold">{{ estadisticas.totalEmpresas || 0 }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-purple-600">Marcaciones Hoy</h3>
          <p class="text-2xl font-bold">{{ estadisticas.marcacionesHoy || 0 }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-orange-600">Sesiones Activas</h3>
          <p class="text-2xl font-bold">{{ estadisticas.sesionesActivas || 0 }}</p>
        </div>
      </div>
      
      <!-- Botón de actualizar -->
      <div class="mt-6">
        <button 
          @click="obtenerEstadisticas"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          :disabled="cargando"
        >
          {{ cargando ? 'Cargando...' : 'Actualizar' }}
        </button>
      </div>
      
      <!-- Debug info -->
      <div class="mt-6 bg-gray-800 text-white p-4 rounded text-sm">
        <h4 class="font-bold mb-2">Debug Info:</h4>
        <pre>{{ JSON.stringify(estadisticas, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { apiClient } from '@/config/axios-config';

// Estados reactivos
const estadisticas = ref({
  totalUsuarios: 0,
  totalEmpresas: 0,
  marcacionesHoy: 0,
  sesionesActivas: 0,
  usuariosPorRol: {},
  actividadReciente: [],
  resumen: []
});
const cargando = ref(false);
const ultimaActualizacion = ref(null);

// Función para obtener estadísticas
const obtenerEstadisticas = async () => {
  try {
    cargando.value = true;
    console.log('📊 Obteniendo estadísticas generales del sistema...');
    
    // Obtener estadísticas generales desde el backend
    const response = await apiClient.get("/api/estadisticas/general");
    
    console.log('📈 Respuesta del servidor:', response.data);
    
    if (response.data.success) {
      estadisticas.value = response.data.data;
      ultimaActualizacion.value = new Date().toLocaleTimeString('es-CL');
      console.log('✅ Estadísticas cargadas exitosamente:', estadisticas.value);
    } else {
      console.error('❌ Error al obtener estadísticas:', response.data.message);
      // Usar datos por defecto si hay error
      cargarEstadisticasPorDefecto();
    }
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    console.error('❌ Status del error:', error.response?.status);
    console.error('❌ Detalles del error:', error.response?.data);
    // Usar datos por defecto si hay error de conexión
    cargarEstadisticasPorDefecto();
  } finally {
    cargando.value = false;
  }
};

// Función para cargar estadísticas por defecto en caso de error
const cargarEstadisticasPorDefecto = () => {
  estadisticas.value = {
    totalUsuarios: 0,
    totalEmpresas: 0,
    marcacionesHoy: 0,
    sesionesActivas: 0,
    usuariosPorRol: {
      admin: 0,
      empleador: 0,
      fiscalizador: 0,
      trabajador: 0
    },
    actividadReciente: [],
    resumen: [
      { metrica: 'Usuarios Activos', valorActual: 0, mesAnterior: 0, cambio: '0.0' },
      { metrica: 'Marcaciones Diarias', valorActual: 0, mesAnterior: 0, cambio: '0.0' },
      { metrica: 'Empresas Activas', valorActual: 0, mesAnterior: 0, cambio: '0.0' },
      { metrica: 'Sesiones Promedio', valorActual: 0, mesAnterior: 0, cambio: '0.0' }
    ]
  };
  ultimaActualizacion.value = new Date().toLocaleTimeString('es-CL');
};

// Cargar estadísticas al montar el componente
onMounted(() => {
  console.log('🔄 Componente montado, cargando estadísticas...');
  obtenerEstadisticas();
});
</script>