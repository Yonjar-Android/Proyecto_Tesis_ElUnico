
import axiosInstance from "./axiosInstance";

const API = "/caja"; ;

export type EgresoCajaInput = {
  idSesion: number;
  tipoEgreso: string;
  metodoPago: string;
  concepto: string;
  montoCordobas: number;   // antes: monto
  montoDolares: number;
  observaciones: string;
};

export const obtenerSesionActiva = async () => {
  const response = await axiosInstance.get(`${API}/sesion-activa`);
  return response.data;
};

export const abrirCaja = async (
  montoAperturaCordobas: number,
  montoAperturaDolares: number, // <-- NUEVO
  tasaCambio: number,
  observaciones: string
) => {
  const response = await axiosInstance.post(`${API}/apertura`, {
    montoAperturaCordobas,
    montoAperturaDolares, // <-- Se envía al backend
    tasaCambio,
    observaciones,
  });
  return response.data;
};
export interface SesionCajaActiva {
  sesionActiva?: boolean;
  sesion?: {
    id_sesion: number;
    fecha_apertura: string;
    monto_apertura_cordobas: number;
    monto_apertura_dolares?: number;
    tasa_cambio: number;
    total_ingresos_sistema?: number;
    total_tarjeta_transferencia?: number;
    monto_dolares?: number;
    estado: string;
  } | null;
}

export async function obtenerSesionCajaActiva(): Promise<SesionCajaActiva> {
  const { data } = await axiosInstance.get("/caja/sesion-activa");
  return data;
}
export const crearEgresoCaja = async (payload: EgresoCajaInput) => {
  const response = await axiosInstance.post(`${API}/egresos`, payload);
  return response.data;
};

export const eliminarEgreso = async (id: number) => {
  const response = await axiosInstance.delete(`${API}/egresos/${id}`);
  return response.data;
};

export const cerrarCaja = async (
  idSesion: number,
  totalEfectivoContado: number,
  totalTarjetaTransferencia: number,
  diferencia: number,
  observaciones: string
) => {
  const response = await axiosInstance.post(`${API}/cierre`, {
    idSesion,
    totalEfectivoContado,
    totalTarjetaTransferencia,
    diferencia,
    observaciones,
  });
  return response.data;
};

export const obtenerResumenCierre = async () => {
  const response = await axiosInstance.get(`${API}/resumen-cierre`);
  return response.data;
};
export const actualizarEgreso = async (id: number, payload: EgresoCajaInput) => {
  const response = await axiosInstance.put(`${API}/egresos/${id}`, payload);
  return response.data;
};

export interface SesionHistorial {
  id_sesion: number;
  id_usuario: number;
  usuario_nombre: string;
  fecha_apertura: string;
  fecha_cierre: string | null;
  monto_apertura_cordobas: number;
  monto_apertura_dolares: number;
  tasa_cambio: number;
  total_ingresos_sistema: number;
  total_egresos_sistema: number;
  total_neto_sistema: number;
  total_efectivo_contado: number;
  total_tarjeta_transferencia: number;
  diferencia: number;
  observaciones: string | null;
  estado: "Abierta" | "Cerrada";
}

export const obtenerHistorialCajas = async (): Promise<{ success: boolean; historial: SesionHistorial[] }> => {
  const response = await axiosInstance.get(`${API}/historial`);
  return response.data;
};
