import { pool } from "../config/database.js";

export const obtenerReporteProductosStock = async (
    search: string = "",
    porcentaje: number = 30,
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;
    const factor = porcentaje / 100;

    let where = `
        WHERE p.Stock <= (p.Stock_min + (p.Stock_min * ?))
    `;

    const params: any[] = [factor];

    if (search.trim() !== "") {
        where += `
            AND (
                p.Nombre LIKE ?
                OR c.Nombre_categoria LIKE ?
                OR p.id LIKE ?
            )
        `;

        params.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        );
    }

    // Estadísticas generales
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalProductosEvaluados,
            SUM(
                CASE
                    WHEN Stock <= (Stock_min + (Stock_min * ?))
                    THEN 1
                    ELSE 0
                END
            ) AS TotalProductosEnRiesgo
        FROM productos
        `,
        [factor]
    );

    // Cantidad de registros del reporte (con búsqueda)
    const [countRows]: any = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM productos p
        INNER JOIN marcas m ON p.Id_marca = m.id
        INNER JOIN categorias c ON p.Id_categoria = c.id
        ${where}
        `,
        params
    );

    const total = countRows[0].total;

    // Datos del reporte
    const [rows]: any = await pool.query(
        `
        SELECT
            p.id,
            p.Nombre,
            p.Id_marca,
            m.Nombre_marca,
            p.Id_categoria,
            c.Nombre_categoria,
            p.Precio_venta,
            p.Stock,
            p.Stock_min,
            p.Fecha_vencimiento
        FROM productos p
        INNER JOIN marcas m ON p.Id_marca = m.id
        INNER JOIN categorias c ON p.Id_categoria = c.id
        ${where}
        ORDER BY
            p.Stock ASC,
            p.Nombre ASC
        LIMIT ? OFFSET ?
        `,
        [...params, perPage, offset]
    );

    return {
        data: rows,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage),
        TotalProductosEvaluados: estadisticas[0].TotalProductosEvaluados,
        TotalProductosEnRiesgo: estadisticas[0].TotalProductosEnRiesgo
    };
};