import { Router } from 'express';
import { 
    descargarReporteVentasPorPeriodoPdf,
    descargarReporteVentasProductoPdf,
    descargarReporteVentasServicioPdf,
    descargarReporteInventarioPdf,
    descargarReporteSalidasInventarioPdf,
    descargarReporteDevolucionesPdf,
    descargarReporteClientesDeudaPdf,
    descargarReporteProductosStockPdf,
    descargarReporteComprasPorPeriodoPdf,
    descargarReporteArqueoPeriodoPdf,
    descargarReporteArqueoCajeroPdf
 } from '../controllers/reportePdf.controller.js';

const router = Router();

router.get('/ventas-por-periodo', descargarReporteVentasPorPeriodoPdf);
router.get('/productos-por-periodo', descargarReporteVentasProductoPdf);
router.get('/servicios-por-periodo', descargarReporteVentasServicioPdf);
router.get('/inventario', descargarReporteInventarioPdf);
router.get('/salidas-inventario', descargarReporteSalidasInventarioPdf);
router.get('/devoluciones', descargarReporteDevolucionesPdf);
router.get('/clientes-deuda', descargarReporteClientesDeudaPdf);
router.get('/productos-stock', descargarReporteProductosStockPdf);
router.get('/compras-por-periodo', descargarReporteComprasPorPeriodoPdf);
router.get('/arqueo-caja-periodo', descargarReporteArqueoPeriodoPdf);
router.get('/arqueo-caja-cajero', descargarReporteArqueoCajeroPdf);
export default router;