import { pool } from "../config/database.js";
import { Marca } from "../models/marca.model.js";

export const obtenerMarcas = async (): Promise<Marca[]> => {

    const [rows] = await pool.query("SELECT id, Nombre_marca FROM marcas");

    return rows as Marca[];
};