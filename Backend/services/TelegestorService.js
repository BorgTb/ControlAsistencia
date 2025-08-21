import TelegestorModel from "../model/TelegestorModel.js";
import TeleticketServices from "./TeleticketServices.js";


const verifyWorker = async (rut = null) => {
    const workerData = rut ? await TelegestorModel.getWorker(rut) : null;
    const worker = Array.isArray(workerData) ? workerData[0] : workerData;
  
    /*
        Verficar cada caso para el trabajador est_cont_trab_idn
        Estados:
                [
                {"est_con_trab_idn":"1","est_con_trab_nombre":" VIGENTE","est_con_trab_finiquito":"0","est_con_trab_art_ley":"","est_con_trab_codigo_lre":"0"},
                {"est_con_trab_idn":"2","est_con_trab_nombre":"FINALIZADO, MUTUO ACUERDO DE LAS PARTES","est_con_trab_finiquito":"0","est_con_trab_art_ley":"159 NUMERO 1","est_con_trab_codigo_lre":"3"},
                {"est_con_trab_idn":"3","est_con_trab_nombre":"FINALIZADO POR RENUNCIA DEL TRABAJADOR","est_con_trab_finiquito":"0","est_con_trab_art_ley":"159 NUMERO 2","est_con_trab_codigo_lre":"4"},
                {"est_con_trab_idn":"4","est_con_trab_nombre":"FINALIZADO POR MUERTE DEL TRABAJADOR","est_con_trab_finiquito":"0","est_con_trab_art_ley":"159 NUMERO 3","est_con_trab_codigo_lre":"5"},
                {"est_con_trab_idn":"5","est_con_trab_nombre":"FINALIZADO POR VENCIMIENTO DEL PLAZO CONVENIDO EN EL CONTRATO","est_con_trab_finiquito":"0","est_con_trab_art_ley":"159 NUMERO 4","est_con_trab_codigo_lre":"6"},
                {"est_con_trab_idn":"6","est_con_trab_nombre":"CONCLUSION DEL TRABAJO QUE DIO ORIGEN AL CONTRATO","est_con_trab_finiquito":"1","est_con_trab_art_ley":"159 NUMERO 5","est_con_trab_codigo_lre":"7"},
                {"est_con_trab_idn":"7","est_con_trab_nombre":"FINALIZADO POR CASO FORTUITO O FUERZA MAYOR","est_con_trab_finiquito":"0","est_con_trab_art_ley":"159 NUMERO 6","est_con_trab_codigo_lre":"8"},
                {"est_con_trab_idn":"8","est_con_trab_nombre":"FINALIZADO, FALTA DE PROBIDAD DEL TRABAJADOR EN EL DESEMPEÑO DE SUS FUNCIONES","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 letra A","est_con_trab_codigo_lre":"24"},
                {"est_con_trab_idn":"9","est_con_trab_nombre":"FINALIZADO POR NECESIDADES DE LA EMPRESA","est_con_trab_finiquito":"1","est_con_trab_art_ley":"161","est_con_trab_codigo_lre":"18"},
                {"est_con_trab_idn":"10","est_con_trab_nombre":"TERMINO DE FAENA","est_con_trab_finiquito":"0","est_con_trab_art_ley":"159 NUMERO 5","est_con_trab_codigo_lre":"7"},
                {"est_con_trab_idn":"11","est_con_trab_nombre":"FALTA DE PROBIDAD DEL TRABAJADOR EN EL DESEMPEÑO DE SUS FUNCIONES","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 1 letra A","est_con_trab_codigo_lre":"24"},
                {"est_con_trab_idn":"12","est_con_trab_nombre":"CONDUCTAS DE ACOSO SEXUAL","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 1 letra B","est_con_trab_codigo_lre":"25"},
                {"est_con_trab_idn":"13","est_con_trab_nombre":"VÍAS DE HECHO EJERCIDAS POR EL TRABAJADOR EN CONTRA DEL EMPLEADOR","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 1 letra C","est_con_trab_codigo_lre":"26"},
                {"est_con_trab_idn":"14","est_con_trab_nombre":"INJURIAS PROFERIDAS POR EL TRABAJADOR AL EMPLEADOR","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 1 letra D","est_con_trab_codigo_lre":"27"},
                {"est_con_trab_idn":"15","est_con_trab_nombre":"CONDUCTA INMORAL DEL TRABAJADOR QUE AFECTE A LA EMPRESA DONDE SE DESEMPEÑA","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 1 letra E","est_con_trab_codigo_lre":"28"},
                {"est_con_trab_idn":"16","est_con_trab_nombre":"NEGOCIACIONES QUE EJECUTE EL TRABAJADOR DENTRO DEL GIRO DEL NEGOCIO Y QUE HUBIESEN SIDO PROHIBIDAS","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 2","est_con_trab_codigo_lre":"11"},
                {"est_con_trab_idn":"17","est_con_trab_nombre":"NO CONCURRENCIA DEL TRABAJADOR A SUS LABORES SIN CAUSA JUSTIFICADA","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 3","est_con_trab_codigo_lre":"2"},
                {"est_con_trab_idn":"18","est_con_trab_nombre":"SALIDA INTEMPESTIVA E INJUSTIFICADA DEL TRABAJADOR DEL SITIO DE LA FAENA","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 4 letra A","est_con_trab_codigo_lre":"13"},
                {"est_con_trab_idn":"19","est_con_trab_nombre":"ACTOS, OMISIONES O IMPRUDENCIAS TEMERARIAS QUE AFECTEN A LA SEGURIDAD O AL FUNCIONAMIENTO DEL ESTABL","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 5","est_con_trab_codigo_lre":"14"},
                {"est_con_trab_idn":"20","est_con_trab_nombre":"EL PERJUICIO MATERIAL CAUSADO INTENCIONALMENTE EN LAS INSTALACIONES","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 6","est_con_trab_codigo_lre":"15"},
                {"est_con_trab_idn":"21","est_con_trab_nombre":"INCUMPLIMIENTO GRAVE DE LAS OBLIGACIONES QUE IMPONE EL CONTRATO","est_con_trab_finiquito":"0","est_con_trab_art_ley":"160 numero 7","est_con_trab_codigo_lre":"16"}
            ]
    */    
    if (worker === null) {
        return false;
    }
    if (worker.est_con_trab_idn !== 1 && worker.prov_rut !== 21199220) {
        return false;
    }

    return true;
};

const getCompanyWorkers = async (rutEmpresa = null) => {
    const workers = await TelegestorModel.getCompanyWorkers(rutEmpresa);
    return workers;
};

const getHorariosEmpresa = async (rutEmpresa = null) => {
    return rutEmpresa ? await TelegestorModel.getHorariosEmpresa(rutEmpresa) : null;
};

const TelegestorService = {
    verifyWorker,
    getHorariosEmpresa,
    getCompanyWorkers
};


export default TelegestorService;
