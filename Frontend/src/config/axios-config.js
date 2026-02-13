/**
 * CONFIGURACIÓN DE AXIOS PARA COOKIES HTTP-ONLY
 * 
 * Este archivo configura una instancia de axios que automáticamente
 * envía cookies HTTP-only en lugar de usar Authorization headers.
 * 
 * USO:
 * import { apiClient } from '@/config/axios-config'
 * 
 * const response = await apiClient.get('/endpoint')
 * const response = await apiClient.post('/endpoint', data)
 */

import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store.js'

// URL base de la API
const API_BASE_URL = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
})()

// Crear instancia de axios configurada
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true // IMPORTANTE: Enviar cookies automáticamente
})

/**
 * RENOVACIÓN PROACTIVA DE TOKENS
 * 
 * Este sistema verifica ANTES de cada petición si el access token
 * está próximo a expirar y lo renueva preventivamente.
 * 
 * Esto es especialmente importante para:
 * - Descargas de archivos (Excel, PDF, etc.)
 * - Operaciones que pueden tardar varios segundos
 * - Evitar interrupciones en la experiencia del usuario
 */

// Variable para rastrear cuándo expira el access token
let tokenExpirationTime = null;
let isRefreshing = false;
let refreshPromise = null;

// Función para decodificar JWT y obtener tiempo de expiración (sin verificar)
const decodeTokenExpiration = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    return decoded.exp ? decoded.exp * 1000 : null; // Convertir a milisegundos
  } catch (error) {
    return null;
  }
};

// Función para actualizar tiempo de expiración del token
const updateTokenExpiration = (expiresAt) => {
  if (expiresAt) {
    tokenExpirationTime = expiresAt;
    console.log(`📅 Token expirará en ${Math.round((expiresAt - Date.now()) / 1000)}s`);
  }
};

// Exportar función para que el login pueda actualizar el tiempo
export const setTokenExpiration = (expiresAt) => {
  updateTokenExpiration(expiresAt);
};

// Función para renovar token proactivamente
const renewTokenIfNeeded = async () => {
  const now = Date.now();
  const timeUntilExpiration = tokenExpirationTime ? tokenExpirationTime - now : null;
  
  // Si el token expira en menos de 2 minutos, renovarlo
  const RENEWAL_THRESHOLD = 2 * 60 * 1000; // 2 minutos
  
  if (timeUntilExpiration && timeUntilExpiration < RENEWAL_THRESHOLD && timeUntilExpiration > 0) {
    console.log(`🔄 Token expira en ${Math.round(timeUntilExpiration / 1000)}s, renovando proactivamente...`);
    
    // Si ya hay una renovación en curso, esperar a que termine
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }
    
    isRefreshing = true;
    refreshPromise = axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    )
      .then(response => {
        if (response.data.success) {
          console.log('✅ Token renovado proactivamente');
          // Actualizar tiempo de expiración con la respuesta del servidor
          if (response.data.expiresAt) {
            updateTokenExpiration(response.data.expiresAt);
          } else {
            tokenExpirationTime = now + (15 * 60 * 1000); // Fallback: 15 minutos
          }
        }
        isRefreshing = false;
        refreshPromise = null;
        return response;
      })
      .catch(error => {
        console.error('❌ Error en renovación proactiva:', error);
        isRefreshing = false;
        refreshPromise = null;
        
        // MEJORA: Solo resetear si el refresh token está realmente expirado
        // No por errores de red temporales
        const errorMessage = error.response?.data?.message || error.message || '';
        if (errorMessage.includes('Refresh token') || 
            errorMessage.includes('expired') || 
            errorMessage.includes('revoked')) {
          console.log('🔴 Refresh token inválido, será manejado por interceptor reactivo');
          tokenExpirationTime = null;
        } else {
          console.log('⚠️ Error temporal de red, continuando con token actual...');
          // Mantener tokenExpirationTime para que el interceptor reactivo lo intente
        }
        
        // No lanzar error para permitir que la petición continúe
        // El interceptor reactivo manejará el 401 si el token realmente expiró
      });
    
    return refreshPromise;
  }
  
  return Promise.resolve();
};

// Interceptor de REQUEST - Renovación proactiva
apiClient.interceptors.request.use(
  async (config) => {
    // Las cookies HTTP-only se envían automáticamente
    
    // Intentar renovar token si es necesario ANTES de la petición
    try {
      await renewTokenIfNeeded();
    } catch (error) {
      console.warn('⚠️ No se pudo renovar token proactivamente, continuando con petición');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
// Incluye lógica de auto-refresh cuando el access token expira (REACTIVO)
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Capturar expiresAt si viene en la respuesta (login, refresh)
    if (response.data?.expiresAt) {
      updateTokenExpiration(response.data.expiresAt);
    }
    return response
  },
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config
    
    // PARSEAR RESPUESTA BLOB SI ES NECESARIO
    let errorData = error.response?.data;
    
    // Si la respuesta es un Blob (exportaciones Excel/CSV), parsearlo como JSON
    if (errorData instanceof Blob && errorData.type === 'application/json') {
      try {
        const text = await errorData.text();
        errorData = JSON.parse(text);
        // Reemplazar en error.response para que el resto del código funcione
        error.response.data = errorData;
      } catch (e) {
        console.warn('⚠️ No se pudo parsear Blob como JSON:', e);
      }
    }
    
    // LOGGING DETALLADO
    console.log('📥 Response error:', {
      status: error.response?.status,
      requiresRefresh: errorData?.requiresRefresh,
      requiresLogin: errorData?.requiresLogin,
      message: errorData?.message,
      path: originalRequest?.url,
      wasBlob: error.response?.data instanceof Blob
    });
    
    // Si recibimos un 401 con requiresRefresh, intentar renovar el token
    if (error.response?.status === 401 && 
        errorData?.requiresRefresh && 
        !originalRequest._retry) {
      
      // Si ya estamos renovando el token, encolar esta petición
      if (isRefreshing) {
        console.log('⏳ Petición encolada mientras se renueva el token');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log('♻️ Reintentando petición encolada');
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true
      isRefreshing = true;
      
      try {
        console.log('🔄 Access token expirado, renovando reactivamente...')
        
        // Llamar al endpoint de refresh
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        
        if (response.data.success) {
          console.log('✅ Token renovado reactivamente');
          
          // Actualizar tiempo de expiración
          if (response.data.expiresAt) {
            updateTokenExpiration(response.data.expiresAt);
          }
          
          // Procesar cola de peticiones pendientes
          isRefreshing = false;
          processQueue(null, response.data);
          
          // Reintentar la petición original con el nuevo access token
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        console.error('❌ Error al renovar token reactivamente:', refreshError)
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // MEJORA: Solo cerrar sesión si el refresh token está REALMENTE expirado/inválido
        const errorData = refreshError.response?.data;
        const errorMessage = errorData?.message || refreshError.message || '';
        const requiresLogin = errorData?.requiresLogin === true;
        
        // Cerrar sesión solo si:
        // 1. Backend indica requiresLogin: true
        // 2. El mensaje indica que el refresh token expiró/fue revocado
        const shouldLogout = requiresLogin || 
                           errorMessage.includes('Refresh token') || 
                           errorMessage.includes('expired') || 
                           errorMessage.includes('revoked');
        
        if (shouldLogout) {
          console.log('🔴 Refresh token inválido/expirado - cerrando sesión...')
          tokenExpirationTime = null;
          authStore.clearAuth()
          if (window.location.pathname !== '/') {
            window.location.href = '/'
          }
        } else {
          console.log('⚠️ Error temporal de red - NO cerrando sesión, mantener token')
          // NO resetear tokenExpirationTime para permitir reintento
        }
        
        return Promise.reject(refreshError)
      }
    }
    
    // Si recibimos un 401 sin requiresRefresh, verificar si debe cerrar sesión
    if (error.response?.status === 401 && !errorData?.requiresRefresh) {
      const requiresLogin = errorData?.requiresLogin === true;
      
      if (requiresLogin || originalRequest._retry) {
        console.log('❌ 401 sin requiresRefresh (requiresLogin:', requiresLogin, ') - cerrando sesión')
        tokenExpirationTime = null;
        authStore.clearAuth()
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
      } else {
        console.log('⚠️ 401 sin requiresRefresh pero puede ser temporal - NO cerrando sesión aún')
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
