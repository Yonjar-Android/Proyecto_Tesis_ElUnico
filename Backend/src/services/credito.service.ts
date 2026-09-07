import { pool } from "../config/database.js";

export const buscarCreditosPendientes = async (
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let whereBusqueda = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        whereBusqueda = `
            AND (
                cli.Nombre LIKE ?
                OR cli.Apellido LIKE ?
                OR cli.NCedula LIKE ?
                OR cf.Id_venta LIKE ?
            )
        `;

        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countRows]: any = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM credito_factura cf
        INNER JOIN ventas v ON v.id = cf.id_venta
        INNER JOIN clientes cli ON cli.id = v.Id_cliente
        WHERE cf.estado IN ('pendiente', 'pagada_parcial')
        ${whereBusqueda}
        `,
        params
    );

    const total = countRows[0].total;

    const [rows]: any = await pool.query(
        `
        SELECT
            cf.id,
            cf.id_venta,
            cf.total_deuda,
            cf.estado,
            cli.Nombre AS cliente_nombre,
            cli.Apellido AS cliente_apellido,
            cli.NCedula AS cliente_cedula,
            COALESCE(ab.total_abonado, 0) AS total_abonado
        FROM credito_factura cf
        INNER JOIN ventas v ON v.id = cf.id_venta
        INNER JOIN clientes cli ON cli.id = v.Id_cliente
        LEFT JOIN (
            SELECT id_credito_factura, SUM(monto_abonado) AS total_abonado
            FROM abono
            GROUP BY id_credito_factura
        ) ab ON ab.id_credito_factura = cf.id
        WHERE cf.estado IN ('pendiente', 'pagada_parcial')
        ${whereBusqueda}
        ORDER BY cf.creado_en DESC
        LIMIT ? OFFSET ?
        `,
        [...params, perPage, offset]
    );

    const data = rows.map((r: any) => ({
        id: r.id,
        id_venta: r.id_venta,
        numero_factura: r.id_venta,
        cliente_nombre: r.cliente_nombre,
        cliente_apellido: r.cliente_apellido,
        cliente_cedula: r.cliente_cedula,
        total_deuda: Number(r.total_deuda),
        saldo_pendiente: Number(r.total_deuda) - Number(r.total_abonado),
        estado: r.estado
    }));

    return {
        data,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage)
    };
};