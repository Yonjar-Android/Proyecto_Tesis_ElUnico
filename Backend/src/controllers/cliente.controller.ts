import { Request, Response } from "express";
import { buscarClientes, crearCliente, actualizarCliente } from "../services/cliente.service.js";

export const buscarCliente = async (req: Request, res: Response) => {
    try{

        const search = req.query.search?.toString() ?? "";
                const page = Number(req.query.page) || 1;
                const perPage = Number(req.query.perPage) || 10;
        
                const resultado = await buscarClientes(
                    search,
                    page,
                    perPage
                );
        
                res.json(resultado);
        

    } catch(error){
        res.status(500).json({
            mensaje: "Error al buscar clientes"
        });
    }
}

export const postCliente = async (req: Request, res: Response) => {
    try {
        const { Nombre, Apellido, Telefono, Direccion, Credito, NCliente } = req.body;

        await crearCliente(Nombre, Apellido, Telefono, Direccion, Credito, NCliente);

        res.status(201).json({
            mensaje: "Cliente creado correctamente"
        });

    } catch(error:any){
        res.status(400).json({
            mensaje: error.message
        });
    }
}

export const putCliente = async (req: Request, res:Response) => {
    try{
        const { id } = req.params;
        const { Nombre } = req.body;
        const { Apellido } = req.body;
        const { Telefono } = req.body;
        const { Direccion } = req.body;
        const { Credito } = req.body;
        const { NCliente } = req.body;

        await actualizarCliente(
            Number(id),
            Nombre,
            Apellido,
            Telefono,
            Direccion,
            Number(Credito),
            Number(NCliente)
        )
        
    } catch(error:any){
        res.status(400).json({
            mensaje: error.message
        });
    }
}