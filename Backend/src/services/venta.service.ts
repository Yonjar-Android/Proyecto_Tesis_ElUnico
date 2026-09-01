import { pool } from "../config/database.js";

interface DetalleVentaInput {
    Id_producto: number;
    Cantidad: number;
    Precio_Venta: number;
    Descuento: number,
    Subtotal: number;
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
    recibidoCordobas:number,
    detalles: DetalleVentaInput[]
) => {

    if (detalles.length === 0) {
        throw new Error("La venta debe contener al menos un producto.");
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Verificar stock
        for (const detalle of detalles) {
            console.log(detalle)
            if(detalle.Id_producto != null && detalle.Id_servicio == null){
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
        // Crear venta
        const [venta]: any = await connection.query(
            `
            INSERT INTO ventas
            (Id_cliente, Id_usuario, Fecha, Tipo_Pago, Total)
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                idCliente,
                idUsuario,
                new Date(),
                tipoPago,
                total
            ]
        );

        const idVenta = venta.insertId;

        // Crear detalles
        // Crear detalles
for (const detalle of detalles) {

    await connection.query(
        `
        INSERT INTO detalle_venta
        (Id_venta, Id_producto, Id_servicio, Cantidad, Precio_Venta, Descuento, Subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            idVenta,
            detalle.Id_producto ?? null,
            detalle.Id_servicio ?? null,
            detalle.Cantidad,
            detalle.Precio_Venta,
            detalle.Descuento,
            detalle.Subtotal
        ]
    );

}

if (tipoPago === "Credito") {
    const deuda = total - recibidoCordobas;

    await connection.query(
        `UPDATE clientes
         SET Saldo_Deuda = COALESCE(Saldo_Deuda, 0) + ?
         WHERE id = ?`,
        [deuda, idCliente]
    );
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

            return {
                idDetalleVenta: item.idDetalleVenta,
                idProducto: item.idProducto,
                nombreProducto: item.nombreProducto,
                nombreMarca: item.nombreMarca,
                cantidadComprada,
                cantidadDevuelta,
                cantidadADevolver:
                    cantidadComprada - cantidadDevuelta
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
                p.Nombre          AS ProductoNombre,
                s.Nombre_servicio AS ServicioNombre
            FROM detalle_venta dv
            LEFT JOIN productos p ON p.id = dv.Id_producto
            LEFT JOIN servicios s ON s.id = dv.Id_servicio
            WHERE dv.Id_venta = ?
            `,
            [idVenta]
        );

        return {
            ticketNumero: venta.idVenta,
            cajero: venta.CajeroNombre,
            fecha: formatearFecha(venta.Fecha),
            hora: formatearHora(venta.Fecha),
            tipoPago: venta.Tipo_Pago,
            clienteNombre: `${venta.ClienteNombre} ${venta.ClienteApellido}`,
            clienteCedula: undefined, // pendiente hasta que exista la columna
            articulos: detalleRows.map((d: any) => ({
                nombre: d.ProductoNombre ?? d.ServicioNombre ?? "",
                cantidad: Number(d.Cantidad),
                precioUnitario: Number(d.Precio_Venta),
                descuento: Number(d.Descuento),
            })),
        };

    } finally {
        connection.release();
    }
};