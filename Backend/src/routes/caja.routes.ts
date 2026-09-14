import { Router } from "express";
import {
  getSesionActiva,
  postAperturaCaja,
  postEgresoCaja,
  deleteEgresoCaja,
  postCierreCaja,
  getResumenCierreCaja,
  putEgresoCaja,  
  getHistorialCajas,
} from "../controllers/caja.controller.js";



const router = Router();

router.get("/sesion-activa", getSesionActiva);
router.get("/historial", getHistorialCajas);
router.post("/apertura", postAperturaCaja);
router.post("/egresos", postEgresoCaja);
router.delete("/egresos/:id", deleteEgresoCaja);
router.post("/cierre", postCierreCaja);
router.get("/resumen-cierre", getResumenCierreCaja);
router.put("/egresos/:id", putEgresoCaja);


export default router;
