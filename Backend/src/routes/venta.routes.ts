import { Router } from "express";
import { postVenta, getFacturaParaDevolucion } from "../controllers/venta.controller.js"; 

const router = Router();

router.post("/", postVenta);
router.get("/factura-devolucion/:id", getFacturaParaDevolucion);

export default router;