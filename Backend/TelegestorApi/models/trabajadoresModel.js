import dbServices from '../services/dbService.js';


class TrabajadoresModel {
    constructor() {
        this.db = dbServices;
    }
    // Métodos para interactuar con la base de datos relacionados con trabajadores
    async fetchTrabajadoresActivos(emp_rut = null) {
        const query = `SELECT 
            trabajador.*,
            estado_civil.*,
            proveedor.*,
            comuna.*,
            region.*,
            ciudad.*,
            afp.*,
            isapre.*,
            contrato.con_trab_idn,
            contrato.con_trab_sueldo_base,
            contrato.con_trab_fecha_contrato,
            contrato.con_trab_fecha_termino,
            contrato.con_trab_colacion,
            contrato.con_trab_movilizacion,
            contrato.hor_emp_idn,
            tipo_jornada.tip_jor_nombre,
            tipo_contratacion.tip_contra_nombre,
            estado_contrato_trabajador.est_con_trab_nombre
        FROM trabajador 
        INNER JOIN estado_civil ON trabajador.est_civil_idn = estado_civil.est_civil_idn 
        INNER JOIN proveedor_de_la_empresa ON trabajador.prov_emp_idn = proveedor_de_la_empresa.prov_emp_idn 
            AND proveedor_de_la_empresa.emp_rut = ?
            AND trabajador.trab_despedido = '0'
        INNER JOIN proveedor ON proveedor_de_la_empresa.prov_rut = proveedor.prov_rut
        INNER JOIN comuna ON proveedor_de_la_empresa.com_idn = comuna.com_idn
        INNER JOIN region ON comuna.reg_idn = region.reg_idn
        INNER JOIN ciudad ON proveedor_de_la_empresa.ciud_idn = ciudad.ciud_idn
        INNER JOIN afp ON trabajador.afp_idn = afp.afp_idn 
        INNER JOIN isapre ON trabajador.isa_idn = isapre.isa_idn
        -- Subconsulta para obtener el último contrato de cada trabajador
        LEFT JOIN (
            SELECT 
                ct1.*
            FROM contrato_trabajador ct1
            INNER JOIN (
                SELECT 
                    trab_idn,
                    MAX(con_trab_fecha_contrato) as ultima_fecha
                FROM contrato_trabajador
                GROUP BY trab_idn
            ) ct2 ON ct1.trab_idn = ct2.trab_idn 
                AND ct1.con_trab_fecha_contrato = ct2.ultima_fecha
        ) AS contrato ON trabajador.trab_idn = contrato.trab_idn
        LEFT JOIN tipo_jornada ON contrato.tip_jor_idn = tipo_jornada.tip_jor_idn
        LEFT JOIN tipo_contratacion ON contrato.tip_contra_idn = tipo_contratacion.tip_contra_idn
        LEFT JOIN estado_contrato_trabajador ON contrato.est_con_trab_idn = estado_contrato_trabajador.est_con_trab_idn
        -- FILTRO DIRECTO: Solo contratos vigentes
        WHERE TRIM(estado_contrato_trabajador.est_con_trab_nombre) = 'VIGENTE'`;
        const results = await this.db.query(query, [emp_rut]);

        // agrupar por prov_rut
        const groupedResults = results[0].reduce((acc, curr) => {
            const provRut = curr.prov_rut;
            if (!acc[provRut]) {
                acc[provRut] = [];
            }
            acc[provRut].push(curr);
            return acc;
        }, {});
        return groupedResults;
    }

    async fetchHorarioTrabajador(trab_idn = null) {
        const query = `SELECT de.* FROM contrato_trabajador as ct INNER JOIN detalle_horario_empresa as de ON ct.hor_emp_idn = de.hor_emp_idn WHERE trab_idn=?`;
        const results = await this.db.query(query, [trab_idn]);
        // agrupar por det_hor_emp_nro_dia y renombrar 1 -> lunes, 2 -> martes, etc
        const diasSemana = {
            1: 'lunes',
            2: 'martes',
            3: 'miercoles',
            4: 'jueves',
            5: 'viernes',
            6: 'sábado',
            7: 'domingo'
        };

        const data = results[0].reduce((acc, curr) => {
            const diaNombre = diasSemana[curr.det_hor_emp_nro_dia] || `día_${curr.det_hor_emp_nro_dia}`;
            if (!acc[diaNombre]) {
            acc[diaNombre] = [];
            }
            acc[diaNombre].push(curr);
            return acc;
        }, {});


        return data;
    }
}
export default TrabajadoresModel;
