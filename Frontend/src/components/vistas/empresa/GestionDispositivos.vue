<template>
    <div class="gestion-dispositivos max-w-7xl mx-auto p-4">
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Dispositivos ZK</h1>
            <p class="text-gray-600">Administra los dispositivos biométricos ZK de tu empresa</p>
        </div>

        <!-- Notificación de éxito/error -->
        <div v-if="notification.show" 
             :class="[
                 'mb-4 p-4 rounded-lg flex items-center justify-between',
                 notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
             ]">
            <span>{{ notification.message }}</span>
            <button @click="notification.show = false" class="text-xl font-bold">&times;</button>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white rounded-lg shadow p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Total Dispositivos</p>
                        <p class="text-2xl font-bold text-gray-800">{{ dispositivos.length }}</p>
                    </div>
                    <div class="text-4xl">📱</div>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Online</p>
                        <p class="text-2xl font-bold text-green-600">{{ dispositivosOnline }}</p>
                    </div>
                    <div class="text-4xl">🟢</div>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Offline</p>
                        <p class="text-2xl font-bold text-red-600">{{ dispositivosOffline }}</p>
                    </div>
                    <div class="text-4xl">🔴</div>
                </div>
            </div>
        </div>

        <!-- Formulario Crear/Editar -->
        <div class="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                {{ editando ? '✏️ Editar Dispositivo' : '➕ Registrar Nuevo Dispositivo' }}
            </h2>
            <form @submit.prevent="onSubmit">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Serial <span class="text-red-500">*</span>
                        </label>
                        <input 
                            v-model="form.serial" 
                            :disabled="editando" 
                            required 
                            class="input" 
                            placeholder="Ej: ABCD1234"
                            :class="{ 'bg-gray-100': editando }" />
                        <small class="text-gray-500 text-xs">Número de serie único del dispositivo</small>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Nombre <span class="text-red-500">*</span>
                        </label>
                        <input 
                            v-model="form.name" 
                            required 
                            class="input" 
                            placeholder="Ej: Entrada Principal" />
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Ubicación
                        </label>
                        <input 
                            v-model="form.location" 
                            class="input" 
                            placeholder="Ej: Edificio A - Piso 1 - Recepción" />
                    </div>
                </div>
                <div class="mt-6 flex gap-3">
                    <button 
                        type="submit" 
                        class="btn btn-primary" 
                        :disabled="loading">
                        <span v-if="loading">⏳ Procesando...</span>
                        <span v-else>{{ editando ? '💾 Actualizar' : '➕ Registrar' }}</span>
                    </button>
                    <button 
                        v-if="editando" 
                        type="button" 
                        class="btn btn-secondary" 
                        @click="cancelarEdicion">
                        ❌ Cancelar
                    </button>
                </div>
            </form>
        </div>

        <!-- Filtros y búsqueda -->
        <div class="mb-4 bg-white rounded-lg shadow p-4">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <input 
                        v-model="filtro.busqueda"
                        type="text"
                        class="input"
                        placeholder="🔍 Buscar por serial, nombre o ubicación..." />
                </div>
                <div>
                    <select v-model="filtro.estado" class="input">
                        <option value="">Todos los estados</option>
                        <option value="online">🟢 Online</option>
                        <option value="offline">🔴 Offline</option>
                        <option value="unknown">⚪ Desconocido</option>
                    </select>
                </div>
                <div>
                    <button @click="fetchDispositivos()" class="btn btn-secondary" :disabled="loading">
                        🔄 Actualizar
                    </button>
                </div>
            </div>
        </div>

        <!-- Tabla de dispositivos -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-800">
                    📋 Lista de Dispositivos ({{ dispositivosFiltrados.length }})
                </h2>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Serial
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ubicación
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Última Conexión
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                IP Local
                            </th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="d in dispositivosFiltrados" 
                            :key="d.serial" 
                            class="hover:bg-gray-50 transition-colors">
                            <td class="px-4 py-3">
                                <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {{ d.serial }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="font-medium text-gray-900">
                                    {{ d.nombre || 'Sin nombre' }}
                                </div>
                                <div v-if="d.autoDetected" class="text-xs text-blue-600">
                                    🤖 Auto-detectado
                                </div>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600">
                                {{ d.ubicacion || 'Sin ubicación' }}
                            </td>
                            <td class="px-4 py-3">
                                <span :class="getEstadoBadgeClass(d.mqtt_status)">
                                    {{ getEstadoTexto(d.mqtt_status) }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-xs text-gray-600">
                                <div v-if="d.mqtt_lastSeen">
                                    {{ formatearFecha(d.mqtt_lastSeen) }}
                                </div>
                                <div v-else class="text-gray-400">
                                    Nunca
                                </div>
                            </td>
                            <td class="px-4 py-3 text-xs text-gray-600">
                                <span v-if="d.ip_local" class="font-mono">{{ d.ip_local }}</span>
                                <span v-else class="text-gray-400">-</span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex gap-2 justify-center">
                                    <button 
                                        @click="editarDispositivo(d)" 
                                        class="btn-icon btn-icon-edit"
                                        title="Editar">
                                        ✏️
                                    </button>
                                    <button 
                                        @click="verComandos(d)" 
                                        class="btn-icon btn-icon-command"
                                        title="Comandos"
                                        :disabled="d.mqtt_status !== 'online'">
                                        ⚡
                                    </button>
                                    <button 
                                        @click="verUsuarios(d)" 
                                        class="btn-icon btn-icon-user"
                                        title="Gestionar Usuarios"
                                        :disabled="d.mqtt_status !== 'online'">
                                        👥
                                    </button>
                                    <button 
                                        @click="eliminarDispositivo(d)" 
                                        class="btn-icon btn-icon-delete"
                                        title="Eliminar">
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Estados de carga -->
            <div v-if="loading" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p class="mt-2 text-gray-600">Cargando dispositivos...</p>
            </div>
            
            <div v-else-if="error" class="text-center py-8 text-red-600">
                <div class="text-4xl mb-2">⚠️</div>
                <p class="font-semibold">{{ error.response?.data?.message || error.message || 'Error al cargar dispositivos' }}</p>
            </div>
            
            <div v-else-if="dispositivosFiltrados.length === 0" class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">📭</div>
                <p class="font-semibold">
                    {{ filtro.busqueda || filtro.estado ? 'No se encontraron dispositivos con esos filtros' : 'No hay dispositivos registrados' }}
                </p>
                <p class="text-sm mt-2">
                    {{ filtro.busqueda || filtro.estado ? 'Intenta cambiar los filtros' : 'Registra tu primer dispositivo usando el formulario de arriba' }}
                </p>
            </div>
        </div>

        <!-- Modal de Comandos -->
        <div v-if="modalComandos.show" 
             class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
             @click.self="cerrarModalComandos">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-800">
                            ⚡ Comandos - {{ modalComandos.dispositivo?.nombre || modalComandos.dispositivo?.serial }}
                        </h3>
                        <button @click="cerrarModalComandos" class="text-gray-400 hover:text-gray-600 text-2xl">
                            &times;
                        </button>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">
                        Serial: <span class="font-mono">{{ modalComandos.dispositivo?.serial }}</span>
                    </p>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button @click="ejecutarComando('syncTime')" class="btn-comando">
                            🕐 Sincronizar Tiempo
                        </button>
                        <button @click="ejecutarComando('getInfo')" class="btn-comando">
                            ℹ️ Obtener Información
                        </button>
                        <button @click="ejecutarComando('getUsers')" class="btn-comando">
                            👥 Ver Usuarios
                        </button>
                        <button @click="ejecutarComando('getAttendance')" class="btn-comando">
                            📊 Ver Asistencias
                        </button>
                        <button @click="ejecutarComando('restart')" class="btn-comando btn-comando-warning">
                            🔄 Reiniciar Dispositivo
                        </button>
                        <button @click="ejecutarComando('clearLogs')" class="btn-comando btn-comando-danger">
                            🗑️ Limpiar Logs
                        </button>
                    </div>

                    <!-- Resultado del comando -->
                    <div v-if="modalComandos.resultado" class="mt-6">
                        <h4 class="font-semibold text-gray-700 mb-2">Resultado:</h4>
                        <div class="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
                            <pre class="text-xs">{{ JSON.stringify(modalComandos.resultado, null, 2) }}</pre>
                        </div>
                    </div>

                    <!-- Loading del comando -->
                    <div v-if="modalComandos.loading" class="mt-6 text-center">
                        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p class="mt-2 text-sm text-gray-600">Ejecutando comando...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Usuarios -->
        <div v-if="modalUsuarios.show" 
             class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             @click.self="cerrarModalUsuarios">
            <GestionUsuariosDispositivo 
                :serial="modalUsuarios.serial" 
                @close="cerrarModalUsuarios" />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { useDispositivos } from '@/composables/useDispositivos.js';
import GestionUsuariosDispositivo from './GestionUsuariosDispositivo.vue';

const {
    dispositivos,
    loading,
    error,
    fetchDispositivos,
    crearDispositivo,
    actualizarDispositivo,
    eliminarDispositivo: eliminarDispositivoApi,
    sincronizarTiempo,
    obtenerInfo,
    obtenerUsuarios,
    obtenerAsistencia,
    reiniciar,
    limpiarLogs
} = useDispositivos();

// Estado del formulario
const form = reactive({
    serial: '',
    name: '',
    location: ''
});

const editando = ref(false);
const editSerial = ref(null);

// Filtros
const filtro = reactive({
    busqueda: '',
    estado: ''
});

// Notificaciones
const notification = reactive({
    show: false,
    type: 'success',
    message: ''
});

// Modal de comandos
const modalComandos = reactive({
    show: false,
    dispositivo: null,
    loading: false,
    resultado: null
});

// Modal de usuarios
const modalUsuarios = reactive({
    show: false,
    serial: null
});

// Auto-refresh cada 30 segundos
let refreshInterval = null;

// Computed
const dispositivosOnline = computed(() => {
    return dispositivos.value.filter(d => d.mqtt_status === 'online').length;
});

const dispositivosOffline = computed(() => {
    return dispositivos.value.filter(d => d.mqtt_status === 'offline').length;
});

const dispositivosFiltrados = computed(() => {
    let resultado = dispositivos.value;

    // Filtrar por búsqueda
    if (filtro.busqueda) {
        const busqueda = filtro.busqueda.toLowerCase();
        resultado = resultado.filter(d => 
            d.serial.toLowerCase().includes(busqueda) ||
            (d.nombre && d.nombre.toLowerCase().includes(busqueda)) ||
            (d.ubicacion && d.ubicacion.toLowerCase().includes(busqueda))
        );
    }

    // Filtrar por estado
    if (filtro.estado) {
        resultado = resultado.filter(d => d.mqtt_status === filtro.estado);
    }

    return resultado;
});

// Lifecycle
onMounted(() => {
    fetchDispositivos();
    
    // Auto-refresh cada 30 segundos
    refreshInterval = setInterval(() => {
        fetchDispositivos();
    }, 30000);
});

onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

// Métodos
const mostrarNotificacion = (tipo, mensaje) => {
    notification.type = tipo;
    notification.message = mensaje;
    notification.show = true;
    
    setTimeout(() => {
        notification.show = false;
    }, 5000);
};

const onSubmit = async () => {
    try {
        if (editando.value) {
            await actualizarDispositivo(editSerial.value, {
                name: form.name,
                location: form.location
            });
            mostrarNotificacion('success', '✅ Dispositivo actualizado correctamente');
        } else {
            await crearDispositivo({
                serial: form.serial,
                name: form.name,
                location: form.location
            });
            mostrarNotificacion('success', '✅ Dispositivo registrado correctamente');
        }
        resetForm();
    } catch (err) {
        console.error('Error en formulario:', err);
        mostrarNotificacion('error', '❌ Error: ' + (err.response?.data?.message || err.message));
    }
};

const editarDispositivo = (d) => {
    form.serial = d.serial;
    form.name = d.nombre || '';
    form.location = d.ubicacion || '';
    editando.value = true;
    editSerial.value = d.serial;
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicion = () => {
    resetForm();
};

const resetForm = () => {
    form.serial = '';
    form.name = '';
    form.location = '';
    editando.value = false;
    editSerial.value = null;
};

const eliminarDispositivo = async (d) => {
    if (confirm(`¿Estás seguro de eliminar el dispositivo "${d.nombre || d.serial}"?\n\nEsta acción no se puede deshacer.`)) {
        try {
            await eliminarDispositivoApi(d.serial);
            mostrarNotificacion('success', '✅ Dispositivo eliminado correctamente');
        } catch (err) {
            console.error('Error al eliminar:', err);
            mostrarNotificacion('error', '❌ Error al eliminar: ' + (err.response?.data?.message || err.message));
        }
    }
};

const verComandos = (d) => {
    modalComandos.show = true;
    modalComandos.dispositivo = d;
    modalComandos.resultado = null;
};

const cerrarModalComandos = () => {
    modalComandos.show = false;
    modalComandos.dispositivo = null;
    modalComandos.resultado = null;
    modalComandos.loading = false;
};

const verUsuarios = (d) => {
    modalUsuarios.serial = d.serial;
    modalUsuarios.show = true;
};

const cerrarModalUsuarios = () => {
    modalUsuarios.show = false;
    modalUsuarios.serial = null;
};

const ejecutarComando = async (comando) => {
    const serial = modalComandos.dispositivo.serial;
    modalComandos.loading = true;
    modalComandos.resultado = null;

    try {
        let resultado;
        
        switch (comando) {
            case 'syncTime':
                resultado = await sincronizarTiempo(serial);
                mostrarNotificacion('success', '✅ Tiempo sincronizado');
                break;
            case 'getInfo':
                resultado = await obtenerInfo(serial);
                break;
            case 'getUsers':
                resultado = await obtenerUsuarios(serial);
                break;
            case 'getAttendance':
                const hoy = new Date().toISOString().split('T')[0];
                resultado = await obtenerAsistencia(serial, hoy, hoy);
                break;
            case 'restart':
                if (confirm('¿Reiniciar el dispositivo?')) {
                    resultado = await reiniciar(serial);
                    mostrarNotificacion('success', '✅ Dispositivo reiniciado');
                }
                break;
            case 'clearLogs':
                if (confirm('¿Limpiar todos los logs del dispositivo?')) {
                    resultado = await limpiarLogs(serial);
                    mostrarNotificacion('success', '✅ Logs limpiados');
                }
                break;
        }

        modalComandos.resultado = resultado;
    } catch (err) {
        console.error('Error ejecutando comando:', err);
        modalComandos.resultado = {
            error: true,
            message: err.response?.data?.message || err.message
        };
        mostrarNotificacion('error', '❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
        modalComandos.loading = false;
    }
};

const getEstadoBadgeClass = (status) => {
    const base = 'px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1';
    if (status === 'online') return `${base} bg-green-100 text-green-800`;
    if (status === 'offline') return `${base} bg-red-100 text-red-800`;
    return `${base} bg-gray-100 text-gray-800`;
};

const getEstadoTexto = (status) => {
    if (status === 'online') return '🟢 Online';
    if (status === 'offline') return '🔴 Offline';
    return '⚪ Desconocido';
};

const formatearFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    const date = new Date(fecha);
    return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};
</script>

<style scoped>
.input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s;
}

.input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
}

.btn {
    padding: 0.625rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    font-size: 0.875rem;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background-color: #2563eb;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
    background-color: #e5e7eb;
    color: #374151;
}

.btn-secondary:hover:not(:disabled) {
    background-color: #d1d5db;
}

.btn-icon {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
    background-color: transparent;
}

.btn-icon:hover:not(:disabled) {
    transform: scale(1.1);
}

.btn-icon:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-icon-edit:hover:not(:disabled) {
    background-color: #dbeafe;
}

.btn-icon-command:hover:not(:disabled) {
    background-color: #fef3c7;
}

.btn-icon-user:hover:not(:disabled) {
    background-color: #e0e7ff;
}

.btn-icon-delete:hover:not(:disabled) {
    background-color: #fee2e2;
}

.btn-comando {
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    text-align: left;
}

.btn-comando:hover {
    border-color: #2563eb;
    background-color: #eff6ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-comando-warning:hover {
    border-color: #f59e0b;
    background-color: #fffbeb;
}

.btn-comando-danger:hover {
    border-color: #ef4444;
    background-color: #fef2f2;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.gestion-dispositivos > * {
    animation: fadeIn 0.3s ease-out;
}
</style>