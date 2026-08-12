import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/compras";

interface DetalleCompra {
    Id_producto: number;
    Cantidad: number;
    Precio: number;
    Subtotal: number;
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
    });

    return response.data;
};