export interface ArticuloRecibo {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  tipoDescuento: "porcentaje" | "fijo";
  descuento: number; // descuento individual guardado en el detalle_factura
}

export interface DatosRecibo {
  ticketNumero: string | number;
  cajero: string;
  fecha: string;
  hora: string;
  tipoPago: string;
  clienteNombre: string;
  clienteCedula?: string; // si el cliente no tiene cédula registrada, no se muestra la fila
  articulos: ArticuloRecibo[];
}
