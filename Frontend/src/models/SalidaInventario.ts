// Modelos alineados con las tablas de la base de datos

export interface Producto {
  id: number;
  Nombre: string;
  Id_marca: number;
  Id_categoria: number;
  Precio_venta: number;
  Stock: number;
  Stock_min: number;
  Fecha_vencimiento?: string | null;
}

export interface OtraSalidaInventario {
  id: number;
  Id_usuario: number;
  Fecha: string; // YYYY-MM-DD
  Tipo_Salida: string; // motivo de la salida (merma, uso interno, ajuste, etc.)
  Observacion?: string | null;
  Estado: string; // ej. "Activa" / "Anulada"
}

export interface DetalleOtraSalidaInventario {
  id: number;
  Id_salida: number;
  Id_producto: number;
  Cantidad: number;
}

/**
 * Fila "aplanada" que usa la tabla del reporte: el resultado de unir
 * Detalle_otras_salidas_inventario + Otras_salidas_inventario + Productos.
 * Cada fila representa un producto dentro de una salida.
 */
export interface SalidaInventarioReporteRow {
  id: number; // id del registro en Detalle_otras_salidas_inventario
  Id_salida: number;
  Fecha: string;
  Id_producto: number;
  Nombre_Producto: string;
  Cantidad: number;
  Motivo:string;
}

export interface RespuestaReporteSalidas {
  data: SalidaInventarioReporteRow[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  TotalRegistros: number;
  TotalUnidadesSalidas: number;
}