// routes/reportes.routes.ts
import { Router } from 'express';
import { 
    descargarReporteProductosStock, 
    descargarReporteClientesDeuda, 
    descargarReporteComprasPorPeriodo,
    descargarReporteVentasPorPeriodo,
    descargarReporteSalidasPorPeriodo,
    descargarReporteVentasServicioPorPeriodo,
    descargarReporteVentasProductoPorPeriodo,
    descargarReporteInventario,
    descargarReporteDevolucionesPorPeriodo
} from '../controllers/reporteExcel.controller.js';

const router = Router();

// Rutas para descargar reportes en Excel
router.get('/productos-stock', descargarReporteProductosStock);
router.get('/clientes-deuda', descargarReporteClientesDeuda);
router.get('/excel/ventas-por-periodo', descargarReporteVentasPorPeriodo);
router.get('/excel/compras-por-periodo', descargarReporteComprasPorPeriodo);
router.get('/excel/salidas-por-periodo', descargarReporteSalidasPorPeriodo);
router.get('/excel/servicios-por-periodo', descargarReporteVentasServicioPorPeriodo);
router.get('/excel/productos-por-periodo', descargarReporteVentasProductoPorPeriodo);
router.get('/excel/inventario', descargarReporteInventario);
router.get('/excel/devoluciones', descargarReporteDevolucionesPorPeriodo);
export default router;