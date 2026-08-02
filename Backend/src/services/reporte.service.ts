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

export const obtenerReporteClientesConDeuda = async (
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = `
        WHERE Saldo_Deuda > 0
    `;

    const params: any[] = [];

    if (search.trim() !== "") {
        where += `
            AND (
                NCliente LIKE ?
                OR CONCAT(Nombre, ' ', Apellido) LIKE ?
            )
        `;

        params.push(
            `%${search}%`,
            `%${search}%`
        );
    }

    // Estadísticas generales
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalClientesConDeuda,
            COALESCE(SUM(Saldo_Deuda), 0) AS TotalSaldoPendiente
        FROM clientes
        WHERE Saldo_Deuda > 0
        `
    );

    // Total de registros del reporte (aplicando búsqueda)
    const [countRows]: any = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM clientes
        ${where}
        `,
        params
    );

    const total = countRows[0].total;

    // Clientes con deuda
    const [rows]: any = await pool.query(
        `
        SELECT *
        FROM clientes
        ${where}
        ORDER BY Saldo_Deuda DESC, Nombre ASC
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
        TotalClientesConDeuda: estadisticas[0].TotalClientesConDeuda,
        TotalSaldoPendiente: estadisticas[0].TotalSaldoPendiente
    };
};

export const obtenerReporteVentas = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    tipoPago: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "WHERE 1=1";
    const params: any[] = [];

    // Buscar por cliente
    if (search.trim() !== "") {
        where += `
            AND (
                CONCAT(c.Nombre, ' ', c.Apellido) LIKE ?
                OR c.NCliente LIKE ?
            )
        `;

        params.push(
            `%${search}%`,
            `%${search}%`
        );
    }

    // Fecha inicio
    if (fechaInicio !== "") {
        where += " AND v.Fecha >= ?";
        params.push(fechaInicio);
    }

    // Fecha fin
    if (fechaFin !== "") {
        where += " AND v.Fecha <= ?";
        params.push(fechaFin);
    }

    // Tipo de pago
    if (tipoPago !== "" && tipoPago.toUpperCase() !== "TODAS") {
        where += " AND v.Tipo_Pago = ?";
        params.push(tipoPago);
    }

    // Estadísticas
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalRegistros,

            COALESCE(
                SUM(
                    CASE
                        WHEN v.Tipo_Pago = 'CONTADO'
                        THEN v.Total
                        ELSE 0
                    END
                ),
                0
            ) AS VentasContado,

            COALESCE(SUM(v.Total),0) AS TotalVentas

        FROM ventas v
        INNER JOIN clientes c
            ON v.Id_cliente = c.id

        ${where}
        `,
        params
    );

    // Total para la paginación
    const total = estadisticas[0].TotalRegistros;

    // Datos del reporte
    const [rows]: any = await pool.query(
        `
        SELECT

            v.id,
            v.Fecha,
            CONCAT(c.Nombre,' ',c.Apellido) AS Cliente,
            c.NCliente,
            v.Tipo_Pago,
            v.Total

        FROM ventas v

        INNER JOIN clientes c
            ON v.Id_cliente = c.id

        ${where}

        ORDER BY v.Fecha DESC, v.id DESC

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

        TotalRegistros: estadisticas[0].TotalRegistros,
        VentasContado: estadisticas[0].VentasContado,
        TotalVentas: estadisticas[0].TotalVentas
    };
};

export const obtenerReporteCompras = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    Id_proveedor: number | null = null,
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "WHERE 1=1";
    const params: any[] = [];

    // Búsqueda
    if (search.trim() !== "") {
        where += `
            AND (
                p.Nombre_Empresa LIKE ?
                OR c.NFactura LIKE ?
            )
        `;

        params.push(
            `%${search}%`,
            `%${search}%`
        );
    }

    // Fecha inicial
    if (fechaInicio !== "") {
        where += " AND c.Fecha >= ?";
        params.push(fechaInicio);
    }

    // Fecha final
    if (fechaFin !== "") {
        where += " AND c.Fecha <= ?";
        params.push(fechaFin);
    }

    // Proveedor
    if (Id_proveedor !== null && Id_proveedor > 0) {
        where += " AND c.Id_proveedor = ?";
        params.push(Id_proveedor);
    }

    // Estadísticas
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalRegistros,
            COALESCE(SUM(c.Total),0) AS TotalCompras
        FROM compras c
        INNER JOIN proveedores p
            ON c.Id_proveedor = p.id
        ${where}
        `,
        params
    );

    const total = estadisticas[0].TotalRegistros;

    // Datos paginados
    const [rows]: any = await pool.query(
        `
        SELECT
            c.id,
            c.Fecha,
            c.NFactura,
            c.Total,
            c.Id_proveedor,
            p.Nombre_Empresa,
            p.Nombre_Contacto
        FROM compras c
        INNER JOIN proveedores p
            ON c.Id_proveedor = p.id
        ${where}
        ORDER BY c.Fecha DESC, c.id DESC
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
        TotalRegistros: estadisticas[0].TotalRegistros,
        TotalCompras: estadisticas[0].TotalCompras
    };
};