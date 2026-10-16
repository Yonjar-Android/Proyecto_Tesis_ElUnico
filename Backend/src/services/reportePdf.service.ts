import { 
    obtenerReporteVentas,
    obtenerReporteVentasProducto,
    obtenerReporteVentasServicio,
    obtenerReporteInventario,
    obtenerReporteSalidasInventario,
    obtenerReporteDevoluciones,
    obtenerReporteFacturasConDeuda,
    obtenerReporteProductosStock,
    obtenerReporteCompras,
    obtenerReporteArqueoPeriodo,
    obtenerReporteArqueoCajero
 } from "./reporte.service.js";
import { obtenerDetalleCierrePorSesion } from "./caja.service.js";
import { 
    generateVentasPorPeriodoPdfReport,
    generateVentasProductoPdfReport,
    generateVentasServicioPdfReport,
    generateInventarioPdfReport,
    generateSalidasInventarioPdfReport,
    generateDevolucionesPdfReport,
    generateClientesDeudaPdfReport,
    generateProductosStockPdfReport,
    generateComprasPorPeriodoPdfReport,
    generateArqueoPeriodoPdfReport,
    generateArqueoCajeroPdfReport,
    generateCierreCajaPdfReport
 } from "../utils/pdfGenerator.js";
import { FiltroAplicado, valorFiltro, periodoFiltro, idONombre } from "../utils/filtrosReporte.js";

// ---------- Ventas por período ----------
export const generateReporteVentasPorPeriodoPdf = async (
    search = "", fechaInicio = "", fechaFin = "", tipoPago = "", estado = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteVentas(
        search, fechaInicio, fechaFin, tipoPago, estado, 1, 1000000
    );
    const filtros: FiltroAplicado[] = [
        { label: 'Período', value: periodoFiltro(fechaInicio, fechaFin) },
        { label: 'Cliente', value: valorFiltro(search) },
        { label: 'Tipo de pago', value: valorFiltro(tipoPago) },
        { label: 'Estado', value: valorFiltro(estado) },
    ];
    return await generateVentasPorPeriodoPdfReport(reportData, filtros);
};

// ---------- Ventas por producto ----------
export const generateReporteVentasProductoPdf = async (
    search: string = "", fechaInicio: string = "", fechaFin: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteVentasProducto(search, fechaInicio, fechaFin, 1, 1000000);
    const filtros: FiltroAplicado[] = [
        { label: 'Período', value: periodoFiltro(fechaInicio, fechaFin) },
        { label: 'Producto', value: valorFiltro(search) },
    ];
    return await generateVentasProductoPdfReport(reportData, filtros);
};

// ---------- Ventas por servicio ----------
export const generateReporteVentasServicioPdf = async (
    search: string = "", fechaInicio: string = "", fechaFin: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteVentasServicio(search, fechaInicio, fechaFin, 1, 1000000);
    const filtros: FiltroAplicado[] = [
        { label: 'Período', value: periodoFiltro(fechaInicio, fechaFin) },
        { label: 'Servicio', value: valorFiltro(search) },
    ];
    return await generateVentasServicioPdfReport(reportData, filtros);
};

// ---------- Inventario ----------
export const generateReporteInventarioPdf = async (
    search: string = "",
    Id_categoria: number | null = null,
    Id_marca: number | null = null,
    nombreCategoria: string | null = null,
    nombreMarca: string | null = null
): Promise<Buffer> => {
    const reportData = await obtenerReporteInventario(search, Id_categoria, Id_marca, 1, 1000000);
    const filtros: FiltroAplicado[] = [
        { label: 'Producto', value: valorFiltro(search) },
        { label: 'Categoría', value: idONombre(Id_categoria, nombreCategoria, 'Todas') },
        { label: 'Marca', value: idONombre(Id_marca, nombreMarca, 'Todas') },
    ];
    return await generateInventarioPdfReport(reportData, filtros);
};

// ---------- Otras salidas de inventario ----------
export const generateReporteSalidasInventarioPdf = async (
    search: string = "", fechaInicio: string = "", fechaFin: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteSalidasInventario(search, fechaInicio, fechaFin, 1, 1000000);
    const filtros: FiltroAplicado[] = [
        { label: 'Período', value: periodoFiltro(fechaInicio, fechaFin) },
        { label: 'Búsqueda', value: valorFiltro(search, 'Sin búsqueda') },
    ];
    return await generateSalidasInventarioPdfReport(reportData, filtros);
};

// ---------- Devoluciones ----------
export const generateReporteDevolucionesPdf = async (
    search: string = "", fechaInicio: string = "", fechaFin: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteDevoluciones(search, fechaInicio, fechaFin, 1, 1000000);
    const filtros: FiltroAplicado[] = [
        { label: 'Período', value: periodoFiltro(fechaInicio, fechaFin) },
        { label: 'Búsqueda', value: valorFiltro(search, 'Sin búsqueda') },
    ];
    return await generateDevolucionesPdfReport(reportData, filtros);
};

// ---------- Cuentas por cobrar ----------
export const generateReporteClientesDeudaPdf = async (
    search: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteFacturasConDeuda(search, 1, 1000000);
    const filtros: FiltroAplicado[] = [
        { label: 'Cliente', value: valorFiltro(search) },
    ];
    return await generateClientesDeudaPdfReport(reportData, filtros);
};

// ---------- Stock próximo a agotarse ----------
export const generateReporteProductosStockPdf = async (
    search: string = "",
    porcentaje: number = 30
): Promise<Buffer> => {
    const reportData = await obtenerReporteProductosStock(search, porcentaje, 1, 1000000);
    const filtros: FiltroAplicado[] = [
        { label: 'Producto', value: valorFiltro(search) },
    ];
    return await generateProductosStockPdfReport(reportData, porcentaje, filtros);
};

// ---------- Compras por período ----------
export const generateReporteComprasPorPeriodoPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    Id_proveedor: number | null = null,
    nombreProveedor: string | null = null
): Promise<Buffer> => {
    const reportData = await obtenerReporteCompras(
        search, fechaInicio, fechaFin, Id_proveedor, 1, 1000000
    );
    const filtros: FiltroAplicado[] = [
        { label: 'Período', value: periodoFiltro(fechaInicio, fechaFin) },
        { label: 'Búsqueda', value: valorFiltro(search, 'Sin búsqueda') },
        { label: 'Proveedor', value: idONombre(Id_proveedor, nombreProveedor, 'Todos') },
    ];
    return await generateComprasPorPeriodoPdfReport(reportData, filtros);
};

// ---------- Arqueo por período ----------
export const generateReporteArqueoPeriodoPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    estado: string = ""
): Promise<Buffer> => {
    const reportData = await obtenerReporteArqueoPeriodo(
        search, fechaInicio, fechaFin, estado, 1, 1000000
    );
    const filtros: FiltroAplicado[] = [
        { label: 'Período', value: periodoFiltro(fechaInicio, fechaFin) },
        { label: 'Búsqueda', value: valorFiltro(search, 'Sin búsqueda') },
        { label: 'Estado', value: valorFiltro(estado) },
    ];
    return await generateArqueoPeriodoPdfReport(reportData, filtros);
};

// ---------- Arqueo por cajero ----------
export const generateReporteArqueoCajeroPdf = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    idUsuario: number | null = null,
    estado: string = "",
    nombreCajero?: string
): Promise<Buffer> => {
    const reportData = await obtenerReporteArqueoCajero(
        search, fechaInicio, fechaFin, idUsuario, estado, 1, 1000000
    );

    const filtros: FiltroAplicado[] = [
        { label: 'Cajero', value: idONombre(idUsuario, nombreCajero, 'Todos') },
        { label: 'Período', value: periodoFiltro(fechaInicio, fechaFin) },
        { label: 'Búsqueda', value: valorFiltro(search, 'Sin búsqueda') },
        { label: 'Estado', value: valorFiltro(estado) },
    ];

    return await generateArqueoCajeroPdfReport(reportData, filtros);
};

// ---------- Cierre de caja (sin cambios) ----------
export const generateReporteCierreCajaPdf = async (idSesion: number): Promise<Buffer> => {
    const detalle = await obtenerDetalleCierrePorSesion(idSesion);
    return await generateCierreCajaPdfReport(detalle);
};