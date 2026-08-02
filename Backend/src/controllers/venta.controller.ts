import { Request, Response } from "express";
import { crearVenta } from "../services/venta.service.js";

export const postVenta = async (req: Request, res: Response) => {
    try {

        const {
            Id_cliente,
            Id_usuario,
            Tipo_Pago,
            Total,
            Detalles
        } = req.body;

        const resultado = await crearVenta(
            Number(Id_cliente),
            Number(Id_usuario),
            Tipo_Pago,
            Number(Total),
            Detalles
        );

        res.status(201).json({
            mensaje: "Venta registrada correctamente.",
            venta: resultado
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
};