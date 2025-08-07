import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore.js'

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
            meta: { requiresGuest: false } // Deshabilitado para desarrollo
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('../components/vistas/Dashboard.vue'),
            meta: { requiresAuth: true } // Sin protección para desarrollo
        },
        // Rutas de reportes
        {
            path: '/reportes/asistencia',
            name: 'ReporteAsistencia',
            component: () => import('../components/vistas/reportes/ReporteAsistencia.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/reportes/jornada-diaria',
            name: 'ReporteJornadaDiaria',
            component: () => import('../components/vistas/reportes/ReporteJornadaDiaria.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/reportes/domingos-festivos',
            name: 'ReporteDomingosFestivos',
            component: () => import('../components/vistas/reportes/ReporteDomingosFestivos.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/reportes/modificaciones-turnos',
            name: 'ReporteModificacionesTurnos',
            component: () => import('../components/vistas/reportes/ReporteModificacionesTurnos.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/reportes/marcaciones-diarias',
            name: 'ReporteMarcacionesDiarias',
            component: () => import('../components/vistas/reportes/ReporteMarcacionesDiarias.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/reportes/incidentes-tecnicos',
            name: 'ReporteIncidentesTecnicos',
            component: () => import('../components/vistas/reportes/ReporteIncidentesTecnicos.vue'),
            meta: { requiresAuth: true }
        },
        // Rutas de configuración y utilidades
        {
            path: '/configuracion',
            name: 'Configuracion',
            component: () => import('../components/vistas/Configuracion.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/ayuda',
            name: 'Ayuda',
            component: () => import('../components/vistas/Ayuda.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/seleccionar-empresa',
            name: 'SeleccionarEmpresa',
            component: () => import('../components/vistas/SeleccionEmpresa.vue'),
            meta: { requiresAuth: true }   
        },
        // Ruta para página no encontrada
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

// Guard de navegación global (deshabilitado para desarrollo)
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