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

export const descargarReporteVentasProductoPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/productos-por-periodo`, {
        params: { search, fechaInicio, fechaFin },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    return response.data;
};

export const descargarReporteVentasServicioPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/servicios-por-periodo`, {
        params: { search, fechaInicio, fechaFin },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    return response.data;
};

export const descargarReporteInventarioPdf = async (
    search: string = "",
    Id_categoria: number | null = null,
    Id_marca: number | null = null
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/inventario`, {
        params: { search, Id_categoria, Id_marca },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    return response.data;
};

export const descargarReporteSalidasInventarioPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/salidas-inventario`, {
        params: { search, fechaInicio, fechaFin },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    return response.data;
};