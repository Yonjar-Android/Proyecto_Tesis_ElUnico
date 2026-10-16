import { Request, Response } from "express";
import { obtenerBitacora } from "../services/bitacora.service.js";

export const listarBitacora = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "");
    const modulo = String(req.query.modulo || "");
    const fechaInicio = String(req.query.fechaInicio || "");
    const fechaFin = String(req.query.fechaFin || "");
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 20;

    const resultado = await obtenerBitacora(search, modulo, fechaInicio, fechaFin, page, perPage);
    return res.json({ success: true, ...resultado });
  } catch (error: any) {
    console.error("Error al obtener bitácora:", error);
    return res.status(500).json({ success: false, message: "Error al obtener registros de auditoría" });
  }
};
