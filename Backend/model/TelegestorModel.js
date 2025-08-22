import pool from  '../config/telegestordb.js'


class  TelegestorModel {
    constructor() {
        if (!TelegestorModel.instance) {
            TelegestorModel.instance = this;
        }
        return TelegestorModel.instance;
    }
    
    async getWorker(rut = null) {
        const query = `
            SELECT contrato_trabajador.con_trab_idn,
                trabajador.trab_idn,
                proveedor_de_la_empresa.prov_emp_idn,
                contrato_trabajador.con_trab_fecha_contrato,
                contrato_trabajador.con_trab_fecha_termino,
                contrato_trabajador.est_con_trab_idn,
                proveedor_de_la_empresa.prov_rut,
                proveedor_de_la_empresa.emp_rut
            FROM contrato_trabajador
            INNER JOIN trabajador ON contrato_trabajador.trab_idn = trabajador.trab_idn
            RIGHT JOIN proveedor_de_la_empresa ON proveedor_de_la_empresa.prov_emp_idn = trabajador.prov_emp_idn 
            ${rut ? `WHERE proveedor_de_la_empresa.prov_rut = ?` : ''}
            ORDER BY contrato_trabajador.con_trab_idn DESC;
        `;
        const [rows] = await pool.query(query, [rut]);
        if (rows.length === 0) {
            return null;
        }
        return rows;
    }
    async getCompanyWorkers(rutEmpresa = null) {
        const query = `
            SELECT contrato_trabajador.con_trab_idn,trabajador.trab_idn, proveedor_de_la_empresa.prov_emp_idn
        ,contrato_trabajador.con_trab_fecha_contrato,contrato_trabajador.con_trab_fecha_termino,contrato_trabajador.est_con_trab_idn,
        proveedor_de_la_empresa.prov_rut, proveedor_de_la_empresa.emp_rut,
        trabajador.trab_nombre, trabajador.trab_ap_paterno
        FROM 
        (contrato_trabajador INNER JOIN trabajador ON contrato_trabajador.trab_idn = trabajador.trab_idn)
        RIGHT JOIN proveedor_de_la_empresa ON proveedor_de_la_empresa.prov_emp_idn = trabajador.prov_emp_idn
        ${rutEmpresa ? `WHERE proveedor_de_la_empresa.emp_rut = ? AND contrato_trabajador.est_con_trab_idn = '1'` : ''}
        ORDER BY contrato_trabajador.con_trab_idn DESC;
        `;
        const [rows] = await pool.query(query, [rutEmpresa]);
        return rows;    
    }

    async getCantidadDeTrabajadores(rutEmpresa = null){
        const query = `SELECT COUNT(trabajador.trab_idn) as cant_trabajadores
        FROM 
        (contrato_trabajador INNER JOIN trabajador ON contrato_trabajador.trab_idn = trabajador.trab_idn)
        RIGHT JOIN proveedor_de_la_empresa ON proveedor_de_la_empresa.prov_emp_idn = trabajador.prov_emp_idn
        WHERE proveedor_de_la_empresa.emp_rut = ? AND contrato_trabajador.est_con_trab_idn = '1'
        ORDER BY contrato_trabajador.con_trab_idn DESC`;
        const [rows] = await pool.query(query, [rutEmpresa]);
        return rows[0];
    }
    
    async getEmpresa(rut = null){
        const query = `SELECT * FROM empresa WHERE emp_rut = ?`;
        const [rows] = await pool.query(query, [rut]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }

    async getEmpresas(){
        const query = `SELECT emp_rut as rut, emp_operativa as activa, emp_nombre as nombre
        FROM empresa 
        WHERE emp_operativa = "1"`;
        const [rows] = await pool.query(query);
        return rows;
    }



    async getHorariosEmpresa(rutEmpresa = null){
        const query = `SELECT * FROM horario_empresa WHERE emp_rut = ?`;
        const [rows] = await pool.query(query, [rutEmpresa]);
        return rows;
    }
}

 


export default new TelegestorModel();
