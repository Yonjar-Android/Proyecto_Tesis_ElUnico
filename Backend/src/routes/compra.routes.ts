import { Router } from "express";
import { postCompra } from "../controllers/compra.controller.js";

const router = Router();

router.post("/", postCompra);

export default router;