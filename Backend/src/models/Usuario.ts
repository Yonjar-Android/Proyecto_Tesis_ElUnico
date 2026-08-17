import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

export async function login(usuario: string) {
    const [rows] = await pool.query(
        "SELECT * FROM usuarios WHERE Nombre_Usuario = ?",
        [usuario]
    );

    return rows;
}

export async function findUserByEmail(email: string) {
    const [rows] = await pool.query(
        "SELECT * FROM usuarios WHERE Correo = ?",
        [email]
    );

    return rows;
}

export async function updateUserPassword(id: number, hashedPassword: string) {
    const [result] = await pool.query(
        "UPDATE usuarios SET Contrasena = ? WHERE id = ?",
        [hashedPassword, id]
    );

    return result;
}
export async function obtenerUsuarios() {
  const [rows] = await pool.query(
    "SELECT id, Nombre_Usuario, Correo FROM usuarios ORDER BY Nombre_Usuario"
  );
  return rows;
}

export async function crearUsuarioModel(
  nombreUsuario: string,
  correo: string,
  hashedPassword: string,
  idRol: number
) {
  const [result]: any = await pool.query(
    "INSERT INTO usuarios (Nombre_Usuario, Correo, Contrasena, Id_rol) VALUES (?, ?, ?, ?)",
    [nombreUsuario, correo, hashedPassword, idRol]
  );
  return result.insertId;
}
export async function obtenerRoles() {
  const [rows] = await pool.query("SELECT id, Nombre_rol FROM roles ORDER BY Nombre_rol");
  return rows;
}

export async function actualizarUsuarioModel(
  id: number,
  nombreUsuario: string,
  correo: string
) {
  const [result]: any = await pool.query(
    "UPDATE usuarios SET Nombre_Usuario = ?, Correo = ? WHERE id = ?",
    [nombreUsuario, correo, id]
  );
  return result.affectedRows;
}

export async function eliminarUsuarioModel(id: number) {
  const [result]: any = await pool.query(
    "DELETE FROM usuarios WHERE id = ?",
    [id]
  );
  return result.affectedRows;
}