// controllers/reportes.controller.ts
import { Request, Response } from 'express';
import { 
    generateProductosStockExcel, 
    generateClientesDeudaExcel,
    generateReporteVentasPorPeriodoExcel,
    generateReporteComprasPorPeriodoExcel
} from '../services/reporteExcel.service.js';

export const descargarReporteProductosStock = async (req: Request, res: Response) => {
    try {
        const { 
            search = "", 
            porcentaje = 30 
        } = req.query;

        console.log('Generando reporte de productos stock...');
        
        // Generar el Excel
        const excelBuffer = await generateProductosStockExcel(
            search as string, 
            Number(porcentaje)
        );

        // Configurar headers para la descarga
        const filename = `reporte_productos_stock_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${filename}`
        );

        res.send(excelBuffer);
        
        console.log('Reporte de productos stock generado exitosamente');
    } catch (error) {
        console.error('Error generando Excel de productos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al generar el reporte de productos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteClientesDeuda = async (req: Request, res: Response) => {
    try {
        const { 
            search = "" 
        } = req.query;

        console.log('Generando reporte de clientes con deuda...');
        
        // Generar el Excel
        const excelBuffer = await generateClientesDeudaExcel(
            search as string
        );

        // Configurar headers para la descarga
        const filename = `reporte_clientes_deuda_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${filename}`
        );

        res.send(excelBuffer);
        
        console.log('Reporte de clientes con deuda generado exitosamente');
    } catch (error) {
        console.error('Error generando Excel de clientes:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al generar el reporte de clientes',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteVentasPorPeriodo = async (req: Request, res: Response) => {
    try {
        const { 
            search = "", 
            fechaInicio = "", 
            fechaFin = "",
            tipoPago = "",
            estado = ""
        } = req.query;

        console.log('Generando reporte de ventas por período...');
        console.log('Parámetros:', { search, fechaInicio, fechaFin, tipoPago });
        
        // Generar el Excel
        const excelBuffer = await generateReporteVentasPorPeriodoExcel(
            search as string,
            fechaInicio as string,
            fechaFin as string,
            tipoPago as string,
            estado as string
        );

        // Configurar headers para la descarga
        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_ventas_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.xlsx`;
        
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${filename}`
        );

        res.send(excelBuffer);
        
        console.log('Reporte de ventas por período generado exitosamente');
    } catch (error) {
        console.error('Error generando Excel de ventas:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al generar el reporte de ventas',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const descargarReporteComprasPorPeriodo = async (req: Request, res: Response) => {
    try {
        const { 
            search = "", 
            fechaInicio = "", 
            fechaFin = "",
            Id_proveedor = null,
        } = req.query;

        console.log('Generando reporte de compras por período...');
        
        // Generar el Excel
        const excelBuffer = await generateReporteComprasPorPeriodoExcel(
            search as string,
            fechaInicio as string,
            fechaFin as string,
            Id_proveedor as number | null
        );

        // Configurar headers para la descarga
        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `reporte_compras_${fechaInicio || 'inicio'}_a_${fechaFin || fechaActual}.xlsx`;
        
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${filename}`
        );

        res.send(excelBuffer);
        
        console.log('Reporte de compras por período generado exitosamente');
    } catch (error) {
        console.error('Error generando Excel de compras:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al generar el reporte de compras',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};