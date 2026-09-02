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
    Detalles: DetalleVenta[]
) => {

    const response = await axiosInstance.post(API, {
        Id_cliente,
        Tipo_Pago,
        Total,
        RecibidoCordobas,
        Num_referencia,
        Detalles
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