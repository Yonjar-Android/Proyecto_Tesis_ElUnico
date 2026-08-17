import axiosInstance from "./axiosInstance";
import type { DetalleVenta } from "../models/DetalleVenta";

const API = "http://localhost:3001/api/ventas";

export const crearVenta = async (
    Id_cliente: number,
    Tipo_Pago: string,
    Total: number,
    Detalles: DetalleVenta[]
) => {

    const response = await axiosInstance.post(API, {
        Id_cliente,
        Tipo_Pago,
        Total,
        Detalles
    });

    return response.data;
};