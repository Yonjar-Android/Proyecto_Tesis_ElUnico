import ExcelJS from "exceljs";
import { 
    obtenerReporteProductosStock, 
    obtenerReporteFacturasConDeuda,
    obtenerReporteVentas,
    obtenerReporteCompras,
    obtenerReporteSalidasInventario, 
    obtenerReporteVentasServicio,
    obtenerReporteVentasProducto
}
 from "./reporte.service.js";
import { generateExcelReport,
     ReportType,
     generateSalidasInventarioExcelReport,
      generateVentasServicioExcelReport,
      generateVentasProductoExcelReport
    } from "../utils/excelGenerator.js";

// Servicios específicos para cada reporte
export const generateProductosStockExcel = async (
    search: string = "",
    porcentaje: number = 30
): Promise<ExcelJS.Buffer> => {
    // Obtener todos los datos sin paginación
    const reportData = await obtenerReporteProductosStock(
        search,
        porcentaje,
        1,
        1000000 // Un número grande para obtener todos
    );
    
    return await generateExcelReport(reportData, 'productos_stock');
};

export const generateClientesDeudaExcel = async (
    search: string = ""
): Promise<ExcelJS.Buffer> => {
    // Obtener todos los datos sin paginación
    const reportData = await obtenerReporteFacturasConDeuda(
        search,
        1,
        1000000 // Un número grande para obtener todos
    );
    
    return await generateExcelReport(reportData, 'clientes_deuda');
};

export const generateReporteVentasPorPeriodoExcel = async(
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    tipoPago: string = "",
    estado: string = ""

): Promise<ExcelJS.Buffer> => {
    const reportData = await obtenerReporteVentas(
        search,
        fechaInicio,
        fechaFin,
        tipoPago,
        estado,
        1,
        1000000 // Un número grande para obtener todos
    );
    return await generateExcelReport(reportData, 'ventas_por_periodo');
}

export const generateReporteComprasPorPeriodoExcel = async(
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    Id_proveedor: number | null = null
): Promise<ExcelJS.Buffer> => {
    const reportData = await obtenerReporteCompras(
        search,
        fechaInicio,
        fechaFin,
        Id_proveedor,
        1,
        1000000 // Un número grande para obtener todos
    );
    return await generateExcelReport(reportData, 'compras_por_periodo'
    )
}

export const generateReporteSalidasPorPeriodoExcel = async(
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<ExcelJS.Buffer> => {
    const reportData = await obtenerReporteSalidasInventario(
        search,
        fechaInicio,
        fechaFin,
        1,
        1000000 // Un número grande para obtener todos
    );
    return await generateSalidasInventarioExcelReport(reportData);
    
}

export const generateReporteVentasServicioPorPeriodoExcel = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<ExcelJS.Buffer> => {
    const reportData = await obtenerReporteVentasServicio(
        search,
        fechaInicio,
        fechaFin,
        1,
        1000000 // Un número grande para obtener todos los servicios agrupados
    );
    return await generateVentasServicioExcelReport(reportData);
}

export const generateReporteVentasProductoPorPeriodoExcel = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = ""
): Promise<ExcelJS.Buffer> => {
    const reportData = await obtenerReporteVentasProducto(
        search,
        fechaInicio,
        fechaFin,
        1,
        1000000
    );
    return await generateVentasProductoExcelReport(reportData);
}