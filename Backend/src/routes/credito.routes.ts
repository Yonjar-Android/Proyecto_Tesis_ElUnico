import { Router } from "express";
import {
    buscarCredito
} from "../controllers/credito.controller.js";

const router = Router();

router.get("/buscar", buscarCredito);

export default router;