import { Router } from "express";
import {
    getHistorialAbono,
    postAbono
} from "../controllers/abono.controller.js";

const router = Router();

router.get("/:id/historial", getHistorialAbono);
router.post("/", postAbono);

export default router;