import axiosInstance from "./axiosInstance";
import type { DetalleCompraDTO } from "../models/CompraReporte";

const API = "http://localhost:3001/api/compras";
const token = localStorage.getItem("token");

interface DetalleCompra {
    Id_producto: number;
    Cantidad: number;
    Precio: number;
    Subtotal: number;
    Precio_venta: number;
}

export const crearCompra = async (
    Id_proveedor: number,
    NFactura: string,
    Total: number,
    Detalles: DetalleCompra[]
) => {

    const response = await axiosInstance.post(API, {
        Id_proveedor,
        NFactura,
        Total,
        Detalles
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const obtenerDetalleCompra = async (idCompra: number): Promise<DetalleCompraDTO> => {
    const response = await axiosInstance.get(`${API}/${idCompra}/detalle`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};