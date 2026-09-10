import axiosInstance from "./axiosInstance";
import type { DetalleVenta } from "../models/DetalleVenta";

const API = "http://localhost:3001/api/ventas";
const token = localStorage.getItem("token");

export const crearVenta = async (
    Id_cliente: number,
    Tipo_Pago: string,
    Total: number,
    RecibidoCordobas:number,
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