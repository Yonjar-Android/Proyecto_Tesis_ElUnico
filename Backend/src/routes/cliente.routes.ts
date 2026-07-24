import { Router } from "express";
import { buscarCliente, postCliente, putCliente } from "../controllers/cliente.controller.js";

const router = Router();

router.get("/buscar", buscarCliente);
router.post("/", postCliente);
router.put("/:id", putCliente);

export default router;