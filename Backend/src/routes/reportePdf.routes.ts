import { Router } from 'express';
import { descargarReporteVentasPorPeriodoPdf } from '../controllers/reportePdf.controller.js';

const router = Router();

router.get('/ventas-por-periodo', descargarReporteVentasPorPeriodoPdf);
export default router;