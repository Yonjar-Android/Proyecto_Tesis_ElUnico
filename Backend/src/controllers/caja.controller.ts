import { Request, Response } from "express";
import {
  abrirCaja,
  obtenerSesionActiva,
  registrarEgresoCaja,
  eliminarEgresoCaja,
  cerrarCaja,
  obtenerResumenCierreCaja,
  actualizarEgresoCaja,
  obtenerHistorialCajas,
} from "../services/caja.service.js";
import { registrarBitacora } from "../services/bitacora.service.js";

export const getSesionActiva = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req as any).usuario?.id;
    const resultado = await obtenerSesionActiva(idUsuario);
    res.status(200).json({ success: true, ...resultado });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const postAperturaCaja = async (req: Request, res: Response) => {
  try {
    const { montoAperturaCordobas, montoAperturaDolares, tasaCambio, observaciones } = req.body;
    const idUsuario = (req as any).usuario?.id;

    if (!idUsuario) {
      return res.status(401).json({ success: false, message: "No se pudo identificar al usuario." });
    }

    const idSesion = await abrirCaja(
      idUsuario,
      Number(montoAperturaCordobas) || 0,
  Number(montoAperturaDolares) || 0,
  Number(tasaCambio),
  observaciones
    );

    await registrarBitacora({
      idUsuario,
      usuario: (req as any).usuario?.usuario || "Usuario",
      rol: (req as any).usuario?.rol || "N/A",
      accion: "Apertura de Caja",
      modulo: "Caja",
      detalles: `Apertura sesión #${idSesion} con C$ ${Number(montoAperturaCordobas) || 0} y $ ${Number(montoAperturaDolares) || 0} USD`,
      ip: req.ip,
    });

    res.status(201).json({ success: true, idSesion });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const postEgresoCaja = async (req: Request, res: Response) => {
  try {
    const { idSesion, tipoEgreso, metodoPago, concepto, montoCordobas, montoDolares, observaciones } = req.body;
    const idEgreso = await registrarEgresoCaja(
      Number(idSesion),
      tipoEgreso,
      metodoPago,
      concepto,
      Number(montoCordobas) || 0,
      Number(montoDolares) || 0,
      observaciones || ""
    );

    await registrarBitacora({
      idUsuario: (req as any).usuario?.id,
      usuario: (req as any).usuario?.usuario || "Usuario",
      rol: (req as any).usuario?.rol || "N/A",
      accion: "Registro de Egreso",
      modulo: "Caja",
      detalles: `Egreso #${idEgreso}: ${concepto} - C$ ${montoCordobas || 0} / $ ${montoDolares || 0} USD (${metodoPago})`,
      ip: req.ip,
    });

    res.status(201).json({ success: true, idEgreso });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEgresoCaja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await eliminarEgresoCaja(Number(id));

    await registrarBitacora({
      idUsuario: (req as any).usuario?.id,
      usuario: (req as any).usuario?.usuario || "Usuario",
      rol: (req as any).usuario?.rol || "N/A",
      accion: "Eliminación de Egreso",
      modulo: "Caja",
      detalles: `Eliminación de egreso #${id}`,
      ip: req.ip,
    });

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

    await registrarBitacora({
      idUsuario: (req as any).usuario?.id,
      usuario: (req as any).usuario?.usuario || "Usuario",
      rol: (req as any).usuario?.rol || "N/A",
      accion: "Cierre de Caja",
      modulo: "Caja",
      detalles: `Cierre sesión #${idSesion} - Efectivo contado: C$ ${totalEfectivoContado}, Diferencia: C$ ${diferencia}`,
      ip: req.ip,
    });

    res.status(200).json({ success: true, ...resultado });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getResumenCierreCaja = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req as any).usuario?.id;
    const resumen = await obtenerResumenCierreCaja(idUsuario);
    res.status(200).json({ success: true, resumen });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const putEgresoCaja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipoEgreso, metodoPago, concepto, montoCordobas, montoDolares, observaciones } = req.body;
    await actualizarEgresoCaja(
      Number(id),
      tipoEgreso,
      metodoPago,
      concepto,
      Number(montoCordobas) || 0,
      Number(montoDolares) || 0,
      observaciones || ""
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getHistorialCajas = async (req: Request, res: Response) => {
  try {
    const historial = await obtenerHistorialCajas();
    res.status(200).json({ success: true, historial });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};