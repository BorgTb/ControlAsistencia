import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import axios from 'axios'
import './style.css'
import App from './App.vue'
import router from './routes/index.js'

// Configuración global de Axios para comunicación con el backend
// Esto permite que todas las peticiones axios en la aplicación usen la misma URL base
const API_BASE_URL = (() => {
  // Verificar si estamos en un entorno Vite para obtener variables de entorno
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000'
  }
  // Fallback para otros entornos de desarrollo
  return process.env.VITE_API_URL || 'http://localhost:3000'
})()

// Configurar URL base para todas las peticiones axios
// Las rutas como "/api/user/usuarios" se convertirán en "http://localhost:3000/api/user/usuarios"
axios.defaults.baseURL = API_BASE_URL

// Configurar headers por defecto para todas las peticiones
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Configurar timeout global de 10 segundos para evitar peticiones colgadas
axios.defaults.timeout = 10000

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registro falló: ', registrationError)
      })
  })
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
