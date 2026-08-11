import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api/auth";

export type LoginResponse = {
  success: boolean;
  user?: any;
  token?: string;
  message?: string;
};

export const loginUsuario = async (usuario: string, password: string) => {
  const response = await axios.post<LoginResponse>(`${API}/login`, {
    usuario,
    password,
  });
  return response.data;
};

export const enviarRecuperacion = async (email: string) => {
  const response = await axios.post<LoginResponse>(`${API}/forgot-password`, {
    email,
  });
  return response.data;
};
