import { Router } from "express";
import {
    getMarcas,
    buscarMarca,
    postMarca,
    putMarca
} from "../controllers/marca.controller.js";

const router = Router();

router.get("/", getMarcas);
router.get("/buscar", buscarMarca);
router.post("/", postMarca);
router.put("/:id", putMarca);

export default router;