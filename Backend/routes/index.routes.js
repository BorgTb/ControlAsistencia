import AuthRoutes from "./auth.routes.js";
import MarcacionesRoutes from "./marcaciones.routes.js";
import UserRoutes from "./user.routes.js";
import EmpresasRoutes from "./empresas.routes.js";
//import TestRoutes from "./test.routes.js";
import UserEmpresaRoutes from "./user-empresa.routes.js";
import AuditoriaRoutes from "./auditoria.routes.js";
import EstadisticasRoutes from "./estadisticas.routes.js";
import FiscalizadorRoutes from "./fiscalizador.routes.js";
import JustificacionesRoutes from "./justificaciones.routes.js";
import FeriadosRoutes from "./feriados.routes.js";
import DocumentoRoutes from "./documento.routes.js";
import MQTTRoutes from "./mqtt.routes.js";
import ZKDeviceRoutes from "./zk-device.routes.js";
import RolesRoutes from "./roles.routes.js";
import SolicitudesRoutes from "./solicitudes.routes.js";

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
    roles: RolesRoutes,
    solicitudes: SolicitudesRoutes
}

export default router;