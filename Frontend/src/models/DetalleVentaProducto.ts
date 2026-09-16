import type { PaginatedResponse } from "./PaginatedResponse";

export interface RespuestaReporteVentasProductos extends PaginatedResponse<DetalleVentaProducto> {
    TotalRegistros: number;
    TotalFacturadoProductos: number;
}

export interface DetalleVentaProducto {
  Id_producto: number;
  Nombre_producto: string;
  CantidadTotal: number;
  TotalDescuento: number;
  TotalFacturado: number;
}