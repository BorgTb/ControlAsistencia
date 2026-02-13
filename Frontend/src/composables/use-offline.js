import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useOffline() {
  const isOnline = ref(navigator.onLine)
  const pendingActions = ref([])
  const isSyncing = ref(false)
  
  const isOffline = computed(() => !isOnline.value)
  
  const updateOnlineStatus = async () => {
    const wasOffline = !isOnline.value
    isOnline.value = navigator.onLine
    
    // Si vuelve a estar online después de estar offline, procesar acciones pendientes
    if (isOnline.value && wasOffline && pendingActions.value.length > 0) {
      console.log('🔄 Conexión recuperada, iniciando sincronización...')
      await processPendingActions()
    }
  }
  
  const addPendingAction = (action) => {
    const actionWithId = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...action
    }
    
    pendingActions.value.push(actionWithId)
    
    // Persistir en localStorage
    localStorage.setItem('pendingActions', JSON.stringify(pendingActions.value))
    
    return actionWithId.id
  }
  
  const removePendingAction = (actionId) => {
    pendingActions.value = pendingActions.value.filter(action => action.id !== actionId)
    localStorage.setItem('pendingActions', JSON.stringify(pendingActions.value))
  }
  
  const processPendingActions = async () => {
    if (!isOnline.value || pendingActions.value.length === 0 || isSyncing.value) return
    
    isSyncing.value = true
    console.log(`🔄 Procesando ${pendingActions.value.length} acciones pendientes...`)
    
    const actionsToProcess = [...pendingActions.value]
    let successCount = 0
    let failCount = 0
    
    for (const action of actionsToProcess) {
      try {
        await executeAction(action)
        removePendingAction(action.id)
        successCount++
        console.log(`✅ Acción ${action.type} procesada exitosamente`)
      } catch (error) {
        failCount++
        console.error(`❌ Error procesando acción ${action.type}:`, error)
        // Si falla, mantener la acción para reintento posterior
      }
    }
    
    isSyncing.value = false
    
    // Disparar evento personalizado para notificar que terminó la sincronización
    const syncResult = {
      success: successCount,
      failed: failCount,
      total: actionsToProcess.length
    }
    
    window.dispatchEvent(new CustomEvent('offlineSyncCompleted', { 
      detail: syncResult 
    }))
    
    console.log(`🎉 Sincronización completada: ${successCount} exitosas, ${failCount} fallidas`)
    
    return syncResult
  }
  
  const executeAction = async (action) => {
    // Importar dinámicamente el servicio para evitar dependencias circulares
    const { default: AsistenciaService } = await import('../services/asistencia-service.js')
    
    switch (action.type) {
      case 'entrada':
        return await AsistenciaService.registrarEntrada(action.data.ubicacion, true)
      case 'salida':
        return await AsistenciaService.registrarSalida(action.data.ubicacion, true)
      case 'colacion':
        return await AsistenciaService.registrarColacion(action.data.ubicacion, action.data.tipoColacion, true)
      case 'termino_colacion':
        return await AsistenciaService.registrarTerminoColacion(action.data.ubicacion, true)
      case 'descanso':
        return await AsistenciaService.registrarDescanso(action.data.ubicacion, true)
      default:
        throw new Error(`Tipo de acción no soportado: ${action.type}`)
    }
  }
  
  const loadPendingActions = () => {
    const saved = localStorage.getItem('pendingActions')
    if (saved) {
      try {
        pendingActions.value = JSON.parse(saved)
      } catch (error) {
        console.error('Error cargando acciones pendientes:', error)
        pendingActions.value = []
      }
    }
  }
  
  // Función para forzar sincronización manual
  const forcSync = async () => {
    if (isOnline.value && pendingActions.value.length > 0) {
      return await processPendingActions()
    }
    return null
  }
  
  onMounted(() => {
    loadPendingActions()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Si está online al montar, procesar acciones pendientes
    if (isOnline.value && pendingActions.value.length > 0) {
      setTimeout(() => {
        processPendingActions()
      }, 1000) // Dar tiempo para que se monte completamente
    }
  })
  
  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })
  
  return {
    isOnline,
    isOffline,
    isSyncing,
    pendingActions: computed(() => pendingActions.value),
    addPendingAction,
    removePendingAction,
    processPendingActions,
    forcSync
  }
}
