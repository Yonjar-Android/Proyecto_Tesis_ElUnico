// routes/reportes.routes.ts
import { Router } from 'express';
import { 
    descargarReporteProductosStock, 
    descargarReporteClientesDeuda, 
    descargarReporteComprasPorPeriodo,
    descargarReporteVentasPorPeriodo,
    descargarReporteSalidasPorPeriodo
} from '../controllers/reporteExcel.controller.js';

const router = Router();

// Rutas para descargar reportes en Excel
router.get('/productos-stock', descargarReporteProductosStock);
router.get('/clientes-deuda', descargarReporteClientesDeuda);
router.get('/excel/ventas-por-periodo', descargarReporteVentasPorPeriodo);
router.get('/excel/compras-por-periodo', descargarReporteComprasPorPeriodo);
router.get('/excel/salidas-por-periodo', descargarReporteSalidasPorPeriodo);

export default router;