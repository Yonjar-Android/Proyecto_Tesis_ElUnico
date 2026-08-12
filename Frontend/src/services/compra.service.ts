import axios from "axios";

const API = "http://localhost:3000/api/compras";
const token = localStorage.getItem("token");

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

    const response = await axios.post(API, {
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