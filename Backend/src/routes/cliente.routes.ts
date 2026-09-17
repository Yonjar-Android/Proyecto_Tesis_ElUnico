import { Router } from "express";
import { buscarCliente, postCliente, putCliente, getSiguienteNCliente } from "../controllers/cliente.controller.js";

const router = Router();

router.get("/buscar", buscarCliente);
router.get("/obtenerSiguienteNCliente", getSiguienteNCliente);
router.post("/", postCliente);
router.put("/:id", putCliente);

export default router;