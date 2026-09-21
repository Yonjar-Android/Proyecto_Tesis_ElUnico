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
        p.Fecha_vencimiento,

        -- Proveedor de la compra más reciente
        (
            SELECT pr.Nombre_Empresa
            FROM detalle_compra dc
            INNER JOIN compras co ON co.id = dc.Id_compra
            INNER JOIN proveedores pr ON pr.id = co.Id_proveedor
            WHERE dc.Id_producto = p.id
            ORDER BY co.Fecha DESC, co.id DESC
            LIMIT 1
        ) AS Proveedor_reciente,

        -- Proveedor que más cantidad ha suministrado históricamente
        (
            SELECT pr2.Nombre_Empresa
            FROM detalle_compra dc2
            INNER JOIN compras co2 ON co2.id = dc2.Id_compra
            INNER JOIN proveedores pr2 ON pr2.id = co2.Id_proveedor
            WHERE dc2.Id_producto = p.id
            GROUP BY co2.Id_proveedor, pr2.Nombre_Empresa
            ORDER BY SUM(dc2.Cantidad) DESC
            LIMIT 1
        ) AS Proveedor_principal

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

export const obtenerReporteFacturasConDeuda = async (
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

    // Total abonado por crédito
    const abonosSubquery = `
        SELECT id_credito_factura, SUM(monto_abonado) AS total_abonado
        FROM abono
        GROUP BY id_credito_factura
    `;

    // Próxima cuota a pagar por crédito: la de menor numero_cuota aún pendiente/pagada_parcial
    const proximaCuotaSubquery = `
        SELECT
            cu.id_credito_factura,
            cu.fecha_vencimiento AS ProximaFechaPago,
            cu.numero_cuota AS ProximaCuotaNumero,
            cu.monto_a_pagar AS ProximaCuotaMonto
        FROM cuota cu
        INNER JOIN (
            SELECT id_credito_factura, MIN(numero_cuota) AS numero_cuota
            FROM cuota
            WHERE estado IN ('pendiente', 'pagada_parcial')
            GROUP BY id_credito_factura
        ) prim
            ON prim.id_credito_factura = cu.id_credito_factura
            AND prim.numero_cuota = cu.numero_cuota
    `;

    // Estadísticas generales: ahora hace JOIN con clientes y aplica el mismo
    // whereBusqueda que el resto del reporte, para que varíen según el filtro.
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalFacturasConDeuda,
            COALESCE(SUM(SaldoFactura), 0) AS TotalSaldoPendiente
        FROM (
            SELECT
                cf.id,
                cf.total_deuda - COALESCE(ab.total_abonado, 0) AS SaldoFactura
            FROM ventas v
            INNER JOIN clientes cli ON cli.id = v.Id_cliente
            INNER JOIN credito_factura cf ON cf.id_venta = v.id
                AND cf.estado IN ('pendiente', 'pagada_parcial')
            LEFT JOIN (${abonosSubquery}) ab
                ON ab.id_credito_factura = cf.id
            WHERE 1 = 1
            ${whereBusqueda}
        ) sub
        WHERE SaldoFactura > 0
        `,
        params
    );

    // Total de registros del reporte (aplicando búsqueda)
    const [countRows]: any = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM (
            SELECT
                cf.id,
                cf.total_deuda - COALESCE(ab.total_abonado, 0) AS SaldoFactura
            FROM ventas v
            INNER JOIN clientes cli ON cli.id = v.Id_cliente
            INNER JOIN credito_factura cf ON cf.id_venta = v.id
                AND cf.estado IN ('pendiente', 'pagada_parcial')
            LEFT JOIN (${abonosSubquery}) ab
                ON ab.id_credito_factura = cf.id
            WHERE 1 = 1
            ${whereBusqueda}
        ) sub
        WHERE SaldoFactura > 0
        `,
        params
    );

    const total = countRows[0].total;

    // Facturas con deuda, una fila por factura/crédito
    const [rows]: any = await pool.query(
        `
        SELECT
            v.id AS IdVenta,
            v.Fecha AS FechaVenta,

            cli.id AS IdCliente,
            cli.NCliente,
            cli.Nombre,
            cli.Apellido,
            cli.Telefono,
            cli.Direccion,
            cli.NCedula,

            cf.id AS IdCreditoFactura,
            cf.total_deuda AS TotalDeuda,
            cf.estado AS EstadoCredito,
            cf.numero_cuotas AS NumeroCuotas,
            cf.frecuencia AS Frecuencia,

            COALESCE(ab.total_abonado, 0) AS TotalAbonado,
            cf.total_deuda - COALESCE(ab.total_abonado, 0) AS Saldo_Deuda,

            prox.ProximaFechaPago,
            prox.ProximaCuotaNumero,
            prox.ProximaCuotaMonto

        FROM ventas v
        INNER JOIN clientes cli ON cli.id = v.Id_cliente
        INNER JOIN credito_factura cf ON cf.id_venta = v.id
            AND cf.estado IN ('pendiente', 'pagada_parcial')
        LEFT JOIN (${abonosSubquery}) ab
            ON ab.id_credito_factura = cf.id
        LEFT JOIN (${proximaCuotaSubquery}) prox
            ON prox.id_credito_factura = cf.id
        WHERE 1 = 1
        ${whereBusqueda}
        HAVING Saldo_Deuda > 0
        ORDER BY Saldo_Deuda DESC, prox.ProximaFechaPago ASC
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
        TotalFacturasConDeuda: estadisticas[0].TotalFacturasConDeuda,
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

export const obtenerReporteVentasServicio = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "WHERE d.Id_servicio IS NOT NULL";
    const params: any[] = [];

    if (search.trim() !== "") {
        where += " AND s.Nombre_servicio LIKE ?";
        params.push(`%${search}%`);
    }

    if (fechaInicio !== "") {
        where += " AND v.Fecha >= ?";
        params.push(`${fechaInicio} 00:00:00`);
    }

    if (fechaFin !== "") {
        where += " AND v.Fecha < ?";
        params.push(addOneDay(fechaFin));
    }

    const devolucionesSubquery = `
        SELECT
            dd.Id_detalle_venta AS Id_detalle_venta,
            COALESCE(SUM(dd.Subtotal), 0) AS TotalDevuelto
        FROM detalle_devolucion dd
        INNER JOIN devoluciones dev ON dev.id = dd.Id_devolucion
        WHERE dev.Estado <> 'Anulada'
        GROUP BY dd.Id_detalle_venta
    `;

    // Monto neto facturado de esta línea (ya descontando devoluciones de ese detalle)
    const subtotalNetoExpr = `d.Subtotal - COALESCE(devt.TotalDevuelto, 0)`;

    // Descuento normalizado a córdobas, sea porcentaje o monto fijo
    const descuentoMontoExpr = `
        CASE
            WHEN d.Tipo_descuento = 'Porcentaje'
            THEN (d.Precio_Venta * d.Cantidad * d.Descuento / 100)
            ELSE d.Descuento
        END
    `;

    // Total de servicios distintos que cumplen el filtro (para la paginación)
    const [totalServicios]: any = await pool.query(
        `
        SELECT COUNT(DISTINCT s.id) AS Total
        FROM detalle_venta d
        INNER JOIN ventas v ON d.Id_venta = v.id
        INNER JOIN servicios s ON d.Id_servicio = s.id
        LEFT JOIN (${devolucionesSubquery}) devt ON devt.Id_detalle_venta = d.id
        ${where}
        `,
        params
    );
    const total = totalServicios[0].Total;

    // Estadísticas generales (sobre todos los servicios que cumplen el filtro, sin paginar)
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COALESCE(SUM(${subtotalNetoExpr}), 0) AS TotalFacturadoServicios
        FROM detalle_venta d
        INNER JOIN ventas v ON d.Id_venta = v.id
        INNER JOIN servicios s ON d.Id_servicio = s.id
        LEFT JOIN (${devolucionesSubquery}) devt ON devt.Id_detalle_venta = d.id
        ${where}
        `,
        params
    );

    // Datos agrupados por servicio, paginados
    const [rows]: any = await pool.query(
        `
        SELECT
            s.id AS Id_servicio,
            s.Nombre_servicio,
            SUM(d.Cantidad) AS CantidadTotal,
            COALESCE(SUM(${descuentoMontoExpr}), 0) AS TotalDescuento,
            COALESCE(SUM(${subtotalNetoExpr}), 0) AS TotalFacturado
        FROM detalle_venta d
        INNER JOIN ventas v ON d.Id_venta = v.id
        INNER JOIN servicios s ON d.Id_servicio = s.id
        LEFT JOIN (${devolucionesSubquery}) devt ON devt.Id_detalle_venta = d.id
        ${where}
        GROUP BY s.id, s.Nombre_servicio
        ORDER BY TotalFacturado DESC
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
        TotalRegistros: total,
        TotalFacturadoServicios: estadisticas[0].TotalFacturadoServicios
    };
};

export const obtenerReporteVentasProducto = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "WHERE d.Id_producto IS NOT NULL";
    const params: any[] = [];

    if (search.trim() !== "") {
        where += " AND p.Nombre LIKE ?";
        params.push(`%${search}%`);
    }

    if (fechaInicio !== "") {
        where += " AND v.Fecha >= ?";
        params.push(`${fechaInicio} 00:00:00`);
    }

    if (fechaFin !== "") {
        where += " AND v.Fecha < ?";
        params.push(addOneDay(fechaFin));
    }

    const devolucionesSubquery = `
        SELECT
            dd.Id_detalle_venta AS Id_detalle_venta,
            COALESCE(SUM(dd.Subtotal), 0) AS TotalDevuelto,
            COALESCE(SUM(dd.Cantidad), 0) AS CantidadDevuelta
        FROM detalle_devolucion dd
        INNER JOIN devoluciones dev ON dev.id = dd.Id_devolucion
        WHERE dev.Estado <> 'Anulada'
        GROUP BY dd.Id_detalle_venta
    `;

    // Monto neto facturado de esta línea (ya descontando devoluciones de ese detalle)
    const subtotalNetoExpr = `d.Subtotal - COALESCE(devt.TotalDevuelto, 0)`;

    // Cantidad neta de esta línea (ya descontando unidades devueltas)
    const cantidadNetaExpr = `(d.Cantidad - COALESCE(devt.CantidadDevuelta, 0))`;

    // Descuento normalizado a córdobas, sea porcentaje o monto fijo.
    // En ambos casos d.Descuento es un valor POR UNIDAD, así que el total
    // se obtiene multiplicando por la cantidad neta (ya descontando lo devuelto).
    const descuentoMontoExpr = `
        CASE
            WHEN d.Tipo_descuento = 'Porcentaje'
            THEN (d.Precio_Venta * ${cantidadNetaExpr} * d.Descuento / 100)
            ELSE (d.Descuento * ${cantidadNetaExpr})
        END
    `;

    // Total de productos distintos que cumplen el filtro (para la paginación)
    const [totalProductos]: any = await pool.query(
        `
        SELECT COUNT(DISTINCT p.id) AS Total
        FROM detalle_venta d
        INNER JOIN ventas v ON d.Id_venta = v.id
        INNER JOIN productos p ON d.Id_producto = p.id
        LEFT JOIN (${devolucionesSubquery}) devt ON devt.Id_detalle_venta = d.id
        ${where}
        `,
        params
    );
    const total = totalProductos[0].Total;

    // Estadísticas generales (sobre todos los productos que cumplen el filtro, sin paginar)
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COALESCE(SUM(${subtotalNetoExpr}), 0) AS TotalFacturadoProductos
        FROM detalle_venta d
        INNER JOIN ventas v ON d.Id_venta = v.id
        INNER JOIN productos p ON d.Id_producto = p.id
        LEFT JOIN (${devolucionesSubquery}) devt ON devt.Id_detalle_venta = d.id
        ${where}
        `,
        params
    );

    // Datos agrupados por producto, paginados
    const [rows]: any = await pool.query(
        `
        SELECT
            p.id AS Id_producto,
            p.Nombre AS Nombre_producto,
            SUM(${cantidadNetaExpr}) AS CantidadTotal,
            COALESCE(SUM(${descuentoMontoExpr}), 0) AS TotalDescuento,
            COALESCE(SUM(${subtotalNetoExpr}), 0) AS TotalFacturado
        FROM detalle_venta d
        INNER JOIN ventas v ON d.Id_venta = v.id
        INNER JOIN productos p ON d.Id_producto = p.id
        LEFT JOIN (${devolucionesSubquery}) devt ON devt.Id_detalle_venta = d.id
        ${where}
        GROUP BY p.id, p.Nombre
        ORDER BY TotalFacturado DESC
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
        TotalRegistros: total,
        TotalFacturadoProductos: estadisticas[0].TotalFacturadoProductos
    };
};

export const obtenerReporteSalidasInventario = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "WHERE 1=1";
    const params: any[] = [];

    // Búsqueda por producto o motivo de salida
    if (search.trim() !== "") {
        where += `
            AND (
                p.Nombre LIKE ?
                OR d.Motivo LIKE ?
            )
        `;

        params.push(
            `%${search}%`,
            `%${search}%`
        );
    }

    // Fecha inicial
    if (fechaInicio !== "") {
        where += " AND s.Fecha >= ?";
        params.push(`${fechaInicio} 00:00:00`);
    }

    // Fecha final
    if (fechaFin !== "") {
        where += " AND s.Fecha < ?";
        params.push(addOneDay(fechaFin));
    }

    // Estadísticas
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalRegistros,
            COALESCE(SUM(d.Cantidad),0) AS TotalUnidadesSalidas
        FROM detalle_otras_salidas_inventario d
        INNER JOIN otras_salidas_inventario s
            ON d.Id_salida = s.id
        INNER JOIN productos p
            ON d.Id_producto = p.id
        ${where}
        `,
        params
    );

    const total = estadisticas[0].TotalRegistros;

    // Datos paginados
    const [rows]: any = await pool.query(
        `
        SELECT
            d.id,
            d.Id_salida,
            s.Fecha,
            d.Id_producto,
            p.Nombre AS Nombre_Producto,
            d.Motivo,
            d.Cantidad
        FROM detalle_otras_salidas_inventario d
        INNER JOIN otras_salidas_inventario s
            ON d.Id_salida = s.id
        INNER JOIN productos p
            ON d.Id_producto = p.id
        ${where}
        ORDER BY s.Fecha DESC, d.id DESC
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
        TotalUnidadesSalidas: estadisticas[0].TotalUnidadesSalidas
    };
};

export const obtenerReporteInventario = async (
    search: string = "",
    Id_categoria: number | null = null,
    Id_marca: number | null = null,
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "WHERE 1=1";
    const params: any[] = [];

    if (search.trim() !== "") {
        where += " AND p.Nombre LIKE ?";
        params.push(`%${search}%`);
    }

    if (Id_categoria !== null && Id_categoria > 0) {
        where += " AND p.Id_categoria = ?";
        params.push(Id_categoria);
    }

    if (Id_marca !== null && Id_marca > 0) {
        where += " AND p.Id_marca = ?";
        params.push(Id_marca);
    }

    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(*) AS TotalRegistros,
            COALESCE(SUM(p.Stock), 0) AS TotalStock,
            SUM(CASE WHEN p.Stock < p.Stock_min THEN 1 ELSE 0 END) AS TotalStockCritico
        FROM productos p
        INNER JOIN marcas m ON p.Id_marca = m.id
        INNER JOIN categorias c ON p.Id_categoria = c.id
        ${where}
        `,
        params
    );

    const total = estadisticas[0].TotalRegistros;

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
            p.Stock_min
        FROM productos p
        INNER JOIN marcas m ON p.Id_marca = m.id
        INNER JOIN categorias c ON p.Id_categoria = c.id
        ${where}
        ORDER BY p.Nombre ASC
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
        TotalStock: estadisticas[0].TotalStock,
        TotalStockCritico: estadisticas[0].TotalStockCritico
    };
};

export const obtenerReporteDevoluciones = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "WHERE dev.Estado = 'Completada'";
    const params: any[] = [];

    // Buscar por cliente o número de factura
    if (search.trim() !== "") {
        where += `
            AND (
                CONCAT(c.Nombre, ' ', c.Apellido) LIKE ?
                OR c.NCliente LIKE ?
                OR v.id = ?
            )
        `;
        params.push(`%${search}%`, `%${search}%`, search);
    }

    // Fecha inicial
    if (fechaInicio !== "") {
        where += " AND dev.Fecha >= ?";
        params.push(`${fechaInicio} 00:00:00`);
    }

    // Fecha final
    if (fechaFin !== "") {
        where += " AND dev.Fecha < ?";
        params.push(addOneDay(fechaFin));
    }

    // Estadísticas
    const [estadisticas]: any = await pool.query(
        `
        SELECT
            COUNT(DISTINCT dev.id) AS TotalRegistros,
            COALESCE(SUM(dd.Subtotal), 0) AS TotalDevuelto,
            COALESCE(SUM(dd.Cantidad), 0) AS TotalProductosDevueltos
        FROM devoluciones dev
        INNER JOIN detalle_devolucion dd ON dd.Id_devolucion = dev.id
        INNER JOIN ventas v ON dev.Id_venta = v.id
        INNER JOIN clientes c ON v.Id_cliente = c.id
        ${where}
        `,
        params
    );

    const total = estadisticas[0].TotalRegistros;

    // Datos paginados, una fila por devolución
    const [rows]: any = await pool.query(
        `
        SELECT
            dev.id,
            dev.Fecha,
            dev.Motivo,
            dev.Observacion,
            v.id AS NFactura,
            CONCAT(c.Nombre, ' ', c.Apellido) AS Cliente,
            c.NCliente,
            SUM(dd.Cantidad) AS CantidadProductos,
            SUM(dd.Subtotal) AS TotalDevuelto
        FROM devoluciones dev
        INNER JOIN detalle_devolucion dd ON dd.Id_devolucion = dev.id
        INNER JOIN ventas v ON dev.Id_venta = v.id
        INNER JOIN clientes c ON v.Id_cliente = c.id
        ${where}
        GROUP BY dev.id, dev.Fecha, dev.Motivo, dev.Observacion, v.id, c.Nombre, c.Apellido, c.NCliente
        ORDER BY dev.Fecha DESC, dev.id DESC
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
        TotalDevuelto: estadisticas[0].TotalDevuelto,
        TotalProductosDevueltos: estadisticas[0].TotalProductosDevueltos
    };
};

export const obtenerReporteArqueoPeriodo = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    estado: string = "",
    page: number = 1,
    perPage: number = 10
) => {
    const offset = (page - 1) * perPage;
    let where = "WHERE 1=1";
    const params: any[] = [];

    if (search.trim() !== "") {
        where += ` AND (
            u.Nombre_Usuario LIKE ? 
            OR sc.id_sesion LIKE ? 
            OR sc.observaciones LIKE ?
        )`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (fechaInicio !== "") {
        where += " AND sc.fecha_apertura >= ?";
        params.push(`${fechaInicio} 00:00:00`);
    }

    if (fechaFin !== "") {
        where += " AND sc.fecha_apertura < ?";
        params.push(addOneDay(fechaFin));
    }

    if (estado !== "" && estado.toUpperCase() !== "TODOS") {
        where += " AND sc.estado = ?";
        params.push(estado);
    }

    // Estadísticas generales (KPIs)
    const [estadisticas]: any = await pool.query(
        `SELECT
            COUNT(*) AS TotalRegistros,
            COALESCE(SUM(sc.monto_apertura_cordobas + (sc.monto_apertura_dolares * sc.tasa_cambio)), 0) AS TotalAperturaCordobas,
            COALESCE(SUM(sc.total_ingresos_sistema), 0) AS TotalIngresos,
            COALESCE(SUM(sc.total_egresos_sistema), 0) AS TotalEgresos,
            COALESCE(SUM(sc.total_efectivo_contado), 0) AS TotalEfectivoContado,
            COALESCE(SUM(sc.total_tarjeta_transferencia), 0) AS TotalTransferencias,
            COALESCE(SUM(sc.diferencia), 0) AS TotalDiferencia,
            COALESCE(SUM(CASE WHEN sc.diferencia > 0 THEN sc.diferencia ELSE 0 END), 0) AS TotalSobrantes,
            COALESCE(SUM(CASE WHEN sc.diferencia < 0 THEN sc.diferencia ELSE 0 END), 0) AS TotalFaltantes
        FROM sesiones_caja sc
        LEFT JOIN usuarios u ON sc.id_usuario = u.id
        ${where}`,
        params
    );

    // Conteo total
    const [countRows]: any = await pool.query(
        `SELECT COUNT(*) AS total
        FROM sesiones_caja sc
        LEFT JOIN usuarios u ON sc.id_usuario = u.id
        ${where}`,
        params
    );

    const total = countRows[0]?.total || 0;

    // Datos paginados
    const [rows]: any = await pool.query(
        `SELECT
            sc.id_sesion,
            sc.id_usuario,
            COALESCE(u.Nombre_Usuario, 'Desconocido') AS usuario_nombre,
            sc.fecha_apertura,
            sc.fecha_cierre,
            sc.monto_apertura_cordobas,
            sc.monto_apertura_dolares,
            sc.tasa_cambio,
            (sc.monto_apertura_cordobas + (sc.monto_apertura_dolares * sc.tasa_cambio)) AS total_apertura_cordobas,
            sc.total_ingresos_sistema,
            sc.total_egresos_sistema,
            sc.total_neto_sistema,
            sc.total_efectivo_contado,
            sc.total_tarjeta_transferencia,
            sc.diferencia,
            sc.observaciones,
            sc.estado
        FROM sesiones_caja sc
        LEFT JOIN usuarios u ON sc.id_usuario = u.id
        ${where}
        ORDER BY sc.id_sesion DESC
        LIMIT ? OFFSET ?`,
        [...params, perPage, offset]
    );

    const stats = estadisticas[0] || {};

    return {
        data: rows,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage) || 1,
        TotalRegistros: Number(stats.TotalRegistros) || 0,
        TotalAperturaCordobas: Number(stats.TotalAperturaCordobas) || 0,
        TotalIngresos: Number(stats.TotalIngresos) || 0,
        TotalEgresos: Number(stats.TotalEgresos) || 0,
        TotalEfectivoContado: Number(stats.TotalEfectivoContado) || 0,
        TotalTransferencias: Number(stats.TotalTransferencias) || 0,
        TotalDiferencia: Number(stats.TotalDiferencia) || 0,
        TotalSobrantes: Number(stats.TotalSobrantes) || 0,
        TotalFaltantes: Number(stats.TotalFaltantes) || 0
    };
};

export const obtenerReporteArqueoCajero = async (
    search: string = "",
    fechaInicio: string = "",
    fechaFin: string = "",
    idUsuario: number | null = null,
    estado: string = "",
    page: number = 1,
    perPage: number = 10
) => {
    const offset = (page - 1) * perPage;
    let where = "WHERE 1=1";
    const params: any[] = [];

    if (idUsuario && idUsuario > 0) {
        where += " AND sc.id_usuario = ?";
        params.push(idUsuario);
    }

    if (search.trim() !== "") {
        where += ` AND (
            u.Nombre_Usuario LIKE ? 
            OR sc.id_sesion LIKE ? 
            OR sc.observaciones LIKE ?
        )`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (fechaInicio !== "") {
        where += " AND sc.fecha_apertura >= ?";
        params.push(`${fechaInicio} 00:00:00`);
    }

    if (fechaFin !== "") {
        where += " AND sc.fecha_apertura < ?";
        params.push(addOneDay(fechaFin));
    }

    if (estado !== "" && estado.toUpperCase() !== "TODOS") {
        where += " AND sc.estado = ?";
        params.push(estado);
    }

    // Estadísticas generales (KPIs)
    const [estadisticas]: any = await pool.query(
        `SELECT
            COUNT(*) AS TotalRegistros,
            COALESCE(SUM(sc.monto_apertura_cordobas + (sc.monto_apertura_dolares * sc.tasa_cambio)), 0) AS TotalAperturaCordobas,
            COALESCE(SUM(sc.total_ingresos_sistema), 0) AS TotalIngresos,
            COALESCE(SUM(sc.total_egresos_sistema), 0) AS TotalEgresos,
            COALESCE(SUM(sc.total_efectivo_contado), 0) AS TotalEfectivoContado,
            COALESCE(SUM(sc.total_tarjeta_transferencia), 0) AS TotalTransferencias,
            COALESCE(SUM(sc.diferencia), 0) AS TotalDiferencia,
            COALESCE(SUM(CASE WHEN sc.diferencia > 0 THEN sc.diferencia ELSE 0 END), 0) AS TotalSobrantes,
            COALESCE(SUM(CASE WHEN sc.diferencia < 0 THEN sc.diferencia ELSE 0 END), 0) AS TotalFaltantes
        FROM sesiones_caja sc
        LEFT JOIN usuarios u ON sc.id_usuario = u.id
        ${where}`,
        params
    );

    // Conteo total
    const [countRows]: any = await pool.query(
        `SELECT COUNT(*) AS total
        FROM sesiones_caja sc
        LEFT JOIN usuarios u ON sc.id_usuario = u.id
        ${where}`,
        params
    );

    const total = countRows[0]?.total || 0;

    // Datos paginados
    const [rows]: any = await pool.query(
        `SELECT
            sc.id_sesion,
            sc.id_usuario,
            COALESCE(u.Nombre_Usuario, 'Desconocido') AS usuario_nombre,
            sc.fecha_apertura,
            sc.fecha_cierre,
            sc.monto_apertura_cordobas,
            sc.monto_apertura_dolares,
            sc.tasa_cambio,
            (sc.monto_apertura_cordobas + (sc.monto_apertura_dolares * sc.tasa_cambio)) AS total_apertura_cordobas,
            sc.total_ingresos_sistema,
            sc.total_egresos_sistema,
            sc.total_neto_sistema,
            sc.total_efectivo_contado,
            sc.total_tarjeta_transferencia,
            sc.diferencia,
            sc.observaciones,
            sc.estado
        FROM sesiones_caja sc
        LEFT JOIN usuarios u ON sc.id_usuario = u.id
        ${where}
        ORDER BY sc.id_sesion DESC
        LIMIT ? OFFSET ?`,
        [...params, perPage, offset]
    );

    const stats = estadisticas[0] || {};

    return {
        data: rows,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage) || 1,
        TotalRegistros: Number(stats.TotalRegistros) || 0,
        TotalAperturaCordobas: Number(stats.TotalAperturaCordobas) || 0,
        TotalIngresos: Number(stats.TotalIngresos) || 0,
        TotalEgresos: Number(stats.TotalEgresos) || 0,
        TotalEfectivoContado: Number(stats.TotalEfectivoContado) || 0,
        TotalTransferencias: Number(stats.TotalTransferencias) || 0,
        TotalDiferencia: Number(stats.TotalDiferencia) || 0,
        TotalSobrantes: Number(stats.TotalSobrantes) || 0,
        TotalFaltantes: Number(stats.TotalFaltantes) || 0
    };
};

export const obtenerDetalleArqueo = async (idSesion: number) => {
    const [sesionRows]: any = await pool.query(
        `SELECT 
            sc.*,
            COALESCE(u.Nombre_Usuario, 'Desconocido') AS usuario_nombre,
            (sc.monto_apertura_cordobas + (sc.monto_apertura_dolares * sc.tasa_cambio)) AS total_apertura_cordobas
        FROM sesiones_caja sc
        LEFT JOIN usuarios u ON sc.id_usuario = u.id
        WHERE sc.id_sesion = ?`,
        [idSesion]
    );

    if (!sesionRows || sesionRows.length === 0) {
        throw new Error("No se encontró la sesión de caja solicitada.");
    }

    const sesion = sesionRows[0];

    const [egresos]: any = await pool.query(
        `SELECT * FROM egresos_caja WHERE id_sesion = ? ORDER BY id_egreso DESC`,
        [idSesion]
    );

    const [billetes]: any = await pool.query(
        `SELECT * FROM arqueo_desglose_billetes WHERE id_sesion = ? ORDER BY moneda ASC, denominacion DESC`,
        [idSesion]
    );

    return {
        sesion,
        egresos: egresos || [],
        desgloseBilletes: billetes || []
    };
};