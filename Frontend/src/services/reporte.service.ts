import axiosInstance from "./axiosInstance";
import type { RespuestaReporteVentas } from "../models/VentaReportes";
import type { RespuestaReporteCompras } from "../models/CompraReporte";
import type { RespuestaReporteSalidas } from "../models/SalidaInventario";
import type { RespuestaReporteVentasServicios } from "../models/RespuestaReporteVentasServicios";
import type { RespuestaReporteVentasProductos } from "../models/DetalleVentaProducto";
import type { RespuestaReporteInventario } from "../models/RespuestaReporteInventario";
import type { RespuestaReporteDevoluciones } from "../models/RespuestaReporteDevoluciones";
import type { RespuestaReporteArqueo, DetalleArqueoDTO } from "../models/ArqueoCajaReporte";

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

export const obtenerReporteVentasProductosPorPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteVentasProductos> => {

    const { data } = await axiosInstance.get<RespuestaReporteVentasProductos>(
        `${API}/obtenerReporteVentasProductos`,
        {
            params: { search, fechaInicio, fechaFin, page, perPage },
            headers: { Authorization: `Bearer ${token}` }
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

export const obtenerReporteInventarioGeneral = async (
    search: string = "",
    Id_categoria: number | null = null,
    Id_marca: number | null = null,
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteInventario> => {

    const { data } = await axiosInstance.get<RespuestaReporteInventario>(
        `${API}/obtenerReporteInventario`,
        {
            params: { search, Id_categoria, Id_marca, page, perPage },
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    return data;
};

export const obtenerReporteDevolucionesPorPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteDevoluciones> => {

    const { data } = await axiosInstance.get<RespuestaReporteDevoluciones>(
        `${API}/obtenerReporteDevoluciones`,
        {
            params: { search, fechaInicio, fechaFin, page, perPage },
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    return data;
};

export const obtenerReporteArqueoPorPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    estado: string = "",
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteArqueo> => {
    const { data } = await axiosInstance.get<RespuestaReporteArqueo>(
        `${API}/obtenerReporteArqueoPeriodo`,
        {
            params: { search, fechaInicio, fechaFin, estado, page, perPage },
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return data;
};

export const obtenerReporteArqueoPorCajero = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    idUsuario: number | null = null,
    estado: string = "",
    page: number = 1,
    perPage: number = 10
): Promise<RespuestaReporteArqueo> => {
    const { data } = await axiosInstance.get<RespuestaReporteArqueo>(
        `${API}/obtenerReporteArqueoCajero`,
        {
            params: { search, fechaInicio, fechaFin, idUsuario, estado, page, perPage },
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return data;
};

export const obtenerDetalleArqueo = async (
    idSesion: number
): Promise<DetalleArqueoDTO> => {
    const { data } = await axiosInstance.get<DetalleArqueoDTO>(
        `${API}/obtenerDetalleArqueo/${idSesion}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return data;
};