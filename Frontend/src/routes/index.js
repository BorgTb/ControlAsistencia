import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

// Configuración del base URL
const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.BASE_URL
  }
  return '/'
}

const router = createRouter({
    history: createWebHistory(getBaseUrl()),
    routes: [
        {
            path: '/',
            name: 'Login',
            component: () => import('../components/vistas/Login.vue'),
            meta: { requiresGuest: true } // Solo para usuarios no autenticados
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('../components/vistas/Dashboard.vue'), // Necesitarás crear este componente
            meta: { requiresAuth: true }
        },
        {
            path: '/configuracion',
            name: 'ConfigUser',
            component: () => import('../components/vistas/ConfigUser.vue'),
            meta: { requiresAuth: true }    
        },
        {
            path: '/administracion',
            name: 'Admin',
            component: () => import('../components/vistas/Administrador.vue'),
            meta: { requiresAuth: false }
        },
        // Agregar más rutas según necesites
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            redirect: '/'
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    // Verificar si la ruta requiere autenticación
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // Redirigir al login si no está autenticado
        next({ name: 'Login' })
        return
    }
    
    // Verificar si la ruta es solo para invitados (usuarios no autenticados)
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        // Redirigir al dashboard si ya está autenticado
        next({ name: 'Dashboard' })
        return
    }
    
    next()
})

export default router