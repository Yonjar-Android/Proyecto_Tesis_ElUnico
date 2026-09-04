import type { PaginatedResponse } from "./PaginatedResponse";

export interface RespuestaReporteVentas extends PaginatedResponse<VentaReporte> {
  TotalRegistros: number;
  VentasContado: number;
  TotalVentas: number;
}

export interface VentaReporte {
  id: number;
  Fecha: string;
  Cliente: string;
  Estado: string | "Pendiente" | "Pagada" | "Devuelta";
  NCliente: number;
  Tipo_Pago: "Contado" | "Credito" | "Transferencia";
  Total: number;
}

