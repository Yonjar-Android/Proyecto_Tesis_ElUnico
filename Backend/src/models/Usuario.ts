import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

export async function login(usuario: string) {
    const [rows]: any = await pool.query(
        `SELECT u.*, r.Nombre_rol
         FROM usuarios u
         INNER JOIN roles r ON r.id = u.Id_rol
         WHERE u.Nombre_Usuario = ?`,
        [usuario]
    );

    return rows[0] ?? null;
}

export async function findUserByEmail(email: string) {
    const [rows]: any = await pool.query(
        `SELECT u.*, r.Nombre_rol
         FROM usuarios u
         INNER JOIN roles r ON r.id = u.Id_rol
         WHERE u.Correo = ?`,
        [email]
    );

    return rows[0] ?? null;
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
    `SELECT u.id, u.Nombre_Usuario, u.Correo, u.Activo, u.Id_rol, r.Nombre_rol
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.Id_rol
     ORDER BY u.Nombre_Usuario`
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
    "INSERT INTO usuarios (Nombre_Usuario, Correo, Contrasena, Id_rol, Activo) VALUES (?, ?, ?, ?, 1)",
    [nombreUsuario, correo, hashedPassword, idRol]
  );
  return result.insertId;
}

export async function obtenerRoles() {
  const [rows] = await pool.query("SELECT id, Nombre_rol FROM roles ORDER BY Nombre_rol");
  return rows;
}



export async function eliminarUsuarioModel(id: number) {
  const [result]: any = await pool.query(
    "DELETE FROM usuarios WHERE id = ?",
    [id]
  );
  return result.affectedRows;
}

// Activar / desactivar usuario en vez de borrarlo, si prefieres soft-delete
export async function cambiarEstadoUsuarioModel(id: number, activo: boolean) {
  const [result]: any = await pool.query(
    "UPDATE usuarios SET Activo = ? WHERE id = ?",
    [activo ? 1 : 0, id]
  );
  return result.affectedRows;
}
export async function actualizarUsuarioModel(
  id: number,
  nombreUsuario: string,
  correo: string,
  idRol: number
) {
  const [result]: any = await pool.query(
    "UPDATE usuarios SET Nombre_Usuario = ?, Correo = ?, Id_rol = ? WHERE id = ?",
    [nombreUsuario, correo, idRol, id]
  );
  return result.affectedRows;
}