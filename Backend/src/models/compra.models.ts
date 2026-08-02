export interface Compra{
    id: number;
    Id_proveedor:number;
    Fecha: Date;
    NFactura: string;
    Total: number;
}

export interface Detalle_Compra{
    id: number;
    Id_compra: number;
    Id_producto: number;
    Cantidad: number;
    Precio: number;
    Subtotal: number;
}