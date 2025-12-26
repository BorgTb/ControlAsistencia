import { ref } from 'vue';
import dispositivosService from '@/services/dispositivosService.js';


export function useDispositivos() {
  const dispositivos = ref([]);
  const dispositivo = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Obtener todos los dispositivos
  const fetchDispositivos = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.getDispositivos();
      console.log('res dispositivos: ', res);
      // El backend devuelve { success, count, data: [...] }
      dispositivos.value = res.data.data || [];
    } catch (err) {
      error.value = err;
      console.error('Error al obtener dispositivos:', err);
    } finally {
      loading.value = false;
    }
  };

  // Obtener dispositivos online
  const fetchDispositivosOnline = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.getDispositivosOnline();
      dispositivos.value = res.data.data || [];
    } catch (err) {
      error.value = err;
      console.error('Error al obtener dispositivos online:', err);
    } finally {
      loading.value = false;
    }
  };

  // Obtener un dispositivo por serial
  const fetchDispositivo = async (serial) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.getDispositivo(serial);
      // El backend devuelve { success, data: {...} }
      dispositivo.value = res.data.data || null;
    } catch (err) {
      error.value = err;
      console.error('Error al obtener dispositivo:', err);
    } finally {
      loading.value = false;
    }
  };

  // Crear un dispositivo
  const crearDispositivo = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.crearDispositivo(data);
      await fetchDispositivos();
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al crear dispositivo:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar un dispositivo
  const actualizarDispositivo = async (serial, data) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.actualizarDispositivo(serial, data);
      await fetchDispositivos();
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al actualizar dispositivo:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar un dispositivo
  const eliminarDispositivo = async (serial) => {
    loading.value = true;
    error.value = null;
    try {
      await dispositivosService.eliminarDispositivo(serial);
      await fetchDispositivos();
    } catch (err) {
      error.value = err;
      console.error('Error al eliminar dispositivo:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Enviar comando a dispositivo
  const enviarComando = async (serial, action, payload = {}, timeout = 30000) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.enviarComando(serial, action, payload, timeout);
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al enviar comando:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Obtener usuarios del dispositivo
  const obtenerUsuarios = async (serial) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.obtenerUsuarios(serial);
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al obtener usuarios:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sincronizar tiempo
  const sincronizarTiempo = async (serial) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.sincronizarTiempo(serial);
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al sincronizar tiempo:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Obtener asistencia
  const obtenerAsistencia = async (serial, startDate, endDate) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.obtenerAsistencia(serial, startDate, endDate);
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al obtener asistencia:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Obtener información del dispositivo
  const obtenerInfo = async (serial) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.obtenerInfo(serial);
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al obtener info:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Reiniciar dispositivo
  const reiniciar = async (serial) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.reiniciar(serial);
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al reiniciar:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Limpiar logs
  const limpiarLogs = async (serial) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.limpiarLogs(serial);
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al limpiar logs:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Abrir puerta
  const abrirPuerta = async (serial, duration = 5) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await dispositivosService.abrirPuerta(serial, duration);
      return res.data.data;
    } catch (err) {
      error.value = err;
      console.error('Error al abrir puerta:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Crear usuario
  const crearUsuario = async (serial, userData) => {
    loading.value = true;
    error.value = null;
    try {
      // userData debe coincidir con lo que espera el firmware: { uid, user_id, name, privilege, ... }
      const res = await enviarComando(serial, 'CREATE_USER', userData);
      return res;
    } catch (err) {
      console.error('Error al crear usuario:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (serial, userId) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await enviarComando(serial, 'DELETE_USER', { user_id: userId });
      return res;
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    dispositivos,
    dispositivo,
    loading,
    error,
    fetchDispositivos,
    fetchDispositivosOnline,
    fetchDispositivo,
    crearDispositivo,
    actualizarDispositivo,
    eliminarDispositivo,
    enviarComando,
    obtenerUsuarios,
    crearUsuario,    // Exportado
    eliminarUsuario, // Exportado
    sincronizarTiempo,
    obtenerAsistencia,
    obtenerInfo,
    reiniciar,
    limpiarLogs,
    abrirPuerta
  };
}
