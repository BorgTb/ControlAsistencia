/**
 * Composable para mostrar notificaciones elegantes
 * Reemplaza los alerts nativos del navegador
 */

import { ref, nextTick } from 'vue'

const notifications = ref([])
let notificationId = 0

export function useNotification() {
  
  /**
   * Muestra una notificación de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms (por defecto 3000)
   */
  const showSuccess = (message, duration = 3000) => {
    showNotification(message, 'success', duration)
  }

  /**
   * Muestra una notificación de error
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms (por defecto 4000)
   */
  const showError = (message, duration = 4000) => {
    showNotification(message, 'error', duration)
  }

  /**
   * Muestra una notificación de información
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms (por defecto 3000)
   */
  const showInfo = (message, duration = 3000) => {
    showNotification(message, 'info', duration)
  }

  /**
   * Muestra una notificación de advertencia
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms (por defecto 3500)
   */
  const showWarning = (message, duration = 3500) => {
    showNotification(message, 'warning', duration)
  }

  /**
   * Función interna para crear notificaciones
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (success, error, info, warning)
   * @param {number} duration - Duración en ms
   */
  const showNotification = (message, type, duration) => {
    const id = ++notificationId
    const notification = {
      id,
      message,
      type,
      visible: false
    }

    notifications.value.push(notification)

    // Hacer visible la notificación en el siguiente tick
    nextTick(() => {
      const notif = notifications.value.find(n => n.id === id)
      if (notif) {
        notif.visible = true
      }
    })

    // Auto-remover después de la duración especificada
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  /**
   * Remueve una notificación específica
   * @param {number} id - ID de la notificación a remover
   */
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      // Animar salida
      notifications.value[index].visible = false
      
      // Remover del array después de la animación
      setTimeout(() => {
        const currentIndex = notifications.value.findIndex(n => n.id === id)
        if (currentIndex > -1) {
          notifications.value.splice(currentIndex, 1)
        }
      }, 300)
    }
  }

  /**
   * Limpia todas las notificaciones
   */
  const clearAllNotifications = () => {
    notifications.value = []
  }

  return {
    notifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
    clearAllNotifications
  }
}