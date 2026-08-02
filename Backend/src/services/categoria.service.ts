import { pool } from "../config/database.js";
import { Categoria } from "../models/categoria.model.js";

export const obtenerCategorias = async (): Promise<Categoria[]> => {
    const [rows] = await pool.query("SELECT id, Nombre_categoria FROM categorias");

    return rows as Categoria[];
}

export const buscarCategorias = async (
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {
    const offset = (page - 1) * perPage;

    let where = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        where = `
            WHERE Nombre_categoria LIKE ?
               OR CAST(id AS CHAR) LIKE ?
        `;
        params.push(`%${search}%`, `%${search}%`);
    }

    // Total de registros
    const [countRows]: any = await pool.query(
        `SELECT COUNT(*) AS total
         FROM categorias
         ${where}`,
        params
    );

    const total = countRows[0].total;

    // Registros paginados
    const [rows] = await pool.query(
        `
        SELECT id, Nombre_categoria
        FROM categorias
        ${where}
        ORDER BY Nombre_categoria
        LIMIT ? OFFSET ?
        `,
        [...params, perPage, offset]
    );

    return{
        data: rows,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage)
    };
}

export const crearCategoria = async (nombre: string) => {
    if (!nombre.trim()) {
        throw new Error("El nombre de la categoría no puede estar vacío.");
    }

    const [rows]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM categorias WHERE Nombre_categoria = ?",
        [nombre]
    );

     if (rows[0].count > 0) {
        throw new Error("Ya existe una categoría con ese nombre.");
    }

    const [result]: any = await pool.query(
        "INSERT INTO categorias (Nombre_categoria) VALUES (?)",
        [nombre]
    );

    return result;
}

export const actualizarCategoria = async (id: number, nombre:string) => {
    if(!nombre.trim()){
        throw new Error("El nombre de la categoría no puede estar vacío.");
    }

    const [rows]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM categorias WHERE Nombre_categoria = ? AND id != ?",
        [nombre, id]
    );

    if (rows[0].count > 0) {
        throw new Error("Ya existe una categoría con ese nombre.");
    }

    const [result]: any = await pool.query(
        "UPDATE categorias SET Nombre_categoria = ? WHERE id = ?",
        [nombre, id]
    );

    return result;
}

