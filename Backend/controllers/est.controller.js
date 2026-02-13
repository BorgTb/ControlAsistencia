import EstAsignacionesModel from "../model/est-asignaciones.model.js";
import UsuarioEmpresaModel from "../model/usuario-empresa.model.js";
import EmpresaModel from "../model/empresa.model.js";


/*
Falta validar que si ya esta asociado con una empresa
*/
const asociarTrabajadorEmpresa = async (req, res) => {
    try {
        const { usuario_id, rut_empresa, rol_en_empresa, fecha_inicio, fecha_fin } = req.body;
        
        if (!usuario_id || !rut_empresa || !rol_en_empresa || !fecha_inicio) {
            return res.status(400).json({ 
                success: false, 
                message: "Usuario, empresa, rol y fecha de inicio son obligatorios" 
            });
        }

        const USR_PETICION = req.user; // usuario que genera la consulta
        const empresa = await EmpresaModel.getEmpresaByRut(rut_empresa);
        
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: "Empresa no encontrada con el RUT proporcionado"
            });
        }

        // Crear o verificar la asociaciÃ³n usuario-empresa
        const asociacionData = {
            est_id: USR_PETICION.empresa_id,
            usuaria_id: empresa.empresa_id,
            usuario_empresa_id: usuario_id,
            fecha_inicio: fecha_inicio,
            fecha_fin: fecha_fin || null
        };

        // aqui primero se deberia mandar una peticion para agregarlo a las empresas

        await EstAsignacionesModel.create(asociacionData);




        res.status(201).json({
            success: true,
            message: "Trabajador asociado a empresa exitosamente",
            data: asociacionData
        });

    } catch (error) {
        console.error("Error asociando trabajador a empresa:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};

const obtenerAsociacionesUsuarioEmpresa = async (req, res) => {
    try {
        const result = await EstAsignacionesModel.getByEstId(req.user.empresa_id);
        for (const r of result) {
            const ue = await UsuarioEmpresaModel.obtenerUsuarioByID(r.usuario_empresa_id);
            //agreagar info del usuario a la respuesta
            r.usuario = ue;
            const emp = await EmpresaModel.getEmpresaById(r.usuaria_id);
            r.empresa = emp;    
        }


        if (result) {
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message || "Error al obtener asociaciones"
            });
        }
    } catch (error) {
        console.error("Error obteniendo asociaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};





const EstController = {
    asociarTrabajadorEmpresa,
    obtenerAsociacionesUsuarioEmpresa
};
export default EstController;