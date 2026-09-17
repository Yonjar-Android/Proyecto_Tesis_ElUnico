import { obtenerReporteVentas } from "./reporte.service.js";
import { generateVentasPorPeriodoPdfReport } from "../utils/pdfGenerator.js";

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