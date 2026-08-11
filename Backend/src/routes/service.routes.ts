import { Router } from "express";
import {
   buscarServicio,
   postServicio,
   putServicio
} from "../controllers/servicio.controller.js";

const router = Router();

router.get("/buscar", buscarServicio);
router.post("/", postServicio);
router.put("/:id", putServicio);

export default router;