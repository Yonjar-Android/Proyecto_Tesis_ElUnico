import { login } from "../models/Usuario.js";

export async function loginService(
  usuario: string,
  password: string
) {
  const rows: any = await login(usuario);

  if (rows.length === 0) {
    return null;
  }

  if (rows[0].Contraseña !== password) {
    return null;
  }

  return rows[0];
}