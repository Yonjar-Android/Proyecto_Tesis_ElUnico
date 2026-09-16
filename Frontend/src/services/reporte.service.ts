import axiosInstance from "./axiosInstance";
import type { RespuestaReporteVentas } from "../models/VentaReportes";
import type { RespuestaReporteCompras } from "../models/CompraReporte";
import type { RespuestaReporteSalidas } from "../models/SalidaInventario";
import type { RespuestaReporteVentasServicios } from "../models/RespuestaReporteVentasServicios";

const API = "http://localhost:3001/api/reportes";
const token = localStorage.getItem("token");

export const obtenerReporteStockBajo = async (
    search: string,
    page: number,
    perPage: number
) => {

    const response = await axiosInstance.get(`${API}/obtenerReporteStockBajo`, {
        params: {
            search,
            page,
            perPage
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const obtenerReporteCuentasCobrar = async (
    search: string,
    page: number,
    perPage: number
) => {

    const response = await axiosInstance.get(`${API}/obtenerReporteCuentasCobrar`, {
        params: {
            search,
            page,
            perPage
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const obtenerReporteVentasPorPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    tipoPago: string = "",
    estado: string = "",
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteVentas> => {

    const { data } = await axiosInstance.get<RespuestaReporteVentas>(
        `${API}/obtenerReporteVentas`,
        {
            params: {
                search,
                fechaInicio,
                fechaFin,
                tipoPago,
                estado,
                page,
                perPage
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return data;
};

export const obtenerReporteVentasServiciosPorPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteVentasServicios> => {

    const { data } = await axiosInstance.get<RespuestaReporteVentasServicios>(
        `${API}/obtenerReporteVentasServicios`,
        {
            params: {
                search,
                fechaInicio,
                fechaFin,
                page,
                perPage
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return data;
};

export const obtenerReporteComprasPorPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    Id_proveedor:number | null = null,
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteCompras> => {

    const { data } = await axiosInstance.get<RespuestaReporteCompras>(
        `${API}/obtenerReporteCompras`,
        {
            params: {
                search,
                fechaInicio,
                fechaFin,
                Id_proveedor,
                page,
                perPage
            },
            headers: {
            Authorization: `Bearer ${token}`
        }
        }
    );

    return data;
};

export const obtenerReporteSalidasPorPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteSalidas> => {

    const { data } = await axiosInstance.get<RespuestaReporteSalidas>(
        `${API}/obtenerReporteSalidasInventario`,
        {
            params: { search, fechaInicio, fechaFin, page, perPage },
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    return data;
};