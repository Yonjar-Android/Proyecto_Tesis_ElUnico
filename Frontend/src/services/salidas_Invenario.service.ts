import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/salidas_inventario";

export interface DetalleSalida {
    Id_producto: number;
    Cantidad: number;
}

export interface CrearSalidaData {
    Tipo_Salida: string;
    Observacion?: string | null;
    detalles: DetalleSalida[];
}

export const crearSalida = async (
    data: CrearSalidaData
) => {

    const response = await axiosInstance.post(
        API,
        data
    );

    return response.data;
};