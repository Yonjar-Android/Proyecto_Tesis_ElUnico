import type { PaginatedResponse } from "./PaginatedResponse";


export interface RespuestaReporteVentasServicios extends PaginatedResponse<DetalleVentaServicio>{
    TotalRegistros: number;
    TotalFacturadoServicios:number;
}

export interface DetalleVentaServicio {
  Id_servicio: number;
  Nombre_servicio: string;
  CantidadTotal: number;
  TotalDescuento: number;
  TotalFacturado: number;
}
