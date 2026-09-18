import { Router } from 'express';
import { 
    descargarReporteVentasPorPeriodoPdf,
    descargarReporteVentasProductoPdf,
    descargarReporteVentasServicioPdf
 } from '../controllers/reportePdf.controller.js';

const router = Router();

router.get('/ventas-por-periodo', descargarReporteVentasPorPeriodoPdf);
router.get('/productos-por-periodo', descargarReporteVentasProductoPdf);
router.get('/servicios-por-periodo', descargarReporteVentasServicioPdf);
export default router;