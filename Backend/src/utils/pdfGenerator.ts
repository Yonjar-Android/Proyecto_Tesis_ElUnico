// pdfGenerator.ts
import PDFDocument from 'pdfkit';

const NOMBRE_NEGOCIO = 'El Único';


const agregarEncabezado = (doc: PDFKit.PDFDocument, nombreReporte: string) => {
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000')
        .text(NOMBRE_NEGOCIO, { align: 'center' });

    doc.fontSize(13).font('Helvetica')
        .text(nombreReporte, { align: 'center' })
        .moveDown(0.3);

    doc.fontSize(8).fillColor('#666666')
        .text(`Generado: ${new Date().toLocaleString('es-NI')}`, { align: 'center' })
        .fillColor('#000000')
        .moveDown(1);
};

interface Columna {
    header: string;
    key: string;
    width: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
}

const dibujarHeaderTabla = (doc: PDFKit.PDFDocument, columnas: Columna[], x: number, y: number): number => {
    const alto = 20;
    doc.rect(x, y, columnas.reduce((s, c) => s + c.width, 0), alto).fill('#4F81BD');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
    let posX = x;
    columnas.forEach((col) => {
        doc.text(col.header, posX + 2, y + 6, { width: col.width - 4, align: col.align ?? 'left' });
        posX += col.width;
    });
    doc.fillColor('#000000').font('Helvetica');
    return y + alto;
};

const dibujarFila = (
    doc: any,
    columnas: Columna[],
    row: any,
    x: number,
    y: number,
    zebra: boolean,
    critico: boolean = false,
    celdasColor?: Record<string, { bg: string; text: string }>
): number => {
    const alto = 18;
    if (zebra) {
        doc.rect(x, y, columnas.reduce((s, c) => s + c.width, 0), alto).fill('#F2F2F2');
        doc.fillColor('#000000');
    }
    doc.fontSize(8).font('Helvetica');
    let posX = x;
    columnas.forEach((col) => {
        const valor = col.format ? col.format(row[col.key]) : String(row[col.key] ?? '');
        const colorCelda = celdasColor?.[col.key];

        if (critico && col.key === 'Stock') {
            doc.rect(posX, y, col.width, alto).fill('#FEF2F2');
            doc.fillColor('#DC2626').font('Helvetica-Bold');
        } else if (colorCelda) {
            doc.rect(posX + 4, y + 2, col.width - 8, alto - 4).fill(colorCelda.bg);
            doc.fillColor(colorCelda.text).font('Helvetica-Bold');
        } else {
            doc.fillColor('#000000').font('Helvetica');
        }

        doc.text(valor, posX + 2, y + 5, { width: col.width - 4, align: col.align ?? 'left' });
        posX += col.width;
    });
    return y + alto;
};

// --- Formato de números: 1,000.00 (coma miles, punto decimales) ---
const formatoMoneda = (v: any) =>
    `C$ ${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatoEntero = (v: any) =>
    Number(v ?? 0).toLocaleString('en-US');

const formatoFecha = (v: any) => v ? new Date(v).toLocaleDateString('es-NI') : '';

export const generateVentasPorPeriodoPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Ventas por Período';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Total Registros', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Ventas Contado', value: reportData.VentasContado, format: formatoMoneda },
                { label: 'Ventas Transferencia', value: reportData.VentasTransferencia, format: formatoMoneda },
                { label: 'Total Abonado', value: reportData.TotalAbonado, format: formatoMoneda },
                { label: 'Total Pendiente', value: reportData.TotalPendientePago, format: formatoMoneda },
                { label: 'Total Ventas', value: reportData.TotalVentas, format: formatoMoneda },
            ];

            const porFila = 3, anchoStat = 170, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada (igual a la interfaz) ---
            const columnas: Columna[] = [
                { header: 'N° Factura', key: 'id', width: 70, align: 'left' },
                { header: 'Fecha', key: 'Fecha', width: 80, format: formatoFecha },
                { header: 'Cliente', key: 'Cliente', width: 200 },
                { header: 'Estado', key: 'Estado', width: 100 },
                { header: 'Tipo de Pago', key: 'Tipo_Pago', width: 100 },
                { header: 'Monto', key: 'Total', width: 90, align: 'right', format: formatoMoneda },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateVentasProductoPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Ventas por Producto';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Productos Distintos', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Total Facturado', value: reportData.TotalFacturadoProductos, format: formatoMoneda },
            ];

            const porFila = 2, anchoStat = 200, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Producto', key: 'Nombre_producto', width: 250 },
                { header: 'Cantidad', key: 'CantidadTotal', width: 100, align: 'right', format: formatoEntero },
                { header: 'Descuento', key: 'TotalDescuento', width: 130, align: 'right', format: formatoMoneda },
                { header: 'Total Facturado', key: 'TotalFacturado', width: 130, align: 'right', format: formatoMoneda },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateVentasServicioPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Ventas por Servicio';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Servicios Distintos', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Total Facturado', value: reportData.TotalFacturadoServicios, format: formatoMoneda },
            ];

            const porFila = 2, anchoStat = 200, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Servicio', key: 'Nombre_servicio', width: 250 },
                { header: 'Cantidad', key: 'CantidadTotal', width: 100, align: 'right', format: formatoEntero },
                { header: 'Descuento', key: 'TotalDescuento', width: 130, align: 'right', format: formatoMoneda },
                { header: 'Total Facturado', key: 'TotalFacturado', width: 130, align: 'right', format: formatoMoneda },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateInventarioPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Inventario';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Total Productos', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Stock Total', value: reportData.TotalStock, format: formatoEntero },
                { label: 'Stock Crítico', value: reportData.TotalStockCritico, format: formatoEntero },
            ];

            const porFila = 3, anchoStat = 170, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Producto', key: 'Nombre', width: 220 },
                { header: 'Marca', key: 'Nombre_marca', width: 120 },
                { header: 'Categoría', key: 'Nombre_categoria', width: 120 },
                { header: 'Precio Venta', key: 'Precio_venta', width: 100, align: 'right', format: formatoMoneda },
                { header: 'Stock', key: 'Stock', width: 80, align: 'right', format: formatoEntero },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                const esCritico = Number(row.Stock) < Number(row.Stock_min);
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1, esCritico);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateSalidasInventarioPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Otras Salidas de Inventario';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Total Registros', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Unidades Salidas', value: reportData.TotalUnidadesSalidas, format: formatoEntero },
            ];

            const porFila = 2, anchoStat = 200, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Fecha', key: 'Fecha', width: 100, format: formatoFecha },
                { header: 'Producto', key: 'Nombre_Producto', width: 250 },
                { header: 'Motivo', key: 'Motivo', width: 200 },
                { header: 'Cantidad', key: 'Cantidad', width: 100, align: 'right', format: formatoEntero },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateDevolucionesPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Devoluciones';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Total Devoluciones', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Productos Devueltos', value: reportData.TotalProductosDevueltos, format: formatoEntero },
                { label: 'Total Devuelto', value: reportData.TotalDevuelto, format: formatoMoneda },
            ];

            const porFila = 3, anchoStat = 170, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Fecha', key: 'Fecha', width: 90, format: formatoFecha },
                { header: 'N° Factura', key: 'NFactura', width: 90, align: 'right', format: formatoEntero },
                { header: 'Cliente', key: 'Cliente', width: 220 },
                { header: 'Cant. Productos', key: 'CantidadProductos', width: 110, align: 'right', format: formatoEntero },
                { header: 'Total Devuelto', key: 'TotalDevuelto', width: 130, align: 'right', format: formatoMoneda },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateClientesDeudaPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Cuentas por Cobrar';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Total Facturas', value: reportData.TotalFacturasConDeuda, format: formatoEntero },
                { label: 'Saldo Pendiente', value: reportData.TotalSaldoPendiente, format: formatoMoneda },
            ];

            const porFila = 2, anchoStat = 200, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'N° Factura', key: 'IdVenta', width: 80, align: 'right', format: formatoEntero },
                { header: 'N° Cliente', key: 'NCliente', width: 90 },
                { header: 'Nombre', key: 'Nombre', width: 140 },
                { header: 'Apellido', key: 'Apellido', width: 140 },
                { header: 'Teléfono', key: 'Telefono', width: 90 },
                { header: 'Crédito Pendiente', key: 'Saldo_Deuda', width: 110, align: 'right', format: formatoMoneda },
                { header: 'Próx. Fecha Pago', key: 'ProximaFechaPago', width: 100, format: formatoFecha },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

type NivelStock = 'bajo' | 'limite' | 'moderado' | 'normal';

const calcularNivelStock = (stock: number, stockMin: number, porcentaje: number): NivelStock => {
    if (stock < stockMin) return 'bajo';
    if (stock === stockMin) return 'limite';
    const umbral = stockMin * (1 + porcentaje / 100);
    if (stock <= umbral) return 'moderado';
    return 'normal';
};

const coloresNivel: Record<NivelStock, { bg: string; text: string }> = {
    bajo:     { bg: '#FEF3C7', text: '#B45309' },
    limite:   { bg: '#FEF9C3', text: '#A16207' },
    moderado: { bg: '#DBEAFE', text: '#1D4ED8' },
    normal:   { bg: '#FFFFFF', text: '#000000' },
};

export const generateProductosStockPdfReport = async (
    reportData: any,
    porcentaje: number = 30
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Stock Próximo a Agotarse';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Total Evaluados', value: reportData.TotalProductosEvaluados, format: formatoEntero },
                { label: 'Total en Riesgo', value: reportData.TotalProductosEnRiesgo, format: formatoEntero },
            ];

            const porFila = 2, anchoStat = 200, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Producto', key: 'Nombre', width: 210 },
                { header: 'Código', key: 'id', width: 70, align: 'right', format: formatoEntero },
                { header: 'Categoría', key: 'Nombre_categoria', width: 130 },
                { header: 'Precio', key: 'Precio_venta', width: 100, align: 'right', format: formatoMoneda },
                { header: 'Stock Mín.', key: 'Stock_min', width: 80, align: 'right', format: formatoEntero },
                { header: 'Stock Actual', key: 'Stock', width: 90, align: 'right', format: formatoEntero },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                const nivel = calcularNivelStock(Number(row.Stock), Number(row.Stock_min), porcentaje);
                const celdasColor = nivel !== 'normal' ? { Stock: coloresNivel[nivel] } : undefined;
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1, false, celdasColor);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateComprasPorPeriodoPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Compras por Período';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Registros Totales', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Total Compras', value: reportData.TotalCompras, format: formatoMoneda },
            ];

            const porFila = 2, anchoStat = 200, altoStat = 34, gapStat = 6;
            const anchoBloqueStats = porFila * anchoStat;
            const xInicioStats = doc.page.margins.left + (anchoUtil - anchoBloqueStats) / 2;

            let statX = xInicioStats, statY = doc.y;

            stats.forEach((stat, i) => {
                if (i > 0 && i % porFila === 0) {
                    statX = xInicioStats;
                    statY += altoStat + gapStat;
                }
                doc.rect(statX, statY, anchoStat - gapStat, altoStat).fill('#E7E6E6');
                doc.fillColor('#333333').fontSize(8).font('Helvetica-Bold')
                    .text(stat.label, statX + 6, statY + 5, { width: anchoStat - 16 });
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
                    .text(stat.format(stat.value), statX + 6, statY + 18, { width: anchoStat - 16 });
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada (igual a la interfaz) ---
            const columnas: Columna[] = [
                { header: 'Fecha', key: 'Fecha', width: 100, format: formatoFecha },
                { header: 'Proveedor', key: 'Nombre_Empresa', width: 220 },
                { header: 'N° Factura', key: 'NFactura', width: 150 },
                { header: 'Total', key: 'Total', width: 120, align: 'right', format: formatoMoneda },
            ];

            const anchoTabla = columnas.reduce((s, c) => s + c.width, 0);
            const xInicio = doc.page.margins.left + (anchoUtil - anchoTabla) / 2;

            let y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
            const limiteInferior = doc.page.height - doc.page.margins.bottom;

            (reportData.data ?? []).forEach((row: any, i: number) => {
                if (y + 18 > limiteInferior) {
                    doc.addPage();
                    y = dibujarHeaderTabla(doc, columnas, xInicio, doc.y);
                }
                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};