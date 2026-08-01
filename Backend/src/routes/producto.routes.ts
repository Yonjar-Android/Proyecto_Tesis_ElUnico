import { Router } from "express";
import {
    buscarProducto,
    getProductoById,
    postProducto,
    putProducto,
    getTotalProductsCategories
} from "../controllers/producto.controller.js";

const router = Router();

router.get("/buscar", buscarProducto);
router.get("/obtener-estadisticas", getTotalProductsCategories);
router.get("/:id", getProductoById);
router.post("/", postProducto);
router.put("/:id", putProducto);

export default router;