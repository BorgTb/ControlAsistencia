<template>
  <!-- Modal overlay - sin fondo oscuro -->
  <div 
    v-if="mostrar" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click="cerrarModal"
  >
    <!-- Modal container - contenedor principal del modal -->
    <div 
      class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- Header del modal con título y botón cerrar -->
      <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center">
        <div>
          <h3 class="text-xl font-bold text-white">Historial de Cambios</h3>
          <p class="text-green-100 text-sm">{{ usuarioNombre }} - {{ usuarioRol }}</p>
        </div>
        <button 
          @click="cerrarModal"
          class="text-white hover:text-green-200 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Controles de filtro y estadísticas -->
      <div class="p-4 bg-gray-50 border-b">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <!-- Filtros por tipo de acción -->
          <div class="flex gap-2 flex-wrap">
            <button
              @click="filtroActivo = ''"
              :class="filtroActivo === '' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 border'"
              class="px-3 py-1 rounded-lg text-xs font-medium transition"
            >
              Todos ({{ totalCambios }})
            </button>
            <button
              @click="filtroActivo = 'empresa'"
              :class="filtroActivo === 'empresa' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'"
              class="px-3 py-1 rounded-lg text-xs font-medium transition"
            >
              🏢 Empresas ({{ contarPorTipo('empresa') }})
            </button>
            <button
              @click="filtroActivo = 'trabajador'"
              :class="filtroActivo === 'trabajador' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 border'"
              class="px-3 py-1 rounded-lg text-xs font-medium transition"
            >
              👥 Trabajadores ({{ contarPorTipo('trabajador') }})
            </button>
            <button
              @click="filtroActivo = 'sistema'"
              :class="filtroActivo === 'sistema' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border'"
              class="px-3 py-1 rounded-lg text-xs font-medium transition"
            >
              🔧 Sistema ({{ contarPorTipo('sistema') }})
            </button>
          </div>

          <!-- Indicador de carga -->
          <div v-if="cargando" class="flex items-center gap-2 text-gray-600">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span class="text-sm">Cargando cambios...</span>
          </div>
        </div>
      </div>

      <!-- Contenido del modal - lista de cambios -->
      <div class="p-6 max-h-[60vh] overflow-y-auto">
        <!-- Mensaje de error -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>

        <!-- Lista de cambios agrupados por fecha -->
        <div v-if="cambiosFiltrados.length > 0" class="space-y-4">
          <div v-for="grupo in cambiosAgrupados" :key="grupo.fecha" class="space-y-3">
            <!-- Cabecera de fecha -->
            <div class="flex items-center gap-3">
              <div class="h-px bg-gray-300 flex-1"></div>
              <span class="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {{ grupo.fecha }}
              </span>
              <div class="h-px bg-gray-300 flex-1"></div>
            </div>

            <!-- Cambios del día -->
            <div class="space-y-3">
              <div 
                v-for="cambio in grupo.cambios" 
                :key="cambio.id"
                class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <!-- Header del cambio -->
                <div class="flex items-start gap-3 mb-3">
                  <!-- Icono según tipo de acción -->
                  <div class="flex-shrink-0">
                    <div 
                      :class="obtenerColorAccion(cambio.accion)"
                      class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <span class="text-sm font-medium">{{ obtenerIconoAccion(cambio.accion) }}</span>
                    </div>
                  </div>

                  <!-- Contenido principal del cambio -->
                  <div class="flex-1 min-w-0">
                    <!-- Título de la acción -->
                    <h4 class="text-base font-semibold text-gray-900 mb-1">
                      {{ obtenerTituloAccion(cambio.accion) }}
                    </h4>
                    
                    <!-- Descripción detallada -->
                    <p class="text-sm text-gray-700 mb-2">
                      {{ cambio.descripcion }}
                    </p>
                    
                    <!-- Hora y metadatos -->
                    <div class="flex items-center gap-4 text-xs text-gray-500">
                      <span class="flex items-center gap-1">
                        🕒 {{ formatearHora(cambio.fecha_cambio) }}
                      </span>
                      <span class="flex items-center gap-1">
                        📁 {{ obtenerNombreTabla(cambio.tabla_afectada) }}
                      </span>
                      <span v-if="cambio.ip_address" class="flex items-center gap-1">
                        🌐 {{ cambio.ip_address }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay cambios -->
        <div v-else-if="!cargando" class="text-center py-12">
          <div class="flex flex-col items-center">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Sin actividad registrada</h3>
            <p class="text-sm text-gray-500 max-w-sm">
              {{ filtroActivo ? 
                `No se encontraron cambios del tipo "${obtenerNombreFiltro(filtroActivo)}"` : 
                'Este usuario aún no ha realizado modificaciones en el sistema' 
              }}
            </p>
            <div class="mt-4 text-xs text-gray-400">
              Las acciones como crear empresas, asignar trabajadores o cambiar roles aparecerán aquí
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del modal con botones de acción -->
      <div class="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span>{{ cambiosFiltrados.length }} actividad{{ cambiosFiltrados.length === 1 ? '' : 'es' }} encontrada{{ cambiosFiltrados.length === 1 ? '' : 's' }}</span>
        </div>
        <div class="flex gap-3">
          <button
            @click="exportarCambios"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exportar
          </button>
          <button
            @click="cerrarModal"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Importaciones necesarias para el modal de cambios
import { ref, computed, watch } from 'vue'
import { obtenerCambiosUsuario } from '@/services/auditoria-service.js'

// ========== PROPS DEL COMPONENTE ==========
// Props recibidas desde el componente padre
const props = defineProps({
  mostrar: {
    type: Boolean,
    default: false,
    // Controla si el modal se muestra o no
  },
  usuarioId: {
    type: Number,
    required: true,
    // ID del usuario cuyos cambios se van a mostrar
  },
  usuarioNombre: {
    type: String,
    required: true,
    // Nombre completo del usuario para mostrar en el header
  },
  usuarioRol: {
    type: String,
    required: true,
    // Rol del usuario para contexto adicional
  }
})

// ========== EVENTOS DEL COMPONENTE ==========
// Evento para comunicar al padre que debe cerrarse el modal
const emit = defineEmits(['cerrar'])

// ========== ESTADO REACTIVO ==========
// Variables reactivas para gestionar el estado del modal
const cambios = ref([])              // Lista completa de cambios del usuario
const cargando = ref(false)          // Indicador de carga durante peticiones
const error = ref(null)              // Mensaje de error si ocurre algún problema
const filtroActivo = ref('')         // Filtro activo para tipo de cambios

// ========== COMPUTED PROPERTIES ==========

/**
 * Filtra los cambios según el tipo seleccionado
 * Permite mostrar solo empresas, trabajadores, sistema o todos
 */
const cambiosFiltrados = computed(() => {
  if (!filtroActivo.value) return cambios.value
  
  return cambios.value.filter(cambio => {
    // Clasificar cambios por tipo basado en la acción
    if (filtroActivo.value === 'empresa') {
      return cambio.accion.includes('empresa') || cambio.tabla_afectada === 'empresas'
    }
    if (filtroActivo.value === 'trabajador') {
      return cambio.accion.includes('trabajador') || 
             cambio.accion.includes('asignar') || 
             cambio.accion.includes('usuario') ||
             cambio.accion.includes('turno') ||  // Incluir acciones de turnos en trabajadores
             cambio.tabla_afectada === 'usuario_empresa' ||
             cambio.tabla_afectada === 'usuarios' ||
             cambio.tabla_afectada === 'turnos'  // Incluir tabla turnos en trabajadores
    }
    if (filtroActivo.value === 'sistema') {
      return cambio.accion.includes('rol') || 
             cambio.accion.includes('estado') || 
             cambio.accion.includes('configuracion') ||
             cambio.accion.includes('sesion') ||
             cambio.tabla_afectada === 'configuracion_empresa'  // Incluir configuraciones del sistema
    }
    return true
  })
})

/**
 * Agrupa los cambios por fecha para mejor visualización
 * Organiza cronológicamente las acciones del usuario
 */
const cambiosAgrupados = computed(() => {
  const grupos = {}
  
  cambiosFiltrados.value.forEach(cambio => {
    const fecha = new Date(cambio.fecha_cambio).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    if (!grupos[fecha]) {
      grupos[fecha] = {
        fecha,
        cambios: []
      }
    }
    
    grupos[fecha].cambios.push(cambio)
  })
  
  // Ordenar grupos por fecha (más reciente primero)
  return Object.values(grupos).sort((a, b) => 
    new Date(b.cambios[0].fecha_cambio) - new Date(a.cambios[0].fecha_cambio)
  )
})

/**
 * Total de cambios del usuario
 */
const totalCambios = computed(() => cambios.value.length)

// ========== FUNCIONES AUXILIARES ==========

/**
 * Cuenta cambios por tipo específico
 * @param {string} tipo - Tipo de cambio a contar
 * @returns {number} Cantidad de cambios del tipo
 */
const contarPorTipo = (tipo) => {
  return cambios.value.filter(cambio => {
    if (tipo === 'empresa') return cambio.accion.includes('empresa') || cambio.tabla_afectada === 'empresas'
    if (tipo === 'trabajador') return cambio.accion.includes('trabajador') || 
                                       cambio.accion.includes('asignar') || 
                                       cambio.accion.includes('usuario') ||
                                       cambio.accion.includes('turno') ||  // Incluir acciones de turnos
                                       cambio.tabla_afectada === 'usuario_empresa' ||
                                       cambio.tabla_afectada === 'usuarios' ||
                                       cambio.tabla_afectada === 'turnos'  // Incluir tabla turnos
    if (tipo === 'sistema') return cambio.accion.includes('rol') || 
                                   cambio.accion.includes('estado') || 
                                   cambio.accion.includes('configuracion') ||
                                   cambio.accion.includes('sesion') ||
                                   cambio.tabla_afectada === 'configuracion_empresa'  // Incluir configuraciones
    return false
  }).length
}

/**
 * Obtiene el color CSS según el tipo de acción
 * @param {string} accion - Tipo de acción realizada
 * @returns {string} Clases CSS para colorear el icono
 */
const obtenerColorAccion = (accion) => {
  if (accion.includes('crear')) return 'bg-green-500 text-white'
  if (accion.includes('editar')) return 'bg-blue-500 text-white'
  if (accion.includes('eliminar') || accion.includes('remover')) return 'bg-red-500 text-white'
  if (accion.includes('asignar')) return 'bg-purple-500 text-white'
  if (accion.includes('cambiar')) return 'bg-orange-500 text-white'
  return 'bg-gray-500 text-white'
}

/**
 * Obtiene el icono emoji según el tipo de acción
 * @param {string} accion - Tipo de acción realizada
 * @returns {string} Emoji representativo de la acción
 */
const obtenerIconoAccion = (accion) => {
  if (accion.includes('crear')) return '➕'
  if (accion.includes('editar')) return '✏️'
  if (accion.includes('eliminar') || accion.includes('remover')) return '🗑️'
  if (accion.includes('asignar')) return '👥'
  if (accion.includes('cambiar')) return '🔄'
  if (accion.includes('empresa')) return '🏢'
  if (accion.includes('turno')) return '⏰'  // Icono específico para acciones de turnos
  if (accion.includes('configuracion')) return '⚙️'  // Icono específico para configuración del sistema
  if (accion.includes('sesion')) return '🔐'
  return '📝'
}

/**
 * Obtiene un título más amigable para la acción
 * @param {string} accion - Tipo de acción realizada
 * @returns {string} Título amigable de la acción
 */
const obtenerTituloAccion = (accion) => {
  const titulos = {
    // Empresas
    'crear_empresa': 'Nueva Empresa Creada',
    'editar_empresa': 'Empresa Actualizada',
    'eliminar_empresa': 'Empresa Eliminada',
    
    // Usuarios
    'crear_usuario': 'Nuevo Usuario Creado',
    'editar_usuario': 'Usuario Actualizado',
    'eliminar_usuario': 'Usuario Eliminado',
    'cambiar_rol': 'Rol de Usuario Modificado',
    'cambiar_estado': 'Estado de Usuario Modificado',
    
    // Asignaciones
    'asignar_trabajador': 'Trabajador Asignado a Empresa',
    'remover_trabajador': 'Trabajador Removido de Empresa',
    
    // Turnos - nuevas acciones agregadas
    'asignar_turno_trabajador': 'Turno Asignado a Trabajador',
    'eliminar_turno_trabajador': 'Turno Eliminado de Trabajador',
    'modificar_turno_trabajador': 'Turno de Trabajador Modificado',
    
    // Configuración del sistema - nuevas acciones agregadas
    'modificar_configuracion_sistema': 'Configuración del Sistema Modificada',
    'actualizar_configuracion_empresa': 'Configuración Empresarial Actualizada',
    'cambiar_configuracion_marcaciones': 'Configuración de Marcaciones Modificada',
    
    // Sistema
    'iniciar_sesion': 'Inicio de Sesión',
    'cerrar_sesion': 'Cierre de Sesión',
    'cambiar_configuracion': 'Configuración Modificada'
  }
  return titulos[accion] || accion.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Obtiene un nombre más amigable para la tabla
 * @param {string} tabla - Nombre de la tabla afectada
 * @returns {string} Nombre amigable de la tabla
 */
const obtenerNombreTabla = (tabla) => {
  const nombres = {
    'empresas': 'Empresas',
    'usuarios': 'Usuarios',
    'usuario_empresa': 'Asignaciones',
    'marcaciones': 'Marcaciones',
    'turnos': 'Turnos'
  }
  return nombres[tabla] || tabla.charAt(0).toUpperCase() + tabla.slice(1)
}

/**
 * Obtiene el nombre amigable del filtro
 * @param {string} filtro - Tipo de filtro activo
 * @returns {string} Nombre amigable del filtro
 */
const obtenerNombreFiltro = (filtro) => {
  const nombres = {
    'empresa': 'Empresas',
    'trabajador': 'Trabajadores',
    'sistema': 'Sistema'
  }
  return nombres[filtro] || filtro
}

/**
 * Formatea datos JSON para mostrar de manera legible
 * @param {string} datos - String JSON con los datos
 * @returns {string} Datos formateados para mostrar
 */
const formatearDatos = (datos) => {
  try {
    if (typeof datos === 'string') {
      const obj = JSON.parse(datos)
      
      // Formateo especial para diferentes tipos de datos
      const formatted = []
      
      for (const [key, value] of Object.entries(obj)) {
        let displayKey = key
        let displayValue = value
        
        // Traducir nombres de campos a español
        switch (key) {
          case 'emp_nombre':
            displayKey = 'Nombre'
            break
          case 'emp_rut':
            displayKey = 'RUT'
            break
          case 'emp_telefono':
            displayKey = 'Teléfono'
            break
          case 'emp_description':
            displayKey = 'Descripción'
            break
          case 'grupo_emp_idn':
            displayKey = 'Grupo'
            break
          case 'estado':
            displayKey = 'Estado'
            displayValue = value == 1 ? 'Activo' : 'Inactivo'
            break
          case 'activo':
            displayKey = 'Estado'
            displayValue = value ? 'Activo' : 'Inactivo'
            break
          case 'rol':
            displayKey = 'Rol'
            // Traducir roles al español
            switch (value) {
              case 'admin':
                displayValue = 'Administrador'
                break
              case 'empleador':
                displayValue = 'Empleador'
                break
              case 'trabajador':
                displayValue = 'Trabajador'
                break
              case 'fiscalizador':
                displayValue = 'Fiscalizador'
                break
              default:
                displayValue = value
            }
            break
          case 'email':
            displayKey = 'Email'
            break
          case 'nombre':
            displayKey = 'Nombre'
            break
          case 'apellido_pat':
            displayKey = 'Apellido Paterno'
            break
          case 'apellido_mat':
            displayKey = 'Apellido Materno'
            break
          case 'rut':
            displayKey = 'RUT'
            break
          case 'rol_en_empresa':
            displayKey = 'Rol en Empresa'
            // Traducir roles en empresa
            switch (value) {
              case 'admin':
                displayValue = 'Administrador'
                break
              case 'empleador':
                displayValue = 'Empleador'
                break
              case 'trabajador':
                displayValue = 'Trabajador'
                break
              default:
                displayValue = value
            }
            break
          default:
            displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
        }
        
        // Omitir campos internos o vacíos
        if (value !== null && value !== '' && !key.includes('idn') && key !== 'id') {
          formatted.push(`${displayKey}: ${displayValue}`)
        }
      }
      
      return formatted.join(' • ')
    }
    return datos
  } catch {
    return datos
  }
}

/**
 * Formatea la hora de un cambio
 * @param {string} fecha - Fecha y hora del cambio
 * @returns {string} Hora formateada
 */
const formatearHora = (fecha) => {
  return new Date(fecha).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ========== FUNCIONES PRINCIPALES ==========

/**
 * Carga los cambios del usuario desde el servidor
 * Se ejecuta cuando se abre el modal o cambia el usuario
 */
const cargarCambios = async () => {
  if (!props.usuarioId) return
  
  try {
    cargando.value = true
    error.value = null
    
    console.log('🔍 Cargando cambios para usuario:', props.usuarioId)
    console.log('🔍 Props completas del modal:', {
      usuarioId: props.usuarioId,
      usuarioNombre: props.usuarioNombre,
      usuarioRol: props.usuarioRol
    })
    
    // Llamar al servicio para obtener cambios del usuario
    const respuesta = await obtenerCambiosUsuario(props.usuarioId)
    
    console.log('🔍 Respuesta completa del servidor:', respuesta)
    
    if (respuesta.success) {
      cambios.value = respuesta.cambios || []
      console.log(`✅ ${cambios.value.length} cambios cargados para ${props.usuarioNombre}`)
      console.log('🔍 Cambios cargados:', cambios.value)
    } else {
      console.error('❌ Respuesta sin éxito:', respuesta)
      throw new Error(respuesta.message || 'Error al cargar cambios')
    }
    
  } catch (err) {
    console.error('❌ Error al cargar cambios:', err)
    error.value = `Error al cargar cambios: ${err.message}`
    cambios.value = []
  } finally {
    cargando.value = false
  }
}

/**
 * Cierra el modal y limpia los datos
 * Emite evento al componente padre para cerrar
 */
const cerrarModal = () => {
  emit('cerrar')
  // Limpiar datos cuando se cierra el modal
  cambios.value = []
  filtroActivo.value = ''
  error.value = null
}

/**
 * Exporta los cambios a un archivo CSV
 * Funcionalidad futura para generar reportes
 */
const exportarCambios = () => {
  // TODO: Implementar exportación a CSV/PDF
  alert('Funcionalidad de exportación próximamente disponible')
}

// ========== WATCHERS ==========

/**
 * Observa cambios en las props para recargar datos
 * Se ejecuta cuando se abre el modal o cambia el usuario
 */
watch([() => props.mostrar, () => props.usuarioId], ([nuevoMostrar, nuevoUsuarioId]) => {
  if (nuevoMostrar && nuevoUsuarioId) {
    cargarCambios()
  }
}, { immediate: true })
</script>