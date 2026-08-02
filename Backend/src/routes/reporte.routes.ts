import { Router } from "express";
import {
    obtenerReporteStockBajo,
    obtenerReporteCuentasCobrar,
    obtenerReporteVentasPorPeriodo,
    obtenerReporteComprasPorPeriodo
} from "../controllers/reporte.controller.js";

const router = Router();

router.get("/obtenerReporteStockBajo", obtenerReporteStockBajo);
router.get("/obtenerReporteCuentasCobrar", obtenerReporteCuentasCobrar);
router.get("/obtenerReporteVentas", obtenerReporteVentasPorPeriodo);
router.get("/obtenerReporteCompras", obtenerReporteComprasPorPeriodo);

export default router;