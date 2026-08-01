import { Router } from "express";
import { buscarDetalleAbonos, postDetalleAbono, putDetalleAbono } from "../controllers/detalle_abono.controller.js";

const router = Router();

router.get("/buscar", buscarDetalleAbonos);
router.post("/", postDetalleAbono);
router.put("/:id", putDetalleAbono);

export default router;