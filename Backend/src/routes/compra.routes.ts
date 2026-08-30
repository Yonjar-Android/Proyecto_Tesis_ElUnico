import { Router } from "express";
import { postCompra, getDetalleCompra } from "../controllers/compra.controller.js";

const router = Router();

router.post("/", postCompra);
router.get("/:id/detalle", getDetalleCompra);

export default router;