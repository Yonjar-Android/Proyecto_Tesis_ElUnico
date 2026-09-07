import { Request, Response } from "express";
import {
    obtenerHistorialAbonos,
    registrarAbono
} from "../services/abono.service.js";

export const getHistorialAbono = async (req: Request, res: Response) => {

    try {

        const idCreditoFactura = Number(req.params.id);

        const historial = await obtenerHistorialAbonos(idCreditoFactura);

        res.json(historial);

    } catch {

        res.status(500).json({
            mensaje: "Error al obtener el historial de abonos"
        });

    }

};

export const postAbono = async (req: Request, res: Response) => {

    try {

        const {
            idCreditoFactura,
            montoAAbonar,
            metodoPago,
            referencia,
            observaciones
        } = req.body;

        const resultado = await registrarAbono(
            Number(idCreditoFactura),
            Number(montoAAbonar),
            metodoPago,
            referencia ?? null,
            observaciones ?? null
        );

        res.status(201).json({
            mensaje: "Abono registrado correctamente.",
            ...resultado
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }

};