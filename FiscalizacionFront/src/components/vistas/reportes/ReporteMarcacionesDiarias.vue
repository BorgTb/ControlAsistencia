<template>
  <div class="min-h-screen bg-gray-100">
    
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestión de Marcaciones</h1>
            <p class="text-gray-600 mt-2">Registro detallado de entradas y salidas del personal</p>
          </div>
        </div>

        <!-- Panel de Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Marcaciones Hoy</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.marcacionesHoy || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Modificadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.modificadas || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Agregadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.agregadas || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Conflictos</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.conflictos || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Total Empleados</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.totalEmpleados || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha</label>
                <input 
                  type="date" 
                  id="fecha"
                  v-model="filtros.fecha"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label for="empleado" class="block text-sm font-medium text-gray-700">Empleado</label>
                <input 
                  type="text" 
                  id="empleado"
                  v-model="filtros.busqueda"
                  placeholder="Buscar por nombre o RUT"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label for="tipoMarcacion" class="block text-sm font-medium text-gray-700">Tipo Marcación</label>
                <select 
                  id="tipoMarcacion"
                  v-model="filtros.tipo"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="colacion">Colación</option>
                  <option value="descanso">Descanso</option>
                </select>
              </div>
              <div class="flex items-end">
                <button 
                  @click="limpiarFiltros"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Limpiar
                </button>
              </div>
              <div class="flex items-end">
                <button 
                  @click="aplicarFiltros"
                  class="w-full px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Marcaciones -->
      <div class="px-4 py-6 sm:px-0">
        <!-- Data Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h3 class="text-lg font-medium text-gray-900">Registro de Marcaciones</h3>
                <p class="mt-2 text-sm text-gray-700">Mostrando {{ marcaciones.length }} de {{ marcacionesOriginales.length}} marcaciones</p>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="cargando" class="mt-8 text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p class="mt-2 text-gray-500">Cargando marcaciones...</p>
            </div>
            
            <div v-else class="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="marcacion in marcaciones" :key="marcacion.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10">
                            <div :class="marcacion.avatarColor" class="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold">
                              {{ marcacion.iniciales }}
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ marcacion.nombreTrabajador }}</div>
                            <div class="text-sm text-gray-500">{{ marcacion.rut }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ marcacion.fecha }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ marcacion.hora }}</div>
                        <div v-if="marcacion.modificada" class="text-xs text-gray-500">
                          Original: {{ marcacion.horaOriginal }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="marcacion.tipoClase" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                          {{ capitalizarTipo(marcacion.tipo) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ marcacion.metodo }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-col gap-1">
                          <span v-if="marcacion.modificada" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Modificada
                          </span>
                          <span v-if="marcacion.agregada" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Agregada Manualmente
                          </span>
                          <div v-if="marcacion.modificada || marcacion.agregada" class="text-xs text-gray-500">
                            {{ marcacion.modificadoPor }}
                            <br v-if="marcacion.fechaModificacion">
                            {{ marcacion.fechaModificacion }}
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Mensaje cuando no hay marcaciones -->
                    <tr v-if="marcaciones.length === 0 && !cargando">
                      <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p class="mt-2">No se encontraron marcaciones con los filtros aplicados</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useDataStore } from '../../../store/dataStorage.js';
import reporteService from '../../../services/reporteService.js';

// Store
const dataStore = useDataStore();

// Estados reactivos
const marcaciones = ref([]);
const marcacionesOriginales = ref([]);
const estadisticas = ref({
  marcacionesHoy: 0,
  modificadas: 0,
  agregadas: 0,
  conflictos: 0,
  totalEmpleados: 0
});
const cargando = ref(false);

// Función para obtener la fecha de hoy
const obtenerFechaHoy = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Variables para filtros - Iniciar con fecha vacía para usar el rango por defecto del backend
const filtros = ref({
  busqueda: '',
  fecha: '', // Vacío para que el backend use último mes por defecto
  tipo: ''
});

// Función para obtener las iniciales del nombre
const obtenerIniciales = (nombre) => {
  if (!nombre) return '??';
  const partes = nombre.trim().split(' ');
  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
};

// Función para obtener color de avatar aleatorio
const obtenerColorAvatar = () => {
  const colores = [
    'bg-indigo-500',
    'bg-purple-500', 
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-gray-500'
  ];
  return colores[Math.floor(Math.random() * colores.length)];
};

// Función para obtener clases CSS del badge de tipo
const obtenerClaseTipo = (tipo) => {
  const clases = {
    'entrada': 'bg-green-100 text-green-800',
    'salida': 'bg-red-100 text-red-800',
    'colacion': 'bg-yellow-100 text-yellow-800',
    'descanso': 'bg-blue-100 text-blue-800'
  };
  return clases[tipo?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Función para formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-CL');
};

// Función para capitalizar tipo
const capitalizarTipo = (tipo) => {
  if (!tipo) return '';
  const tipos = {
    'entrada': 'Entrada',
    'salida': 'Salida', 
    'colacion': 'Colación',
    'descanso': 'Descanso'
  };
  return tipos[tipo.toLowerCase()] || tipo;
};

// Función para calcular estadísticas
const calcularEstadisticas = (marcacionesData) => {
  const hoy = new Date().toISOString().split('T')[0];
  const empleadosUnicos = new Set();
  
  marcacionesData.forEach(m => {
    if (m.usuario_id) empleadosUnicos.add(m.usuario_id);
  });
  
  estadisticas.value = {
    marcacionesHoy: marcacionesData.filter(m => {
      const fechaMarcacion = new Date(m.fechaOriginal).toISOString().split('T')[0];
      return fechaMarcacion === hoy;
    }).length,
    modificadas: marcacionesData.filter(m => m.modificada).length,
    agregadas: marcacionesData.filter(m => m.agregada).length,
    conflictos: 0,
    totalEmpleados: empleadosUnicos.size
  };
};

// Función para cargar marcaciones desde el backend
const cargarMarcaciones = async () => {
  try {
    cargando.value = true;
    
    const empresaSeleccionada = dataStore.getEmpresaSeleccionada;
    
    if (!empresaSeleccionada || !empresaSeleccionada.id) {
      console.error('No hay empresa seleccionada');
      return;
    }

    // Preparar parámetros - si no hay filtro de fecha, el backend usará último mes por defecto
    const params = {
      empresa_id: empresaSeleccionada.id
    };
    
    // Si hay filtro de fecha específica, enviarlo al backend
    if (filtros.value.fecha) {
      params.fecha_inicio = filtros.value.fecha;
      params.fecha_fin = filtros.value.fecha;
    }
    
    console.log('Parámetros enviados:', params);

    // Obtener marcaciones desde el servicio de reportes
    const response = await reporteService.obtenerReporteMarcacionesDiarias(params);
    
    console.log('Respuesta de marcaciones:', response);
    
    // Transformar los datos
    const marcacionesTransformadas = [];
    
    if (response && response.success && response.data) {
      const data = response.data;
      
      // Iterar sobre cada usuario
      Object.keys(data).forEach(usuarioId => {
        const datosUsuario = data[usuarioId];
        
        if (Array.isArray(datosUsuario)) {
          datosUsuario.forEach(marcacion => {
            const nombreCompleto = `${marcacion.nombre || ''} ${marcacion.apellido || ''}`.trim();
            
            marcacionesTransformadas.push({
              id: marcacion.id,
              usuario_id: usuarioId,
              nombreTrabajador: nombreCompleto || 'Sin nombre',
              rut: marcacion.rut || 'Sin RUT',
              iniciales: obtenerIniciales(nombreCompleto),
              avatarColor: obtenerColorAvatar(),
              fecha: formatearFecha(marcacion.fecha),
              fechaOriginal: marcacion.fecha,
              hora: marcacion.hora || '00:00:00',
              horaOriginal: marcacion.hora_original || marcacion.hora,
              tipo: marcacion.tipo?.toLowerCase() || 'entrada',
              tipoOriginal: marcacion.tipo?.toLowerCase() || 'entrada',
              tipoClase: obtenerClaseTipo(marcacion.tipo),
              metodo: marcacion.metodo_registro || 'Manual',
              modificada: marcacion.modificada || false,
              agregada: marcacion.agregada_manualmente || false,
              modificadoPor: marcacion.modificado_por || '',
              fechaModificacion: marcacion.fecha_modificacion ? formatearFecha(marcacion.fecha_modificacion) : ''
            });
          });
        }
      });
    }
    
    // Ordenar por fecha y hora más recientes primero
    marcacionesTransformadas.sort((a, b) => {
      const fechaHoraA = new Date(`${a.fechaOriginal}T${a.hora}`);
      const fechaHoraB = new Date(`${b.fechaOriginal}T${b.hora}`);
      return fechaHoraB.getTime() - fechaHoraA.getTime();
    });
    
    marcacionesOriginales.value = marcacionesTransformadas;
    marcaciones.value = marcacionesTransformadas;
    
    // Aplicar filtros después de cargar
    aplicarFiltros();
    
    // Calcular estadísticas
    calcularEstadisticas(marcacionesTransformadas);
    
  } catch (error) {
    console.error('Error al cargar marcaciones:', error);
  } finally {
    cargando.value = false;
  }
};

// Función para aplicar filtros
const aplicarFiltros = () => {
  let marcacionesFiltradas = [...marcacionesOriginales.value];
  
  // Filtro por búsqueda (nombre o RUT)
  if (filtros.value.busqueda.trim()) {
    const busqueda = filtros.value.busqueda.toLowerCase().trim();
    marcacionesFiltradas = marcacionesFiltradas.filter(marcacion => 
      marcacion.nombreTrabajador.toLowerCase().includes(busqueda) ||
      marcacion.rut.toLowerCase().includes(busqueda)
    );
  }
  
  // Filtro por fecha
  if (filtros.value.fecha) {
    marcacionesFiltradas = marcacionesFiltradas.filter(marcacion => {
      const fechaMarcacion = new Date(marcacion.fechaOriginal).toISOString().split('T')[0];
      return fechaMarcacion === filtros.value.fecha;
    });
  }
  
  // Filtro por tipo
  if (filtros.value.tipo) {
    marcacionesFiltradas = marcacionesFiltradas.filter(marcacion => 
      marcacion.tipoOriginal === filtros.value.tipo
    );
  }
  
  marcaciones.value = marcacionesFiltradas;
};

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtros.value = {
    busqueda: '',
    fecha: '',
    tipo: ''
  };
  marcaciones.value = [...marcacionesOriginales.value];
};

// Watchers para aplicar filtros automáticamente
watch(() => filtros.value.busqueda, () => {
  aplicarFiltros();
});

watch(() => filtros.value.fecha, () => {
  aplicarFiltros();
});

watch(() => filtros.value.tipo, () => {
  aplicarFiltros();
});

// Cargar datos al montar el componente
onMounted(() => {
  cargarMarcaciones();
});
</script>
