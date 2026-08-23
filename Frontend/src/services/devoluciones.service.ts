import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/devoluciones";
const token = localStorage.getItem("token");

export interface DetalleDevolucion {
    Id_detalle_venta: number;
    Cantidad: number;
}

export interface CrearDevolucionData {
    Id_venta: number;
    Id_usuario: number;
    Motivo: string;
    Observacion?: string | null;
    detalles: DetalleDevolucion[];
}

export const crearDevolucion = async (
    data: CrearDevolucionData
) => {

    const response = await axiosInstance.post(
        API,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};