import { 
    obtenerReporteVentas,
    obtenerReporteVentasProducto,
    obtenerReporteVentasServicio,
    obtenerReporteInventario,
    obtenerReporteSalidasInventario,
    obtenerReporteDevoluciones,
    obtenerReporteFacturasConDeuda,
    obtenerReporteProductosStock,
    obtenerReporteCompras
 } from "./reporte.service.js";
import { 
    generateVentasPorPeriodoPdfReport,
    generateVentasProductoPdfReport,
    generateVentasServicioPdfReport,
    generateInventarioPdfReport,
    generateSalidasInventarioPdfReport,
    generateDevolucionesPdfReport,
    generateClientesDeudaPdfReport,
    generateProductosStockPdfReport,
    generateComprasPorPeriodoPdfReport
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

export const generateReporteInventarioPdf = async (
    search: string = "",
    Id_categoria: number | null = null,
    Id_marca: number | null = null
): Promise<Buffer> => {
    const reportData = await obtenerReporteInventario(
        search,
        Id_categoria,
        Id_marca,
        1,
        1000000
    );
    return await generateInventarioPdfReport(reportData);
};

export const generateReporteSalidasInventarioPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteSalidasInventario(
        search, fechaInicio, fechaFin, 1, 1000000
    );
    return await generateSalidasInventarioPdfReport(reportData);
};

export const generateReporteDevolucionesPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteDevoluciones(
        search, fechaInicio, fechaFin, 1, 1000000
    );
    return await generateDevolucionesPdfReport(reportData);
};

export const generateReporteClientesDeudaPdf = async (
    search: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteFacturasConDeuda(search, 1, 1000000);
    return await generateClientesDeudaPdfReport(reportData);
};

export const generateReporteProductosStockPdf = async (
    search: string = "",
    porcentaje: number = 30
): Promise<Buffer> => {
    const reportData = await obtenerReporteProductosStock(search, porcentaje, 1, 1000000);
    return await generateProductosStockPdfReport(reportData, porcentaje);
};

export const generateReporteComprasPorPeriodoPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    Id_proveedor: number | null = null
): Promise<Buffer> => {
    const reportData = await obtenerReporteCompras(
        search,
        fechaInicio,
        fechaFin,
        Id_proveedor,
        1,
        1000000
    );
    return await generateComprasPorPeriodoPdfReport(reportData);
};