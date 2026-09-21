import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Gestión y Caching del Logotipo Corporativo para Excel ---
let cachedLogoBuffer: Buffer | null = null;
const obtenerLogoExcel = (): Buffer | null => {
    if (cachedLogoBuffer) return cachedLogoBuffer;
    const posiblesRutas = [
        path.join(__dirname, '../assets/LogoAzulNaranja.png'),
        path.join(__dirname, '../assets/logo.png'),
        path.join(__dirname, '../../Frontend/src/assets/LogoAzulNaranja.png'),
        path.join(process.cwd(), 'src/assets/LogoAzulNaranja.png'),
        path.join(process.cwd(), 'src/assets/logo.png'),
        path.join(process.cwd(), 'dist/assets/LogoAzulNaranja.png'),
        path.join(process.cwd(), '../Frontend/src/assets/LogoAzulNaranja.png'),
    ];
    for (const p of posiblesRutas) {
        try {
            if (fs.existsSync(p)) {
                cachedLogoBuffer = fs.readFileSync(p);
                return cachedLogoBuffer;
            }
        } catch (_) {}
    }
    return null;
};

export const bordeSutil = () => ({
    top: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
});

export const bordeEncabezado = () => ({
    top: { style: 'thin' as const, color: { argb: 'FF334155' } },
    left: { style: 'thin' as const, color: { argb: 'FF334155' } },
    bottom: { style: 'thin' as const, color: { argb: 'FF334155' } },
    right: { style: 'thin' as const, color: { argb: 'FF334155' } },
});

const bordeCompleto = bordeSutil;

interface ColumnaExcelConfig {
    header: string;
    key: string;
    width: number;
    numFmt?: string;
    align?: 'left' | 'center' | 'right';
}

interface StatExcelItem {
    label: string;
    value: any;
    format: string;
    variant?: 'normal' | 'danger' | 'success' | 'warning';
}

const aplicarCabeceraInstitucional = (
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    nombreReporte: string,
    columnas: ColumnaExcelConfig[]
) => {
    // Configurar columnas sin 'header' para preservar la fila 1 para el banner
    worksheet.columns = columnas.map(c => ({
        key: c.key,
        width: c.width,
    }));

    // Alturas de filas del banner institucional
    worksheet.getRow(1).height = 24;
    worksheet.getRow(2).height = 20;
    worksheet.getRow(3).height = 18;
    worksheet.getRow(4).height = 10;
    worksheet.getRow(5).height = 26;

    // Logotipo de la empresa en celda A1 (55x55 px)
    const logo = obtenerLogoExcel();
    if (logo) {
        try {
            const imgId = workbook.addImage({
                buffer: logo as any,
                extension: 'png',
            });
            worksheet.addImage(imgId, {
                tl: { col: 0.15, row: 0.15 },
                ext: { width: 55, height: 55 },
            });
        } catch (_) {}
    }

    // Nombre de la Empresa
    const celdaEmpresa = worksheet.getCell('B1');
    celdaEmpresa.value = 'REPUESTOS EL ÚNICO';
    celdaEmpresa.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FF0F172A' } };
    celdaEmpresa.alignment = { vertical: 'middle', horizontal: 'left' };

    // Título del Reporte
    const celdaReporte = worksheet.getCell('B2');
    celdaReporte.value = nombreReporte;
    celdaReporte.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF1E40AF' } };
    celdaReporte.alignment = { vertical: 'middle', horizontal: 'left' };

    // Metadatos de generación
    const celdaMeta = worksheet.getCell('B3');
    celdaMeta.value = `Generado el: ${new Date().toLocaleString('es-NI')} | Sistema de Control y Gestión El Único`;
    celdaMeta.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
    celdaMeta.alignment = { vertical: 'middle', horizontal: 'left' };

    // Encabezados de la tabla en Fila 5 con color azul marino #0F172A
    const row5 = worksheet.getRow(5);
    columnas.forEach((col, idx) => {
        const cell = row5.getCell(idx + 1);
        cell.value = col.header;
        cell.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 10.5 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        cell.alignment = { vertical: 'middle', horizontal: col.align ?? 'center' };
        cell.border = bordeEncabezado();
    });
};

const aplicarEstadisticasYEstilos = (
    worksheet: ExcelJS.Worksheet,
    columnas: ColumnaExcelConfig[],
    dataLength: number,
    stats: StatExcelItem[],
    tituloStatsTexto: string = 'ESTADÍSTICAS'
) => {
    const numColumnas = columnas.length;
    const colStats = numColumnas + 2;

    // Anchos para columnas de estadísticas
    worksheet.getColumn(colStats).width = 27;
    worksheet.getColumn(colStats + 1).width = 20;

    // Encabezado de estadísticas en la Fila 5
    const row5 = worksheet.getRow(5);
    const cHead1 = row5.getCell(colStats);
    cHead1.value = tituloStatsTexto;
    cHead1.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 10.5 };
    cHead1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cHead1.alignment = { vertical: 'middle', horizontal: 'center' };
    cHead1.border = bordeEncabezado();

    const cHead2 = row5.getCell(colStats + 1);
    cHead2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cHead2.border = bordeEncabezado();

    // Filas de estadísticas a partir de la fila 6
    stats.forEach((stat, i) => {
        const row = worksheet.getRow(6 + i);
        row.height = 20;

        const cLabel = row.getCell(colStats);
        cLabel.value = stat.label;
        cLabel.font = { name: 'Calibri', bold: true, size: 9.5, color: { argb: 'FF475569' } };
        cLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cLabel.alignment = { vertical: 'middle', horizontal: 'left' };
        cLabel.border = bordeSutil();

        const cVal = row.getCell(colStats + 1);
        cVal.value = typeof stat.value === 'number' ? stat.value : Number(stat.value ?? 0);
        cVal.numFmt = stat.format;
        cVal.alignment = { vertical: 'middle', horizontal: 'right' };

        let valBg = 'FFFFFFFF';
        let valColor = 'FF0F172A';
        const lUpper = stat.label.toUpperCase();
        if (stat.variant === 'danger' || lUpper.includes('RIESGO') || lUpper.includes('FALTANTE') || lUpper.includes('DEUDA') || lUpper.includes('DEVOLUCION')) {
            valBg = 'FFFEF2F2';
            valColor = 'FFDC2626';
        } else if (stat.variant === 'success' || lUpper.includes('VENTAS') || lUpper.includes('SOBRANTE') || lUpper.includes('GANANCIA') || lUpper.includes('FACTURADO')) {
            valBg = 'FFF0FDF4';
            valColor = 'FF16A34A';
        } else if (stat.variant === 'warning' || lUpper.includes('PENDIENTE') || lUpper.includes('SALIDAS')) {
            valBg = 'FFFFFBEB';
            valColor = 'FFD97706';
        }

        cVal.font = { name: 'Calibri', bold: true, size: 10, color: { argb: valColor } };
        cVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: valBg } };
        cVal.border = bordeSutil();
    });

    // Formatear filas de datos de la tabla (filas 6 a 5 + dataLength)
    const ultimaFila = 5 + dataLength;
    for (let r = 6; r <= ultimaFila; r++) {
        const row = worksheet.getRow(r);
        row.height = 20;
        const esImpar = (r - 6) % 2 === 1;
        const bgFila = esImpar ? 'FFF8FAFC' : 'FFFFFFFF';

        for (let c = 1; c <= numColumnas; c++) {
            const cell = row.getCell(c);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgFila } };
            cell.border = bordeSutil();
            if (!cell.font) {
                cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF1E293B' } };
            }
            const colConfig = columnas[c - 1];
            if (colConfig?.numFmt) {
                cell.numFmt = colConfig.numFmt;
            }
            if (colConfig?.align) {
                cell.alignment = { vertical: 'middle', horizontal: colConfig.align };
            } else if (typeof cell.value === 'number') {
                cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
        }
    }
};

export type ReportType = 'productos_stock' | 'clientes_deuda' | 'ventas_por_periodo' | 'compras_por_periodo';

export const generateExcelReport = async (
    reportData: any,
    reportType: ReportType
): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Único';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Reporte');

    let nombreReporte = '';
    let columnas: ColumnaExcelConfig[] = [];
    let stats: StatExcelItem[] = [];

    if (reportType === 'productos_stock') {
        nombreReporte = 'Reporte de Stock Próximo a Agotarse';
        columnas = [
            { header: 'ID', key: 'id', width: 10, align: 'center', numFmt: '0' },
            { header: 'Producto', key: 'Nombre', width: 30 },
            { header: 'Marca', key: 'Nombre_marca', width: 20 },
            { header: 'Categoría', key: 'Nombre_categoria', width: 20 },
            { header: 'Precio Venta', key: 'Precio_venta', width: 15, align: 'right', numFmt: '#,##0.00' },
            { header: 'Stock', key: 'Stock', width: 12, align: 'center', numFmt: '0' },
            { header: 'Stock Mínimo', key: 'Stock_min', width: 15, align: 'center', numFmt: '0' },
            { header: 'Fecha Vencimiento', key: 'Fecha_vencimiento', width: 20, align: 'center', numFmt: 'DD/MM/YYYY' },
        ];
        const enRiesgo = Number(reportData.TotalProductosEnRiesgo ?? 0);
        stats = [
            { label: 'Total Evaluados:', value: reportData.TotalProductosEvaluados, format: '0' },
            { label: 'Total en Riesgo:', value: reportData.TotalProductosEnRiesgo, format: '0', variant: enRiesgo > 0 ? 'danger' : 'normal' },
        ];
    } else if (reportType === 'clientes_deuda') {
        nombreReporte = 'Reporte de Cuentas por Cobrar';
        columnas = [
            { header: 'N° Factura', key: 'IdVenta', width: 12, align: 'center', numFmt: '0' },
            { header: 'N° Cliente', key: 'NCliente', width: 15, align: 'left', numFmt: '@' },
            { header: 'Nombre', key: 'Nombre', width: 25 },
            { header: 'Apellido', key: 'Apellido', width: 25 },
            { header: 'Teléfono', key: 'Telefono', width: 15, align: 'center', numFmt: '@' },
            { header: 'Crédito Pendiente', key: 'Saldo_Deuda', width: 18, align: 'right', numFmt: '#,##0.00' },
            { header: 'Próx. Fecha de Pago', key: 'ProximaFechaPago', width: 20, align: 'center', numFmt: 'DD/MM/YYYY' },
        ];
        stats = [
            { label: 'Total Facturas:', value: reportData.TotalFacturasConDeuda, format: '0', variant: 'warning' },
            { label: 'Saldo Pendiente:', value: reportData.TotalSaldoPendiente, format: '#,##0.00', variant: 'danger' },
        ];
    } else if (reportType === 'ventas_por_periodo') {
        nombreReporte = 'Reporte de Ventas por Período';
        columnas = [
            { header: 'ID Venta', key: 'id', width: 12, align: 'center', numFmt: '0' },
            { header: 'Fecha', key: 'Fecha', width: 15, align: 'center', numFmt: 'DD/MM/YYYY' },
            { header: 'Cliente', key: 'Cliente', width: 30 },
            { header: 'N° Cliente', key: 'NCliente', width: 15, align: 'left', numFmt: '@' },
            { header: 'Tipo Pago', key: 'Tipo_Pago', width: 15, align: 'center' },
            { header: 'Total Original', key: 'TotalOriginal', width: 16, align: 'right', numFmt: '#,##0.00' },
            { header: 'Total Devuelto', key: 'TotalDevuelto', width: 16, align: 'right', numFmt: '#,##0.00' },
            { header: 'Total Neto', key: 'Total', width: 16, align: 'right', numFmt: '#,##0.00' },
        ];
        const pendiente = Number(reportData.TotalPendientePago ?? 0);
        stats = [
            { label: 'Total Registros:', value: reportData.TotalRegistros, format: '0' },
            { label: 'Ventas Contado:', value: reportData.VentasContado, format: '#,##0.00' },
            { label: 'Ventas Transferencia:', value: reportData.VentasTransferencia, format: '#,##0.00' },
            { label: 'Total Abonado:', value: reportData.TotalAbonado, format: '#,##0.00' },
            { label: 'Total Pendiente:', value: reportData.TotalPendientePago, format: '#,##0.00', variant: pendiente > 0 ? 'warning' : 'normal' },
            { label: 'Total Ventas:', value: reportData.TotalVentas, format: '#,##0.00', variant: 'success' },
        ];
    } else if (reportType === 'compras_por_periodo') {
        nombreReporte = 'Reporte de Compras por Período';
        columnas = [
            { header: 'ID Compra', key: 'id', width: 12, align: 'center', numFmt: '0' },
            { header: 'Fecha', key: 'Fecha', width: 15, align: 'center', numFmt: 'DD/MM/YYYY' },
            { header: 'N° Factura', key: 'NFactura', width: 20, align: 'center', numFmt: '@' },
            { header: 'Total', key: 'Total', width: 16, align: 'right', numFmt: '#,##0.00' },
            { header: 'ID Proveedor', key: 'Id_proveedor', width: 14, align: 'center', numFmt: '0' },
            { header: 'Empresa', key: 'Nombre_Empresa', width: 30 },
            { header: 'Contacto', key: 'Nombre_Contacto', width: 25 },
        ];
        stats = [
            { label: 'Total Registros:', value: reportData.TotalRegistros, format: '0' },
            { label: 'Total Compras:', value: reportData.TotalCompras, format: '#,##0.00', variant: 'success' },
        ];
    }

    aplicarCabeceraInstitucional(workbook, worksheet, nombreReporte, columnas);

    // Agregar filas de datos
    if (reportData.data && Array.isArray(reportData.data)) {
        reportData.data.forEach((row: any) => {
            const excelRow: any = {};
            if (reportType === 'productos_stock') {
                excelRow.id = Number(row.id);
                excelRow.Nombre = row.Nombre;
                excelRow.Nombre_marca = row.Nombre_marca;
                excelRow.Nombre_categoria = row.Nombre_categoria;
                excelRow.Precio_venta = Number(row.Precio_venta);
                excelRow.Stock = Number(row.Stock);
                excelRow.Stock_min = Number(row.Stock_min);
                excelRow.Fecha_vencimiento = row.Fecha_vencimiento ? new Date(row.Fecha_vencimiento) : null;
            } else if (reportType === 'clientes_deuda') {
                excelRow.IdVenta = Number(row.IdVenta);
                excelRow.NCliente = row.NCliente ? String(row.NCliente) : '';
                excelRow.Nombre = row.Nombre;
                excelRow.Apellido = row.Apellido;
                excelRow.Telefono = row.Telefono ? String(row.Telefono) : '';
                excelRow.Saldo_Deuda = Number(row.Saldo_Deuda);
                excelRow.ProximaFechaPago = row.ProximaFechaPago ? new Date(row.ProximaFechaPago) : null;
            } else if (reportType === 'ventas_por_periodo') {
                excelRow.id = Number(row.id);
                excelRow.Fecha = row.Fecha ? new Date(row.Fecha) : null;
                excelRow.Cliente = row.Cliente;
                excelRow.NCliente = row.NCliente ? String(row.NCliente) : '';
                excelRow.Tipo_Pago = row.Tipo_Pago;
                excelRow.TotalOriginal = Number(row.TotalOriginal);
                excelRow.TotalDevuelto = Number(row.TotalDevuelto);
                excelRow.Total = Number(row.Total);
            } else if (reportType === 'compras_por_periodo') {
                excelRow.id = Number(row.id);
                excelRow.Fecha = row.Fecha ? new Date(row.Fecha) : null;
                excelRow.NFactura = row.NFactura ? String(row.NFactura) : '';
                excelRow.Total = Number(row.Total);
                excelRow.Id_proveedor = Number(row.Id_proveedor);
                excelRow.Nombre_Empresa = row.Nombre_Empresa;
                excelRow.Nombre_Contacto = row.Nombre_Contacto;
            }
            worksheet.addRow(excelRow);
        });
    }

    aplicarEstadisticasYEstilos(worksheet, columnas, reportData.data?.length ?? 0, stats, 'ESTADÍSTICAS');

    return await workbook.xlsx.writeBuffer();
};

export const generateSalidasInventarioExcelReport = async (
    reportData: any
): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Único';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Salidas Inventario');
    const nombreReporte = 'Reporte de Otras Salidas de Inventario';

    const columnas: ColumnaExcelConfig[] = [
        { header: 'Fecha', key: 'Fecha', width: 15, align: 'center', numFmt: 'DD/MM/YYYY' },
        { header: 'Producto', key: 'Nombre_Producto', width: 30 },
        { header: 'Motivo', key: 'Motivo', width: 25 },
        { header: 'Cantidad', key: 'Cantidad', width: 14, align: 'right', numFmt: '0' },
    ];

    aplicarCabeceraInstitucional(workbook, worksheet, nombreReporte, columnas);

    (reportData.data ?? []).forEach((row: any) => {
        worksheet.addRow({
            Fecha: row.Fecha ? new Date(row.Fecha) : null,
            Nombre_Producto: row.Nombre_Producto,
            Motivo: row.Motivo,
            Cantidad: Number(row.Cantidad),
        });
    });

    const stats: StatExcelItem[] = [
        { label: 'Total Registros:', value: reportData.TotalRegistros, format: '0' },
        { label: 'Unidades Salidas:', value: reportData.TotalUnidadesSalidas, format: '0', variant: 'warning' },
    ];

    aplicarEstadisticasYEstilos(worksheet, columnas, reportData.data?.length ?? 0, stats, 'ESTADÍSTICAS');

    return await workbook.xlsx.writeBuffer();
};

export const generateVentasServicioExcelReport = async (
    reportData: any
): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Único';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Ventas por Servicio');
    const nombreReporte = 'Reporte de Ventas por Servicio';

    const columnas: ColumnaExcelConfig[] = [
        { header: 'Servicio', key: 'Nombre_servicio', width: 35 },
        { header: 'Cantidad Realizada', key: 'CantidadTotal', width: 18, align: 'center', numFmt: '0' },
        { header: 'Descuento', key: 'TotalDescuento', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Total Facturado', key: 'TotalFacturado', width: 18, align: 'right', numFmt: '#,##0.00' },
    ];

    aplicarCabeceraInstitucional(workbook, worksheet, nombreReporte, columnas);

    (reportData.data ?? []).forEach((row: any) => {
        worksheet.addRow({
            Nombre_servicio: row.Nombre_servicio,
            CantidadTotal: Number(row.CantidadTotal),
            TotalDescuento: Number(row.TotalDescuento),
            TotalFacturado: Number(row.TotalFacturado),
        });
    });

    const stats: StatExcelItem[] = [
        { label: 'Servicios Distintos:', value: reportData.TotalRegistros, format: '0' },
        { label: 'Total Facturado:', value: reportData.TotalFacturadoServicios, format: '#,##0.00', variant: 'success' },
    ];

    aplicarEstadisticasYEstilos(worksheet, columnas, reportData.data?.length ?? 0, stats, 'ESTADÍSTICAS');

    return await workbook.xlsx.writeBuffer();
};

export const generateVentasProductoExcelReport = async (
    reportData: any
): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Único';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Ventas por Producto');
    const nombreReporte = 'Reporte de Ventas por Producto';

    const columnas: ColumnaExcelConfig[] = [
        { header: 'Producto', key: 'Nombre_producto', width: 35 },
        { header: 'Cantidad Vendida', key: 'CantidadTotal', width: 18, align: 'center', numFmt: '0' },
        { header: 'Descuento', key: 'TotalDescuento', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Total Facturado', key: 'TotalFacturado', width: 18, align: 'right', numFmt: '#,##0.00' },
    ];

    aplicarCabeceraInstitucional(workbook, worksheet, nombreReporte, columnas);

    (reportData.data ?? []).forEach((row: any) => {
        worksheet.addRow({
            Nombre_producto: row.Nombre_producto,
            CantidadTotal: Number(row.CantidadTotal),
            TotalDescuento: Number(row.TotalDescuento),
            TotalFacturado: Number(row.TotalFacturado),
        });
    });

    const stats: StatExcelItem[] = [
        { label: 'Productos Distintos:', value: reportData.TotalRegistros, format: '0' },
        { label: 'Total Facturado:', value: reportData.TotalFacturadoProductos, format: '#,##0.00', variant: 'success' },
    ];

    aplicarEstadisticasYEstilos(worksheet, columnas, reportData.data?.length ?? 0, stats, 'ESTADÍSTICAS');

    return await workbook.xlsx.writeBuffer();
};

export const generateInventarioExcelReport = async (
    reportData: any
): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Único';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Inventario General');
    const nombreReporte = 'Reporte de Inventario General';

    const columnas: ColumnaExcelConfig[] = [
        { header: 'Producto', key: 'Nombre', width: 35 },
        { header: 'Marca', key: 'Nombre_marca', width: 20 },
        { header: 'Categoría', key: 'Nombre_categoria', width: 20 },
        { header: 'Precio Venta', key: 'Precio_venta', width: 16, align: 'right', numFmt: '#,##0.00' },
        { header: 'Stock', key: 'Stock', width: 12, align: 'center', numFmt: '0' },
    ];

    aplicarCabeceraInstitucional(workbook, worksheet, nombreReporte, columnas);

    (reportData.data ?? []).forEach((row: any) => {
        const nuevaFila = worksheet.addRow({
            Nombre: row.Nombre,
            Nombre_marca: row.Nombre_marca,
            Nombre_categoria: row.Nombre_categoria,
            Precio_venta: Number(row.Precio_venta),
            Stock: Number(row.Stock),
        });

        // Resaltar en rojo el stock crítico
        if (Number(row.Stock) < Number(row.Stock_min)) {
            const cellStock = nuevaFila.getCell(5);
            cellStock.font = { name: 'Calibri', bold: true, color: { argb: 'FFDC2626' } };
            cellStock.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
        }
    });

    const critico = Number(reportData.TotalStockCritico ?? 0);
    const stats: StatExcelItem[] = [
        { label: 'Total Productos:', value: reportData.TotalRegistros, format: '0' },
        { label: 'Stock Total:', value: reportData.TotalStock, format: '0' },
        { label: 'Stock Crítico:', value: reportData.TotalStockCritico, format: '0', variant: critico > 0 ? 'danger' : 'normal' },
    ];

    aplicarEstadisticasYEstilos(worksheet, columnas, reportData.data?.length ?? 0, stats, 'ESTADÍSTICAS');

    return await workbook.xlsx.writeBuffer();
};

export const generateDevolucionesExcelReport = async (
    reportData: any
): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Único';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Devoluciones');
    const nombreReporte = 'Reporte de Devoluciones';

    const columnas: ColumnaExcelConfig[] = [
        { header: 'Fecha', key: 'Fecha', width: 15, align: 'center', numFmt: 'DD/MM/YYYY' },
        { header: 'N° Factura', key: 'NFactura', width: 14, align: 'center', numFmt: '0' },
        { header: 'Cliente', key: 'Cliente', width: 30 },
        { header: 'Cant. Productos', key: 'CantidadProductos', width: 16, align: 'center', numFmt: '0' },
        { header: 'Total Devuelto', key: 'TotalDevuelto', width: 18, align: 'right', numFmt: '#,##0.00' },
    ];

    aplicarCabeceraInstitucional(workbook, worksheet, nombreReporte, columnas);

    (reportData.data ?? []).forEach((row: any) => {
        worksheet.addRow({
            Fecha: row.Fecha ? new Date(row.Fecha) : null,
            NFactura: Number(row.NFactura),
            Cliente: row.Cliente,
            CantidadProductos: Number(row.CantidadProductos),
            TotalDevuelto: Number(row.TotalDevuelto),
        });
    });

    const stats: StatExcelItem[] = [
        { label: 'Total Devoluciones:', value: reportData.TotalRegistros, format: '0' },
        { label: 'Productos Devueltos:', value: reportData.TotalProductosDevueltos, format: '0' },
        { label: 'Total Devuelto:', value: reportData.TotalDevuelto, format: '#,##0.00', variant: 'danger' },
    ];

    aplicarEstadisticasYEstilos(worksheet, columnas, reportData.data?.length ?? 0, stats, 'ESTADÍSTICAS');

    return await workbook.xlsx.writeBuffer();
};

export const generateArqueoPeriodoExcelReport = async (reportData: any): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Único';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Arqueo de Caja');
    const nombreReporte = 'Reporte de Arqueo de Caja por Período';

    const columnas: ColumnaExcelConfig[] = [
        { header: 'ID Sesión', key: 'id_sesion', width: 12, align: 'center', numFmt: '0' },
        { header: 'Cajero / Usuario', key: 'usuario_nombre', width: 22 },
        { header: 'Fecha Apertura', key: 'fecha_apertura', width: 20, align: 'center', numFmt: 'DD/MM/YYYY HH:mm' },
        { header: 'Fecha Cierre', key: 'fecha_cierre', width: 20, align: 'center', numFmt: 'DD/MM/YYYY HH:mm' },
        { header: 'Monto Apertura (C$)', key: 'total_apertura_cordobas', width: 20, align: 'right', numFmt: '#,##0.00' },
        { header: 'Ingresos Sistema', key: 'total_ingresos_sistema', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Egresos Sistema', key: 'total_egresos_sistema', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Efectivo Contado', key: 'total_efectivo_contado', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Transferencias', key: 'total_tarjeta_transferencia', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Diferencia', key: 'diferencia', width: 16, align: 'right', numFmt: '#,##0.00' },
        { header: 'Estado', key: 'estado', width: 14, align: 'center' },
        { header: 'Observaciones', key: 'observaciones', width: 30 },
    ];

    aplicarCabeceraInstitucional(workbook, worksheet, nombreReporte, columnas);

    (reportData.data ?? []).forEach((row: any) => {
        const rowAgregada = worksheet.addRow({
            id_sesion: Number(row.id_sesion),
            usuario_nombre: row.usuario_nombre,
            fecha_apertura: row.fecha_apertura ? new Date(row.fecha_apertura) : null,
            fecha_cierre: row.fecha_cierre ? new Date(row.fecha_cierre) : null,
            total_apertura_cordobas: Number(row.total_apertura_cordobas ?? row.monto_apertura_cordobas ?? 0),
            total_ingresos_sistema: Number(row.total_ingresos_sistema ?? 0),
            total_egresos_sistema: Number(row.total_egresos_sistema ?? 0),
            total_efectivo_contado: Number(row.total_efectivo_contado ?? 0),
            total_tarjeta_transferencia: Number(row.total_tarjeta_transferencia ?? 0),
            diferencia: Number(row.diferencia ?? 0),
            estado: row.estado,
            observaciones: row.observaciones || ''
        });

        // Colorear celda de diferencia
        const diffVal = Number(row.diferencia ?? 0);
        const diffCell = rowAgregada.getCell(10);
        if (diffVal < 0) {
            diffCell.font = { name: 'Calibri', color: { argb: 'FFDC2626' }, bold: true };
            diffCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
        } else if (diffVal > 0) {
            diffCell.font = { name: 'Calibri', color: { argb: 'FF16A34A' }, bold: true };
            diffCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
        }
    });

    const diffNeta = Number(reportData.TotalDiferencia ?? 0);
    const stats: StatExcelItem[] = [
        { label: 'Total Sesiones/Arqueos:', value: reportData.TotalRegistros, format: '0' },
        { label: 'Total Apertura (C$):', value: reportData.TotalAperturaCordobas, format: '#,##0.00' },
        { label: 'Total Ingresos (C$):', value: reportData.TotalIngresos, format: '#,##0.00' },
        { label: 'Total Egresos (C$):', value: reportData.TotalEgresos, format: '#,##0.00' },
        { label: 'Total Efectivo Contado (C$):', value: reportData.TotalEfectivoContado, format: '#,##0.00' },
        { label: 'Total Transferencias (C$):', value: reportData.TotalTransferencias, format: '#,##0.00' },
        { label: 'Diferencia Neta (C$):', value: reportData.TotalDiferencia, format: '#,##0.00', variant: diffNeta < 0 ? 'danger' : (diffNeta > 0 ? 'success' : 'normal') },
        { label: 'Sobrantes Acumulados (C$):', value: reportData.TotalSobrantes, format: '#,##0.00', variant: 'success' },
        { label: 'Faltantes Acumulados (C$):', value: reportData.TotalFaltantes, format: '#,##0.00', variant: 'danger' },
    ];

    aplicarEstadisticasYEstilos(worksheet, columnas, reportData.data?.length ?? 0, stats, 'ESTADÍSTICAS DEL PERÍODO');

    return await workbook.xlsx.writeBuffer();
};

export const generateArqueoCajeroExcelReport = async (reportData: any, nombreCajero?: string): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Único';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Arqueo por Cajero');
    const nombreReporte = nombreCajero 
        ? `Reporte de Arqueo de Caja - Cajero: ${nombreCajero}`
        : 'Reporte de Arqueo de Caja por Cajero';

    const columnas: ColumnaExcelConfig[] = [
        { header: 'ID Sesión', key: 'id_sesion', width: 12, align: 'center', numFmt: '0' },
        { header: 'Cajero / Usuario', key: 'usuario_nombre', width: 22 },
        { header: 'Fecha Apertura', key: 'fecha_apertura', width: 20, align: 'center', numFmt: 'DD/MM/YYYY HH:mm' },
        { header: 'Fecha Cierre', key: 'fecha_cierre', width: 20, align: 'center', numFmt: 'DD/MM/YYYY HH:mm' },
        { header: 'Monto Apertura (C$)', key: 'total_apertura_cordobas', width: 20, align: 'right', numFmt: '#,##0.00' },
        { header: 'Ingresos Sistema', key: 'total_ingresos_sistema', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Egresos Sistema', key: 'total_egresos_sistema', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Efectivo Contado', key: 'total_efectivo_contado', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Transferencias', key: 'total_tarjeta_transferencia', width: 18, align: 'right', numFmt: '#,##0.00' },
        { header: 'Diferencia', key: 'diferencia', width: 16, align: 'right', numFmt: '#,##0.00' },
        { header: 'Estado', key: 'estado', width: 14, align: 'center' },
        { header: 'Observaciones', key: 'observaciones', width: 30 },
    ];

    aplicarCabeceraInstitucional(workbook, worksheet, nombreReporte, columnas);

    (reportData.data ?? []).forEach((row: any) => {
        const rowAgregada = worksheet.addRow({
            id_sesion: Number(row.id_sesion),
            usuario_nombre: row.usuario_nombre,
            fecha_apertura: row.fecha_apertura ? new Date(row.fecha_apertura) : null,
            fecha_cierre: row.fecha_cierre ? new Date(row.fecha_cierre) : null,
            total_apertura_cordobas: Number(row.total_apertura_cordobas ?? row.monto_apertura_cordobas ?? 0),
            total_ingresos_sistema: Number(row.total_ingresos_sistema ?? 0),
            total_egresos_sistema: Number(row.total_egresos_sistema ?? 0),
            total_efectivo_contado: Number(row.total_efectivo_contado ?? 0),
            total_tarjeta_transferencia: Number(row.total_tarjeta_transferencia ?? 0),
            diferencia: Number(row.diferencia ?? 0),
            estado: row.estado,
            observaciones: row.observaciones || ''
        });

        const diffVal = Number(row.diferencia ?? 0);
        const diffCell = rowAgregada.getCell(10);
        if (diffVal < 0) {
            diffCell.font = { name: 'Calibri', color: { argb: 'FFDC2626' }, bold: true };
            diffCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
        } else if (diffVal > 0) {
            diffCell.font = { name: 'Calibri', color: { argb: 'FF16A34A' }, bold: true };
            diffCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
        }
    });

    const diffNetaCajero = Number(reportData.TotalDiferencia ?? 0);
    const stats: StatExcelItem[] = [
        { label: 'Total Sesiones/Arqueos:', value: reportData.TotalRegistros, format: '0' },
        { label: 'Total Apertura (C$):', value: reportData.TotalAperturaCordobas, format: '#,##0.00' },
        { label: 'Total Ingresos (C$):', value: reportData.TotalIngresos, format: '#,##0.00' },
        { label: 'Total Egresos (C$):', value: reportData.TotalEgresos, format: '#,##0.00' },
        { label: 'Total Efectivo Contado (C$):', value: reportData.TotalEfectivoContado, format: '#,##0.00' },
        { label: 'Total Transferencias (C$):', value: reportData.TotalTransferencias, format: '#,##0.00' },
        { label: 'Diferencia Neta (C$):', value: reportData.TotalDiferencia, format: '#,##0.00', variant: diffNetaCajero < 0 ? 'danger' : (diffNetaCajero > 0 ? 'success' : 'normal') },
        { label: 'Sobrantes Acumulados (C$):', value: reportData.TotalSobrantes, format: '#,##0.00', variant: 'success' },
        { label: 'Faltantes Acumulados (C$):', value: reportData.TotalFaltantes, format: '#,##0.00', variant: 'danger' },
    ];

    const tituloStatsTexto = nombreCajero 
        ? `ESTADÍSTICAS: ${nombreCajero.toUpperCase()}` 
        : 'ESTADÍSTICAS POR CAJERO';

    aplicarEstadisticasYEstilos(worksheet, columnas, reportData.data?.length ?? 0, stats, tituloStatsTexto);

    return await workbook.xlsx.writeBuffer();
};