import { apiClient } from '@/config/axios-config.js';

/**
 * Servicio para gestionar dispositivos ZK
 * Usa apiClient que maneja automáticamente cookies HTTP-only y renovación de tokens
 */
export default {
  // Obtener todos los dispositivos
  getDispositivos() {
    return apiClient.get('/zk/devices');
  },

  // Obtener dispositivos online
  getDispositivosOnline() {
    return apiClient.get('/zk/devices/online');
  },

  // Obtener un dispositivo por serial
  getDispositivo(serial) {
    return apiClient.get(`/zk/devices/${serial}`);
  },

  // Registrar un nuevo dispositivo
  crearDispositivo(data) {
    return apiClient.post('/zk/devices', data);
  },

  // Actualizar un dispositivo (nota: el backend no tiene PUT, usamos POST para comandos)
  actualizarDispositivo(serial, data) {
    // El backend actual no tiene endpoint de actualización directa
    // Necesitarías implementarlo o usar registerDevice que sobrescribe
    return apiClient.post('/zk/devices', { serial, ...data });
  },

  // Eliminar un dispositivo
  eliminarDispositivo(serial) {
    return apiClient.delete(`/zk/devices/${serial}`);
  },

  // Enviar comando a dispositivo
  enviarComando(serial, action, payload = {}, timeout = 30000) {
    return apiClient.post(`/zk/devices/${serial}/command`, { action, payload, timeout });
  },

  // Obtener usuarios del dispositivo
  obtenerUsuarios(serial) {
    return apiClient.get(`/zk/devices/${serial}/users`);
  },

  // Sincronizar tiempo
  sincronizarTiempo(serial) {
    return apiClient.post(`/zk/devices/${serial}/sync-time`);
  },

  // Obtener asistencia
  obtenerAsistencia(serial, startDate, endDate) {
    return apiClient.get(`/zk/devices/${serial}/attendance`, {
      params: { startDate, endDate }
    });
  },

  // Obtener información del dispositivo
  obtenerInfo(serial) {
    return apiClient.get(`/zk/devices/${serial}/info`);
  },

  // Reiniciar dispositivo
  reiniciar(serial) {
    return apiClient.post(`/zk/devices/${serial}/restart`);
  },

  // Limpiar logs
  limpiarLogs(serial) {
    return apiClient.post(`/zk/devices/${serial}/clear-logs`);
  },

  // Abrir puerta
  abrirPuerta(serial, duration = 5) {
    return apiClient.post(`/zk/devices/${serial}/open-door`, { duration });
  }
};
