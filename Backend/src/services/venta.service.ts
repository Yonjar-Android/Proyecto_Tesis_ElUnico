import { pool } from "../config/database.js";

interface DetalleVentaInput {
    Id_producto: number;
    Cantidad: number;
    Precio_Venta: number;
    Descuento: number,
    Subtotal: number;
}

export const crearVenta = async (
    idCliente: number,
    idUsuario: number,
    tipoPago: string,
    total: number,
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
        for (const detalle of detalles) {

            await connection.query(
                `
                INSERT INTO detalle_venta
                (Id_venta, Id_producto, Cantidad, Precio_Venta, Descuento, Subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    idVenta,
                    detalle.Id_producto,
                    detalle.Cantidad,
                    detalle.Precio_Venta,
                    detalle.Descuento,
                    detalle.Subtotal
                ]
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