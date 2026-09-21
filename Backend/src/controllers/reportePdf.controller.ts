import { Request, Response } from 'express';
import { 
    generateReporteVentasPorPeriodoPdf,
    generateReporteVentasProductoPdf,
    generateReporteVentasServicioPdf,
    generateReporteInventarioPdf,
    generateReporteSalidasInventarioPdf,
    generateReporteDevolucionesPdf,
    generateReporteClientesDeudaPdf,
    generateReporteProductosStockPdf,
    generateReporteComprasPorPeriodoPdf,
    generateReporteArqueoPeriodoPdf,
    generateReporteArqueoCajeroPdf
 } from "../services/reportePdf.service.js";

export const descargarReporteVentasPorPeriodoPdf = async (req: Request, res: Response) => {
    try {
        const { search = "", fechaInicio = "", fechaFin = "", tipoPago = "", estado = "" } = req.query;

        const pdfBuffer = await generateReporteVentasPorPeriodoPdf(
            search as string, fechaInicio as string, fechaFin as string,
            tipoPago as string, estado as string
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_ventas_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de ventas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de ventas en PDF',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteVentasProductoPdf = async (req: Request, res: Response) => {
    try {
        const { search = "", fechaInicio = "", fechaFin = "" } = req.query;

        const pdfBuffer = await generateReporteVentasProductoPdf(
            search as string, fechaInicio as string, fechaFin as string
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_ventas_producto_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de ventas por producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de ventas por producto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteVentasServicioPdf = async (req: Request, res: Response) => {
    try {
        const { search = "", fechaInicio = "", fechaFin = "" } = req.query;

        const pdfBuffer = await generateReporteVentasServicioPdf(
            search as string, fechaInicio as string, fechaFin as string
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_ventas_servicio_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de ventas por servicio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de ventas por servicio',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteInventarioPdf = async (req: Request, res: Response) => {
    try {
        const {
            search = "",
            Id_categoria = null,
            Id_marca = null
        } = req.query;

        const pdfBuffer = await generateReporteInventarioPdf(
            search as string,
            Id_categoria ? Number(Id_categoria) : null,
            Id_marca ? Number(Id_marca) : null
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_inventario_${fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de inventario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de inventario',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteSalidasInventarioPdf = async (req: Request, res: Response) => {
    try {
        const { search = "", fechaInicio = "", fechaFin = "" } = req.query;

        const pdfBuffer = await generateReporteSalidasInventarioPdf(
            search as string, fechaInicio as string, fechaFin as string
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_salidas_inventario_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de salidas de inventario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de salidas de inventario',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteDevolucionesPdf = async (req: Request, res: Response) => {
    try {
        const { search = "", fechaInicio = "", fechaFin = "" } = req.query;

        const pdfBuffer = await generateReporteDevolucionesPdf(
            search as string, fechaInicio as string, fechaFin as string
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_devoluciones_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de devoluciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de devoluciones',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteClientesDeudaPdf = async (req: Request, res: Response) => {
    try {
        const { search = "" } = req.query;

        const pdfBuffer = await generateReporteClientesDeudaPdf(search as string);

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_cuentas_por_cobrar_${fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de cuentas por cobrar:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de cuentas por cobrar',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteProductosStockPdf = async (req: Request, res: Response) => {
    try {
        const { search = "", porcentaje = 30 } = req.query;

        const pdfBuffer = await generateReporteProductosStockPdf(search as string, Number(porcentaje));

        const filename = `reporte_productos_stock_${new Date().toISOString().split('T')[0]}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de productos stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de productos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteComprasPorPeriodoPdf = async (req: Request, res: Response) => {
    try {
        const {
            search = "",
            fechaInicio = "",
            fechaFin = "",
            Id_proveedor = null,
        } = req.query;

        const pdfBuffer = await generateReporteComprasPorPeriodoPdf(
            search as string,
            fechaInicio as string,
            fechaFin as string,
            Id_proveedor ? Number(Id_proveedor) : null
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_compras_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de compras:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de compras',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteArqueoPeriodoPdf = async (req: Request, res: Response) => {
    try {
        const { search = "", fechaInicio = "", fechaFin = "", estado = "" } = req.query;

        const pdfBuffer = await generateReporteArqueoPeriodoPdf(
            search as string,
            fechaInicio as string,
            fechaFin as string,
            estado as string
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_arqueo_periodo_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de arqueo por periodo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de arqueo por período en PDF',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteArqueoCajeroPdf = async (req: Request, res: Response) => {
    try {
        const { search = "", fechaInicio = "", fechaFin = "", idUsuario = "", estado = "", nombreCajero = "" } = req.query;

        const pdfBuffer = await generateReporteArqueoCajeroPdf(
            search as string,
            fechaInicio as string,
            fechaFin as string,
            idUsuario ? Number(idUsuario) : null,
            estado as string,
            nombreCajero as string
        );

        const fechaActual = new Date().toISOString().split('T')[0];
        const sufijoCajero = nombreCajero ? `_${String(nombreCajero).replace(/\s+/g, '_')}` : '';
        const filename = `reporte_arqueo_cajero${sufijoCajero}_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generando PDF de arqueo por cajero:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de arqueo por cajero en PDF',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};