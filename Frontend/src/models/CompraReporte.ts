import type { PaginatedResponse } from "./PaginatedResponse";

export interface CompraReporte {
    id: number;
    Fecha: string;
    NFactura: string;
    Total: number;
    Id_proveedor: number;
    Nombre_Empresa: string;
    Nombre_Contacto: string;
}

export interface RespuestaReporteCompras extends PaginatedResponse<CompraReporte> {
    TotalRegistros: number;
    TotalCompras: number;
}

export interface ArticuloCompra {
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
}

export interface DetalleCompraDTO {
    idCompra: number;
    fecha: string;
    nFactura: string;
    total: number;
    proveedorNombre: string;
    articulos: ArticuloCompra[];
}