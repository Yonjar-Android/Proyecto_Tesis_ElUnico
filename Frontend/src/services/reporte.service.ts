import axios from "axios";

const API = "http://localhost:3000/api/reportes";

export const obtenerReporteStockBajo = async (
    search: string,
    page: number,
    perPage: number
) => {

    const response = await axios.get(`${API}/obtenerReporteStockBajo`, {
        params: {
            search,
            page,
            perPage
        }
    });

    return response.data;
};

export const obtenerReporteCuentasCobrar = async (
    search: string,
    page: number,
    perPage: number
) => {

    const response = await axios.get(`${API}/obtenerReporteCuentasCobrar`, {
        params: {
            search,
            page,
            perPage
        }
    });

    return response.data;
};