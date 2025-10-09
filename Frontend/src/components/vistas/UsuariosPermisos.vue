<template>
  <!-- Navbar tipo tabs moderno igual a AdminEmpresas.vue -->
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
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Usuarios y Permisos</h2>
          <p class="text-gray-600">Gestiona roles, permisos y configuraciones de seguridad del sistema</p>
        </div>
        <button
          @click="mostrarModalCrearUsuario = true"
          class="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg shadow hover:bg-amber-700 transition text-base font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Grid de Funcionalidades -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- 1. Gestión de Roles -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-blue-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m6 5.87a4 4 0 00-3-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a4 4 0 100-8 4 4 0 000 8z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-blue-800">Gestión de Roles</h3>
              <p class="text-blue-600 text-sm">{{ rolesCount }} roles configurados</p>
            </div>
          </div>
          <p class="text-gray-700 text-sm mb-4">
            Administra los roles del sistema: Admin, Trabajador, Empleador
          </p>
          <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition text-sm font-medium">
            Gestionar Roles
          </button>
        </div>

        <!-- 2. Permisos por Módulo -->
        <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-green-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-green-800">Permisos</h3>
              <p class="text-green-600 text-sm">{{ permisosCount }} permisos activos</p>
            </div>
          </div>
          <p class="text-gray-700 text-sm mb-4">
            Configure permisos específicos para cada módulo del sistema
          </p>
          <button 
            @click="abrirModalPermisos"
            class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition text-sm font-medium"
          >
            Configurar Permisos
          </button>
        </div>

        <!-- 3. Seguridad y Auditoría -->
        <div class="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-red-500 rounded-lg">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-red-800">Seguridad</h3>
              <p class="text-red-600 text-sm">{{ estadisticas.sesiones_activas || 0 }} sesiones activas</p>
            </div>
          </div>
          <p class="text-gray-700 text-sm mb-4">
            Monitoreo de seguridad, sesiones activas y logs de auditoría
          </p>
          <button 
            @click="abrirModalAuditoria"
            class="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition text-sm font-medium"
          >
            Ver Auditoría
          </button>
        </div>
      </div>

      <!-- Tabla de Usuarios y Roles -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-800">Usuarios y sus Roles</h3>
        </div>
        
        <!-- Campo de búsqueda -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex gap-3 items-center">
            <div class="flex-1 relative">
              <input
                v-model="busquedaUsuarios"
                type="text"
                placeholder="Buscar por nombre, apellido, email, rol o estado..."
                class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div class="text-sm text-gray-500">
              {{ usuariosFiltrados.length }} de {{ usuariosConPermisos.length }} usuarios
            </div>
          </div>
        </div>
        
        <div class="h-80 overflow-auto border-t border-gray-200">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol Actual</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="usuario in usuariosFiltrados" :key="usuario.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">{{ usuario.iniciales }}</span>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ usuario.nombre }} {{ usuario.apellido_pat }}</div>
                        <div class="text-sm text-gray-500">{{ usuario.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getRolBadgeClass(usuario.rol)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ usuario.rol }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ getPermisosCount(usuario.rol) }} permisos
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="usuario.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ usuario.estado === 1 ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatearFecha(usuario.updated_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      @click="confirmarEliminacion(usuario)"
                      class="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
                <!-- Fila para cuando no hay usuarios -->
                <tr v-if="usuariosFiltrados.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                      </svg>
                      <p>{{ busquedaUsuarios ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados' }}</p>
                      <p v-if="!busquedaUsuarios" class="text-sm text-gray-400">Crea el primer usuario haciendo clic en "Nuevo Usuario"</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para crear nuevo usuario -->
  <div v-if="mostrarModalCrearUsuario" class="fixed inset-0 bg-transparent overflow-y-auto h-full w-full z-50" @click.self="cerrarModalCrearUsuario">
    <div class="relative top-20 mx-auto p-5 border max-w-2xl w-full shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header del modal -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Crear Nuevo Usuario</h3>
          <button @click="cerrarModalCrearUsuario" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Formulario -->
        <form @submit.prevent="crearUsuario" class="space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input 
              v-model="nuevoUsuario.nombre"
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ingresa el nombre"
            />
          </div>
          
          <!-- Apellidos -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
              <input 
                v-model="nuevoUsuario.apellido_pat"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Apellido paterno"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
              <input 
                v-model="nuevoUsuario.apellido_mat"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Apellido materno"
              />
            </div>
          </div>
          
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              v-model="nuevoUsuario.email"
              type="email" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="usuario@ejemplo.com"
            />
          </div>
          
          <!-- RUT -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
            <input 
              v-model="nuevoUsuario.rut"
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="12345678-9"
            />
          </div>
          
          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <input 
              v-model="nuevoUsuario.password"
              type="password" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Contraseña segura"
            />
          </div>
          
          <!-- Rol -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
            <select 
              v-model="nuevoUsuario.rol"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Selecciona un rol</option>
              <option value="admin">Administrador</option>
              <option value="empleador">Empleador</option>
              <option value="fiscalizador">Fiscalizador</option>
              <option value="trabajador">Trabajador</option>
            </select>
          </div>
          
          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
              v-model="nuevoUsuario.estado"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
          
          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="cerrarModalCrearUsuario"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="cargandoCreacion"
              class="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {{ cargandoCreacion ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para eliminar -->
  <div v-if="mostrarModalEliminar" class="fixed inset-0 bg-transparent flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar Eliminación</h3>
        <p class="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{{ usuarioAEliminar?.nombre }} {{ usuarioAEliminar?.apellido_pat }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            type="button"
            @click="cerrarModalEliminar"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="eliminarUsuario"
            :disabled="cargandoEliminacion"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {{ cargandoEliminacion ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Auditoría -->
  <div v-if="mostrarModalAuditoria" class="fixed inset-0 bg-transparent flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b">
        <h3 class="text-xl font-semibold text-gray-900">Auditoría de Sesiones</h3>
        <button 
          @click="cerrarModalAuditoria"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Estadísticas rápidas -->
      <div class="px-6 py-4 bg-gray-50 border-b">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ estadisticas.total_sesiones || 0 }}</div>
            <div class="text-sm text-gray-600">Total de sesiones</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ estadisticas.sesiones_activas || 0 }}</div>
            <div class="text-sm text-gray-600">Sesiones activas</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ estadisticas.sesiones_hoy || 0 }}</div>
            <div class="text-sm text-gray-600">Sesiones hoy</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ Math.round(estadisticas.promedio_duracion || 0) }} min</div>
            <div class="text-sm text-gray-600">Duración promedio</div>
          </div>
        </div>
      </div>

      <!-- Tabla de registros de auditoría -->
      <div class="flex-1 overflow-hidden p-6">
        <div class="h-96 overflow-auto border border-gray-200 rounded-lg">
          <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
              <thead class="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio de Sesión</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cierre de Sesión</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo Activo</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="registro in registrosAuditoria" :key="registro.id" class="hover:bg-gray-50">
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ registro.nombre?.charAt(0) }}{{ registro.apellido_pat?.charAt(0) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">
                          {{ registro.nombre }} {{ registro.apellido_pat }}
                        </div>
                        <div class="text-sm text-gray-500">{{ registro.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getRolBadgeClassAuditoria(registro.rol)">
                      {{ registro.rol }}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatearFechaHora(registro.fecha_inicio) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ registro.fecha_cierre ? formatearFechaHora(registro.fecha_cierre) : '-' }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ registro.duracion_sesion }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getEstadoBadgeClass(registro.estado)">
                      {{ registro.estado }}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ registro.ip_address || 'N/A' }}
                  </td>
                </tr>
                <tr v-if="registrosAuditoria.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    No hay registros de auditoría disponibles
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer del modal -->
      <div class="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Mostrando {{ registrosAuditoria.length }} registros
        </div>
        <button 
          @click="actualizarRegistrosAuditoria"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          :disabled="cargandoAuditoria"
        >
          {{ cargandoAuditoria ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de Permisos por Rol -->
  <div v-if="mostrarModalPermisos" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-[85vw] max-h-[85vh] overflow-hidden">
      <div class="flex justify-between items-center p-3 border-b bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-900">Permisos por Rol y Usuarios</h3>
        <button 
          @click="cerrarModalPermisos"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Contenido del modal -->
      <div class="flex-1 overflow-auto p-4">
        <!-- Header con botón de expandir/colapsar todos -->
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-base font-semibold text-gray-800">Permisos por Rol</h4>
          <button 
            @click="toggleTodosLosRoles"
            class="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
          >
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
            {{ Object.values(rolesExpandidos).every(estado => !estado) ? 'Expandir todos' : 'Colapsar todos' }}
          </button>
        </div>
        
        <!-- Grid de roles compacto -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
          <div v-for="(rolData, rolKey) in permisosDetallados" :key="rolKey" 
               class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
            
            <!-- Header del rol clickeable -->
            <div @click="toggleRolExpandido(rolKey)" 
                 class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors">
              <div class="flex items-center">
                <div :class="`p-2 bg-${rolData.color}-500 rounded-lg`">
                  <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m6 5.87a4 4 0 00-3-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a4 4 0 100-8 4 4 0 000 8z"/>
                  </svg>
                </div>
                <div class="ml-2">
                  <h4 class="text-sm font-semibold text-gray-800">{{ rolData.nombre }}</h4>
                  <div :class="`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getColorClass(rolData.color)}`">
                    {{ contarUsuariosPorRol(rolKey) }} usuario{{ contarUsuariosPorRol(rolKey) !== 1 ? 's' : '' }}
                  </div>
                </div>
              </div>
              <!-- Icono de expansión -->
              <div class="transition-transform duration-200" :class="{ 'rotate-180': rolesExpandidos[rolKey] }">
                <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
            
            <!-- Descripción siempre visible -->
            <div class="px-3 pb-2">
              <p class="text-xs text-gray-600">{{ rolData.descripcion }}</p>
            </div>

            <!-- Lista de permisos expandible -->
            <div v-show="rolesExpandidos[rolKey]" 
                 class="px-3 pb-3 space-y-1.5 transition-all duration-300 ease-in-out">
              <div v-for="modulo in rolData.permisos" :key="modulo.modulo" 
                   class="bg-white rounded p-2 border border-gray-100 shadow-sm">
                <h5 class="font-medium text-gray-800 text-xs mb-1">{{ modulo.modulo }}</h5>
                <div class="flex flex-wrap gap-0.5">
                  <span v-for="permiso in modulo.permisos" :key="permiso"
                        class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {{ permiso }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Indicador de permisos cuando está colapsado -->
            <div v-show="!rolesExpandidos[rolKey]" class="px-3 pb-3">
              <div class="text-xs text-gray-500 text-center">
                {{ rolData.permisos.reduce((total, modulo) => total + modulo.permisos.length, 0) }} permisos en {{ rolData.permisos.length }} módulos
                <br>
                <span class="text-blue-600 font-medium">Click para ver detalles</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de usuarios compacta -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <h4 class="text-base font-semibold text-gray-800">Usuarios y sus Permisos Detallados</h4>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulos</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="usuario in usuariosConPermisos" :key="usuario.id" class="hover:bg-gray-50">
                  <td class="px-3 py-2 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span class="text-xs font-medium text-white">{{ usuario.iniciales }}</span>
                        </div>
                      </div>
                      <div class="ml-2">
                        <div class="text-xs font-medium text-gray-900">{{ usuario.nombre }} {{ usuario.apellido_pat }}</div>
                        <div class="text-xs text-gray-500">{{ usuario.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span :class="getRolBadgeClass(usuario.rol)" 
                          class="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full">
                      {{ permisosDetallados[usuario.rol]?.nombre || usuario.rol }}
                    </span>
                  </td>
                  <td class="px-3 py-2">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="modulo in permisosDetallados[usuario.rol]?.permisos || []" 
                            :key="modulo.modulo"
                            class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {{ modulo.modulo }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ permisosDetallados[usuario.rol]?.permisos?.reduce((total, modulo) => total + modulo.permisos.length, 0) || 0 }} permisos
                    </span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span :class="usuario.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                          class="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full">
                      {{ usuario.estado === 1 ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer del modal compacto -->
      <div class="px-4 py-2 bg-gray-50 border-t flex justify-between items-center">
        <div class="text-xs text-gray-600">
          Total de usuarios: {{ usuariosConPermisos.length }}
        </div>
        <button 
          @click="cerrarModalPermisos"
          class="px-4 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

// Estados reactivos
const usuariosConPermisos = ref([]);
const rolesCount = ref(4); // Admin, Trabajador, Fiscalizador, Empleador
const permisosCount = ref(12);
const alertasCount = ref(3);

// Variables para filtrado de usuarios
const busquedaUsuarios = ref('');

// Computed property para filtrar usuarios automáticamente
const usuariosFiltrados = computed(() => {
  if (!busquedaUsuarios.value.trim()) {
    return usuariosConPermisos.value;
  }

  const textoBusqueda = busquedaUsuarios.value.toLowerCase().trim();
  
  return usuariosConPermisos.value.filter(usuario => {
    const nombre = (usuario.nombre || '').toLowerCase();
    const apellidoPat = (usuario.apellido_pat || '').toLowerCase();
    const apellidoMat = (usuario.apellido_mat || '').toLowerCase();
    const email = (usuario.email || '').toLowerCase();
    const rol = (usuario.rol || '').toLowerCase();
    const estado = usuario.estado === 1 ? 'activo' : 'inactivo';
    
    return nombre.includes(textoBusqueda) ||
           apellidoPat.includes(textoBusqueda) ||
           apellidoMat.includes(textoBusqueda) ||
           email.includes(textoBusqueda) ||
           rol.includes(textoBusqueda) ||
           estado.includes(textoBusqueda);
  });
});

// Estados para modales
const mostrarModalCrearUsuario = ref(false);
const mostrarModalEliminar = ref(false);
const usuarioAEliminar = ref(null);
const cargandoCreacion = ref(false);
const cargandoEliminacion = ref(false);

// Variables para auditoría
const mostrarModalAuditoria = ref(false);
const registrosAuditoria = ref([]);
const estadisticas = ref({});
const cargandoAuditoria = ref(false);

// Variables para modal de permisos
const mostrarModalPermisos = ref(false);

// Estado para controlar qué roles están expandidos
const rolesExpandidos = ref({
  admin: false,
  empleador: false,
  fiscalizador: false,
  trabajador: false
});

// Función para toggle del rol expandido
const toggleRolExpandido = (rolKey) => {
  rolesExpandidos.value[rolKey] = !rolesExpandidos.value[rolKey];
};

// Estructura de permisos por rol
const permisosDetallados = ref({
  admin: {
    nombre: 'Administrador',
    descripcion: 'Control total del sistema',
    color: 'purple',
    permisos: [
      { modulo: 'Usuarios', permisos: ['Crear', 'Editar', 'Eliminar', 'Ver todos'] },
      { modulo: 'Empresas', permisos: ['Crear', 'Editar', 'Eliminar', 'Ver todas'] },
      { modulo: 'Reportes', permisos: ['Generar todos', 'Exportar', 'Ver históricos'] },
      { modulo: 'Configuración', permisos: ['Modificar sistema', 'Gestionar roles'] },
      { modulo: 'Auditoría', permisos: ['Ver logs', 'Exportar auditoría'] },
      { modulo: 'Fiscalización', permisos: ['Crear fiscalizaciones', 'Asignar fiscalizadores'] }
    ]
  },
  empleador: {
    nombre: 'Empleador',
    descripcion: 'Gestión de su empresa y trabajadores',
    color: 'orange',
    permisos: [
      { modulo: 'Trabajadores', permisos: ['Ver de su empresa', 'Crear', 'Editar'] },
      { modulo: 'Marcaciones', permisos: ['Ver de su empresa', 'Exportar'] },
      { modulo: 'Reportes', permisos: ['Generar de su empresa', 'Ver estadísticas'] },
      { modulo: 'Empresa', permisos: ['Editar información', 'Gestionar establecimientos'] },
      { modulo: 'Turnos', permisos: ['Crear', 'Modificar', 'Asignar'] }
    ]
  },
  fiscalizador: {
    nombre: 'Fiscalizador',
    descripcion: 'Fiscalización y control de cumplimiento',
    color: 'red',
    permisos: [
      { modulo: 'Fiscalización', permisos: ['Crear procesos', 'Evaluar cumplimiento', 'Generar informes'] },
      { modulo: 'Empresas', permisos: ['Ver todas', 'Auditar'] },
      { modulo: 'Reportes', permisos: ['Generar fiscalización', 'Exportar'] },
      { modulo: 'Marcaciones', permisos: ['Ver todas', 'Validar'] },
      { modulo: 'Auditoría', permisos: ['Ver logs de fiscalización'] }
    ]
  },
  trabajador: {
    nombre: 'Trabajador',
    descripcion: 'Acceso básico para marcar asistencia',
    color: 'blue',
    permisos: [
      { modulo: 'Marcaciones', permisos: ['Marcar entrada/salida', 'Ver propias'] },
      { modulo: 'Perfil', permisos: ['Ver información', 'Editar datos básicos'] },
      { modulo: 'Turnos', permisos: ['Ver asignados'] }
    ]
  }
});

// Estado para el formulario de nuevo usuario
const nuevoUsuario = ref({
  nombre: '',
  apellido_pat: '',
  apellido_mat: '',
  email: '',
  password: '',
  rol: '',
  rut: '',
  estado: '1'
});

// Funciones auxiliares
const getRolBadgeClass = (rol) => {
  const classes = {
    'admin': 'bg-purple-100 text-purple-800',
    'trabajador': 'bg-blue-100 text-blue-800',
    'fiscalizador': 'bg-red-100 text-red-800',
    'empleador': 'bg-orange-100 text-orange-800'
  };
  return classes[rol] || 'bg-gray-100 text-gray-800';
};

const getPermisosCount = (rol) => {
  const permisos = {
    'admin': 12,
    'empleador': 8,
    'fiscalizador': 7,
    'trabajador': 3
  };
  return permisos[rol] || 0;
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'Nunca';
  return new Date(fecha).toLocaleDateString('es-CL');
};

// Funciones para modal de permisos
const abrirModalPermisos = () => {
  mostrarModalPermisos.value = true;
};

const cerrarModalPermisos = () => {
  mostrarModalPermisos.value = false;
};

const getColorClass = (color) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800'
  };
  return colorClasses[color] || 'bg-gray-100 text-gray-800';
};

const contarUsuariosPorRol = (rol) => {
  return usuariosConPermisos.value.filter(usuario => usuario.rol === rol).length;
};

// Función para expandir/colapsar todos los roles
const toggleTodosLosRoles = () => {
  const todosCerrados = Object.values(rolesExpandidos.value).every(estado => !estado);
  
  Object.keys(rolesExpandidos.value).forEach(rol => {
    rolesExpandidos.value[rol] = todosCerrados;
  });
};

// Funciones para gestión de usuarios
const cerrarModalCrearUsuario = () => {
  mostrarModalCrearUsuario.value = false;
  // Limpiar formulario
  nuevoUsuario.value = {
    nombre: '',
    apellido_pat: '',
    apellido_mat: '',
    email: '',
    password: '',
    rol: '',
    rut: '',
    estado: '1'
  };
};

const crearUsuario = async () => {
  try {
    cargandoCreacion.value = true;
    
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.token;
    
    const response = await axios.post("/api/user/usuarios", nuevoUsuario.value, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      // Agregar usuario a la lista local
      const nuevoUsuarioCreado = {
        ...response.data.user,
        iniciales: (response.data.user.nombre.charAt(0) + 
                   (response.data.user.apellido_pat ? response.data.user.apellido_pat.charAt(0) : '')).toUpperCase()
      };
      
      usuariosConPermisos.value.push(nuevoUsuarioCreado);
      
      // Cerrar modal y mostrar éxito
      cerrarModalCrearUsuario();
      alert('Usuario creado exitosamente');
      
      // Disparar evento para actualizar estadísticas en tiempo real
      window.dispatchEvent(new Event('actualizarEstadisticas'));
      console.log('📊 Evento de actualización de estadísticas disparado tras crear usuario');
    }
    
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`);
    } else {
      alert('Error al crear el usuario. Por favor, intenta nuevamente.');
    }
  } finally {
    cargandoCreacion.value = false;
  }
};

const confirmarEliminacion = (usuario) => {
  usuarioAEliminar.value = usuario;
  mostrarModalEliminar.value = true;
};

const cerrarModalEliminar = () => {
  mostrarModalEliminar.value = false;
  usuarioAEliminar.value = null;
};

const eliminarUsuario = async () => {
  try {
    cargandoEliminacion.value = true;
    
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.token;
    
    const response = await axios.delete(`/api/user/usuarios/${usuarioAEliminar.value.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      // Remover usuario de la lista local
      usuariosConPermisos.value = usuariosConPermisos.value.filter(
        u => u.id !== usuarioAEliminar.value.id
      );
      
      // Cerrar modal y mostrar éxito
      cerrarModalEliminar();
      alert('Usuario eliminado exitosamente');
      
      // Disparar evento para actualizar estadísticas en tiempo real
      window.dispatchEvent(new Event('actualizarEstadisticas'));
      console.log('📊 Evento de actualización de estadísticas disparado tras eliminar usuario');
    }
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`);
    } else {
      alert('Error al eliminar el usuario. Por favor, intenta nuevamente.');
    }
  } finally {
    cargandoEliminacion.value = false;
  }
};

const editarUsuario = (usuario) => {
  // Por ahora, redirigir a la página de administración
  alert(`Función de edición para ${usuario.nombre} estará disponible próximamente`);
};

// Función para recargar usuarios
const recargarUsuarios = async () => {
  try {
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.token;
    
    const response = await axios.get("/api/user/usuarios", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    usuariosConPermisos.value = (response.data.users || []).map(user => ({
      ...user,
      iniciales: (user.nombre.charAt(0) + (user.apellido_pat ? user.apellido_pat.charAt(0) : '')).toUpperCase()
    }));
    
  } catch (error) {
    console.error('Error al recargar usuarios:', error);
  }
};

// Funciones para auditoría
const abrirModalAuditoria = async () => {
  mostrarModalAuditoria.value = true;
  await Promise.all([
    obtenerEstadisticasSesiones(),
    actualizarRegistrosAuditoria()
  ]);
};

const cerrarModalAuditoria = () => {
  mostrarModalAuditoria.value = false;
  registrosAuditoria.value = [];
  estadisticas.value = {};
};

const obtenerEstadisticasSesiones = async () => {
  try {
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.token;
    
    console.log('📊 Obteniendo estadísticas de sesiones...');
    console.log('Token disponible:', !!token);
    
    const response = await axios.get("/api/auditoria/estadisticas", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📈 Respuesta estadísticas:', response.data);
    
    if (response.data.success) {
      estadisticas.value = response.data.data;
      console.log('✅ Estadísticas cargadas:', estadisticas.value);
    } else {
      console.error('❌ Error en estadísticas:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    console.error('❌ Detalles del error:', error.response?.data);
    estadisticas.value = {};
  }
};

const actualizarRegistrosAuditoria = async () => {
  try {
    cargandoAuditoria.value = true;
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.token;
    
    console.log('🔍 Intentando obtener registros de auditoría...');
    console.log('Token disponible:', !!token);
    
    const response = await axios.get("/api/auditoria/sesiones?limite=100", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Respuesta del servidor:', response.data);
    
    if (response.data.success) {
      registrosAuditoria.value = response.data.data;
      console.log('✅ Registros cargados:', registrosAuditoria.value.length);
    } else {
      console.error('❌ Error en respuesta:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Error al obtener registros de auditoría:', error);
    console.error('❌ Detalles del error:', error.response?.data);
    registrosAuditoria.value = [];
  } finally {
    cargandoAuditoria.value = false;
  }
};

// Funciones auxiliares para el modal de auditoría
const formatearFechaHora = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const getRolBadgeClassAuditoria = (rol) => {
  const classes = {
    'admin': 'bg-purple-100 text-purple-800',
    'trabajador': 'bg-blue-100 text-blue-800',
    'fiscalizador': 'bg-red-100 text-red-800',
    'empleador': 'bg-orange-100 text-orange-800'
  };
  return classes[rol] || 'bg-gray-100 text-gray-800';
};

const getEstadoBadgeClass = (estado) => {
  const classes = {
    'activo': 'bg-green-100 text-green-800',
    'cerrado': 'bg-gray-100 text-gray-800',
    'expirado': 'bg-red-100 text-red-800'
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
};

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStorage.token;
    
    console.log('🔍 Intentando cargar usuarios...');
    console.log('🔑 Token disponible:', !!token);
    console.log('🔗 URL completa que se llamará:', axios.defaults.baseURL + "/api/user/usuarios");
    
    const response = await axios.get("/api/user/usuarios", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('📊 Respuesta del servidor:', response.data);
    console.log('📋 Status de respuesta:', response.status);
    
    // Agregar iniciales a cada usuario
    usuariosConPermisos.value = (response.data.users || []).map(user => ({
      ...user,
      iniciales: (user.nombre.charAt(0) + (user.apellido_pat ? user.apellido_pat.charAt(0) : '')).toUpperCase()
    }));
    
    console.log('✅ Usuarios cargados para gestión de permisos:', usuariosConPermisos.value);
    console.log('📈 Total usuarios cargados:', usuariosConPermisos.value.length);
    
    // Cargar estadísticas de seguridad para mostrar en la tarjeta superior
    // await obtenerEstadisticasSesiones();
    
  } catch (error) {
    console.error('❌ Error al cargar usuarios:', error);
    console.error('❌ Status del error:', error.response?.status);
    console.error('❌ Detalles del error:', error.response?.data);
    console.error('❌ URL que se intentó llamar:', error.config?.url);
    usuariosConPermisos.value = [];
  }
});
</script>