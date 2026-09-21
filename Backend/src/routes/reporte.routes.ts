import { Router } from "express";
import {
    obtenerReporteStockBajo,
    obtenerReporteCuentasCobrar,
    obtenerReporteVentasPorPeriodo,
    obtenerReporteComprasPorPeriodo,
    obtenerReporteSalidasInventarioPorPeriodo,
    obtenerReporteVentasServicioPorPeriodo,
    obtenerReporteVentasProductoPorPeriodo,
    obtenerReporteInventarioGeneral,
    obtenerReporteDevolucionesPorPeriodo,
    obtenerReporteArqueoPeriodo,
    obtenerReporteArqueoCajero,
    obtenerDetalleArqueo
} from "../controllers/reporte.controller.js";

const router = Router();

router.get("/obtenerReporteStockBajo", obtenerReporteStockBajo);
router.get("/obtenerReporteCuentasCobrar", obtenerReporteCuentasCobrar);
router.get("/obtenerReporteVentas", obtenerReporteVentasPorPeriodo);
router.get("/obtenerReporteVentasServicios", obtenerReporteVentasServicioPorPeriodo);
router.get("/obtenerReporteCompras", obtenerReporteComprasPorPeriodo);
router.get("/obtenerReporteSalidasInventario", obtenerReporteSalidasInventarioPorPeriodo);
router.get("/obtenerReporteVentasProductos", obtenerReporteVentasProductoPorPeriodo);
router.get("/obtenerReporteInventario", obtenerReporteInventarioGeneral);
router.get("/obtenerReporteDevoluciones", obtenerReporteDevolucionesPorPeriodo);
router.get("/obtenerReporteArqueoPeriodo", obtenerReporteArqueoPeriodo);
router.get("/obtenerReporteArqueoCajero", obtenerReporteArqueoCajero);
router.get("/obtenerDetalleArqueo/:idSesion", obtenerDetalleArqueo);

export default router;