import express from "express";
import FiscalizadorController from "../controllers/FiscalizadorController.js";


const router = express.Router();


router.get("/datos-filtros/:empresa_id", FiscalizadorController.obtenerDatosEmpresa);
router.get("/asistencia/:empresa_id", FiscalizadorController.obtenerAsistencias);
router.get("/asistencia-domingos/:empresa_id", FiscalizadorController.obtenerAsistenciasDomingos);


export default router;