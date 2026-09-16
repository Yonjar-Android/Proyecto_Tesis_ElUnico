import { Request, Response } from "express";
import {
    obtenerReporteProductosStock,
    obtenerReporteFacturasConDeuda,
    obtenerReporteVentas,
    obtenerReporteCompras,
    obtenerReporteSalidasInventario,
    obtenerReporteVentasServicio,
    obtenerReporteVentasProducto
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
    
            const resultado = await obtenerReporteFacturasConDeuda(
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

export const obtenerReporteComprasPorPeriodo = async(req: Request, res: Response) => {
    try {
    
            const search = req.query.search?.toString() ?? "";
            const page = Number(req.query.page) || 1;
            const perPage = Number(req.query.perPage) || 10;
            const Id_proveedor = Number(req.query.Id_proveedor);
            const fechaInicio = String(req.query.fechaInicio);
            const fechaFin = String(req.query.fechaFin);
    
            const resultado = await obtenerReporteCompras(
                search,
                fechaInicio,
                fechaFin,
                Id_proveedor,
                page,
                perPage
            );
    
            res.json(resultado);
    
        } catch (error) {
    
            res.status(500).json({
                mensaje: "Error al buscar ventas."
            });
    
        }
}

export const obtenerReporteVentasPorPeriodo = async(req: Request, res: Response) => {
    try {

        const search = req.query.search?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;
        const fechaInicio = String(req.query.fechaInicio ?? "");
        const fechaFin = String(req.query.fechaFin ?? "");
        const tipoPago = String(req.query.tipoPago ?? "");
        const estado = String(req.query.estado ?? "");

        const resultado = await obtenerReporteVentas(
            search,
            fechaInicio,
            fechaFin,
            tipoPago,
            estado,
            page,
            perPage
        );

        res.json(resultado);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al buscar ventas."
        });

    }
}

export const obtenerReporteVentasServicioPorPeriodo = async (req: Request, res: Response) => {
    try {
        const search = req.query.search?.toString() ?? "";
        const fechaInicio = req.query.fechaInicio?.toString() ?? "";
        const fechaFin = req.query.fechaFin?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;

        const resultado = await obtenerReporteVentasServicio(
            search, fechaInicio, fechaFin, page, perPage
        );

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: error });
    }
}

export const obtenerReporteVentasProductoPorPeriodo = async (req: Request, res: Response) => {
    try {
        const search = req.query.search?.toString() ?? "";
        const fechaInicio = req.query.fechaInicio?.toString() ?? "";
        const fechaFin = req.query.fechaFin?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;

        const resultado = await obtenerReporteVentasProducto(
            search, fechaInicio, fechaFin, page, perPage
        );

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: error });
    }
}

export const obtenerReporteSalidasInventarioPorPeriodo = async (req: Request, res: Response) => {
    try {

        const search = req.query.search?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;
        const fechaInicio = req.query.fechaInicio?.toString() ?? "";
        const fechaFin = req.query.fechaFin?.toString() ?? "";

        const resultado = await obtenerReporteSalidasInventario(
            search,
            fechaInicio,
            fechaFin,
            page,
            perPage
        );

        res.json(resultado);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al buscar salidas de inventario."
        });

    }
}

