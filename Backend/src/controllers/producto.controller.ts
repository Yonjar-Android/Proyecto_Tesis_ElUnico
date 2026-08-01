import { Request, Response } from "express";
import {
    buscarProductos,
    buscarProductoPorId,
    crearProducto,
    actualizarProducto,
    obtenerTotalProductosCategorias
} from "../services/producto.service.js";

export const buscarProducto = async (req: Request, res: Response) => {
    try {

        const search = req.query.search?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;

        const resultado = await buscarProductos(
            search,
            page,
            perPage
        );

        res.json(resultado);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al buscar productos."
        });

    }
};

export const getProductoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const resultado = await buscarProductoPorId(Number(id));
        res.json(resultado);
    } catch (error:any) {
        res.status(500).json({
            mensaje: "Error al buscar producto."
        });
    }
}

export const getTotalProductsCategories = async (req: Request, res: Response) => {
    try{
        const resultado = await obtenerTotalProductosCategorias();
        res.json(resultado);
    } catch (error:any) {
        res.status(500).json({
            mensaje: "Error al obtener estadísticas de inventario."
        });
    }
}

export const postProducto = async (req: Request, res: Response) => {
    try {

        const {
            Nombre,
            Id_marca,
            Id_categoria,
            Precio_venta,
            Stock,
            Stock_min,
            Fecha_vencimiento
        } = req.body;

        await crearProducto(
            Nombre,
            Number(Id_marca),
            Number(Id_categoria),
            Number(Precio_venta),
            Number(Stock),
            Number(Stock_min),
            Fecha_vencimiento || null
        );

        res.status(201).json({
            mensaje: "Producto creado correctamente."
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
};

export const putProducto = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        const {
            Nombre,
            Id_marca,
            Id_categoria,
            Precio_venta,
            Stock,
            Stock_min,
            Fecha_vencimiento
        } = req.body;

        const result = await actualizarProducto(
            Number(id),
            Nombre,
            Number(Id_marca),
            Number(Id_categoria),
            Number(Precio_venta),
            Number(Stock),
            Number(Stock_min),
            Fecha_vencimiento || null
        );

        res.status(200).json({
            mensaje: "Producto actualizado correctamente.",
            result
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
};