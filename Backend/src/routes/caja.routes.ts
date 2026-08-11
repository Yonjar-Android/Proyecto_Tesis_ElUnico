import { Router } from "express";
import {
  getSesionActiva,
  postAperturaCaja,
  postEgresoCaja,
  deleteEgresoCaja,
  postCierreCaja,
  getResumenCierreCaja,
} from "../controllers/caja.controller.js";



const router = Router();

router.get("/sesion-activa", getSesionActiva);
router.post("/apertura", postAperturaCaja);
router.post("/egresos", postEgresoCaja);
router.delete("/egresos/:id", deleteEgresoCaja);
router.post("/cierre", postCierreCaja);
router.get("/resumen-cierre", getResumenCierreCaja);


export default router;
