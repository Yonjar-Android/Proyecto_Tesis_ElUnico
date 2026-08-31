import bcrypt from "bcrypt";
import {
  obtenerUsuarios,
  crearUsuarioModel,
  actualizarUsuarioModel,
  eliminarUsuarioModel,
  findUserByEmail,
} from "../models/Usuario.js";
import { obtenerRoles as obtenerRolesModel } from "../models/Usuario.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function listarUsuarios() {
  return await obtenerUsuarios();
}

export async function crearUsuario(nombreUsuario: string, correo: string, password: string, idRol: number) {
  if (!nombreUsuario || nombreUsuario.trim() === "") {
    throw new Error("El nombre de usuario es obligatorio.");
  }
  if (!correo || !emailRegex.test(correo)) {
    throw new Error("Ingresa un correo válido.");
  }
  if (!password || password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }
  if (!idRol || isNaN(idRol)) {
    throw new Error("Debes seleccionar un rol.");
  }

  const existente: any = await findUserByEmail(correo);
  if (existente) {
    throw new Error("Ya existe un usuario registrado con ese correo.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return await crearUsuarioModel(nombreUsuario, correo, hashedPassword, idRol);
}

export async function listarRoles() {
  return await obtenerRolesModel();
}

export async function actualizarUsuario(id: number, nombreUsuario: string, correo: string, idRol: number) {
  if (!id || isNaN(id)) {
    throw new Error("Usuario inválido.");
  }
  if (!nombreUsuario || nombreUsuario.trim() === "") {
    throw new Error("El nombre de usuario es obligatorio.");
  }
  if (!correo || !emailRegex.test(correo)) {
    throw new Error("Ingresa un correo válido.");
  }
  if (!idRol || isNaN(idRol)) {
    throw new Error("Debes seleccionar un rol.");
  }

  const filas = await actualizarUsuarioModel(id, nombreUsuario, correo, idRol);
  if (filas === 0) {
    throw new Error("No se encontró el usuario a actualizar.");
  }
  return true;
}

export async function eliminarUsuario(id: number) {
  if (!id || isNaN(id)) {
    throw new Error("Usuario inválido.");
  }

  try {
    const filas = await eliminarUsuarioModel(id);
    if (filas === 0) {
      throw new Error("No se encontró el usuario a eliminar.");
    }
    return true;
  } catch (error: any) {
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
      throw new Error("No se puede eliminar: este usuario tiene ventas o registros asociados en el sistema.");
    }
    throw error;
  }
}