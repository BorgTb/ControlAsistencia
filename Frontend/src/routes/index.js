// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store.js'

// ===========================
// BASE CONFIG
// ===========================
const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env)
    return import.meta.env.BASE_URL
  return '/'
}

// ===========================
// ROUTES
// ===========================
const routes = [

  // ===========================
  // AUTH (usa AuthLayout)
  // ===========================
  {
    path: '/',
    component: () => import('@/components/layouts/auth-layout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/components/vistas/auth/login-view.vue'),
      },
      {
        path: 'select-company',
        name: 'SelectCompany',
        component: () => import('@/components/vistas/auth/company-selector.vue'),
      }
    ]
  },

  // ===========================
  // PUBLIC ROUTES (sin layout)
  // ===========================
  {
    path: '/invitacion/:token',
    name: 'InvitacionEmpresa',
    component: () => import('@/components/invitacion-empresa.vue'),
    meta: { public: true }
  },
  {
    path: '/aprobar-modificacion',
    name: 'AprobarModificacion',
    component: () => import('@/components/vistas/solicitudes-usuario/modificacion-maracacion.vue'),
    meta: { requiresAuth: true }
  },

  // ===========================
  // ADMIN (usa AdminLayout)
  // ===========================
  {
    path: '/admin',
    component: () => import('@/components/layouts/admin-layout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'empresas', name: 'AdminEmpresas', component: () => import('@/components/vistas/admin/admin-empresas.vue') },
      { path: 'roles', name: 'RolAdministracion', component: () => import('@/components/vistas/admin/administracion.vue') },
      { path: 'usuarios', name: 'UsuariosPermisos', component: () => import('@/components/vistas/admin/usuarios-permisos.vue') },
      { path: 'estadisticas', name: 'Estadisticas', component: () => import('@/components/vistas/admin/estadisticas.vue') },
      { path: 'fiscalizacion', name: 'Fiscalizacion', component: () => import('@/components/vistas/admin/fiscalizacion.vue') },
      { path: 'reportes-domingos', name: 'EmpresaReporteDomingosFestivos', component: () => import('@/components/vistas/empresa/reportes-domingos-festivos.vue') },
    ]
  },

  // ===========================
  // EMPRESA / EMPLEADOR (usa EmpresaLayout)
  // ===========================
  {
    path: '/empresa',
    component: () => import('@/components/layouts/empresa-layout.vue'),
    meta: { requiresAuth: true, requiresEmpresa: true },
    children: [
      { path: 'dashboard', name: 'EmpresaDashboard', component: () => import('@/components/vistas/admin/administrador.vue') },
      { path: 'trabajadores', name: 'EmpresaTrabajadores', component: () => import('@/components/vistas/empresa/gestion-trabajadores.vue') },
      { path: 'trabajadores/asociar', name: 'EmpresaAsociarTrabajador', component: () => import('@/components/vistas/empresa/asociar-trabajador.vue') },
      { path: 'turnos', name: 'EmpresaTurnos', component: () => import('@/components/vistas/empresa/control-turnos.vue') },
      { path: 'marcaciones', name: 'EmpresaMarcaciones', component: () => import('@/components/vistas/empresa/gestion-marcaciones.vue') },

      // Reportes
      { path: 'reportes', name: 'EmpresaReportes', component: () => import('@/components/vistas/empresa/reportes.vue') },
      { path: 'reportes/asistencia', name: 'EmpresaReporteAsistencia', component: () => import('@/components/vistas/empresa/reporte-asistencia.vue') },
      { path: 'reportes/jornada-diaria', name: 'EmpresaReporteJornadaDiaria', component: () => import('@/components/vistas/empresa/reporte-jornada-diaria.vue') },

      // Otros
      { path: 'historial-solicitudes', name: 'HistorialSolicitudes', component: () => import('@/components/vistas/empresa/historial-solicitudes.vue') },
      { path: 'lugares', name: 'EmpresaLugares', component: () => import('@/components/vistas/empresa/gestion-lugares.vue') },
      { path: 'solicitudes-trabajadores', name: 'EmpresaSolicitudesTrabajadores', component: () => import('@/components/vistas/empresa/solicitudes-trabajadores.vue') },
      { path: 'configuracion', name: 'EmpresaConfiguracion', component: () => import('@/components/vistas/empresa/configuracion.vue') },
      { path: 'exportacion-datos', name: 'EmpresaExportacionDatos', component: () => import('@/components/vistas/empresa/exportacion-datos.vue') },
      { path: 'dispositivos', name: 'EmpresaDispositivos', component: () => import('@/components/vistas/empresa/gestion-dispositivos.vue') },
    ]
  },

  // ===========================
  // TRABAJADOR (usa TrabajadorLayout)
  // ===========================
  {
    path: '/usuario',
    component: () => import('@/components/layouts/trabajador-layout.vue'),
    meta: { requiresAuth: true, requiresUser: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/components/vistas/trabajador/dashboard.vue') },
      { path: 'configuracion', name: 'ConfigUser', component: () => import('@/components/vistas/trabajador/config-user.vue') },
      { path: 'historial', name: 'HistorialUsuario', component: () => import('@/components/vistas/trabajador/historial-usuario.vue') },
      { path: 'solicitudes', name: 'Solicitudes', component: () => import('@/components/vistas/trabajador/solicitudes.vue') },
      { path: 'dias-trabajados', name: 'DiasTrabajados', component: () => import('@/components/vistas/trabajador/dias-trabajados.vue') },
    ]
  },

  // ===========================
  // 404 - Página no encontrada
  // ===========================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/vistas/not-found.vue')
  }

]

// ===========================
// CREATE ROUTER
// ===========================
const router = createRouter({
  history: createWebHistory(getBaseUrl()),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// ===========================
// NAVIGATION GUARD - Multi-rol support
// ===========================
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Rutas para invitados (requiresGuest)
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    // Si está autenticado, redirigir según roles (prioridad: admin > empleador > trabajador)
    const roles = auth.userRoles

    if (roles.includes('admin')) {
      return next("/admin/empresas")
    }
    if (roles.includes('empleador')) {
      return next("/empresa/dashboard")
    }
    if (roles.includes('trabajador')) {
      return next("/usuario/dashboard")
    }
    if (roles.includes('fiscalizador')) {
      return next("/fiscalizador/dashboard")
    }
    return next("/")
  }

  // Rutas que requieren login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Guardar la ruta destino para redirigir después del login
    return next({ path: "/", query: { redirect: to.fullPath } })
  }

  // Validar acceso por rol específico
  if (to.meta.requiresAdmin && !auth.hasRole('admin')) {
    console.warn('⚠️ Acceso denegado: requiere rol admin')
    return next("/")
  }

  if (to.meta.requiresEmpresa && !auth.hasAnyRole(['empleador', 'admin'])) {
    console.warn('⚠️ Acceso denegado: requiere rol empleador o admin')
    return next("/")
  }

  if (to.meta.requiresUser && !auth.hasAnyRole(['trabajador', 'admin'])) {
    console.warn('⚠️ Acceso denegado: requiere rol trabajador o admin')
    return next("/")
  }

  // Validar rol específico si está definido en meta.role
  if (to.meta.role && !auth.hasRole(to.meta.role)) {
    console.warn(`⚠️ Acceso denegado: requiere rol ${to.meta.role}`)
    return next("/")
  }

  next()
})


export default router
