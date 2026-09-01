import { Request, Response } from "express";
import { crearVenta, buscarFacturaParaDevolucion, obtenerReciboVenta } from "../services/venta.service.js";

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
            RecibidoCordobas,
            Detalles
        } = req.body;

        const resultado = await crearVenta(
    Number(Id_cliente),
    idUsuario,
    Tipo_Pago,
    Number(Total),
    RecibidoCordobas,
    Detalles
);

res.status(201).json(resultado);

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
};

export const getFacturaParaDevolucion = async (
    req: Request,
    res: Response
) => {

    try {

        const { id } = req.params;

        const resultado = await buscarFacturaParaDevolucion(
            Number(id)
        );

        res.json(resultado);

    } catch (error: any) {

        console.error(error);

        res.status(400).json({
            mensaje: error.message
        });

    }
};

export const getReciboVenta = async (
    req: Request,
    res: Response
) => {

    try {

        const { id } = req.params;

        const resultado = await obtenerReciboVenta(
            Number(id)
        );

        res.json(resultado);

    } catch (error: any) {

        console.error(error);

        res.status(400).json({
            mensaje: error.message
        });

    }
};