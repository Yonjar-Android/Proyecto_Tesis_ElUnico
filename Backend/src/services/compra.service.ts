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

            // El trigger AFTER INSERT en detalle_compra ya suma el Stock aquí.
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
                c.Id_proveedor  AS idProveedor,
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

        // Se agrega dc.id y dc.Id_producto: la pantalla de edición los necesita
        // para poder hacer el diff de cantidades y mandar los cambios de vuelta.
        const [detalleRows]: any = await connection.query(
            `
            SELECT
                dc.id       AS idDetalle,
                dc.Id_producto AS idProducto,
                dc.Cantidad AS Cantidad,
                dc.Precio_compra   AS Precio,
                dc.Subtotal AS Subtotal,
                pr.Nombre   AS ProductoNombre,
                pr.Precio_venta AS PrecioVentaActual
            FROM detalle_compra dc
            INNER JOIN productos pr ON pr.id = dc.Id_producto
            WHERE dc.Id_compra = ?
            `,
            [idCompra]
        );

        return {
            idCompra: compra.idCompra,
            idProveedor: compra.idProveedor,
            fecha: formatearFecha(compra.Fecha),
            nFactura: compra.NFactura,
            total: Number(compra.Total),
            proveedorNombre: compra.ProveedorNombre,
            articulos: detalleRows.map((d: any) => ({
                idDetalle: d.idDetalle,
                idProducto: d.idProducto,
                nombre: d.ProductoNombre,
                cantidad: Number(d.Cantidad),
                precio: Number(d.Precio),
                subtotal: Number(d.Subtotal),
                precioVentaActual: Number(d.PrecioVentaActual),
            })),
        };

    } finally {
        connection.release();
    }
};

export const actualizarCompra = async (
    idCompra: number,
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

        const [compraRows]: any = await connection.query(
            `SELECT id FROM compras WHERE id = ? LIMIT 1 FOR UPDATE`,
            [idCompra]
        );

        if (compraRows.length === 0) {
            throw new Error("La compra que intenta editar no existe.");
        }

        const [facturaExistente]: any = await connection.query(
            `
            SELECT id
            FROM compras
            WHERE Id_proveedor = ?
              AND NFactura = ?
              AND id <> ?
            LIMIT 1
            `,
            [idProveedor, nFactura.trim(), idCompra]
        );

        if (facturaExistente.length > 0) {
            throw new Error(
                "Ya existe otra compra registrada con ese número de factura para este proveedor."
            );
        }

        const [detalleActual]: any = await connection.query(
            `
            SELECT id, Id_producto, Cantidad
            FROM detalle_compra
            WHERE Id_compra = ?
            `,
            [idCompra]
        );

        const detalleViejoPorProducto = new Map<number, { id: number; cantidad: number }>();
        for (const fila of detalleActual) {
            detalleViejoPorProducto.set(fila.Id_producto, {
                id: fila.id,
                cantidad: Number(fila.Cantidad),
            });
        }

        const idsProductosNuevos = new Set(detalles.map((d) => d.Id_producto));

        // Ayuda a bloquear la fila de producto antes de tocar su Stock,
        // para evitar condiciones de carrera con ventas concurrentes.
        const bloquearYObtenerStock = async (idProducto: number): Promise<number> => {
            const [rows]: any = await connection.query(
                `SELECT Stock FROM productos WHERE id = ? LIMIT 1 FOR UPDATE`,
                [idProducto]
            );
            if (rows.length === 0) {
                throw new Error(`El producto con id ${idProducto} ya no existe.`);
            }
            return Number(rows[0].Stock);
        };

        // 1) Productos que existían y ahora fueron quitados de la compra.
        for (const [idProducto, viejo] of detalleViejoPorProducto) {
            if (idsProductosNuevos.has(idProducto)) continue;

            const stockActual = await bloquearYObtenerStock(idProducto);
            const stockResultante = stockActual - viejo.cantidad;

            if (stockResultante < 0) {
                throw new Error(
                    `No se puede quitar este producto de la compra: dejaría el Stock en negativo (probablemente ya se vendieron unidades).`
                );
            }

            await connection.query(`DELETE FROM detalle_compra WHERE id = ?`, [viejo.id]);
            await connection.query(
                `UPDATE productos SET Stock = ? WHERE id = ?`,
                [stockResultante, idProducto]
            );
        }

        // 2) Productos nuevos o modificados.
        for (const detalle of detalles) {
            const viejo = detalleViejoPorProducto.get(detalle.Id_producto);

            if (!viejo) {
                // Producto nuevo en la compra: INSERT, el trigger suma el stock solo.
                await connection.query(
                    `
                    INSERT INTO detalle_compra
                    (Id_compra, Id_producto, Cantidad, Precio_compra, Subtotal)
                    VALUES (?,?,?,?,?)
                    `,
                    [idCompra, detalle.Id_producto, detalle.Cantidad, detalle.Precio, detalle.Subtotal]
                );
            } else {
                const deltaCantidad = detalle.Cantidad - viejo.cantidad;

                if (deltaCantidad !== 0) {
                    const stockActual = await bloquearYObtenerStock(detalle.Id_producto);
                    const stockResultante = stockActual + deltaCantidad;

                    if (stockResultante < 0) {
                        throw new Error(
                            `La cantidad editada dejaría el Stock en negativo para uno de los productos.`
                        );
                    }

                    await connection.query(
                        `UPDATE productos SET Stock = ? WHERE id = ?`,
                        [stockResultante, detalle.Id_producto]
                    );
                }

                await connection.query(
                    `
                    UPDATE detalle_compra
                    SET Cantidad = ?, Precio_compra = ?, Subtotal = ?
                    WHERE id = ?
                    `,
                    [detalle.Cantidad, detalle.Precio, detalle.Subtotal, viejo.id]
                );
            }

            await connection.query(
                `UPDATE productos SET Precio_venta = ? WHERE id = ?`,
                [detalle.Precio_venta, detalle.Id_producto]
            );
        }

        // 3) Cabecera de la compra.
        await connection.query(
            `
            UPDATE compras
            SET Id_proveedor = ?, NFactura = ?, Total = ?
            WHERE id = ?
            `,
            [idProveedor, nFactura, total, idCompra]
        );

        await connection.commit();

        return { mensaje: "Compra actualizada correctamente.", idCompra };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const listarCompras = async (page: number, limit: number) => {
    const connection = await pool.getConnection();

    try {
        const paginaSegura = Math.max(1, page);
        const limiteSeguro = Math.min(Math.max(1, limit), 100);
        const offset = (paginaSegura - 1) * limiteSeguro;

        const [rows]: any = await connection.query(
            `
            SELECT
                c.id        AS idCompra,
                c.Fecha     AS Fecha,
                c.NFactura  AS NFactura,
                c.Total     AS Total,
                p.Nombre_Empresa AS ProveedorNombre
            FROM compras c
            INNER JOIN proveedores p ON p.id = c.Id_proveedor
            ORDER BY c.Fecha DESC, c.id DESC
            LIMIT ? OFFSET ?
            `,
            [limiteSeguro, offset]
        );

        const [countRows]: any = await connection.query(
            `SELECT COUNT(*) AS total FROM compras`
        );

        return {
            datos: rows.map((r: any) => ({
                idCompra: r.idCompra,
                fecha: formatearFecha(r.Fecha),
                nFactura: r.NFactura,
                total: Number(r.Total),
                proveedorNombre: r.ProveedorNombre,
            })),
            paginacion: {
                page: paginaSegura,
                limit: limiteSeguro,
                total: Number(countRows[0].total),
                totalPaginas: Math.ceil(Number(countRows[0].total) / limiteSeguro),
            },
        };
    } finally {
        connection.release();
    }
};