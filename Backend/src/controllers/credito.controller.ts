import { Request, Response } from "express";
import {
    buscarCreditosPendientes
} from "../services/credito.service.js";

export const buscarCredito = async (req: Request, res: Response) => {

    try {

        const search = req.query.search?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;

        const resultado = await buscarCreditosPendientes(
            search,
            page,
            perPage
        );

        res.json(resultado);

    } catch {

        res.status(500).json({
            mensaje: "Error al buscar créditos pendientes"
        });

    }

};