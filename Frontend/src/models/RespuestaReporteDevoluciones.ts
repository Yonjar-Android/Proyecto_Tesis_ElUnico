import type { PaginatedResponse } from "./PaginatedResponse";

export interface RespuestaReporteDevoluciones extends PaginatedResponse<DevolucionReporte> {
    TotalRegistros: number;
    TotalDevuelto: number;
    TotalProductosDevueltos: number;
}

export interface DevolucionReporte {
  id: number;
  Fecha: string;
  Motivo: string;
  Observacion: string | null;
  NFactura: number;
  Cliente: string;
  NCliente: string;
  CantidadProductos: number;
  TotalDevuelto: number;
}