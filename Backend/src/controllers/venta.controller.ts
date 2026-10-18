import { Request, Response } from "express";
import { crearVenta, buscarFacturaParaDevolucion, obtenerReciboVenta, verificarLimiteCreditoPendiente, editarVenta, listarHistorialVentas, obtenerVentaParaEditar } from "../services/venta.service.js";
import { registrarBitacora } from "../services/bitacora.service.js";

export const postVenta = async (req: Request, res: Response) => {
    try {

        const idUsuario = (req as any).usuario?.id;

        if (!idUsuario) {
            return res.status(401).json({ mensaje: "No se pudo identificar al usuario." });
        }

        const {
            Id_cliente,
            Tipo_Pago,
            Total,
            RecibidoCordobas,
            RecibidoDolares,
            Num_referencia,
            Detalles,
            DatosCredito
        } = req.body;

        const resultado: any = await crearVenta(
          Number(Id_cliente),
          idUsuario,
          Tipo_Pago,
          Number(Total),
          Number(RecibidoCordobas) || 0,
          Number(RecibidoDolares) || 0,
          Num_referencia,
          Detalles,
          DatosCredito
        );

        await registrarBitacora({
          idUsuario,
          usuario: (req as any).usuario?.usuario || "Usuario",
          rol: (req as any).usuario?.rol || "N/A",
          accion: "Registro de Venta",
          modulo: "Ventas",
          detalles: `Venta #${resultado?.id || resultado?.insertId || ""} por C$ ${Total} (Pago: ${Tipo_Pago})`,
          ip: req.ip,
        });

        res.status(201).json(resultado);

    } catch (error: any) {

        res.status(400).json({
            mensaje: error.message
        });

    }
};

export const getFacturaParaDevolucion = async (
    req: Request,
    res: Response
) => {

    try {

        const { id } = req.params;

        const resultado = await buscarFacturaParaDevolucion(
            Number(id)
        );

        res.json(resultado);

    } catch (error: any) {

        console.error(error);

        res.status(400).json({
            mensaje: error.message
        });

    }
};

export const getReciboVenta = async (
    req: Request,
    res: Response
) => {

    try {

        const { id } = req.params;

        const resultado = await obtenerReciboVenta(
            Number(id)
        );

        res.json(resultado);

    } catch (error: any) {

        console.error(error);

        res.status(400).json({
            mensaje: error.message
        });

    }
};

export const getVentasPendientes= async (
    req: Request,
    res: Response
) => {

    try {

        const { id } = req.params;

        const resultado = await verificarLimiteCreditoPendiente(
            Number(id)
        );

        res.json(resultado);

    } catch(error:any){
        res.status(400).json({
            mensaje: error.message
        });
    }
}

export const getHistorialVentas = async (req: Request, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        res.json(await listarHistorialVentas(page, limit));
    } catch (error: any) {
        res.status(400).json({ mensaje: error.message });
    }
};

export const getVentaParaEditar = async (req: Request, res: Response) => {
    try {
        res.json(await obtenerVentaParaEditar(Number(req.params.id)));
    } catch (error: any) {
        res.status(400).json({ mensaje: error.message });
    }
};

const ROLES_EDICION_VENTA: string[] = []; // vacío = cualquier usuario autenticado

export const putVenta = async (req: Request, res: Response) => {
    try {
        const idUsuario = (req as any).usuario?.id;
        if (!idUsuario) return res.status(401).json({ mensaje: "No se pudo identificar al usuario." });

        const rol = (req as any).usuario?.rol;
        if (ROLES_EDICION_VENTA.length > 0 && !ROLES_EDICION_VENTA.includes(rol)) {
            return res.status(403).json({ mensaje: "No tienes permiso para editar o anular facturas." });
        }

        const { Estado, Detalles, Ajuste } = req.body;
        const idVenta = Number(req.params.id);

        const resultado = await editarVenta(idVenta, idUsuario, Estado, Detalles ?? [], {
            metodo: Ajuste?.metodo === "Transferencia" ? "Transferencia" : "Efectivo",
            recibidoCordobas: Number(Ajuste?.recibidoCordobas) || 0,
            referencia: String(Ajuste?.referencia ?? ""),
        });

        await registrarBitacora({
            idUsuario,
            usuario: (req as any).usuario?.usuario || "Usuario",
            rol: rol || "N/A",
            accion: Estado === "Anulada" ? "Anulación de Venta" : "Edición de Venta",
            modulo: "Ventas",
            detalles: `Factura #${idVenta} (${Estado})`,
            ip: req.ip,
        });

        res.json(resultado);
    } catch (error: any) {
        res.status(400).json({ mensaje: error.message });
    }
};