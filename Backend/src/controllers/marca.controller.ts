import { Request, Response } from "express";
import { obtenerMarcas } from "../services/marca.service.js";

export const getMarcas = async (req: Request, res: Response) => {

    try {

        const marcas = await obtenerMarcas();

        res.json(marcas);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener las marcas."
        });

    }

};