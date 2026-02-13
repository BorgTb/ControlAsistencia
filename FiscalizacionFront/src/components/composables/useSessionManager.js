import { ref } from 'vue'
import { useAuthStore } from '../../store/auth-store.js'
import { useDataStore } from '../../store/dataStorage.js'

export function useSessionManager() {
  const authStore = useAuthStore()
  const dataStore = useDataStore()
  
  const modalSesionVisible = ref(false)
  const motivoExpiracion = ref('inactividad')
  const detallesExpiracion = ref([])

  const mostrarModalSesionExpirada = (motivo = 'inactividad', detalles = []) => {
    motivoExpiracion.value = motivo
    detallesExpiracion.value = detalles
    modalSesionVisible.value = true
  }

  const cerrarSesionPorExpiracion = (motivo = 'token_expirado', detalles = []) => {
    console.warn(`Sesión cerrada por: ${motivo}`)
    
    // Limpiar stores
    authStore.clearAuth()
    dataStore.clearData()
    
    // Mostrar modal
    mostrarModalSesionExpirada(motivo, detalles)
  }

  const manejarErrorToken = (error, contexto = '') => {
    const detalles = [
      `Contexto: ${contexto}`,
      `Hora: ${new Date().toLocaleTimeString()}`,
      'Verifique su conexión a internet'
    ]

    if (error.response?.status === 401) {
      cerrarSesionPorExpiracion('token_expirado', [
        ...detalles,
        'El token de acceso ha expirado'
      ])
    } else if (error.response?.status === 403) {
      cerrarSesionPorExpiracion('acceso_no_autorizado', [
        ...detalles,
        'No tiene permisos para acceder a este recurso'
      ])
    } else {
      cerrarSesionPorExpiracion('error_servidor', [
        ...detalles,
        `Error: ${error.message || 'Error de conexión'}`
      ])
    }
  }

  const cerrarModal = () => {
    modalSesionVisible.value = false
  }

  const handleRedirect = () => {
    modalSesionVisible.value = false
    // La navegación se maneja en el modal
  }

  return {
    // Estado
    modalSesionVisible,
    motivoExpiracion,
    detallesExpiracion,
    
    // Métodos
    mostrarModalSesionExpirada,
    cerrarSesionPorExpiracion,
    manejarErrorToken,
    cerrarModal,
    handleRedirect
  }
}
