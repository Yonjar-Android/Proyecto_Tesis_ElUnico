import { Request, Response } from "express";
import fs from "fs";
import {
    crearRespaldo,
    listarRespaldos,
    obtenerRutaRespaldo,
    eliminarRespaldo,
    restaurarDesdeArchivo,
    restaurarDesdeRespaldoExistente,
} from "../services/mantenimiento.service.js";

export const getRespaldos = async (req: Request, res: Response) => {
    try {
        const respaldos = await listarRespaldos();
        res.status(200).json({ success: true, respaldos });
    } catch (error: any) {
        res.status(400).json({ success: false, mensaje: error.message });
    }
};

export const postCrearRespaldo = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).usuario?.id ?? null;
        const resultado = await crearRespaldo(idUsuario);
        res.status(201).json({ success: true, ...resultado });
    } catch (error: any) {
        res.status(400).json({ success: false, mensaje: error.message });
    }
};

export const getDescargarRespaldo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rutaArchivo, nombreArchivo } = await obtenerRutaRespaldo(Number(id));
        res.download(rutaArchivo, nombreArchivo);
    } catch (error: any) {
        res.status(400).json({ success: false, mensaje: error.message });
    }
};

export const deleteRespaldo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const resultado = await eliminarRespaldo(Number(id));
        res.status(200).json({ success: true, ...resultado });
    } catch (error: any) {
        res.status(400).json({ success: false, mensaje: error.message });
    }
};

// Restaurar subiendo un archivo .sql nuevo (requiere multer configurado en la ruta)
export const postRestaurarDesdeArchivo = async (req: Request, res: Response) => {
    try {
        const archivo = (req as any).file;

        if (!archivo) {
            return res.status(400).json({ success: false, mensaje: "Debes subir un archivo .sql." });
        }

        const resultado = await restaurarDesdeArchivo(archivo.path);

        fs.unlink(archivo.path, () => {});

        res.status(200).json({ success: true, ...resultado });
    } catch (error: any) {
        res.status(400).json({ success: false, mensaje: error.message });
    }
};

// Restaurar a partir de un respaldo ya existente en el historial
export const postRestaurarDesdeHistorial = async (req: Request, res: Response) => {
    try {
        const { idRespaldo } = req.body;

        if (!idRespaldo) {
            return res.status(400).json({ success: false, mensaje: "Debes indicar qué respaldo restaurar." });
        }

        const resultado = await restaurarDesdeRespaldoExistente(Number(idRespaldo));
        res.status(200).json({ success: true, ...resultado });
    } catch (error: any) {
        res.status(400).json({ success: false, mensaje: error.message });
    }
};