import AuthRoutes from "./AuthRoutes.js";
import MarcacionesRoutes from "./MarcacionesRoutes.js";
import UserRoutes from "./UserRoutes.js";
import EmpresasRoutes from "./EmpresasRoutes.js";
//import TestRoutes from "./TestRoutes.js";
import UserEmpresaRoutes from "./UserEmpresa.js";
import AuditoriaRoutes from "./AuditoriaRoutes.js";
import EstadisticasRoutes from "./EstadisticasRoutes.js";
import FiscalizadorRoutes from "./FiscalizadorRoutes.js";
import JustificacionesRoutes from "./JustificacionesRoutes.js";
import FeriadosRoutes from "./FeriadosRoutes.js";
import DocumentoRoutes from "./DocumentoRoutes.js";
import MQTTRoutes from "./MQTTRoutes.js";
import ZKDeviceRoutes from "./ZKDeviceRoutes.js";
import RolesRoutes from "./RolesRoutes.js";

const router = {
    login: AuthRoutes,
    marcaciones: MarcacionesRoutes,
    users: UserRoutes,
    userEmpresa: UserEmpresaRoutes,
    empresas: EmpresasRoutes,
    auditoria: AuditoriaRoutes,
    estadisticas: EstadisticasRoutes,
    fiscalizador: FiscalizadorRoutes,
    justificaciones: JustificacionesRoutes,
    feriados: FeriadosRoutes,
    documentos: DocumentoRoutes,
    mqtt: MQTTRoutes,
    zk: ZKDeviceRoutes,
    roles: RolesRoutes
}

export default router;