import { pool } from "../config/database.js";
import { Marca } from "../models/marca.model.js";

export const obtenerMarcas = async (): Promise<Marca[]> => {

    const [rows] = await pool.query("SELECT id, Nombre_marca FROM marcas");

    return rows as Marca[];
};

export const buscarMarcas = async (
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        where = `
            WHERE Nombre_marca LIKE ?
               OR CAST(id AS CHAR) LIKE ?
        `;

        params.push(`%${search}%`, `%${search}%`);
    }

    // Total de registros
    const [countRows]: any = await pool.query(
        `SELECT COUNT(*) AS total
         FROM marcas
         ${where}`,
        params
    );

    const total = countRows[0].total;

    // Registros paginados
    const [rows] = await pool.query(
        `
        SELECT id, Nombre_marca
        FROM marcas
        ${where}
        ORDER BY Nombre_marca
        LIMIT ? OFFSET ?
        `,
        [...params, perPage, offset]
    );

    return {
        data: rows,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage)
    };
};

export const crearMarca = async (nombre: string) => {

    if (!nombre.trim()) {
        throw new Error("El nombre de la marca no puede estar vacío.");
    }

    const [rows]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM marcas WHERE Nombre_marca = ?",
        [nombre]
    );

    if (rows[0].count > 0) {
        throw new Error("Ya existe una marca con ese nombre.");
    }

    const [result]: any = await pool.query(
        "INSERT INTO marcas (Nombre_marca) VALUES (?)",
        [nombre]
    );

    return result;
};

export const actualizarMarca = async (id: number, nombre: string) => {
    if (!nombre.trim()) {
        throw new Error("El nombre de la marca no puede estar vacío.");
    }

    const [rows]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM marcas WHERE Nombre_marca = ? AND id != ?",
        [nombre, id]
    );

    if (rows[0].count > 0) {
        throw new Error("Ya existe una marca con ese nombre.");
    }

    const [result]: any = await pool.query(
        "UPDATE marcas SET Nombre_marca = ? WHERE id = ?",
        [nombre, id]
    );

    return result;
};