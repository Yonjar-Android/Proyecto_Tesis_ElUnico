import axios from "axios";
import type { DetalleVenta } from "../models/DetalleVenta";

const API = "http://localhost:3000/api/ventas";

export const crearVenta = async (
    Id_cliente: number,
    Id_usuario: number,
    Tipo_Pago: string,
    Total: number,
    Detalles: DetalleVenta[]
) => {

    const response = await axios.post(API, {
        Id_cliente,
        Id_usuario,
        Tipo_Pago,
        Total,
        Detalles
    });

    return response.data;
};