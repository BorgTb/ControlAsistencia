<template>
    <div class="gestion-usuarios bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <div>
                <h2 class="text-xl font-bold text-gray-800">👥 Gestión de Usuarios</h2>
                <p class="text-sm text-gray-600">
                    Dispositivo: <span class="font-mono font-medium">{{ serial }}</span>
                </p>
            </div>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors text-2xl">
                &times;
            </button>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
            <!-- Panel Izquierdo: Lista de Usuarios -->
            <div class="flex-1 flex flex-col border-r border-gray-200 min-h-[400px]">
                <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 class="font-semibold text-gray-700">Usuarios Registrados ({{ users.length }})</h3>
                    <button 
                        @click="fetchUsers" 
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        :disabled="loading">
                        <span :class="{ 'animate-spin': loading }">🔄</span> Actualizar
                    </button>
                </div>
                
                <div class="overflow-y-auto flex-1 p-0">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-gray-50 text-gray-500 font-medium sticky top-0">
                            <tr>
                                <th class="px-4 py-2">ID</th>
                                <th class="px-4 py-2">Nombre</th>
                                <th class="px-4 py-2">Rol</th>
                                <th class="px-4 py-2 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-if="loading && users.length === 0">
                                <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                                    <div class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mb-2"></div>
                                    <p>Cargando usuarios...</p>
                                </td>
                            </tr>
                            <tr v-else-if="users.length === 0">
                                <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                                    No hay usuarios registrados en este dispositivo.
                                </td>
                            </tr>
                            <tr v-for="user in users" :key="user.user_id" class="hover:bg-gray-50 group">
                                <td class="px-4 py-3 font-mono text-gray-600">{{ user.user_id }}</td>
                                <td class="px-4 py-3 font-medium text-gray-900">{{ user.name }}</td>
                                <td class="px-4 py-3 text-xs">
                                    <span :class="[
                                        'px-2 py-1 rounded-full',
                                        user.privilege === 14 
                                            ? 'bg-purple-100 text-purple-800' 
                                            : 'bg-gray-100 text-gray-600'
                                    ]">
                                        {{ getPrivilegeLabel(user.privilege) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <button 
                                        @click="onDeleteUser(user)" 
                                        class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Eliminar usuario">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Panel Derecho: Formulario de Registro -->
            <div class="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>➕</span> Nuevo Usuario
                </h3>
                
                <form @submit.prevent="onSubmit" class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ID Usuario (Número)</label>
                        <input 
                            v-model="form.user_id" 
                            type="number" 
                            min="1" 
                            required 
                            class="input w-full" 
                            placeholder="Ej: 105" />
                    </div>
                    
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input 
                            v-model="form.name" 
                            type="text" 
                            required 
                            class="input w-full" 
                            placeholder="Ej: Juan Pérez" />
                    </div>
                    
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Privilegio</label>
                        <select v-model.number="form.privilege" class="input w-full">
                            <option :value="0">Usuario Normal</option>
                            <option :value="14">Administrador</option>
                        </select>
                    </div>

                    <div class="flex items-center gap-2 pt-2">
                        <input 
                            id="finger" 
                            v-model="form.register_finger" 
                            type="checkbox" 
                            class="rounded text-blue-600 focus:ring-blue-500" />
                        <label for="finger" class="text-sm text-gray-700 select-none cursor-pointer">
                            Registrar Huella Digital ahora
                        </label>
                    </div>
                    <p class="text-xs text-gray-500 ml-6">
                        Si se activa, el dispositivo pedirá poner el dedo 3 veces.
                    </p>

                    <div class="pt-4">
                        <button 
                            type="submit" 
                            class="w-full btn btn-primary flex justify-center items-center gap-2"
                            :disabled="submitting">
                            <span v-if="submitting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            {{ submitting ? 'Enviando...' : 'Crear Usuario' }}
                        </button>
                    </div>
                </form>

                <!-- Feedback -->
                <div v-if="feedback.message" 
                     :class="[
                         'mt-4 p-3 rounded-md text-sm',
                         feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     ]">
                    {{ feedback.message }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useDispositivos } from '@/composables/useDispositivos.js';

const props = defineProps({
    serial: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['close']);

const { 
    obtenerUsuarios, 
    crearUsuario, 
    eliminarUsuario 
} = useDispositivos();

const users = ref([]);
const loading = ref(false);
const submitting = ref(false);
const feedback = reactive({ type: '', message: '' });

const form = reactive({
    user_id: '',
    name: '',
    privilege: 0,
    register_finger: false
});

onMounted(() => {
    fetchUsers();
});

const fetchUsers = async () => {
    loading.value = true;
    try {
        const data = await obtenerUsuarios(props.serial);
        console.log('Usuarios data:', data);
        // data es la respuesta resuelta del servicio: { message, data: [...], payload, ... }
        // La lista de usuarios viene en data.data (según log del usuario) o data.users o data (si fuera array directo)
        users.value = Array.isArray(data) ? data : (data.data || data.users || []);
    } catch (error) {
        console.error('Error fetching users:', error);
        showFeedback('error', 'Error al obtener usuarios. Verifique conexión.');
    } finally {
        loading.value = false;
    }
};

const onSubmit = async () => {
    if (!form.user_id || !form.name) return;
    
    submitting.value = true;
    feedback.message = ''; // Clear previous feedback

    try {
        const userData = {
            uid: parseInt(form.user_id), // ZK protocol uses uid often same as user_id for small setups
            user_id: form.user_id.toString(),
            name: form.name,
            privilege: form.privilege,
            register_finger: form.register_finger
        };

        await crearUsuario(props.serial, userData);
        
        showFeedback('success', `Usuario ${form.name} enviado al dispositivo.`);
        
        // Reset form partially
        form.user_id = '';
        form.name = '';
        form.register_finger = false;
        
        // Refresh list after a delay to allow firmware to process
        setTimeout(fetchUsers, 2000);

    } catch (error) {
        console.error('Error creating user:', error);
        showFeedback('error', 'Falló la creación del usuario. ' + (error.response?.data?.message || ''));
    } finally {
        submitting.value = false;
    }
};

const onDeleteUser = async (user) => {
    if (!confirm(`¿Eliminar al usuario ${user.name} (ID: ${user.user_id}) del dispositivo?`)) return;

    try {
        await eliminarUsuario(props.serial, user.user_id);
        showFeedback('success', 'Usuario eliminado correctamente.');
        setTimeout(fetchUsers, 1000);
    } catch (error) {
        console.error('Error deleting user:', error);
        showFeedback('error', 'Error al eliminar usuario.');
    }
};

const showFeedback = (type, message) => {
    feedback.type = type;
    feedback.message = message;
    setTimeout(() => {
        feedback.message = '';
    }, 5000);
};

const getPrivilegeLabel = (priv) => {
    return priv === 14 ? 'Admin' : 'Usuario';
};
</script>

<style scoped>
.input {
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s;
}
.input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s;
}
.btn-primary {
    background-color: #2563eb;
    color: white;
}
.btn-primary:hover:not(:disabled) {
    background-color: #1d4ed8;
}
.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Scrollbar styling */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: #f1f1f1; 
}
::-webkit-scrollbar-thumb {
    background: #c1c1c1; 
    border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8; 
}
</style>
