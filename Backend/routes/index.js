import AuthRoutes from "./AuthRoutes.js";
import MarcacionesRoutes from "./MarcacionesRoutes.js";

const router = {
    login: AuthRoutes,
    marcaciones: MarcacionesRoutes
}

export default router;