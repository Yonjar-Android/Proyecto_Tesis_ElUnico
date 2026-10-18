import { pool } from "../config/database.js";

interface DetalleVentaInput {
    Id_producto: number;
    Cantidad: number;
    Precio_Venta: number;
    Descuento: number,
    Subtotal: number;
    Tipo_Descuento: "porcentaje" | "fijo";
    Id_servicio: number;
}

// tipos que puede exponer el backend (puedes ponerlos en un archivo compartido)
export interface ArticuloRecibo {
  nombre: string;
  bodega?: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
}

export interface ReciboVentaDTO {
  ticketNumero: number;
  cajero: string;
  fecha: string;
  hora: string;
  tipoPago: string;
  recibidoCordobas: number,
  clienteNombre: string;
  clienteCedula?: string;
  articulos: ArticuloRecibo[];
  devoluciones: DevolucionDTO[];
}

interface DetalleDevolucionDTO {
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number; // neto, ya con descuento de la venta original aplicado
    subtotal: number;
}

interface DevolucionDTO {
    idDevolucion: number;
    fecha: string;
    motivo: string;
    observacion?: string;
    estado: string;
    detalles: DetalleDevolucionDTO[];
}

function formatearFecha(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

export const formatearHora = (fecha: Date): string => {
    let horas = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const meridiano = horas >= 12 ? "P. M." : "A. M.";

    horas = horas % 12;
    horas = horas === 0 ? 12 : horas; // la hora 0 se muestra como 12

    const horasFormateadas = horas.toString().padStart(2, "0");

    return `${horasFormateadas}:${minutos} ${meridiano}`;
};

export const crearVenta = async (
    idCliente: number,
    idUsuario: number,
    tipoPago: string,
    total: number,
    recibidoCordobas: number,
    recibidoDolares: number,
    numReferencia: string,
    detalles: DetalleVentaInput[],
    datosCredito?: {
        fecha_inicio: string;
        numero_cuotas: number;
        frecuencia: 'diario' | 'semanal' | 'quincenal' | 'mensual';
        monto_inicial: number; // Agregado para el monto inicial del crédito
    }
) => {

    if (detalles.length === 0) {
        throw new Error("La venta debe contener al menos un producto.");
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Verificar stock
        for (const detalle of detalles) {
            if (detalle.Id_producto != null && detalle.Id_servicio == null) {
                const [rows]: any = await connection.query(
                    "SELECT Nombre, Stock FROM productos WHERE id = ?",
                    [detalle.Id_producto]
                );

                if (rows.length === 0) {
                    throw new Error("Uno de los productos no existe.");
                }

                if (rows[0].Stock < detalle.Cantidad) {
                    throw new Error(
                        `Stock insuficiente para el producto "${rows[0].Nombre}". Stock disponible: ${rows[0].Stock}.`
                    );
                }
            }
        }

        // Verificar que haya una sesión de caja abierta
        const [sesionRows]: any = await connection.query(
            "SELECT id_sesion FROM sesiones_caja WHERE id_usuario = ? AND estado = 'Abierta' LIMIT 1",
            [idUsuario]
        );

        if (sesionRows.length === 0) {
            throw new Error("No se puede registrar la venta: no hay una sesión de caja abierta.");
        }

        let estado = "Pagada";

        if (tipoPago === "Credito") {
            estado = "Pendiente";
            
            // Validar datos del crédito
            if (!datosCredito) {
                throw new Error("Los datos del crédito son requeridos.");
            }
        }

        // Para ventas al crédito y transferencias bancarias, NO ingresa efectivo físico a la caja
        let cordobasCaja = Number(recibidoCordobas) || 0;
        let dolaresCaja = Number(recibidoDolares) || 0;

        if (tipoPago === "Credito" || tipoPago === "Transferencia") {
            cordobasCaja = 0;
            dolaresCaja = 0;
        }

        // Crear venta
        const [venta]: any = await connection.query(
            `
            INSERT INTO ventas
            (Id_cliente, Id_usuario, Fecha, Tipo_Pago, Num_referencia, Estado, Total, RecibidoCordobas, RecibidoDolares)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                idCliente,
                idUsuario,
                new Date(),
                tipoPago,
                numReferencia,
                estado,
                total,
                cordobasCaja,
                dolaresCaja
            ]
        );

        const idVenta = venta.insertId;

        // Crear detalles
        for (const detalle of detalles) {
            await connection.query(
                `
                INSERT INTO detalle_venta
                (Id_venta, Id_producto, Id_servicio, Cantidad, Precio_Venta, Descuento, Tipo_Descuento, Subtotal)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    idVenta,
                    detalle.Id_producto ?? null,
                    detalle.Id_servicio ?? null,
                    detalle.Cantidad,
                    detalle.Precio_Venta,
                    detalle.Descuento,
                    detalle.Tipo_Descuento,
                    detalle.Subtotal
                ]
            );
        }

        // ============================================================
        // CREAR CRÉDITO SI ES CRÉDITO
        // ============================================================
        if (tipoPago === "Credito" && datosCredito) {
            const { fecha_inicio, numero_cuotas, frecuencia, monto_inicial } = datosCredito;

            // Calcular valores
            const saldo_financiado = total - monto_inicial;
            const monto_cuota = saldo_financiado / numero_cuotas;

            // Calcular fecha_fin según frecuencia
            const fechaFin = calcularFechaFin(fecha_inicio, numero_cuotas, frecuencia);

            // Insertar credito_factura
            const [credito]: any = await connection.query(
                `
                INSERT INTO credito_factura
                (id_venta, total_deuda, monto_inicial, numero_cuotas, 
                 fecha_inicio, fecha_fin, estado, frecuencia)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    idVenta,
                    total,
                    monto_inicial,
                    numero_cuotas,
                    fecha_inicio,
                    fechaFin,
                    'pendiente',
                    frecuencia
                ]
            );

            const idCredito = credito.insertId;

            // Insertar cuotas
            for (let i = 1; i <= numero_cuotas; i++) {
                const fechaVencimiento = calcularFechaVencimiento(fecha_inicio, i, frecuencia);

                await connection.query(
                    `
                    INSERT INTO cuota
                    (id_credito_factura, numero_cuota, monto_a_pagar, fecha_vencimiento, estado)
                    VALUES (?, ?, ?, ?, 'pendiente')
                    `,
                    [
                        idCredito,
                        i,
                        monto_cuota,
                        fechaVencimiento
                    ]
                );
            }
        }

        await connection.commit();

        return {
            mensaje: "Venta registrada correctamente.",
            idVenta
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};

// ============================================================
// FUNCIONES AUXILIARES PARA CÁLCULO DE FECHAS
// ============================================================

function calcularFechaFin(fechaInicio: string, numeroCuotas: number, frecuencia: string): string {
    const fecha = new Date(fechaInicio);
    
    switch (frecuencia) {
        case 'diario':
            fecha.setDate(fecha.getDate() + numeroCuotas);
            break;
        case 'semanal':
            fecha.setDate(fecha.getDate() + (numeroCuotas * 7));
            break;
        case 'quincenal':
            fecha.setDate(fecha.getDate() + (numeroCuotas * 15));
            break;
        case 'mensual':
            fecha.setMonth(fecha.getMonth() + numeroCuotas);
            break;
        default:
            throw new Error(`Frecuencia no válida: ${frecuencia}`);
    }
    
    return fecha.toISOString().split('T')[0];
}

function calcularFechaVencimiento(fechaInicio: string, numeroCuota: number, frecuencia: string): string {
    const fecha = new Date(fechaInicio);
    
    switch (frecuencia) {
        case 'diario':
            fecha.setDate(fecha.getDate() + numeroCuota);
            break;
        case 'semanal':
            fecha.setDate(fecha.getDate() + (numeroCuota * 7));
            break;
        case 'quincenal':
            fecha.setDate(fecha.getDate() + (numeroCuota * 15));
            break;
        case 'mensual':
            fecha.setMonth(fecha.getMonth() + numeroCuota);
            break;
        default:
            throw new Error(`Frecuencia no válida: ${frecuencia}`);
    }
    
    return fecha.toISOString().split('T')[0];
}

export const buscarFacturaParaDevolucion = async (
    idVenta: number
) => {

    const [ventaRows]: any = await pool.query(
        `
        SELECT
            v.id,
            v.Id_cliente,
            v.Fecha,
            CONCAT(c.Nombre, ' ', c.Apellido) AS cliente
        FROM ventas v
        INNER JOIN clientes c
            ON c.id = v.Id_cliente
        WHERE v.id = ?
        `,
        [idVenta]
    );

    if (ventaRows.length === 0) {
        throw new Error("La factura no existe.");
    }

    const venta = ventaRows[0];

    const [creditoRows]: any = await pool.query(
        `SELECT id FROM credito_factura WHERE id_venta = ? LIMIT 1`,
        [idVenta]
    );
 
    if (creditoRows.length > 0) {
        throw new Error("No se pueden registrar devoluciones sobre facturas al crédito.");
    }

    const [detalleRows]: any = await pool.query(
        `
        SELECT
            dv.id AS idDetalleVenta,
            dv.Id_producto AS idProducto,
            p.Nombre AS nombreProducto,
            m.Nombre_marca AS nombreMarca,
            dv.Cantidad AS cantidadComprada,
            dv.Precio_Venta AS precioVenta,
            dv.Descuento AS descuento,
            dv.Tipo_descuento AS tipoDescuento,

            COALESCE(
                SUM(dd.Cantidad),
                0
            ) AS cantidadDevuelta

        FROM detalle_venta dv

        INNER JOIN productos p
            ON p.id = dv.Id_producto

        LEFT JOIN marcas m
            ON m.id = p.Id_marca

        LEFT JOIN detalle_devolucion dd
            ON dd.Id_detalle_venta = dv.id

        WHERE dv.Id_venta = ?
          AND dv.Id_producto IS NOT NULL

        GROUP BY
            dv.id,
            dv.Id_producto,
            p.Nombre,
            m.Nombre_marca,
            dv.Cantidad

        ORDER BY dv.id ASC
        `,
        [idVenta]
    );

    const items = detalleRows
        .map((item: any) => {

            const cantidadComprada =
                Number(item.cantidadComprada);

            const cantidadDevuelta =
                Number(item.cantidadDevuelta);

                const precioVenta = Number(item.precioVenta);
            const descuento = Number(item.descuento);
            const tipoDescuento = item.tipoDescuento;

            let precioFinal = precioVenta;

            if (cantidadComprada > 0) {
                if (tipoDescuento === "porcentaje") {
            precioFinal =
            precioVenta - (precioVenta * descuento / 100);
                } else if (tipoDescuento === "fijo") {
                    precioFinal =
                        precioVenta - descuento;
                }
            }

            return {
    idDetalleVenta: item.idDetalleVenta,
    idProducto: item.idProducto,
    nombreProducto: item.nombreProducto,
    nombreMarca: item.nombreMarca,
    cantidadComprada,
    cantidadDevuelta,
    cantidadADevolver:
        cantidadComprada - cantidadDevuelta,
    precioVenta: precioFinal,
    descuento,
    tipoDescuento,
};
        })
        .filter(
            (item: any) => item.cantidadADevolver > 0
        );

    return {
        numeroFactura: String(venta.id),
        cliente: venta.cliente,
        fecha: venta.Fecha,
        items
    };
};

export const obtenerReciboVenta = async (idVenta: number): Promise<ReciboVentaDTO> => {
    const connection = await pool.getConnection();

    try {
        const [ventaRows]: any = await connection.query(
            `
            SELECT
                v.id            AS idVenta,
                v.Fecha         AS Fecha,
                v.Tipo_Pago     AS Tipo_Pago,
                c.Nombre        AS ClienteNombre,
                c.Apellido      AS ClienteApellido,
                u.Nombre_Usuario AS CajeroNombre,
                v.RecibidoCordobas AS RecibidoCordobas
            FROM ventas v
            INNER JOIN clientes c ON c.id = v.Id_cliente
            INNER JOIN usuarios u ON u.id = v.Id_usuario
            WHERE v.id = ?
            `,
            [idVenta]
        );

        if (ventaRows.length === 0) {
            throw new Error("No se encontró la venta solicitada.");
        }

        const venta = ventaRows[0];

        const [detalleRows]: any = await connection.query(
            `
            SELECT
                dv.Cantidad       AS Cantidad,
                dv.Precio_Venta   AS Precio_Venta,
                dv.Descuento      AS Descuento,
                dv.Tipo_descuento   AS Tipo_Descuento,
                p.Nombre          AS ProductoNombre,
                s.Nombre_servicio AS ServicioNombre
            FROM detalle_venta dv
            LEFT JOIN productos p ON p.id = dv.Id_producto
            LEFT JOIN servicios s ON s.id = dv.Id_servicio
            WHERE dv.Id_venta = ?
            `,
            [idVenta]
        );

        const [devolucionRows]: any = await connection.query(
    `
    SELECT
        dev.id          AS idDevolucion,
        dev.Fecha       AS Fecha,
        dev.Motivo      AS Motivo,
        dev.Observacion AS Observacion,
        dev.Estado      AS Estado,
        dd.Cantidad     AS Cantidad,
        dd.Precio_Venta AS PrecioVenta,
        dd.Subtotal     AS Subtotal,
        p.Nombre        AS ProductoNombre
    FROM devoluciones dev
    INNER JOIN detalle_devolucion dd ON dd.Id_devolucion = dev.id
    LEFT JOIN productos p ON p.id = dd.Id_producto
    WHERE dev.Id_venta = ?
    ORDER BY dev.Fecha ASC, dev.id ASC
    `,
    [idVenta]
);

const devolucionesMap = new Map<number, DevolucionDTO>();

for (const row of devolucionRows) {
    if (!devolucionesMap.has(row.idDevolucion)) {
        devolucionesMap.set(row.idDevolucion, {
            idDevolucion: row.idDevolucion,
            fecha: formatearFecha(row.Fecha),
            motivo: row.Motivo,
            observacion: row.Observacion ?? undefined,
            estado: row.Estado,
            detalles: [],
        });
    }

    devolucionesMap.get(row.idDevolucion)!.detalles.push({
        nombreProducto: row.ProductoNombre ?? "",
        cantidad: Number(row.Cantidad),
        precioUnitario: Number(row.PrecioVenta),
        subtotal: Number(row.Subtotal),
    });
}

const devoluciones = Array.from(devolucionesMap.values());

        return {
    ticketNumero: venta.idVenta,
    cajero: venta.CajeroNombre,
    fecha: formatearFecha(venta.Fecha),
    hora: formatearHora(venta.Fecha),
    tipoPago: venta.Tipo_Pago,
    recibidoCordobas: Number(venta.RecibidoCordobas),
    clienteNombre: `${venta.ClienteNombre} ${venta.ClienteApellido}`,
    clienteCedula: undefined,
    articulos: detalleRows.map((d: any) => ({
        nombre: d.ProductoNombre ?? d.ServicioNombre ?? "",
        cantidad: Number(d.Cantidad),
        precioUnitario: Number(d.Precio_Venta),
        descuento: Number(d.Descuento),
        tipoDescuento: d.Tipo_Descuento,
    })),
    devoluciones, // 👈 nuevo
};

    } finally {
        connection.release();
    }
};

const LIMITE_VENTAS_CREDITO_PENDIENTES = 2;

export const verificarLimiteCreditoPendiente = async (
    idCliente: number
): Promise<number> => {

    const [rows]: any = await pool.query(
        `
        SELECT COUNT(*) AS Total
        FROM ventas v
        WHERE v.Id_cliente = ?
          AND v.Tipo_Pago = 'CREDITO'
          AND v.Estado = 'Pendiente'
        `,
        [idCliente]
    );

    const ventasPendientes = rows[0].Total;

    if (ventasPendientes >= LIMITE_VENTAS_CREDITO_PENDIENTES) {
        throw new Error(
            `El cliente ya cuenta con ${ventasPendientes} ventas al crédito pendientes de pago, no es posible registrar otra venta al crédito.`
        );
    }

    return ventasPendientes;
};

const subtotalLinea = (
    cantidad: number,
    precio: number,
    descuento: number,
    tipo: string
) => {
    const descUnit = tipo === "porcentaje" ? precio * (descuento / 100) : descuento;
    return Math.round((cantidad * precio - descUnit * cantidad) * 100) / 100;
};

const MAX_PORCENTAJE_DESCUENTO = 50;

const esDeHoy = (fecha: Date | string): boolean => {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    return new Date(fecha) >= inicioHoy;
};

const calcularMotivoBloqueo = (
    venta: { Estado: string; Tipo_Pago: string; Fecha: Date | string },
    tieneDevoluciones: boolean
): string | null => {
    if (venta.Estado === "Anulada") return "La factura está anulada.";

    if (String(venta.Tipo_Pago).toUpperCase() === "CREDITO") {
        return "Las facturas al crédito no se pueden editar.";
    }

    // Hoy o el día anterior (desde las 00:00 de ayer)
    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setDate(limite.getDate() - 1);
    if (new Date(venta.Fecha) < limite) {
        return "Solo se pueden editar facturas de hoy o del día anterior.";
    }

    if (tieneDevoluciones) return "La factura tiene devoluciones registradas.";

    return null;
};

const motivoBloqueoEdicion = async (
    conn: any,
    venta: { id: number; Estado: string; Tipo_Pago: string; Fecha: Date | string }
): Promise<string | null> => {
    const [dev]: any = await conn.query(
        "SELECT id FROM devoluciones WHERE Id_venta = ? LIMIT 1",
        [venta.id]
    );
    return calcularMotivoBloqueo(venta, dev.length > 0);
};

interface AjusteDinero {
    metodo: "Efectivo" | "Transferencia";
    recibidoCordobas: number;
    referencia: string;
}

// monto > 0: se cobra al cliente. monto < 0: se le devuelve. 0: no hace nada.
const aplicarAjusteDinero = async (
    conn: any,
    venta: { id: number; Fecha: Date | string; Num_referencia: string | null },
    idUsuario: number,
    monto: number,
    ajuste: AjusteDinero,
    soloMismaSesion = false
) => {
    if (monto === 0) return;

    if (ajuste.metodo !== "Efectivo" && ajuste.metodo !== "Transferencia") {
        throw new Error("Método de ajuste inválido.");
    }

    const [sesion]: any = await conn.query(
        `SELECT id_sesion, fecha_apertura
         FROM sesiones_caja
         WHERE id_usuario = ? AND estado = 'Abierta'
         LIMIT 1 FOR UPDATE`,
        [idUsuario]
    );
    if (sesion.length === 0) {
        throw new Error("No hay una sesión de caja abierta para registrar el ajuste.");
    }
    const idSesion = sesion[0].id_sesion;

    // ¿La venta ocurrió dentro de la sesión de caja que está abierta ahora?
    const mismaSesion = new Date(venta.Fecha) >= new Date(sesion[0].fecha_apertura);

    if (soloMismaSesion && !mismaSesion) {
        throw new Error("Solo se puede anular una factura dentro de la misma sesión de caja en que se vendió.");
    }

    if (ajuste.metodo == "Transferencia") {
        const ref = (ajuste.referencia ?? "").trim();
        if (!ref) throw new Error("Ingresa la referencia de la transferencia del ajuste.");

        const previa = (venta.Num_referencia ?? "").trim();
        await conn.query("UPDATE ventas SET Num_referencia = ? WHERE id = ?", [
            previa ? `${previa} ${ref}` : ref,
            venta.id,
        ]);

        // monto negativo resta (misma lógica que el trigger de devoluciones)
        await conn.query(
            `UPDATE sesiones_caja
             SET total_tarjeta_transferencia = COALESCE(total_tarjeta_transferencia, 0) + ?
             WHERE id_sesion = ?`,
            [monto, idSesion]
        );
        return;
    }

    // Efectivo
    if (monto > 0) {
        if (Number(ajuste.recibidoCordobas) < monto) {
            throw new Error(`El monto recibido no cubre la diferencia de C$ ${monto.toFixed(2)}.`);
        }
        await conn.query(
            `UPDATE sesiones_caja
             SET total_ingresos_sistema = COALESCE(total_ingresos_sistema, 0) + ?
             WHERE id_sesion = ?`,
            [monto, idSesion]
        );
        return;
    }

    // Devolución de efectivo
    const devuelto = -monto;
    if (mismaSesion) {
        // El ingreso original está en esta caja: se resta de ingresos
        await conn.query(
            `UPDATE sesiones_caja
             SET total_ingresos_sistema = COALESCE(total_ingresos_sistema, 0) - ?
             WHERE id_sesion = ?`,
            [devuelto, idSesion]
        );
    } else {
        // El ingreso original quedó en una caja cerrada: sale como egreso de esta caja
        await conn.query(
            `UPDATE sesiones_caja
             SET total_egresos_sistema = COALESCE(total_egresos_sistema, 0) + ?
             WHERE id_sesion = ?`,
            [devuelto, idSesion]
        );
    }
};

// ───────── Historial ─────────
export const listarHistorialVentas = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const [[conteo]]: any = await pool.query(`SELECT COUNT(*) AS total FROM ventas`);

    const [rows]: any = await pool.query(
        `
        SELECT
            v.id        AS idVenta,
            v.Fecha     AS fecha,
            v.Estado    AS estado,
            v.Tipo_Pago AS tipoPago,
            v.Total     AS total,
            CONCAT(c.Nombre, ' ', c.Apellido) AS clienteNombre,
            EXISTS (SELECT 1 FROM devoluciones d WHERE d.Id_venta = v.id) AS tieneDevoluciones
        FROM ventas v
        INNER JOIN clientes c ON c.id = v.Id_cliente
        ORDER BY v.Fecha DESC, v.id DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
    );

    return {
        datos: rows.map((r: any) => ({
            idVenta: r.idVenta,
            clienteNombre: r.clienteNombre,
            estado: r.estado,
            tipoPago: r.tipoPago,
            total: Number(r.total),
            motivoBloqueo: calcularMotivoBloqueo(
                { Estado: r.estado, Tipo_Pago: r.tipoPago, Fecha: r.fecha },
                Boolean(r.tieneDevoluciones)
            ),
        })),
        paginacion: {
            page,
            limit,
            total: conteo.total,
            totalPaginas: Math.ceil(conteo.total / limit),
        },
    };
};

// ───────── Datos para la pantalla de edición ─────────
export const obtenerVentaParaEditar = async (idVenta: number) => {
    const [ventaRows]: any = await pool.query(
        `
        SELECT v.id, v.Fecha, v.Estado, v.Tipo_Pago, v.Total,
               CONCAT(c.Nombre, ' ', c.Apellido) AS clienteNombre
        FROM ventas v
        INNER JOIN clientes c ON c.id = v.Id_cliente
        WHERE v.id = ?
        `,
        [idVenta]
    );
    if (ventaRows.length === 0) throw new Error("La factura no existe.");
    const venta = ventaRows[0];

    const motivoBloqueo = await motivoBloqueoEdicion(pool, venta);

    const [detalles]: any = await pool.query(
        `
        SELECT
            dv.Id_producto, dv.Id_servicio,
            COALESCE(p.Nombre, s.Nombre_servicio) AS nombre,
            m.Nombre_marca AS marca,
            dv.Cantidad, dv.Precio_Venta, dv.Descuento, dv.Tipo_descuento AS Tipo_Descuento,
            p.Stock
        FROM detalle_venta dv
        LEFT JOIN productos p ON p.id = dv.Id_producto
        LEFT JOIN marcas m    ON m.id = p.Id_marca
        LEFT JOIN servicios s ON s.id = dv.Id_servicio
        WHERE dv.Id_venta = ?
        ORDER BY dv.id ASC
        `,
        [idVenta]
    );

        return {
        idVenta: venta.id,
        clienteNombre: venta.clienteNombre,
        estado: venta.Estado,
        tipoPago: venta.Tipo_Pago,
        total: Number(venta.Total),
        editable: motivoBloqueo === null,
        puedeAnular: motivoBloqueo === null && esDeHoy(venta.Fecha),
        motivoBloqueo,
        items: detalles.map((d: any) => ({
            tipo: d.Id_producto != null ? "producto" : "servicio",
            id: d.Id_producto ?? d.Id_servicio,
            nombre: d.nombre,
            marca: d.marca ?? null,
            cantidad: Number(d.Cantidad),
            precio: Number(d.Precio_Venta),
            descuento: Number(d.Descuento),
            tipoDescuento: d.Tipo_Descuento,
            stockMaximo: d.Id_producto != null ? Number(d.Stock) + Number(d.Cantidad) : null,
        })),
    };
};

// ───────── Editar / anular ─────────

interface DetalleEdicionInput {
    Id_producto?: number | null;
    Id_servicio?: number | null;
    Cantidad: number;
    Descuento?: number;
    Tipo_Descuento?: "porcentaje" | "fijo";
}

export const editarVenta = async (
    idVenta: number,
    idUsuario: number,
    nuevoEstado: "Pagada" | "Anulada",
    detalles: DetalleEdicionInput[],
    ajuste: AjusteDinero
) => {
    if (nuevoEstado !== "Pagada" && nuevoEstado !== "Anulada") {
        throw new Error("El estado solo puede ser Pagada o Anulada.");
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

                const [ventaRows]: any = await conn.query(
            `SELECT id, Fecha, Estado, Tipo_Pago, Total, Num_referencia, RecibidoCordobas
             FROM ventas WHERE id = ? FOR UPDATE`,
            [idVenta]
        );
        if (ventaRows.length === 0) throw new Error("La factura no existe.");
        const venta = ventaRows[0];

        const bloqueo = await motivoBloqueoEdicion(conn, venta);
        if (bloqueo) throw new Error(bloqueo);

        const [actuales]: any = await conn.query(
            `SELECT Id_producto, Id_servicio, Cantidad, Precio_Venta, Descuento, Tipo_descuento AS Tipo_Descuento
             FROM detalle_venta WHERE Id_venta = ?`,
            [idVenta]
        );

        // Cantidad que la factura tiene descontada hoy, por producto
        const cantidadAntes = new Map<number, number>();
        for (const a of actuales) {
            if (a.Id_producto != null) {
                cantidadAntes.set(a.Id_producto, (cantidadAntes.get(a.Id_producto) ?? 0) + Number(a.Cantidad));
            }
        }

        // No hay trigger de UPDATE/DELETE: el stock se devuelve a mano
        const devolverStockActual = async () => {
            for (const [idProducto, cant] of cantidadAntes) {
                await conn.query("UPDATE productos SET Stock = Stock + ? WHERE id = ?", [cant, idProducto]);
            }
        };

        // ===== ANULAR (solo el mismo día y la misma sesión de caja) =====
        if (nuevoEstado === "Anulada") {
            if (!esDeHoy(venta.Fecha)) {
                throw new Error("Una factura solo se puede anular el mismo día en que se vendió.");
            }

            const montoDevolver = Number(venta.Total);
            await devolverStockActual();
            await aplicarAjusteDinero(conn, venta, idUsuario, -montoDevolver, ajuste, true);
            await conn.query("UPDATE ventas SET Estado = 'Anulada' WHERE id = ?", [idVenta]);
            await conn.commit();
            return { mensaje: "Factura anulada correctamente.", idVenta, montoDevolver };
        }

        // ===== EDITAR ITEMS =====
        if (!detalles || detalles.length === 0) {
            throw new Error("La factura debe tener al menos un producto o servicio.");
        }

        const clave = (p?: number | null, s?: number | null) => (p != null ? `p:${p}` : `s:${s}`);

        const originales = new Map<string, any>();
        for (const a of actuales) originales.set(clave(a.Id_producto, a.Id_servicio), a);

        const vistos = new Set<string>();
        const nuevos: any[] = [];

        for (const d of detalles) {
            if (d.Id_producto == null && d.Id_servicio == null) {
                throw new Error("Cada línea debe tener un producto o un servicio.");
            }

            const k = clave(d.Id_producto, d.Id_servicio);
            if (vistos.has(k)) throw new Error("Hay un producto o servicio repetido en la factura.");
            vistos.add(k);

            const cantidad = Number(d.Cantidad);
            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                throw new Error("Todas las cantidades deben ser enteros mayores que 0.");
            }

            const original = originales.get(k);
            let precio: number, descuento: number, tipoDescuento: string;

            if (original) {
                precio = Number(original.Precio_Venta);
                descuento = Number(original.Descuento);
                tipoDescuento = original.Tipo_Descuento;
            } else {
                const [r]: any =
                    d.Id_producto != null
                        ? await conn.query("SELECT Precio_venta AS precio FROM productos WHERE id = ?", [d.Id_producto])
                        : await conn.query("SELECT Precio AS precio FROM servicios WHERE id = ?", [d.Id_servicio]);
                if (r.length === 0) throw new Error("Un producto o servicio no existe.");
                precio = Number(r[0].precio);

                descuento = Number(d.Descuento ?? 0);
                tipoDescuento = d.Tipo_Descuento === "porcentaje" ? "porcentaje" : "fijo";

                if (!Number.isFinite(descuento) || descuento < 0) throw new Error("Hay un descuento inválido.");
                if (tipoDescuento === "porcentaje" && descuento > MAX_PORCENTAJE_DESCUENTO) {
                    throw new Error(`El porcentaje de descuento no puede ser mayor a ${MAX_PORCENTAJE_DESCUENTO}%.`);
                }
                const descUnit = tipoDescuento === "porcentaje" ? precio * (descuento / 100) : descuento;
                if (descUnit > precio) throw new Error("El descuento no puede ser mayor al precio unitario.");
            }

            nuevos.push({
                Id_producto: d.Id_producto ?? null,
                Id_servicio: d.Id_servicio ?? null,
                Cantidad: cantidad,
                Precio_Venta: precio,
                Descuento: descuento,
                Tipo_Descuento: tipoDescuento,
                Subtotal: subtotalLinea(cantidad, precio, descuento, tipoDescuento),
            });
        }

        // Validar stock: disponible = stock actual + lo que esta factura ya tenía descontado
        const cantidadAhora = new Map<number, number>();
        for (const n of nuevos) if (n.Id_producto != null) cantidadAhora.set(n.Id_producto, n.Cantidad);

        const idsProductos = [...new Set([...cantidadAntes.keys(), ...cantidadAhora.keys()])];
        if (idsProductos.length > 0) {
            const [stocks]: any = await conn.query(
                "SELECT id, Nombre, Stock FROM productos WHERE id IN (?) FOR UPDATE",
                [idsProductos]
            );
            for (const p of stocks) {
                const disponible = Number(p.Stock) + (cantidadAntes.get(p.id) ?? 0);
                if ((cantidadAhora.get(p.id) ?? 0) > disponible) {
                    throw new Error(`Stock insuficiente para "${p.Nombre}". Disponible para esta factura: ${disponible}.`);
                }
            }
        }

        // Devolver stock, borrar, reinsertar (el trigger de INSERT descuenta)
        await devolverStockActual();
        await conn.query("DELETE FROM detalle_venta WHERE Id_venta = ?", [idVenta]);

        for (const n of nuevos) {
            await conn.query(
                `INSERT INTO detalle_venta
                 (Id_venta, Id_producto, Id_servicio, Cantidad, Precio_Venta, Descuento, Tipo_Descuento, Subtotal)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [idVenta, n.Id_producto, n.Id_servicio, n.Cantidad, n.Precio_Venta, n.Descuento, n.Tipo_Descuento, n.Subtotal]
            );
        }

        // Dinero: el backend calcula la diferencia
        const total = Math.round(nuevos.reduce((s, n) => s + n.Subtotal, 0) * 100) / 100;
        const diferencia = Math.round((total - Number(venta.Total)) * 100) / 100;

        await aplicarAjusteDinero(conn, venta, idUsuario, diferencia, ajuste);
                // Recibo: RecibidoCordobas = total vigente + vuelto del último cobro en efectivo.
        // Si el total baja (o no hay cobro en efectivo), el vuelto es 0.
        if (String(venta.Tipo_Pago).toUpperCase() === "CONTADO" && diferencia !== 0) {
            const nuevoCambio =
                diferencia > 0 && ajuste.metodo === "Efectivo"
                    ? Math.max(0, Number(ajuste.recibidoCordobas) - diferencia)
                    : 0;

            await conn.query("UPDATE ventas SET RecibidoCordobas = ? WHERE id = ?", [
                Math.round((total + nuevoCambio) * 100) / 100,
                idVenta,
            ]);
        }

        await conn.query("UPDATE ventas SET Total = ?, Estado = 'Pagada' WHERE id = ?", [total, idVenta]);

        await conn.commit();
        return { mensaje: "Factura actualizada correctamente.", idVenta, total, diferencia };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};