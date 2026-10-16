import axiosInstance from "./axiosInstance";

const API = "/salidas_inventario";

export interface DetalleSalida {
    Id_producto: number;
    Cantidad: number;
    Motivo: string;
}

export interface CrearSalidaData {
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