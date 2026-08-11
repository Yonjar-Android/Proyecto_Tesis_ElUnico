import { Request, Response } from "express";
import {
  abrirCaja,
  obtenerSesionActiva,
  registrarEgresoCaja,
  eliminarEgresoCaja,
  cerrarCaja,
  obtenerResumenCierreCaja,
} from "../services/caja.service.js";

export const getSesionActiva = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req as any).usuario?.id;
    const sesion = await obtenerSesionActiva(idUsuario);
    res.status(200).json({ success: true, sesion });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const postAperturaCaja = async (req: Request, res: Response) => {
  try {
    const { montoAperturaCordobas, tasaCambio, observaciones } = req.body;
    const idUsuario = (req as any).usuario?.id;

    if (!idUsuario) {
      return res.status(401).json({ success: false, message: "No se pudo identificar al usuario." });
    }

    const idSesion = await abrirCaja(
      idUsuario,
      Number(montoAperturaCordobas),
      Number(tasaCambio),
      observaciones || ""
    );

    res.status(201).json({ success: true, idSesion });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const postEgresoCaja = async (req: Request, res: Response) => {
  try {
    const { idSesion, tipoEgreso, metodoPago, concepto, montoCordobas, observaciones } = req.body;
    const idEgreso = await registrarEgresoCaja(
      Number(idSesion),
      tipoEgreso,
      metodoPago,
      concepto,
      Number(montoCordobas),
      observaciones || ""
    );
    res.status(201).json({ success: true, idEgreso });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEgresoCaja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await eliminarEgresoCaja(Number(id));
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const postCierreCaja = async (req: Request, res: Response) => {
  try {
    const { idSesion, totalEfectivoContado, totalTarjetaTransferencia, diferencia, observaciones } = req.body;
    const resultado = await cerrarCaja(
      Number(idSesion),
      Number(totalEfectivoContado),
      Number(totalTarjetaTransferencia),
      Number(diferencia),
      observaciones || ""
    );
    res.status(200).json({ success: true, ...resultado });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getResumenCierreCaja = async (req: Request, res: Response) => {
  try {
    const { idSesion } = req.query;
    const resumen = await obtenerResumenCierreCaja(Number(idSesion));
    res.status(200).json({ success: true, ...resumen });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};