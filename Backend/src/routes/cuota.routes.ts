import { Router } from "express";
import {
    getCuotasPendientes,
    getSiguienteCuota
} from "../controllers/cuota.controller.js";

const router = Router();

router.get("/:id/pendientes", getCuotasPendientes);
router.get("/:id/siguiente", getSiguienteCuota);

export default router;