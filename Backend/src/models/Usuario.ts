import { pool } from "../config/database.js";

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