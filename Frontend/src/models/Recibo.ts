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
  devoluciones: DevolucionDTO[];
}

export interface DetalleDevolucionDTO {
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number; // neto, ya con descuento de la venta original aplicado
    subtotal: number;
}

export interface DevolucionDTO {
    idDevolucion: number;
    fecha: string;
    motivo: string;
    observacion?: string;
    estado: string;
    detalles: DetalleDevolucionDTO[];
}