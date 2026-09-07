export interface FacturaCreditoPendiente {
  id: number;                 // id de credito_factura
  id_venta: number;
  numero_factura: string;     // ej. "F-000123", lo que uses para mostrar
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_cedula?: string;
  total_deuda: number;
  saldo_pendiente: number;    // total_deuda - SUM(abonos)
  estado: "pendiente" | "pagada_parcial";
}

export interface CuotaInfo {
  id: number;
  numero_cuota: number;
  monto_a_pagar: number;
  monto_pagado: number;       // calculado: SUM(abonos de esa cuota)
  saldo_cuota: number;        // monto_a_pagar - monto_pagado
  fecha_vencimiento: string;
  estado: "pendiente" | "pagada" | "pagada_parcial" | "vencida";
}

export interface AbonoHistorial {
  id: number;
  numero_cuota: number;
  monto_abonado: number;
  fecha_abono: string;
  metodo_pago: string;
  referencia?: string;
  estado_cuota_resultante: CuotaInfo["estado"];
}

export interface DistribucionCuota {
  id_cuota: number;
  numero_cuota: number;
  saldo_antes: number;
  monto_aplicado: number;
  saldo_despues: number;
  estado_resultante: CuotaInfo["estado"];
}