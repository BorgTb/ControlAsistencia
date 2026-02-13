// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

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
    component: () => import('@/components/layouts/AuthLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/components/vistas/auth/Login.vue'),
      },
      {
        path: 'select-company',
        name: 'SelectCompany',
        component: () => import('@/components/vistas/auth/CompanySelector.vue'),
      }
    ]
  },

  // ===========================
  // PUBLIC ROUTES (sin layout)
  // ===========================
  {
    path: '/invitacion/:token',
    name: 'InvitacionEmpresa',
    component: () => import('@/components/InvitacionEmpresa.vue'),
    meta: { public: true }
  },
  {
    path: '/aprobar-modificacion',
    name: 'AprobarModificacion',
    component: () => import('@/components/vistas/Solicitudes/ModificacionMaracacion.vue'),
    meta: { requiresAuth: true }
  },

  // ===========================
  // ADMIN (usa AdminLayout)
  // ===========================
  {
    path: '/admin',
    component: () => import('@/components/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'empresas', name: 'AdminEmpresas', component: () => import('@/components/vistas/admin/AdminEmpresas.vue') },
      { path: 'roles', name: 'RolAdministracion', component: () => import('@/components/vistas/admin/Administracion.vue') },
      { path: 'usuarios', name: 'UsuariosPermisos', component: () => import('@/components/vistas/admin/UsuariosPermisos.vue') },
      { path: 'estadisticas', name: 'Estadisticas', component: () => import('@/components/vistas/admin/Estadisticas.vue') },
      { path: 'fiscalizacion', name: 'Fiscalizacion', component: () => import('@/components/vistas/admin/Fiscalizacion.vue') },
      { path: 'reportes-domingos', name: 'EmpresaReporteDomingosFestivos', component: () => import('@/components/vistas/empresa/ReportesDomingosFestivos.vue') },
    ]
  },

  // ===========================
  // EMPRESA / EMPLEADOR (usa EmpresaLayout)
  // ===========================
  {
    path: '/empresa',
    component: () => import('@/components/layouts/EmpresaLayout.vue'),
    meta: { requiresAuth: true, requiresEmpresa: true },
    children: [
      { path: 'dashboard', name: 'EmpresaDashboard', component: () => import('@/components/vistas/admin/Administrador.vue') },
      { path: 'trabajadores', name: 'EmpresaTrabajadores', component: () => import('@/components/vistas/empresa/GestionTrabajadores.vue') },
      { path: 'trabajadores/asociar', name: 'EmpresaAsociarTrabajador', component: () => import('@/components/vistas/empresa/AsociarTrabajador.vue') },
      { path: 'turnos', name: 'EmpresaTurnos', component: () => import('@/components/vistas/empresa/ControlTurnos.vue') },
      { path: 'marcaciones', name: 'EmpresaMarcaciones', component: () => import('@/components/vistas/empresa/GestionMarcaciones.vue') },

      // Reportes
      { path: 'reportes', name: 'EmpresaReportes', component: () => import('@/components/vistas/empresa/Reportes.vue') },
      { path: 'reportes/asistencia', name: 'EmpresaReporteAsistencia', component: () => import('@/components/vistas/empresa/ReporteAsistencia.vue') },
      { path: 'reportes/jornada-diaria', name: 'EmpresaReporteJornadaDiaria', component: () => import('@/components/vistas/empresa/ReporteJornadaDiaria.vue') },

      // Otros
      { path: 'historial-solicitudes', name: 'HistorialSolicitudes', component: () => import('@/components/vistas/empresa/HistorialSolicitudes.vue') },
      { path: 'lugares', name: 'EmpresaLugares', component: () => import('@/components/vistas/empresa/GestionLugares.vue') },
      { path: 'solicitudes-trabajadores', name: 'EmpresaSolicitudesTrabajadores', component: () => import('@/components/vistas/empresa/SolicitudesTrabajadores.vue') },
      { path: 'configuracion', name: 'EmpresaConfiguracion', component: () => import('@/components/vistas/empresa/Configuracion.vue') },
      { path: 'exportacion-datos', name: 'EmpresaExportacionDatos', component: () => import('@/components/vistas/empresa/ExportacionDatos.vue') },
      { path: 'dispositivos', name: 'EmpresaDispositivos', component: () => import('@/components/vistas/empresa/GestionDispositivos.vue') },
    ]
  },

  // ===========================
  // TRABAJADOR (usa TrabajadorLayout)
  // ===========================
  {
    path: '/usuario',
    component: () => import('@/components/layouts/TrabajadorLayout.vue'),
    meta: { requiresAuth: true, requiresUser: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/components/vistas/trabajador/Dashboard.vue') },
      { path: 'configuracion', name: 'ConfigUser', component: () => import('@/components/vistas/trabajador/ConfigUser.vue') },
      { path: 'historial', name: 'HistorialUsuario', component: () => import('@/components/vistas/trabajador/HistorialUsuario.vue') },
      { path: 'solicitudes', name: 'Solicitudes', component: () => import('@/components/vistas/trabajador/Solicitudes.vue') },
      { path: 'dias-trabajados', name: 'DiasTrabajados', component: () => import('@/components/vistas/trabajador/DiasTrabajados.vue') },
    ]
  },

  // ===========================
  // 404 - Página no encontrada
  // ===========================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/vistas/NotFound.vue')
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
