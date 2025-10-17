import express from "express";
import FiscalizadorController from "../controllers/FiscalizadorController.js";


const router = express.Router();


router.get("/datos-filtros/:empresa_id", FiscalizadorController.obtenerDatosEmpresa);


export default router;