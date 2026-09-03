import { pool } from "../config/database.js";
import type { PoolConnection } from "mysql2/promise";

interface DetalleDevolucion {
    Id_detalle_venta: number;
    Cantidad: number;
}

interface CrearDevolucionData {
    Id_venta: number;
    Id_usuario: number;
    Motivo: string;
    Observacion?: string | null;
    detalles: DetalleDevolucion[];
}

export const crearDevolucion = async (
    data: CrearDevolucionData
) => {

    let connection: PoolConnection | null = null;

    try {

        connection = await pool.getConnection();

        await connection.beginTransaction();

        // ==========================================
        // VALIDACIONES GENERALES
        // ==========================================

        if (!data.Id_venta) {
            throw new Error("La venta es obligatoria.");
        }

        if (!data.Id_usuario) {
            throw new Error("El usuario es obligatorio.");
        }

        if (!data.Motivo?.trim()) {
            throw new Error("El motivo de devolución es obligatorio.");
        }

        if (!data.detalles || data.detalles.length === 0) {
            throw new Error(
                "Debe existir al menos un detalle para realizar la devolución."
            );
        }

        // ==========================================
        // VALIDAR VENTA
        // ==========================================

        const [ventaRows]: any = await connection.query(
            `
            SELECT id
            FROM ventas
            WHERE id = ?
            FOR UPDATE
            `,
            [data.Id_venta]
        );

        if (ventaRows.length === 0) {
            throw new Error("La venta no existe.");
        }

        // ==========================================
        // VALIDAR USUARIO
        // ==========================================

        const [usuarioRows]: any = await connection.query(
            `
            SELECT id
            FROM usuarios
            WHERE id = ?
            `,
            [data.Id_usuario]
        );

        if (usuarioRows.length === 0) {
            throw new Error("El usuario no existe.");
        }

        // ==========================================
        // VALIDAR DETALLES
        // ==========================================

        for (const detalle of data.detalles) {

            if (!detalle.Id_detalle_venta) {
                throw new Error(
                    "Todos los detalles deben indicar el detalle de venta."
                );
            }

            if (!detalle.Cantidad || detalle.Cantidad <= 0) {
                throw new Error(
                    "La cantidad a devolver debe ser mayor que cero."
                );
            }

            // ==========================================
            // OBTENER DETALLE ORIGINAL
            // ==========================================

            const [detalleVentaRows]: any = await connection.query(
                `
                SELECT
                    id,
                    Id_venta,
                    Id_producto,
                    Cantidad,
                    Precio_Venta
                FROM detalle_venta
                WHERE id = ?
                  AND Id_venta = ?
                FOR UPDATE
                `,
                [
                    detalle.Id_detalle_venta,
                    data.Id_venta
                ]
            );

            if (detalleVentaRows.length === 0) {
                throw new Error(
                    `El detalle ${detalle.Id_detalle_venta} no pertenece a la venta ${data.Id_venta}.`
                );
            }

            const detalleVenta = detalleVentaRows[0];

            // ==========================================
            // VALIDAR PRODUCTO / SERVICIO
            // ==========================================

            const tieneProducto =
                detalleVenta.Id_producto !== null;


            if (
                !tieneProducto
            ) {
                throw new Error(
                    `El detalle ${detalle.Id_detalle_venta} no cuenta con un producto válido a devolver.`
                );
            }

            // ==========================================
            // CALCULAR CANTIDAD YA DEVUELTA
            // ==========================================

            const [devueltoRows]: any = await connection.query(
                `
                SELECT
                    COALESCE(SUM(Cantidad), 0) AS cantidad_devuelta
                FROM detalle_devolucion
                WHERE Id_detalle_venta = ?
                `,
                [detalle.Id_detalle_venta]
            );

            const cantidadDevuelta = Number(
                devueltoRows[0].cantidad_devuelta || 0
            );

            const cantidadOriginal = Number(
                detalleVenta.Cantidad
            );

            const cantidadDisponible =
                cantidadOriginal - cantidadDevuelta;

            // ==========================================
            // VALIDAR CANTIDAD DISPONIBLE
            // ==========================================

            if (Number(detalle.Cantidad) > cantidadDisponible) {
                throw new Error(
                    `No se pueden devolver ${detalle.Cantidad} unidades del detalle ${detalle.Id_detalle_venta}. ` +
                    `Cantidad disponible para devolución: ${cantidadDisponible}.`
                );
            }
        }

        // ==========================================
        // CREAR DEVOLUCIÓN
        // ==========================================

        const [devolucionResult]: any = await connection.query(
            `
            INSERT INTO devoluciones (
                Id_venta,
                Id_usuario,
                Motivo,
                Observacion,
                Estado
            )
            VALUES (?, ?, ?, ?, 'Completada')
            `,
            [
                data.Id_venta,
                data.Id_usuario,
                data.Motivo.trim(),
                data.Observacion?.trim() || null
            ]
        );

        const idDevolucion = devolucionResult.insertId;

        // ==========================================
        // CREAR DETALLES DE DEVOLUCIÓN
        // ==========================================

        for (const detalle of data.detalles) {

            const [detalleVentaRows]: any = await connection.query(
                `
                SELECT
                    Id_producto,
                    Id_servicio,
                    Precio_Venta,
                    Descuento,
                    Tipo_descuento
                FROM detalle_venta
                WHERE id = ?
                  AND Id_venta = ?
                `,
                [
                    detalle.Id_detalle_venta,
                    data.Id_venta
                ]
            );

            if (detalleVentaRows.length === 0) {
                throw new Error(
                    `El detalle de venta ${detalle.Id_detalle_venta} no existe.`
                );
            }

            const detalleVenta = detalleVentaRows[0];

            const cantidad = Number(detalle.Cantidad);
            const precioOriginal = Number(detalleVenta.Precio_Venta);
            const descuento = Number(detalleVenta.Descuento) || 0;
            const tipoDescuento = detalleVenta.Tipo_descuento;

            let precioVenta = precioOriginal;

            if (tipoDescuento === "porcentaje") {
                precioVenta =
                    precioOriginal - (precioOriginal * descuento / 100);
            } else if (tipoDescuento === "fijo") {
                precioVenta =
                    precioOriginal - descuento;
            }

            // Evitar precios negativos por algún dato incorrecto
            precioVenta = Math.max(precioVenta, 0);

            const subtotal = cantidad * precioVenta;

            await connection.query(
                `
                INSERT INTO detalle_devolucion (
                    Id_devolucion,
                    Id_detalle_venta,
                    Id_producto,
                    Cantidad,
                    Precio_Venta,
                    Subtotal
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    idDevolucion,
                    detalle.Id_detalle_venta,
                    detalleVenta.Id_producto,
                    cantidad,
                    precioVenta,
                    subtotal
                ]
            );
        }

        // ==========================================
        // VERIFICAR SI TODOS LOS PRODUCTOS DE LA VENTA
        // YA FUERON DEVUELTOS EN SU TOTALIDAD
        // ==========================================

        const [detalleVentaTotales]: any = await connection.query(
            `
            SELECT
                dv.id,
                dv.Cantidad,
                COALESCE(SUM(dd.Cantidad), 0) AS Cantidad_Devuelta
            FROM detalle_venta dv
            LEFT JOIN detalle_devolucion dd
                ON dd.Id_detalle_venta = dv.id
            WHERE dv.Id_venta = ?
              AND dv.Id_producto IS NOT NULL
            GROUP BY dv.id, dv.Cantidad
            `,
            [data.Id_venta]
        );

        const todosDevueltos =
            detalleVentaTotales.length > 0 &&
            detalleVentaTotales.every(
                (fila: any) =>
                    Number(fila.Cantidad_Devuelta) >= Number(fila.Cantidad)
            );

        if (todosDevueltos) {
            await connection.query(
                `
                UPDATE ventas
                SET Estado = 'Devuelta'
                WHERE id = ?
                `,
                [data.Id_venta]
            );
        }

        // ==========================================
        // CONFIRMAR TRANSACCIÓN
        // ==========================================

        await connection.commit();

        return {
            id: idDevolucion,
            mensaje: "Devolución creada correctamente."
        };

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        throw error;

    } finally {

        if (connection) {
            connection.release();
        }
    }
};