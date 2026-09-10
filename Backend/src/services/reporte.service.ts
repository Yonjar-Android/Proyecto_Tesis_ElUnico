import { pool } from "../config/database.js";
import { addOneDay } from "./funcionAuxiliar.js";

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

    let whereBusqueda = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        whereBusqueda = `
            AND (
                cli.NCliente LIKE ?
                OR CONCAT(cli.Nombre, ' ', cli.Apellido) LIKE ?
            )
        `;

        params.push(`%${search}%`, `%${search}%`);
    }

    // Estadísticas generales (sobre TODOS los clientes con saldo pendiente, sin aplicar la búsqueda)
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalClientesConDeuda,
            COALESCE(SUM(SaldoCliente), 0) AS TotalSaldoPendiente
        FROM (
            SELECT
                cli.id,
                COALESCE(SUM(cf.total_deuda), 0) - COALESCE(SUM(ab.total_abonado), 0) AS SaldoCliente
            FROM clientes cli
            INNER JOIN ventas v ON v.Id_cliente = cli.id
            INNER JOIN credito_factura cf ON cf.id_venta = v.id
                AND cf.estado IN ('pendiente', 'pagada_parcial')
            LEFT JOIN (
                SELECT id_credito_factura, SUM(monto_abonado) AS total_abonado
                FROM abono
                GROUP BY id_credito_factura
            ) ab ON ab.id_credito_factura = cf.id
            GROUP BY cli.id
            HAVING SaldoCliente > 0
        ) sub
        `
    );

    // Total de registros del reporte (aplicando búsqueda)
    const [countRows]: any = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM (
            SELECT
                cli.id,
                COALESCE(SUM(cf.total_deuda), 0) - COALESCE(SUM(ab.total_abonado), 0) AS SaldoCliente
            FROM clientes cli
            INNER JOIN ventas v ON v.Id_cliente = cli.id
            INNER JOIN credito_factura cf ON cf.id_venta = v.id
                AND cf.estado IN ('pendiente', 'pagada_parcial')
            LEFT JOIN (
                SELECT id_credito_factura, SUM(monto_abonado) AS total_abonado
                FROM abono
                GROUP BY id_credito_factura
            ) ab ON ab.id_credito_factura = cf.id
            WHERE 1 = 1
            ${whereBusqueda}
            GROUP BY cli.id
            HAVING SaldoCliente > 0
        ) sub
        `,
        params
    );

    const total = countRows[0].total;

    // Clientes con deuda (créditos pendientes/parciales agregados por cliente)
    const [rows]: any = await pool.query(
        `
        SELECT
            cli.id,
            cli.NCliente,
            cli.Nombre,
            cli.Apellido,
            cli.Telefono,
            cli.Direccion,
            cli.NCedula,
            COALESCE(SUM(cf.total_deuda), 0) - COALESCE(SUM(ab.total_abonado), 0) AS Saldo_Deuda
        FROM clientes cli
        INNER JOIN ventas v ON v.Id_cliente = cli.id
        INNER JOIN credito_factura cf ON cf.id_venta = v.id
            AND cf.estado IN ('pendiente', 'pagada_parcial')
        LEFT JOIN (
            SELECT id_credito_factura, SUM(monto_abonado) AS total_abonado
            FROM abono
            GROUP BY id_credito_factura
        ) ab ON ab.id_credito_factura = cf.id
        WHERE 1 = 1
        ${whereBusqueda}
        GROUP BY cli.id
        HAVING Saldo_Deuda > 0
        ORDER BY Saldo_Deuda DESC, cli.Nombre ASC
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
    estado: string = "",
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

    // Fecha inicial
    if (fechaInicio !== "") {
        where += " AND v.Fecha >= ?";
        params.push(`${fechaInicio} 00:00:00`);
    }

    // Fecha final
    if (fechaFin !== "") {
        where += " AND v.Fecha < ?";
        params.push(addOneDay(fechaFin));
    }

    // Tipo de pago
    if (tipoPago !== "" && tipoPago.toUpperCase() !== "TODAS") {
        where += " AND v.Tipo_Pago = ?";
        params.push(tipoPago);
    }

    // Estado (Pagada, Devuelta, Pendiente)
    if (estado !== "" && estado.toUpperCase() !== "TODOS") {
        where += " AND v.Estado = ?";
        params.push(estado);
    }

    // Subquery: total devuelto por venta, agregado para no duplicar filas
    const devolucionesSubquery = `
        SELECT
            dev.Id_venta AS Id_venta,
            COALESCE(SUM(dd.Subtotal), 0) AS TotalDevuelto
        FROM devoluciones dev
        INNER JOIN detalle_devolucion dd ON dd.Id_devolucion = dev.id
        GROUP BY dev.Id_venta
    `;

    // Subquery: total abonado por venta (a través del crédito asociado)
    const abonosSubquery = `
        SELECT
            cf.id_venta AS Id_venta,
            cf.total_deuda AS TotalDeuda,
            COALESCE(SUM(ab.monto_abonado), 0) AS TotalAbonado
        FROM credito_factura cf
        LEFT JOIN abono ab ON ab.id_credito_factura = cf.id
        GROUP BY cf.id_venta, cf.total_deuda
    `;

    // Neto para AGREGADOS (estadísticas): una venta Devuelta no debe sumar al total de ventas
    const totalNetoExpr = `
        CASE
            WHEN v.Estado = 'Devuelta' THEN 0
            ELSE v.Total - COALESCE(devt.TotalDevuelto, 0)
        END
    `;

    // Monto para MOSTRAR en cada fila: si está Devuelta, se muestra el monto original de la factura
    const totalMostrarExpr = `
        CASE
            WHEN v.Estado = 'Devuelta' THEN v.Total
            ELSE v.Total - COALESCE(devt.TotalDevuelto, 0)
        END
    `;

    // Pendiente de pago: deuda del crédito (o el total de la venta si no hay registro de crédito) menos lo abonado
    const pendientePagoExpr = `
        CASE
            WHEN v.Estado = 'Pendiente'
            THEN COALESCE(abt.TotalDeuda, v.Total) - COALESCE(abt.TotalAbonado, 0)
            ELSE 0
        END
    `;

    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalRegistros,

            COALESCE(
                SUM(
                    CASE
                        WHEN v.Tipo_Pago = 'CONTADO'
                        THEN ${totalNetoExpr}
                        ELSE 0
                    END
                ),
                0
            ) AS VentasContado,

            COALESCE(
                SUM(
                    CASE
                        WHEN v.Tipo_Pago = 'TRANSFERENCIA'
                        THEN ${totalNetoExpr}
                        ELSE 0
                    END
                ),
                0
            ) AS VentasTransferencia,

            COALESCE(SUM(${totalNetoExpr}), 0) AS TotalVentas,

            COALESCE(SUM(${pendientePagoExpr}), 0) AS TotalPendientePago,

            COALESCE(SUM(abt.TotalAbonado), 0) AS TotalAbonado

        FROM ventas v
        INNER JOIN clientes c
            ON v.Id_cliente = c.id
        LEFT JOIN (${devolucionesSubquery}) devt
            ON devt.Id_venta = v.id
        LEFT JOIN (${abonosSubquery}) abt
            ON abt.Id_venta = v.id

        ${where}
        `,
        params
    );

    const total = estadisticas[0].TotalRegistros;

    const [rows]: any = await pool.query(
        `
        SELECT

            v.id,
            v.Fecha,
            CONCAT(c.Nombre,' ',c.Apellido) AS Cliente,
            c.NCliente,
            v.Tipo_Pago,
            v.Estado,
            v.Total AS TotalOriginal,
            COALESCE(devt.TotalDevuelto, 0) AS TotalDevuelto,
            ${totalMostrarExpr} AS Total,
            COALESCE(abt.TotalAbonado, 0) AS TotalAbonado,
            ${pendientePagoExpr} AS PendientePago

        FROM ventas v

        INNER JOIN clientes c
            ON v.Id_cliente = c.id
        LEFT JOIN (${devolucionesSubquery}) devt
            ON devt.Id_venta = v.id
        LEFT JOIN (${abonosSubquery}) abt
            ON abt.Id_venta = v.id

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
        VentasTransferencia: estadisticas[0].VentasTransferencia,
        TotalVentas: estadisticas[0].TotalVentas,
        TotalPendientePago: estadisticas[0].TotalPendientePago,
        TotalAbonado: estadisticas[0].TotalAbonado
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
    params.push(`${fechaInicio} 00:00:00`);
}

    // Fecha final
    if (fechaFin !== "") {
    where += " AND c.Fecha < ?";
    params.push(addOneDay(fechaFin));
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