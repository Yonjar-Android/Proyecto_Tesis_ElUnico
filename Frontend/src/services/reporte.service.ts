import axios from "axios";
import type { RespuestaReporteVentas } from "../models/VentaReportes";

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

export const obtenerReporteVentasPorPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    tipoPago: string = "",
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteVentas> => {

    const { data } = await axios.get<RespuestaReporteVentas>(
        `${API}/obtenerReporteVentas`,
        {
            params: {
                search,
                fechaInicio,
                fechaFin,
                tipoPago,
                page,
                perPage
            }
        }
    );

    return data;
};