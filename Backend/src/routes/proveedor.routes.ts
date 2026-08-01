import { Router } from "express";
import {
    buscarProveedor,
    postProveedor,
    putProveedor
} from "../controllers/proveedor.controller.js";

const router = Router();

router.get("/buscar", buscarProveedor);
router.post("/", postProveedor);
router.put("/:id", putProveedor);

export default router;