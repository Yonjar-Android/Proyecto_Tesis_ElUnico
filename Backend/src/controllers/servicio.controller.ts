import { Request, Response } from "express";
import {
    buscarServicios,
    crearServicio,
    actualizarServicio
} from "../services/servicio.service.js"

export const buscarServicio = async(req: Request, res: Response) => {
    try {
    
            const search = req.query.search?.toString() ?? "";
            const page = Number(req.query.page) || 1;
            const perPage = Number(req.query.perPage) || 10;
    
            const resultado = await buscarServicios(
                search,
                page,
                perPage
            );
    
            res.json(resultado);
    
        } catch (error) {
    
            res.status(500).json({
                mensaje: "Error al buscar servicios."
            });
    
        }
}

export const postServicio = async (req: Request, res: Response) => {
    try{

        const {
            Nombre_servicio,
            Descripcion,
            Precio
        } = req.body;

        await crearServicio(
            Nombre_servicio,
            Descripcion,
            Precio
        );

        res.status(201).json({
            mensaje: "Servicio creado correctamente."
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
}

export const putServicio= async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        const {
            Nombre_servicio,
            Descripcion,
            Precio,
        } = req.body;

        const result = await actualizarServicio(
            Number(id),
            Nombre_servicio,
            Descripcion,
            Number(Precio),
        );

        res.status(200).json({
            mensaje: "Servicio actualizado correctamente.",
            result
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
};