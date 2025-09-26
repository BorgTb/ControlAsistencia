import AuthRoutes from "./AuthRoutes.js";
import MarcacionesRoutes from "./MarcacionesRoutes.js";
import UserRoutes from "./UserRoutes.js";
import EmpresasRoutes from "./EmpresasRoutes.js";
import AdminRoutes from "./AdminRoutes.js";
import TestRoutes from "./TestRoutes.js";
import UserEmpresaRoutes from "./UserEmpresa.js";

const router = {
    login: AuthRoutes,
    marcaciones: MarcacionesRoutes,
    users: UserRoutes,
    userEmpresa: UserEmpresaRoutes,
    admin: AdminRoutes,
    empresas: EmpresasRoutes,
    test: TestRoutes
}

export default router;