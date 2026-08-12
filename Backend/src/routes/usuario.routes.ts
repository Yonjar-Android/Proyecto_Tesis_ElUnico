import { Router } from "express";
import { getUsuarios, postUsuario, putUsuario, deleteUsuario, getRoles } from "../controllers/usuario.controller.js";

const router = Router();

router.get("/roles", getRoles);
router.get("/", getUsuarios);
router.post("/", postUsuario);
router.put("/:id", putUsuario);
router.delete("/:id", deleteUsuario);

export default router;