import axiosInstance from "./axiosInstance";
import type { DetalleVenta } from "../models/DetalleVenta";

const API = "/ventas";
const token = localStorage.getItem("token");

export const crearVenta = async (
    Id_cliente: number,
    Tipo_Pago: string,
    Total: number,
    RecibidoCordobas:number,
    RecibidoDolares: number,
    Num_referencia: string,
    Detalles: DetalleVenta[],
    DatosCredito?: {  // ← NUEVO: Parámetro opcional
        fecha_inicio: string;
        numero_cuotas: number;
        frecuencia: 'diario' | 'semanal' | 'quincenal' | 'mensual';
        monto_inicial: number; // Agregado para el monto inicial del crédito
    }
) => {

    const response = await axiosInstance.post(API, {
        Id_cliente,
        Tipo_Pago,
        Total,
        RecibidoCordobas,
        RecibidoDolares,
        Num_referencia,
        Detalles,
        DatosCredito
    }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

    return response.data;
};

export const buscarFacturaParaDevolucion = async (
    idVenta: number
) => {

    const response = await axiosInstance.get(
        `${API}/factura-devolucion/${idVenta}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const obtenerReciboVenta = async (idVenta: number) => {
    const response = await axiosInstance.get(`${API}/${idVenta}/recibo`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const verificarLimiteCreditoPendiente = async (idCliente: number) => {
    const response = await axiosInstance.get(`${API}/${idCliente}/ventasPendientes`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const obtenerHistorialVentas = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`${API}/historial`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const obtenerVentaParaEditar = async (idVenta: number) => {
    const response = await axiosInstance.get(`${API}/${idVenta}/editar-datos`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const actualizarVenta = async (
    idVenta: number,
    Estado: "Pagada" | "Anulada",
    Detalles: { Id_producto?: number; Id_servicio?: number; Cantidad: number;
                Descuento?: number; Tipo_Descuento?: "porcentaje" | "fijo" }[],
    Ajuste: { metodo: "Efectivo" | "Transferencia"; recibidoCordobas: number; referencia: string }
) => {
    const response = await axiosInstance.put(
        `${API}/${idVenta}`,
        { Estado, Detalles, Ajuste },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};