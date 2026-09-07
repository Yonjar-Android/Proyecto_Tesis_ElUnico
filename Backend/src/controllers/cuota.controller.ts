import { Request, Response } from "express";
import {
    obtenerCuotasPendientes,
    obtenerSiguienteCuota
} from "../services/cuota.service.js";

export const getCuotasPendientes = async (req: Request, res: Response) => {

    try {

        const idCreditoFactura = Number(req.params.id);

        const cuotas = await obtenerCuotasPendientes(idCreditoFactura);

        res.json(cuotas);

    } catch {

        res.status(500).json({
            mensaje: "Error al obtener las cuotas pendientes"
        });

    }

};

export const getSiguienteCuota = async (req: Request, res: Response) => {

    try {

        const idCreditoFactura = Number(req.params.id);

        const cuota = await obtenerSiguienteCuota(idCreditoFactura);

        res.json(cuota);

    } catch {

        res.status(500).json({
            mensaje: "Error al obtener la siguiente cuota"
        });

    }

};