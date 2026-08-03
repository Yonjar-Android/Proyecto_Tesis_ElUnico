import { Request, Response } from "express";
import {
  obtenerEstadoCaja,
  abrirCaja,
  agregarEgreso,
  eliminarEgreso,
  cerrarCaja,
  obtenerResumenCierre,
} from "../services/caja.service.js";

export const getSesionActiva = async (req: Request, res: Response) => {
  try {
    const estadoCaja = await obtenerEstadoCaja();
    res.json({
      success: true,
      ...estadoCaja,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const postAperturaCaja = async (req: Request, res: Response) => {
  try {
    const { montoAperturaCordobas, tasaCambio, observaciones } = req.body;

    const idSesion = await abrirCaja(
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
    const { idSesion, tipoEgreso, metodoPago, concepto, monto, observaciones } = req.body;

    const idEgreso = await agregarEgreso(
      Number(idSesion),
      tipoEgreso,
      metodoPago,
      concepto,
      Number(monto),
      observaciones || ""
    );

    res.status(201).json({ success: true, idEgreso });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEgresoCaja = async (req: Request, res: Response) => {
  try {
    const idEgreso = Number(req.params.id);
    await eliminarEgreso(idEgreso);
    res.json({ success: true, message: "Egreso eliminado correctamente." });
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

    res.json({ success: true, cierre: resultado });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getResumenCierreCaja = async (req: Request, res: Response) => {
  try {
    const estadoCaja = await obtenerEstadoCaja();
    if (!estadoCaja.sesion) {
      return res.status(404).json({ success: false, message: "No hay caja abierta." });
    }

    const resumen = await obtenerResumenCierre(estadoCaja.sesion.id_sesion);
    res.json({ success: true, resumen });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
