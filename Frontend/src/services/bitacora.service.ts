import axiosInstance from "./axiosInstance";

export interface RegistroBitacoraDTO {
  id: number;
  id_usuario: number | null;
  usuario: string;
  rol: string;
  accion: string;
  modulo: string;
  detalles: string | null;
  ip: string | null;
  fecha_hora: string;
}

export interface RespuestaBitacora {
  success: boolean;
  data: RegistroBitacoraDTO[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export async function obtenerBitacora(
  search: string = "",
  modulo: string = "",
  fechaInicio: string = "",
  fechaFin: string = "",
  page: number = 1,
  perPage: number = 20
): Promise<RespuestaBitacora> {
  const response = await axiosInstance.get<RespuestaBitacora>("/bitacora", {
    params: {
      search,
      modulo,
      fechaInicio,
      fechaFin,
      page,
      perPage,
    },
  });
  return response.data;
}
