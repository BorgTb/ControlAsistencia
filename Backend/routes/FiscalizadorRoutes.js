import express from "express";
import FiscalizadorController from "../controllers/FiscalizadorController.js";


const router = express.Router();


router.get("/datos-filtros", FiscalizadorController.obtenerDatosEmpresa);


export default router;