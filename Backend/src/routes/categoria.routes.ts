import { Router } from "express";
import { buscarCategoria, getCategorias, postCategoria, putCategoria } from "../controllers/categoria.controller.js";

const router = Router();

router.get("/", getCategorias);
router.get("/buscar", buscarCategoria);
router.post("/", postCategoria);
router.put("/:id", putCategoria);

export default router;