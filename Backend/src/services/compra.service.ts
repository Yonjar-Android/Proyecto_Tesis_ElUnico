import { pool } from "../config/database.js";
import { DetalleCompraDTO } from "../models/compra.models.js";

interface DetalleCompraInput {
    Id_producto: number;
    Cantidad: number;
    Precio: number;
    Subtotal: number;
    Precio_venta: number;
}

function formatearFecha(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
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

        const [facturaExistente]: any = await connection.query(
    `
    SELECT id
    FROM compras
    WHERE Id_proveedor = ?
      AND NFactura = ?
    LIMIT 1
    `,
    [idProveedor, nFactura.trim()]
);

if (facturaExistente.length > 0) {
    throw new Error(
        "Ya existe una compra registrada con ese número de factura para este proveedor."
    );
}

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
                    Precio_compra,
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

            await connection.query(
        `
        UPDATE productos
        SET Precio_venta = ?
        WHERE id = ?
        `,
        [
            detalle.Precio_venta,
            detalle.Id_producto
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

export const obtenerDetalleCompra = async (idCompra: number): Promise<DetalleCompraDTO> => {
    const connection = await pool.getConnection();

    try {
        const [compraRows]: any = await connection.query(
            `
            SELECT
                c.id            AS idCompra,
                c.Fecha         AS Fecha,
                c.NFactura      AS NFactura,
                c.Total         AS Total,
                p.Nombre_Empresa AS ProveedorNombre
            FROM compras c
            INNER JOIN proveedores p ON p.id = c.Id_proveedor
            WHERE c.id = ?
            `,
            [idCompra]
        );

        if (compraRows.length === 0) {
            throw new Error("No se encontró la compra solicitada.");
        }

        const compra = compraRows[0];

        const [detalleRows]: any = await connection.query(
            `
            SELECT
                dc.Cantidad AS Cantidad,
                dc.Precio_compra   AS Precio,
                dc.Subtotal AS Subtotal,
                pr.Nombre   AS ProductoNombre
            FROM detalle_compra dc
            INNER JOIN productos pr ON pr.id = dc.Id_producto
            WHERE dc.Id_compra = ?
            `,
            [idCompra]
        );

        return {
            idCompra: compra.idCompra,
            fecha: formatearFecha(compra.Fecha),
            nFactura: compra.NFactura,
            total: Number(compra.Total),
            proveedorNombre: compra.ProveedorNombre,
            articulos: detalleRows.map((d: any) => ({
                nombre: d.ProductoNombre,
                cantidad: Number(d.Cantidad),
                precio: Number(d.Precio),
                subtotal: Number(d.Subtotal),
            })),
        };

    } finally {
        connection.release();
    }
};