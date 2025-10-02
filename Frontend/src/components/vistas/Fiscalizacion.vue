<template>
  <!-- Navbar tipo tabs moderno -->
  <div class="w-full bg-gray-50 border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4">
      <ul class="flex space-x-2">
        <li>
          <router-link
            to="/administrarempresa"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/administrarempresa' ? 'text-cyan-600 border-b-2 border-cyan-400 bg-white' : 'text-gray-500 hover:text-cyan-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
            </svg>
            Administrar empresas
          </router-link>
        </li>
        <li>
          <router-link
            to="/RolAdministracion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/RolAdministracion' ? 'text-indigo-600 border-b-2 border-indigo-400 bg-white' : 'text-gray-500 hover:text-indigo-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3v9a1 1 0 001 1h4a1 1 0 001-1v-9h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm13 0V5a5 5 0 00-10 0v2" />
            </svg>
            Administración
          </router-link>
        </li>
        <li>
          <router-link
            to="/usuarios-permisos"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/usuarios-permisos' ? 'text-amber-600 border-b-2 border-amber-400 bg-white' : 'text-gray-500 hover:text-amber-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m6 5.87a4 4 0 00-3-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            Usuarios y permisos
          </router-link>
        </li>
        <li>
          <router-link
            to="/fiscalizacion"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/fiscalizacion' ? 'text-green-600 border-b-2 border-green-400 bg-white' : 'text-gray-500 hover:text-green-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fiscalización
          </router-link>
        </li>
        <li>
          <router-link
            to="/estadisticas"
            class="inline-flex items-center px-2.5 py-2 text-xs font-medium rounded-t transition-colors duration-200 focus:outline-none"
            :class="$route.path === '/estadisticas' ? 'text-fuchsia-600 border-b-2 border-fuchsia-400 bg-white' : 'text-gray-500 hover:text-fuchsia-600'"
            exact
          >
            <svg class="w-4 h-4 mr-1 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19V6m4 13V10m4 9V4M7 19v-4M3 19v-2" />
            </svg>
            Estadísticas
          </router-link>
        </li>
      </ul>
    </nav>
  </div>

  <!-- Contenido Principal -->
  <div class="p-6 shadow-lg rounded-2xl bg-white mt-8">
    <div class="w-full max-w-[1800px] mx-auto bg-white rounded-2xl shadow-lg p-8 lg:p-12 mt-8 lg:mt-14 px-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Fiscalización</h2>
          <p class="text-gray-600">Gestión de procesos de fiscalización y control de cumplimiento</p>
        </div>
        <button
          @click="mostrarModalNuevoProcesoFiscalizacion = true"
          class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-base font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nuevo Proceso
        </button>
      </div>

      <!-- Grid de Funcionalidades -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Procesos Activos -->
        <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-green-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-green-800">Procesos Activos</h3>
              <p class="text-green-600 text-sm">{{ procesosActivos }} en curso</p>
            </div>
          </div>
          <p class="text-gray-700 text-sm mb-4">
            Procesos de fiscalización en estado activo o en progreso
          </p>
          <button class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition text-sm font-medium">
            Ver Procesos
          </button>
        </div>

        <!-- Empresas Fiscalizadas -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-blue-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-blue-800">Empresas</h3>
              <p class="text-blue-600 text-sm">{{ empresasFiscalizadas }} fiscalizadas</p>
            </div>
          </div>
          <p class="text-gray-700 text-sm mb-4">
            Empresas que han sido objeto de procesos de fiscalización
          </p>
          <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition text-sm font-medium">
            Ver Empresas
          </button>
        </div>

        <!-- Informes Generados -->
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-purple-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 00-3.87-.75M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9H9m-9 0h9"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-purple-800">Informes</h3>
              <p class="text-purple-600 text-sm">{{ informesGenerados }} completados</p>
            </div>
          </div>
          <p class="text-gray-700 text-sm mb-4">
            Informes de fiscalización generados y completados
          </p>
          <button class="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition text-sm font-medium">
            Ver Informes
          </button>
        </div>
      </div>

      <!-- Tabla de Procesos de Fiscalización -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-800">Procesos de Fiscalización Recientes</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiscalizador</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="proceso in procesosFiscalizacion" :key="proceso.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                        <span class="text-sm font-medium text-white">{{ proceso.empresa.substring(0, 2).toUpperCase() }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ proceso.empresa }}</div>
                      <div class="text-sm text-gray-500">RUT: {{ proceso.rut }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ proceso.fiscalizador }}</div>
                  <div class="text-sm text-gray-500">{{ proceso.emailFiscalizador }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ proceso.tipo }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getEstadoBadgeClass(proceso.estado)" 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ proceso.estado }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatearFecha(proceso.fechaInicio) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button class="text-green-600 hover:text-green-900 mr-3">Ver</button>
                  <button class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button class="text-red-600 hover:text-red-900">Finalizar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para nuevo proceso de fiscalización -->
  <div v-if="mostrarModalNuevoProcesoFiscalizacion" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="cerrarModalNuevoProcesoFiscalizacion">
    <div class="relative top-20 mx-auto p-5 border max-w-2xl w-full shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header del modal -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Nuevo Proceso de Fiscalización</h3>
          <button @click="cerrarModalNuevoProcesoFiscalizacion" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Formulario -->
        <form @submit.prevent="crearProcesoFiscalizacion" class="space-y-4">
          <!-- Empresa -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
            <select 
              v-model="nuevoProceso.empresaId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecciona una empresa</option>
              <option value="1">Empresa ABC Ltda.</option>
              <option value="2">Constructora XYZ S.A.</option>
              <option value="3">Servicios DEF SpA</option>
            </select>
          </div>
          
          <!-- Tipo de Fiscalización -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Fiscalización *</label>
            <select 
              v-model="nuevoProceso.tipo"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecciona el tipo</option>
              <option value="Rutinaria">Rutinaria</option>
              <option value="Por denuncia">Por denuncia</option>
              <option value="Seguimiento">Seguimiento</option>
              <option value="Especial">Especial</option>
            </select>
          </div>
          
          <!-- Fiscalizador -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fiscalizador Asignado *</label>
            <select 
              v-model="nuevoProceso.fiscalizadorId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecciona un fiscalizador</option>
              <option value="1">María González</option>
              <option value="2">Carlos Rodríguez</option>
              <option value="3">Ana López</option>
            </select>
          </div>
          
          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              v-model="nuevoProceso.descripcion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe el motivo y alcance de la fiscalización"
            ></textarea>
          </div>
          
          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="cerrarModalNuevoProcesoFiscalizacion"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="cargandoCreacion"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {{ cargandoCreacion ? 'Creando...' : 'Crear Proceso' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Estados reactivos
const procesosActivos = ref(8);
const empresasFiscalizadas = ref(25);
const informesGenerados = ref(42);
const procesosFiscalizacion = ref([]);
const mostrarModalNuevoProcesoFiscalizacion = ref(false);
const cargandoCreacion = ref(false);

// Estado para el formulario de nuevo proceso
const nuevoProceso = ref({
  empresaId: '',
  tipo: '',
  fiscalizadorId: '',
  descripcion: ''
});

// Funciones auxiliares
const getEstadoBadgeClass = (estado) => {
  const classes = {
    'En Progreso': 'bg-yellow-100 text-yellow-800',
    'Completado': 'bg-green-100 text-green-800',
    'Pendiente': 'bg-gray-100 text-gray-800',
    'Suspendido': 'bg-red-100 text-red-800'
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL');
};

// Funciones para gestión de procesos
const cerrarModalNuevoProcesoFiscalizacion = () => {
  mostrarModalNuevoProcesoFiscalizacion.value = false;
  // Limpiar formulario
  nuevoProceso.value = {
    empresaId: '',
    tipo: '',
    fiscalizadorId: '',
    descripcion: ''
  };
};

const crearProcesoFiscalizacion = async () => {
  try {
    cargandoCreacion.value = true;
    
    // Aquí iría la llamada al API
    console.log('Creando proceso de fiscalización:', nuevoProceso.value);
    
    // Simular creación exitosa
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    cerrarModalNuevoProcesoFiscalizacion();
    alert('Proceso de fiscalización creado exitosamente');
    
    // Recargar datos
    cargarProcesosFiscalizacion();
    
  } catch (error) {
    console.error('Error al crear proceso:', error);
    alert('Error al crear el proceso. Por favor, intenta nuevamente.');
  } finally {
    cargandoCreacion.value = false;
  }
};

const cargarProcesosFiscalizacion = async () => {
  try {
    // Simular datos de ejemplo
    procesosFiscalizacion.value = [
      {
        id: 1,
        empresa: 'Empresa ABC Ltda.',
        rut: '12.345.678-9',
        fiscalizador: 'María González',
        emailFiscalizador: 'maria.gonzalez@fiscalizacion.cl',
        tipo: 'Rutinaria',
        estado: 'En Progreso',
        fechaInicio: '2024-10-01'
      },
      {
        id: 2,
        empresa: 'Constructora XYZ S.A.',
        rut: '98.765.432-1',
        fiscalizador: 'Carlos Rodríguez',
        emailFiscalizador: 'carlos.rodriguez@fiscalizacion.cl',
        tipo: 'Por denuncia',
        estado: 'Completado',
        fechaInicio: '2024-09-28'
      },
      {
        id: 3,
        empresa: 'Servicios DEF SpA',
        rut: '11.222.333-4',
        fiscalizador: 'Ana López',
        emailFiscalizador: 'ana.lopez@fiscalizacion.cl',
        tipo: 'Seguimiento',
        estado: 'Pendiente',
        fechaInicio: '2024-10-03'
      }
    ];
  } catch (error) {
    console.error('Error al cargar procesos:', error);
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarProcesosFiscalizacion();
});
</script>