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

        // Crear venta
        const [venta]: any = await connection.query(
            `
            INSERT INTO ventas
            (Id_cliente, Id_usuario, Fecha, Tipo_Pago, Num_referencia, Estado, Total)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                idCliente,
                idUsuario,
                new Date(),
                tipoPago,
                numReferencia,
                estado,
                total
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
                u.Nombre_Usuario AS CajeroNombre
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