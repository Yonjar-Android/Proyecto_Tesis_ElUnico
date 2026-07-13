import { Request, Response } from "express";
import { obtenerCategorias } from "../services/categoria.service.js";

export const getCategorias = async (req: Request, res: Response) => {

    try {

        const categorias = await obtenerCategorias();
        res.json(categorias);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener las categorías."
        });
    }
}