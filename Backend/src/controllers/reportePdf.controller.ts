import { Request, Response } from 'express';
import { generateReporteVentasPorPeriodoPdf } from "../services/reportePdf.service.js";

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