<template>
  <AdminNavbar />
  
  <!-- Contenido Principal -->
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">Usuarios en el sistema</h2>
      </div>
      
      <!-- Campo de búsqueda -->
      <div class="mb-4 flex gap-3 items-center">
        <div class="flex-1 relative">
          <input
            v-model="busquedaTexto"
            type="text"
            placeholder="Buscar por nombre, apellido, email, rol, RUT o estado..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <div class="text-sm text-gray-500">
          {{ usuariosFiltrados.length }} de {{ usuarios.length }} usuarios
        </div>
      </div>
      <div class="h-96 overflow-auto border border-gray-200 rounded-lg">
        <div class="overflow-x-auto">
          <!-- La tabla ahora abarca casi todo el ancho de la página, pero mantiene márgenes laterales en blanco para un diseño limpio -->
          <table class="w-full text-sm border-separate border-spacing-0 rounded-2xl overflow-hidden bg-white">
            <thead class="sticky top-0 z-10 shadow-sm">
              <tr class="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700">
                <th class="p-4 font-semibold text-left rounded-tl-2xl">ID</th>
                <th class="p-4 font-semibold text-left">Nombre</th>
                <th class="p-4 font-semibold text-left">Apellido Paterno</th>
                <th class="p-4 font-semibold text-left">Apellido Materno</th>
                <th class="p-4 font-semibold text-left">Email</th>
                <th class="p-4 font-semibold text-left">Rol</th>
                <th class="p-4 font-semibold text-left">RUT</th>
                <th class="p-4 font-semibold text-left">Estado</th>
                <th class="p-4 font-semibold text-left">Creado</th>
                <th class="p-4 font-semibold text-center rounded-tr-2xl">Acciones</th>
              </tr>
            </thead>
            <tbody>
            <template v-if="usuariosFiltrados.length > 0">
              <tr
                v-for="u in usuariosFiltrados"
                :key="u.id"
                class="hover:bg-blue-100 transition border-b border-gray-200"
              >
                <td class="p-4">{{ u.id }}</td>
                <td class="p-4">{{ u.nombre }}</td>
                <td class="p-4">{{ u.apellido_pat }}</td>
                <td class="p-4">{{ u.apellido_mat }}</td>
                <td class="p-4">{{ u.email }}</td>
                <td class="p-4">
                  <!-- Solo muestra el select y botones si el usuario está en modo edición -->
                  <template v-if="usuarioEditando === u.id">
                    <select
                      v-model="rolEditTemp"
                      class="border rounded px-2 py-1 bg-white text-gray-700"
                    >
                      <option value="admin">Admin</option>
                      <option value="trabajador">Trabajador</option>
                      <option value="empleador">Empleador</option>
                    </select>
                  </template>
                  <template v-else>
                    {{ u.rol }}
                  </template>
                </td>
                <td class="p-4">{{ u.rut }}</td>
                <td class="p-4">
                  <template v-if="usuarioEditando === u.id">
                    <div class="flex gap-2 items-center">
                      <select
                        v-model="estadoEditTemp"
                        class="border rounded px-2 py-1 bg-white text-gray-700"
                      >
                        <option value="1">Activo</option>
                        <option value="0">Inactivo</option>
                      </select>
                      <button
                        class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        @click="confirmarCambios(u.id)"
                      >Guardar</button>
                      <button
                        class="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        @click="cancelarEdicionEstado()"
                      >Cancelar</button>
                    </div>
                  </template>
                  <template v-else>
                    {{ u.estado === 1 ? 'Activo' : 'Inactivo' }}
                  </template>
                </td>
                <td class="p-4">{{ formatearFecha(u.created_at) }}</td>
                <td class="p-4 flex justify-center gap-3">
                  <!-- Botón para activar modo edición del usuario -->
                  <button
                    class="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-200 transition"
                    title="Editar"
                    @click="iniciarEdicionEstado(u)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l-4 4v4h4l10-10-4-4-10 10z"/>
                    </svg>
                    <span class="hidden sm:inline">Editar</span>
                  </button>
                  
                  <!-- Botón para unir trabajador a empresa -->
                  <!-- Solo se muestra para usuarios con rol "trabajador" que no tengan empresa asignada -->
                  <button
                    v-if="u.rol === 'trabajador' && !tieneEmpresaAsignada(u.id)"
                    class="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200 hover:bg-green-200 transition"
                    title="Unir a empresa"
                    @click="abrirModalUnirEmpresa(u)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                    <span class="hidden sm:inline">Unir</span>
                  </button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="10" class="py-8 text-center text-gray-400 text-lg">
                {{ busquedaTexto ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados.' }}
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </div>
  <!-- Se eliminó el bloque de UI "Unir trabajador a empresa" por petición del usuario -->
</template>


<script setup>

import { ref, onMounted, computed } from "vue";
import { useNotification } from "@/composables/useNotification.js";
import { useAuth } from '@/composables/useAuth.js';
import AdminNavbar from '@/components/shared/AdminNavbar.vue';
import { apiClient } from '@/config/axios-config';

// ========== VARIABLES REACTIVAS ==========
const usuarios = ref([]);

// Variables para filtrado de usuarios
const busquedaTexto = ref('');

// Computed property para filtrar usuarios automáticamente
const usuariosFiltrados = computed(() => {
  if (!busquedaTexto.value.trim()) {
    return usuarios.value;
  }

  const textoBusqueda = busquedaTexto.value.toLowerCase().trim();
  
  return usuarios.value.filter(usuario => {
    const nombre = (usuario.nombre || '').toLowerCase();
    const apellidoPat = (usuario.apellido_pat || '').toLowerCase();
    const apellidoMat = (usuario.apellido_mat || '').toLowerCase();
    const email = (usuario.email || '').toLowerCase();
    const rol = (usuario.rol || '').toLowerCase();
    const rut = (usuario.rut || '').toString().toLowerCase();
    const estado = usuario.estado === 1 ? 'activo' : 'inactivo';
    
    return nombre.includes(textoBusqueda) ||
           apellidoPat.includes(textoBusqueda) ||
           apellidoMat.includes(textoBusqueda) ||
           email.includes(textoBusqueda) ||
           rol.includes(textoBusqueda) ||
           rut.includes(textoBusqueda) ||
           estado.includes(textoBusqueda);
  });
});

// ========== COMPOSABLES ==========
const { showSuccess, showError } = useNotification();

// Variables para edición de usuarios
// Variable para guardar el id del usuario que está en modo edición
// Si es null, ningún usuario está siendo editado
const usuarioEditando = ref(null);
const estadoEditTemp = ref(null);
const rolEditTemp = ref(null);

// Variables para modal de unir trabajador a empresa
// Controla la visibilidad del modal de unión trabajador-empresa
const mostrarModalUnirEmpresa = ref(false);
// Almacena la información del usuario seleccionado para unir a empresa
const usuarioSeleccionado = ref(null);
// Lista de empresas disponibles para asignar al trabajador
const empresasDisponibles = ref([]);
// ID de la empresa seleccionada en el modal
const empresaSeleccionada = ref('');
// Estado de carga para mostrar feedback visual al usuario
const cargandoEmpresas = ref(false);
const cargandoUnion = ref(false);
// Cache de relaciones usuario-empresa para optimizar rendimiento
// Evita hacer múltiples consultas al backend para verificar asignaciones
const relacionesUsuarioEmpresa = ref([]);

// ========== FUNCIONES DE EDICIÓN DE USUARIOS ==========

/**
 * Inicia el modo de edición para un usuario específico
 * Permite editar el rol y estado del usuario inline en la tabla
 * @param {Object} u - Objeto usuario con sus propiedades
 */
function iniciarEdicionEstado(u) {
  usuarioEditando.value = u.id;
  estadoEditTemp.value = String(u.estado);
  rolEditTemp.value = u.rol; // Inicializa el select de rol con el valor actual
  // Si agregas más campos editables, inicialízalos aquí con el valor actual de la base de datos
}

/**
 * Cancela la edición actual y restaura el estado original
 * Limpia todas las variables temporales de edición
 */
function cancelarEdicionEstado() {
  usuarioEditando.value = null;
  estadoEditTemp.value = null;
  rolEditTemp.value = null;
}

/**
 * Confirma y guarda los cambios realizados al usuario
 * Actualiza tanto el estado como el rol del usuario en el backend
 * @param {number} id - ID del usuario a actualizar
 */
async function confirmarCambios(id) {
  try {
    // Actualizar estado del usuario en el backend
    await apiClient.put(`/user/usuarios/${id}/estado`, { estado: estadoEditTemp.value });
    
    // Actualizar rol del usuario en el backend
    await apiClient.put(`/user/usuarios/${id}/rol`, { rol: rolEditTemp.value });
    
    // Actualizar la UI local para reflejar los cambios inmediatamente
    // Esto evita tener que recargar toda la lista de usuarios
    const usuario = usuarios.value.find(u => u.id === id);
    if (usuario) {
      usuario.estado = Number(estadoEditTemp.value);
      usuario.rol = rolEditTemp.value;
    }
    
    // Limpiar estado de edición
    usuarioEditando.value = null;
    estadoEditTemp.value = null;
    rolEditTemp.value = null;
    
    console.log('Usuario actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    alert('Error al actualizar los datos del usuario');
  }
}

// ========== FUNCIONES DE UNIÓN TRABAJADOR-EMPRESA ==========

/**
 * Verifica si un usuario específico ya tiene una empresa asignada
 * Utiliza el cache de relaciones para evitar consultas repetidas
 * @param {number} usuarioId - ID del usuario a verificar
 * @returns {boolean} true si el usuario ya tiene empresa asignada
 */
function tieneEmpresaAsignada(usuarioId) {
  return relacionesUsuarioEmpresa.value.some(relacion => relacion.usuario_id === usuarioId);
}

/**
 * Abre el modal para unir un trabajador a una empresa
 * Carga las empresas disponibles y inicializa el estado del modal
 * @param {Object} usuario - Objeto usuario a asignar a empresa
 */
async function abrirModalUnirEmpresa(usuario) {
  usuarioSeleccionado.value = usuario;
  mostrarModalUnirEmpresa.value = true;
  empresaSeleccionada.value = '';
  
  // Cargar empresas disponibles desde el backend
  await cargarEmpresasDisponibles();
}

/**
 * Cierra el modal de unión y limpia el estado
 * Resetea todas las variables relacionadas con el modal
 */
function cerrarModalUnirEmpresa() {
  mostrarModalUnirEmpresa.value = false;
  usuarioSeleccionado.value = null;
  empresaSeleccionada.value = '';
  empresasDisponibles.value = [];
}

/**
 * Carga la lista de empresas disponibles desde el backend
 * Las empresas se obtienen de la tabla 'empresas' del sistema
 */
async function cargarEmpresasDisponibles() {
  try {
    cargandoEmpresas.value = true;

    // Realizar petición al backend para obtener empresas
    const response = await apiClient.get('/user/empresas');

    empresasDisponibles.value = response.data || [];
    console.log('Empresas cargadas:', empresasDisponibles.value);
  } catch (error) {
    console.error('Error al cargar empresas:', error);
    alert('Error al cargar las empresas disponibles');
    empresasDisponibles.value = [];
  } finally {
    cargandoEmpresas.value = false;
  }
}

/**
 * Ejecuta la unión del trabajador seleccionado con la empresa elegida
 * Crea una nueva relación en la tabla usuarios_empresas
 */
async function unirTrabajadorAEmpresa() {
  if (!usuarioSeleccionado.value || !empresaSeleccionada.value) {
    alert('Por favor seleccione una empresa');
    return;
  }

  try {
    cargandoUnion.value = true;
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.token;

    // Datos a enviar al backend para crear la relación usuario-empresa
    const datosUnion = {
      usuario_id: usuarioSeleccionado.value.id,
      empresa_id: empresaSeleccionada.value,
      rol_en_empresa: usuarioSeleccionado.value.rol, // Usar el rol actual del usuario
      fecha_inicio: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
    };

    // Enviar petición al backend para crear la relación
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/usuarios-empresas`, datosUnion, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Actualizar el cache local de relaciones usuario-empresa
    // Esto asegura que el botón "Unir" desaparezca inmediatamente
    relacionesUsuarioEmpresa.value.push({
      usuario_id: usuarioSeleccionado.value.id,
      empresa_id: empresaSeleccionada.value
    });

    // Mostrar mensaje de éxito
    alert(`Trabajador ${usuarioSeleccionado.value.nombre} ${usuarioSeleccionado.value.apellido_pat} unido exitosamente a la empresa`);
    
    // Cerrar el modal
    cerrarModalUnirEmpresa();
    
    console.log('Trabajador unido a empresa exitosamente:', response.data);
  } catch (error) {
    console.error('Error al unir trabajador a empresa:', error);
    alert('Error al unir el trabajador a la empresa');
  } finally {
    cargandoUnion.value = false;
  }
}

/**
 * Carga las relaciones existentes entre usuarios y empresas
 * Utilizado para determinar qué usuarios ya tienen empresa asignada
 */
async function cargarRelacionesUsuarioEmpresa() {
  try {
    const response = await apiClient.get('/user/usuarios-empresas');

    relacionesUsuarioEmpresa.value = response.data || [];
    console.log('Relaciones usuario-empresa cargadas:', relacionesUsuarioEmpresa.value);
  } catch (error) {
    console.error('Error al cargar relaciones usuario-empresa:', error);
    relacionesUsuarioEmpresa.value = [];
  }
}

// ========== FUNCIONES AUXILIARES ==========

/**
 * Formatea una fecha UTC a formato legible en zona horaria de Chile (UTC-3)
 * Convierte fechas como "2025-08-25T22:13:36.000Z" a "25/08/2025 19:13"
 * @param {string} fechaUTC - Fecha en formato ISO 8601 UTC
 * @returns {string} Fecha formateada para Chile
 */
function formatearFecha(fechaUTC) {
  if (!fechaUTC) return 'Sin fecha';
  
  try {
    // Crear objeto Date desde la fecha UTC
    const fecha = new Date(fechaUTC);
    
    // Verificar que es una fecha válida
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }
    
    // Formatear para zona horaria de Chile (UTC-3)
    const opcionesFormato = {
      timeZone: 'America/Santiago', // Zona horaria de Chile
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Formato 24 horas
    };
    
    // Obtener partes de la fecha por separado para control total del formato
    const partes = new Intl.DateTimeFormat('es-CL', opcionesFormato).formatToParts(fecha);
    
    // Extraer valores
    const dia = partes.find(p => p.type === 'day').value;
    const mes = partes.find(p => p.type === 'month').value;
    const año = partes.find(p => p.type === 'year').value;
    const hora = partes.find(p => p.type === 'hour').value;
    const minuto = partes.find(p => p.type === 'minute').value;
    
    // Formatear como dd/mm/yyyy hh:mm
    return `${dia}/${mes}/${año} ${hora}:${minuto}`;
    
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error de formato';
  }
}

// ========== FUNCIONES DE FILTRADO ==========

/**
 * Función que se ejecuta al hacer clic en el botón de buscar
 * Como usamos computed, no necesita hacer nada especial
 */
function buscarUsuarios() {
  // El filtrado es automático gracias a la computed property
  console.log(`Buscando: "${busquedaTexto.value}"`);
}

// ========== INICIALIZACIÓN DEL COMPONENTE ==========

/**
 * Hook que se ejecuta cuando el componente se monta
 * Carga todos los datos necesarios para el funcionamiento de la vista
 */
onMounted(async () => {
  try {
    // Cargar usuarios del sistema
    const response = await apiClient.get('/user/usuarios');
    
    // Depuración: muestra en consola la respuesta del backend para verificar que llegan los usuarios correctamente
    console.log('Respuesta usuarios:', response.data);
    usuarios.value = response.data.users || [];

    // Cargar relaciones usuario-empresa para mostrar/ocultar botón "Unir"
    await cargarRelacionesUsuarioEmpresa();
    
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
    usuarios.value = [];
  }
});
</script>