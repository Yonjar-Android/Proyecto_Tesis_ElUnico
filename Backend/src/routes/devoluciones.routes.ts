import { Router } from "express";
import {
    postDevolucion
} from "../controllers/devoluciones.controller.js";

const router = Router();

router.post("/", postDevolucion);

export default router;