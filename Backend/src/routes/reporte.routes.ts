import { Router } from "express";
import {
    obtenerReporteStockBajo,
    obtenerReporteCuentasCobrar
} from "../controllers/reporte.controller.js";

const router = Router();

router.get("/obtenerReporteStockBajo", obtenerReporteStockBajo);
router.get("/obtenerReporteCuentasCobrar", obtenerReporteCuentasCobrar);

export default router;