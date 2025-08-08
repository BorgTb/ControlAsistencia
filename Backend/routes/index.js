import AuthRoutes from "./AuthRoutes.js";
import MarcacionesRoutes from "./MarcacionesRoutes.js";
import UserRoutes from "./UserRoutes.js";
import EmpresasRoutes from "./EmpresasRoutes.js";
import AdminRoutes from "./AdminRoutes.js";
import ReportesRoutes from "./ReportesRoutes.js";
import TestRoutes from "./TestRoutes.js";

const router = {
    login: AuthRoutes,
    marcaciones: MarcacionesRoutes,
    users: UserRoutes,
    reportes: ReportesRoutes,
    admin: AdminRoutes,
    empresas: EmpresasRoutes,
    test: TestRoutes
}

export default router;