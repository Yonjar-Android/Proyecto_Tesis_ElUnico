import { Router } from "express";
import { postCompra, getDetalleCompra, getComprasListado, putCompra } from "../controllers/compra.controller.js";

const router = Router();

router.post("/", postCompra);
router.get("/", getComprasListado);
router.get("/:id/detalle", getDetalleCompra);
router.put("/:id", putCompra);

export default router;