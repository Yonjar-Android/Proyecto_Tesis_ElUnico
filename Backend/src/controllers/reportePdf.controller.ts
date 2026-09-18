import { Request, Response } from 'express';
import { 
    generateReporteVentasPorPeriodoPdf,
    generateReporteVentasProductoPdf,
    generateReporteVentasServicioPdf,
    generateReporteInventarioPdf,
    generateReporteSalidasInventarioPdf
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