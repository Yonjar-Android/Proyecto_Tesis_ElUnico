import axiosInstance from "./axiosInstance";


export type LoginResponse = {
  success: boolean;
  user?: any;
  token?: string;
  message?: string;
};

export const loginUsuario = async (usuario: string, password: string) => {
  const response = await axiosInstance.post("/auth/login", { usuario, password });
  return response.data;
};

export const enviarRecuperacion = async (email: string) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};
