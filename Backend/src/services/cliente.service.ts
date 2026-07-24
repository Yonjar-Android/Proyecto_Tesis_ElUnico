import { pool } from "../config/database.js";

export const buscarClientes = async (
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {
    const offset = (page - 1) * perPage;

    let where = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        where = `
            WHERE Nombre LIKE ?
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
        SELECT *
        FROM clientes
        ${where}
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

export const crearCliente = async (
    nombre:string, apellido: string, telefono: string,
    direccion:string, credito: number, Ncliente:number
) => {
    const [result]: any = await pool.query(
        "INSERT INTO clientes (Nombre, Apellido, Telefono, Direccion, Credito, NCliente) VALUES (?,?,?,?,?,?)",
        [nombre, apellido, telefono, direccion, credito, Ncliente]
    );

    return result;
}

export const actualizarCliente = async (
    id:number, nombre:string, apellido: string, telefono: string,
    direccion:string, credito: number, Ncliente:number
) => {
    const [result]: any = await pool.query(
        "UPDATE clientes (Nombre, Apellido, Telefono, Direccion, Credito, NCliente) VALUES (?,?,?,?,?,?)",
        [nombre, apellido, telefono, direccion, credito, Ncliente]
    );

    return result;
}