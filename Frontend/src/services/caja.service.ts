
import axiosInstance from "./axiosInstance";

const API = "/caja"; ;

export type EgresoCajaInput = {
  idSesion: number;
  tipoEgreso: string;
  metodoPago: string;
  concepto: string;
  montoCordobas: number;   // antes: monto
  observaciones: string;
};

export const abrirCaja = async (
  montoAperturaCordobas: number,
  tasaCambio: number,
  observaciones: string
) => {
  const response = await axiosInstance.post(`${API}/apertura`, {
    montoAperturaCordobas,
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
    tasa_cambio: number;
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
