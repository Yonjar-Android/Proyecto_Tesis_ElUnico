import { pool } from "../config/database.js"

export const buscarAbonos = async(
search: string = "",
    page: number = 1,
    perPage: number = 10
) => {
    const offset = (page - 1) * perPage;

    let where = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        where = `
            WHERE NCliente LIKE ?
               OR CONCAT(Nombre, ' ', Apellido) LIKE ?
        `;
        params.push(`%${search}%`, `%${search}%`);
    }

    // Total de registros
    const [countRows]: any = await pool.query(
        `SELECT COUNT(*) AS total
         FROM clientes
         ${where}`,
        params
    );

    const total = countRows[0].total;

    // Registros paginados
    const [rows] = await pool.query(
        `
        SELECT *
        FROM detalle_abonos
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

export const crearDetalleAbono = async (
    id_cliente: number,
    monto: number,
    notas: string
) => {
    const [rows]: any = await pool.query(
        "SELECT id FROM abonos WHERE Id_cliente = ?",
        [id_cliente]
    );

    if (rows.length === 0) {
        throw new Error("No existe una cuenta de abonos para este cliente.");
    }

    if(monto <= 0){
        throw new Error("El monto debe ser mayor a cero.");
    }

    const id_abono = rows[0].id;

    const [result]: any = await pool.query(
        "INSERT INTO detalle_abono (Id_abono, Fecha, Monto, Notas) VALUES (?, NOW(), ?, ?)",
        [id_abono, monto, notas]
    );

    return result;
};

export const actualizarDetalleAbono = async(
    id: number,
    monto: number,
    notas: string
) => {

    const [result]: any = await pool.query(
        `
        UPDATE detalle_abono
        SET Monto = ?,
        Notas = ?,
        WHERE id = ?`,
        [monto, notas, id]
    )

    return result;
}