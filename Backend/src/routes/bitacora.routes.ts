import { Router } from "express";
import { listarBitacora } from "../controllers/bitacora.controller.js";

const router = Router();

router.get("/", listarBitacora);

export default router;
