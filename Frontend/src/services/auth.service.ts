import axios from "axios";
import axiosInstance from "./axiosInstance";


const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api/auth";

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
