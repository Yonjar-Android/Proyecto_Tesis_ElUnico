import { Request, Response } from "express";
import { buscarAbonos, crearDetalleAbono, actualizarDetalleAbono } from "../services/detalle_abono.service.js";

export const buscarDetalleAbonos = async (req: Request, res: Response) => {
    try{

        const search = req.query.search?.toString() ?? "";
                const page = Number(req.query.page) || 1;
                const perPage = Number(req.query.perPage) || 10;
        
                const resultado = await buscarAbonos(
                    search,
                    page,
                    perPage
                );
        
                res.json(resultado);
        

    } catch(error){
        res.status(500).json({
            mensaje: "Error al buscar el abono"
        });
    }
}

export const postDetalleAbono = async (req: Request, res: Response) => {
    try {
        const { Id_cliente, Monto, Notas } = req.body;

        await crearDetalleAbono(Id_cliente, Monto, Notas);

        res.status(201).json({
            mensaje: "Abono creado correctamente"
        });

    } catch(error:any){
        res.status(400).json({
            mensaje: error.message
        });
    }
}

export const putDetalleAbono = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            Monto,
            Notas
        } = req.body;

        const result = await actualizarDetalleAbono(
            Number(id),
            Number(Monto),
            Notas
        );

        res.status(200).json({
            mensaje: "Abono actualizado correctamente",
            result
        });

    } catch (error: any) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};