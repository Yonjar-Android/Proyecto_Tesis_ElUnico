import { pool } from "../config/database.js";

export async function login(usuario: string) {
    const [rows] = await pool.query(
        "SELECT * FROM usuarios WHERE Nombre_Usuario = ?",
        [usuario]
    );

    return rows;
}