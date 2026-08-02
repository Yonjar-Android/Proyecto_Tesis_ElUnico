import { Request, Response } from "express";
import {
    obtenerReporteProductosStock,
    obtenerReporteClientesConDeuda
} from "../services/reporte.service.js";

export const obtenerReporteStockBajo = async (req: Request, res: Response) => {
    try {
    
            const search = req.query.search?.toString() ?? "";
            const page = Number(req.query.page) || 1;
            const perPage = Number(req.query.perPage) || 10;
    
            const resultado = await obtenerReporteProductosStock(
                search,
                30, // porcentaje de stock mínimo
                page,
                perPage
            );
    
            res.json(resultado);
    
        } catch (error) {
    
            res.status(500).json({
                mensaje: "Error al buscar productos."
            });
    
        }
}

export const obtenerReporteCuentasCobrar = async(req: Request, res: Response) => {
    try {
    
            const search = req.query.search?.toString() ?? "";
            const page = Number(req.query.page) || 1;
            const perPage = Number(req.query.perPage) || 10;
    
            const resultado = await obtenerReporteClientesConDeuda(
                search,
                page,
                perPage
            );
    
            res.json(resultado);
    
        } catch (error) {
    
            res.status(500).json({
                mensaje: "Error al buscar clientes."
            });
    
        }
}