import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/pdf";
const token = localStorage.getItem("token");

export const descargarReporteVentasPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    tipoPago: string = "",
    estado: string = ""
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/ventas-por-periodo`, {
        params: { search, fechaInicio, fechaFin, tipoPago, estado },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    return response.data;
};