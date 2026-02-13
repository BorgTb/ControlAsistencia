<template>
    <div class="min-h-screen bg-gray-100">
    
        <div class="container mx-auto p-6">
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">Asociar Trabajador a Empresa</h2>
                    <p class="text-gray-600">Gestiona las asociaciones entre trabajadores y empresas del sistema</p>
                </div>

                <!-- Formulario -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 class="text-xl font-semibold text-gray-800 mb-6">Nueva Asociación</h3>

                    <form @submit.prevent="asociarTrabajadorButton" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Select Trabajador -->
                            <div>

                                <label for="trabajadorSelect" class="block text-sm font-medium text-gray-700 mb-2">
                                    Seleccionar Trabajador
                                </label>
                                <select
                                    id="trabajadorSelect"
                                    v-model="formData.trabajadorId"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                >
                                    <option value="">Seleccione un trabajador...</option>
                                    <option 
                                        v-for="trabajador in trabajadores" 
                                        :key="trabajador.id" 
                                        :value="trabajador.id"
                                    >
                                        {{ trabajador.usuario_nombre }} {{ trabajador.usuario_apellido_pat }} {{ trabajador.usuario_apellido_mat }} - {{ trabajador.usuario_rut }}
                                        <span v-if="trabajador.id === authStore.user?.id"> (Tú)</span>
                                    </option>
                                </select>
                            </div>

                            <!-- RUT Empresa -->
                            <div>
                                <label for="rutEmpresa" class="block text-sm font-medium text-gray-700 mb-2">
                                    RUT de la Empresa A asociar
                                </label>
                                <input
                                    type="text"
                                    id="rutEmpresa"
                                    v-model="formData.rutEmpresa"
                                    placeholder="12.345.678-9"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <!-- Rol en empresa -->
                        <div>
                            <label for="rolEmpresa" class="block text-sm font-medium text-gray-700 mb-2">
                                Rol en la Empresa
                            </label>
                            <input
                                type="text"
                                id="rolEmpresa"
                                v-model="formData.rolEmpresa"
                                placeholder="Ej: Trabajador, Empleador, Jefe de Área, etc."
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>

                        <!-- Fechas -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Fecha de Inicio -->
                            <div>
                                <label for="fechaInicio" class="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Inicio
                                </label>
                                <input
                                    type="date"
                                    id="fechaInicio"
                                    v-model="formData.fechaInicio"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            <!-- Fecha de Término -->
                            <div>
                                <label for="fechaTermino" class="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Término (Opcional)
                                </label>
                                <input
                                    type="date"
                                    id="fechaTermino"
                                    v-model="formData.fechaTermino"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <!-- Mensaje de error -->
                        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div class="flex">
                                <svg class="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                </svg>
                                <p class="text-red-700 text-sm">{{ error }}</p>
                            </div>
                        </div>

                        <!-- Mensaje de éxito -->
                        <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div class="flex">
                                <svg class="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                                <p class="text-green-700 text-sm">{{ success }}</p>
                            </div>
                        </div>

                        <!-- Botón de envío -->
                        <div class="flex justify-end">
                            <button
                                type="submit"
                                :disabled="loading"
                                class="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {{ loading ? 'Asociando...' : 'Asociar Trabajador' }}
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Lista de Asociaciones -->
                <div class="bg-white rounded-lg shadow-md">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-semibold text-gray-800">Lista de Asociaciones</h3>
                            <button 
                                @click="cargarAsociaciones"
                                class="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-lg font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Actualizar
                            </button>
                        </div>
                    </div>

                    <!-- Tabla de asociaciones -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trabajador
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        RUT Trabajador
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Empresa
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        RUT Empresa
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Inicio
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-if="loadingAsociaciones">
                                    <td colspan="7" class="px-6 py-12 text-center">
                                        <div class="flex justify-center items-center">
                                            <svg class="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span class="ml-3 text-gray-500">Cargando asociaciones...</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-else-if="asociaciones.length === 0">
                                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                                        No hay asociaciones registradas
                                    </td>
                                </tr>
                                <tr v-else v-for="asociacion in asociaciones" :key="asociacion.id" class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">
                                            {{ asociacion.usuario.nombre }} {{ asociacion.usuario.apellido_pat }} {{ asociacion.usuario.apellido_mat }}
                                            <span v-if="asociacion.usuario.id === authStore.user?.id" class="ml-2 text-xs font-semibold text-indigo-600">(Tú)</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ asociacion.usuario.rut }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ asociacion.empresa.emp_nombre }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ asociacion.empresa.emp_rut }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {{ asociacion.usuario.rol_en_empresa }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ formatearFecha(asociacion.fecha_inicio) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span v-if="!asociacion.fecha_fin" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Activo
                                        </span>
                                        <span v-else class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                            Finalizado
                                        </span>
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
import { ref, onMounted } from 'vue';
import { useEmpresa } from '@/composables/use-empresa.js';
import { useEst } from '@/composables/use-est.js';
import { useAuthStore } from '@/stores/auth-store.js';

const authStore = useAuthStore();
const { obtenerAsociaciones, asociarTrabajador } = useEst();
const { obtenerTrabajadores } = useEmpresa();

// Estados reactivos
const formData = ref({
    trabajadorId: '',
    rutEmpresa: '',
    rolEmpresa: '',
    fechaInicio: '',
    fechaTermino: ''
});

const trabajadores = ref([]);
const asociaciones = ref([]);
const loading = ref(false);
const loadingAsociaciones = ref(false);
const error = ref('');
const success = ref('');

// Función para obtener todos los trabajadores
const cargarTrabajadores = async () => {
    try {
        const response = await obtenerTrabajadores();
        trabajadores.value = response || [];
    } catch (err) {
        console.error('Error al cargar trabajadores:', err);
        error.value = 'Error al cargar la lista de trabajadores';
    }
};

// Función para obtener todas las asociaciones
const cargarAsociaciones = async () => {
    loadingAsociaciones.value = true;
    try {
        const response = await obtenerAsociaciones();
        console.log(response.data);
        asociaciones.value = response.data || [];
    } catch (err) {
        console.error('Error al cargar asociaciones:', err);
        error.value = 'Error al cargar las asociaciones';
    } finally {
        loadingAsociaciones.value = false;
    }
};

// Función para asociar trabajador
const asociarTrabajadorButton = async () => {
    if (!formData.value.trabajadorId || !formData.value.rutEmpresa || !formData.value.rolEmpresa || !formData.value.fechaInicio) {
        error.value = 'Trabajador, empresa, rol y fecha de inicio son obligatorios';
        return;
    }

    loading.value = true;
    error.value = '';
    success.value = '';

    try {
        const response = await asociarTrabajador({
            usuario_id: formData.value.trabajadorId,
            rut_empresa: formData.value.rutEmpresa,
            rol_en_empresa: formData.value.rolEmpresa,
            fecha_inicio: formData.value.fechaInicio,
            fecha_fin: formData.value.fechaTermino || null
        });

        if (response.success) {
            success.value = 'Trabajador asociado exitosamente';
            
            // Limpiar formulario
            formData.value = {
                trabajadorId: '',
                rutEmpresa: '',
                rolEmpresa: '',
                fechaInicio: '',
                fechaTermino: ''
            };

            // Recargar asociaciones
            await cargarAsociaciones();
            
            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => {
                success.value = '';
            }, 3000);
        }
    } catch (err) {
        console.error('Error al asociar trabajador:', err);
        error.value = err.response?.data?.message || 'Error al asociar el trabajador';
    } finally {
        loading.value = false;
    }
};

// Función para formatear fecha
const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Cargar datos al montar el componente
onMounted(async () => {
    await cargarTrabajadores();
    await cargarAsociaciones();
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
.container {
    max-width: 1400px;
}
</style>