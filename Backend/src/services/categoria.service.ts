import { pool } from "../config/database.js";
import { Categoria } from "../models/categoria.model.js";

export const obtenerCategorias = async (): Promise<Categoria[]> => {
    const [rows] = await pool.query("SELECT id, Nombre_categoria FROM categorias");

    return rows as Categoria[];
}