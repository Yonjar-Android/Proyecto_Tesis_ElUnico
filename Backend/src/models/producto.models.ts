export interface Producto {
    id: number;
    Nombre:string;
    Id_marca: number;
    Id_categoria: number;
    Precio_venta: number;
    Stock: number;
    Stock_min: number;
    Fecha_vencimiento: Date | null;
}