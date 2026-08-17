import { pool } from "../config/database.js";

export const buscarServicios = async(
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {
    const offset = (page - 1) * perPage;

    let where = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        where = `
            WHERE Nombre_servicio LIKE ?
               OR CAST(id AS CHAR) LIKE ?
        `;
        params.push(`%${search}%`, `%${search}%`);
    }

    // Total de registros
    const [countRows]: any = await pool.query(
        `SELECT COUNT(*) AS total
         FROM servicios
         ${where}`,
        params
    );

    const total = countRows[0].total;

    // Registros paginados
    const [rows] = await pool.query(
        `
        SELECT *
        FROM servicios
        ${where}
        ORDER BY Nombre_servicio
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

export const crearServicio = async(
    nombre:string,
    descripcion:string,
    precio:number
) => {
    if(!nombre.trim()){
        throw new Error("El nombre del servicio no estar vacío.");
    }

    const [rowsNombre]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM servicios WHERE Nombre_servicio = ?",
        [nombre]
    );

    if (rowsNombre[0].count > 0) {
        throw new Error("Ya existe un servicio con ese nombre.");
    }

    if (isNaN(precio) || precio <= 0) {
        throw new Error("Ingrese un precio válido.");
    }

    const [result]: any = await pool.query(
        `
        INSERT INTO servicios
        (
            Nombre_servicio,
            Descripcion,
            Precio
        )
        VALUES (?,?,?)
        `,
        [
            nombre,
            descripcion,
            precio
        ]
    );

    return result;
}

export const actualizarServicio = async(
    id: number,
    nombre:string,
    descripcion:string,
    precio:number
) => {
    if (!nombre.trim()) {
        throw new Error("El nombre del servicio no puede estar vacío.");
    }

    const [rowsNombre]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM servicios WHERE Nombre_servicio = ? AND id != ?",
        [nombre, id]
    );

    if (rowsNombre[0].count > 0) {
        throw new Error("Ya existe un servicio con ese nombre.");
    }

    if (isNaN(precio) || precio <= 0) {
        throw new Error("Ingrese un precio de venta válido.");
    }

    const [result]: any = await pool.query(
        `
        UPDATE servicios
        SET Nombre_servicio = ?,
            Descripcion = ?,
            Precio = ?
        WHERE id = ?
        `,
        [
            nombre,
            descripcion,
            precio,
            id
        ]
    );

    return result;
}

