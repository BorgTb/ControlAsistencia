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
            // Ruta para la gestión de usuarios y sus permisos del sistema
            // Permite a los administradores crear, editar, eliminar usuarios y asignar roles/permisos específicos
            path: '/usuarios-permisos',
            name: 'UsuariosPermisos',
            component: () => import('../components/vistas/UsuariosPermisos.vue'), // Lazy loading para optimizar rendimiento
            meta: { requiresAuth: true, requiresAdmin: true } // Solo administradores autenticados pueden acceder
        },
        {
            // Ruta para visualizar estadísticas y métricas del sistema de asistencia
            // Muestra reportes gráficos, tendencias de asistencia, datos agregados por empresa/usuario
            path: '/estadisticas',
            name: 'Estadisticas',
            component: () => import('../components/vistas/Estadisticas.vue'), // Carga dinámica del componente
            meta: { requiresAuth: true, requiresAdmin: true } // Acceso restringido a administradores únicamente
        },
        {
            // Ruta para herramientas de fiscalización y auditoría del sistema
            // Permite revisar logs, auditar marcaciones, detectar irregularidades en asistencia
            path: '/fiscalizacion',
            name: 'Fiscalizacion',
            component: () => import('../components/vistas/Fiscalizacion.vue'), // Importación lazy para mejor performance
            meta: { requiresAuth: true, requiresAdmin: true } // Solo para administradores con permisos de auditoría
        },
        {
            // Dashboard principal del sistema - panel de control centralizado
            // Muestra resumen general, métricas clave, accesos rápidos a funciones principales
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('../components/vistas/Dashboard.vue'), // Necesitarás crear este componente
            meta: { requiresAuth: true, requiresUser: true } // Accesible para todos los usuarios autenticados (no solo admins)
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
            path: '/solicitudes',
            name: 'Solicitudes',
            component: () => import('../components/vistas/Solicitudes.vue'),
            meta: { requiresAuth: true, requiresUser: true }
        },
        {
            path: '/dias-trabajados',
            name: 'DiasTrabajados',
            component: () => import('../components/vistas/DiasTrabajados.vue'),
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
            path: '/empresa/reportes/asistencia',
            name: 'EmpresaReporteAsistencia',
            component: () => import('../components/vistas/empresa/ReporteAsistencia.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/reportes/jornada-diaria',
            name: 'EmpresaReporteJornadaDiaria',
            component: () => import('../components/vistas/empresa/ReporteJornadaDiaria.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/reportes/domingos-festivos',
            name: 'EmpresaReporteDomingosFestivos',
            component: () => import('../components/vistas/empresa/ReportesDomingosFestivos.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
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
        {
            path: '/aprobar-modificacion',
            name: 'AprobarModificacion',
            component: () => import('../components/vistas/Solicitudes/ModificacionMaracacion.vue'),
        },
        {
            path: '/empresa/historial-solicitudes',
            name: 'HistorialSolicitudes',
            component: () => import('../components/vistas/empresa/HistorialSolicitudes.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/lugares',
            name: 'EmpresaLugares',
            component: () => import('../components/vistas/empresa/GestionLugares.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        {
            path: '/empresa/solicitudes-trabajadores',
            name: 'EmpresaSolicitudesTrabajadores',
            component: () => import('../components/vistas/empresa/SolicitudesTrabajadores.vue'),
            meta: { requiresAuth: true, requiresEmpresa: true }
        },
        // Ruta comodín para manejar rutas no definidas (404)
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
    const authStore = useAuthStore()
    
    // Definir rutas por rol
    const adminRoutes = [
        '/administrarempresa',
        '/RolAdministracion', 
        '/empresa/reportes/domingos-festivos',
        '/usuarios-permisos',
        '/estadisticas',
        '/fiscalizacion'
    ]
    
    const empleadorRoutes = [
        '/administracion',
        '/empresa/dashboard',
        '/empresa/trabajadores',
        '/empresa/turnos',
        '/empresa/marcaciones',
        '/empresa/reportes',
        '/empresa/reportes/asistencia',
        '/empresa/configuracion',
        '/empresa/trabajadores/asociar',
        '/empresa/historial-solicitudes',
        '/empresa/lugares',
        '/empresa/reportes/jornada-diaria',
        '/empresa/solicitudes-trabajadores'
    ]
    
    const trabajadorRoutes = [
        '/dashboard',
        '/configuracion',
        '/historial',
        '/solicitudes',
        '/dias-trabajados'
    ]
    
    const guestRoutes = [
        '/',
        '/aprobar-modificacion'
    ]
    
    // Verificar si la ruta es solo para invitados (usuarios no autenticados)
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        // Redirigir según el rol del usuario autenticado
        if (authStore.user?.rol === 'admin' || authStore.user?.esAdmin) {
            next({ name: 'AdminEmpresas' })
        } else if (authStore.user?.rol === 'empleador' || authStore.user?.esEmpleador) {
            next({ name: 'EmpresaDashboard' })
        } else if (authStore.user?.rol === 'trabajador' || authStore.user?.esTrabajador) {
            next({ name: 'Dashboard' })
        } else {
            next({ name: 'Login' })
        }
        return
    }
    
    // Verificar si la ruta requiere autenticación
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'Login' })
        return
    }
    
    // Si el usuario está autenticado, verificar permisos por rol
    if (authStore.isAuthenticated) {
        const userRole = authStore.user?.rol
        const currentPath = to.path
        
        // Verificar acceso para ADMIN
        if (userRole === 'admin' || authStore.user?.esAdmin) {
            // Admin solo puede acceder a rutas de admin
            if (!adminRoutes.includes(currentPath)) {
                console.warn('Acceso denegado: Admin intentando acceder a ruta no autorizada')
                next({ name: 'AdminEmpresas' })
                return
            }
        }
        // Verificar acceso para EMPLEADOR
        else if (userRole === 'empleador' || authStore.user?.esEmpleador) {
            // Empleador solo puede acceder a rutas de empresa
            if (!empleadorRoutes.includes(currentPath)) {
                console.warn('Acceso denegado: Empleador intentando acceder a ruta no autorizada')
                next({ name: 'EmpresaDashboard' })
                return
            }
        }
        // Verificar acceso para TRABAJADOR
        else if (userRole === 'trabajador' || authStore.user?.esTrabajador) {
            // Trabajador solo puede acceder a rutas de trabajador
            if (!trabajadorRoutes.includes(currentPath)) {
                console.warn('Acceso denegado: Trabajador intentando acceder a ruta no autorizada')
                next({ name: 'Dashboard' })
                return
            }
        }
        // Si no tiene rol válido, redirigir al login
        else {
            console.warn('Usuario sin rol válido')
            next({ name: 'Login' })
            return
        }
    }
    
    next()
})

export default router