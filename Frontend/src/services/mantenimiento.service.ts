import axiosInstance from "./axiosInstance";

const API = "/mantenimiento";

export interface RespaldoBD {
  id: number;
  nombre_archivo: string;
  fecha_respaldo: string;
  tamano_bytes: number;
  estado: "Exitoso" | "Fallido";
  mensaje_error: string | null;
}

export const listarRespaldos = async (): Promise<RespaldoBD[]> => {
  const { data } = await axiosInstance.get(`${API}/respaldos`);
  return data.respaldos;
};

export const crearRespaldo = async () => {
  const { data } = await axiosInstance.post(`${API}/respaldos`);
  return data;
};

export const descargarRespaldo = async (id: number, nombreArchivo: string) => {
  const response = await axiosInstance.get(`${API}/respaldos/${id}/descargar`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const eliminarRespaldo = async (id: number) => {
  const { data } = await axiosInstance.delete(`${API}/respaldos/${id}`);
  return data;
};

export const restaurarDesdeArchivo = async (archivo: File) => {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const { data } = await axiosInstance.post(`${API}/restaurar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const restaurarDesdeHistorial = async (idRespaldo: number) => {
  const { data } = await axiosInstance.post(`${API}/restaurar-historial`, { idRespaldo });
  return data;
};