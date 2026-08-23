import { pool } from "../config/database.js";
import type { PoolConnection } from "mysql2/promise";

interface DetalleSalida {
    Id_producto: number;
    Cantidad: number;
}

interface CrearSalidaData {
    Id_usuario: number;
    Tipo_Salida: string;
    Observacion?: string | null;
    detalles: DetalleSalida[];
}

export const crearSalida = async (
    data: CrearSalidaData
) => {

    let connection: PoolConnection | null = null;

    try {

        connection = await pool.getConnection();

        await connection.beginTransaction();

        // ==========================================
        // VALIDACIONES GENERALES
        // ==========================================

        if (!data.Id_usuario) {
            throw new Error("El usuario es obligatorio.");
        }

        if (!data.Tipo_Salida?.trim()) {
            throw new Error("El tipo de salida es obligatorio.");
        }

        if (!data.detalles || data.detalles.length === 0) {
            throw new Error(
                "Debe existir al menos un producto en la salida."
            );
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
        // VALIDAR PRODUCTOS Y CANTIDADES
        // ==========================================

        for (const detalle of data.detalles) {

            if (!detalle.Id_producto) {
                throw new Error(
                    "Todos los detalles deben indicar un producto."
                );
            }

            if (!detalle.Cantidad || detalle.Cantidad <= 0) {
                throw new Error(
                    "La cantidad debe ser mayor que cero."
                );
            }

            const [productoRows]: any = await connection.query(
                `
                SELECT id, Nombre, Stock
                FROM productos
                WHERE id = ?
                `,
                [detalle.Id_producto]
            );

            if (productoRows.length === 0) {
                throw new Error(
                    `El producto con ID ${detalle.Id_producto} no existe.`
                );
            }

            // ==========================================
            // VALIDAR STOCK
            // ==========================================

            if (
                Number(productoRows[0].Stock) <
                Number(detalle.Cantidad)
            ) {
                throw new Error(
                    `Stock insuficiente para el producto "${productoRows[0].Nombre}". ` +
                    `Stock disponible: ${productoRows[0].Stock}.`
                );
            }
        }

        // ==========================================
        // CREAR CABECERA DE SALIDA
        // ==========================================

        const [salidaResult]: any = await connection.query(
            `
            INSERT INTO otras_salidas_inventario (
                Id_usuario,
                Tipo_Salida,
                Observacion,
                Estado
            )
            VALUES (?, ?, ?, 'Completada')
            `,
            [
                data.Id_usuario,
                data.Tipo_Salida.trim(),
                data.Observacion?.trim() || null
            ]
        );

        const idSalida = salidaResult.insertId;

        // ==========================================
        // CREAR DETALLES
        // ==========================================

        for (const detalle of data.detalles) {

            await connection.query(
                `
                INSERT INTO detalle_otras_salidas_inventario (
                    Id_salida,
                    Id_producto,
                    Cantidad
                )
                VALUES (?, ?, ?)
                `,
                [
                    idSalida,
                    detalle.Id_producto,
                    detalle.Cantidad
                ]
            );
        }

        // ==========================================
        // CONFIRMAR TRANSACCIÓN
        // ==========================================

        await connection.commit();

        return {
            id: idSalida,
            mensaje: "Salida de inventario creada correctamente."
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