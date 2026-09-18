import { 
    obtenerReporteVentas,
    obtenerReporteVentasProducto,
    obtenerReporteVentasServicio
 } from "./reporte.service.js";
import { 
    generateVentasPorPeriodoPdfReport,
    generateVentasProductoPdfReport,
    generateVentasServicioPdfReport
 } from "../utils/pdfGenerator.js";

export const generateReporteVentasPorPeriodoPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    tipoPago: string = "",
    estado: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteVentas(
        search, fechaInicio, fechaFin, tipoPago, estado, 1, 1000000
    );
    return await generateVentasPorPeriodoPdfReport(reportData);
};

export const generateReporteVentasProductoPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteVentasProducto(
        search, fechaInicio, fechaFin, 1, 1000000
    );
    return await generateVentasProductoPdfReport(reportData);
};

export const generateReporteVentasServicioPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteVentasServicio(
        search, fechaInicio, fechaFin, 1, 1000000
    );
    return await generateVentasServicioPdfReport(reportData);
};

