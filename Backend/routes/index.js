import AuthRoutes from "./AuthRoutes.js";
import MarcacionesRoutes from "./MarcacionesRoutes.js";
import UserRoutes from "./UserRoutes.js";
import EmpresasRoutes from "./EmpresasRoutes.js";
import AdminRoutes from "./AdminRoutes.js";
import ReportesRoutes from "./ReportesRoutes.js";
import TestRoutes from "./TestRoutes.js";
import UserEmpresaRoutes from "./UserEmpresa.js";
import AuditoriaRoutes from "./AuditoriaRoutes.js";
import EstadisticasRoutes from "./EstadisticasRoutes.js";

const router = {
    login: AuthRoutes,
    marcaciones: MarcacionesRoutes,
    users: UserRoutes,
    userEmpresa: UserEmpresaRoutes,
    reportes: ReportesRoutes,
    admin: AdminRoutes,
    empresas: EmpresasRoutes,
    test: TestRoutes,
    auditoria: AuditoriaRoutes,
    estadisticas: EstadisticasRoutes
}

export default router;