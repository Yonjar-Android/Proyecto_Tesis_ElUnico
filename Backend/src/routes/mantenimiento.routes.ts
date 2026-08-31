import { Router } from "express";
import multer from "multer";
import path from "path";
import os from "os";
import {
    getRespaldos,
    postCrearRespaldo,
    getDescargarRespaldo,
    deleteRespaldo,
    postRestaurarDesdeArchivo,
    postRestaurarDesdeHistorial,
} from "../controllers/mantenimiento.controller.js";

const router = Router();

// Los .sql subidos para restaurar se guardan temporalmente en el tmp del sistema
const upload = multer({ dest: path.join(os.tmpdir(), "restauraciones-elunico") });

router.get("/respaldos", getRespaldos);
router.post("/respaldos", postCrearRespaldo);
router.get("/respaldos/:id/descargar", getDescargarRespaldo);
router.delete("/respaldos/:id", deleteRespaldo);

router.post("/restaurar", upload.single("archivo"), postRestaurarDesdeArchivo);
router.post("/restaurar-historial", postRestaurarDesdeHistorial);

export default router;