export interface Venta {
    id: number,
    Id_cliente:number,
    Id_usuario: number,
    Fecha: Date,
    Tipo_Pago:string,
    Estado:string,
    Total: number,
}

export interface Detalle_Venta {
    id: number,
    Id_venta: number,
    Id_producto: number,
    Cantidad: number,
    Precio_Venta: number,
    Descuento: Number,
    Subtotal: number
}