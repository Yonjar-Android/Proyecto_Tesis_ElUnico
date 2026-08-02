import { Request, Response } from "express";
import { crearCompra } from "../services/compra.service.js";

export const postCompra = async (req: Request, res: Response) => {
    try {

        const {
            Id_proveedor,
            NFactura,
            Total,
            Detalles
        } = req.body;

        const resultado = await crearCompra(
            Number(Id_proveedor),
            NFactura,
            Number(Total),
            Detalles
        );

        res.status(201).json({
            mensaje: "Compra registrada correctamente.",
            compra: resultado
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
};