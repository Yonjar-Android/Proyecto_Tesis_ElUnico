export interface DetalleVenta {
    Id_producto?: number | null;
    Id_servicio?: number | null;
    Cantidad: number;
    Precio_Venta: number;
    Descuento: number;
    Subtotal: number;
}