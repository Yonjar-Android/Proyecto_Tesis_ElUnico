import { Request, Response } from "express";
import {
    buscarProveedores,
    crearProveedor,
    actualizarProveedor
} from "../services/proveedor.service.js";

export const buscarProveedor = async (req: Request, res: Response) => {

    try {

        const search = req.query.search?.toString() ?? "";
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;

        const resultado = await buscarProveedores(
            search,
            page,
            perPage
        );

        res.json(resultado);

    } catch {

        res.status(500).json({
            mensaje: "Error al buscar proveedores"
        });

    }

};

export const postProveedor = async (req: Request, res: Response) => {

    try {

        const {
            Nombre_Empresa,
            Nombre_Contacto,
            Telefono,
            Direccion
        } = req.body;

        await crearProveedor(
            Nombre_Empresa,
            Nombre_Contacto,
            Telefono,
            Direccion
        );

        res.status(201).json({
            mensaje: "Proveedor creado correctamente."
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }

};

export const putProveedor = async (req: Request, res: Response) => {

    try {

        const { id } = req.params;

        const {
            Nombre_Empresa,
            Nombre_Contacto,
            Telefono,
            Direccion
        } = req.body;

        const result = await actualizarProveedor(
            Number(id),
            Nombre_Empresa,
            Nombre_Contacto,
            Telefono,
            Direccion
        );

        res.status(200).json({
            mensaje: "Proveedor actualizado correctamente.",
            result
        });

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }

};