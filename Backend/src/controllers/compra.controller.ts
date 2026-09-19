import { Request, Response } from "express";
import {
    crearCompra,
    obtenerDetalleCompra,
    actualizarCompra,
    listarCompras,
} from "../services/compra.service.js";

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

export const getDetalleCompra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const resultado = await obtenerDetalleCompra(Number(id));
        res.json(resultado);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ mensaje: error.message });
    }
};

export const putCompra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            Id_proveedor,
            NFactura,
            Total,
            Detalles
        } = req.body;

        const resultado = await actualizarCompra(
            Number(id),
            Number(Id_proveedor),
            NFactura,
            Number(Total),
            Detalles
        );

        res.status(200).json({
            mensaje: "Compra actualizada correctamente.",
            compra: resultado
        });

    } catch (error: any) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

export const getComprasListado = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const resultado = await listarCompras(page, limit);
        res.json(resultado);

    } catch (error: any) {
        console.error(error);
        res.status(400).json({ mensaje: error.message });
    }
};