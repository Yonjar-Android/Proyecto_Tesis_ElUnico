import { Request, Response } from "express";
import {
    crearDevolucion
} from "../services/devolucion.service.js";

export const postDevolucion = async (
    req: Request,
    res: Response
) => {

    try {

        const idUsuario = (req as any).usuario?.id;

        if (!idUsuario) {
            return res.status(401).json({
                mensaje: "No se pudo identificar al usuario."
            });
        }

        const {
            Id_venta,
            Motivo,
            Observacion,
            detalles
        } = req.body;

        const resultado = await crearDevolucion({
            Id_venta,
            Id_usuario: idUsuario,
            Motivo,
            Observacion,
            detalles
        });

        res.status(201).json({
            mensaje: "Devolución creada correctamente.",
            id: resultado.id
        });

    } catch (error: any) {

        console.error(error);

        res.status(400).json({
            mensaje: error.message
        });
    }
};