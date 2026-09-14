import { Request, Response } from "express";
import {
    crearSalida
} from "../services/salidas_Inventario.service.js";

export const postSalida = async (
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
            Observacion,
            detalles
        } = req.body;

        const resultado = await crearSalida({
            Id_usuario: idUsuario,
            Observacion,
            detalles
        });

        res.status(201).json({
            mensaje: "Salida de inventario creada correctamente.",
            id: resultado.id
        });

    } catch (error: any) {

        console.error(error);

        res.status(400).json({
            mensaje: error.message
        });

    }
};