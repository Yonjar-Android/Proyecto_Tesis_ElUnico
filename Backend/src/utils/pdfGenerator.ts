// pdfGenerator.ts
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Gestión y Caching del Logotipo Corporativo ---
let cachedLogoBuffer: Buffer | null = null;
const obtenerLogo = (): Buffer | null => {
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

// --- Encabezado Corporativo Oficial ---
const agregarEncabezado = (doc: PDFKit.PDFDocument, nombreReporte: string) => {
    const logo = obtenerLogo();
    const startX = doc.page.margins.left; // 40
    const startY = 25;
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    let textX = startX;
    if (logo) {
        try {
            doc.image(logo, startX, startY, { width: 46, height: 46 });
            textX = startX + 54;
        } catch (_) {
            textX = startX;
        }
    }

    // Nombre de la Empresa
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0F172A')
        .text('REPUESTOS EL ÚNICO', textX, startY + 2, { lineBreak: false });

    // Subtítulo institucional
    doc.fontSize(8).font('Helvetica').fillColor('#64748B')
        .text('Sistema de Control y Gestión de Negocio', textX, startY + 17, { lineBreak: false });

    // Título dinámico del reporte
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1E40AF')
        .text(nombreReporte, textX, startY + 29, { lineBreak: false });

    // Bloque de emisión a la derecha
    const metaWidth = 220;
    const metaX = doc.page.width - doc.page.margins.right - metaWidth;
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#475569')
        .text('FECHA DE EMISIÓN', metaX, startY + 3, { width: metaWidth, align: 'right' });

    doc.fontSize(8.5).font('Helvetica').fillColor('#0F172A')
        .text(new Date().toLocaleString('es-NI'), metaX, startY + 15, { width: metaWidth, align: 'right' });

    doc.fontSize(7.5).font('Helvetica').fillColor('#94A3B8')
        .text('Documento Oficial Interno', metaX, startY + 27, { width: metaWidth, align: 'right' });

    // Línea divisoria decorativa
    const dividerY = startY + 50;
    doc.strokeColor('#E2E8F0').lineWidth(1)
        .moveTo(startX, dividerY).lineTo(startX + usableWidth, dividerY).stroke();

    // Franja de acento azul marino/cobalto
    doc.rect(startX, dividerY - 1, 90, 2).fill('#1E40AF');

    // Restaurar cursor para el contenido subsiguiente
    doc.y = dividerY + 14;
    doc.x = startX;
};

interface Columna {
    header: string;
    key: string;
    width: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
}

// --- Encabezado de Tablas con Paleta Corporativa ---
const dibujarHeaderTabla = (doc: PDFKit.PDFDocument, columnas: Columna[], x: number, y: number): number => {
    const alto = 20;
    const anchoTotal = columnas.reduce((s, c) => s + c.width, 0);
    doc.rect(x, y, anchoTotal, alto).fill('#0F172A');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5);
    let posX = x;
    columnas.forEach((col) => {
        doc.text(col.header, posX + 4, y + 5.5, { width: col.width - 8, align: col.align ?? 'left' });
        posX += col.width;
    });
    doc.fillColor('#0F172A').font('Helvetica');
    return y + alto;
};

// --- Filas de Datos con Cebrado y Bordes Sutiles ---
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
    const anchoTotal = columnas.reduce((s, c) => s + c.width, 0);

    // Fondo cebrado alternado
    if (zebra) {
        doc.rect(x, y, anchoTotal, alto).fill('#F8FAFC');
    }

    // Línea divisoria inferior
    doc.strokeColor('#E2E8F0').lineWidth(0.5)
        .moveTo(x, y + alto).lineTo(x + anchoTotal, y + alto).stroke();

    doc.fontSize(8).font('Helvetica');
    let posX = x;
    columnas.forEach((col) => {
        const valor = col.format ? col.format(row[col.key]) : String(row[col.key] ?? '');
        const colorCelda = celdasColor?.[col.key];

        if (critico && col.key === 'Stock') {
            doc.rect(posX + 2, y + 1.5, col.width - 4, alto - 3).fill('#FEF2F2');
            doc.fillColor('#DC2626').font('Helvetica-Bold');
        } else if (colorCelda) {
            doc.rect(posX + 3, y + 1.5, col.width - 6, alto - 3).fill(colorCelda.bg);
            doc.fillColor(colorCelda.text).font('Helvetica-Bold');
        } else {
            doc.fillColor('#1E293B').font('Helvetica');
        }

        doc.text(valor, posX + 4, y + 5, { width: col.width - 8, align: col.align ?? 'left' });
        posX += col.width;
    });
    return y + alto;
};

// --- Tarjetas de Métricas Estadísticas (KPIs) Estilo Dashboard ---
const dibujarCajaStat = (
    doc: any,
    statX: number,
    statY: number,
    ancho: number,
    alto: number,
    label: string,
    valor: string,
    variant?: 'normal' | 'danger' | 'success' | 'warning'
) => {
    // Fondo de tarjeta y borde suave
    doc.roundedRect(statX, statY, ancho, alto, 3).fillAndStroke('#F8FAFC', '#E2E8F0');

    // Acento lateral izquierdo
    let accentColor = '#1E40AF';
    let valColor = '#0F172A';
    const lUpper = label.toUpperCase();
    if (variant === 'danger' || lUpper.includes('RIESGO') || lUpper.includes('FALTANTE') || lUpper.includes('DEUDA')) {
        accentColor = '#DC2626';
        valColor = '#DC2626';
    } else if (variant === 'success' || lUpper.includes('VENTAS') || lUpper.includes('SOBRANTE') || lUpper.includes('GANANCIA') || lUpper.includes('FACTURADO')) {
        accentColor = '#16A34A';
        valColor = '#16A34A';
    } else if (variant === 'warning' || lUpper.includes('PENDIENTE') || lUpper.includes('SALIDAS')) {
        accentColor = '#D97706';
        valColor = '#D97706';
    }

    doc.roundedRect(statX, statY, 3.5, alto, 1.5).fill(accentColor);

    // Etiqueta superior
    doc.fillColor('#64748B').fontSize(7).font('Helvetica-Bold')
        .text(lUpper, statX + 8, statY + 5, { width: ancho - 14, lineBreak: false });

    // Valor numérico formateado
    doc.fillColor(valColor).fontSize(10.5).font('Helvetica-Bold')
        .text(valor, statX + 8, statY + 17, { width: ancho - 14, lineBreak: false });
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
                { label: 'Registros Totales', value: reportData.TotalRegistros, format: formatoEntero },
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Producto', key: 'Nombre_producto', width: 250 },
                { header: 'Cantidad', key: 'CantidadTotal', width: 100, align: 'left', format: formatoEntero },
                { header: 'Descuento', key: 'TotalDescuento', width: 130, align: 'left', format: formatoMoneda },
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Servicio', key: 'Nombre_servicio', width: 250 },
                { header: 'Cantidad', key: 'CantidadTotal', width: 100, align: 'left', format: formatoEntero },
                { header: 'Descuento', key: 'TotalDescuento', width: 130, align: 'left', format: formatoMoneda },
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

            const nombreReporte = 'Reporte de Inventario General';
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Producto', key: 'Nombre', width: 220 },
                { header: 'Marca', key: 'Nombre_marca', width: 120, align: 'left' },
                { header: 'Categoría', key: 'Nombre_categoria', width: 120, align: 'left' },
                { header: 'Precio Venta', key: 'Precio_venta', width: 100, align: 'left', format: formatoMoneda },
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
                { label: 'Registros Totales', value: reportData.TotalRegistros, format: formatoEntero },
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Fecha', key: 'Fecha', width: 90, format: formatoFecha },
                { header: 'N° Factura', key: 'NFactura', width: 90, align: 'left', format: formatoEntero },
                { header: 'Cliente', key: 'Cliente', width: 220, align: 'left' },
                { header: 'Cant. Productos', key: 'CantidadProductos', width: 110, align: 'left', format: formatoEntero },
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'N° Factura', key: 'IdVenta', width: 80, align: 'left', format: formatoEntero },
                { header: 'N° Cliente', key: 'NCliente', width: 90 },
                { header: 'Nombre', key: 'Nombre', width: 140 },
                { header: 'Apellido', key: 'Apellido', width: 140 },
                { header: 'Teléfono', key: 'Telefono', width: 90 },
                { header: 'Crédito Pendiente', key: 'Saldo_Deuda', width: 110, align: 'left', format: formatoMoneda },
                { header: 'Próx. Fecha Pago', key: 'ProximaFechaPago', width: 100, align: 'right', format: formatoFecha },
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'Producto', key: 'Nombre', width: 210 },
                { header: 'Código', key: 'id', width: 70, align: 'left', format: formatoEntero },
                { header: 'Categoría', key: 'Nombre_categoria', width: 130 },
                { header: 'Precio', key: 'Precio_venta', width: 100, align: 'left', format: formatoMoneda },
                { header: 'Stock Mín.', key: 'Stock_min', width: 80, align: 'left', format: formatoEntero },
                { header: 'Stock Actual', key: 'Stock', width: 90, align: 'center', format: formatoEntero },
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
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

const formatoFechaHora = (v: any) => {
    if (!v) return '---';
    try {
        const d = new Date(v);
        if (isNaN(d.getTime())) return String(v);
        const fecha = d.toLocaleDateString('es-NI', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const hora = d.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' });
        return `${fecha} ${hora}`;
    } catch {
        return String(v);
    }
};

export const generateArqueoPeriodoPdfReport = async (reportData: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = 'Reporte de Arqueo de Caja por Período';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Total Sesiones', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Total Apertura', value: reportData.TotalAperturaCordobas, format: formatoMoneda },
                { label: 'Ingresos Sistema', value: reportData.TotalIngresos, format: formatoMoneda },
                { label: 'Egresos Sistema', value: reportData.TotalEgresos, format: formatoMoneda },
                { label: 'Efectivo Contado', value: reportData.TotalEfectivoContado, format: formatoMoneda },
                { label: 'Diferencia Neta', value: reportData.TotalDiferencia, format: formatoMoneda },
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'N°', key: 'id_sesion', width: 45, align: 'center', format: (v) => `#${v}` },
                { header: 'Cajero', key: 'usuario_nombre', width: 100 },
                { header: 'Apertura', key: 'fecha_apertura', width: 95, format: formatoFechaHora },
                { header: 'Cierre', key: 'fecha_cierre', width: 95, format: formatoFechaHora },
                { header: 'Monto Apert.', key: 'total_apertura_cordobas', width: 75, align: 'right', format: formatoMoneda },
                { header: 'Ingresos', key: 'total_ingresos_sistema', width: 75, align: 'right', format: formatoMoneda },
                { header: 'Egresos', key: 'total_egresos_sistema', width: 75, align: 'right', format: formatoMoneda },
                { header: 'Contado', key: 'total_efectivo_contado', width: 75, align: 'right', format: formatoMoneda },
                { header: 'Diferencia', key: 'diferencia', width: 70, align: 'right', format: formatoMoneda },
                { header: 'Estado', key: 'estado', width: 55, align: 'center' },
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

                const diff = Number(row.diferencia ?? 0);
                const celdasColor: Record<string, { bg: string; text: string }> = {};
                if (diff < 0) {
                    celdasColor['diferencia'] = { bg: '#FEF2F2', text: '#DC2626' };
                } else if (diff > 0) {
                    celdasColor['diferencia'] = { bg: '#DCFCE7', text: '#16A34A' };
                }

                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1, false, celdasColor);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateArqueoCajeroPdfReport = async (reportData: any, nombreCajero?: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const chunks: Buffer[] = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const nombreReporte = nombreCajero 
                ? `Reporte de Arqueo de Caja - Cajero: ${nombreCajero}`
                : 'Reporte de Arqueo de Caja por Cajero';
            doc.on('pageAdded', () => agregarEncabezado(doc, nombreReporte));
            agregarEncabezado(doc, nombreReporte);

            const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // --- Estadísticas centradas ---
            const stats = [
                { label: 'Total Sesiones', value: reportData.TotalRegistros, format: formatoEntero },
                { label: 'Total Apertura', value: reportData.TotalAperturaCordobas, format: formatoMoneda },
                { label: 'Ingresos Sistema', value: reportData.TotalIngresos, format: formatoMoneda },
                { label: 'Egresos Sistema', value: reportData.TotalEgresos, format: formatoMoneda },
                { label: 'Efectivo Contado', value: reportData.TotalEfectivoContado, format: formatoMoneda },
                { label: 'Diferencia Neta', value: reportData.TotalDiferencia, format: formatoMoneda },
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
                dibujarCajaStat(doc, statX, statY, anchoStat - gapStat, altoStat, stat.label, stat.format(stat.value));
                statX += anchoStat;
            });

            doc.y = statY + altoStat + 15;
            doc.x = doc.page.margins.left;

            // --- Tabla centrada ---
            const columnas: Columna[] = [
                { header: 'N°', key: 'id_sesion', width: 45, align: 'center', format: (v) => `#${v}` },
                { header: 'Cajero', key: 'usuario_nombre', width: 100 },
                { header: 'Apertura', key: 'fecha_apertura', width: 95, format: formatoFechaHora },
                { header: 'Cierre', key: 'fecha_cierre', width: 95, format: formatoFechaHora },
                { header: 'Monto Apert.', key: 'total_apertura_cordobas', width: 75, align: 'right', format: formatoMoneda },
                { header: 'Ingresos', key: 'total_ingresos_sistema', width: 75, align: 'right', format: formatoMoneda },
                { header: 'Egresos', key: 'total_egresos_sistema', width: 75, align: 'right', format: formatoMoneda },
                { header: 'Contado', key: 'total_efectivo_contado', width: 75, align: 'right', format: formatoMoneda },
                { header: 'Diferencia', key: 'diferencia', width: 70, align: 'right', format: formatoMoneda },
                { header: 'Estado', key: 'estado', width: 55, align: 'center' },
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

                const diff = Number(row.diferencia ?? 0);
                const celdasColor: Record<string, { bg: string; text: string }> = {};
                if (diff < 0) {
                    celdasColor['diferencia'] = { bg: '#FEF2F2', text: '#DC2626' };
                } else if (diff > 0) {
                    celdasColor['diferencia'] = { bg: '#DCFCE7', text: '#16A34A' };
                }

                y = dibujarFila(doc, columnas, row, xInicio, y, i % 2 === 1, false, celdasColor);
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};