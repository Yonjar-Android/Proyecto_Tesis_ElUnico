import { Router } from 'express';
import { 
    descargarReporteVentasPorPeriodoPdf,
    descargarReporteVentasProductoPdf,
    descargarReporteVentasServicioPdf,
    descargarReporteInventarioPdf,
    descargarReporteSalidasInventarioPdf,
    descargarReporteDevolucionesPdf,
    descargarReporteClientesDeudaPdf
 } from '../controllers/reportePdf.controller.js';

const router = Router();

router.get('/ventas-por-periodo', descargarReporteVentasPorPeriodoPdf);
router.get('/productos-por-periodo', descargarReporteVentasProductoPdf);
router.get('/servicios-por-periodo', descargarReporteVentasServicioPdf);
router.get('/inventario', descargarReporteInventarioPdf);
router.get('/salidas-inventario', descargarReporteSalidasInventarioPdf);
router.get('/devoluciones', descargarReporteDevolucionesPdf);
router.get('/clientes-deuda', descargarReporteClientesDeudaPdf);
export default router;