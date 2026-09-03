import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/excel";
const token = localStorage.getItem("token");

export const descargarReporteStockBajoExcel = async (
    search: string = ""
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/productos-stock`, {
        params: {
            search
        },
        headers: {
            Authorization: `Bearer ${token}`
        },
        responseType: 'blob' // Importante para manejar archivos binarios
    });

    return response.data;
};

export const descargarReporteCuentasCobrarExcel = async (
    search: string = ""
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/clientes-deuda`, {
        params: {
            search
        },
        headers: {
            Authorization: `Bearer ${token}`
        },
        responseType: 'blob' // Importante para manejar archivos binarios
    });

    return response.data;
};

// Función helper para descargar el archivo
export const descargarArchivoExcel = (
    blob: Blob, 
    nombreArchivo: string
): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    
    // Añadir al DOM, hacer click y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar el objeto URL
    window.URL.revokeObjectURL(url);
};

export const descargarReporteVentasExcel = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    tipoPago: string = ""
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/excel/ventas-por-periodo`, {
        params: { 
            search, 
            fechaInicio, 
            fechaFin,
            tipoPago 
        },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    return response.data;
};

export const descargarReporteComprasExcel = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    Id_proveedor:number | null = null,
): Promise<Blob> => {
    const response = await axiosInstance.get(`${API}/excel/compras-por-periodo`, {
        params: { 
            search, 
            fechaInicio, 
            fechaFin ,
            Id_proveedor
        },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    return response.data;
};
