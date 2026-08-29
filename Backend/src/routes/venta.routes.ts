import { Router } from "express";
import { postVenta, getFacturaParaDevolucion, getReciboVenta } from "../controllers/venta.controller.js"; 

const router = Router();

router.post("/", postVenta);
router.get("/factura-devolucion/:id", getFacturaParaDevolucion);
router.get("/:id/recibo", getReciboVenta);

export default router;