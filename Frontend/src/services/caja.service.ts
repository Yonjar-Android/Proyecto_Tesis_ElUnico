import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api/caja";

export type EgresoCajaInput = {
  idSesion: number;
  tipoEgreso: string;
  metodoPago: string;
  concepto: string;
  monto: number;
  observaciones: string;
};

export const obtenerSesionActiva = async () => {
  const response = await axios.get(`${API}/sesion-activa`);
  return response.data;
};

export const abrirCaja = async (
  montoAperturaCordobas: number,
  tasaCambio: number,
  observaciones: string
) => {
  const response = await axios.post(`${API}/apertura`, {
    montoAperturaCordobas,
    tasaCambio,
    observaciones,
  });
  return response.data;
};

export const crearEgresoCaja = async (payload: EgresoCajaInput) => {
  const response = await axios.post(`${API}/egresos`, payload);
  return response.data;
};

export const eliminarEgreso = async (id: number) => {
  const response = await axios.delete(`${API}/egresos/${id}`);
  return response.data;
};

export const cerrarCaja = async (
  idSesion: number,
  totalEfectivoContado: number,
  totalTarjetaTransferencia: number,
  diferencia: number,
  observaciones: string
) => {
  const response = await axios.post(`${API}/cierre`, {
    idSesion,
    totalEfectivoContado,
    totalTarjetaTransferencia,
    diferencia,
    observaciones,
  });
  return response.data;
};

export const obtenerResumenCierre = async () => {
  const response = await axios.get(`${API}/resumen-cierre`);
  return response.data;
};
