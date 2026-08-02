import { Router } from "express";
import { postVenta } from "../controllers/venta.controller.js"; 

const router = Router();

router.post("/", postVenta);

export default router;