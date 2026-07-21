import { Request, Response } from "express";
import {
    obtenerMarcas,
    buscarMarcas,
    crearMarca,
    actualizarMarca
} from "../services/marca.service.js";

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

export const buscarMarca = async (req: Request, res: Response) => {

    try {

        const search = req.query.search?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 5;

        const resultado = await buscarMarcas(
            search,
            page,
            perPage
        );

        res.json(resultado);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al buscar marcas."
        });

    }

};

export const postMarca = async (req: Request, res: Response) => {
    try {
        const { Nombre_marca } = req.body;   

        await crearMarca(Nombre_marca);

        res.status(201).json({
            mensaje: "Marca creada correctamente."
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
};

export const putMarca = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Nombre_marca } = req.body;

        await actualizarMarca(Number(id), Nombre_marca);

        res.json({
            mensaje: "Marca actualizada correctamente."
        });

    } catch (error: any) {
         res.status(400).json({
            mensaje: error.message
        });
    }
};