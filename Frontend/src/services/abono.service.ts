import axiosInstance from "./axiosInstance";
const API = "http://localhost:3001/api/abono";
const token = localStorage.getItem("token");

export const obtenerHistorialAbonos = async (
    idCreditoFactura: number
) => {

    const response = await axiosInstance.get(`${API}/${idCreditoFactura}/historial`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export interface RegistrarAbonoPayload {
    idCreditoFactura: number;
    montoAAbonar: number;
    metodoPago: string;
    referencia?: string;
    observaciones?: string;
}

export const registrarAbono = async (
    payload: RegistrarAbonoPayload
) => {

    const response = await axiosInstance.post(`${API}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};