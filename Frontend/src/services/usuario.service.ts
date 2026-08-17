import axiosInstance from "./axiosInstance";

const API = "/usuarios";

export interface UsuarioInput {
  nombreUsuario: string;
  correo: string;
  password?: string;
  idRol?: number;
}

export const obtenerRoles = async () => {
  const response = await axiosInstance.get(`${API}/roles`);
  return response.data;
};

export const obtenerUsuarios = async () => {
  const response = await axiosInstance.get(API);
  return response.data;
};

export const crearUsuario = async (payload: UsuarioInput) => {
  const response = await axiosInstance.post(API, payload);
  return response.data;
};

export const actualizarUsuario = async (id: number, nombreUsuario: string, correo: string) => {
  const response = await axiosInstance.put(`${API}/${id}`, { nombreUsuario, correo });
  return response.data;
};

export const eliminarUsuario = async (id: number) => {
  const response = await axiosInstance.delete(`${API}/${id}`);
  return response.data;
};