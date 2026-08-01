export interface ProductoListado {
    id: number;
    Nombre: string;

    Id_marca: number;
    Nombre_marca: string;

    Id_categoria: number;
    Nombre_categoria: string;

    Precio_venta: number;
    Stock: number;
    Stock_min: number;

    Fecha_vencimiento: Date | null;
}