import { Request, Response } from "express";
import { crearVenta } from "../services/venta.service.js";

export const postVenta = async (req: Request, res: Response) => {
    try {

        const idUsuario = (req as any).usuario?.id;

        if (!idUsuario) {
            return res.status(401).json({ mensaje: "No se pudo identificar al usuario." });
        }

        const {
            Id_cliente,
            Tipo_Pago,
            Total,
            Detalles
        } = req.body;

        const resultado = await crearVenta(
            Number(Id_cliente),
            idUsuario,
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