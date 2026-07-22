import { Request, Response } from "express";
import { actualizarCategoria, buscarCategorias, crearCategoria, obtenerCategorias } from "../services/categoria.service.js";

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

export const buscarCategoria = async (req: Request, res:Response) => {
    try{
        const search = req.query.search?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;

        const resultado = await buscarCategorias(
            search,
            page,
            perPage
        );

        res.json(resultado);

    } catch(error) {
        res.status(500).json({
            mensaje: "Error al buscar categorías."
        })
    }
}

export const postCategoria = async (req:Request, res:Response) => {
    try{
        const { Nombre_categoria } = req.body;

        await crearCategoria(Nombre_categoria);

        res.status(201).json({
            mensaje: "Categoría creada correctamente."
        });

    } catch(error:any){
        res.status(400).json({
            mensaje: error.message
        });
    }
}

export const putCategoria = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const { Nombre_categoria } = req.body

        await actualizarCategoria(Number(id), Nombre_categoria);

        res.json({
            mensaje: "Categoría actualizada correctamente."
        });
    }
    catch(error:any){
        res.status(400).json({
            mensaje: error.message
        });
    }
}