import { Router } from "express";
import { postSalida } from "../controllers/salidas_Inventario.controller.js"; 

const router = Router();

router.post("/", postSalida);

export default router;