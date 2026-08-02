import { pool } from "../config/database.js";

interface DetalleCompraInput {
    Id_producto: number;
    Cantidad: number;
    Precio: number;
    Subtotal: number;
}

export const crearCompra = async (
    idProveedor: number,
    nFactura: string,
    total: number,
    detalles: DetalleCompraInput[]
) => {

    if (idProveedor <= 0 || isNaN(idProveedor)) {
        throw new Error("Seleccione un proveedor.");
    }

    if (!nFactura.trim()) {
        throw new Error("El número de factura no puede estar vacío.");
    }

    if (detalles.length === 0) {
        throw new Error("Debe agregar al menos un producto.");
    }

    if (isNaN(total) || total < 0) {
        throw new Error("El total de la compra no es válido.");
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const [compra]: any = await connection.query(
            `
            INSERT INTO compras
            (
                Id_proveedor,
                Fecha,
                NFactura,
                Total
            )
            VALUES (?,?,?,?)
            `,
            [
                idProveedor,
                new Date(),
                nFactura,
                total
            ]
        );

        const idCompra = compra.insertId;

        for (const detalle of detalles) {

            await connection.query(
                `
                INSERT INTO detalle_compra
                (
                    Id_compra,
                    Id_producto,
                    Cantidad,
                    Precio,
                    Subtotal
                )
                VALUES (?,?,?,?,?)
                `,
                [
                    idCompra,
                    detalle.Id_producto,
                    detalle.Cantidad,
                    detalle.Precio,
                    detalle.Subtotal
                ]
            );

        }

        await connection.commit();

        return {
            mensaje: "Compra registrada correctamente.",
            idCompra
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};