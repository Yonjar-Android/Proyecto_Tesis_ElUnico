import axiosInstance from "./axiosInstance";
const API = "http://localhost:3001/api/cuota";
const token = localStorage.getItem("token");

export const obtenerCuotasPendientes = async (
    idCreditoFactura: number
) => {

    const response = await axiosInstance.get(`${API}/${idCreditoFactura}/pendientes`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const obtenerSiguienteCuota = async (
    idCreditoFactura: number
) => {

    const response = await axiosInstance.get(`${API}/${idCreditoFactura}/siguiente`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};