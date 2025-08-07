import AuthRoutes from "./AuthRoutes.js";
import MarcacionesRoutes from "./MarcacionesRoutes.js";
import UserRoutes from "./UserRoutes.js";
import EmpresasRoutes from "./EmpresasRoutes.js";
import AdminRoutes from "./AdminRoutes.js";

const router = {
    login: AuthRoutes,
    marcaciones: MarcacionesRoutes,
    users: UserRoutes,
    admin: AdminRoutes,
    empresas: EmpresasRoutes
}

export default router;