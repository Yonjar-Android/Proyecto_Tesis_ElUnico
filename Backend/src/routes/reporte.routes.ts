import { Router } from "express";
import {
    obtenerReporteStockBajo
} from "../controllers/reporte.controller.js";

const router = Router();

router.get("/obtenerReporteStockBajo", obtenerReporteStockBajo);

export default router;