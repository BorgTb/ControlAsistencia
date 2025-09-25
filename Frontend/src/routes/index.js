import { createRouter, createWebHistory } from 'vue-router'
// Importar solo el composable, no el store directamente. El store debe inicializarse dentro del guard para evitar errores de contexto.
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
            meta: { requiresGuest: true} // Solo para usuarios no autenticados
        },
        {
            path: '/administrarempresa',
            name: 'AdminEmpresas',
            component: () => import('../components/vistas/AdminEmpresas.vue'),
            meta: { requiresAuth: true, requiresAdmin: true } // Solo para administradores autenticados
        },
        {
            path: '/RolAdministracion',
            name: 'RolAdministracion',
            component: () => import('../components/vistas/Administracion.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('../components/vistas/Dashboard.vue'), // Necesitarás crear este componente
            meta: { requiresAuth: true, requiresUser: true }
        },
        {
            path: '/configuracion',
            name: 'ConfigUser',
            component: () => import('../components/vistas/ConfigUser.vue'),
            meta: { requiresAuth: true, requiresUser: true}    
        },
        {
            path: '/historial',
            name: 'HistorialUsuario',
            component: () => import('../components/vistas/HistorialUsuario.vue'),
            meta: { requiresAuth: true, requiresUser: true }
        },
        {
            path: '/administracion',
            name: 'Empresa',
            component: () => import('../components/vistas/Administrador.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        // Rutas de la Empresa
        {
            path: '/empresa/dashboard',
            name: 'EmpresaDashboard',
            component: () => import('../components/vistas/Administrador.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/trabajadores',
            name: 'EmpresaTrabajadores',
            component: () => import('../components/vistas/empresa/GestionTrabajadores.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/turnos',
            name: 'EmpresaTurnos',
            component: () => import('../components/vistas/empresa/ControlTurnos.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/marcaciones',
            name: 'EmpresaMarcaciones',
            component: () => import('../components/vistas/empresa/GestionMarcaciones.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/reportes',
            name: 'EmpresaReportes',
            component: () => import('../components/vistas/empresa/Reportes.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/configuracion',
            name: 'EmpresaConfiguracion',
            component: () => import('../components/vistas/empresa/Configuracion.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/trabajadores/asociar',
            name: 'EmpresaAsociarTrabajador',
            component: () => import('../components/vistas/empresa/AsociarTrabajador.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
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
    // Inicializar el store dentro del guard para evitar ReferenceError de inicialización.
    // Esto asegura que el store esté disponible en el contexto de Vue.
    const authStore = useAuthStore()
    // Verificar si la ruta /administrarempresa es accedida por un usuario que no es admin
    if (to.path === '/administrarempresa' && authStore.isAuthenticated && !authStore.esAdmin) {
        // Redirigir según el rol del usuario
        if (authStore.user?.rol === 'trabajador') {
            next({ name: 'Dashboard' })
        } else if (authStore.user?.rol === 'empleador') {
            next({ name: 'EmpresaDashboard' })
        } else {
            next({ name: 'Login' })
        }
        return
    }
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
    // Verificar si la ruta requiere permisos de empresa
    if (to.meta.requiresEmpresa && authStore.isAuthenticated) {
        // Verificar si el usuario tiene rol de empresa
        console.log('authStore.user:', authStore.user);
        if (!authStore.user?.esEmpleador && !authStore.user?.rol?.includes('empleador')) {
            // Redirigir al dashboard si no es empresa
            console.warn('Acceso denegado: Se requieren permisos de empresa')
            next({ name: 'Dashboard' })
            return
        }
    }
    // Verificar si la ruta requiere permisos de usuario/trabajador
    if (to.meta.requiresUser && authStore.isAuthenticated) {
        // Verificar si el usuario tiene rol de trabajador/empleado
        if (!authStore.user?.esTrabajador && !authStore.user?.rol?.includes('trabajador')) {
            // Redirigir a empresa si no es trabajador
            console.warn('Acceso denegado: Se requieren permisos de trabajador')
            next({ name: 'Empresa' })
            return
        }
    }
    next()
})

export default router