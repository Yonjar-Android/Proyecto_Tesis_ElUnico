import type { PaginatedResponse } from "./PaginatedResponse";

export interface ArqueoCajaItem {
  id_sesion: number;
  id_usuario: number;
  usuario_nombre: string;
  fecha_apertura: string;
  fecha_cierre: string | null;
  monto_apertura_cordobas: number;
  monto_apertura_dolares: number;
  tasa_cambio: number;
  total_apertura_cordobas: number;
  total_ingresos_sistema: number;
  total_egresos_sistema: number;
  total_neto_sistema: number;
  total_efectivo_contado: number;
  total_tarjeta_transferencia: number;
  diferencia: number;
  observaciones: string | null;
  estado: string;
}

export interface RespuestaReporteArqueo extends PaginatedResponse<ArqueoCajaItem> {
  TotalRegistros: number;
  TotalAperturaCordobas: number;
  TotalIngresos: number;
  TotalEgresos: number;
  TotalEfectivoContado: number;
  TotalTransferencias: number;
  TotalDiferencia: number;
  TotalSobrantes: number;
  TotalFaltantes: number;
}

export interface EgresoItem {
  id_egreso: number;
  tipo_egreso: string;
  metodo_pago: string;
  concepto: string;
  monto_cordobas: number;
  observaciones: string | null;
  fecha_registro?: string;
}

export interface BilletesItem {
  id_desglose: number;
  moneda: string;
  denominacion: number;
  cantidad: number;
  subtotal_cordobas: number;
}

export interface DetalleArqueoDTO {
  sesion: ArqueoCajaItem;
  egresos: EgresoItem[];
  desgloseBilletes: BilletesItem[];
}
