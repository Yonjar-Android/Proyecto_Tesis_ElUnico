import { Router } from "express";
import { postVenta,
     getFacturaParaDevolucion, 
     getVentaParaEditar,
     getReciboVenta, 
     getVentasPendientes, 
     putVenta, 
     getHistorialVentas } from "../controllers/venta.controller.js"; 

const router = Router();

router.post("/", postVenta);
router.get("/factura-devolucion/:id", getFacturaParaDevolucion);
router.get("/:id/recibo", getReciboVenta);
router.get("/:id/ventasPendientes", getVentasPendientes);
router.get("/historial", getHistorialVentas);
router.get("/:id/editar-datos", getVentaParaEditar);
router.put("/:id", putVenta);

export default router;