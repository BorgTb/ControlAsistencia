import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.js';

// Configuración de la URL base de la API
const API_BASE_URL = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }
  return process.env.VITE_API_URL || 'http://localhost:3000/api';
})();

// Cliente axios con interceptor para agregar el token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a cada petición
apiClient.interceptors.request.use(
  config => {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

class LugarService {
  /**
   * Crear un nuevo lugar
   */
  static async crearLugar(lugarData) {
    try {
      const response = await apiClient.post('/userEmpresa/lugares', lugarData);
      return response.data;
    } catch (error) {
      console.error('Error al crear lugar:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los lugares
   */
  static async obtenerTodosLosLugares() {
    try {
      const response = await apiClient.get('/userEmpresa/lugares');
      return response.data;
    } catch (error) {
      console.error('Error al obtener lugares:', error);
      throw error;
    }
  }

  /**
   * Obtener lugares por empresa
   */
  static async obtenerLugaresPorEmpresa(empresaId) {
    try {
      const response = await apiClient.get(`/userEmpresa/lugares/empresa/${empresaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener lugares por empresa:', error);
      throw error;
    }
  }

  /**
   * Obtener un lugar por ID
   */
  static async obtenerLugarPorId(lugarId) {
    try {
      const response = await apiClient.get(`/userEmpresa/lugares/${lugarId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener lugar:', error);
      throw error;
    }
  }

  /**
   * Actualizar un lugar
   */
  static async actualizarLugar(lugarId, lugarData) {
    try {
      const response = await apiClient.put(`/userEmpresa/lugares/${lugarId}`, lugarData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar lugar:', error);
      throw error;
    }
  }

  /**
   * Desactivar un lugar (soft delete)
   */
  static async desactivarLugar(lugarId) {
    try {
      const response = await apiClient.patch(`/userEmpresa/lugares/${lugarId}/desactivar`);
      return response.data;
    } catch (error) {
      console.error('Error al desactivar lugar:', error);
      throw error;
    }
  }

  /**
   * Activar un lugar
   */
  static async activarLugar(lugarId) {
    try {
      const response = await apiClient.patch(`/userEmpresa/lugares/${lugarId}/activar`);
      return response.data;
    } catch (error) {
      console.error('Error al activar lugar:', error);
      throw error;
    }
  }

  /**
   * Eliminar permanentemente un lugar
   */
  static async eliminarLugar(lugarId) {
    try {
      const response = await apiClient.delete(`/userEmpresa/lugares/${lugarId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar lugar:', error);
      throw error;
    }
  }

  /**
   * Buscar lugares por nombre
   */
  static async buscarLugaresPorNombre(nombre) {
    try {
      const response = await apiClient.get(`/userEmpresa/lugares/buscar/nombre?q=${encodeURIComponent(nombre)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar lugares:', error);
      throw error;
    }
  }

  /**
   * Obtener lugares activos por empresa
   */
  static async obtenerLugaresActivosPorEmpresa(empresaId) {
    try {
      const response = await apiClient.get(`/userEmpresa/lugares/empresa/${empresaId}/activos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener lugares activos:', error);
      throw error;
    }
  }
}

export default LugarService;
