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

  // Actualizar un dispositivo
  actualizarDispositivo(serial, data) {
    return apiClient.put(`/zk/devices/${serial}`, data);
  },

  // Eliminar un dispositivo
  eliminarDispositivo(serial) {
    return apiClient.delete(`/zk/devices/${serial}`);
  },

  // Enviar comando a dispositivo
  enviarComando(serial, action, payload = {}, timeout = 10000) {
    return apiClient.post(`/zk/devices/${serial}/command`, { action, payload, timeout });
  },

  // Obtener usuarios del dispositivo
  obtenerUsuarios(serial) {
    return apiClient.get(`/zk/devices/${serial}/users`, {
      timeout: 20000 // 20 segundos para dar tiempo a la sincronización
    });
  },

  // Eliminar usuario del dispositivo
  eliminarUsuarioDispositivo(serial, userId) {
    return apiClient.delete(`/zk/devices/${serial}/users`, { data: { user_id: userId } });
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
