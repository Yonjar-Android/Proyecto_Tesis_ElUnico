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
import { registrarBitacora } from "../services/bitacora.service.js";

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
        const resultado: any = await crearRespaldo(idUsuario);

        await registrarBitacora({
            idUsuario,
            usuario: (req as any).usuario?.usuario || "Administrador",
            rol: (req as any).usuario?.rol || "Administrador",
            accion: "Creación de Respaldo",
            modulo: "Mantenimiento",
            detalles: `Respaldo generado: ${resultado?.nombreArchivo || ""}`,
            ip: req.ip,
        });

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

        await registrarBitacora({
            idUsuario: (req as any).usuario?.id,
            usuario: (req as any).usuario?.usuario || "Administrador",
            rol: (req as any).usuario?.rol || "Administrador",
            accion: "Eliminación de Respaldo",
            modulo: "Mantenimiento",
            detalles: `Respaldo #${id} eliminado`,
            ip: req.ip,
        });

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

        await registrarBitacora({
            idUsuario: (req as any).usuario?.id,
            usuario: (req as any).usuario?.usuario || "Administrador",
            rol: (req as any).usuario?.rol || "Administrador",
            accion: "Restauración de Base de Datos",
            modulo: "Mantenimiento",
            detalles: `Base de datos restaurada desde archivo: ${archivo.originalname || ""}`,
            ip: req.ip,
        });

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

        await registrarBitacora({
            idUsuario: (req as any).usuario?.id,
            usuario: (req as any).usuario?.usuario || "Administrador",
            rol: (req as any).usuario?.rol || "Administrador",
            accion: "Restauración de Base de Datos",
            modulo: "Mantenimiento",
            detalles: `Base de datos restaurada desde historial: Respaldo #${idRespaldo}`,
            ip: req.ip,
        });

        res.status(200).json({ success: true, ...resultado });
    } catch (error: any) {
        res.status(400).json({ success: false, mensaje: error.message });
    }
};